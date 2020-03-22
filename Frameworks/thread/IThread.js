/*
 * @Description: In User Settings Edit
 * @Author: mengjl
 * @Date: 2019-08-09 09:02:03
 * @LastEditors: mengjl
 * @LastEditTime: 2019-08-30 15:45:45
 */

let runtime = require("runtime")

cc.Class({
    // extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    asyn(func)
    {
        if (typeof func != 'function') {
            console.error('param func must be a function');
            return;
        }
        
        if (this.m_threads == null) {
            this.m_threads = new Array();
        }

        this.m_threads.push({type : 'function', func : func, });
    },

    wait(eventName, ...params)
    {
        if (this.m_threads == null) {
            this.m_threads = new Array();
        }

        this.m_threads.push({type : 'yield', eventName : eventName, params : params, });
    },

    sleep(delay = 0.01)
    {
        this.m_threads.push({type : 'sleep', delay : delay, });
    },

    clear()
    {
        if (this.m_threads) {
            this.m_threads.length = 0;
        }
        this.m_done = false;
    },

    _sleep(delay)
    {
        setTimeout(() => {
            this._next();
        }, 1000 * delay);
    },

    _yield(eventName, params)
    {
        this.m_eventName = eventName;
        this.m_params = params;
    },

    event(eventName)
    {
        if (this.m_eventName == eventName) {
            this._next();
        }
        else
        {
            if (this.m_params) {
               for (let index = 0; index < this.m_params.length; index++) {
                    const element = this.m_params[index];
                    if (element == eventName) {
                        this._next();
                        break;
                    }
                } 
            }
            
        }
    },

    _next()
    {
        if (this.m_done == true) {
            console.warn('coroutine is done');
            return;
        }
        
        if (this.m_co) {
            var result = this.m_co.next();
            this.m_done = result.done;
        } else {
            this.m_done = true; 
        }
        
    },

    run()
    {
        this.m_co = this._task();
        var result = this.m_co.next();
        this.m_done = result.done;
    },

    exit()
    {

    },

    *_task()
    {
        for (let index = 0; index < this.m_threads.length; index++) {
            const ithread = this.m_threads[index];
            if (ithread.type == 'function') 
            {
                try {
                    ithread.func();
                } catch (error) {
                    console.error(error);
                }
            } 
            else if (ithread.type == 'yield') 
            {
                yield this._yield(ithread.eventName, ithread.params);
            }
            else if (ithread.type == 'sleep') 
            {
                yield this._sleep(ithread.delay);
            }
        }
    },

});
