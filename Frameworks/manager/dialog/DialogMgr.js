/*
 * @Author: mengjl
 * @Date: 2019-12-11 15:20:29
 * @LastEditTime: 2020-03-22 21:23:43
 * @LastEditors: Please set LastEditors
 * @Description: 
 * @FilePath: \NewResProject\assets\Script\Frameworks\manager\dialog\DialogMgrEx.js
 */

let DialogDef = require("DialogDef")
let PoolMgr = require("PoolMgr")

module.exports = {

    m_alloc_index : 0,              // 分配索引
    m_baseZIndex : 1000,            // 基础ZIndex
    m_dialogs : new Array(),        // 对话框节点列表
    m_maskPool : new cc.NodePool(), // 遮罩节点池
    m_masks : new Array(),          // 遮罩节点列表
    m_maskIndex : 0,                // 遮罩索引
    m_factory : new Object(),       // 工厂状态
    m_showList : new Array(),       // 显示队列
    m_showLastID : -1,
    event_cache : new Object(),     // 消息队列

    __init__()
    {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, this.beforeSceneLoading.bind(this));
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.afterSceneLaunch.bind(this));
    },

    afterSceneLaunch(scene_name)
    {
        // 清理所有预制体
        this.m_maskPool.clear();
        // this.m_dialogs.length = 0;
        this.m_factory = new Object();
    },

    beforeSceneLoading(scene_name)
    {

    },

    registerMask(url)
    {
        DialogDef.DialogMask = url;
    },

    registerDialog(dialog_id, url)
    {
        DialogDef.DialogID[dialog_id] = url;
        DialogDef.DialogID[url] = dialog_id;
        unit.PoolMgr.initPool(dialog_id, url);
    },

    addShowList(dialog_id, params = {})
    {
        this.m_showList.push({dialog_id : dialog_id, params : params, });
    },

    clearShowList()
    {
        this.m_showList.length = 0;
        this.m_showLastID = -1;
    },

    showList(close_id = -1)
    {
        // console.error(close_id, this.m_showList);
        if (this.m_showList.length <= 0) {
            return;
        }

        var data = this.m_showList[0];
        if (close_id == -1 || close_id == this.m_showLastID) {
            this.showDialog(data.dialog_id, data.params);
            this.m_showLastID = data.dialog_id;
            this.m_showList.splice(0, 1);
        }
    },

    showDialog(dialog_id, params = {})
    {
        var dialog_name = this._getNameById(dialog_id);
        if (dialog_name == null) {
            console.error('对话框不存在 id =[' + dialog_id + ']');
            return null;
        }

        var zIndex = this.allocDialogIndex();

        var _dialog_node_ = this.getDialog(dialog_id);
        var _dialog_comp_ = null;
        if (cc.isValid(_dialog_node_)) {
            _dialog_comp_ = _dialog_node_.getComponent('DialogBase');
        }

        if (_dialog_comp_ && _dialog_comp_.isSingle()) {
            this.reopenDialog(dialog_id, params, zIndex);
        } else {
            this.newDialog(dialog_id, params, zIndex); 
        }

        
    },

    allocDialogIndex()
    {
        this.m_alloc_index += 2;
        return this.m_alloc_index + this.m_baseZIndex;
    },

    reopenDialog(dialog_id, params, zIndex)
    {
        var _dialog_node_ = this.getDialog(dialog_id);

        if (!cc.isValid(_dialog_node_)) {
            return;
        }

        var _dialog_comp_ = _dialog_node_.getComponent('DialogBase');
        if (_dialog_comp_) {
            // 重调进入函数
            _dialog_comp_.onEnter(params);
            // 重置显示层级
            this.setDialogZIndex(_dialog_node_, zIndex);
            if (_dialog_comp_._getState() == DialogDef.DialogState.closing || _dialog_comp_._getState() == DialogDef.DialogState.closed) {
                // 重新播放开启动画
                _dialog_comp_._playOpenAni();
            }
        }
    },

    getDialog(dialog_id)
    {
        var dialog_name = this._getNameById(dialog_id);

        for (let index = this.m_dialogs.length - 1; index >= 0; index--) {
            const _dialog_node_ = this.m_dialogs[index];
            var dialog_comp = _dialog_node_.getComponent('DialogBase');
            // console.log(dlgComp.dialog_id);
            if (dialog_comp._getDialogName() == dialog_name) {
                return _dialog_node_;
            }
        }
        return null;
    },

    getAllDialog(dialog_id)
    {
        var dialog_name = this._getNameById(dialog_id);

        var res_list = [];
        for (let index = this.m_dialogs.length - 1; index >= 0; index--) {
            const _dialog_node_ = this.m_dialogs[index];
            var dialog_comp = _dialog_node_.getComponent('DialogBase');
            // console.log(dlgComp.dialog_id);
            if (dialog_comp._getDialogName() == dialog_name) {
                res_list.push(_dialog_node_);
            }
        }
        return res_list;
    },

    closeDialog(dialog_node)
    {
        // console.error(dialog_node)
        var _dialog_node_ = dialog_node;
        // console.log(typeof dialog);
        if (typeof dialog_node == 'string') {
            _dialog_node_ = this.getDialog(dialog_node);
        }

        if (cc.isValid(_dialog_node_)) {
            _dialog_node_.getComponent('DialogBase')._playCloseAni();
        } 
    },

    closeAllDialog()
    {
        // console.log(this.m_dialogs);
        for (let index = this.m_dialogs.length - 1; index >= 0; index--) {
            const _dialog_node_ = this.m_dialogs[index];
            // var dlgComp = _dialog_node_.getComponent('DialogBase');
            this.closeDialog(_dialog_node_);
        }
    },

    setDialogZIndex(dialog_node, zIndex)
    {
        var dialog_comp = dialog_node.getComponent('DialogBase');

        var mask_node = this._getMask(dialog_comp._getMaskId());
        if (cc.isValid(mask_node)) {
            mask_node.zIndex = zIndex - 1;
        }
        
        dialog_node.zIndex = zIndex;
        this._autoMaxZIndex();
    },

    _closeDialog(dialog_node)
    {
        var dialog_comp = dialog_node.getComponent('DialogBase');
        var dialog_name = dialog_comp.__dialog_name__;
        var dialog_id = dialog_comp.dialog_id;
        var maskId = dialog_comp._getMaskId();
        dialog_comp.onLeave();

        PoolMgr.recoveryPerfab(dialog_name, dialog_node);

        for (let index = 0; index < this.m_dialogs.length; index++) {
            const _dialog_node_ = this.m_dialogs[index];
            if (dialog_node == _dialog_node_) {
                this.m_dialogs.splice(index, 1);
                break;
            }
        }
        
        this._subMask(maskId);

        this._autoMaxZIndex();

        this.showList(dialog_id);
    },

    _removeMask(mask_node)
    {
        var maskId = mask_node.getComponent('DialogMask').getMaskId();
        // this._subMask(maskId);
        for (let index = 0; index < this.m_masks.length; index++) {
            const _mask_node_ = this.m_masks[index];
            var mask_comp = _mask_node_.getComponent('DialogMask');
            if (mask_comp.getMaskId() == maskId) {
                this.m_masks.splice(index, 1);
                break;
            }
        }
    },

    _removeDialog(dialog_node)
    {
        cc.log('_removeDialog');
        var dialog_comp = dialog_node.getComponent('DialogBase');
        dialog_comp.onLeave();
        var maskId = dialog_comp._getMaskId();
        this._subMask(maskId);
        PoolMgr.removeUsedPerfab(dialog_comp._getDialogName(), dialog_node);

        for (let index = 0; index < this.m_dialogs.length; index++) {
            const _dialog_node_ = this.m_dialogs[index];
            if (dialog_node == _dialog_node_) {
                this.m_dialogs.splice(index, 1);
                break;
            }
        }

        this._autoMaxZIndex();
    },

    _autoMaxZIndex()
    {
        var m_maxZIndex = this.m_baseZIndex;
        var active_amount = 0;
        for (let index = 0; index < this.m_dialogs.length; index++) {
            const _dialog_node_ = this.m_dialogs[index];
            if (_dialog_node_.zIndex > m_maxZIndex) {
                m_maxZIndex = _dialog_node_.zIndex;
            }
            active_amount++;
        }

        if (active_amount <= 0) {
            this.m_dialogIndex = 0;
        }

        // console.log('this.m_maxZIndex', this.m_maxZIndex);
    },

    _setFactoryState(dialog_id, state)
    {
        var dialog_name = this._getNameById(dialog_id);
        this.m_factory[dialog_name] = state;
    },

    _getFactoryState(dialog_id)
    {
        var dialog_name = this._getNameById(dialog_id);
        if (!this.m_factory[dialog_name]) {
            this.m_factory[dialog_name] = 'init';
        }
        return this.m_factory[dialog_name];
    },

    newDialog(dialog_id, params, zIndex)
    {
        var dialog_name = this._getNameById(dialog_id);
        if (this._getFactoryState(dialog_id) == 'creating') {
            console.warn('[' + dialog_name + ']正在创建！');
            return;
        }
        this._setFactoryState(dialog_id, 'creating');

        var mask_id = this.allocMaskIndex();

        this._createDialog(dialog_id, mask_id, params, zIndex);
        this._createMask(dialog_id, mask_id, zIndex);

    },

    _initDialog(dialog_node, dialog_id, mask_id, params, zIndex)
    {
        this._getParent().addChild(dialog_node, zIndex);
        this.m_dialogs.push(dialog_node);

        var dialog_name = this._getNameById(dialog_id);
        
        dialog_node.setPosition(cc.v2(0, 0));
        var _dialog_comp_ = dialog_node.getComponent('DialogBase');
        _dialog_comp_.__dialog_name__ = dialog_name;
        _dialog_comp_.dialog_id = dialog_id;
        _dialog_comp_._setMaskId(mask_id);
        _dialog_comp_.onEnter(params);
        _dialog_comp_._playOpenAni();
        
        this._syncDialogSetting(dialog_id, mask_id);
    },

    _createDialog(dialog_id, mask_id, params, zIndex)
    {
        var dialog_name = this._getNameById(dialog_id);
        PoolMgr.getPerfab(dialog_name, (_dialog_node_) => {
            if (cc.isValid(_dialog_node_)) {
                this._initDialog(_dialog_node_, dialog_id, mask_id, params, zIndex);
            }
            else
            {
                console.error('[' + dialog_id + ']创建失败');
                this._setFactoryState(dialog_id, 'created');
            }
        });
    },

    _syncDialogSetting(dialog_id, mask_id)
    {
        // mask
        var _mask_node_ = this._getMask(mask_id);
        if (!cc.isValid(_mask_node_)) { return; }

        // dialog
        var _dialog_node_ = this.getDialog(dialog_id);
        if (!cc.isValid(_dialog_node_)) { return; }

        // set state
        this._setFactoryState(dialog_id, 'created');

        // init
        var _dialog_comp_ = _dialog_node_.getComponent('DialogBase');
        var _mask_comp_ = _mask_node_.getComponent('DialogMask');
        
        _mask_comp_.setMask(_dialog_comp_._getIsMask());
        _mask_comp_.setInput(_dialog_comp_._getIsInput());
        _mask_comp_.setMaskOpacity(_dialog_comp_.maskOpacity);
    },

    _initMask(mask_node, dialog_id, mask_id, zIndex)
    {
        this._getParent().addChild(mask_node, zIndex - 1);
        mask_node.setPosition(cc.v2(0, 0));

        var _mask_comp_ = mask_node.getComponent('DialogMask');
        _mask_comp_.setMaskId(mask_id);
        this.m_masks.push(mask_node);
        this._syncDialogSetting(dialog_id, mask_id);

    },

    _createMask(dialog_id, mask_id, zIndex)
    {
        var _mask_node_ = this.m_maskPool.get();
        if (!cc.isValid(_mask_node_)) {
            cc.loader.loadRes(DialogDef.DialogMask, cc.Prefab, (err, mask_prefab) => {
                var _mask_node_ = cc.instantiate(mask_prefab);
                this._initMask(_mask_node_, dialog_id, mask_id, zIndex);
            })
            return;
        }
        this._initMask(_mask_node_, dialog_id, mask_id, zIndex);

    },

    _subMask(mask_id)
    {
        for (let index = 0; index < this.m_masks.length; index++) {
            const _mask_node_ = this.m_masks[index];
            if (!cc.isValid(_mask_node_)) {
                continue;
            }
            var _mask_comp_ = _mask_node_.getComponent('DialogMask');
            if (_mask_comp_.getMaskId() == mask_id) {
                this.m_maskPool.put(_mask_node_);
                this.m_masks.splice(index, 1);
                break;
            }
        }

        // console.log('this.m_masks.length', this.m_masks.length)
    },

    _getMask(mask_id)
    {
        for (let index = 0; index < this.m_masks.length; index++) {
            const _mask_node_ = this.m_masks[index];
            var _mask_comp_ = _mask_node_.getComponent('DialogMask');
            if (_mask_comp_.getMaskId() == mask_id) {
                return _mask_node_;
            }
        }
        return null;
    },

    allocMaskIndex()
    {
        return ++this.m_maskIndex;
    },

    _getNameById(dialog_id)
    {
        return DialogDef.DialogID[dialog_id];
    },

    _getParent()
    {
        // return cc.director.getScene();
        return cc.director.getScene().getChildByName('Canvas');
    },

    listen(dialog_id, callback, cls, priority = 0) 
    {
        // var dialog_name = this._getNameById(dialog_id);
        if (dialog_id == null || dialog_id == undefined) {
            console.error('dialog listen dialog_id is null');
            return;
        }

        var dialog_name = this._getNameById(dialog_id);
        if (dialog_id == 'all') {
            dialog_name = 'all';
        }
        
        var sub_cache = this.event_cache[dialog_name] || [];
        var ievent = {callback : callback.bind(this), cls : cls, priority : priority};

        if (priority > 0) {
            let isPush = true;
            for(let i = sub_cache.length - 1; i >=0; i--) {
                if ( sub_cache[i].priority > priority) {
                    sub_cache.splice(i + 1, 0, ievent);
                    isPush = false;
                    break;
                }
            }
            if (isPush) {
                sub_cache.splice(0, 0, ievent);
            }
        } else {
            sub_cache.push(ievent);
        }
        this.event_cache[dialog_name] = sub_cache;
    
        return callback;
    },

    dispatch(dialog_id, data)
    {
        if (!dialog_id) {
            return;
        }
        var dialog_name = this._getNameById(dialog_id);
        
        let haveInvalid = false;

        var sub_cache = this.event_cache[dialog_name];
        if (sub_cache) {
            for (let i = 0; i < sub_cache.length; i++) {
                let ievent = sub_cache[i];
                if (cc.isValid(ievent.cls, true)) {
                    ievent.callback({ dialog_id : dialog_id, data : data, });
                }
                else{
                    haveInvalid = true;
                }
            }
        }

        var sub_cache = this.event_cache['all'];   // 所有界面
        if (sub_cache) {
            for (let i = 0; i < sub_cache.length; i++) {
                let ievent = sub_cache[i];
                if (cc.isValid(ievent.cls, true)) {
                    ievent.callback({ dialog_id : dialog_id, data : data, });
                }
                else{
                    haveInvalid = true;
                }
            }
        }
    },

    _removeInvalid()
    {
        for (const type in this.event_cache) {
            let sub_cache = this.event_cache[type];
            for (let i = sub_cache.length - 1; i >= 0; i--) {
                const cls = sub_cache[i].cls;
                if (cc.isValid(cls) == false) {
                    sub_cache.splice(i, 1);
                }
            }
            if (sub_cache.length == 0) {
                delete this.event_cache[type];
            }
        }
    },

    remove(dialog_id, callback)
    {
        if (!dialog_id || !callback) {
            return;
        }
        var dialog_name = this._getNameById(dialog_id);
        if (dialog_name) {
            let sub_cache = this.event_cache[dialog_name];
            if (!sub_cache) {
                return;
            }
            for (let i = 0; i < sub_cache.length; i++) {
                if (sub_cache[i].callback === callback) {
                    sub_cache.splice(i, 1);
                    break;
                }
            }
            if (sub_cache.length == 0) {
                delete this.event_cache[dialog_name];
            }            
        }

        if (dialog_id == 'all') {
            let sub_cache = this.event_cache['all'];
            if (!sub_cache) {
                return;
            }
            for (let i = 0; i < sub_cache.length; i++) {
                if (sub_cache[i].callback === callback) {
                    sub_cache.splice(i, 1);
                    break;
                }
            }
            if (sub_cache.length == 0) {
                delete this.event_cache['all'];
            } 
        }
    },
};

module.exports.__init__();