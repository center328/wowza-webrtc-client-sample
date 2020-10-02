/*
 * This code and all components (c) Copyright 2019-2020, Wowza Media Systems, LLC. All rights reserved.
 * This code is licensed pursuant to the BSD 3-Clause License.
 */

import AvMenu from '../lib/AvMenu.js';
import WowzaWebRTCPublish from '../lib/WowzaWebRTCPublish.js';
window.WowzaWebRTCPublish = WowzaWebRTCPublish;
let browserDetails = window.adapter?.browserDetails;

export class PublisherHandler {
	
	constructor(trace, settings, videoElement, onStateChanged, errorHandler) {
		this.trace = trace;
		this.videoElement = videoElement;
		this.errorHandler = errorHandler;
		this.onStateChanged = onStateChanged;
		this.state = {
			settings: settings,
			publishing: false,
			selectedCam: '',
			selectedMic: ''
		};
		
		this.init();
	}
	
	init = () => {
		
		this.audioOn();
		this.videoOn();
		this.updateFrameSize('default');
		WowzaWebRTCPublish.on({
			onStateChanged: (newState) => {
				// LIVE / ERROR Indicator
				this.onStateChanged(newState.connectionState);//connected|failed|stopped
			},
			onError: this.errorHandlers,
		})
		WowzaWebRTCPublish.set({
				trace: this.trace,
				videoElementPublish: this.videoElement
			})
			.then((result) => {
				AvMenu.init(result.cameras, result.microphones, this.onAvMenuCameraChanged, this.onAvMenuMicrophoneChanged);
			});
	};
	
	getState = () => {
		return this.state;
	}
	
	setSettings = (settings) => {
		this.state.settings = settings;
		WowzaWebRTCPublish.set(settings);
	}
	
	updateFrameSize = (frameSize) => {
		let constraints = JSON.parse(JSON.stringify(WowzaWebRTCPublish.getState().constraints));
		if (frameSize === 'default') {
			constraints.video["width"] = {min: "640", ideal: "1280", max: "1920"};
			constraints.video["height"] = {min: "360", ideal: "720", max: "1080"};
		} else {
			constraints.video["width"] = {exact: frameSize[0]};
			constraints.video["height"] = {exact: frameSize[1]};
		}
		WowzaWebRTCPublish.set({constraints: constraints});
	}

// throw errors with these messages
	okToStart = () => {
		if (this.state.settings.sdpURL === "") {
			throw "No stream configured.";
		} else if (this.state.settings.applicationName === "") {
			throw "Missing application name.";
		} else if (this.state.settings.streamName === "") {
			throw "Missing stream name."
		}
		return true;
	}
	
// start/stop publisher
	togglePublish = () => {
		if (this.state.publishing) {
			this.stopPublish();
		} else {
			try {
				WowzaWebRTCPublish.set(this.state.settings).then(() => {
					if (this.okToStart()) {
						WowzaWebRTCPublish.start();
						this.state.publishing = true
					}
				});
			} catch (e) {
				this.errorHandlers(e);
			}
		}
	};
	
	stopPublish = () => {
		WowzaWebRTCPublish.stop();
		this.state.publishing = false
	};
	
	videoOn = () => {
		WowzaWebRTCPublish.setVideoEnabled(true);
	}
	videoOff = () => {
		WowzaWebRTCPublish.setVideoEnabled(false);
	}
	audioOn = () => {
		WowzaWebRTCPublish.setAudioEnabled(true);
	}
	audioOff = () => {
		WowzaWebRTCPublish.setAudioEnabled(false);
	}

// Helpers
	
	errorHandlers = (error) => {
		let message;
		if (error.name == "OverconstrainedError") {
			// message = "Your browser or camera does not support this frame size: " + $("#frameSize option:selected").val();
			message = "Your browser or camera does not support this frame size.";
			// $("#frameSize").val("default");
			this.updateFrameSize("default");
		} else if (error.message) {
			message = error.message;
		} else {
			message = error
		}
		this.errorHandler(message);
		this.stopPublish();
	};
	
	/*
	  UI updaters
	*/
	
	onAvMenuCameraChanged = (cameraId) => {
		if (this.state.selectedCam !== cameraId) {
			this.state.selectedCam = cameraId;
			WowzaWebRTCPublish.setCamera(cameraId);
		}
	}
	
	onAvMenuMicrophoneChanged = (microphoneId) => {
		if (this.state.selectedMic !== microphoneId) {
			this.state.selectedMic = microphoneId;
			WowzaWebRTCPublish.setMicrophone(microphoneId);
		}
	}

	getState = () => {
		return this.state
	}
	
// sound meter
	onSoundMeter = (level) => {
		// map level onto the rising quadrant shape of a circle to exaggerate the sound meter gradient
		let shiftLevel = level - 1;
		let levelCirc = Math.round(100 * Math.sqrt(1 - (shiftLevel * shiftLevel)));
		// $("#mute-toggle").css("background-image", "linear-gradient(white " + (100 - levelCirc) + "%, lime)");
	};
	
	detachUserMedia = () => {
		this.videoElement = null
		WowzaWebRTCPublish.set({
			videoElementPublish: null
		})
	}
	
	attachUserMedia = (videoElement) => {
		this.videoElement = videoElement
		WowzaWebRTCPublish.set({
			videoElementPublish: this.videoElement
		})
	}
	
}
