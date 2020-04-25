/*
 * @Author: mengjl
 * @Date: 2019-12-21 14:02:46
 * @LastEditTime: 2020-04-08 15:55:19
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \client\assets\Scripts\Frameworks\sdk\wechat\Wechat.js
 */

let SDKBase = require("SDKBase")

cc.Class({
    extends: SDKBase,

    properties: {
        sdk_name : {
            default: 'wechat',
            tooltip : "SDK名字",
            override : true,
        },
        wechatUserinfoUrl : {
            default: 'https://api.weixin.qq.com/sns/userinfo?',
            tooltip : "个人信息url",
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    init()
    {
        unit.SDKMgr.onRegisterCallback('wxLoginCallback', 'V', 'unit.SDKMgr.getSDK(\'wechat\').loginCallback');
        unit.SDKMgr.onRegisterCallback('wxShareCallback', 'V', 'unit.SDKMgr.getSDK(\'wechat\').shareCallback');
    },

    login()
    {
        unit.SDKMgr.callWechatMethod('wxLogin', 'V');
    },

    getCode()
    {
        return unit.SDKMgr.callWechatMethod('getCode', 'V');
    },

    loginCallback(errCode)
    {
        var codeid = unit.SDKMgr.callWechatMethod('getCode', 'S');
        unit.log('loginCallback', errCode, codeid); 
        unit.EventMgr.dispatch(unit.SDKEvtDef.SDK_WECHAT_LOGIN, {errCode : errCode, codeid : codeid});
    },

    shareCallback(errCode, openId)
    {
        unit.log('shareCallback', errCode, openId);
        unit.EventMgr.dispatch(unit.SDKEvtDef.SDK_WECHAT_SHARE, {errCode : errCode, openId : openId});
    },

    getUserInfo(access_token, openid) {       
        //获取用户信息
        var url = this.wechatUserinfoUrl + 'access_token=' + access_token + '&openid=' + openid;

        unit.IHttp.get(url, (resp)=>{
            if (resp == null) {
                return;
            }
            unit.log('getUserInfo', JSON.stringify(resp));
            unit.EventMgr.dispatch(unit.SDKEvtDef.SDK_WECHAT_USE_INFO, resp);
        });
    },
});
