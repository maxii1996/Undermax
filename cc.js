/*:
 * @target MZ
 * @plugindesc In-game Command Console for RPG Maker MZ
 * @author Undermax Games | Maxii1996
 * @url https://undermax.itch.io/
 *
 * @param EnableGiveItem
 * @text Enable \giveitem
 * @type boolean
 * @default true
 *
 * @param EnableGiveWeapon
 * @text Enable \giveweapon
 * @type boolean
 * @default true
 *
 * @param EnableGiveArmor
 * @text Enable \givearmor
 * @type boolean
 * @default true
 *
 * @param EnableHeal
 * @text Enable \heal
 * @type boolean
 * @default true
 *
 * @param EnableMoney
 * @text Enable \money
 * @type boolean
 * @default true
 *
 * @param EnableSwitch
 * @text Enable \switch
 * @type boolean
 * @default true
 *
 * @param EnableVariable
 * @text Enable \variable
 * @type boolean
 * @default true
 *
 * @param SWITCH_CONSOLE_OPEN
 * @text Switch for Console Open
 * @type number
 * @default 1
 *
 * @param SWITCH_COMMAND_USED
 * @text Switch for Command Used
 * @type number
 * @default 2
 * 
 *
 * @help
 * This plugin allows you to open an in-game command console.
 * Press the "|" key to toggle the console.
 */

(() => {

    const parameters = PluginManager.parameters('CommandConsole');
    const SWITCH_CONSOLE_OPEN = parseInt(parameters['SWITCH_CONSOLE_OPEN'] || 1);
    const SWITCH_COMMAND_USED = parseInt(parameters['SWITCH_COMMAND_USED'] || 2);
    const CMD_SWITCH_ON = "on";
    const CMD_SWITCH_OFF = "off";

    let currentSwitchState;
    let currentVariableValue;
    let isConsoleOpen = false;
    let commandInput = "";
    let commandHistory = [];
    let userCommandHistory = [];
    let userCommandHistoryIndex = -1;
    let consoleHistoryWindow = null;
    let consoleInputWindow = null;
    let EnableGiveItem = parameters['EnableGiveItem'] === "true";
    let EnableGiveWeapon = parameters['EnableGiveWeapon'] === "true";
    let EnableGiveArmor = parameters['EnableGiveArmor'] === "true";
    let EnableHeal = parameters['EnableHeal'] === "true";
    let EnableMoney = parameters['EnableMoney'] === "true";


    class ConsoleHistoryWindow extends Window_Base {
        constructor() {
            super(new Rectangle(0, Graphics.height * 0.2, Graphics.width, Graphics.height * 0.7));
            this.opacity = 230;
            this.contents.fontSize = 18;
            this.refresh();
        }

        refresh() {
            this.contents.clear();
            const lineHeight = this.lineHeight();
            const maxLines = Math.floor(this.contentsHeight() / lineHeight);
            const startLine = Math.max(0, commandHistory.length - maxLines);

            for (let i = startLine; i < commandHistory.length; i++) {
                const color = this.textColorFromType(commandHistory[i].type);
                this.changeTextColor(color);
                this.drawText(commandHistory[i].text, 0, (i - startLine) * lineHeight, this.width - this.padding * 2);
                this.resetTextColor();
            }
        }

        textColorFromType(type) {
            switch (type) {
                case 'error':
                    return ColorManager.textColor(2);
                case 'success':
                    return ColorManager.textColor(3);
                default:
                    return ColorManager.normalColor();
            }
        }

        addToHistory(text, type = 'normal') {
            commandHistory.push({ text: "> " + text, type });
            this.refresh();
        }

        addUserCommandToHistory(command) {
            userCommandHistory.unshift(command);
            userCommandHistoryIndex = -1;
        }

        showPreviousCommand() {
            if (userCommandHistoryIndex < userCommandHistory.length - 1) {
                userCommandHistoryIndex++;
                commandInput = userCommandHistory[userCommandHistoryIndex];
                consoleInputWindow.refresh();
            }
        }

        showNextCommand() {
            if (userCommandHistoryIndex > 0) {
                userCommandHistoryIndex--;
                commandInput = userCommandHistory[userCommandHistoryIndex];
                consoleInputWindow.refresh();
            } else if (userCommandHistoryIndex === 0) {
                userCommandHistoryIndex = -1;
                commandInput = "";
                consoleInputWindow.refresh();
            }
        }

    }

    class ConsoleInputWindow extends Window_Base {
        constructor() {
            super(new Rectangle(0, Graphics.height * 0.9, Graphics.width, Graphics.height * 0.1));
            this.opacity = 230;
            this.contents.fontSize = 18;
            this.refresh();
        }

        refresh() {
            this.contents.clear();
            this.drawText("> " + commandInput, 0, 0, this.width - this.padding * 2);
        }

        appendCharacter(character) {
            commandInput += character;
            this.refresh();
        }

        removeCharacter() {
            commandInput = commandInput.slice(0, -1);
            this.refresh();
        }
    }

    const openConsole = () => {
        if (!(SceneManager._scene instanceof Scene_Map)) {
            return;
        }

        isConsoleOpen = true;
        $gameSwitches.setValue(SWITCH_CONSOLE_OPEN, true);
        consoleHistoryWindow = new ConsoleHistoryWindow();
        consoleInputWindow = new ConsoleInputWindow();
        SceneManager._scene.addChild(consoleHistoryWindow);
        SceneManager._scene.addChild(consoleInputWindow);
    };

    const closeConsole = () => {
        isConsoleOpen = false;
        $gameSwitches.setValue(SWITCH_CONSOLE_OPEN, false);
        SceneManager._scene.removeChild(consoleHistoryWindow);
        SceneManager._scene.removeChild(consoleInputWindow);
        consoleHistoryWindow = null;
        consoleInputWindow = null;
    };

    function findDatabaseEntryByName(name, database) {
        const cleanedName = name.trim().toLowerCase();
        return database.find(entry => entry && entry.name.trim().toLowerCase() === cleanedName);
    }

    const processCommand = (command) => {
        if (!command.startsWith("\\")) {
            return;
        }
    
        consoleHistoryWindow.addToHistory(command);
        consoleHistoryWindow.addUserCommandToHistory(command);
        $gameSwitches.setValue(SWITCH_COMMAND_USED, true);
    
        const parts = command.split(" ");
        const mainCommand = parts[0];
        console.log("Main command is:", mainCommand);

        let args = parts.slice(1);
    
        if (mainCommand === "\\switch" || mainCommand === "\\variable") {
            args = command.trim().split(/\s+/).slice(1);
        }
    
        console.log("Debugging mainCommand:", mainCommand, "Args:", args); // Línea de depuración
    
        let identifier;
        console.log("About to enter switch-case with command:", mainCommand);

        switch (mainCommand) {
            case "\\switch":
            case "\\variable":
                break;
            case "\\giveweapon":
            case "\\givearmor":
            case "\\giveitem":
                identifier = args.shift();
                if (isNaN(identifier)) {
                    identifier += " " + args.join(" ");
                }
                args = [identifier].concat(args);
                break;
        }
    
        identifier = args.shift();
        const quantity = parseInt(args.pop()) || 1;
    
        switch (mainCommand) {
            case "\\giveitem":
                if (EnableGiveItem) {
                    let item;
                    if (isNaN(identifier)) {
                        item = findDatabaseEntryByName(identifier, $dataItems);
                    } else {
                        item = $dataItems[parseInt(identifier)];
                    }
    
                    if (item) {
                        $gameParty.gainItem(item, quantity);
                        consoleHistoryWindow.addToHistory(`Added ${quantity} of ${item.name} to inventory.`, 'success');
                    } else {
                        consoleHistoryWindow.addToHistory("Invalid item name or ID.", 'error');
                    }
                }
                break;
    
            case "\\giveweapon":
                if (EnableGiveWeapon) {
                    let weapon;
                    if (isNaN(identifier)) {
                        weapon = findDatabaseEntryByName(identifier, $dataWeapons);
                        if (!weapon) {
                            consoleHistoryWindow.addToHistory(`No weapon found with name: ${identifier}`, 'error');
                            return;
                        }
                    } else {
                        weapon = $dataWeapons[parseInt(identifier)];
                        if (!weapon) {
                            consoleHistoryWindow.addToHistory(`No weapon found with ID: ${identifier}`, 'error');
                            return;
                        }
                    }
    
                    $gameParty.gainItem(weapon, quantity, false, true);
                    consoleHistoryWindow.addToHistory(`Added ${quantity} of ${weapon.name} to inventory.`, 'success');
                }
                break;
    
            case "\\givearmor":
                if (EnableGiveArmor) {
                    let armor;
                    if (isNaN(identifier)) {
                        armor = findDatabaseEntryByName(identifier, $dataArmors);
                    } else {
                        armor = $dataArmors[parseInt(identifier)];
                    }
    
                    if (armor) {
                        $gameParty.gainItem(armor, quantity, false, true);
                        consoleHistoryWindow.addToHistory(`Added ${quantity} of ${armor.name} to inventory.`, 'success');
                    } else {
                        consoleHistoryWindow.addToHistory("Invalid armor name or ID.", 'error');
                    }
                }
                break;
    
            case "\\heal":
                if (EnableHeal) {
                    const identifierLower = identifier.toLowerCase().trim();
                    if (identifierLower === "all") {
                        $gameParty.members().forEach(member => {
                            member.recoverAll();
                        });
                        consoleHistoryWindow.addToHistory("All party members fully healed.", 'success');
                    } else if (identifierLower === "me") {
                        $gameParty.leader().recoverAll();
                        consoleHistoryWindow.addToHistory("Party leader fully healed.", 'success');
                    } else {
                        const memberIndex = parseInt(identifier);
                        if (!isNaN(memberIndex) && memberIndex > 0 && $gameParty.members()[memberIndex - 1]) {
                            $gameParty.members()[memberIndex - 1].recoverAll();
                            consoleHistoryWindow.addToHistory(`Party member ${identifier} fully healed.`, 'success');
                        } else {
                            consoleHistoryWindow.addToHistory("Invalid party member index.", 'error');
                        }
                    }
                }
                break;
    
                case "\\switch":
                    if (args.length >= 2) {
                        const switchId = parseInt(args[0]);
                        const action = args[1].toLowerCase();
                        if (!isNaN(switchId) && (action === CMD_SWITCH_ON || action === CMD_SWITCH_OFF)) {
                            $gameSwitches.setValue(switchId, action === CMD_SWITCH_ON);
                            currentSwitchState = $gameSwitches.value(switchId) ? "ON" : "OFF";
                            console.log(`Switch ${switchId} is now:`, $gameSwitches.value(switchId) ? "ON" : "OFF");

                            consoleHistoryWindow.addToHistory(`Switch ${switchId} turned ${currentSwitchState}.`, 'success');
                        } else {
                            consoleHistoryWindow.addToHistory("Invalid switch command.", 'error');
                        }
                    }
                    break;
                
    
            case "\\variable":
                if (args.length >= 2) {
                    const variableId = parseInt(args[0]);
                    let value = args[1];
                    if (!isNaN(variableId) && value) {
                        if (value.startsWith("+")) {
                            currentVariableValue = $gameVariables.value(variableId) + parseInt(value.slice(1));
                        } else if (value.startsWith("-")) {
                            currentVariableValue = $gameVariables.value(variableId) - parseInt(value.slice(1));
                        } else {
                            currentVariableValue = parseInt(value);
                        }
                        if (!isNaN(currentVariableValue)) {
                            $gameVariables.setValue(variableId, currentVariableValue);
                            consoleHistoryWindow.addToHistory(`Variable ${variableId} set to ${currentVariableValue}.`, 'success');
                        } else {
                            consoleHistoryWindow.addToHistory("Invalid value for variable.", 'error');
                        }
                    } else {
                        consoleHistoryWindow.addToHistory("Invalid variable command.", 'error');
                    }
                }
                break;
    
            case "\\money":
                if (EnableMoney) {
                    const amount = parseInt(identifier);
                    if (!isNaN(amount)) {
                        $gameParty.gainGold(amount);
                        if (amount >= 0) {
                            consoleHistoryWindow.addToHistory(`Added ${amount} gold to inventory.`, 'success');
                        } else {
                            consoleHistoryWindow.addToHistory(`Removed ${Math.abs(amount)} gold from inventory.`, 'success');
                        }
                    } else {
                        consoleHistoryWindow.addToHistory("Invalid amount.", 'error');
                    }
                }
                break;
    
            default:
                consoleHistoryWindow.addToHistory("Unknown command.", 'error');
                break;
        }
        commandInput = "";
    };
    
    const isValidCharacter = (char) => {
        return /^[a-zA-Z0-9áéíóúÁÉÍÓÚ\\\- ]$/.test(char);
    };

    const originalCanMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function () {
        if (isConsoleOpen) {
            return false;
        }
        return originalCanMove.call(this);
    };

    document.addEventListener('keydown', (event) => {
        if (event.key === "|") {
            if (isConsoleOpen) {
                closeConsole();
            } else {
                openConsole();
            }
        } else if (isConsoleOpen) {
            if (event.key === "Enter" && commandInput.startsWith("\\")) {
                processCommand(commandInput);
                consoleInputWindow.refresh();
            } else if (event.key === "ArrowUp") {
                consoleHistoryWindow.showPreviousCommand();
            } else if (event.key === "ArrowDown") {
                consoleHistoryWindow.showNextCommand();
            } else if (event.key === "Backspace") {
                consoleInputWindow.removeCharacter();
            } else if (isValidCharacter(event.key)) {
                consoleInputWindow.appendCharacter(event.key);
            }
        }
    });

})();
