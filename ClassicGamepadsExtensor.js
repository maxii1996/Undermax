/*:
 * @plugindesc Extended gamepad button mapping to support all buttons and add vibrations.
 * @author Maxii1996 | Undermax Games (C) 2023
 * @url https://undermax.itch.io/
 * @target MZ
 * @help 
 *
 * Button Index Reference:
 *
 * 0  =>  Button A (Xbox) / X (PlayStation)
 * 1  =>  Button B (Xbox) / Circle (PlayStation)
 * 2  =>  Button X (Xbox) / Square (PlayStation)
 * 3  =>  Button Y (Xbox) / Triangle (PlayStation)
 * 4  =>  LB (Xbox) / L1 (PlayStation)
 * 5  =>  RB (Xbox) / R1 (PlayStation)
 * 6  =>  LT (Xbox) / L2 (PlayStation)
 * 7  =>  RT (Xbox) / R2 (PlayStation)
 * 8  =>  Back Button (Xbox) / Select (PlayStation)
 * 9  =>  Start Button (Xbox) / Start (PlayStation)
 * 10 =>  L3 (Xbox) / L3 (PlayStation)
 * 11 =>  R3 (Xbox) / R3 (PlayStation)
 * 12 =>  D-Pad Up
 * 13 =>  D-Pad Down
 * 14 =>  D-Pad Left
 * 15 =>  D-Pad Right
 *
 *
 * @param commonEvents
 * @text Common Events
 * @desc Assign common events to gamepad buttons.
 * @type struct<Button>[]
 * @param keyboardSwitchId
 * @text Keyboard Switch ID
 * @desc The ID of the switch that will be activated when using the keyboard.
 * @type switch
 * @default 1
 * @param xboxSwitchId
 * @text Xbox Switch ID
 * @desc The ID of the switch that will be activated when using an Xbox gamepad.
 * @type switch
 * @default 1
 * @param psSwitchId
 * @text PlayStation Switch ID
 * @desc The ID of the switch that will be activated when using a PlayStation gamepad.
 * @type switch
 * @default 1
 *
 * @command toggleKeyDetection
 * @text Global: Enable/Disable Key Detection
 * @desc Enables or disables key detection for common events (All Buttons).
 * @arg value
 * @type boolean
 * @default true
 * @text Enable
 * @desc Defines whether key detection is enabled or disabled.
 *
 * @command vibrateController
 * @text Vibrate Controller
 * @desc Vibrates the controller.
 *
 * @arg duration
 * @type number
 * @text Duration
 * @desc The duration of the vibration in milliseconds.
 * @default 1000
 *
 * @arg vibrationLevel
 * @type select
 * @text Vibration Level
 * @desc The vibration level.
 * @default Medium
 * @option Very Low
 * @value Very Low
 * @option Low
 * @value Low
 * @option Medium
 * @value Medium
 * @option High
 * @value High
 * @option Very High
 * @value Very High
 *
 * @command toggleKeyEventsEverywhere
 * @text Enable/Disable Key Events Everywhere
 * @desc Enables or disables keyboard events in all scenes.
 * @arg value
 * @type boolean
 * @default false
 * @text Enable
 * @desc Defines whether keyboard events are enabled or disabled in all scenes.
 *
 * @command toggleVibration
 * @text Enable/Disable Vibration
 * @desc Enables or disables vibration.
 * @arg value
 * @type boolean
 * @default true
 * @text Enable
 * @desc Defines whether vibration is enabled or disabled.
 */

/*~struct~Button:
 * @param buttonIndex
 * @text Button Index
 * @desc The index of the gamepad button. Check the help for the corresponding code for each button. Enter a number only.
 * @type number
 * @min 0
 * @param commonEventId
 * @text Common Event ID
 * @desc The ID of the common Event that will be triggered when the button is pressed.
 * @type common_event
 * @param vibrate
 * @text Vibrate
 * @desc Vibrate the controller when the button is pressed?
 * @type boolean
 * @default false
 * @param duration
 * @text Duration
 * @desc The duration of the vibration in milliseconds. (50-250 is recommended)
 * @type number
 * @min 0
 * @default 150
 * @param magnitude
 * @text Vibration Magnitude
 * @desc The magnitude of the vibration. (Intensity)
 * @type select
 * @default Very Low
 * @option Very Low
 * @option Low
 * @option Medium
 * @option High
 * @option Very High
 * @param runInMessages
 * @text Run In Messages?
 * @desc Allow this event to run during messages and choices (Recommended false).
 * @type boolean
 * @default false
 * @param SE
 * @text Sound Effect
 * @desc The sound effect that will play when the common event is triggered.
 * @type file
 * @dir audio/se
 * @param volume
 * @text Volume
 * @desc The volume of the sound effect.
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * @param pitch
 * @text Pitch
 * @desc The pitch of the sound effect.
 * @type number
 * @min 50
 * @max 150
 * @default 100
 */

(function() {
	
    let isEnabled = true;
    let keyEventsEverywhere = false;
    let vibrationEnabled = true; 
	
    const pluginName = 'ClassicGamepadsExtensor';
    const parameters = PluginManager.parameters(pluginName);
    const commonEvents = JSON.parse(parameters.commonEvents);
    const gamepadMapper = {};
    const buttonPressStates = Array(16).fill(false);
    const SWITCH_KEYBOARD = Number(parameters.keyboardSwitchId);
    const SWITCH_PS = Number(parameters.psSwitchId);
    const SWITCH_XBOX = Number(parameters.xboxSwitchId);

    let lastInputDevice = "keyboard";

    commonEvents.forEach(event => {
        const buttonData = JSON.parse(event);
        const buttonIndex = buttonData.buttonIndex;
        
        gamepadMapper[buttonIndex] = buttonData;
    });

    const _Input_updateGamepadState = Input._updateGamepadState;
    const _Input_onKeyDown = Input._onKeyDown;
    const _Input_onKeyUp = Input._onKeyUp;

    Input._updateGamepadState = function(gamepad) {
        _Input_updateGamepadState.call(this, gamepad);
        if (isEnabled && (SceneManager._scene instanceof Scene_Map || keyEventsEverywhere)) {
            this._updateAdditionalButtons(gamepad);
        }
    };


Input._updateAdditionalButtons = function(gamepad) {
    for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i];
        if (button) {
            if (button.pressed && !buttonPressStates[i]) {
                const buttonData = gamepadMapper[i];
                if (buttonData) {
                    
                    buttonData.runInMessages = (buttonData.runInMessages === 'true' || buttonData.runInMessages === true);
                    buttonData.runInChoices = (buttonData.runInChoices === 'true' || buttonData.runInChoices === true);
              
                    let isMessageBusy = $gameMessage.isBusy();
                    let isChoiceActive = $gameMessage.isChoice();
                    let shouldRunCommonEvent = false;

                    if (isMessageBusy) {
 
                        if (buttonData.runInMessages) {
        
                            shouldRunCommonEvent = true;
                        }
                    } else if (isChoiceActive) {
                    
                        if (buttonData.runInChoices) {
                         
                            shouldRunCommonEvent = true;
                        }
                    } else {
                     
                        shouldRunCommonEvent = true;
                    }

                    if (shouldRunCommonEvent) {                      
                        const commonEventId = buttonData.commonEventId;
                        $gameTemp.reserveCommonEvent(commonEventId);

                        let se = {
                            name: buttonData.SE,
                            volume: buttonData.volume,
                            pitch: buttonData.pitch,
                            pan: 0
                        };
                        AudioManager.playSe(se);

                        if (vibrationEnabled && buttonData.vibrate && gamepad.vibrationActuator) {
                            let magnitude;
                            switch (buttonData.magnitude) {
                                case 'Very Low':
                                    magnitude = 0.15;
                                    break;
                                case 'Low':
                                    magnitude = 0.25;
                                    break;
                                case 'Medium':
                                    magnitude = 0.5;
                                    break;
                                case 'High':
                                    magnitude = 0.75;
                                    break;
                                case 'Very High':
                                    magnitude = 1.0;
                                    break;
                            }

                            gamepad.vibrationActuator.playEffect("dual-rumble", {
                                startDelay: 0,
                                duration: buttonData.duration,
                                weakMagnitude: magnitude,
                                strongMagnitude: magnitude
                            });
                        }
                    }
                    
                    if (gamepad.id.toLowerCase().includes('xbox')) {
                        this._changeInputDevice('xbox');
                    } else {
                        this._changeInputDevice('playstation');
                    }

                    buttonPressStates[i] = true;
                }
            } 
            if (!button.pressed) {
                buttonPressStates[i] = false;
            }
        }
    }
	
    for (let i = 0; i < gamepad.axes.length; i++) {
        if (Math.abs(gamepad.axes[i]) > 0.1) {
            if (gamepad.id.toLowerCase().includes('xbox')) {
                this._changeInputDevice('xbox');
            } else {
                this._changeInputDevice('playstation');
            }
        }
    }
};


      Input._changeInputDevice = function(device) {
        if (device === 'keyboard') {
            $gameSwitches.setValue(SWITCH_KEYBOARD, true);
            $gameSwitches.setValue(SWITCH_PS, false);
            $gameSwitches.setValue(SWITCH_XBOX, false);
        } else if (device === 'xbox') {
            $gameSwitches.setValue(SWITCH_KEYBOARD, false);
            $gameSwitches.setValue(SWITCH_PS, false);
            $gameSwitches.setValue(SWITCH_XBOX, true);
        } else if (device === 'playstation') {
            $gameSwitches.setValue(SWITCH_KEYBOARD, false);
            $gameSwitches.setValue(SWITCH_PS, true);
            $gameSwitches.setValue(SWITCH_XBOX, false);
        }
        lastInputDevice = device;
    };

    Input._onKeyDown = function(event) {
        _Input_onKeyDown.call(this, event);
        if (isEnabled && (SceneManager._scene instanceof Scene_Map || keyEventsEverywhere)) {
            this._changeInputDevice('keyboard');
        }
    };

    Input._onKeyUp = function(event) {
        _Input_onKeyUp.call(this, event);
    };

    PluginManager.registerCommand(pluginName, 'toggleKeyDetection', args => {
        isEnabled = JSON.parse(args.value);
    });

    PluginManager.registerCommand(pluginName, 'toggleKeyEventsEverywhere', args => {
        keyEventsEverywhere = JSON.parse(args.value);
    });
	
	PluginManager.registerCommand(pluginName, 'toggleVibration', args => {
		vibrationEnabled = JSON.parse(args.value);
	});

    PluginManager.registerCommand(pluginName, 'vibrateController', args => {
        let gamepad = navigator.getGamepads()[0];
        let magnitude;
        switch(args.vibrationLevel) {
            case 'Very Low':
                magnitude = 0.15;
                break;
            case 'Low':
                magnitude = 0.25;
                break;
            case 'Medium':
                magnitude = 0.5;
                break;
            case 'High':
                magnitude = 0.75;
                break;
            case 'Very High':
                magnitude = 1.0;
                break;
        }
        if(gamepad && gamepad.vibrationActuator && vibrationEnabled) {
            gamepad.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: Number(args.duration),
                weakMagnitude: magnitude,
                strongMagnitude: magnitude
            });
        }
    });

})();
