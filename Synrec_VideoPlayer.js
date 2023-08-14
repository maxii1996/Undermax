/*:
 * @author SYnrec / Kylestclr
 * @plugindesc v1.2 Plays videos on scene (top-layer)
 * @url https://synrec.itch.io
 * @target MZ
 * 
 * @command End Video
 * @desc Stops and removes video from the scene
 * 
 * @command Clear Reserve Videos
 * @desc Clears all reserve videos
 * 
 * @command Clear Delay Video
 * @desc Clears delay video
 * 
 * @command Play Video
 * @desc Plays a video from videos foldier
 * 
 * @arg Name
 * @desc Name of the video to play
 * @type text
 * @default video
 * 
 * @arg Loop
 * @desc Play video on loop
 * @type boolean
 * @default false
 * 
 * @arg Event
 * @desc Event to play when video ends
 * @type common_event
 * @default 1
 * 
 * @arg Position X
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Position Y
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Video Width
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Height
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Transparency
 * @desc Video transparency. 1 = None, 0 = Full.
 * @type number
 * @default 1
 * @decimals 3
 * 
 * @command Delay Video
 * @desc Plays a video when scene condition met
 * 
 * @arg Delay
 * @desc Time in frame count for video delay
 * @type number
 * @default 60
 * 
 * @arg Name
 * @desc Name of the video to play
 * @type text
 * @default video
 * 
 * @arg Loop
 * @desc Play video on loop
 * @type boolean
 * @default false
 * 
 * @arg Event
 * @desc Event to play when video ends
 * @type common_event
 * @default 1
 * 
 * @arg Position X
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Position Y
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Video Width
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Height
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Transparency
 * @desc Video transparency. 1 = None, 0 = Full.
 * @type number
 * @default 1
 * @decimals 3
 * 
 * @command Reserve Video
 * @desc Plays a video when scene condition met
 * 
 * @arg Scene
 * @desc The valid scene for the video
 * @type select
 * @option Scene_Title
 * @option Scene_Map
 * @option Scene_Menu
 * @option Scene_Item
 * @option Scene_Skill
 * @option Scene_Equip
 * @option Scene_Status
 * @option Scene_Options
 * @option Scene_Save
 * @option Scene_Load
 * @option Scene_Shop
 * @option Scene_Name
 * @option Scene_Battle
 * @option Scene_Gameover
 * @default Scene_Map
 * 
 * @arg Name
 * @desc Name of the video to play
 * @type text
 * @default video
 * 
 * @arg Loop
 * @desc Play video on loop
 * @type boolean
 * @default false
 * 
 * @arg Event
 * @desc Event to play when video ends
 * @type common_event
 * @default 1
 * 
 * @arg Position X
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Position Y
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Video Width
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Height
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Transparency
 * @desc Video transparency. 1 = None, 0 = Full.
 * @type number
 * @default 1
 * @decimals 3
 * 
 * @command Modify Video
 * @desc Plays a video from videos foldier
 * 
 * @arg Event
 * @desc Set this as the event to play when video ends
 * @type common_event
 * @default 1
 * 
 * @arg Position X
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Position Y
 * @desc Video location setting
 * @type number
 * @default 0
 * 
 * @arg Video Width
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Height
 * @desc Video size setting
 * @type number
 * @default 0
 * 
 * @arg Video Transparency
 * @desc Video transparency. 1 = None, 0 = Full.
 * @type number
 * @default 1
 * @decimals 3
 * 
 * @arg Video Restart
 * @desc Video plays from beginning.
 * @type boolean
 * @default false
 * 
 * @arg Below Layer
 * @desc Shift video below object layer
 * @type boolean
 * @default false
 * 
 * @arg Below Object
 * @parent Below Layer
 * @desc What to shift the video sprite below
 * @type text
 * @default WindowLayer
 * 
 * 
 * 
 */

const Is_MZ_VideoPlayback = Utils.RPGMAKER_NAME == "MZ";

if(Is_MZ_VideoPlayback){
    PluginManager.registerCommand(`Synrec_VideoPlayer`, 'Play Video', (obj)=>{
        const name = obj['Name'];
        const loop = obj['Loop'];
        const event = obj['Event'];
        const x = obj['Position X'];
        const y = obj['Position Y'];
        const w = obj['Video Width'];
        const h = obj['Video Height'];
        const a = obj['Video Transparency'];
        SceneManager.startVideo(name, loop, event, x, y, w, h, a);
    })

    PluginManager.registerCommand(`Synrec_VideoPlayer`, 'Delay Video', (obj)=>{
        const delay = Number(obj['Delay']);
        const name = obj['Name'];
        const loop = obj['Loop'];
        const event = obj['Event'];
        const x = obj['Position X'];
        const y = obj['Position Y'];
        const w = obj['Video Width'];
        const h = obj['Video Height'];
        const a = obj['Video Transparency'];
        SceneManager.delayVideo(delay, name, loop, event, x, y, w, h, a);
    })

    PluginManager.registerCommand(`Synrec_VideoPlayer`, 'Reserve Video', (obj)=>{
        const scene = obj['Scene'];
        const name = obj['Name'];
        const loop = obj['Loop'];
        const event = obj['Event'];
        const x = obj['Position X'];
        const y = obj['Position Y'];
        const w = obj['Video Width'];
        const h = obj['Video Height'];
        const a = obj['Video Transparency'];
        SceneManager.reserveVideo(scene, name, loop, event, x, y, w, h, a);
    })

    PluginManager.registerCommand(`Synrec_VideoPlayer`, 'Modify Video', (obj)=>{
        const event = obj['Event'];
        const x = obj['Position X'];
        const y = obj['Position Y'];
        const w = obj['Video Width'];
        const h = obj['Video Height'];
        const a = obj['Video Transparency'];
        const r = obj['Video Restart'];
        const below = obj['Below Layer'];
        const below_obj = eval(obj['Below Object']);
        SceneManager.modifyVideo(event, x, y, w, h, a, r, below, below_obj);
    })

    PluginManager.registerCommand(`Synrec_VideoPlayer`, 'End Video', ()=>{
        SceneManager.endVideo();
    })

    PluginManager.registerCommand(`Synrec_VideoPlayer`, 'Clear Reserve Videos', ()=>{
        SceneManager.clearReserveVideos();
    })

    PluginManager.registerCommand(`Synrec_VideoPlayer`, 'Clear Delay Video', ()=>{
        SceneManager.clearDelayVideo();
    })
}

function Sprite_SceneVideo(){
    //! NULL CLASS
}

Sprite_SceneVideo.initialize = function(){
    this._videoSprite = new PIXI.Sprite();
    this._scene = SceneManager._scene;
}

Sprite_SceneVideo.setVideoTexture = function(name, loop, event, x, y, w, h, a){
    loop = eval(loop);
    event = Number(event);
    x = Number(x);
    y = Number(y);
    w = Number(w);
    h = Number(h);
    a = Number(a);
    if(this._video_texture)this.endVideoTexture();
    const src = `videos/${name}.webm`;
    if(this._videoSprite.parent){
        this._videoSprite.parent.removeChild(this._videoSprite);
    }
    this._scene = SceneManager._scene;
    const videoTexture = Is_MZ_VideoPlayback ? new PIXI.Texture.from(src) : new PIXI.Texture.fromVideo(src);
    const source = Is_MZ_VideoPlayback ? videoTexture.baseTexture.resource.source : videoTexture.baseTexture.source;
    source.loop = loop;
    source.preload = 'auto';
    source.autoload = true;
    source.autoplay = true;
    this._videoSprite.texture = videoTexture;
    this._scene.addChild(this._videoSprite);
    if(!isNaN(x))this._videoSprite.x = x || 0;
    if(!isNaN(y))this._videoSprite.y = y || 0;
    if(!isNaN(w))this._videoSprite.width = w || source.width;
    if(!isNaN(h))this._videoSprite.height = h || source.height;
    this._video_texture = videoTexture;
    this._videoSprite.alpha = isNaN(a) ? 1 : a >= 0 ? a : 1;
    this._rsvpEvent = !isNaN(event) && event > 0 ? event : null;
}

Sprite_SceneVideo.modifyVideo = function(obj){
    const x = Number(obj.x);
    const y = Number(obj.y);
    const w = Number(obj.width);
    const h = Number(obj.height);
    const a = Number(obj.alpha);
    const r = eval(obj.restart);
    const below = eval(obj.below);
    const below_obj = obj.below_obj || WindowLayer;
    if(!isNaN(x))this._videoSprite.x = x;
    if(!isNaN(y))this._videoSprite.y = y;
    if(!isNaN(w))this._videoSprite.width = w;
    if(!isNaN(h))this._videoSprite.height = h;
    if(!isNaN(a))this._videoSprite.alpha = a;
    if(r){
        const texture = this._video_texture;
        if(!texture)return;
        const video = Is_MZ_VideoPlayback ? texture.baseTexture.resource.source : texture.baseTexture.source;
        video.currentTime = 0;
    }
    if(below){
        const scene = SceneManager._scene;
        const children = scene.children;
        const layer = children.find((child)=>{
            return child instanceof below_obj;
        })
        if(layer){
            const video = this._videoSprite;
            const index_windows = children.indexOf(layer);
            const index_video = children.indexOf(video);
            scene.children.splice(
                index_windows - 1,
                0,
                scene.children.splice(
                    index_video,
                    1
                )[0]
            )
        }
    }
}

Sprite_SceneVideo.endVideoTexture = function(){
    const texture = this._video_texture;
    if(!texture)return;
    const video = Is_MZ_VideoPlayback ? texture.baseTexture.resource.source : texture.baseTexture.source;
    video.currentTime = video.duration;
    video.loop = false;
    video.muted = true;
    video.remove();
    if(this._videoSprite.parent){
        this._videoSprite.parent.removeChild(this._videoSprite);
    }
    this._video_texture.baseTexture.destroy();
    this._video_texture.destroy();
    this._video_texture = null;
    if(this._rsvpEvent){
        const id = JsonEx.makeDeepCopy(this._rsvpEvent);
        $gameTemp.reserveCommonEvent(id);
        this._rsvpEvent = null;
    }
}

Sprite_SceneVideo.update = function(){
    // if(this._videoSprite.parent)console.log(this._videoSprite.parent.children.indexOf(this._videoSprite))
    if(this._video_texture){
        this._video_texture.update();
        const texture = this._video_texture;
        const video = Is_MZ_VideoPlayback ? texture.baseTexture.resource.source : texture.baseTexture.source;
        const is_loop = video.loop;
        const is_end = video.currentTime >= video.duration;
        if(
            (SceneManager._scene != this._scene) ||
            (
                !is_loop &&
                is_end
            )
        ){
            this.endVideoTexture();
        }
    }
}

SceneManager.isVideoPlaying = function(){
    if(!this._sceneVideo)return false;
    if(!this._sceneVideo._video_texture)return false;
    const baseTexture = this._sceneVideo._video_texture.baseTexture;
    const video = Is_MZ_VideoPlayback ? baseTexture.resource.source : baseTexture.source;
    if(video.currentTime >= video.duration){
        return false;
    }
    return true;
}

SceneManager.playReserveVideo = function(){
    if(!Array.isArray(this._reserveVideos))return;
    const obj = this._reserveVideos[0];
    if(!obj)return;
    try{
        const chk_scene = eval(obj.scene);
        const scene = this._scene;
        if(scene instanceof chk_scene){
            const video_obj = this._reserveVideos.shift();
            if(video_obj){
                const name = video_obj.name;
                const loop = video_obj.loop;
                const x = video_obj.x;
                const y = video_obj.y;
                const w = video_obj.width;
                const h = video_obj.height;
                const a = video_obj.alpha;
                const e = video_obj.event;
                this.startVideo(name, loop, e, x, y, w, h, a);
            }
        }
    }catch(e){
        console.warn(`Invalid reserve playback, reserve videos cleared., ${e}`);
        this._reserveVideos = [];
    }
}

SceneManager.playDelayVideo = function(){
    if(!this._delayVideo)return;
    const video_obj = this._delayVideo;
    if(Graphics.frameCount >= video_obj.delay){
        const name = video_obj.name;
        const loop = video_obj.loop;
        const x = video_obj.x;
        const y = video_obj.y;
        const w = video_obj.width;
        const h = video_obj.height;
        const a = video_obj.alpha;
        const e = video_obj.event;
        this.startVideo(name, loop, e, x, y, w, h, a);
        this._delayVideo = null;
    }
}

SceneManager.reserveVideo = function(scene, name, loop, e, x, y, w, h, a){
    if(!Array.isArray(this._reserveVideos))this._reserveVideos = [];
    const obj = {};
    obj.scene = scene;
    obj.name = name;
    obj.loop = loop;
    obj.event = e;
    obj.x = x;
    obj.y = y;
    obj.width = w;
    obj.height = h;
    obj.alpha = a;
    this._reserveVideos.push(obj);
}

SceneManager.delayVideo = function(delay, name, loop, e, x, y, w, h, a){
    if(this._delayVideo)return console.warn(`You may only delay one video at a time.`);
    const obj = {};
    obj.delay = Graphics.frameCount + delay;
    obj.name = name;
    obj.loop = loop;
    obj.event = e;
    obj.x = x;
    obj.y = y;
    obj.width = w;
    obj.height = h;
    obj.alpha = a;
    this._delayVideo = obj;
}

Syn_Video_ScnMngr_UpdtMain = SceneManager.updateMain
SceneManager.updateMain = function(){
    Syn_Video_ScnMngr_UpdtMain.call(this);
    this.updateSceneVideo();
}

SceneManager.updateSceneVideo = function(){
    if(!this._sceneVideo){
        this._sceneVideo = Sprite_SceneVideo;
        this._sceneVideo.initialize();
    }
    this._sceneVideo.update();
    this.updateDelayVideo();
    this.updateReserveVideo();
}

SceneManager.updateDelayVideo = function(){
    if(this.isVideoPlaying())return;
    this.playDelayVideo();
}

SceneManager.updateReserveVideo = function(){
    if(this.isVideoPlaying())return;
    this.playReserveVideo();
}

SceneManager.startVideo = function(name, loop, e, x, y, w, h, a){
    if(!this._sceneVideo){
        this._sceneVideo = Sprite_SceneVideo;
        this._sceneVideo.initialize();
    }
    if(name)this._sceneVideo.setVideoTexture(name, loop, e, x, y, w, h, a);
}

SceneManager.modifyVideo = function(e, x, y, w, h, a, r, below, below_obj){
    if(!below_obj)below_obj = WindowLayer;
    if(!this._sceneVideo){
        return;
    }
    const obj = {};
    obj.event = e;
    obj.x = x;
    obj.y = y;
    obj.width = w;
    obj.height = h;
    obj.alpha = a;
    obj.restart = !!r;
    obj.below = below;
    obj.below_obj = below_obj;
    this._sceneVideo.modifyVideo(obj);
}

SceneManager.endVideo = function(){
    if(!this._sceneVideo){
        return;
    }
    this._sceneVideo.endVideoTexture()
}

SceneManager.clearReserveVideos = function(){
    this._reserveVideos = [];
}

SceneManager.clearDelayVideo = function(){
    this._delayVideo = null;
}

Syn_Video_ScnMngr_ChngScn = SceneManager.changeScene;
SceneManager.changeScene = function() {
    if (this.isSceneChanging()) {
        this.endVideo();
    }
    Syn_Video_ScnMngr_ChngScn.call(this);
}

Syn_Video_ScnMngr_OnErr = SceneManager.onError;
SceneManager.onError = function(e) {
    this.endVideo();
    Syn_Video_ScnMngr_OnErr.call(this, e);
};