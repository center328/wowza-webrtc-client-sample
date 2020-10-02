import * as React from 'react'
import {IPublisher, WebRTCVideoStateChanged, WebRTCConfigurationPublisher} from './IPublisher'
import {PublisherHandler} from '../../lib/Publisher';

interface Props {
  id: string,                       // Html DOM's id
  style?: React.CSSProperties,      // Html CSS Properties
  trace?: boolean                   // Enable Logs in Console?
  className?: string
  autoPreview: boolean              // start preview when tryToConnect(), stop preview on disconnect()
  config: WebRTCConfigurationPublisher
  onVideoStateChanged?: WebRTCVideoStateChanged
}

interface State {
  isPreviewing: boolean
  publisherError: Error|undefined
}

export class WebRTCPublisher extends React.Component<Props, State> implements IPublisher {

  public static defaultProps: Partial<Props> = {
    trace: true,
    autoPreview: true,
  }

  private _localVideoRef = React.createRef<HTMLVideoElement>()

  private handler!: PublisherHandler

  public reConfig(config: WebRTCConfigurationPublisher) {
    this.handler.setSettings(config)
  }

  public get isPreviewEnabled(): boolean {
    return this.state.isPreviewing
  }

  public stopPreview() {
    this.handler.detachUserMedia()
    this.setState({isPreviewing: false})
  }

  public async startPreview() {
    if (this.videoElement) {
      await this.handler.attachUserMedia(this.videoElement)
      this.setState({isPreviewing: true})
    }
  }

  private _notify() {

    this.props.onVideoStateChanged && this.props.onVideoStateChanged({
      isPublishing: this.handler.getState().publishing,
      isPreviewEnabled: this.isPreviewEnabled,
      publisherError: this.state.publisherError
    })
  }

  public async publish(): Promise<void> {

    if (!this.isPreviewEnabled && this.videoElement) {
      await this.startPreview()
    }
    await this.handler.togglePublish()
  }

  public disconnect() {
    this.handler.stopPublish()

    if (this.isPreviewEnabled && this.props.autoPreview) {
      this.stopPreview()
    }
  }

  private get videoElement(): HTMLVideoElement|undefined {
    return this._localVideoRef.current || undefined
  }

  constructor(props: Props) {
    // Properties
    // - Assign default values to props.
    super(props)

    // States declaration
    // - No states is required at this point.
    this.state = {
      isPreviewing: true,
      publisherError: undefined,
    }

  }

  async componentWillUnmount() {
    this.disconnect()
  }

  async componentDidMount() {
    // Create WebProducer object.
    this.handler = new PublisherHandler(
        this.props.trace,
        this.props.config,
        this.videoElement,
        (state: string) => {
          if (state === 'connected') {

          } else if (state == 'failed') {

          } else if (state == 'stopped') {

          }
        }, (error: Error) => {
          this.setState({publisherError: error})
          this._notify()
        }
    )

    // localVideo is now ready (as it is mounted)
    this.retry()
  }

  /**
   * connect method invoke from within Publisher component built-in UI.
   */
  private retry() {
    if (this.props.autoPreview && this.videoElement)
      this.publish().catch(error => {
        console.error('Failed to re-connect stream', error)
      })
  }

  render() {
    return <div
        className={`webrtc-publisher ${this.props.className} ${this.state.isPreviewing ? 'previewing': '' }`}
        style={{backgroundColor: this.state.publisherError ? 'red' : 'none'}}
    >
      <video
        id={this.props.id}
        ref={this._localVideoRef}
        playsInline={true}
        muted={true}
        controls={false}
        autoPlay={true}
        style={{height: '100%', width: '100%', ...this.props.style}} />
      {
        this.state.publisherError &&
        <div className="unmute-blocker d-flex justify-content-center align-items-center"
             onClick={this.retry.bind(this)}>
            <p className="text-danger text-center">
              {`${this.state.publisherError.message}`}<br/><br/>
              <button className="btn btn-danger"><i className="fas redo-alt"></i> TAP TO RECONNECT</button>
            </p>
        </div>
      }
    </div>
  }

}
