/*
 * @Description: In User Settings Edit
 * @Author: mengjl
 * @Date: 2019-11-15 17:29:36
 * @LastEditors: mengjl
 * @LastEditTime: 2020-04-01 20:33:06
 */

module.exports = {
    __init__()
    {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onKeyDown(event)
    {
        switch (event.keyCode) {
            case cc.macro.KEY.escape:
                unit.ResMgr.logger();
                break;
            case cc.macro.KEY.t:
                uTool.UtilMgr.treeNode();
                break;
            default:
                break;
        }
    },
};
module.exports.__init__();