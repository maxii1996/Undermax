/*:
 * @target MZ
 * @plugindesc Plugin to display 3D images on the map
 * @author Your Name
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
 * @text Custom Width
 * @desc The custom width of the image.
 *
 * @arg customHeight
 * @type number
 * @text Custom Height
 * @desc The custom height of the image.
 *
 * @arg tilt
 * @type number
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
 * @type color
 * @text Glow Color
 * @desc The color of the glow effect.
 *
 * @arg glowIntensity
 * @type number
 * @text Glow Intensity
 * @desc The intensity of the glow effect.
 *
 * @arg shadowX
 * @type number
 * @text Shadow X
 * @desc The X position of the shadow.
 *
 * @arg shadowY
 * @type number
 * @text Shadow Y
 * @desc The Y position of the shadow.
 *
 * @arg shadowColor
 * @type color
 * @text Shadow Color
 * @desc The color of the shadow.
 *
 * @arg x
 * @type number
 * @text X Position
 * @desc The X position of the image.
 *
 * @arg y
 * @type number
 * @text Y Position
 * @desc The Y position of the image.
 *
 * @arg z
 * @type number
 * @text Z Position
 * @desc The Z position of the image.
 *
 * @command removeImage
 * @text Remove Image
 * @desc Remove the image by its ID.
 *
 * @arg imageId
 * @type number
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
    }
});
