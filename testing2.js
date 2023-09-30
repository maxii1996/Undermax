/*:
 * @target MZ
 * @plugindesc Manages dynamic switches and provides enhanced functionality for RPG Maker MZ.
 * @author Undermax Games | Maxii1996
 * @url https://undermax.itch.io/
 * @help
 *
 * @param lockSwitches
 * @text Lock Switches
 * @type switch[]
 * @desc Identifies switches that cannot be manually modified in-game.
 * 
 * @param initActiveSwitches
 * @text Initialize Active Switches
 * @type switch[]
 * @desc Select switches to initialize as active when the game starts.
 * 
 * @command setDynamicSwitch
 * @text Set Dynamic Switch
 * @desc Activates a dynamic switch that will be deactivated after a specified time period.
 *
 * @arg switchId
 * @text Switch ID
 * @type number
 * @desc ID of the switch to be deactivated.
 *
 * @arg unit
 * @text Time Unit
 * @type select
 * @option Seconds
 * @option Minutes
 * @option Hours
 * @option Days
 * @desc Unit of time to wait before the switch is activated.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @desc Amount of time to wait before the switch is activated.
 *
 * @command unsetDynamicSwitch
 * @text Unset Dynamic Switch
 * @desc Deactivates a dynamic switch, removing it from the list of active switches.
 *
 * @arg switchId
 * @text Switch ID
 * @type number
 * @desc ID of the switch to be deactivated.
 * 
 * @command showSwitchStatus
 * @text Show Switch Status
 * @desc Displays a scene with the status of all pending switches.
 *
 * @command resetAllDynamicSwitches
 * @text Reset All Dynamic Switches
 * @desc Resets all dynamic switches to true, maintaining the locked logic from the plugin configuration.
 *
 * @command getTimeRemainingForSwitch
 * @text Get Time Remaining for Switch
 * @desc Retrieves the remaining time for a switch and stores it in a variable.
 *
 * @arg switchId
 * @text Switch ID
 * @type number
 * @desc ID of the switch for which to get the remaining time.
 *
 * @arg variableId
 * @text Variable ID
 * @type variable
 * @desc ID of the game variable where the remaining time will be stored.
 *
 * @command showProgressBarInEvent
 * @text Show Progress Bar in Event
 * @desc Displays a progress bar in a specific event. If used after setting a switch, a delay of at least 10 frames is recommended.
 *
 * @arg eventId
 * @text Event ID
 * @type number
 * @desc ID of the event where the progress bar will be displayed.
 *
 * @arg switchId
 * @text Dynamic Switch ID
 * @type number
 * @desc ID of the dynamic switch from which the information will be retrieved.
 *
 * @arg backgroundColor
 * @text Background Color
 * @type text
 * @default gray
 * @desc Background color of the progress bar.
 *
 * @arg barColor
 * @text Bar Color
 * @type text
 * @default green
 * @desc Color of the progress bar.
 *
 * @arg width
 * @text Width
 * @type number
 * @min 1
 * @default 100
 * @desc Width of the progress bar.
 *
 * @arg height
 * @text Height
 * @type number
 * @min 1
 * @default 10
 * @desc Height of the progress bar.
 *
 * @arg offsetX
 * @text Offset X
 * @type number
 * @default 0
 * @desc Horizontal offset of the progress bar from the event's position.
 *
 * @arg offsetY
 * @text Offset Y
 * @type number
 * @default -40
 * @desc Vertical offset of the progress bar from the event's position.
 *
 * @arg showTime
 * @text Display Timer on Bar?
 * @type boolean
 * @default false
 * @desc To display correctly, set the Height to a large number, e.g., 24 or more.
 * 
 * @command setProgressBarVisibility
 * @text Set Progress Bar Visibility
 * @desc Sets the visibility of the progress bar. True to display the progress bar, false to hide it.
 *
 * @arg visibility
 * @text Visibility
 * @type boolean
 * @default true
 */


const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const baseGamePath = path.dirname(window.location.pathname).replace(/^\/|\/$/g, '');
const filePath = path.join(baseGamePath, 'js', 'gameData.dat');
const keyPath = path.join(baseGamePath, 'js', 'gameConfig.dat');
const iv = crypto.randomBytes(16);

let secretKey;
if (fs.existsSync(keyPath)) {
    secretKey = fs.readFileSync(keyPath, 'utf8');
} else {
    secretKey = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(keyPath, secretKey, 'utf8');
}

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(text) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

(() => {

    const pluginParameters = PluginManager.parameters('DynamicSwitch');
    const initialLockedSwitches = JSON.parse(pluginParameters.lockSwitches || '[]').map(Number);
    const initActiveSwitches = JSON.parse(pluginParameters.initActiveSwitches || '[]').map(Number);

    let isNewGame = false;

    const _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function () {
        _DataManager_setupNewGame.call(this);
        isNewGame = true;
    };

    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function (mapId) {
        _Game_Map_setup.call(this, mapId);
        if (isNewGame) {
            this.initializeSwitches();
            isNewGame = false;
        }
    };

    Game_Map.prototype.initializeSwitches = function () {
        $gameSwitches._allowingSet = true;
        initActiveSwitches.forEach(switchId => {
            $gameSwitches.setValue(switchId, true);
        });
        $gameSwitches._allowingSet = false;
    };


    class DynamicSwitch {
        constructor(switchId, activationTime, onlineObtained) {
            this.switchId = switchId;
            this.activationTime = activationTime;
            this.onlineObtained = onlineObtained;
        }
    }

    let dynamicSwitches = [];
    try {
        if (fs.existsSync(filePath)) {
            const savedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const iv = Buffer.from(savedData.iv, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
            let decrypted = decipher.update(savedData.data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            try {
                dynamicSwitches = JSON.parse(decrypted) || [];
            } catch (error) {
                if (error instanceof SyntaxError) {
                } else {
                    throw error;
                }
            }
        }
    } catch (error) {
    }

    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function (switchId, value) {
        if (!this._allowingSet && (initialLockedSwitches.includes(switchId) || dynamicSwitches.some(ds => ds.switchId === switchId))) return;
        _Game_Switches_setValue.call(this, switchId, value);
    };

    PluginManager.registerCommand('DynamicSwitch', 'setDynamicSwitch', async args => {
        let onlineObtained = false;
        let currentTime;
        try {
            currentTime = await getCurrentTime();
            onlineObtained = true;
        } catch (error) {
            onlineObtained = false;
            currentTime = new Date().getTime();
        }

        try {
            const switchId = Number(args.switchId);
            const existingSwitch = dynamicSwitches.find(ds => ds.switchId === switchId);
            if (existingSwitch) return;

            const unit = args.unit;
            const amount = Number(args.amount);
            let multiplier;
            switch (unit) {
                case 'Seconds': multiplier = 1000; break;
                case 'Minutes': multiplier = 1000 * 60; break;
                case 'Hours': multiplier = 1000 * 60 * 60; break;
                case 'Days': multiplier = 1000 * 60 * 60 * 24; break;
                default: throw new Error('Invalid time unit');
            }

            const activationTime = currentTime + (amount * multiplier);
            $gameSwitches._allowingSet = true;
            $gameSwitches.setValue(switchId, false);
            $gameSwitches._allowingSet = false;
            dynamicSwitches.push(new DynamicSwitch(switchId, activationTime, onlineObtained));
            localStorage.setItem('dynamicSwitches', JSON.stringify(dynamicSwitches));

        } catch (error) {
        }
    });

    Scene_Map.prototype.removeProgressBar = function (switchId) {
        if (this._progressBar && this._progressBar.switchId === switchId) {
            this.removeChild(this._progressBar);
            this._progressBar = null;
            progressBarInfo = null;
        }
    };

    PluginManager.registerCommand('DynamicSwitch', 'unsetDynamicSwitch', args => {
        const switchId = Number(args.switchId);
        dynamicSwitches = dynamicSwitches.filter(ds => ds.switchId !== switchId);
        localStorage.setItem('dynamicSwitches', JSON.stringify(dynamicSwitches));

        const scene = SceneManager._scene;
        if (scene instanceof Scene_Map) {
            scene.removeProgressBar(switchId);
        }
    });

    PluginManager.registerCommand('DynamicSwitch', 'resetAllDynamicSwitches', args => {
        dynamicSwitches.forEach(ds => {
            $gameSwitches._allowingSet = true;
            $gameSwitches.setValue(ds.switchId, true);
            $gameSwitches._allowingSet = false;
        });
        dynamicSwitches = [];
        localStorage.setItem('dynamicSwitches', JSON.stringify(dynamicSwitches));
    });

    async function getCurrentTime() {
        try {
            const response = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return new Date(data.datetime).getTime();
        } catch (error) {
            throw error;
        }
    }

    function saveDynamicSwitches() {

        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
            let encrypted = cipher.update(JSON.stringify(dynamicSwitches), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const dataToSave = JSON.stringify({ iv: iv.toString('hex'), data: encrypted });
            fs.writeFileSync(filePath, dataToSave, 'utf8');
        } catch (error) {
        }

    }

    const _Original_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _Original_Scene_Map_update.call(this);
        const currentTime = new Date().getTime();
        dynamicSwitches.forEach(ds => {
            if (ds.activationTime <= currentTime) {
                $gameSwitches._allowingSet = true;
                $gameSwitches.setValue(ds.switchId, true);
                $gameSwitches._allowingSet = false;
            }
        });
        dynamicSwitches = dynamicSwitches.filter(ds => ds.activationTime > currentTime);
        saveDynamicSwitches();

        if (this._progressBar) {
            const event = $gameMap.event(progressBarInfo.eventId);
            const maxTime = progressBarInfo.totalTime;
            const startTime = progressBarInfo.startTime;

            if (event) {
                const screenX = event.screenX() + progressBarInfo.offsetX;
                const screenY = event.screenY() + progressBarInfo.offsetY;
                this._progressBar.x = screenX - this._progressBar.width / 2;
                this._progressBar.y = screenY - this._progressBar.height;
            }
            this._progressBar.update();
            if (this._progressBar._remainingTime <= 0) {
                this.removeChild(this._progressBar);
                this._progressBar = null;
                progressBarInfo = null;
            }
        }
    };

    class ProgressBar extends Sprite {
        constructor(switchId, settings) {
            super();
            this.switchId = switchId;
            this._maxWidth = settings.width || 100;
            this._height = settings.height || 10;
            this._backgroundColor = settings.backgroundColor || 'gray';
            this._barColor = settings.barColor || 'green';
            this._showTime = settings.showTime || false;

            this.bitmap = new Bitmap(this._maxWidth, this._height);
            this._remainingTime = 0;
            this._totalTime = 0;
            this._initializeTime();
        }

        _initializeTime() {
            const dynamicSwitch = dynamicSwitches.find(ds => ds.switchId === this.switchId);
            if (dynamicSwitch) {
                if (!progressBarInfo.startTime || !progressBarInfo.totalTime) {
                    this._startTime = new Date().getTime();
                    this._activationTime = dynamicSwitch.activationTime;
                    this._totalTime = this._activationTime - this._startTime;
                    progressBarInfo.startTime = this._startTime;
                    progressBarInfo.totalTime = this._totalTime;
                } else {
                    this._startTime = progressBarInfo.startTime;
                    this._totalTime = progressBarInfo.totalTime;
                    this._activationTime = this._startTime + this._totalTime;
                }
                this._remainingTime = this._activationTime - new Date().getTime();
            }
        }

        update() {

            super.update();
            this.visible = progressBarVisibility;
            const currentTime = new Date().getTime();
            this._remainingTime = this._activationTime - currentTime;
            if (this._remainingTime <= 0) {
                if (this.parent) this.parent.removeChild(this);
                return;
            }
            this._drawProgressBar();
            if (this._showTime) {
                this._drawRemainingTime();
            }
        }

        _drawProgressBar() {
            if (this._remainingTime <= 0) return;
            const percentage = this._remainingTime / this._totalTime;
            const width = this._maxWidth * percentage;
            this.bitmap.clear();
            this.bitmap.fillRect(0, 0, this._maxWidth, this._height, this._backgroundColor);
            this.bitmap.fillRect(0, 0, width, this._height, this._barColor);
        }

        _drawRemainingTime() {

            const fontSize = 18;
            const padding = 4;
            const x = 0;
            const y = 0;

            let delta = this._remainingTime;
            delta = delta < 0 ? 0 : delta;

            const hours = Math.floor(delta / (1000 * 60 * 60));
            delta -= hours * (1000 * 60 * 60);

            const minutes = Math.floor(delta / (1000 * 60));
            delta -= minutes * (1000 * 60);

            const seconds = Math.floor(delta / 1000);

            const timeText = `${hours > 0 ? hours + ":" : ""}${minutes > 0 ? String(minutes).padStart(2, '0') + ":" : "00:"}${String(seconds).padStart(2, '0')}`;

            this.bitmap.fontSize = fontSize;
            this.bitmap.clearRect(x, y, this._maxWidth, fontSize + padding);
            this.bitmap.drawText(timeText, x, y, this._maxWidth, fontSize, 'center');
        }
    }

    let progressBarInfo = null;

    PluginManager.registerCommand('DynamicSwitch', 'showProgressBarInEvent', args => {

        const eventId = Number(args.eventId);
        const switchId = Number(args.switchId);

        const dynamicSwitch = dynamicSwitches.find(ds => ds.switchId === switchId);
        if (!dynamicSwitch) {
            return;
        }

        const currentTime = new Date().getTime();
        let delta = dynamicSwitch.activationTime - currentTime;
        delta = delta < 0 ? 0 : delta;

        if (delta === 0) {
            return;
        }

        progressBarInfo = {
            eventId,
            switchId,
            maxTime: progressBarInfo ? progressBarInfo.maxTime : 0,
            startTime: progressBarInfo ? progressBarInfo.startTime : new Date().getTime(),
            totalTime: progressBarInfo ? progressBarInfo.totalTime : 0,
            backgroundColor: args.backgroundColor || 'gray',
            barColor: args.barColor || 'green',
            width: Number(args.width) || 100,
            height: Number(args.height) || 10,
            offsetX: Number(args.offsetX) || 0,
            offsetY: Number(args.offsetY) || -40,
            showTime: args.showTime === 'true'
        };

        const scene = SceneManager._scene;
        if (scene instanceof Scene_Map) {
            scene._createProgressBar();
        }
    });


    const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function () {
        _Scene_Map_createDisplayObjects.call(this);
        this._createProgressBar();
    };

    Scene_Map.prototype._createProgressBar = function () {
        if (progressBarInfo) {
            this._progressBar = new ProgressBar(progressBarInfo.switchId, progressBarInfo);
            this.addChild(this._progressBar);
        }
    };

    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _DataManager_makeSaveContents.call(this);
        contents.progressBarInfo = progressBarInfo;
        return contents;
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _DataManager_extractSaveContents.call(this, contents);
        progressBarInfo = contents.progressBarInfo;
    };

    class Window_SwitchStatus extends Window_Selectable {
        constructor(rect) {
            super(rect);
            this.refresh();
            this._lastUpdate = 0;
        }
        maxItems() {
            return dynamicSwitches.length;
        }
        drawItem(index) {
            const switchInfo = dynamicSwitches[index];
            if (!switchInfo) return;
            const rect = this.itemLineRect(index);
            this.contents.fontSize = 18;
            const onlineObtained = switchInfo.onlineObtained ? 'True' : 'False';
            const remainingTime = this.calculateRemainingTime(switchInfo.activationTime);
            const idText = `ID: ${switchInfo.switchId}`;
            const onlineText = `Online: ${onlineObtained}`;
            this.drawText(idText, rect.x, rect.y, 120, 'left');
            this.drawText(onlineText, rect.x + 130, rect.y, 150, 'left');
            this.drawText(remainingTime, rect.x + 290, rect.y, rect.width - 290, 'left');
        }
        calculateRemainingTime(activationTime) {
            const currentTime = new Date().getTime();
            let delta = activationTime - currentTime;
            delta = delta < 0 ? 0 : delta;
            const days = Math.floor(delta / (1000 * 60 * 60 * 24));
            delta -= days * (1000 * 60 * 60 * 24);
            const hours = Math.floor(delta / (1000 * 60 * 60));
            delta -= hours * (1000 * 60 * 60);
            const minutes = Math.floor(delta / (1000 * 60));
            delta -= minutes * (1000 * 60);
            const seconds = Math.floor(delta / 1000);
            return `${days > 0 ? days + " days, " : ""}${hours > 0 ? hours + " hours, " : ""}${minutes > 0 ? minutes + " minutes, " : ""}${seconds} seconds`;
        }
        update() {
            super.update();
            if (Date.now() - this._lastUpdate >= 1000) {
                this._lastUpdate = Date.now();
                this.refresh();
            }
        }
    }

    class Scene_SwitchStatus extends Scene_MenuBase {
        create() {
            super.create();
            const screenWidth = Graphics.boxWidth;
            const screenHeight = Graphics.boxHeight;
            const rect = new Rectangle(0, 0, screenWidth, screenHeight);
            this._statusWindow = new Window_SwitchStatus(rect);
            this.addWindow(this._statusWindow);
        }
        update() {
            super.update();
            if (Input.isTriggered('cancel')) {
                this.popScene();
            }
        }
    }

    PluginManager.registerCommand('DynamicSwitch', 'showSwitchStatus', args => {
        SceneManager.push(Scene_SwitchStatus);
    });


    let progressBarVisibility = true;

    PluginManager.registerCommand('DynamicSwitch', 'setProgressBarVisibility', args => {
        progressBarVisibility = args.visibility === 'true';
        localStorage.setItem('progressBarVisibility', progressBarVisibility.toString());
    });


    window.addEventListener('load', () => {
        const storedVisibility = localStorage.getItem('progressBarVisibility');
        if (storedVisibility !== null) {
            progressBarVisibility = storedVisibility === 'true';
        }
    });

    PluginManager.registerCommand('DynamicSwitch', 'getTimeRemainingForSwitch', args => {
        const switchId = Number(args.switchId);
        const variableId = Number(args.variableId);
        const dynamicSwitch = dynamicSwitches.find(ds => ds.switchId === switchId);

        let timeRemaining = "0 seconds";

        if (dynamicSwitch) {
            const currentTime = new Date().getTime();
            let delta = dynamicSwitch.activationTime - currentTime;
            delta = delta < 0 ? 0 : delta;

            const days = Math.floor(delta / (1000 * 60 * 60 * 24));
            delta -= days * (1000 * 60 * 60 * 24);

            const hours = Math.floor(delta / (1000 * 60 * 60));
            delta -= hours * (1000 * 60 * 60);

            const minutes = Math.floor(delta / (1000 * 60));
            delta -= minutes * (1000 * 60);

            const seconds = Math.floor(delta / 1000);

            const parts = [];
            if (days > 0) parts.push(`${days} days`);
            if (hours > 0) parts.push(`${hours} hours`);
            if (minutes > 0) parts.push(`${minutes} minutes`);
            if (seconds > 0 || parts.length === 0) parts.push(`${seconds} seconds`);

            timeRemaining = parts.join(', ');
        }

        $gameVariables.setValue(variableId, timeRemaining);

    });
})();
