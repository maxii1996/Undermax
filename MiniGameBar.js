/*:
 * @target MZ
 * @plugindesc MiniGameBar Plugin for Rpg Maker MZ | V.1.0.0
 * @author Maxii1996 | Undermax Games
 * @url https://undermax.itch.io/
 * 
 * @command startBar
 * @text Start MiniGameBar
 * @desc Starts the mini-game with the bar and arrow.
 *
 * @arg RangoStart
 * @type number
 * @min 0
 * @max 100
 * @text Range Start
 * @desc Start of the success range in percentage. (0-100)
 * @default 40
 *
 * @arg RangoEnd
 * @type number
 * @min 0
 * @max 100
 * @text Range End
 * @desc End of the success range in percentage. (0-100) This must be Higher than Range Start.
 * @default 60
 * 
 * @arg CoyoteTime
 * @text Coyote Time (%)
 * @type number
 * @min 0
 * @desc The tolerance percentage for success. Allows a margin before and after the range. (Recommended Value: 2)
 * @default 2
 *
 * @arg SuccessSwitchID
 * @type switch
 * @text Success Switch
 * @desc Switch that will activate if the arrow is within the range.
 * @default 1
 *
 * @arg FailSwitchID
 * @type switch
 * @text Failure Switch
 * @desc Switch that will activate if the arrow is outside the range.
 * @default 2
 *
 * @arg BarColors
 * @type text[]
 * @text Bar Colors
 * @desc Bar colors in HEX format. If more than one color is chosen, a multicolor bar is created.
 * @default ["#FF0000"]
 *
 * @arg RangeColor
 * @type text
 * @text Range Color
 * @desc Special range color in HEX format.
 * @default #00FF00
 *
 * @arg ArrowColor
 * @type text
 * @text Arrow Color
 * @desc Arrow color in HEX format.
 * @default #FFFFFF
 * 
 * 
 * @arg PositionMode
 * @type select
 * @text Position Mode
 * @desc Do you want the bar position to be automatic or manual?
 * @default Manual
 * @option Manual
 * @option Automatic
 * 
 * @arg BarX
 * @type number
 * @text Bar X Position
 * @desc X position of the bar.
 * @default 100
 *
 * @arg BarY
 * @type number
 * @text Bar Y Position
 * @desc Y position of the bar.
 * @default 100
 * 
 * @arg AutoBarOffsetX
 * @type number
 * @text Automatic Bar Offset X
 * @desc Offset in the X position of the bar when in Automatic mode.
 * @default 0
 * 
 * @arg AutoBarOffsetY
 * @type number
 * @text Automatic Bar Offset Y
 * @desc Offset in the Y position of the bar when in Automatic mode.
 * @default 0
 *
 * @arg BarWidth
 * @type number
 * @text Bar Width
 * @desc Width of the bar.
 * @default 400
 *
 * @arg BarHeight
 * @type number
 * @text Bar Height
 * @desc Height of the bar.
 * @default 20
 *
 * @arg ArrowSpeed
 * @type number
 * @text Arrow Speed
 * @desc Speed at which the arrow moves.
 * @default 2
 * 
 * @arg ArrowIcon
 * @type combo
 * @text Arrow Icon
 * @desc Unicode character for the arrow icon.
 * @default ↑
 * @option ↑
 * 
 * @arg ArrowSize
 * @type number
 * @text Arrow Size
 * @desc Size of the arrow icon.
 * @default 20
 *
 * @arg EnableShadow
 * @type boolean
 * @text Enable Shadow
 * @desc Enables or disables the shadow.
 * @default true
 *
 * @arg ShadowColor
 * @type text
 * @text Shadow Color
 * @desc Shadow color in HEX format.
 * @default #000000
 *
 * @arg ShadowOffsetX
 * @type number
 * @text Shadow X Position
 * @desc Offset in the X position of the shadow.
 * @default 2
 *
 * @arg ShadowOffsetY
 * @type number
 * @text Shadow Y Position
 * @desc Offset in the Y position of the shadow.
 * @default 2
 *
 * 
 * @arg CustomText
 * @type text
 * @text Custom Text
 * @desc Text that will appear during the minigame.
 * @default 
 * 
 * @arg ShowWindowBackground
 * @type boolean
 * @text Show Window Background
 * @desc Choose if you want to display the window background or not.
 * @default false

 * @arg TextOffsetX
 * @type number
 * @text Text Offset X
 * @desc Offset in the X position of the text.
 * @default 0

 * @arg TextOffsetY
 * @type number
 * @text Text Offset Y
 * @desc Offset in the Y position of the text.
 * @default -30

 * @arg TextSize
 * @type number
 * @text Text Size
 * @desc Size of the text.
 * @default 20

 * @arg TextColor
 * @type text
 * @text Text Color
 * @desc Color of the text in HEX format.
 * @default #FFFFFF
 * 
 * @arg DarkenScreen
 * @type boolean
 * @text Darken Screen
 * @desc Choose if you want to darken the screen during the minigame.
 * @default true
 *
 * @arg ScreenDarknessOpacity
 * @type number
 * @min 0
 * @max 255
 * @text Screen Darkness Opacity
 * @desc Opacity of the screen darkening layer. (0-255)
 * @default 128

 * @arg ScreenDarknessColor
 * @type text
 * @text Screen Darkness Color
 * @desc Color of the screen darkening layer in HEX format.
 * @default #000000
 * 
 */


(() => {
    const BAR_LENGTH = 100;
    let activeBarGame;

    class MiniGameBar {
        constructor(args) {

            this.rangoStart = Number(args.RangoStart);
            this.rangoEnd = Number(args.RangoEnd);
            this.coyoteTime = Number(args.CoyoteTime);
            this.successSwitchId = Number(args.SuccessSwitchID);
            this.failSwitchId = Number(args.FailSwitchID);
            this.barColors = JSON.parse(args.BarColors);
            this.rangeColor = args.RangeColor;
            this.arrowColor = args.ArrowColor;
            this.barX = Number(args.BarX);
            this.barY = Number(args.BarY);
            this.barWidth = Number(args.BarWidth);
            this.barHeight = Number(args.BarHeight);
            this.arrowSpeed = Number(args.ArrowSpeed);
            this.arrowIcon = args.ArrowIcon;
            this.arrowSize = Number(args.ArrowSize);
            this.arrowPosition = 0;
            this.arrowDirection = 1;
            this._canMove = false;
            this.positionMode = args.PositionMode;
            this.customText = args.CustomText || "";
            this.textOffsetX = Number(args.TextOffsetX || 0);
            this.textOffsetY = Number(args.TextOffsetY || 0);
            this.textSize = Number(args.TextSize || 28);
            this.textColor = args.TextColor || "#FFFFFF";
            this.showWindowBackground = (args.ShowWindowBackground === 'true' || args.ShowWindowBackground === true);
            this.AutoBarOffsetX = Number(args.AutoBarOffsetX || 0);
            this.AutoBarOffsetY = Number(args.AutoBarOffsetY || 0);
            this.enableShadow = (args.EnableShadow === 'true' || args.EnableShadow === true);
            this.shadowColor = args.ShadowColor;
            this.shadowOffsetX = Number(args.ShadowOffsetX);
            this.shadowOffsetY = Number(args.ShadowOffsetY);
            this._darkenScreen = (args.DarkenScreen === 'true' || args.DarkenScreen === true);
            this._screenDarknessOpacity = Number(args.ScreenDarknessOpacity || 0);
            this._screenDarknessColor = args.ScreenDarknessColor || '#000000';

            SceneManager._scene.createBarArrowGame(this);
        }

        updateArrow() {
            this.arrowPosition += this.arrowDirection * this.arrowSpeed;
            if (this.arrowPosition <= 0 || this.arrowPosition >= BAR_LENGTH) {
                this.arrowDirection *= -1;
            }
            SceneManager._scene.drawArrow(this);
            if (Input.isTriggered('ok')) {
                this.checkArrowPosition();
            }
        }

        checkArrowPosition() {
            const adjustedStart = this.rangoStart - this.coyoteTime;
            const adjustedEnd = this.rangoEnd + this.coyoteTime;


            if (this.arrowPosition >= adjustedStart && this.arrowPosition <= adjustedEnd) {
                $gameSwitches.setValue(this.successSwitchId, true);
                $gameSwitches.setValue(this.failSwitchId, false);
            } else {
                $gameSwitches.setValue(this.successSwitchId, false);
                $gameSwitches.setValue(this.failSwitchId, true);
            }
            SceneManager._scene.endBarArrowGame();
        }
    }

    PluginManager.registerCommand('MiniGameBar', 'startBar', args => {
        activeBarGame = new MiniGameBar(args);
        $gameMap._interpreter.setWaitMode('minigame');
    });

    const _Game_Interpreter_update = Game_Interpreter.prototype.update;
    Game_Interpreter.prototype.update = function () {
        if (!activeBarGame) {
            _Game_Interpreter_update.call(this);
        }
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _Scene_Map_update.call(this);
        if (activeBarGame) {
            activeBarGame.updateArrow();
        }
    };

    class CustomTextWindow extends Window_Base {
        constructor(rect, text, showBackground, textColor, textSize) {
            super(rect);
            this._text = this.parseVariables(text);
            this._showBackground = showBackground;
            this._textColor = textColor;
            this._textSize = textSize;
            this.updateBackOpacity();
            this.refresh();
        }

        refresh() {
            this.contents.clear();
            this.changeTextColor(this._textColor);
            this.contents.fontSize = this._textSize;
            const textWidth = this.textWidth(this._text);
            const textHeight = this.calcTextHeight({ text: this._text, index: 0 }, false);
            const x = (this.contentsWidth() - textWidth) / 2;
            const y = (this.contentsHeight() - textHeight) / 2;
            this.drawText(this._text, x, y);
        }

        parseVariables(text) {
            return text.replace(/\\v\[(\d+)\]/g, (_, variableId) => {
                return $gameVariables.value(Number(variableId));
            });
        }

        updateBackOpacity() {
            this.backOpacity = this._showBackground ? 255 : 0;
        }

        _refreshFrame() {
            if (this._showBackground) {
                super._refreshFrame();
            } else {
                if (this._windowFrameSprite) {
                    this._windowFrameSprite.visible = false;
                }
            }
        }

        hideWindow() {
            this.hide();
            this.contents.clear();
        }
    }

    Scene_Map.prototype.createBarArrowGame = function (gameConfig) {

        const darkenScreen = this._darkenScreen;
        const screenDarknessOpacity = this._screenDarknessOpacity;
        const screenDarknessColor = this._screenDarknessColor;

        if (gameConfig._darkenScreen) {
            this._darkenSprite = new Sprite();
            this._darkenSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
            this._darkenSprite.bitmap.fillAll(gameConfig._screenDarknessColor);
            this._darkenSprite.opacity = gameConfig._screenDarknessOpacity;
            this.addChildAt(this._darkenSprite, 1);
        }

        if (gameConfig.positionMode === "Automatic") {
            const tileWidth = $gameMap.tileWidth();
            const tileHeight = $gameMap.tileHeight();
            gameConfig.barX = $gamePlayer.screenX() - gameConfig.barWidth / 2 + gameConfig.AutoBarOffsetX;
            gameConfig.barY = $gamePlayer.screenY() - tileHeight - gameConfig.barHeight + gameConfig.AutoBarOffsetY;
        }

        if (gameConfig.customText && gameConfig.customText !== "") {
            const dummyWindow = new Window_Base(new Rectangle(0, 0, 0, 0));
            dummyWindow.contents.fontSize = gameConfig.textSize;
            const textWidth = dummyWindow.textWidth(gameConfig.customText) + dummyWindow.padding * 2;
            const textHeight = dummyWindow.calcTextHeight({ text: gameConfig.customText, index: 0 }, false) + dummyWindow.padding * 2;
            const x = gameConfig.barX + gameConfig.textOffsetX;
            const y = gameConfig.barY - textHeight + gameConfig.textOffsetY;
            this._customTextWindow = new CustomTextWindow(new Rectangle(x, y, textWidth, textHeight), gameConfig.customText, gameConfig.showWindowBackground, gameConfig.textColor, gameConfig.textSize);
            this.addWindow(this._customTextWindow);
            this.addChildAt(this._customTextWindow, 2);

        } else {

        }


        this._barSprite = new PIXI.Graphics();
        this._arrowSprite = new PIXI.Text(gameConfig.arrowIcon, {
            fontSize: gameConfig.arrowSize,
            fill: gameConfig.arrowColor
        });
        this.addChild(this._barSprite);
        this._barSprite.clear();

        if (gameConfig.enableShadow) {
            this._barShadowSprite = new PIXI.Graphics();
            this._barShadowSprite.beginFill(parseInt(gameConfig.shadowColor.slice(1), 16));
            this._barShadowSprite.drawRect(gameConfig.barX + gameConfig.shadowOffsetX, gameConfig.barY + gameConfig.shadowOffsetY, gameConfig.barWidth, gameConfig.barHeight);
            this._barShadowSprite.endFill();
            this.addChild(this._barShadowSprite);
        } else {
            if (this._barShadowSprite) {
                this.removeChild(this._barShadowSprite);
                this._barShadowSprite = null;
            }
        }

        this._barSprite = new PIXI.Graphics();
        this.addChild(this._barSprite);

        if (gameConfig.barColors.length > 1) {
            let stepWidth = gameConfig.barWidth / gameConfig.barColors.length;
            for (let i = 0; i < gameConfig.barColors.length; i++) {
                this._barSprite.beginFill(parseInt(gameConfig.barColors[i].slice(1), 16));
                this._barSprite.drawRect(gameConfig.barX + (i * stepWidth), gameConfig.barY, stepWidth, gameConfig.barHeight);
                this._barSprite.endFill();
            }
        } else {
            this._barSprite.beginFill(parseInt(gameConfig.barColors[0].slice(1), 16));
            this._barSprite.drawRect(gameConfig.barX, gameConfig.barY, gameConfig.barWidth, gameConfig.barHeight);
            this._barSprite.endFill();
        }

        const rangeStartX = gameConfig.barX + (gameConfig.barWidth * (gameConfig.rangoStart / 100));
        const rangeWidth = gameConfig.barWidth * ((gameConfig.rangoEnd - gameConfig.rangoStart) / 100);
        this._barSprite.beginFill(parseInt(gameConfig.rangeColor.slice(1), 16));
        this._barSprite.drawRect(rangeStartX, gameConfig.barY, rangeWidth, gameConfig.barHeight);
        this._barSprite.endFill();

        if (gameConfig.enableShadow) {
            this._arrowShadowSprite = new PIXI.Text(gameConfig.arrowIcon, {
                fontSize: gameConfig.arrowSize,
                fill: gameConfig.shadowColor
            });
            this.addChild(this._arrowShadowSprite);
        }

        this._arrowSprite = new PIXI.Text(gameConfig.arrowIcon, {
            fontSize: gameConfig.arrowSize,
            fill: gameConfig.arrowColor
        });
        this.addChild(this._arrowSprite);
    };


    Scene_Map.prototype.drawArrow = function (gameConfig) {
        if (!this._arrowSprite) return;
        const arrowX = gameConfig.barX + (gameConfig.barWidth * (gameConfig.arrowPosition / 100));
        this._arrowSprite.x = arrowX;
        this._arrowSprite.y = gameConfig.barY + gameConfig.barHeight;

        if (gameConfig.enableShadow && this._arrowShadowSprite) {
            this._arrowShadowSprite.x = arrowX + gameConfig.shadowOffsetX;
            this._arrowShadowSprite.y = gameConfig.barY + gameConfig.barHeight + gameConfig.shadowOffsetY;
        } else {
            if (this._arrowShadowSprite) {
                this._arrowShadowSprite.visible = false;
            }
        }
    };


    Scene_Map.prototype.endBarArrowGame = function () {

        if (this._darkenSprite) {
            this.removeChild(this._darkenSprite);
            this._darkenSprite = null;
        }

        this.removeChild(this._barSprite);
        this.removeChild(this._arrowSprite);

        if (this._barShadowSprite) {
            this.removeChild(this._barShadowSprite);
        }
        if (this._arrowShadowSprite) {
            this.removeChild(this._arrowShadowSprite);
        }

        if (this._customTextWindow) {
            this._customTextWindow.hideWindow();
            this.removeChild(this._customTextWindow);
            this._customTextWindow.destroy();
            this._customTextWindow = null;
        }

        activeBarGame = null;
        $gameMap._interpreter.setWaitMode('');
    };


    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function () {
        if (activeBarGame) {
            return false;
        }
        return _Game_Player_canMove.call(this);
    };

    const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
    Scene_Map.prototype.isMenuEnabled = function () {
        if (activeBarGame) {
            return false;
        }
        return _Scene_Map_isMenuEnabled.call(this);
    };

    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function () {
        if (activeBarGame) {
            this.endBarArrowGame();
        }
        _Scene_Map_terminate.call(this);
    };

    const _Game_Map_updateInterpreter = Game_Map.prototype.updateInterpreter;
    Game_Map.prototype.updateInterpreter = function () {
        if (!activeBarGame) {
            _Game_Map_updateInterpreter.call(this);
        }
    };

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function () {
        if (this._waitMode === 'minigame') {
            return !!activeBarGame;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };
})();