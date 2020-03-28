/*
 * @Author: mengjl
 * @Date: 2020-03-28 14:03:12
 * @LastEditTime: 2020-03-28 15:22:30
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \client\assets\Scripts\Frameworks\helper\ui18n\InterMgr.js
 */
module.exports = {

    _inter_map : {},
    _current_language : 'en',

    __init__()
    {
        cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
            cc.loader.loadResDir('I18n', cc.JsonAsset, (error, res_list) => {
                if (error) {
                    return;
                }
                // console.error(res_list);
                for (let index = 0; index < res_list.length; index++) {
                    // this.effectAssets[res[index]._name] = res_list[index];
                    this._loadLanguage(res_list[index]);
                }
                // this.effectAssets[] = res;
            });
        });
    },

    _loadLanguage(asset)
    {
        console.error(asset);
        this._inter_map[asset.name] = asset.json;
    },

    setLanguage(language)
    {
        this._current_language = language;
    },

    t(translate_string)
    {
        var json_map = this._inter_map[this._current_language];
        if (json_map == null) {
            return translate_string;
        }

        var result_string = json_map[translate_string];
        if (result_string != null) {
            return result_string;
        }
        return translate_string;
    },
};
module.exports.__init__();