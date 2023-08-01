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
 * @arg perspective
 * @type number
 * @text Perspective
 * @desc The perspective of the 3D image.
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

PluginManager.registerCommand('YourPluginName', 'show3DImage', args => {
    const imageId = Number(args.imageId);
    const imageName = String(args.imageName);
    const perspective = Number(args.perspective);
    const x = Number(args.x);
    const y = Number(args.y);
    const z = Number(args.z);

    const sprite = new Sprite();
    sprite.bitmap = ImageManager.loadPicture(imageName);
    sprite.x = x;
    sprite.y = y;
    sprite.z = z;
    sprite.scale.x = perspective;
    sprite.scale.y = perspective;

    $3DImages[imageId] = sprite;

    SceneManager._scene._spriteset._tilemap.addChild(sprite);
});

PluginManager.registerCommand('YourPluginName', 'removeImage', args => {
    const imageId = Number(args.imageId);
    const sprite = $3DImages[imageId];
    if (sprite) {
        SceneManager._scene._spriteset._tilemap.removeChild(sprite);
        $3DImages[imageId] = null;
    }
});
