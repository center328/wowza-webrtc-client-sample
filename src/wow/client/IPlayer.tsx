export interface IPlayerStatus {
  isPlaying: boolean
  isConnected: boolean
  error?: Error
}

type PlayerStateChanged = (status: IPlayerStatus) => void

export interface IPlayerProps {
  trace?: boolean
  mute: boolean
  autoPlay: boolean
  onPlayerStateChanged?: PlayerStateChanged
}

export interface WebRTCConfigurationPlayer {
  sdpURL: string
  applicationName: string
  streamName: string
}

export interface IPlayer {

  /**
   * Allow user to start playing the media.
   */
  play(): void

  /**
   * Allow user to stop playing.
   */
  stop(): void

}
