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
 * @command RepairItem
 * @text Repair Item
 * @desc Repair an item, weapon, or armor.
 * 
 * @arg itemType
 * @type select
 * @text Type
 * @desc Type of item to be repaired.
 * @option Item
 * @value item
 * @option Weapon
 * @value weapon
 * @option Armor
 * @value armor
 * 
 * @arg itemId
 * @type number
 * @text ID
 * @desc ID of the item, weapon, or armor to be repaired.
 * 
 * @arg repairCost
 * @type number
 * @text Repair Cost
 * @desc Cost per durability point to repair.
 */

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

})();

