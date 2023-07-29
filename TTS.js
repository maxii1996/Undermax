/*:
 * @target MZ
 * @plugindesc Text-to-Speech Plugin for RPG Maker MZ. Visit https://undermax.itch.io/ for more information.
 * @author Maxii1996 | Undermax Games
 * @url https://undermax.itch.io/
 *
 * @command speak
 * @text Speak
 * @desc Converts the provided text to speech.
 *
 * @arg text
 * @type multiline_string
 * @text Text
 * @desc Text to Say. Use: \v[id] to insert a variable or \playername[id] to insert character id name in party.
 *
 * @arg volume
 * @type number
 * @min 0
 * @max 100
 * @text Volume
 * @desc The volume of the speech.
 * @default 100
 *
 * @arg pitch
 * @type number
 * @min 50
 * @max 150
 * @text Pitch
 * @desc The pitch of the speech.
 * @default 100
 *
 * @arg voice
 * @type combo
 * @option Voice 1
 * @option Voice 2
 * @option Voice 3
 * @text Voice
 * @desc The voice to be used.
 * @default Voice 1
 *
 * @arg rate
 * @type combo
 * @option Slow
 * @option Medium
 * @option Fast
 * @option Very Fast
 * @option Ultra Fast
 * @default Medium
 * @text Rate
 * @desc The speed of the speech.
 * @default Medium
 *
 * @arg useVariableForVoice
 * @type boolean
 * @text Use Variable for Voice
 * @desc If true, the voice will be selected based on the value of the chosen variable.
 * @default false
 *
 * @arg voiceVariable
 * @type variable
 * @text Voice Variable
 * @desc The variable to use for selecting the voice.
 *
 * @arg enableConsoleLog
 * @type boolean
 * @text Enable Console Log
 * @desc If true, logs will be printed to the console.
 * @default true
 *
 * @help 
 * 
 * 
 * 
 *   ///////////////////////////////////////////////////
 * 
 *     _______ _______ _____ __  __ __________            _      
 *    |__   __|__   __/ ____|  \/  |___  /  _ \          (_)     
 *       | |     | | | (___ | \  / |  / /| |_) | __ _ ___ _  ___ 
 *       | |     | |  \___ \| |\/| | / / |  _ < / _` / __| |/ __|
 *       | |     | |  ____) | |  | |/ /__| |_) | (_| \__ \ | (__ 
 *       |_|     |_| |_____/|_|  |_/_____|____/ \__,_|___/_|\___|
 *                                                            
 *                                                            
 *                                                                          
 *  ///////////////// VER. 1.0 //////////////////////
 *
 *
 *
 *
 * This plugin converts text to speech. You can use the 'speak' plugin 
 * command to convert the provided text to speech.
 * 
 * The 'text' argument is the text that will be converted to speech. 
 * 
 * === FEATURES ===
 * 
 * You can use: 
 * 
 * \v[id] to insert the value of a variable. 
 * \playername[id] to insert the name of a party member.
 * 
 * ================
 * 
 * The 'volume' argument is the volume of the speech, ranging from 0 to 100.
 * 
 * The 'pitch' argument is the pitch of the speech, ranging from 50 to 150.
 * 
 * The 'voice' argument is the voice that will be used for the speech. 
 * 
 * IMPORTANT!! 
 * 
 * The available voices depend on the system and SO language.
 *  
 * The 'rate' argument is the speed of the speech. Available options 
 * are 'Slow', 'Medium', 'Fast', 'Very Fast', and 'Ultra Fast'.
 * 
 * If 'useVariableForVoice' is set to true, the voice will be selected based 
 * on the value of the variable chosen in 'voiceVariable'.
 * 
 * If 'enableConsoleLog' is set to true, logs will be printed to the console.
 */

(() => {
    const pluginName = 'TTSMZBasic';

    PluginManager.registerCommand(pluginName, 'speak', args => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();

        const getVoices = new Promise(function(resolve, reject) {
            let voices = window.speechSynthesis.getVoices();

            if (voices.length !== 0) {
                resolve(voices);
            } else {
                window.speechSynthesis.addEventListener("voiceschanged", function() {
                    voices = window.speechSynthesis.getVoices();

                    resolve(voices);
                });
            }
        });

        getVoices.then(voices => {
            console.log(`Available voices: ${voices.map(v => v.name).join(', ')}`);

            let voice;
            if (args.useVariableForVoice === 'true') {
                const variableValue = $gameVariables.value(Number(args.voiceVariable));
                voice = voices[variableValue] ? voices[variableValue] : voices[0];
            } else {
                voice = voices.find(v => v.name === args.voice);
            }
            utterance.voice = voice;

            // Replace game text tags with their corresponding values
            let text = args.text.replace(/\\v\[(\d+)\]/g, (_, id) => $gameVariables.value(Number(id)));
            text = text.replace(/\\playername\[(\d+)\]/g, (_, id) => $gameParty.members()[Number(id) - 1].name());

            utterance.text = text;
            utterance.volume = Number(args.volume) / 100;
            utterance.pitch = Number(args.pitch) / 100;
            utterance.rate = getRate(args.rate);

            if (args.enableConsoleLog === 'true') {
                console.log(`Speaking text: ${text}`);
                console.log(`Volume: ${utterance.volume}`);
                console.log(`Pitch: ${utterance.pitch}`);
                console.log(`Rate: ${utterance.rate}`);
                console.log(`Voice: ${utterance.voice.name}`);
            }

            synth.speak(utterance);
        });
    });

    function getRate(rate) {
        switch(rate) {
            case 'Slow':
                return 0.5;
            case 'Medium':
                return 1;
            case 'Fast':
                return 1.5;
            case 'Very Fast':
                return 2;
            case 'Ultra Fast':
                return 2.5;
            default:
                return 1;
        }
    }
})();
