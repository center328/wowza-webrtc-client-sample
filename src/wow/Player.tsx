import React from 'react';
import {WebRTCConfigurationPlayer, WebRTCPlayer as Player} from './client'

const config: WebRTCConfigurationPlayer =  {
    sdpURL: 'wss://str.darsapp.me/webrtc-session.json',
    applicationName: 'livx',
    streamName: 'mahdia'
}

function Play() {
  return (
      <Player
          id="player-test"
          style={{ width: '70vh', height: '90vh'}}
          rotate="none"   // 'cw'|'none'|'ccw'
          config={ config }
          mute={false}
          autoPlay={true}
          onPlayerStateChanged={(status) => {
              console.log('Player state has changed', status)
          }}/>

        );
}

export default Play;
