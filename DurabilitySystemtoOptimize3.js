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
 * @text Repair Text
 * @desc Text for the "Repair" button.
 * @default Repair
 *
 * @param cancelText
 * @text Cancel Text
 * @desc Text for the "Cancel" button.
 * @default Cancel
 *
 * @param totalCostText
 * @text Total Cost Text
 * @desc Text to display the total repair cost.
 * @default Total Repair Cost:
 * @param noItemsText
 * @text No Items Text
 * @desc Text to show when there are no items in the inventory to repair.
 * @default There are no items in the inventory to repair.
 *
 * @param availableMoneyText
 * @text Available Money Text
 * @desc Text to display the player's available money.
 * @default Available Money:
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
        if (!item || !item.note) {
            return 1;
        }
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
    DataManager.extractMetadata = function (data) {
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
    Game_Actor.prototype.performAction = function (action) {
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
    Window_Base.prototype.drawItemName = function (item, x, y, width) {
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

        isTouchOkEnabled() {
            return true;
        }

        onTouch(triggered) {
            const lastIndex = this.index();
            const x = this.canvasToLocalX(TouchInput.x);
            const y = this.canvasToLocalY(TouchInput.y);
            const hitIndex = this.hitTest(x, y);
            if (hitIndex >= 0) {
                if (hitIndex === lastIndex) {
                    if (triggered && this.isTouchOkEnabled()) {
                        this.processOk();
                    }
                } else if (this.isCursorMovable()) {
                    this.select(hitIndex);
                }
            } else if (this.isCancelEnabled()) {
                this.processCancel();
            }
        }


        processOk() {
            const item = this.item();
            console.log("Item seleccionado:", item);
            if (item) {
                console.log("Durabilidad del item:", item.durability);
                console.log("Durabilidad máxima del item:", getItemDurability(item));
            }
            if (item && item.durability < getItemDurability(item)) {
                console.log("Intentando mostrar ventana de confirmación para reparación individual...");
                this._confirmWindow.setItem(item);
                this._confirmWindow.refresh();
                this._confirmWindow.show();
                this._confirmWindow.activate();
                this._confirmWindow.select(0);
                console.log("Ventana de confirmación debería estar visible ahora.");
            } else {
                console.log("Llamando al manejador predeterminado...");
                this.callOkHandler();
            }
        }




        processCancel() {
            if (this._commandWindow) {
                this.deactivate();
                this._commandWindow.activate();
            } else {
                super.processCancel();
            }
        }




        isBottomRow() {
            return this.index() >= (this.maxItems() - this.maxCols());
        }

        isTopRow() {
            return this.index() < this.maxCols();
        }

        ensureCursorVisible() {
            const row = this.row();
            if (row < this.topRow()) {
                this.setTopRow(row);
            } else if (row >= this.topRow() + this.visibleRows() - 1) {
                this.setTopRow(row - this.visibleRows() + 2);
            }
        }


        setCommandWindow(commandWindow) {
            this._commandWindow = commandWindow;
        }

        cursorDown(wrap) {
            console.log("Intentando desplazarse hacia abajo...");
            if (this.index() < this.maxItems() - 1) {
                super.cursorDown(false);
            }
            this.ensureCursorVisible();
        }

        cursorUp(wrap) {
            console.log("Intentando desplazarse hacia arriba...");
            if (this.index() > 0) {
                super.cursorUp(false);
            }
            this.ensureCursorVisible();
        }


        visibleRows() {
            return 5;
        }

        maxCols() {
            return 1;
        }

        itemHeight() {
            return this.lineHeight() * 1;
        }

        maxItems() {
            return this._data ? this._data.length : 0;
        }

        item() {
            return this._data[this.index()];
        }

        makeItemList() {
            this._data = $gameParty.allItems().filter(item => {
                return (DataManager.isWeapon(item) || DataManager.isArmor(item)) &&
                    getItemDurability(item) !== -1;
            });
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
            if (this._data.length === 0) {
                this.contents.fontSize *= 0.8;
                this.drawText($plugins.filter(p => p.description.includes("Durability System for Items"))[0].parameters.noItemsText || "No hay objetos en el inventario para reparar", 0, this.contents.height / 2 - this.lineHeight() / 2, this.contents.width, 'center');
                this.resetFontSettings();
            } else {
                this.drawAllItems();
            }
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



        isCommandEnabled(index) {
            if (index === 0) {
                if (!this._item) {
                    return false;
                }
                const repairCostPerPoint = getRepairCost(this._item);
                const repairAmount = getItemDurability(this._item) - this._item.durability;
                const totalRepairCost = repairCostPerPoint * repairAmount;
                const playerGold = $gameParty.gold();

                return playerGold >= totalRepairCost && repairAmount > 0;
            }
            return true;
        }




        processCursorMove() {
            if (this.isCursorMovable()) {
                const lastIndex = this.index();
                if (Input.isTriggered('up') && this._repairWindow && this._repairWindow.maxItems() > 0) {
                    this.deactivate();
                    this._repairWindow.activate();
                    this._repairWindow.select(this._repairWindow.maxItems() - 1);
                } else if (Input.isTriggered('down') && this._repairWindow && this._repairWindow.maxItems() > 0) {
                    this.deactivate();
                    this._repairWindow.activate();
                    this._repairWindow.select(0);
                } else {
                    super.processCursorMove();
                }
            }
        }


        makeCommandList() {
            const plugin = $plugins.find(p => p.description.includes("Durability System for Items"));

            if (plugin && plugin.parameters) {
                const repairText = plugin.parameters["repairText"] || "Reparar";
                const cancelText = plugin.parameters["cancelText"] || "Cancelar";

                this.addCommand(repairText, 'repair', this.isRepairEnabled());
                this.addCommand(cancelText, 'cancel');
            }
        }

        isRepairEnabled() {
            console.log("Verificando si el botón de reparar está habilitado...");

            if (!this._repairWindow || !this._repairWindow._data) {
                console.log("El _repairWindow no está definido o no tiene datos.");
                return false;
            }

            const totalCost = this._repairWindow._data.reduce((acc, item) => {
                const repairCost = getRepairCost(item);
                return acc + repairCost * (getItemDurability(item) - item.durability);
            }, 0);

            console.log("Costo total de reparación:", totalCost);
            console.log("Oro del jugador:", $gameParty.gold());

            const hasItemsToRepair = $gameParty.allItems().some(item => {
                return (DataManager.isWeapon(item) || DataManager.isArmor(item)) &&
                    item.durability !== undefined &&
                    item.durability < getItemDurability(item);
            });

            console.log("¿Hay ítems para reparar?", hasItemsToRepair);

            const canAfford = $gameParty.gold() >= totalCost;
            console.log("¿El jugador puede pagar?", canAfford);

            return hasItemsToRepair && canAfford;
        }

        numVisibleRows() {
            return 1;
        }

        maxCols() {
            return 2;
        }
    }

    class Scene_Repair extends Scene_MenuBase {

        create() {
            super.create();
            this.createRepairWindow();
            this.createCommandWindow();
            this.createTotalCostWindow();
            this.createConfirmWindow();
            this._repairWindow._confirmWindow = this._confirmWindow;
            this._confirmWindow.deactivate();
            this._confirmWindow.deselect();
        }

        update() {
            super.update();
            if (this._confirmWindow.visible && this._confirmWindow.active) {
                if (Input.isTriggered('cancel')) {
                    this.onConfirmCancel();
                } else if (Input.isTriggered('ok')) {
                    this.onConfirmOk();
                }
                return;
            }


            if (Input.isTriggered('cancel')) {
                if (this._commandWindow.active) {
                    this.popScene();
                } else if (this._repairWindow.active) {
                    this._repairWindow.deactivate();
                    this._commandWindow.activate();
                }
            } else if (Input.isTriggered('ok')) {
                if (this._repairWindow.active) {
                    this.onRepairOk();
                } else if (this._commandWindow.active && this._commandWindow.currentSymbol() === 'cancel') {
                    this.popScene();
                }
            } else if (Input.isTriggered('left') || Input.isTriggered('right')) {
                if (!this._commandWindow.active) {
                    this._commandWindow.activate();
                    this._repairWindow.deactivate();
                }
            }
        }

        createRepairWindow() {
            const ww = Graphics.boxWidth * 0.75;
            const wh = Graphics.boxHeight * 0.70;
            const wx = (Graphics.boxWidth - ww) / 2;
            const wy = (Graphics.boxHeight - wh) / 2;
            const rect = new Rectangle(wx, wy, ww, wh - 120);
            this._repairWindow = new Window_RepairList(rect);
            this._repairWindow._commandWindow = this._commandWindow;

            this.addWindow(this._repairWindow);
            if (this._commandWindow) {
                this._commandWindow._repairWindow = this._repairWindow;
            }
        }

        createCommandWindow() {
            const ww = Graphics.boxWidth * 0.75;
            const wx = (Graphics.boxWidth - ww) / 2;
            const wy = 105 + this._repairWindow.y + this._repairWindow.height;
            const rect = new Rectangle(wx, wy, ww, 75);
            this._commandWindow = new Window_HorzCommand(rect);
            this._commandWindow.setHandler('repair', this.commandRepair.bind(this));
            this._commandWindow.setHandler('cancel', this.popScene.bind(this));
            this.addWindow(this._commandWindow);
            this._commandWindow._repairWindow = this._repairWindow;
            this._commandWindow.refresh();

            if (this._repairWindow && this._repairWindow._data.length === 0) {
                console.log("No hay ítems en _repairWindow._data");
                this._commandWindow.setCommandEnabled('repair', false);
            } else {
                console.log("Hay ítems en _repairWindow._data");
            }
        }

        createTotalCostWindow() {
            const ww = Graphics.boxWidth * 0.75;
            const wx = (Graphics.boxWidth - ww) / 2;
            const wy = this._commandWindow.y - 100;
            const rect = new Rectangle(wx, wy, ww, 95);
            this._totalCostWindow = new Window_TotalRepairCost(rect, this._repairWindow);
            this.addWindow(this._totalCostWindow);
        }

        totalRepairCost() {
            return this._repairWindow._data.reduce((acc, item) => {
                const repairCost = getRepairCost(item);
                return acc + repairCost * (getItemDurability(item) - item.durability);
            }, 0);
        }

        createConfirmWindow() {
            const ww = 400;
            const wh = this.calcWindowHeight(3, true);
            const wx = (Graphics.boxWidth - ww) / 2;
            const wy = (Graphics.boxHeight - wh) / 2;
            const rect = new Rectangle(wx, wy, ww, wh);
            this._confirmWindow = new Window_RepairConfirm(rect);
            this._confirmWindow.setHandler('confirm', this.onConfirmOk.bind(this));
            this._confirmWindow.setHandler('cancel', this.onConfirmCancel.bind(this));
            this.addWindow(this._confirmWindow);
            this._confirmWindow.hide();
        }

        onConfirmOk() {
            const item = this._repairWindow.item();
            const repairCost = getRepairCost(item);
            const repairAmount = getItemDurability(item) - item.durability;
            const totalCost = repairCost * repairAmount;

            if (item && $gameParty.gold() >= totalCost) {
                $gameParty.loseGold(totalCost);
                item.durability = getItemDurability(item);
                this._repairWindow.refresh();
                this._confirmWindow.hide();
                this._totalCostWindow.refresh();

                this._repairWindow.activate();
            } else {
                this.onConfirmCancel();
            }
        }


        onConfirmCancel() {
            this._confirmWindow.hide();
            this._repairWindow.refresh();
            this._repairWindow.activate();
        }




        onRepairOk() {
            const item = this._repairWindow.item();
            console.log("Item seleccionado:", item);
            if (item) {
                this._commandWindow.setItem(item);
                this._repairWindow.deactivate();
                this._commandWindow.deactivate();
                this._confirmWindow.setItem(item);
                this._confirmWindow.refresh();
                this._confirmWindow.show();
                this._confirmWindow.activate();
                this._confirmWindow.select(0);
            } else {
                console.error("No se seleccionó ningún ítem.");
            }
        }


        commandRepair() {

            if (this._repairWindow._data.length > 0) {
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
            } else {

                $gameMessage.add("No hay objetos en el inventario para reparar.");
            }
        }

        start() {
            super.start();
            this._commandWindow.activate();
            this._commandWindow.select(0);
        }
    }



    class Window_RepairConfirm extends Window_Command {
        constructor() {
            const x = 0;
            const y = 0;
            const width = Graphics.boxWidth;
            const height = Graphics.boxHeight;
            super(new Rectangle(x, y, width, height));
            this._item = null;
            this.contents.fontSize = 26;
        }

        makeCommandList() {
            this.addCommand("Sí", 'confirm');
            this.addCommand('No', 'cancel');
        }


        canRepairItem(item) {
            const repairCost = getRepairCost(item);
            const repairAmount = getItemDurability(item) - item.durability;
            const totalCost = repairCost * repairAmount;
            return $gameParty.gold() >= totalCost && repairAmount > 0;
        }


        setItem(item) {
            this._item = item;
            this.refresh();
        }


        drawBackground() {
            if (this._item) {
                const repairCostPerPoint = getRepairCost(this._item);
                const repairAmount = getItemDurability(this._item) - this._item.durability;
                const totalRepairCost = repairCostPerPoint * repairAmount;
                const playerGold = $gameParty.gold();
                const centerY = this.contents.height / 2;

                this.drawText(`Seleccionaste:`, 0, centerY - this.lineHeight() * 5, this.contents.width, 'center');

                this.drawIcon(this._item.iconIndex, (this.contents.width - this.textWidth(this._item.name) - 64) / 2, centerY - this.lineHeight() * 4 + 25);
                this.drawText(this._item.name, (this.contents.width - this.textWidth(this._item.name)) / 2 + 32, centerY - this.lineHeight() * 4 + 25, this.contents.width, 'left');

                this.contents.fontSize = 22;
                this.drawText(`- Costo de reparación individual: ${totalRepairCost}`, 0, centerY - this.lineHeight(), this.contents.width, 'left');
                this.drawText(`- Tienes: ${playerGold}`, 0, centerY, this.contents.width, 'left');

                this.contents.fontSize = 24;
                this.drawText("¿De verdad quieres reparar este objeto?", 0, centerY + this.lineHeight() * 2, this.contents.width, 'center');
            }
        }


        refresh() {
            super.refresh();
            this.drawBackground();
        }

        itemRect(index) {
            const rect = super.itemRect(index);
            rect.y += this.contents.height / 4 * 3;
            rect.width = this.contents.width / 3;
            rect.x = (this.contents.width - rect.width) / 2;
            return rect;
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
            this.contents.fontSize *= 0.8;
            this.drawText($plugins.filter(p => p.description.includes("Durability System for Items"))[0].parameters.totalCostText + " " + totalCost, 0, 0, this.width - this.padding * 2, 'left');

            const availableMoneyText = $plugins.filter(p => p.description.includes("Durability System for Items"))[0].parameters.availableMoneyText || "Dinero Disponible:";
            this.drawText(availableMoneyText, 0, this.lineHeight(), this.width - this.padding * 2 - 100, 'left');
            this.drawText($gameParty.gold(), this.textWidth(availableMoneyText) + 10, this.lineHeight(), this.width - this.padding * 2, 'left');

            this.resetFontSettings();
        }
    }

    PluginManager.registerCommand('DurabilitySystem', 'DecreaseDurability', args => {
        let amount = Number(args.amount);


        const decreaseItemDurability = (item) => {
            if (item && getItemDurability(item) !== -1) {
                item.durability = Math.max((item.durability || getItemDurability(item)) - amount, 0);
                if (item.durability <= 0 && !item._originalParams) {
                    item._originalParams = item.params.slice();
                    item.params.fill(0);
                }
            }
        };

        for (let itemId in $gameParty._items) {
            let item = $dataItems[itemId];
            decreaseItemDurability(item);
        }

        for (let itemId in $gameParty._weapons) {
            let weapon = $dataWeapons[itemId];
            decreaseItemDurability(weapon);
        }

        for (let itemId in $gameParty._armors) {
            let armor = $dataArmors[itemId];
            decreaseItemDurability(armor);
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
