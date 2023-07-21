/*:
 * @target MZ
 * @plugindesc v1.1.0 Sliders Scene with customizable options for Rpg Maker MZ!
 * @author Maxii1996 | Undermax Games
 * @url https://undermax.itch.io/
 * @help 
 *  
 * 
 *  ///////////////////////////////////////////////////
 * 
 *    ____  _ _     _                 __  __ _____
 *   / ___|| (_) __| | ___ _ __ ___  |  \/  |__  /
 *   \___ \| | |/ _` |/ _ \ '__/ __| | |\/| | / / 
 *    ___) | | | (_| |  __/ |  \__ \ | |  | |/ /_ 
 *   |____/|_|_|\__,_|\___|_|  |___/ |_|  |_/____|
 * 
 *                                                                          
 *  ///////////////// VER. 1.1 //////////////////////
 * 
 * This plugin is designed to create customizable sliders for RPG Maker MZ. 
 * These sliders can be used to control game variables, allowing for a wide 
 * range of interactive and dynamic gameplay elements.
 * 
 * The sliders can be customized in terms of their appearance, including 
 * their background color and the color of the slider itself. 
 * You can also specify the position of the slider on the screen.
 * 
 * Each slider is associated with a game variable, and the value of the 
 * slider controls the value of the variable. This means that you can use 
 * sliders to control a wide range of game mechanics.
 * 
 * In addition to sliders, this plugin also supports the creation of 
 * custom texts. These texts can be used to provide context or instructions 
 * for the sliders. You can specify the position of the text on the screen, as
 * well as the game variable that the text is associated with.
 * 
 * Here are the commands you can use with this plugin:
 * 
 * - Create New Sliders: This command creates new sliders with the given 
 * parameters. 
 * The parameters include the background color, background image, and 
 * the settings for the sliders and custom texts.
 * 
 * - Background Color 1: This argument sets the first color of the gradient 
 * for the background of the scene (if an image is not selected). 
 * You should use HEX colors for this argument.
 * 
 * - Background Color 2: This argument sets the second color of 
 * the gradient for the background of the scene (if an image is not selected). 
 * You should use HEX colors for this argument.
 * 
 * - Background Image: This argument sets the background image of the slider.
 * If no image is selected, the background will be generated with the background 
 * gradients
 * 
 * =======================================
 * 
 * IMPORTANT INFORMATION:
 *
 * The plugin supports HEX colors with transparency.
 *
 * This means that if you want to lower the opacity of a color add the opacity number 
 * (BETWEEN 00 and 99) to the end of the HEX number of the color you use.
 *
 * Example: Black with 50% opacity:
 *
 * #00000050 (#000000 is black and 50 corresponds to opacity)
 * 
 * 
 * ========================================
 * 
 * - Sliders: This argument sets the settings for the sliders.
 * 
 * - Custom Texts: This argument sets the settings for the custom texts.
 * 
 * In addition to sliders, this plugin also supports the creation of custom 
 * texts. These texts can be used to provide context or instructions for the 
 * sliders. You can specify the position of the text on the screen, as well as 
 * the game variable that the text is associated with.
 * 
 * The custom texts also support a special command: \partyX[stat].
 * 
 * This command allows you to display the statistics of a specific party member. 
 * X is the index of the party member (e.g., 1 for the first member, 2 for the 
 * second member, etc.), and stat is the statistic you want to display 
 * (e.g., level, mhp, mmp, atk, def, mat, mdf, agi, luk, hp, mp, name, class, 
 * nextLevelExp). 
 * 
 * For example, \party1[level] would display the level of the first party 
 * member, and \party3[hp] would display the current hp of the third party 
 * member.
 * 
 * >> You can also use message commands, such as \c[x] \fs[x] or \i[x] 
 * to change the font size and color or display icons.
 * 
 * ====================
 * [v1.1] NEW FORMULAS FOR CUSTOM TEXT:
 * 
 * If you Custom Text is exactly these formulas:
 * ====================
 * 
 * 
 * 
 * \condSwitchIsOn[X] 
 * 
 * This command checks the status of a specific game switch. 
 * The X in the command should be replaced with the ID of the switch you want 
 * to check. If the switch is turned on, the command will return true; if the 
 * switch is off, the command will return false.
 * 
 * 
 *
 * \condVariable>[x,y] 
 * 
 * This command compares a game variable to a specific 
 * value or another game variable. The x in the command should be replaced 
 * with the ID of the variable you want to check, and the y should be replaced 
 * with the value  or variable ID you want to compare it to. 
 * 
 * If the value of variable x is greater than y, the command will return true;
 * otherwise, it will return false.
 * 
 * 
 *
 * \condVariable>=[x,y] 
 * 
 * This command works similarly to the previous one, 
 * but it also returns  true if the value of variable x is equal to y.
 *
 * 
 * \condVariable<=[x,y] 
 * 
 * This command checks if the value of variable x is 
 * less than or equal to y. If it is, the command will return true; otherwise, 
 * it will return false.
 * 
 * 
 *
 * \condVariable<[x,y] 
 * 
 *  This command checks if the value of variable x is less 
 * than y. If it is, the command will return true; otherwise, it will return false.
 * 
 * 
 *
 * \condVariable<>[x,y] 
 * 
 * This command checks if the value of variable x is different 
 * from y. If it is, the command will return true; otherwise, it will return false.
 * 
 * 
 *
 * In all of these commands, you can use var(x) to refer to the value of a game variable. 
 * 
 * For example, \condVariable>[var(1),5] will check if the value of game variable 1 
 * is greater than 5.
 * 
 * 
 * 
 * 
 * //// END OF DOCUMENTATION /////
 * 
 * 
 * @command Create New Sliders
 * @text Create New Sliders
 * @desc Creates new sliders with the given parameters.
 * 
 * @arg Background Color 1
 * @type text
 * @desc The first color of the gradient for the Background of the scene (If Image is not selected). USE HEX COLORS
 * 
 * @arg Background Color 2
 * @type text
 * @desc The second color of the gradient for the Background of the scene (If Image is not selected). USE HEX COLORS
 * 
 * @arg Background Image
 * @type file
 * @dir img/
 * @desc The background image of the slider.
 * 
 * @arg Sliders
 * @type struct<Slider>[]
 * @desc The settings for the sliders.
 * 
 * @arg Custom Texts
 * @type struct<CustomText>[]
 * @desc The settings for the custom texts.
 */

/*~struct~Slider:
 * @param Enabled
 * @type boolean
 * @desc Whether the slider is enabled.
 * 
 * @param ID
 * @type text
 * @desc The ID of the slider. Must be a number. Don't Repeat if you create more than 1 slider in the scene. Use 1,2,3,4...
 * 
 * @param Variable
 * @type variable
 * @desc The variable that the slider will control.
 * 
 * @param Min Value
 * @type number
 * @desc The minimum value of the slider.
 * 
 * @param Max Value
 * @type number
 * @desc The maximum value of the slider.
 * 
 * @param Slider Fill Color
 * @type text[]
 * @desc The fill color of the slider. Accepts up to 3 HEX colors for gradient.
 * 
 * @param Circle Color
 * @type text
 * @desc The color of the circle.
 * 
 * @param Hover Color
 * @type text
 * @desc The color of the circle when the slider is active.
 * 
 * @param Circle Size
 * @type number
 * @desc The size of the circle.
 * 
 * @param Background Width
 * @type number
 * @desc The width of the background.
 * 
 * @param Background Height
 * @type number
 * @desc The height of the background.
 * 
 * @param Position X
 * @type number
 * @desc The X position of the slider.
 * 
 * @param Position Y
 * @type number
 * @desc The Y position of the slider.
 * 
 * @param Hide Active Switch ID
 * @type switch
 * @desc The ID of the switch that hides the slider when active. Optional feature.
 */

/*~struct~CustomText:
 * @param Text
 * @type text
 * @desc The custom text to display. Use \\v[x] to display the value of variable x.
 * 
 * @param Position X
 * @type number
 * @desc The X position of the custom text.
 * 
 * @param Position Y
 * @type number
 * @desc The Y position of the custom text.
 * 
 * @param Hide Active Switch ID
 * @type switch
 * @desc The ID of the switch that hides the custom text when active. Optional feature.
 * 
 * @param Value for True condition
 * @type text
 * @desc The value to display if the condition is true.
 * 
 * @param Value for False condition
 * @type text
 * @desc The value to display if the condition is false.
 */



(() => {
    'use strict';

    const pluginName = 'SlidersMZ';

    let sliderArgs = null; // Global variable to store the slider arguments

    // Function to convert string "true" and "false" to boolean
    function strToBool(str) {
        if (str === 'true') return true;
        if (str === 'false') return false;
        return str;
    }

    function getPartyStat(index, stat) {
        const actor = $gameParty.members()[index - 1];
        if (!actor) return '';
        switch (stat) {
            case 'level': return actor.level;
            case 'mhp': return actor.mhp;
            case 'mmp': return actor.mmp;
            case 'atk': return actor.atk;
            case 'def': return actor.def;
            case 'mat': return actor.mat;
            case 'mdf': return actor.mdf;
            case 'agi': return actor.agi;
            case 'luk': return actor.luk;
            case 'hp': return actor.hp;
            case 'mp': return actor.mp;
            case 'name': return actor.name();
            case 'class': return actor.currentClass().name;
            case 'nextLevelExp': return actor.nextRequiredExp();
            default: return '';
        }
    }

    Bitmap.prototype.fillRoundRect = function(x, y, width, height, radius) {
        const context = this._context;
        context.beginPath();
    
        // Adjust the radius for smaller rectangles
        radius = Math.min(radius, height / 2, width / 2);
    
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
        context.lineTo(x + width, y + height - radius);
        context.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
        context.lineTo(x + radius, y + height);
        context.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
        context.lineTo(x, y + radius);
        context.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
    
        context.closePath();
        context.fill();
    };
    
    

    class CustomTextWindow extends Window_Base {
        constructor(x, y, text, fontColor, trueValue, falseValue) {
            super(new Rectangle(x, y, Graphics.boxWidth, Graphics.boxHeight));
            this._text = text;
            this._fontColor = fontColor;
            this._trueValue = trueValue || '';
            this._falseValue = falseValue || '';
            this.setBackgroundType('Transparent');
            this.refresh();
        }
    
       
        update() {
            super.update();
            const variableConditionMatch = this._text.match(/\\condVariable([<>]=?)\[(var\((\d+)\)|(\\d+)),(var\((\d+)\)|(\\d+))\]/i);
            if (variableConditionMatch) {
                const x = variableConditionMatch[3] ? $gameVariables.value(Number(variableConditionMatch[3])) : Number(variableConditionMatch[4]);
                if (this._lastVariableValue !== x) {
                    this.refresh();
                    this._lastVariableValue = x;
                }
            } else if (this._text !== this._lastText) {
                this.refresh();
                this._lastText = this._text;
            }
        }

    
        refresh() {
            this.contents.clear();
            this.changeTextColor(this._fontColor);
            let finalText = this._text; // Variable local para almacenar el texto que se va a dibujar
            const partyStatMatch = finalText.match(/\\party(\d+)\[(\w+)\]/i);
            if (partyStatMatch) {
                const index = Number(partyStatMatch[1]);
                const stat = partyStatMatch[2];
                finalText = finalText.replace(partyStatMatch[0], getPartyStat(index, stat));
            }
            const conditionMatch = finalText.match(/\\condSwitchIsOn\[(\d+)\]/i);
            if (conditionMatch) {
                const x = Number(conditionMatch[1]);
                const result = $gameSwitches.value(x);
                finalText = result ? this._trueValue : this._falseValue;
            }
            const variableConditionMatch = finalText.match(/\\condVariable([<>]=?)\[(var\((\d+)\)|(\d+)),(var\((\d+)\)|(\d+))\]/i);
            if (variableConditionMatch) {
                const operator = variableConditionMatch[1];
                const x = variableConditionMatch[3] ? $gameVariables.value(Number(variableConditionMatch[3])) : Number(variableConditionMatch[4]);
                const y = variableConditionMatch[6] ? $gameVariables.value(Number(variableConditionMatch[6])) : Number(variableConditionMatch[7]);
                let result;
                switch (operator) {
                    case '>':
                        result = x > y;
                        break;
                    case '>=':
                        result = x >= y;
                        break;
                    case '<=':
                        result = x <= y;
                        break;
                    case '<':
                        result = x < y;
                        break;
                    case '<>':
                        result = x !== y;
                        break;
                }
                finalText = result ? this._trueValue : this._falseValue;
            }
            this.drawTextEx(finalText, 0, 0); // Dibuja finalText en lugar de this._text
        }
        




    }
    
    
    
    

    class SliderWindow extends Window_Base {
        constructor(x, y, width, height, backgroundColor, circleColor, hoverColor, circleSize, textWindows, variableId) {
            height = Math.max(height, 30); // Ensure the height is at least 30
            super(new Rectangle(x, y, width, height));
            this._value = $gameVariables.value(variableId); // Set the initial value to the current value of the game variable
            this._minValue = 0;
            this._maxValue = 100;
            try {
                backgroundColor = JSON.parse(backgroundColor);
            } catch (e) {
            }
    
            this._backgroundColor = (Array.isArray(backgroundColor) && backgroundColor.length) ? backgroundColor : ['#00000080', '#FFFFFF80', '#00000080'];
            this._circleColor = circleColor;
            this._hoverColor = hoverColor; // New property for hover color
            this._circleSize = circleSize;
            this._textWindows = textWindows; // Reference to the text windows
            this._variableId = variableId; // Reference to the game variable
            this.setBackgroundType('Transparent');
            this.deactivate(); // Deactivate the slider initially
        }
    
        setValue(value) {
            this._value = Math.max(this._minValue, Math.min(this._maxValue, value));
            $gameVariables.setValue(this._variableId, this._value); // Update the game variable
            this.refresh();
            this._textWindows.forEach(textWindow => textWindow.refresh()); // Update the text windows
        }
        
        
        

        setRange(minValue, maxValue) {
            this._minValue = minValue;
            this._maxValue = maxValue;
            this.setValue(this._value); // Ensure the current value is within the new range

        }

        refresh() {
            this.contents.clear();
            this.drawSlider();
        }

        drawSlider() {
            const width = this.contentsWidth() - this._circleSize * 3; // Subtract the circle size from the width
            const height = this.contentsHeight();
            const x = this._circleSize * 1.5; // Set x to circleSize
            const y = 0;
            const gradient = this.contents.context.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, this._backgroundColor[0]);
            gradient.addColorStop(0.5, this._backgroundColor[1]);
            gradient.addColorStop(1, this._backgroundColor[2]);
            this.contents.context.fillStyle = gradient;
            this.contents.fillRoundRect(x, y, width, height, 10); // Use fillRoundRect instead of fillRect
            this.contents.context.beginPath();

            const steps = this._maxValue - this._minValue + 1;
            const stepWidth = width / (steps - 1);

            let circleX = stepWidth * (this._value - this._minValue) + this._circleSize * 1.5;

            // Ensure circleX does not exceed the contents width
            circleX = Math.min(circleX, this.contentsWidth() - this._circleSize * 1.5);

            this.contents.context.arc(circleX, y + height / 2, this._circleSize, 0, Math.PI * 2, false);
            this.contents.context.fillStyle = this.active ? this._hoverColor : this._circleColor; // Use hover color if slider is active
            this.contents.context.fill();
        }
        
        update() {
            super.update();
            if (this.active) {
                let oldValue = this._value;
                if (Input.isRepeated('left')) {
                    this.changeValue(-1);
                }
                if (Input.isRepeated('right')) {
                    this.changeValue(1);
                }
                if (Input.isTriggered('cancel')) {
                    this.deactivate();
                    SceneManager.pop(); // Close the scene when the cancel button is pressed
                }
                // Si el valor ha cambiado, actualiza las ventanas de texto
                if (this._value !== oldValue) {
                    this._textWindows.forEach(textWindow => textWindow.refresh());
                }
            }
            this._textWindows.forEach(textWindow => textWindow.update());
            
            
        }

        changeValue(amount) {
            this.setValue(this._value + amount);
            if (this._value !== this._lastValue) {
                SoundManager.playCursor();
            }
        }

        activate() {
            super.activate();
            this.refresh(); // Refresh the slider when it is activated
        }

        deactivate() {
            super.deactivate();
            this.refresh(); // Refresh the slider when it is deactivated
        }
    }

    class Scene_Slider extends Scene_MenuBase {
        create() {
            super.create();
            const args = sliderArgs;
            this._gradientSprite = new Sprite();
            this._gradientSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
            const gradient = this._gradientSprite.bitmap.context.createLinearGradient(0, 0, Graphics.width, Graphics.height);
            gradient.addColorStop(0, args['Background Color 1']);
            gradient.addColorStop(1, args['Background Color 2']);
            this._gradientSprite.bitmap.context.fillStyle = gradient;
            this._gradientSprite.bitmap.context.fillRect(0, 0, Graphics.width, Graphics.height);
            this.addChild(this._gradientSprite);
            
    
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = ImageManager.loadBitmap('img/', args['Background Image'], 0, true);
            this._backgroundSprite.bitmap.addLoadListener(() => {
                const scale = Math.max(
                    Graphics.boxWidth / this._backgroundSprite.bitmap.width,
                    Graphics.boxHeight / this._backgroundSprite.bitmap.height
                );
                this._backgroundSprite.scale.x = scale * 1.01;
                this._backgroundSprite.scale.y = scale;
                this._backgroundSprite.anchor.x = 0.5;
                this._backgroundSprite.anchor.y = 0.5;
                this._backgroundSprite.x = Graphics.boxWidth / 2;
                this._backgroundSprite.y = Graphics.boxHeight / 2;
            });
            
            
            
            
            this.addChild(this._backgroundSprite);
    
            this.createWindowLayer();
    
            this._textWindows = [];
            const customTexts = JSON.parse(args['Custom Texts']);
            for (let i = 0; i < customTexts.length; i++) {
                const customText = JSON.parse(customTexts[i]);
                // Check if the custom text is defined and the switch is off
                if (customText && customText.Text && !$gameSwitches.value(customText['Hide Active Switch ID'])) {
                  
                    const textWindow = new CustomTextWindow(
                        customText['Position X'], 
                        customText['Position Y'], 
                        customText.Text, 
                        customText['Font Color'], 
                        customText['Value for True condition'], 
                        customText['Value for False condition']
                    );


                    this._textWindows.push(textWindow);
                    this.addWindow(textWindow);
                }
            }
    
            this._sliderWindows = [];
            const sliders = JSON.parse(args['Sliders']);
            for (let i = 0; i < sliders.length; i++) {
                const slider = JSON.parse(sliders[i]);
                // Convert the string "Enabled" to boolean
                slider.Enabled = strToBool(slider.Enabled);
                // Check if the slider is enabled and the switch is off
                if (slider && slider.Enabled && !$gameSwitches.value(slider['Hide Active Switch ID'])) {
                    const sliderWindow = new SliderWindow(slider['Position X'], slider['Position Y'], slider['Background Width'], slider['Background Height'], slider['Slider Fill Color'], slider['Circle Color'], slider['Hover Color'], slider['Circle Size'], this._textWindows, slider.Variable);
                    sliderWindow.setRange(slider['Min Value'], slider['Max Value']);
                    sliderWindow.setValue($gameVariables.value(slider.Variable));
                    this._sliderWindows.push(sliderWindow);
                    this.addWindow(sliderWindow);
    
                }
            }
            
            this._sliderIndex = 0;
            if (this._sliderWindows.length > 0) {
                this._sliderWindows[this._sliderIndex].activate();
            }
            Input.clear();
        }
        
        start() {
            super.start();
            this.startFadeIn(2, false);
        }

        update() {
            
            Scene_Base.prototype.update.call(this);
            this._textWindows.forEach(textWindow => textWindow.update());
            if (this._sliderWindows.length > 0) {
                if (Input.isTriggered('up')) {
                    this._sliderWindows[this._sliderIndex].deactivate();
                    do {
                        this._sliderIndex--;
                        if (this._sliderIndex < 0) {
                            this._sliderIndex = this._sliderWindows.length - 1;
                        }
                    } while (sliderArgs[`Slider ${this._sliderIndex + 1}`] && !JSON.parse(sliderArgs[`Slider ${this._sliderIndex + 1}`]).Enabled);
                    this._sliderWindows[this._sliderIndex].activate();
                    this._sliderWindows[this._sliderIndex].refresh();
                }
                if (Input.isTriggered('down')) {
                    this._sliderWindows[this._sliderIndex].deactivate();
                    do {
                        this._sliderIndex++;
                        if (this._sliderIndex >= this._sliderWindows.length) {
                            this._sliderIndex = 0;
                        }
                    } while (sliderArgs[`Slider ${this._sliderIndex + 1}`] && !JSON.parse(sliderArgs[`Slider ${this._sliderIndex + 1}`]).Enabled);
                    this._sliderWindows[this._sliderIndex].activate();
                    this._sliderWindows[this._sliderIndex].refresh();
                }
            }
        }
        
    
    }

    PluginManager.registerCommand(pluginName, 'Create New Sliders', args => {
        sliderArgs = args;
        let enabledSliders = 0;
        const sliders = JSON.parse(args['Sliders']);
        for (let i = 0; i < sliders.length; i++) {
            const slider = JSON.parse(sliders[i]);
            if (strToBool(slider['Enabled'])) {
                enabledSliders++;
            }
        }
        if (enabledSliders > 0) {
            SceneManager.push(Scene_Slider);
        } else {
            console.log("No sliders enabled. Scene not loaded.");
        }
    
    });
    
    
})();
