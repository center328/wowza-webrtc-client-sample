import React from 'react';
import { WebRTCConfiguration } from 'wowza-webrtc-client'
import { WebRTCPublisher as Publisher } from './client'

const config: WebRTCConfiguration =  {
  WEBRTC_SDP_URL: 'wss://str.darsapp.me/webrtc-session.json',
  WEBRTC_APPLICATION_NAME: 'livx',
  WEBRTC_FRAME_RATE: 30,
  WEBRTC_AUDIO_BIT_RATE: 64,
  WEBRTC_VIDEO_BIT_RATE: 3500,
}

function Publish() {
  return (
      <Publisher id="publisher-test"
                 className="d-block"
                 streamName="WebRTC"
                 style={{ width: '100%', height: '100%'}}
                 config={ config }
                 onVideoStateChanged={(state) => {
                   console.log('Publisher state has changed', state)
                 }}
      />

  );
}

export default Publish;
