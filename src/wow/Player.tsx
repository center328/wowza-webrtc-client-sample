import React from 'react';
import { WebRTCConfiguration } from 'wowza-webrtc-client'
import { WebRTCPlayer as Player } from './client'

const config: WebRTCConfiguration =  {
  WEBRTC_SDP_URL: 'wss://str.darsapp.me/webrtc-session.json',
  WEBRTC_APPLICATION_NAME: 'livx',
  WEBRTC_FRAME_RATE: 30,
  WEBRTC_AUDIO_BIT_RATE: 64,
  WEBRTC_VIDEO_BIT_RATE: 3500,
}

function Play() {
  return (
      <Player
          id="player-test"
          // ref="player"
          streamName="WebRTC"
          style={{ width: '100%', height: '100vh'}}
          rotate="cw"   // 'cw'|'none'|'ccw'
          config={ config }
          autoPlay={true}
          onPlayerStateChanged={(status) => {
              console.log('Player state has changed', status)
          }}/>

        );
}

export default Play;
