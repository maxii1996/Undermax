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
 * @arg vibrationMethod
 *  @text Vibration Method
 *  @desc Choose the vibration method.
 *  @type select
 *  @default Dual Rumble
 *  @option Dual Rumble
 *  @option Weak Rumble
 *  @option Strong Rumble
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
 * 
 * 
 * @param vibrationStateSwitchId
 * @text Vibration State Switch ID
 * @desc The ID of the switch that will store the vibration state (ON/OFF).
 * @type switch
 * @default 0
 * @param defaultVibrationState
 * @text Default Vibration State
 * @desc Set the default state for vibration when the game starts.
 * @type select
 * @default ON
 * @option ON
 * @option OFF
 * 
 * 
 */

/*~struct~Button:
 *
 * @param buttonMode
 * @text Button Mode
 * @desc Choose between "Press and Hold" or just "Press".
 * @type select
 * @default Press
 * @option Press and Hold
 * @option Press
 *
 * @param holdDuration
 * @text Hold Duration (ms)
 * @desc Time i n milliseconds to hold the button for the event to trigger (only for "Press and Hold" mode).
 * @type number
 * @min 0
 * @default 1000
 * @param verificationMethod
 * @text Verification Method
 * @desc Choose how the button press is verified.
 * @type select
 * @default Constant
 * @option Constant
 * @option Stop Until Release
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
 * @param vibrationMethod
 * @text Vibration Method
 * @desc Choose the vibration method.
 * @type select
 * @default Dual Rumble
 * @option Dual Rumble
 * @option Weak Rumble
 * @option Strong Rumble
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
    const buttonMode = parameters.buttonMode;
    const holdDuration = Number(parameters.holdDuration);
    const VIBRATION_STATE_SWITCH = Number(parameters.vibrationStateSwitchId);
    const DEFAULT_VIBRATION_STATE = parameters.defaultVibrationState === "ON" ? true : false;
    
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this); // Llamamos al método original para mantener su funcionalidad
        $gameSwitches.setValue(VIBRATION_STATE_SWITCH, DEFAULT_VIBRATION_STATE); // Establecemos el interruptor con el estado predeterminado
    
        // Desactiva la vibración manualmente si DEFAULT_VIBRATION_STATE es false
        if (!DEFAULT_VIBRATION_STATE) {
            let gamepad = navigator.getGamepads()[0];
            if (gamepad && gamepad.vibrationActuator) {
                gamepad.vibrationActuator.reset(); // Desactiva la vibración
            }
        }
    };
  

    
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
            const buttonData = gamepadMapper[i];
            if (button && buttonData) {
                const buttonMode = buttonData.buttonMode;
                const holdDuration = Number(buttonData.holdDuration);
                const verificationMethod = buttonData.verificationMethod;
    
                if (buttonMode === "Press and Hold") {
                    if (button.pressed) {
                        if (!buttonPressStates[i]) {
                            buttonPressStates[i] = Date.now();
                        } else if (Date.now() - buttonPressStates[i] >= holdDuration) {
                            if (verificationMethod === "Stop Until Release" && buttonPressStates[i] !== "executed") {
                                executeButtonLogic(i, gamepad);
                                buttonPressStates[i] = "executed";
                            } else if (verificationMethod === "Constant") {
                                executeButtonLogic(i, gamepad);
                            }
                        }
                    } else {
                        buttonPressStates[i] = false;
                    }
                } else {
                    if (button.pressed && !buttonPressStates[i]) {
                        executeButtonLogic(i, gamepad);
                        buttonPressStates[i] = true;
                    } else if (!button.pressed) {
                        buttonPressStates[i] = false;
                    }
                }
            }
        }
    
        for (let i = 0; i < gamepad.axes.length; i++) {
            if (Math.abs(gamepad.axes[i]) > 0.1) {
                if (gamepad.id.toLowerCase().includes('xbox')) {
                    Input._changeInputDevice('xbox');
                } else {
                    Input._changeInputDevice('playstation');
                }
            }
        }
    };
    

    function executeButtonLogic(buttonIndex, gamepad) {
        const buttonData = gamepadMapper[buttonIndex];
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
        
                    let vibrationEffect = "dual-rumble";
                    let vibrationOptions = {
                        startDelay: 0,
                        duration: buttonData.duration,
                        weakMagnitude: magnitude,
                        strongMagnitude: magnitude
                    };
        
                    switch (buttonData.vibrationMethod) {
                        case 'Weak Rumble':
                            vibrationOptions.weakMagnitude = 0.25;
                            vibrationOptions.strongMagnitude = 0.25;
                            break;
                        case 'Strong Rumble':
                            vibrationOptions.weakMagnitude = 1.0;
                            vibrationOptions.strongMagnitude = 1.0;
                            break;
                    }
        
                    gamepad.vibrationActuator.playEffect(vibrationEffect, vibrationOptions);
                }




            }

            if (gamepad.id.toLowerCase().includes('xbox')) {
                Input._changeInputDevice('xbox'); 
            } else {
                Input._changeInputDevice('playstation'); 
            }

            buttonPressStates[buttonIndex] = true;
        }
    }

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
        $gameSwitches.setValue(VIBRATION_STATE_SWITCH, vibrationEnabled); // Actualizar el interruptor con el estado de la vibración
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
    
        let vibrationEffect = "dual-rumble";
        let vibrationOptions = {
            startDelay: 0,
            duration: Number(args.duration),
            weakMagnitude: magnitude,
            strongMagnitude: magnitude
        };
    
        switch (args.vibrationMethod) {
            case 'Weak Rumble':
                vibrationOptions.weakMagnitude = 0.25;
                vibrationOptions.strongMagnitude = 0.25;
                break;
            case 'Strong Rumble':
                vibrationOptions.weakMagnitude = 1.0;
                vibrationOptions.strongMagnitude = 1.0;
                break;
        }
    
        if(gamepad && gamepad.vibrationActuator && vibrationEnabled) {
            gamepad.vibrationActuator.playEffect(vibrationEffect, vibrationOptions);
        }
    });
    
    

})();
