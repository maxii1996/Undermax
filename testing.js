/*:
 * @target MZ
 * @plugindesc Dynamic Switches Plugin For RPG MAKER MZ.
 * @author Undermax Games | Maxii1996
 * @url https://undermax.itch.io/
 * @help
 * 
 * @param lockSwitches
 * @text Lock Switches
 * @type switch[]
 * @desc Switches declared here cannot be manually modified in-game in any way.
 * 
 * @param initActiveSwitches
 * @text Initialize Active Switches
 * @type switch[]
 * @desc Choose which switches to initialize as active when the game starts.
 * 
 * @command setDynamicSwitch
 * @text Set Dynamic Switch
 * @desc Sets a dynamic switch that will be deactivated after the specified amount of time.
 *
 * @arg switchId
 * @text Switch ID
 * @type number
 * @desc The ID of the switch to be deactivated.
 *
 * @arg unit
 * @text Time Unit
 * @type select
 * @option Seconds
 * @option Minutes
 * @option Hours
 * @option Days
 * @desc The unit of time to wait before the switch is activated.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @desc The amount of time to wait before the switch is activated.
 *
 * @command unsetDynamicSwitch
 * @text Unset Dynamic Switch
 * @desc Unsets a dynamic switch, removing it from the list of activated switches.
 *
 * @arg switchId
 * @text Switch ID
 * @type number
 * @desc The ID of the switch to be deactivated.
 * 
 * @command showSwitchStatus
 * @text Show Switch Status
 * @desc Shows a scene with the status of all pending switches.
 *
 * @command resetAllDynamicSwitches
 * @text Reset all dynamic switches
 * @desc Resets all dynamic switches to true, maintaining the locked logic from the plugin configuration.
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

    PluginManager.registerCommand('DynamicSwitch', 'unsetDynamicSwitch', args => {
        const switchId = Number(args.switchId);
        dynamicSwitches = dynamicSwitches.filter(ds => ds.switchId !== switchId);
        localStorage.setItem('dynamicSwitches', JSON.stringify(dynamicSwitches));
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
            console.error('Error saving dynamic switches to file:', error);
        }
    }

    const _updateScene = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _updateScene.call(this);
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
})();
