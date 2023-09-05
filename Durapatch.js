/*:
 * @plugindesc Patch extension to enhance the functionality of DurabilityMZ.js. Ensure this patch is placed BELOW DurabilityMZ.js in the plugin list.
 * @author Undermax Games | Maxii1996
 * @url https://undermax.itch.io/
 * @target MZ
 * @requiredAssets DurabilityMZ.js
 * @orderAfter DurabilityMZ.js
 * 
 * @help
 * This plugin is an extension to the DurabilityMZ.js plugin. It provides additional 
 * features and enhancements to improve the durability system in your game.
 * 
 * Ensure that this patch is placed below DurabilityMZ.js in the plugin list.
 *
 * @command retirarArma
 * @text Retirar Arma
 * @desc Retira una cantidad específica de armas basado en ID.
 *
 * @arg weaponId
 * @type weapon
 * @text ID de Arma
 * @desc El ID de la arma que quieres retirar.
 *
 * @arg amount
 * @type number
 * @text Cantidad a retirar
 * @desc La cantidad de armas que quieres retirar.
 * @default 1
 *
 * @arg includeInventory
 * @type boolean
 * @text Incluir Inventario
 * @desc ¿Incluir armas en el inventario al retirar?
 * @default true
 *
 * @arg onlyUndamaged
 * @type boolean
 * @text Quitar solo no dañados
 * @desc ¿Quitar solo armas que no estén dañadas?
 * @default false
*/


var Imported = Imported || {};
Imported.DurabilityPatch_IndependentItems = true;

var UndermaxGames = UndermaxGames || {};
UndermaxGames.DP = UndermaxGames.DP || {};
UndermaxGames.DP.version = 1.00;
UndermaxGames.DP.parameters = PluginManager.parameters('DurabilityPatch_IndependentItems');


{
    const _DP_DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DP_DataManager_createGameObjects.call(this);
        $gameDurabilityItems = new Game_DurabilityItems();
    };
    

    const _DP_DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        const contents = _DP_DataManager_makeSaveContents.call(this);
        contents.durabilityItems = $gameDurabilityItems;
        return contents;
    };

    const _DP_DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DP_DataManager_extractSaveContents.call(this, contents);
        $gameDurabilityItems = contents.durabilityItems;
    };
}

function Game_DurabilityItems() {
    this.initialize(...arguments);
}

Game_DurabilityItems.prototype.initialize = function() {
    this._durabilityId = this.getLimitedInventoryDurabilityIds();
    this._durabilityItems = $dataItems;
    this._durabilityWeapons = $dataWeapons;
    this._durabilityArmors = $dataArmors;
};

Game_DurabilityItems.prototype.getLimitedInventoryDurabilityIds = function() {
    if(this.limitedInvPluginCheck()) {
        if(this.coreShopPluginCheck()) {
            num = $gameShop._durabilityId;
        } else {
            num = $gameContainers._durabilityId;
        }
        return num;
    } else {
        return 9999;
    }
};

Game_DurabilityItems.prototype.getItemDatabaseEntries = function() {
    let i = 0;
    while(i <= 9999) {
        this._durabilityItems[i] = $dataItems[i];
        i++;
    }
    return this._durabilityItems;
};

Game_DurabilityItems.prototype.getWeaponDatabaseEntries = function() {
    let i = 0;
    while(i <= 9999) {
        this._durabilityWeapons[i] = $dataWeapons[i];
        i++;
    }
    return this._durabilityWeapons;
};

Game_DurabilityItems.prototype.getArmorDatabaseEntries = function() {
    let i = 0;
    while(i <= 9999) {
        this._durabilityArmors[i] = $dataArmors[i];
        i++;
    }
    return this._durabilityArmors;
};

Game_DurabilityItems.prototype.limitedInvPluginCheck = function() {
    return $plugins.find(plugin => plugin.name == "")?.status || false;
};

Game_DurabilityItems.prototype.coreShopPluginCheck = function() {
    return $plugins.find(plugin => plugin.name == "")?.status || false;
};


{
    Game_Interpreter.prototype.command126 = function(params) {
        const item = $dataItems[params[0]];
        if(item && item.meta.durability) {
            this.processDurabilityItem(item, params);
        } else {
            this.processNormalItem(item, params);
        }
        return true;
    };

    Game_Interpreter.prototype.command127 = function(params) {
        const weapon = $dataWeapons[params[0]];
        if(weapon && weapon.meta.durability) {
            this.processDurabilityWeapon(weapon, params);
        } else {
            this.processNormalWeapon(weapon, params);
        }
        return true;
    };

    Game_Interpreter.prototype.command128 = function(params) {
        const armor = $dataArmors[params[0]];
        if(armor && armor.meta.durability) {
            this.processDurabilityArmor(armor, params);
        } else {
            this.processNormalArmor(armor, params);
        }
        return true;
    };

    Game_Interpreter.prototype.processDurabilityItem = function(item, params) {
        let value = this.operateValue(params[1], params[2], params[3]);
        while(value > 0) {
            const obj = JsonEx.makeDeepCopy(item);
            obj.id = $gameDurabilityItems._durabilityId++;
            obj.originalId = item.id;
            initializeDurability(obj);
            $gameDurabilityItems._durabilityItems[$gameDurabilityItems._durabilityId-1] = obj;
            $dataItems[$gameDurabilityItems._durabilityId-1] = obj;
            $gameParty.gainItem($gameDurabilityItems._durabilityItems[$gameDurabilityItems._durabilityId-1], 1, params[4]);
            value--;
        }
    };

    Game_Interpreter.prototype.processNormalItem = function(item, params) {
        const value = this.operateValue(params[1], params[2], params[3]);
        $gameParty.gainItem(item, value, params[4]);
    };

    Game_Interpreter.prototype.processNormalItem = function(item, params) {
        const value = this.operateValue(params[1], params[2], params[3]);
        $gameParty.gainItem(item, value, params[4]);
    };

    Game_Interpreter.prototype.processDurabilityWeapon = function(weapon, params) {
        let value = this.operateValue(params[1], params[2], params[3]);
        while(value > 0) {
            const obj = JsonEx.makeDeepCopy(weapon);
            obj.id = $gameDurabilityItems._durabilityId++;
            obj.originalId = weapon.id;
            initializeDurability(obj, true); 
            $gameDurabilityItems._durabilityWeapons[$gameDurabilityItems._durabilityId-1] = obj;
            $dataWeapons[$gameDurabilityItems._durabilityId-1] = obj;
            $gameParty.gainItem($gameDurabilityItems._durabilityWeapons[$gameDurabilityItems._durabilityId-1], 1, params[4]);
            value--;
        }
    };

    Game_Interpreter.prototype.processNormalWeapon = function(weapon, params) {
        const value = this.operateValue(params[1], params[2], params[3]);
        $gameParty.gainItem(weapon, value, params[4]);
    };

    Game_Interpreter.prototype.processDurabilityArmor = function(armor, params) {
        let value = this.operateValue(params[1], params[2], params[3]);
        while(value > 0) {
            const obj = JsonEx.makeDeepCopy(armor);
            obj.id = $gameDurabilityItems._durabilityId++;
            obj.originalId = armor.id;
            initializeDurability(obj, true); 
            $gameDurabilityItems._durabilityArmors[$gameDurabilityItems._durabilityId-1] = obj;
            $dataArmors[$gameDurabilityItems._durabilityId-1] = obj;
            $gameParty.gainItem($gameDurabilityItems._durabilityArmors[$gameDurabilityItems._durabilityId-1], 1, params[4]);
            value--;
        }
    };

    Game_Interpreter.prototype.processNormalArmor = function(armor, params) {
        const value = this.operateValue(params[1], params[2], params[3]);
        $gameParty.gainItem(armor, value, params[4]);
    };
}

{
    const _DP_SceneMap_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _DP_SceneMap_start.call(this);
        $dataItems = $gameDurabilityItems.getItemDatabaseEntries();
        $dataWeapons = $gameDurabilityItems.getWeaponDatabaseEntries();
        $dataArmors = $gameDurabilityItems.getArmorDatabaseEntries();
    };
}

{
    const _DP_SceneShop_doBuy = Scene_Shop.prototype.doBuy;
    Scene_Shop.prototype.doBuy = function(number) {
        if(this._item.meta.durability) {
            this.processDurabilityShopItem(number);
        } else {
            _DP_SceneShop_doBuy.call(this, number);
        }
    };

    Scene_Shop.prototype.processDurabilityShopItem = function(number) {
        $gameParty.loseGold(number * this.buyingPrice());
        while(number > 0) {
            const obj = JsonEx.makeDeepCopy(this._item);
            obj.id = $gameDurabilityItems._durabilityId++;
            obj.originalId = this._item.id;
            if(this._item.etypeId === undefined) {
                $gameDurabilityItems._durabilityItems[$gameDurabilityItems._durabilityId-1] = obj;
                $dataItems[$gameDurabilityItems._durabilityId-1] = obj;
                $gameParty.gainItem($gameDurabilityItems._durabilityItems[$gameDurabilityItems._durabilityId-1], 1);
            } else if(this._item.etypeId === 1) {
                $gameDurabilityItems._durabilityWeapons[$gameDurabilityItems._durabilityId-1] = obj;
                $dataWeapons[$gameDurabilityItems._durabilityId-1] = obj;
                $gameParty.gainItem($gameDurabilityItems._durabilityWeapons[$gameDurabilityItems._durabilityId-1], 1);
            } else if(this._item.etypeId > 1) {
                $gameDurabilityItems._durabilityArmors[$gameDurabilityItems._durabilityId-1] = obj;
                $dataArmors[$gameDurabilityItems._durabilityId-1] = obj;
                $gameParty.gainItem($gameDurabilityItems._durabilityArmors[$gameDurabilityItems._durabilityId-1], 1);
            }
            number--;
        }
    };
}

{
    Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
        if(item && item.meta.durability) {
            this.drawDurabilityItemNumber(item, x, y, width);
        } else {
            this.drawNormalItemNumber(item, x, y, width);
        }
    };
    

    Window_ItemList.prototype.drawDurabilityItemNumber = function(item, x, y, width) {
        if (UndermaxGames.DP.independentItemsAmountText && this.needsNumber()) {
            this.drawText(":", x, y, width - this.textWidth("00"), "right");
            this.drawText($gameParty.numItems(item), x, y, width, "right");
        }
    };
    

    Window_ItemList.prototype.drawNormalItemNumber = function(item, x, y, width) {
        if (this.needsNumber()) {
            this.drawText(":", x, y, width - this.textWidth("00"), "right");
            this.drawText($gameParty.numItems(item), x, y, width, "right");
        }
    };
}

Game_Party.prototype.loseItem = function(item, amount, includeEquip) {
    if (item && item.meta.durability) {
        this.loseDurabilityItem(item, amount, includeEquip);
    } else {
        this.loseNormalItem(item, amount, includeEquip);
    }
};

Game_Party.prototype.loseDurabilityItem = function(item, amount, includeEquip) {
    const container = this.itemContainer(item);
    if (container && container[item.id]) {
        const lastNumber = this.numItems(item);
        const newNumber = lastNumber - amount;
        container[item.id] = newNumber.clamp(0, this.maxItems(item));
        if (container[item.id] === 0) {
            delete container[item.id];
        }
        if (includeEquip && newNumber === 0) {
            this.discardMembersEquip(item, lastNumber);
        }
        $gameMap.requestRefresh();
    }
};

Game_Party.prototype.loseNormalItem = function(item, amount, includeEquip) {
    const container = this.itemContainer(item);
    if (container && container[item.id]) {
        const lastNumber = this.numItems(item);
        const newNumber = lastNumber - amount;
        container[item.id] = newNumber.clamp(0, this.maxItems(item));
        if (includeEquip && newNumber === 0) {
            this.discardMembersEquip(item, lastNumber);
        }
        $gameMap.requestRefresh();
    }
};


PluginManager.registerCommand('DurabilityPatch', 'Retirar Arma', args => {
    const weaponId = Number(args.weaponId);
    const amountToRemove = Number(args.amount);
    const includeEquipped = args.includeEquipped === 'true';
    const onlyUndamaged = args.onlyUndamaged === 'true';

    console.log(`Intentando retirar: ${$dataWeapons[weaponId].name}`);
    console.log(`Cantidad a retirar: ${amountToRemove}`);
    console.log(`Incluir equipados: ${includeEquipped}`);
    console.log(`Solo no dañados: ${onlyUndamaged}`);

    let removedCount = 0;

    $gameParty.allItems().forEach(item => {
        if (item && item.etypeId === 1 && (item.name.includes($dataWeapons[weaponId].name) || item.originalName === $dataWeapons[weaponId].name)) {
            if (onlyUndamaged && item.durability < item.maxDurability) {
                console.log(`Objeto ${item.name} está dañado. No se retira.`);
                return;
            }

            const inInventoryCount = $gameParty.numItems(item);
            if (inInventoryCount > 0 && removedCount < amountToRemove) {
                const toRemove = Math.min(inInventoryCount, amountToRemove - removedCount);
                $gameParty.loseItem(item, toRemove, includeEquipped);
                removedCount += toRemove;
                console.log(`Retirado ${toRemove} de ${item.name}. Total retirado: ${removedCount}`);
            }
        }
    });

    if (removedCount < amountToRemove) {
        console.warn(`No se pudo retirar la cantidad solicitada. Se retiraron ${removedCount} de ${amountToRemove}.`);
    } else {
        console.log(`Se retiraron exitosamente ${removedCount} objetos.`);
    }
});
