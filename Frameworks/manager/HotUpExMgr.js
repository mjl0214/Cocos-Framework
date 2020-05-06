/*
 * @Author: mengjl
 * @Date: 2020-04-29 14:36:02
 * @LastEditTime: 2020-04-29 17:13:43
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \client\assets\Scripts\Frameworks\manager\HotUpExMgr.js
 */
module.exports = {

    checkEngine(url, callback)
    {
        var data = {
            engine_version : '1.0',
        };
        unit.IHttp.get(url, (resJson)=>{
            if (resJson == null) {
                if (callback) {
                    callback(data);
                }
                return;
            }

            if (callback) {
                callback(resJson);
            }
        });
    },

    getLocalEngineVersion()
    {
        var local_engine = unit.SDKMgr.callToolMethod('getVersionName', 'S');
        if (local_engine == undefined) {
            local_engine = '1.0';
        }
        return local_engine;
    },
};