/*:
 * @target MZ
 * @plugindesc Plugin to display 3D images on the map
 * @author Maxii1996 | Undermax Games
 * @url https://undermax.itch.io/
 *
 * @help
 * Use the plugin command "Show 3D Image" to display a 3D image.
 * Use the plugin command "Remove Image" to remove the image by its ID.
 *
 * @command show3DImage
 * @text Show 3D Image
 * @desc Show a 3D image on the map.
 *
 * @arg imageId
 * @type number
 * @min -999999
 * @text Image ID
 * @desc The ID of the image.
 *
 * @arg imageName
 * @type file
 * @dir img/pictures
 * @text Image Name
 * @desc The name of the image file.
 *
 * @arg sizeMode
 * @type select
 * @text Size Mode
 * @desc Choose whether to use automatic or custom size.
 * @option Automatic
 * @option Custom
 * @default Automatic
 *
 * @arg customWidth
 * @type number
 * @min -999999
 * @text Custom Width
 * @desc The custom width of the image.
 *
 * @arg customHeight
 * @type number
 * @min -999999
 * @text Custom Height
 * @desc The custom height of the image.
 *
 * @arg tilt
 * @type number
 * @min -999999
 * @text Tilt
 * @desc The tilt of the image to simulate perspective.
 *
 * @arg mirrorX
 * @type boolean
 * @text Mirror X
 * @desc Mirror the image horizontally.
 * @default false
 *
 * @arg mirrorY
 * @type boolean
 * @text Mirror Y
 * @desc Mirror the image vertically.
 * @default false
 *
 * @arg smoothing
 * @type boolean
 * @text Smoothing
 * @desc Apply smoothing to the image.
 * @default true
 *
 * @arg glowColor
 * @type text
 * @text Glow Color
 * @desc The color of the glow effect (e.g., #FF0000).
 *
 * @arg glowIntensity
 * @type number
 * @min -999999
 * @text Glow Intensity
 * @desc The intensity of the glow effect.
 *
 * @arg shadowX
 * @type number
 * @min -999999
 * @text Shadow X
 * @desc The X position of the shadow.
 *
 * @arg shadowY
 * @type number
 * @min -999999
 * @text Shadow Y
 * @desc The Y position of the shadow.
 *
 * @arg shadowColor
 * @type text
 * @text Shadow Color
 * @desc The color of the shadow (e.g., #000000).
 *
 * @arg borderColor
 * @type text
 * @text Border Color
 * @desc The color of the border (e.g., #000000).
 *
 * @arg borderSize
 * @type number
 * @min -999999
 * @text Border Size
 * @desc The size of the border.
 *
 * @arg animationEnabled
 * @type boolean
 * @text Animation Enabled
 * @desc Enable or disable the breathing animation.
 * @default false
 *
 * @arg animationIntensity
 * @type number
 * @min -999999
 * @text Animation Intensity
 * @desc The intensity of the breathing animation.
 *
 * @arg animationSpeed
 * @type number
 * @min -999999
 * @text Animation Speed
 * @desc The speed of the breathing animation.
 *
 * @arg x
 * @type number
 * @min -999999
 * @text X Position
 * @desc The X position of the image.
 *
 * @arg y
 * @type number
 * @min -999999
 * @text Y Position
 * @desc The Y position of the image.
 *
 * @arg z
 * @type number
 * @min -999999
 * @text Z Position
 * @desc The Z position of the image.
 *
 * @command removeImage
 * @text Remove Image
 * @desc Remove the image by its ID.
 *
 * @arg imageId
 * @type number
 * @min -999999
 * @text Image ID
 * @desc The ID of the image to remove.
 */

var $3DImages = $3DImages || [];

PluginManager.registerCommand('Simple3DImage', 'show3DImage', args => {
    console.log("Showing 3D Image:", args);
    const imageId = Number(args.imageId);
    const imageName = String(args.imageName);
    const sizeMode = String(args.sizeMode);
    const customWidth = Number(args.customWidth);
    const customHeight = Number(args.customHeight);
    const tilt = Number(args.tilt);
    const mirrorX = args.mirrorX === "true";
    const mirrorY = args.mirrorY === "true";
    const smoothing = args.smoothing === "true";
    const glowColor = args.glowColor ? parseInt(args.glowColor.replace("#", "0x")) : null;
    const glowIntensity = Number(args.glowIntensity);
    const shadowX = Number(args.shadowX);
    const shadowY = Number(args.shadowY);
    const shadowColor = args.shadowColor ? parseInt(args.shadowColor.replace("#", "0x")) : null;
    const borderColor = args.borderColor ? parseInt(args.borderColor.replace("#", "0x")) : null;
    const borderSize = Number(args.borderSize);
    const animationEnabled = args.animationEnabled === "true";
    const animationIntensity = Number(args.animationIntensity);
    const animationSpeed = Number(args.animationSpeed);
    const x = Number(args.x);
    const y = Number(args.y);
    const z = Number(args.z);

    const sprite = new Sprite();
    sprite.bitmap = ImageManager.loadPicture(imageName);
    sprite.x = x;
    sprite.y = y;
    sprite.z = z;

    if (sizeMode === "Custom") {
        sprite.scale.x = customWidth / sprite.width;
        sprite.scale.y = customHeight / sprite.height;
    }

    // Apply a skew to simulate perspective
    sprite.skew.x = tilt / 100;
    sprite.skew.y = tilt / 100;

    // Apply a scale to simulate depth
    sprite.scale.x *= (1 - z / 1000);
    sprite.scale.y *= (1 - z / 1000);

    // Apply mirror effects
    if (mirrorX) sprite.scale.x *= -1;
    if (mirrorY) sprite.scale.y *= -1;

    // Apply smoothing
    sprite.bitmap.smooth = smoothing;

    // Create a glow effect using a blurred copy of the sprite
    if (glowColor) {
        const glowSprite = new Sprite(sprite.bitmap);
        glowSprite.x = sprite.x;
        glowSprite.y = sprite.y;
        glowSprite.z = sprite.z;
        glowSprite.scale.x = sprite.scale.x;
        glowSprite.scale.y = sprite.scale.y;
        glowSprite.skew.x = sprite.skew.x;
        glowSprite.skew.y = sprite.skew.y;
        glowSprite.filters = [new PIXI.filters.BlurFilter(glowIntensity)];
        glowSprite.tint = glowColor;
        SceneManager._scene._spriteset.addChild(glowSprite);
    }

    // Create a shadow effect using a darkened copy of the sprite
    if (shadowColor) {
        const shadowSprite = new Sprite(sprite.bitmap);
        shadowSprite.x = sprite.x + shadowX;
        shadowSprite.y = sprite.y + shadowY;
        shadowSprite.z = sprite.z;
        shadowSprite.scale.x = sprite.scale.x;
        shadowSprite.scale.y = sprite.scale.y;
        shadowSprite.skew.x = sprite.skew.x;
        shadowSprite.skew.y = sprite.skew.y;
        shadowSprite.tint = shadowColor;
        shadowSprite.alpha = 0.5;
        SceneManager._scene._spriteset.addChild(shadowSprite);
    }

    // Apply border
    if (borderColor && borderSize) {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(borderSize, borderColor);
        graphics.drawRect(0, 0, sprite.width, sprite.height);
        sprite.addChild(graphics);
    }

    // Apply breathing animation
    if (animationEnabled) {
        sprite.update = function() {
            this.scale.y = 1 + Math.sin(Graphics.frameCount / animationSpeed) * animationIntensity / 100;
        };
    }

    $3DImages[imageId] = sprite;

    SceneManager._scene._spriteset.addChild(sprite);
    console.log("3D Image added:", sprite);
});

PluginManager.registerCommand('Simple3DImage', 'removeImage', args => {
    console.log("Removing 3D Image:", args);
    const imageId = Number(args.imageId);
    const sprite = $3DImages[imageId];
    if (sprite) {
        SceneManager._scene._spriteset.removeChild(sprite);
        $3DImages[imageId] = null;
        console.log("3D Image removed:", imageId);
    } else {
        console.log("3D Image not found:", imageId);
    }
});
