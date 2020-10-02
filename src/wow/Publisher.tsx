import React from 'react';
import {WebRTCConfigurationPublisher, WebRTCPublisher as Publisher} from './client'

const config: WebRTCConfigurationPublisher =  {
    sdpURL: 'wss://str.darsapp.me/webrtc-session.json',
    applicationName: 'livx',
    streamName: 'mahdia',
    audioBitrate: '24',
    audioCodec: 'opus',
    videoBitrate: '200',
    videoCodec: '42e01f',
    videoFrameRate: '10',
    frameSize: 'default'
}

function Publish() {
  return (
      <Publisher id="publisher-test"
                 className="d-block"
                 style={{ width: '60vh', height: '60vh'}}
                 config={ config }
                 onVideoStateChanged={(state) => {
                   console.log('Publisher state has changed', state)
                 }}
      />

  );
}

export default Publish;
