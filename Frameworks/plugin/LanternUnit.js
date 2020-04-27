/*
 * @Author: mengjl
 * @Date: 2020-04-18 14:26:21
 * @LastEditTime: 2020-04-19 19:05:38
 * @LastEditors: mengjl
 * @Description: 
 * @FilePath: \PerformanceTest\assets\Script\Frameworks\plugin\LanternUnit.js
 */

cc.Class({
    extends: cc.Component,

    properties: {
        lbl_show : {
            default: null,
            type : cc.RichText, 
            tooltip : '显示文字',
        },
        run_speed : {
            default: 100,
            type : cc.Float, 
            tooltip : '移动速度',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.m_isRun = false;
        this.m_datas = [];
        this.m_showInfo = null;
        this.lbl_show.node.x = this.node.width / 2;
    },

    start () {
        this.m_isRun = true;
    },

    update (dt) {
        if (!this.m_isRun) {
            return;
        }
        this.updateRun(dt);
    },

    updateRun(dt)
    {
        if (this.m_showInfo) {
            this.lbl_show.node.x -= dt * this.run_speed;
            if (this.lbl_show.node.x + this.lbl_show.node.width <= -this.node.width / 2) {
                this.m_showInfo = null;
            }
        } else {
            this.nextInfo();        
        }
    },

    setRun(isRun)
    {
        this.m_isRun = isRun;
    },

    pushInfo(data)
    {
        if (!data.hasOwnProperty('priority')) {
            data.priority = 0;
        }

        if (data.priority < 0) {// 立刻
            this.m_datas.unshift(data);
            this.nextInfo();
        }
        else if (data.priority == 0) {// 正常顺序
            this.m_datas.push(data);
        }
        else
        {
            let isPush = true;
            for (let i = 0; i < this.m_datas.length; i++) {
                if (this.m_datas[i].priority < 0) {
                    continue;
                }
                if (this.m_datas[i].priority < data.priority) {
                    this.m_datas.splice(i, 0, data);
                    isPush = false;
                    break;
                }
                if (this.m_datas[i].priority > data.priority) {
                    this.m_datas.splice(i + 1, 0, data);
                    isPush = false;
                    break;
                }
            }
            if (isPush) {
                this.m_datas.push(data);
            }
        }

        console.error(this.m_datas);
    },

    nextInfo()
    {
        if (this.m_datas.length <= 0) {
            return;
        }

        this.m_showInfo = this.m_datas.shift();
        this._setInfo();
    },
    
    _setInfo()
    {
        if (this.m_showInfo == null) {
            return;
        }

        this.lbl_show.string = this.m_showInfo.text;
        this.lbl_show.node.x = this.node.width / 2;
    },
});
