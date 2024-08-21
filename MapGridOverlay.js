/*:
 * @target MZ
 * @plugindesc Customizable grid overlay for RPG Maker MZ. Shows a grid on the map with configurable options such as color, opacity, coordinates display, etc
 * @author Undermax Games | Maxii1996
 * @url https://undermax.itch.io/
 * 
 * @param Grid Width
 * @text Grid Cell Width
 * @desc Width of each grid cell in pixels.
 * @default 48
 * @type number
 * 
 * @param Grid Height
 * @text Grid Cell Height
 * @desc Height of each grid cell in pixels.
 * @default 48
 * @type number
 * 
 * @param Grid Opacity
 * @text Grid Opacity
 * @desc Opacity of the grid lines (0-255).
 * @default 128
 * @type number
 * 
 * @param Grid Color
 * @text Grid Line Color
 * @desc Color of the grid lines (CSS color format).
 * @default #ffffff
 * @type string
 * 
 * @param Fill Grid
 * @text Fill Grid
 * @desc Whether to fill the grid cells with a background color.
 * @default false
 * @type boolean
 * 
 * @param Fill Color
 * @text Fill Color
 * @desc Background color for the grid cells (CSS color format).
 * @default #000000
 * @type string
 * 
 * @param Fill Opacity
 * @text Fill Opacity
 * @desc Opacity of the background fill (0-255).
 * @default 64
 * @type number
 * 
 * @param Show Coordinates
 * @text Show Coordinates
 * @desc Whether to display X:Y coordinates in the center of each cell.
 * @default false
 * @type boolean
 * 
 * @param Coordinates Color
 * @text Coordinates Color
 * @desc Color of the coordinates text (CSS color format).
 * @default #ff0000
 * @type string
 * 
 * @param Coordinates Size
 * @text Coordinates Size
 * @desc Font size of the coordinates text.
 * @default 12
 * @type number
 * 
 * @param Highlight Impassable
 * @text Highlight Impassable Tiles
 * @desc Whether to highlight impassable tiles with a different color.
 * @default false
 * @type boolean
 * 
 * @param Impassable Color
 * @text Impassable Tile Color
 * @desc Color used to highlight impassable tiles (CSS color format).
 * @default #ff0000
 * @type string
 * 
 * @param Impassable Opacity
 * @text Impassable Tile Opacity
 * @desc Opacity of the impassable tile highlight (0-255).
 * @default 128
 * @type number
 * 
 * @command ToggleGrid
 * @text Toggle Grid
 * @desc Toggles the visibility of the grid overlay on the map.
 * 
 * @help
 * This plugin displays a customizable grid overlay on the map during gameplay.
 * 
 */

(() => {
    const pluginName = "MapGridOverlay";
    const parameters = PluginManager.parameters(pluginName);
    const gridWidth = Number(parameters['Grid Width'] || 48);
    const gridHeight = Number(parameters['Grid Height'] || 48);
    const gridOpacity = Number(parameters['Grid Opacity'] || 128);
    const gridColor = String(parameters['Grid Color'] || '#ffffff');
    const fillGrid = parameters['Fill Grid'] === 'true';
    const fillColor = String(parameters['Fill Color'] || '#000000');
    const fillOpacity = Number(parameters['Fill Opacity'] || 64);
    const showCoordinates = parameters['Show Coordinates'] === 'true';
    const coordinatesColor = String(parameters['Coordinates Color'] || '#ff0000');
    const coordinatesSize = Number(parameters['Coordinates Size'] || 12);
    const highlightImpassable = parameters['Highlight Impassable'] === 'true';
    const impassableColor = String(parameters['Impassable Color'] || '#ff0000');
    const impassableOpacity = Number(parameters['Impassable Opacity'] || 128);

    let gridVisible = false;

    PluginManager.registerCommand(pluginName, "ToggleGrid", () => {
        gridVisible = !gridVisible;
    });

    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function () {
        _Spriteset_Map_createLowerLayer.call(this);
        this.createGridOverlay();
    };

    Spriteset_Map.prototype.createGridOverlay = function () {
        this._gridSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this._gridSprite.opacity = gridOpacity;
        this._gridSprite.visible = gridVisible;
        this.addChild(this._gridSprite);
        this.refreshGrid();
    };


    Spriteset_Map.prototype.isTileImpassable = function (tileX, tileY) {
        const x = tileX;
        const y = tileY;

        if (!$gameMap.isPassable(x, y, 2) &&
            !$gameMap.isPassable(x, y, 4) &&
            !$gameMap.isPassable(x, y, 6) &&
            !$gameMap.isPassable(x, y, 8)) {
            return true;
        }

        const events = $gameMap.eventsXy(x, y);
        for (const event of events) {
            if (event._priorityType === 1 && !event.isThrough()) {
                return true;
            }
        }

        return false;
    };

    Spriteset_Map.prototype.refreshGrid = function () {
        const bitmap = this._gridSprite.bitmap;
        bitmap.clear();
        if (gridVisible) {
            const width = Graphics.width;
            const height = Graphics.height;
            const dx = $gameMap.displayX() * $gameMap.tileWidth();
            const dy = $gameMap.displayY() * $gameMap.tileHeight();
            const startX = -Math.floor(dx % gridWidth);
            const startY = -Math.floor(dy % gridHeight);

            for (let x = startX; x < width; x += gridWidth) {
                for (let y = startY; y < height; y += gridHeight) {
                    const tileX = Math.floor((x + dx) / gridWidth);
                    const tileY = Math.floor((y + dy) / gridHeight);

                    if (highlightImpassable && this.isTileImpassable(tileX, tileY)) {
                        bitmap.paintOpacity = impassableOpacity;
                        bitmap.fillRect(x, y, gridWidth, gridHeight, impassableColor);
                    } else if (fillGrid) {
                        bitmap.paintOpacity = fillOpacity;
                        bitmap.fillRect(x, y, gridWidth, gridHeight, fillColor);
                    }

                    bitmap.paintOpacity = gridOpacity;
                    bitmap.fillRect(x, y, 1, gridHeight, gridColor);
                    bitmap.fillRect(x, y, gridWidth, 1, gridColor);

                    if (showCoordinates) {
                        bitmap.fontSize = coordinatesSize;
                        bitmap.textColor = coordinatesColor;
                        const text = `${tileX}:${tileY}`;
                        bitmap.drawText(text, x, y, gridWidth, gridHeight, 'center');
                    }
                }
            }

            bitmap.fillRect(startX + Math.floor(width / gridWidth) * gridWidth, startY, 1, height, gridColor);
            bitmap.fillRect(startX, startY + Math.floor(height / gridHeight) * gridHeight, width, 1, gridColor);
        }
    };

    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        _Spriteset_Map_update.call(this);
        if (this._gridSprite) {
            this._gridSprite.visible = gridVisible;
            this.refreshGrid();
        }
    };
})();
