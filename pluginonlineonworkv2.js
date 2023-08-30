/*:
 * @target MZ
 * @plugindesc Fetches data from a URL and displays it on screen or saves it to a variable.
 * @author Undermax Games | Maxii1996
 * @url https://undermax.itch.io/
 * 
 * @help
 * 
 * @command OpenOnlineTextWindow
 * @text Open Online Text Window
 * @desc Opens a window to display data fetched from a URL.
 * 
 * @param scrollLines
 * @text Scroll Lines
 * @desc Number of lines to scroll at once when using the arrow keys. You can use Decimals using TEXT field.
 * @type number
 * @min 1
 * @default 0.2
 * 
 * @param windowOpacity
 * @text Window Opacity
 * @desc Set the opacity of the window. (0 = fully transparent, 255 = fully opaque)
 * @type number
 * @min 0
 * @max 255
 * @default 255
 * 
 * 
 * 
 * @arg url
 * @text URL
 * @desc The URL from which you want to fetch the data.
 * @type string
 * @default https://
 * 
 * @param loadingText
 * @text Loading Text
 * @desc Text displayed while fetching the data.
 * @type string
 * @default Fetching information from the server, please wait...
 * 
 * @command FetchOnlineInformation
 * @text Fetch Online Information
 * @desc Fetches data from a URL and saves it to a game variable.
 * 
 * @arg url
 * @text URL
 * @desc The URL from which you want to fetch the data.
 * @type string
 * @default https://
 * 
 * @arg variableId
 * @text Save to Variable
 * @desc ID of the game variable where you want to save the fetched data.
 * @type variable
 * @default 0
 * 
 * @arg switchId
 * @text Data Loaded Switch
 * @desc ID of the switch that will be turned ON once the data is successfully loaded.
 * @type switch
 * @default 0
 * 
 * 
 */

let isDataLoadingSceneActive = false;
let menuReactivationDelay = 0;
let pendingSwitches = [];



(() => {
    const parameters = PluginManager.parameters("OnlineTextMZ");
    const loadingText = String(parameters["loadingText"] || "Fetching information from the server, please wait...");


    ColorManager.hexToRgb = function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    ColorManager.getHexColor = function(hex) {
        const px = this.hexToRgb(hex);
        if (px) {
            return `\\rgb[${px.r},${px.g},${px.b}]`;
        }
        return "";
    };

    Window_Base.prototype.obtainEscapeCode = function(textState) {
        let arr = /^[\$\.\|\^!><\{\}\\]|[A-Z]+/i.exec(textState.text.slice(textState.index));
        if (arr) {
            textState.index += arr[0].length;
            return arr[0].toUpperCase();
        } else {
            return '';
        }
    };


    ColorManager.rgb = function(r, g, b) {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    };

    const _originalProcessEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
    Window_Base.prototype.processEscapeCharacter = function(code, textState) {
        if (code === 'B' && textState.text[textState.index] === 'G') {
            textState.index += 1; 
            code = 'RGB';
        }
        switch (code) {
            case 'RGB':
                const rgb = this.obtainRgbEscapeParam(textState);
                this.changeTextColorRgb(rgb);
                break;
            case 'COLOR':
                const hexColor = this.obtainHexEscapeParam(textState);
                this.changeTextColorRgb(hexColor);
                break;
            case 'LOCALICON':
                const iconIndex = this.obtainEscapeParam(textState);
                this.drawIcon(iconIndex, textState.x, textState.y);
                textState.x += Window_Base._iconWidth + 4;
                break;
            case 'FS':
                const fontSize = this.obtainEscapeParam(textState);
                this.contents.fontSize = fontSize;
                break;
            default:
                _originalProcessEscapeCharacter.call(this, code, textState);
                break;
        }
    };

    Window_Base.prototype.obtainEscapeParam = function(textState) {
        const arr = /^\[(\d+)\]/.exec(textState.text.slice(textState.index));
        if (arr) {
            textState.index += arr[0].length;
            return parseInt(arr[1]);
        } else {
            return '';
        }
    };

    Window_Base.prototype.obtainRgbEscapeParam = function(textState) {
        const arr = /^\[(\d+),(\d+),(\d+)\]/.exec(textState.text.slice(textState.index));
        if (arr) {
            textState.index += arr[0].length;
            return `rgb(${Number(arr[1])},${Number(arr[2])},${Number(arr[3])})`;
          //  return rgbValue;
        } else {
            return '';
        }
    };

    Window_Base.prototype.obtainHexEscapeParam = function(textState) {
        const arr = /^\[([#\w]+)\]/.exec(textState.text.slice(textState.index));
        if (arr) {
            textState.index += arr[0].length;
            const rgb = ColorManager.hexToRgb(arr[1]);
            if (rgb) {
                const rgbValue = ColorManager.rgb(rgb.r, rgb.g, rgb.b);
                return rgbValue;
            }
        }
        return '';
    };
    

    Window_Base.prototype.changeTextColorRgb = function(color) {
        this.contents.textColor = color;
    };
    

    Window_Base.prototype._superProcessEscapeCharacter = Window_Base.prototype.processEscapeCharacter;

    class Window_LoadingData extends Window_Base {
    constructor(rect) {
        super(rect);
        this._data = null;
        this.opacity = Number(PluginManager.parameters('OnlineTextMZ')['windowOpacity'] || 255);
        this._textHeight = 0;
        this._scrollY = 0;
        this._isLoading = true; 
        this.refresh();
        isDataLoadingSceneActive = true;
        $gameSystem.disableMenu();
    }

    set data(value) {
        this._data = this.wordWrap(this.parseCommands((value || "").replace(/<br>/g, '\n')));
        this._textHeight = this.calculateTextHeight();
        this.createContents();
        this._isLoading = false; 
        this.refresh();
    }

        wordWrap(text) {
            let lines = text.split('\n');
            let wrappedText = '';

            for (let line of lines) {
                let words = line.split(' ');
                let newLine = '';

                for (let word of words) {
                    if (this.textWidth(newLine + word) < this.contentsWidth()) {
                        newLine += (newLine ? ' ' : '') + word;
                    } else {
                        wrappedText += newLine + '\n';
                        newLine = word;
                    }
                }

                wrappedText += newLine + '\n';
            }

            return wrappedText;
        }

        calculateTextHeight() {
            const lines = this._data.split('\n');
            return lines.length * this.lineHeight();
        }

        refresh() {
            this.contents.clear();
            if (this._isLoading) { 
                this.resetTextColor(); 
                this.drawTextEx(loadingText, 0, 0, this.contentsWidth());
            } else if (this._data) {
                this.resetTextColor(); 
                this.drawTextEx(this._data, 0, -this._scrollY, this.contentsWidth());
            }
        }

        update() {
            super.update();
            const scrollAmount = Number(parameters["scrollLines"] || 1) * this.lineHeight();
            if (Input.isTriggered('cancel')) {
                this.close();
                SceneManager._scene.removeChild(this);
                isDataLoadingSceneActive = false;
                menuReactivationDelay = 10; 
            }
            if (Input.isPressed('down') || this.isWheelScrollingDown()) {
                this._scrollY = Math.min(this._scrollY + scrollAmount, this._textHeight - this.contentsHeight());
                this.refresh();
            }
            if (Input.isPressed('up') || this.isWheelScrollingUp()) {
                this._scrollY = Math.max(this._scrollY - scrollAmount, 0);
                this.refresh();
            }            
        }

        isWheelScrollingDown() {
            return TouchInput.wheelY > 0;
        }
    
        isWheelScrollingUp() {
            return TouchInput.wheelY < 0;
        }


        createContents() {
            this.contents = new Bitmap(this.contentsWidth(), this._textHeight);
            this.resetFontSettings();
        }

        drawTextEx(text, x, y) {
            if (text) {
                const lines = text.split('\n');
                let newY = y;
    
                for (let line of lines) {
                    let newX = x;
    
                    if (line.includes("<center>") && line.includes("</center>")) {
                        const centeredText = line.match(/<center>(.*?)<\/center>/)[1];
                        newX = (this.contentsWidth() - this.textWidth(centeredText)) / 2;
                        line = line.replace(`<center>${centeredText}</center>`, centeredText);
                    } else if (line.includes("<right>") && line.includes("</right>")) {
                        const rightText = line.match(/<right>(.*?)<\/right>/)[1];
                        newX = this.contentsWidth() - this.textWidth(rightText);
                        line = line.replace(`<right>${rightText}</right>`, rightText);
                    } else if (line.includes("<left>") && line.includes("</left>")) {
                        const leftText = line.match(/<left>(.*?)<\/left>/)[1];
                        line = line.replace(`<left>${leftText}</left>`, leftText);
                    }
    
                    const textState = this.createTextState(line, newX, newY, this.contentsWidth());
                    this.processAllText(textState);
                    newY += this.lineHeight();
                }
    
                return this.contentsWidth();
            } else {
                return 0;
            }
        }
    
    

        processCharacter(textState) {
            if (textState.text.substring(textState.index, textState.index + 6) === "<line>" || textState.text.substring(textState.index, textState.index + 4) === "<hr>") {
                this.contents.fillRect(textState.x, textState.y + (this.lineHeight() / 2) - 1, this.contentsWidth() - textState.x, 2, this.contents.textColor);
                textState.index += (textState.text.substring(textState.index, textState.index + 6) === "<line>") ? 6 : 4; 
                textState.x += this.contentsWidth() - textState.x; 
            } else {
                Window_Base.prototype.processCharacter.call(this, textState);
            }
        }

      
        parseCommands(text) {
            text = text.replace(/\\localvariable\[(\d+)\]/gi, (match, p1) => {
                return $gameVariables.value(Number(p1));
            });

            text = text.replace(/\\localparty\[(\d+),\s*(\w+)\]/gi, (match, p1, p2) => {
                const actor = $gameParty.members()[Number(p1) - 1];
                if (actor) {
                    switch (p2.toLowerCase()) {
                        case "name": return actor.name();
                        case "mhp": return actor.mhp;
                        case "mmp": return actor.mmp;
                        case "atk": return actor.atk;
                        case "def": return actor.def;
                        case "mat": return actor.mat; 
                        case "mdf": return actor.mdf; 
                        case "agi": return actor.agi;
                        case "luk": return actor.luk; 
                        case "class": return $dataClasses[actor._classId].name; 
                        case "level": return actor._level; 
                        case "nextlvlexp": return actor.nextRequiredExp();
                        default: return "";
                    }
                } else {
                    return "";
                }
            });

            text = text.replace(/\\color\[([#\w]+)\]/gi, (match, p1) => {
                return ColorManager.getHexColor(p1);
            });

            return text;
        }
    
    
        
        textColor(color) {
            const colorCode = this.obtainHexColorCode(color);
            if (colorCode !== null) {
                return colorCode;
            }
            return 0;
        }
        
        obtainHexColorCode(hexColor) {
            const colorArray = ColorManager._customColors || [];
            const index = colorArray.indexOf(hexColor.toUpperCase());
            if (index > -1) {
                return 28 + index; 
            } else {
                ColorManager._customColors = colorArray.concat([hexColor.toUpperCase()]);
                return 28 + colorArray.length;
            }
        }
    }

    const pluginName = "OnlineTextMZ";

    PluginManager.registerCommand(pluginName, "OpenOnlineTextWindow", args => {
        const url = args.url;
        loadDataAndDisplay(url);
    });
    
    PluginManager.registerCommand(pluginName, "FetchOnlineInformation", args => {
        const url = args.url;
        const variableId = Number(args.variableId);
        const switchId = Number(args.switchId); 
        loadDataAndSaveToVariable(url, variableId, switchId); 
    });
    

    function loadDataAndDisplay(url) {
        const loadingWindow = new Window_LoadingData(new Rectangle(0, 0, Graphics.width, Graphics.height));
        SceneManager._scene.addChild(loadingWindow);
    
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                const data = xhr.responseText;
                loadingWindow.data = data;
            } else {
                console.error('Error fetching data from the URL:', url);
                loadingWindow.data = "Error fetching data.";
            }
        };
    
        xhr.onerror = () => {
            console.error('Error connecting to the URL:', url);
            loadingWindow.data = "Error connecting to the URL.";
        };
        xhr.send();
    }
    
    function loadDataAndSaveToVariable(url, variableId, switchId) {    
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
    
            if (xhr.status >= 200 && xhr.status < 400) {
                const data = xhr.responseText;
                if (variableId > 0) {
                    $gameVariables.setValue(variableId, data);
                }
                if (switchId > 0) {
                    pendingSwitches.push(switchId);
                }
            } else {
                console.error('Error fetching data from the URL:', url);
                $gameVariables.setValue(variableId, "Error fetching data.");
            }
        };
    
        xhr.onerror = () => {
            console.error('Error connecting to the URL:', url);
            $gameVariables.setValue(variableId, "Error connecting to the URL.");
        };
        xhr.send();
    }
    
    

    function loadDataFromURL(url, variableId) {
        const loadingWindow = new Window_LoadingData(new Rectangle(0, 0, Graphics.width, Graphics.height));
        SceneManager._scene.addChild(loadingWindow);

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                const data = xhr.responseText;
                if (variableId > 0) {
                    $gameVariables.setValue(variableId, data);
                }
                loadingWindow.data = data;
            } else {
                console.error('Error al cargar datos desde la URL:', url);
                loadingWindow.data = "Error al cargar datos.";
            }
        };


        xhr.onerror = () => {
            console.error('Error al conectar con la URL:', url);
            loadingWindow.data = "Error al conectar con la URL.";
        };
        xhr.send();
    }

    
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        while (pendingSwitches.length > 0) {
            const switchId = pendingSwitches.pop();
            $gameSwitches.setValue(switchId, true);
        }
    
        _Scene_Map_update.call(this);
    
        if (menuReactivationDelay > 0) {
            menuReactivationDelay--;
            if (menuReactivationDelay === 0) {
                $gameSystem.enableMenu();
            }
        }
    };
    

    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function () {
        if (isDataLoadingSceneActive) {
            return false;
        }
        return _Game_Player_canMove.call(this);
    };

    const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
    Scene_Map.prototype.isMenuEnabled = function() {
        if (isDataLoadingSceneActive) {
            return false;
        }
        return _Scene_Map_isMenuEnabled.call(this);
    };

    window.activateSwitch = function(switchId) {
        if (switchId > 0) {
            $gameSwitches.setValue(switchId, true);
        }
    };
    
})();
