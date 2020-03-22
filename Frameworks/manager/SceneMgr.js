/*
 * @Author: mengjl
 * @Date: 2019-11-25 09:10:58
 * @LastEditTime: 2019-11-25 09:29:31
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \NewResProject\assets\Script\Frameworks\manager\SceneMgr.js
 */


module.exports = {

    m_load_data : null,
    m_loading_scene_name : '',
    
    loadScene(scene_name, data)
    {
        if (cc.isValid(cc.director.getScene())) {
            if (cc.director.getScene().name == scene_name) {
                return;
            }
        }

        this.m_load_data = data;

        cc.director.loadScene(scene_name);
    },

    getLoadData()
    {
        return this.m_load_data;
    },

    setLoading(scene_name)
    {
        this.m_loading_scene_name = scene_name;
    },

    loadingScene(scene_name)
    {
        if (this.m_loading_scene_name == '') {
            this.loadScene(scene_name);
        }
        else
        {
            this.loadScene(this.m_loading_scene_name, scene_name);
        }
    },

    isScene(scene_name)
    {
        if (cc.isValid(cc.director.getScene())) {
            if (cc.director.getScene().name == scene_name) {
                return true;
            }
        }
        return false;
    },

};
