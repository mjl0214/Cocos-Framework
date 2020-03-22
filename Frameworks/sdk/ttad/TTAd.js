/*
 * @Author: mengjl
 * @Date: 2019-12-22 16:22:31
 * @LastEditTime: 2020-03-16 11:27:12
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \Plant\assets\Scripts\Frameworks\sdk\ttad\TTAd.js
 */

let SDKBase = require("SDKBase")

cc.Class({
    extends: SDKBase,

    properties: {
        sdk_name : {
            default: 'ttad',
            tooltip : "SDK名字",
            override : true,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    init()
    {
        unit.SDKMgr.onRegisterCallback('ttLoadRewardVideoAd', 'V', 'unit.SDKMgr.getSDK(\'ttad\').loadRewardVideoAd');
        unit.SDKMgr.onRegisterCallback('ttRewardAdInteraction', 'V', 'unit.SDKMgr.getSDK(\'ttad\').rewardAdInteraction');
        unit.SDKMgr.onRegisterCallback('ttLoadInteractionAd', 'V', 'unit.SDKMgr.getSDK(\'ttad\').loadInteractionAd');
        unit.SDKMgr.onRegisterCallback('ttLoadBannerAd', 'V', 'unit.SDKMgr.getSDK(\'ttad\').loadBannerAd');
        unit.SDKMgr.onRegisterCallback('ttLoadFeedAd', 'V', 'unit.SDKMgr.getSDK(\'ttad\').loadFeedAd');
    },

    loadRewardVideoAd(errCode)
    {
        unit.log('loadRewardVideoAd', errCode);
        if (errCode == 0) {
            unit.SDKMgr.callTTADMethod('playRewardAd', 'V');
        }
    },

    rewardAdInteraction(key, ...params)
    {
        unit.log('rewardAdInteraction', key, ...params);
        unit.EventMgr.dispatch(unit.SDKEvtDef.SDK_TTAD_REWARD, {key : key, params : params});
    },

    loadInteractionAd(errCode, msg)
    {
        unit.log('loadInteractionAd', errCode, msg);
    },

    loadBannerAd(errCode, msg)
    {
        unit.log('loadBannerAd', errCode, msg);
    },

    loadFeedAd(key, ...params)
    {
        unit.log('loadFeedAd', key, ...params);
    },
});
