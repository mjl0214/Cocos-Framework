/*
 * @Author: mengjl
 * @Date: 2020-04-18 16:31:09
 * @LastEditTime: 2020-04-20 10:19:38
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \PerformanceTest\assets\Script\Frameworks\plugin\ScrollPageUnit.js
 */

let SCROLL_MODEL = cc.Enum({
    SCROLL_FREE : 0,    // 自由
    SCROLL_POINT : 1,    // 固定位置
});

cc.Class({
    extends: cc.Component,

    properties: {
        scroll_item : {
            default: null,
            type : cc.Node, 
            tooltip : '滚动节点',
        },
        scroll_model : {
            default: SCROLL_MODEL.SCROLL_FREE,
            type : cc.Enum(SCROLL_MODEL), 
            tooltip : '滚动模式',
        },
        show_num : {
            default: 3,
            type : cc.Integer,
            min : 1,
            tooltip : '显示的数量',
            notify() {
                if (this.max_num < this.show_num) {
                    this.max_num = this.show_num;
                }
            }
        },
        max_num : {
            default: 3,
            type : cc.Integer,
            min : 1, 
            tooltip : '最大数量',
            notify() {
                if (this.max_num < this.show_num) {
                    this.max_num = this.show_num;
                }
            }
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.scroll_item.active = false;
        this.m_scroll_list = [];
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },

    start () {
        this.init(this.show_num);
    },

    // update (dt) {},

    init(num)
    {
        this.node.removeAllChildren();
        this.m_scroll_list = [];
        for (let i = 0; i < num; i++) {
            var scroll_item = cc.instantiate(this.scroll_item);
            scroll_item.active = true;
            this.node.addChild(scroll_item);
            this.m_scroll_list.push(scroll_item);

            // scroll_item.getComponent(cc.Animation).getClips()
            scroll_item._progress_ = i / num;
            this.setPos(scroll_item, i / num);
        }
    },
    
    setPos(scroll_item, progress)
    {
        var defaultClip = scroll_item.getComponent(cc.Animation).defaultClip;
        scroll_item.getComponent(cc.Animation).play(defaultClip.name);
        scroll_item.getComponent(cc.Animation).setCurrentTime(defaultClip.duration * progress);
        scroll_item.getComponent(cc.Animation).stop(defaultClip.name);
    },

    onTouchMove(evt)
    {
        var dt = evt.getDelta().x;
        for (let i = 0; i < this.m_scroll_list.length; i++) {
            const scroll_item = this.m_scroll_list[i];
            scroll_item._progress_ += (dt / this.node.width);
            this.setPos(scroll_item, scroll_item._progress_);
        }
    },

    onTouchEnd(evt)
    {
        if (this.scroll_model == SCROLL_MODEL.SCROLL_POINT) {
            
        }
    },
});
