export interface IPublisherStatus {
  isPublishing: boolean
  isPreviewEnabled: boolean
  publisherError: Error|undefined
}

export interface WebRTCConfigurationPublisher {
  sdpURL: string
  applicationName: string
  streamName: string
  audioBitrate: string
  audioCodec: string
  videoBitrate: string
  videoCodec: string
  videoFrameRate: string
  frameSize: string
}

export type IVideoStateChanged = (status: IPublisherStatus) => void

export type WebRTCVideoStateChanged = (status: IPublisherStatus) => void

export interface IPublisher {

  publish(streamName: string): Promise<void>

  disconnect(): void
}
