/*:
 * @plugindesc Durability System for Items
 * @author Undermax Games | Maxii1996
 * @url https://undermax.itch.io/
 * @target MZ
 * 
 * @command DecreaseDurability
 * @text Decrease Durability
 * @desc Decrease the durability of an item.
 * 
 * @arg itemId
 * @type item
 * @text Item
 * @desc Select the item whose durability you want to decrease.
 * 
 * @arg amount
 * @type number
 * @text Amount
 * @desc Amount to decrease the item's durability by.
 * 
 * 
 * @command ShowRepairScene
 * @text Show Repair Scene
 * @desc Show the repair interface.
 * 
 * 
 * @param repairText
 *¨@text Texto "Reparar"
 * @desc Texto para el botón "Reparar".
 * @default Reparar
 *
* @param cancelText
* @text Texto "Cancelar"
* @desc Texto para el botón "Cancelar".
* @default Cancelar
*
* @param totalCostText
* @text Texto "Costo Total"
* @desc Texto para mostrar el costo total de la reparación.
* @default Costo total de la reparación:

 * 
 * 
 * 
 * 
 */
console.log("Durability System Plugin inicializado");

(() => {

    function getItemDurability(item) {
        if (item) {
            let match = item.note.match(/<durability:(\d+)>/i);
            if (match) {
                return Number(match[1]);
            }
        }
        return -1;
    }

    function getRepairCost(item) {
        const note = item.note;
        const match = note.match(/<repair-cost:(\d+)>/i);
        return match ? parseInt(match[1]) : 1;
    }
    

    function initializeDurability(item) {
        if (item && getItemDurability(item) !== -1 && (item.durability === undefined)) {
            item.durability = getItemDurability(item);
        }
    }

    const _DataManager_extractMetadata = DataManager.extractMetadata;
    DataManager.extractMetadata = function(data) {
        _DataManager_extractMetadata.apply(this, arguments);
        initializeDurability(data);
    };


function getSkillBreakValue(skill) {
    if (skill.note.match(/<no-break>/i)) {
        return 0;
    }
    let match = skill.note.match(/<break-value:(\d+)>/i);
    if (match) {
        return Number(match[1]);
    }
    return 1; 
}

function shouldNullifySpecialAttributes(item) {
    return item.note.includes('<break-effect:null-sp-attributes>');
}

const _Game_Actor_performAction = Game_Actor.prototype.performAction;
Game_Actor.prototype.performAction = function(action) {
    _Game_Actor_performAction.call(this, action);

    let breakValue = getSkillBreakValue(action.item());

    this.equips().forEach((equip) => {
        if (equip && getItemDurability(equip) !== -1 && equip.durability > 0) {
            equip.durability = Math.max(equip.durability - breakValue, 0);
    
            if (equip.durability <= 0 && !equip._originalParams) {
                equip._originalParams = equip.params.slice();
                equip.params.fill(0);
    
                if (shouldNullifySpecialAttributes(equip)) {
                    if (equip.xparams) {
                        equip._originalXparams = equip.xparams.slice();
                        equip.xparams.fill(0);
                    } else {
                        equip.xparams = Array(10).fill(0);  
                    }
    
                    if (equip.sparams) {
                        equip._originalSparams = equip.sparams.slice();
                        equip.sparams.fill(0);
                    } else {
                        equip.sparams = Array(10).fill(0);  
                    }
    
                    if (equip.traits) {
                        equip._originalTraits = equip.traits.slice();
                        equip.traits = [];
                    } else {
                        equip.traits = [];
                    }
                }
            }
        }
    });

 };

    const _Window_Base_drawItemName = Window_Base.prototype.drawItemName;
    Window_Base.prototype.drawItemName = function(item, x, y, width) {
        if (item) {
            _Window_Base_drawItemName.call(this, item, x, y, width);
            if (getItemDurability(item) !== -1) {
                this.contents.fontSize = 14;
                this.drawText(`(${item.durability}/${getItemDurability(item)})`, x, y, width, 'right');
                this.resetFontSettings();
            }
        }
    };


    
    class Window_RepairList extends Window_Selectable {
        constructor(rect) {
            super(rect);
            this._data = [];
            this.refresh();
        }
    

        maxItems() {
            return this._data.length;
        }

        item() {
            return this._data[this.index()];
        }

        makeItemList() {
            this._data = $gameParty.allItems().filter(item => {
                return (DataManager.isWeapon(item) || DataManager.isArmor(item)) &&
                       getItemDurability(item) !== -1;
            });

            this.callHandler('loaded'); // Añadir esta línea al final

        }
        

        drawItem(index) {
            const item = this._data[index];
            const rect = this.itemRect(index);
            const repairCost = getRepairCost(item);
            const totalCost = repairCost * (getItemDurability(item) - item.durability);
            this.drawItemName(item, rect.x, rect.y, rect.width);
        }

        refresh() {
            this.makeItemList();
            this.createContents();
            this.drawAllItems();
        }
    }

    class Window_HorzCommand extends Window_Command {


        setCommandEnabled(commandName, enabled) {
            const command = this._list.find(cmd => cmd.symbol === commandName);
            if (command) {
                command.enabled = enabled;
                this.refresh();
            }
        }

        
        makeCommandList() {
            this.addCommand($plugins.filter(p => p.description.includes("Durability System for Items"))[0].parameters.repairText || "Reparar", 'repair');
            this.addCommand($plugins.filter(p => p.description.includes("Durability System for Items"))[0].parameters.cancelText || "Cancelar", 'cancel');
        }
        
    
        numVisibleRows() {
            return 1; 
        }
    
        maxCols() {
            return 2; 
        }
    }


    class Window_TotalRepairCost extends Window_Base {
        constructor(rect, repairWindow) {
            super(rect);
            this._repairWindow = repairWindow;
            this.refresh();
        }
    
        refresh() {
            this.contents.clear();
            const totalCost = this._repairWindow._data.reduce((acc, item) => {
                const repairCost = getRepairCost(item);
                return acc + repairCost * (getItemDurability(item) - item.durability);
            }, 0);
            this.drawText($plugins.filter(p => p.description.includes("Durability System for Items"))[0].parameters.totalCostText + " " + totalCost, 0, 0, this.width - this.padding * 2, 'left');
        }
    }
    

    class Scene_Repair extends Scene_MenuBase {
        
        create() {
            super.create();
            this.createRepairWindow();
            this.createCommandWindow();
            this.createTotalCostWindow();
        }

        createRepairWindow() {
            const rect = new Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight - 100);
            this._repairWindow = new Window_Repair(rect);
            this._repairWindow.setHandler('ok', this.onRepairOk.bind(this));
            this._repairWindow.setHandler('cancel', this.onRepairCancel.bind(this));
            this._repairWindow.setHandler('loaded', this.onRepairLoaded.bind(this)); // Añadir esta línea
            this.addWindow(this._repairWindow);
        }

        onRepairLoaded() {
            if (this._repairWindow._data.length === 0 || this.totalRepairCost() === 0) {
                this._commandWindow.setCommandEnabled('repair', false);
            } else {
                this._commandWindow.setCommandEnabled('repair', true);
            }
        }
        

        createCommandWindow() {
            const ww = Graphics.boxWidth * 0.6; 
            const wx = (Graphics.boxWidth - ww) / 2; 
            const wy = this._repairWindow.y + this._repairWindow.height; 
            const rect = new Rectangle(wx, wy, ww, 75); 
            this._commandWindow = new Window_HorzCommand(rect);
            this._commandWindow.setHandler('repair', this.commandRepair.bind(this));
            this._commandWindow.setHandler('cancel', this.popScene.bind(this));
            this.addWindow(this._commandWindow);
            if (this._repairWindow._data.length === 0 || this.totalRepairCost() === 0) {
                this._commandWindow.setCommandEnabled('repair', false);
            }
        }

        createTotalCostWindow() {
            const ww = Graphics.boxWidth * 0.6;
            const wx = (Graphics.boxWidth - ww) / 2;
            const wy = this._commandWindow.y - 50; 
            const rect = new Rectangle(wx, wy, ww, 50);
            this._totalCostWindow = new Window_TotalRepairCost(rect, this._repairWindow);
            this.addWindow(this._totalCostWindow);
        }
        
        totalRepairCost() {
            return this._repairWindow._data.reduce((acc, item) => {
                const repairCost = getRepairCost(item);
                return acc + repairCost * (getItemDurability(item) - item.durability);
            }, 0);
        }
        
        

        commandRepair() {
            const totalCost = this._repairWindow._data.reduce((acc, item) => {
                const repairCost = getRepairCost(item);
                return acc + repairCost * (getItemDurability(item) - item.durability);
            }, 0);
            if ($gameParty.gold() >= totalCost) {
                $gameParty.loseGold(totalCost);
                this._repairWindow._data.forEach(item => {
                    item.durability = getItemDurability(item);
                });
                this._repairWindow.refresh();
                this.popScene(); 
            } else {
                $gameMessage.add("No tienes suficiente oro para reparar los ítems.");
            }
        }
    }


  

    PluginManager.registerCommand('DurabilitySystem', 'DecreaseDurability', args => {
        let itemId = Number(args.itemId);
        let amount = Number(args.amount);
        let item = $dataItems[itemId] || $dataWeapons[itemId] || $dataArmors[itemId];
        if (item && getItemDurability(item) !== -1) {
            item.durability = Math.max((item.durability || getItemDurability(item)) - amount, 0);
            if (item.durability <= 0 && !item._originalParams) {
                item._originalParams = item.params.slice();
                item.params.fill(0);
            }
        }
    });

    PluginManager.registerCommand('DurabilitySystem', 'RepairItem', args => {
        let itemId = Number(args.itemId);
        let item = $dataItems[itemId] || $dataWeapons[itemId] || $dataArmors[itemId];
        if (item && item._originalParams) {
            item.params = item._originalParams.slice();
            delete item._originalParams;
    
            if (item._originalXparams) {
                item.xparams = item._originalXparams.slice();
                delete item._originalXparams;
            }
            if (item._originalSparams) {
                item.sparams = item._originalSparams.slice();
                delete item._originalSparams;
            }
            if (item._originalTraits) {
                item.traits = item._originalTraits.slice();
                delete item._originalTraits;
            }
    
            item.durability = getItemDurability(item);
        }
    });

    PluginManager.registerCommand('DurabilitySystem', 'ShowRepairScene', args => {
        SceneManager.push(Scene_Repair);
    });
    
    

})();
