/*:
 * @target MZ
 * @plugindesc MiniGameBar
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
 * @desc Start of the special range in percentage. (0-100)
 * @default 40
 *
 * @arg RangoEnd
 * @type number
 * @min 0
 * @max 100
 * @text Range End
 * @desc End of the special range in percentage. (0-100)
 * @default 60
 * 
 * @arg CoyoteTime
 * @text Coyote Time (%)
 * @type number
 * @min 0
 * @desc The tolerance percentage for success. It would allow before and after the range. (Recommended Value: 2)
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
 * @desc Bar colors in HEX format. If more than one color is chosen, a gradient is created.
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
 * 
@arg ArrowIcon
 * @type combo
 * @text Arrow Icon
 * @desc Unicode character for the arrow icon.
 * @default ↑
 * @option ↑
 * @option →
 * @option ↗
 * @option ⬆
↑
 * @option ⬆
 * @option ⬆️
 * @option ^
 * @option ↥
 * @option ⇑
 * @option ⇧
 * @option ⇪
 * @option ꜛ
 * @option ˄
 * @option ⌃
 * @option ⌤
 * @option ⮹
 * @option ⇡
 * @option ⇮
 * @option ⮉
 * @option ⮙
 * @option ⮝
 * @option ⮬
 * @option ⮭
 * @option ⮸
 * @option ￪
 * @option ⮤
 * @option ⮥
 * @option ⮴
 * @option ⮵
 * @option 🔼
 * @option 🠅
 * @option 🠉
 * @option 🠕
 * @option 🠑
 * @option 🠙
 * @option 🠝
 * @option 🠡
 * @option 🠥
 * @option 🠩
 * @option 🠵
 * @option 🠹
 * @option 🠽
 * @option 🡁
 * @option 🡅
 * @option 🡑
 * @option 🡡
 * @option 🡩
 * @option 🡱
 * @option 🡹
 * @option 🢁
 * @option 🢙
 * @option 🢑
 * @option 🢕
 * @option ⥣
 * @option ⥜
 * @option ⥔
 * @type combo
 * @text Arrow Icon
 * @desc Unicode character for the arrow icon.
 * @default ↑
 * @option ↑
 * @option →
 * @option ↗
 * @option ⬆
 *
 * @arg ArrowSize
 * @type number
 * @text Arrow Size
 * @desc Size of the arrow in pixels.
 * @default 16
 *

 *
 * @help
 * Use the plugin command "startBar" to start the mini-game.
 */




(() => {
    const BAR_LENGTH = 100;
    let activeBarGame;

    class MiniGameBar {
        constructor(args) {
            console.log("Inicializando MiniGameBar con argumentos:", args);
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
            this.arrowDirection = 1; // 1: derecha, -1: izquierda

            this._canMove = false;

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
        
            console.log("Arrow Position:", this.arrowPosition);
            console.log("Adjusted Start:", adjustedStart);
            console.log("Adjusted End:", adjustedEnd);
        
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
    Game_Interpreter.prototype.update = function() {
        if (!activeBarGame) {
            _Game_Interpreter_update.call(this);
        }
    };

 
    
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if ($gameSwitches.value(this.successSwitchId) && !this._successSoundPlayed) {
      
        } else if ($gameSwitches.value(this.failSwitchId) && !this._failureSoundPlayed) {
       
        }
    };

Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (activeBarGame) {
            activeBarGame.updateArrow();
        }
    };

    Scene_Map.prototype.createBarArrowGame = function(gameConfig) {
        console.log("Creando juego de barra y flecha con configuración:", gameConfig);

        this._barSprite = new PIXI.Graphics();
        this._arrowSprite = new PIXI.Text(gameConfig.arrowIcon, {
            fontSize: gameConfig.arrowSize,
            fill: gameConfig.arrowColor
        });

        this.addChild(this._barSprite);
        this.addChild(this._arrowSprite);

        this._barSprite.clear();

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
    };

    Scene_Map.prototype.drawArrow = function(gameConfig) {
        if (!this._arrowSprite) return;
        const arrowX = gameConfig.barX + (gameConfig.barWidth * (gameConfig.arrowPosition / 100));
        this._arrowSprite.x = arrowX;
        this._arrowSprite.y = gameConfig.barY + gameConfig.barHeight;
    };

    Scene_Map.prototype.endBarArrowGame = function() {
        this.removeChild(this._barSprite);
        this.removeChild(this._arrowSprite);
        activeBarGame = null;
        $gameMap._interpreter.setWaitMode('');
    };

    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (activeBarGame) {
            return false;
        }
        return _Game_Player_canMove.call(this);
    };

    const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
    Scene_Map.prototype.isMenuEnabled = function() {
        if (activeBarGame) {
            return false;
        }
        return _Scene_Map_isMenuEnabled.call(this);
    };

    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        if (activeBarGame) {
            this.endBarArrowGame();
        }
        _Scene_Map_terminate.call(this);
    };

    const _Game_Map_updateInterpreter = Game_Map.prototype.updateInterpreter;
    Game_Map.prototype.updateInterpreter = function() {
        if (!activeBarGame) {
            _Game_Map_updateInterpreter.call(this);
        }
    };


    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'minigame') {
            return !!activeBarGame;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

})();
