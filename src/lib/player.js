/*
 * This code and all components (c) Copyright 2019-2020, Wowza Media Systems, LLC. All rights reserved.
 * This code is licensed pursuant to the BSD 3-Clause License.
 */

import WowzaWebRTCPlay from './WowzaWebRTCPlay.js';
window.WowzaWebRTCPlay = WowzaWebRTCPlay;

export class Player {
  constructor(trace, settings, videoElement, onStateChanged, onPlayStateChanged, errorHandler) {
    this.trace = trace;
    this.videoElement = videoElement;
    this.errorHandler = errorHandler;
    this.onStateChanged = onStateChanged;
    this.onPlayStateChanged = onPlayStateChanged;
    this.state = {
      settings: settings,
      playing: false
    };
    
    this.init();
  }
  
  init = () => {
    WowzaWebRTCPlay.on({
      onError: this.errorHandler,
      onStateChanged: (state) => {
        this.onStateChanged(state.connectionState === 'connected');
      }
    });
    WowzaWebRTCPlay.set({
      trace: this.trace,
      videoElementPlay: this.videoElement
    });
    
  }
  
  async togglePlay() {
    if (this.state.playing) {
      await this.stop()
    } else {
      await WowzaWebRTCPlay.set(this.state.settings).then(() => {
        WowzaWebRTCPlay.play();
        this.state.playing = true
        this.onPlayStateChanged(true)
      });
    }
  }
  
  async stop() {
    await WowzaWebRTCPlay.stop();
    this.state.playing = false
    this.onPlayStateChanged(false)
  }
  
  getState = () => {
    return this.state;
  }
  
  setSettings = (settings) => {
    this.state.settings = settings;
  }
  
}
