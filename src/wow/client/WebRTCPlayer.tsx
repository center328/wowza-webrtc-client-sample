import * as React from 'react'
import {IPlayerProps, IPlayer, WebRTCConfigurationPlayer, IPlayerStatus} from './IPlayer';
import {Player} from '../../lib/player';

interface Props extends IPlayerProps {
  id: string
  style?: React.CSSProperties,      // Html CSS Properties
  rotate: 'none'|'ccw'|'cw'|'flip'
  sizing: 'cover'|'contain'
  config: WebRTCConfigurationPlayer
  className: string
}

interface State extends IPlayerStatus {
  videoStyle: React.CSSProperties
}

export class WebRTCPlayer extends React.Component<Props, State> implements IPlayer {

  public static defaultProps: Partial<Props> = {
    mute: false,
    autoPlay: true,
    rotate: 'none',
    sizing: 'contain',
    className: '',
  }

  private get videoElement(): HTMLVideoElement|undefined {
    return this._refVideo.current || undefined
  }

  private get frameElement(): HTMLDivElement|undefined {
    return this._refFrame.current || undefined
  }

  private playerInterface?: Player

  private resizeHandler!: () => void

  private _refFrame = React.createRef<HTMLDivElement>()

  private _refVideo = React.createRef<HTMLVideoElement>()

  constructor(props: Props) {
    super(props)
    this.state = {
      isPlaying: false,
      isConnected: false,
      error: undefined,
      videoStyle: {
        width: '100%',
        height: '100%'
      }
    }
  }

  componentDidMount() {
    this._initPlayer()

    // register a resize handler.
    this.resizeHandler = () => {
      const videoElement = this.videoElement
      const frameElement = this.frameElement
      if (!videoElement || !frameElement) { return }
      //
      const videoSize = {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      }
      let frameSize = {
        width: frameElement.clientWidth,
        height: frameElement.clientHeight
      }
      console.log(videoSize)
      console.log(frameSize)
      if (!(videoSize.width > 0 && videoSize.height >0) || !frameSize) {
        console.log('Failed on calculation size info is not valid')
        return
      }
      if (videoSize && frameSize) {
        // perform calculation
        const videoAspectRatio = videoSize.width / videoSize.height
        let outState: React.CSSProperties = {
          position: 'absolute',
        }
        // (1) Placement
        if (/(cw)/.test(this.props.rotate)) {
          frameSize = {
            height: frameSize.width,
            width: frameSize.height
          }
        }
        const frameAspectRatio = frameSize.width / frameSize.height
        let actualVideoSize: { width: number, height: number } = { width: 0, height: 0 }
        console.log(`Input (s=${this.props.sizing}, v, f) = ratios[`, videoAspectRatio, frameAspectRatio, '] frame[', videoSize, frameSize, ']')

        // width dominate is based on given associated sizing option.
        if (this.props.sizing === 'contain' && videoAspectRatio > frameAspectRatio
          || this.props.sizing === 'cover' && videoAspectRatio < frameAspectRatio) {
          // width dominate
          console.log(`Width dominate ...`, videoAspectRatio, frameAspectRatio)
          actualVideoSize = {
            width: frameSize.width,
            height: frameSize.width / videoAspectRatio
          }
          outState = {
            ...outState,
            width: `${actualVideoSize.width}px`,
            left: '0',
            top: `${frameSize.height/2 - actualVideoSize.height/2}px`,
          }
        } else {
          // height dominate
          console.log(`Height dominate ...`, videoAspectRatio, frameAspectRatio)
          actualVideoSize = {
            width: frameSize.height * videoAspectRatio,
            height: frameSize.height
          }
          outState = {
            ...outState,
            height: `${actualVideoSize.height}px`,
            top: '0',
            left: `${frameSize.width/2 - actualVideoSize.width/2}px`,
          }
        }
        // (2) Offset Tweak
        if (/(cw)/.test(this.props.rotate)) {
          // left/top offset need to be adjusted accordingly.
          // Flip back
          frameSize = {
            height: frameSize.width,
            width: frameSize.height
          }
          outState.top = (frameSize.height - actualVideoSize.height) / 2
          outState.left = (frameSize.width - actualVideoSize.width) / 2
        }
        if (this.props.rotate === 'ccw') {
          outState.transform = 'rotate(-90deg)'
        } else if (this.props.rotate === 'cw') {
          outState.transform = 'rotate(90deg)'
        } else if (this.props.rotate === 'flip') {
          outState.transform = 'rotate(180deg)'
        }
        this.setState({
          videoStyle: outState
        })
      }
    }

    this.resizeHandler()

    window.addEventListener('resize', this.resizeHandler)
  }

  async componentWillUnmount() {
    // unregister a resize handler.

    await this.stop()
    window.removeEventListener('resize', this.resizeHandler)

  }

  private _notify = () => {
    this.resizeHandler && this.resizeHandler()
    this.props.onPlayerStateChanged && this.props.onPlayerStateChanged(this.state)
  }

  private _initPlayer() {
    if (!this.videoElement) {
      return
    }

    // Create a new instance
    this.playerInterface = new Player(
        this.props.trace,
        this.props.config,
        this.videoElement,
        (connected: boolean) => {
          this.setState({ isConnected: connected })
          this._notify()
        }, (isPlaying: boolean) => {
          this.setState({ isPlaying })
          this._notify()
        }, (error: Error) => {
          this.setState({ error })
          this._notify()
        })

    if (this.props.autoPlay) {
      setTimeout(this.play.bind(this), 8000)
    }
  }

  public getStatus(): IPlayerStatus {
    return this.state
  }

  public async play() {
    this.setState({error: undefined})
    this.playerInterface && await this.playerInterface.togglePlay()
  }

  public async stop() {
    this.setState({error: undefined})
    this.playerInterface && await this.playerInterface.stop()
  }

  render() {
    return <div
        style={{backgroundColor: this.state.isPlaying ? '' : 'red' }}
    >
        <div id={ this.props.id }
          ref={this._refFrame}
          style={{ ...this.props.style }}
          className={`webrtc-player ${this.props.sizing} ${this.props.className}`}
        >
           {/*onClick={this.play.bind(this)}>*/}
          <video
              ref={this._refVideo}
              playsInline autoPlay
              // controls
              muted={this.props.mute}
              className={this.props.rotate}
              style={this.state.videoStyle}
          />
        </div>

      {
        this.state.error && this.state.error.message !== '' &&
        <div className="unmute-blocker d-flex justify-content-center align-items-center"
             onClick={this.play.bind(this)}>
            <p className="text-danger text-center">
              {`${this.state.error.message}`}<br/><br/>
              <button className="btn btn-danger"><i className="fas redo-alt"></i> TAP TO RETRY</button>
            </p>
        </div>
      }
      {
        (!this.state.isPlaying && (this.state.error === null || this.state.error === undefined)) &&
        <div className="unmute-blocker d-flex justify-content-center align-items-center"
             onClick={this.play.bind(this)}>
            <p className="text-danger text-center">
              <button className="btn btn-danger"><i className="fas redo-alt"></i> TAP TO Connect</button>
            </p>
        </div>
      }
    </div>
  }
}
