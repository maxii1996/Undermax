/*:
 * @target MZ
 * @plugindesc Simple 3D Image Display with Additional Customizations
 * @author Maxii1996 | Undermax Games
 * @url https://undermax.itch.io/
 *
 * @command show3DImage
 * @text Show 3D Image
 * @desc Show a 3D image on the screen.
 *
 * @arg imageId
 * @type number
 * @min 0
 * @text Image ID
 * @desc The ID of the image. Use the same ID to refer to this image later.
 *
 * @arg imageName
 * @type file
 * @dir img/pictures
 * @text Image Name
 * @desc The name of the image file.
 *
 * @arg opacity
 * @type number
 * @min 0
 * @max 100
 * @text Opacity
 * @desc The opacity of the image.
 * @default 100
 *
 * @arg blendMode
 * @type select
 * @option Normal
 * @option Additive
 * @option Multiply
 * @option Screen
 * @text Blend Mode
 * @desc The blend mode of the image.
 * @default Normal
 *
 * @arg tintColor
 * @type text
 * @text Tint Color
 * @desc The tint color of the image.
 * @default #ffffff
 *
 * @arg sizeMode
 * @type select
 * @option Automatic
 * @option Custom
 * @text Size Mode
 * @desc Choose whether to use the original size of the image or a custom size.
 * @default Automatic
 *
 * @arg customWidth
 * @type number
 * @min 1
 * @text Custom Width
 * @desc The custom width of the image.
 * @default 100
 *
 * @arg customHeight
 * @type number
 * @min 1
 * @text Custom Height
 * @desc The custom height of the image.
 * @default 100
 *
 * @arg tilt
 * @type number
 * @min -100
 * @max 100
 * @text Tilt
 * @desc The tilt of the image to simulate perspective.
 * @default 0
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
 * @desc The color of the glow effect.
 * @default #ffffff
 *
 * @arg glowIntensity
 * @type number
 * @min 0
 * @text Glow Intensity
 * @desc The intensity of the glow effect.
 * @default 0
 *
 * @arg shadowX
 * @type number
 * @text Shadow X
 * @desc The X offset of the shadow.
 * @default 0
 *
 * @arg shadowY
 * @type number
 * @text Shadow Y
 * @desc The Y offset of the shadow.
 * @default 0
 *
 * @arg shadowColor
 * @type text
 * @text Shadow Color
 * @desc The color of the shadow.
 * @default #000000
 *
 * @arg borderColor
 * @type text
 * @text Border Color
 * @desc The color of the border.
 * @default #ffffff
 *
 * @arg borderSize
 * @type number
 * @min 0
 * @text Border Size
 * @desc The size of the border.
 * @default 0
 *
 * @arg animationEnabled
 * @type boolean
 * @text Animation Enabled
 * @desc Enable breathing animation.
 * @default false
 *
 * @arg animationIntensity
 * @type number
 * @min 0
 * @text Animation Intensity
 * @desc The intensity of the breathing animation.
 * @default 0
 *
 * @arg animationSpeed
 * @type number
 * @min 1
 * @text Animation Speed
 * @desc The speed of the breathing animation.
 * @default 60
 *
 * @arg x
 * @type number
 * @text X Position
 * @desc The X position of the image on the screen.
 * @default 0
 *
 * @arg y
 * @type number
 * @text Y Position
 * @desc The Y position of the image on the screen.
 * @default 0
 *
 * @arg z
 * @type number
 * @min -1000
 * @max 1000
 * @text Z Position
 * @desc The Z position of the image to simulate depth.
 * @default 0
 *
 * @command removeImage
 * @text Remove Image
 * @desc Remove a 3D image from the screen.
 *
 * @arg imageId
 * @type number
 * @min 0
 * @text Image ID
 * @desc The ID of the image to remove.
 *
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
    const opacity = Number(args.opacity);
    const blendMode = String(args.blendMode);
    const tintColor = args.tintColor ? parseInt(args.tintColor.replace("#", "0x")) : null;


    const sprite = new Sprite();
    sprite.bitmap = ImageManager.loadPicture(imageName);
    sprite.x = x;
    sprite.y = y;
    sprite.z = z;

    let glowSprite = null;
    let shadowSprite = null;

    sprite.bitmap.addLoadListener(() => {
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

        // Apply border
        if (borderColor && borderSize) {
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(borderSize, borderColor);
            graphics.drawRect(0, 0, sprite.width, sprite.height);
            sprite.addChild(graphics);
            console.log("Border applied:", borderColor, borderSize);
        }

        // Apply breathing animation
        if (animationEnabled) {
            sprite.update = function() {
                const scale = 1 + Math.sin(Graphics.frameCount / animationSpeed) * animationIntensity / 100;
                this.scale.y = scale;
                if (glowSprite) glowSprite.scale.y = scale;
                if (shadowSprite) shadowSprite.scale.y = scale;
            };
            console.log("Breathing animation applied:", animationIntensity, animationSpeed);
        }

        // Create a glow effect using a blurred copy of the sprite
        if (glowColor) {
            glowSprite = new Sprite(sprite.bitmap);
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
            console.log("Glow effect applied:", glowColor, glowIntensity);
        }

        // Create a shadow effect using a darkened copy of the sprite
        if (shadowColor) {
            shadowSprite = new Sprite(sprite.bitmap);
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
            console.log("Shadow effect applied:", shadowColor);
        }


        sprite.opacity = opacity / 100;

        switch (blendMode) {
            case "Additive":
                sprite.blendMode = PIXI.BLEND_MODES.ADD;
                break;
            case "Multiply":
                sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
                break;
            case "Screen":
                sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
                break;
            default:
                sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
                break;
        }
    
        if (tintColor) {
            sprite.tint = tintColor;
        }

        

        $3DImages[imageId] = sprite;

        SceneManager._scene._spriteset.addChild(sprite);
        console.log("3D Image added:", sprite);









    });
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
