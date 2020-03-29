/*
 * @Author: mengjl
 * @Date: 2020-03-29 11:16:51
 * @LastEditTime: 2020-03-29 15:41:28
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \Plant\assets\Scripts\Frameworks\manager\mvc\MVUnit.js
 */

// let MVDef = require('MVDef')

cc.Class({
    extends: cc.Component,

    properties: {
        bind_key : {
            default : '',
            tooltip : '绑定值',
        },
        bind_type : {
            default : 'unknown',
            tooltip : '绑定类型',
            readonly : true,
        },
        s_uuid : {
            default : '',
            tooltip : 'uuid',
            readonly : true,
        },
        t_type : {
            default : -1,
            type : unit.MVDef,
            tooltip : 'uuid',
        },
    },

    editor : {
        executeInEditMode : true,
    },

    onLoad () {
        if (CC_EDITOR) {
            this.setType();
            this.showUUID();

            // cc.Class.Attr/setClassAttr(this, 't_type', {
            //     type: 'Enum',
            //     enumList: cc.Enum.getList(cc.Enum({}))
            // });
            cc.Class["Attr"].setClassAttr(this, 't_type', 'type', 'Enum');
            cc.Class["Attr"].setClassAttr(this, 't_type', 'enumList', cc.Enum.getList(unit.MVDef));
        }
    },

    start () {
    },

    // update (dt) {},

    onEnable()
    {
        // if (!CC_EDITOR) {
            unit.MVMgr.bind(this.node);
        // }
    },

    onDisable()
    {
        // if (!CC_EDITOR) {
            unit.MVMgr.unbund(this.node);
        // }
    },

    setType()
    {
        if (this.node.getComponent(cc.Label)) {
            this.bind_type = 'cc.Label';
        }
        else if (this.node.getComponent(cc.Sprite)) {
            this.bind_type = 'cc.Sprite';
        }
        else if (this.node.getComponent(sp.Skeleton)) {
            this.bind_type = 'sp.Skeleton';
        }
    },

    showUUID()
    {
        this.s_uuid = this.uuid;
    },

    handleData(data)
    {
        if (this.bind_type == 'cc.Label') {
            if (data.str) {
                var lbl = this.node.getComponent(cc.Label);
                lbl.string = data.str;              
            }
        }
        else if (this.bind_type == 'cc.Sprite') {
            if (data.img) {
                var img = this.node.getComponent(cc.Sprite);
                unit.ResMgr.replaceFrame(img, data.img[0], data.img[1]);
            }
            
        }
        else if (this.bind_type == 'sp.Skeleton') {
            if (data.skel) {
                var skel = this.node.getComponent(sp.Skeleton);
                unit.ResMgr.replaceSkeletonData(skel, data.skel);
            }
        }
    },
});
