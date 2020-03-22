/*
 * @Description: In User Settings Edit
 * @Author: mengjl
 * @Date: 2019-10-14 10:43:48
 * @LastEditors  : mengjl
 * @LastEditTime : 2019-12-29 11:52:53
 */

function debugRetain(url, ...p) {
    return;
    var asset = cc.loader._cache[url];
    if (asset == undefined) { return; }

    var debug_url = 'res/import/2b/2b5a24c0-66e7-49e5-9622-d4f9cfbdd25d.json';

    if (url == debug_url) 
    {
        console.warn(Date.now(), url, asset.__retain__, ...p);
    }
}

// 初始化引用计数
function initRetain(url) {
    var asset = cc.loader._cache[url];
    if (asset == undefined) { return; }
    if (asset.__retain__ == null) {
        asset.__retain__ = 0;
    }
    debugRetain(url);
}

// 获得引用计数
function getRetain(url) {
    var asset = cc.loader._cache[url];
    if (asset == undefined) { return null; }
    return asset.__retain__;
}

// 是否有引用计数
function isInitRetain(url) {
    var asset = cc.loader._cache[url];

    if (asset) {
        if (asset.hasOwnProperty('__retain__')) {
            return true;
        }
    }
    return false;
}

// 改变引用计数
function alterRetain(url, num) {
    var asset = cc.loader._cache[url];
    if (asset == undefined) { return; }
    if (asset.__retain__ == null) { return; }

    asset.__retain__ += num;
    if (asset.__retain__ < 0) {
        asset.__retain__ = 0;
    }
    debugRetain(url);
}

function retainDeps(asset, num) {
    var deps = cc.loader.getDependsRecursively(asset);
    // console.warn(deps)
    for (let index = 0; index < deps.length; index++) {
        const url = deps[index];
        var _asset = cc.loader.getRes(url);
        if (_asset != asset) {
            retainAsset(_asset, num);
        }
    }    
}

function retainSelf(asset, num) {
    var url = cc.loader._getReferenceKey(asset);
    // cc.log(url)
    initRetain(url);
    alterRetain(url, num);    
}

function retainAsset(asset, num) {
    if (asset == undefined) { return; }

    // cc.log(asset)
    
    if (asset instanceof cc.SpriteAtlas) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof cc.Prefab) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof cc.SpriteFrame) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof sp.SkeletonData) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof cc.Texture2D) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof cc.ParticleAsset) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof cc.AnimationClip) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof cc.AudioClip) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
    else if (asset instanceof cc.BitmapFont) {
        retainDeps(asset, num);
        retainSelf(asset, num);
    }
}

function retainNode(node, number) {
    if (!cc.isValid(node)) { return; }
    let children = node._children;
    children.forEach((child) => {
        parserNode(child, number);
        retainNode(child, number);
    });    
}

function deepRetainAsset(obj, number) {
    if (!obj) { return; }
    var url = cc.loader._getReferenceKey(obj);
    // console.log(url);
    var asset = cc.loader.getRes(url);
    retainAsset(asset, number);    
}

function parserNode(node, number) {
    // Sprite
    let sprite = node.getComponent(cc.Sprite);
    if (sprite && sprite.spriteFrame) {
        deepRetainAsset(sprite.spriteFrame, number);
    }
    
    // Button
    let button = node.getComponent(cc.Button);
    if (button) {
        // cc.log(button)
        var list = ['normalSprite', 'pressedSprite', 'hoverSprite', 'disabledSprite'];
        for (const key in list) {
            if (list.hasOwnProperty(key)) {
                const spriteAsset = list[key];
                deepRetainAsset(spriteAsset, number);
            }
        }
    }

    // Label
    let label = node.getComponent(cc.Label);
    if (label && label.font && label.font instanceof cc.BitmapFont && label.font.spriteFrame) {
        deepRetainAsset(label.font.spriteFrame, number);
    }

    // RichText
    let richText = node.getComponent(cc.RichText);
    if (richText && richText.imageAtlas) {
        deepRetainAsset(richText.imageAtlas, number);
    }

    // Skeleton
    let skeleton = node.getComponent(sp.Skeleton);
    if (skeleton && skeleton.skeletonData) {
        deepRetainAsset(skeleton.skeletonData, number);
    }

    // ParticleSystem
    let particleSystem = node.getComponent(cc.ParticleSystem);
    if (particleSystem && particleSystem.spriteFrame) {
        // deepRetainAsset(particleSystem._file, number);
    }

    // EditBox
    let editBox = node.getComponent(cc.EditBox);
    if (editBox && editBox.backgroundImage) {
        deepRetainAsset(editBox.backgroundImage, number);
    }

    // PageViewIndicator
    let pageViewIndicator = node.getComponent(cc.PageViewIndicator);
    if (pageViewIndicator && pageViewIndicator.spriteFrame) {
        deepRetainAsset(pageViewIndicator.spriteFrame, number);
    }
    if (pageViewIndicator) {
        // cc.log(pageViewIndicator);
    }

    // Mask
    let mask = node.getComponent(cc.Mask);
    if (mask && mask.spriteFrame) {
        deepRetainAsset(mask.spriteFrame, number);
    }

    let audio = node.getComponent(cc.AudioSource);
    if (audio && audio.clip) {
        deepRetainAsset(audio.clip, number);
    }

    let animation = node.getComponent(cc.Animation);
    if (animation && animation._clips) {
        for (let index = 0; index < animation._clips.length; index++) {
            const clip = animation._clips[index];
            deepRetainAsset(clip, number);               
        }
    }
}

function deepCloneObj(obj) {
    var i;
    var o = Array.isArray(obj) ? [] : {};
    for (i in obj) {
        o[i] = typeof obj[i] === "Object" ? deepCloneObj(obj[i]) : obj[i];
    }
    return o;
}

// 引用计数清零
function retainZero() {
    _releaseType(cc.SpriteFrame);   // 精灵帧
    _releaseType(sp.SkeletonData);  // spine
    _releaseType(cc.AnimationClip);
    // _releaseType(cc.Prefab);        // 预制体
    // _releaseType(cc.ParticleSystem);
    _releaseType(cc.AudioClip);    
}

function _releaseType(class_type) {
    // 减少引用计数
    var assetsInCache = deepCloneObj(cc.loader._cache);
    for (const key in assetsInCache) {
        var asset = cc.loader.getRes(key);
        if (!asset) { continue; }
        if (!isInitRetain(key)) { continue; }

        if (asset instanceof class_type) {
            var retain = getRetain(key);
            // cc.log(asset, -retain);
            retainAsset(asset, -retain);
        }
    }      
}

function releaseZero() {
    var assetsInCache = deepCloneObj(cc.loader._cache);
    for (const key in assetsInCache) {
        var asset = cc.loader.getRes(key);
        if (!asset) { continue; }

        if (!isInitRetain(key)) { continue; }
        // console.error(key, getRetain(key));
        if (getRetain(key) > 0) { continue; }

        // cc.log(isUsing(asset), asset);
        // if (isUsing(asset)) { continue; }
        
        cc.loader.release(asset);
        // cc.log(key, asset);
    }
}

function isUsing(asset) {
    var deps = cc.loader.getDependsRecursively(asset);
    // cc.log(deps);
    for (let index = 0; index < deps.length; index++) {
        const url = deps[index];
        var _asset = cc.loader.getRes(url);

        if (_asset == asset) { continue; }
        if (!isInitRetain(url)) { continue; }
        if (getRetain(url) <= 0) { continue; }

        return true;
    }
    return false;
}

function repSpriteTexture(target, sprite_key, sprite_frame) {
    if (!cc.isValid(target)) { return; }
    if (!sprite_frame) { return; }

    parserNode(target, -1);
    target[sprite_key] = sprite_frame;
    parserNode(target, 1);
}

function repSkeletonData(skeleton, skeleton_data) {
    if (!cc.isValid(skeleton)) { return; }
    if (!skeleton || !skeleton_data) {
        return;
    }

    parserNode(skeleton, -1);
    skeleton.skeletonData = skeleton_data;
    parserNode(skeleton, 1);
}

module.exports = {
    m_debug_list : new Object(),
    m_loadingCount : 0,
    
    __init__()
    {
        // cc.dynamicAtlasManager.enabled = false;
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, this.beforeSceneLoading.bind(this));
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.afterSceneLaunch.bind(this));
    },

    beforeSceneLoading()
    {
        // console.warn('beforeSceneLoading');
        // if (!cc.director.getScene()) {
        //     return;
        // }

        // var dependAssets = cc.director.getScene().dependAssets;
        // console.error(dependAssets);

    },

    afterSceneLaunch()
    {
        // console.warn('afterSceneLaunch');
        if (!cc.director.getScene()) {
            return;
        }

        var dependAssets = cc.director.getScene().dependAssets;
        if (!dependAssets) { return; }

        for (let index = 0; index < dependAssets.length; index++) {
            const key = dependAssets[index];
            var asset = cc.loader.getRes(key);
            if (!asset) { continue; }
            retainAsset(asset, 0);
        }
    },

    retainZero()
    {
        retainZero();
    },

    releaseZero()
    {
        cc.log('releaseZero');
        releaseZero();
    },

    retainScene(scene)
    {
        retainNode(scene, 1);
    },

    getLoadingCount()
    {
        return this.m_loadingCount;
    },

    createImage(url, node)
    {
        cc.loader.load({url: url, type: 'png'}, (err, texture) => {
            if (!err && cc.isValid(node)) {
                let sp = node;
                sp.spriteFrame = new cc.SpriteFrame(texture);
                sp.type = cc.Sprite.Type.SIMPLE;
                sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    },

    isDepsValid(asset)
    {
        if (!cc.isValid(asset)) { return false; }
        var deps = cc.loader.getDependsRecursively(asset);
        var valid_count = 0;
        for (let index = 0; index < deps.length; index++) {
            const url = deps[index];
            var _asset = cc.loader.getRes(url);
    
            if (!cc.isValid(_asset)) 
            { 
                valid_count++;
            }
        }
        return valid_count <= 0;
    },

    getPrefab(url, callback)
    {
        this.loadAsset(url, cc.Prefab, (prefab) => {
            this.instantiate(prefab, callback);
        });
    },

    instantiate(prefab, callback) {
        if (!prefab) {
            console.log("参数不对, 请检查参数");
            if (callback) { callback(null); }
            return;
        }

        let node_prefab = cc.instantiate(prefab);
        if (callback) { callback(node_prefab); }
        // cc.log('instantiate');
        retainNode(node_prefab, 1);
    },

    destroy(node) {
        if (!node instanceof cc.Node) {
            console.log("你要销毁的不是一个节点");
            return;
        }
        retainNode(node, -1);
        node.destroy();
    },

    replaceFrame(target, atlasName, frameName, callback) {
        if (!cc.isValid(target)) { console.log("参数错误"); return; }

        let sprite = target.getComponent(cc.Sprite);
        if (!sprite) { console.log("目标节点没有Sprite组件"); return; }

        if (atlasName && frameName) {
            this.loadAsset(atlasName, cc.SpriteAtlas, (atlas) => {
                if (atlas) {
                    var sprite_frame = atlas.getSpriteFrame(frameName);
                    repSpriteTexture(sprite, "spriteFrame", sprite_frame);
                }
                repSpriteTexture(sprite, "spriteFrame", sprite_frame);
                if (callback) { callback(); }
            });            
        } else {
            this.loadAsset(atlasName, cc.SpriteFrame, (sprite_frame) => {
                repSpriteTexture(sprite, "spriteFrame", sprite_frame);
                if (callback) { callback(); }
            });
        }
    },

    replaceSkeletonData(target, url, callback)
    {
        if (!cc.isValid(target)) { console.log("参数错误"); return; }

        let skeleton = target.getComponent(sp.Skeleton);
        if (!skeleton) { console.log("目标节点没有Skeleton组件"); return; }
        
        this.loadAsset(url, sp.SkeletonData, (skeletonData) => {
            repSkeletonData(skeleton, skeletonData);
            if (callback) { callback(); }
        })
    },

    // 加载资源(添加引用计数)
    loadAsset(url, type = cc.Asset, callback)
    {
        var res = cc.loader.getRes(url, type);
        if (res) {
            if (callback) { callback(res); }
            return;
        }
        // cc.log(Date.now(), 'loadAsset begin');
        this._debuggerOne('begin', url);
        this.m_loadingCount++;
        cc.loader.loadRes(url, type, (err, res) => {
            this.m_loadingCount--;
            this._debuggerOne('end', url);
            if (err) {
                if (callback) { callback(null); }
                console.error("load " + url + "--->", err, res); 
            }
            else {
                retainAsset(res, 0);
                if (callback) { callback(res); }
            }
        });
    },

    // 获取资源
    getRes(url, type = cc.Asset)
    {
        return cc.loader.getRes(url, type);
    },

    // 获得json配置表
    getConfig(filename)
    {
        var res = this.getRes(filename, cc.Asset);
        if (res) {
            return res.json;
        }
        return null;
    },

    _debuggerOne(debug_type, url)
    {
        // cc.log('loadAsset', debug_type, url);
        return;
        if (debug_type == 'begin') {
            this.m_debug_list[url] = {start_time : Date.now()};
        }
        else
        {
            if (this.m_debug_list[url]) {
                var delay_time = (Date.now() - this.m_debug_list[url].start_time);
                console.log(`加载[${url}] 用时 ${delay_time}ms`);
                delete this.m_debug_list[url];
            }
        }
    },

    logger()
    {
        console.log(cc.loader._cache)
        var debug_list = new Object();
        for (const key in cc.loader._cache) {
            const asset = cc.loader.getRes(key);
            // console.log(asset)
            if (asset instanceof cc.SpriteAtlas) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof cc.Prefab) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof cc.SpriteFrame) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof sp.SkeletonData) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof cc.Texture2D) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof cc.ParticleAsset) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof cc.AnimationClip) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof cc.AudioClip) {
                debug_list[key] = cc.loader._cache[key];
            }
            else if (asset instanceof cc.BitmapFont) {
                debug_list[key] = cc.loader._cache[key];
            }
        }
        console.log(debug_list);
    },
};

module.exports.__init__();