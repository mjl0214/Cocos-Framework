/**
 * 事件驱动
 */

var EventMgr = module.exports;

// 事件列表
EventMgr.event_cache = {};

/**
 * 监听事件
 * @param  {[type]} type   [description]
 * @param  {[type]} listen [description]
 * @return {[type]}        [description]
 */
EventMgr.listen = function (type, callback, cls, priority = 0) {
	// priority 越小越先触发
	if (type == null || type == undefined) {
		unit.error('listen type is null');
		return;
	}
	var sub_cache = this.event_cache[type] || [];
	var ievent = {callback : callback.bind(cls), cls : cls, priority : priority};
	// if(!event){
	// 	event = [];
	// 	this.events[type] = event;
	// }
	if (priority > 0) {
		let isPush = true;
		for(let i = sub_cache.length - 1; i >=0; i--) {
			if ( sub_cache[i].priority > priority) {
				sub_cache.splice(i + 1, 0, ievent);
				isPush = false;
				break;
			}
		}
		if (isPush) {
			sub_cache.splice(0, 0, ievent);
		}
	} else {
		sub_cache.push(ievent);
	}
	this.event_cache[type] = sub_cache;
	return callback;
	//console.log('监听一个事件 type=', type, 'listen=', listen);
};

/**
 * 派发事件
 * @param  {[type]} type [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
EventMgr.dispatch = function(type, data){
	if (!type) {
		return;
	}
	let sub_cache = this.event_cache[type];
	if (!sub_cache) {
		return;
	}

	let haveInvalid = false;

	for (let i = 0; i < sub_cache.length; i++) {
		let ievent = sub_cache[i];
		if (cc.isValid(ievent.cls, true)) {
			ievent.callback(data);
		}
		else{
			haveInvalid = true;
		}
	}

	if (haveInvalid) {
		this._removeInvalid();
	}
};

EventMgr._removeInvalid = function() {
	for (const type in this.event_cache) {
		let sub_cache = this.event_cache[type];
		for (let i = sub_cache.length - 1; i >= 0; i--) {
			const cls = sub_cache[i].cls;
			if (cc.isValid(cls) == false) {
				sub_cache.splice(i, 1);
			}
		}
		if (sub_cache.length == 0) {
			delete this.event_cache[type];
		}
	}
	// this.print();
}

/**
 * 删除一个事件
 * @param  {[type]} type   [description]
 * @param  {[type]} listen [description]
 * @return {[type]}        [description]
 */
EventMgr.remove = function(type, callback){
	if (!type || !callback) {
		return;
	}
	let sub_cache = this.event_cache[type];
	if (!sub_cache) {
		return;
	}
	for (let i = 0; i < sub_cache.length; i++) {
		if (sub_cache[i].callback === callback) {
			sub_cache.splice(i, 1);
			break;
		}
	}
	if (sub_cache.length == 0) {
		delete this.event_cache[type];
	}
};

/**
 * 删除一个类型下的所有事件
 * @param  {[type]} type   [description]
 * @return {[type]}        [description]
 */
EventMgr.removeAll = function(type){
	if (!type) {
		return;
	}
	let sub_cache = this.event_cache[type];
	if (!sub_cache) {
		return;
	}
	delete this.event_cache[type];
};

EventMgr.print = function(){
	cc.log('events:',this.event_cache);
};