/*
*  用于iframe内外通信。
*  iconnect.trigger('insertIntoPublishTop', 'aaa', function(){'callback'});
*/

(function(window, document, undefined){

	//STK的自定义事件
	var cEvt = (function(){

		//===自定义事件依赖关系===
		var isArray = function(o){
			return Object.prototype.toString.call(o) === '[object Array]';
		};
		var getType = function(oObject){
			var _t;
			return ((_t = typeof(oObject)) == "object" ? oObject == null && "null" || Object.prototype.toString.call(oObject).slice(8, -1) : _t).toLowerCase();
		};
		//====================

		var custEventAttribute = "__custEventKey__",
			custEventKey = 1,
			custEventCache = {},
			/**
			 * 从缓存中查找相关对象 
			 * 当已经定义时 
			 * 	有type时返回缓存中的列表 没有时返回缓存中的对象
			 * 没有定义时返回false
			 * @param {Object|number} obj 对象引用或获取的key
			 * @param {String} type 自定义事件名称
			 */
			findCache = function(obj, type) {
				var _key = (typeof obj == "number") ? obj : obj[custEventAttribute];
				return (_key && custEventCache[_key]) && {
					obj: (typeof type == "string" ? custEventCache[_key][type] : custEventCache[_key]),
					key: _key
				};
			};
		////
		//事件迁移相关
		var hookCache = {};//arr key -> {origtype-> {fn, desttype}}
		//
		var add = function(obj, type, fn, data, once) {
			if(obj && typeof type == "string" && fn) {
				var _cache = findCache(obj, type);
				if(!_cache || !_cache.obj) {
					throw "custEvent (" + type + ") is undefined !";
				}
				_cache.obj.push({fn: fn, data: data, once: once});
				return _cache.key;
			}
		};
		
		var fire = function(obj, type, args, defaultAction) {
			//事件默认行为阻止
			var preventDefaultFlag = true;
			var preventDefault = function() {
				preventDefaultFlag = false;
			};
			if(obj && typeof type == "string") {
				var _cache = findCache(obj, type), _obj;
				if (_cache && (_obj = _cache.obj)) {
					args = typeof args != 'undefined' && [].concat(args) || [];
					for(var i = _obj.length - 1; i > -1 && _obj[i]; i--) {
						var fn = _obj[i].fn;
						var isOnce = _obj[i].once;
						if(fn && fn.apply) {
							try{
								fn.apply(obj, [{obj: obj, type: type, data: _obj[i].data, preventDefault: preventDefault}].concat(args));
								if(isOnce){
									_obj.splice(i,1);
								}
							} catch(e) {
								window.console && console.log("[error][custEvent]" + e.message, e, e.stack);
							}
						}
					}
					
					
					if(preventDefaultFlag && getType(defaultAction) === 'function') {
						defaultAction();
					}
					return _cache.key;
				}
			}
		};
		
		var that = {
			/**
			 * 对象自定义事件的定义 未定义的事件不得绑定
			 * @method define
			 * @static
			 * @param {Object|number} obj 对象引用或获取的下标(key); 必选 
			 * @param {String|Array} type 自定义事件名称; 必选
			 * @return {number} key 下标
			 */
			define: function(obj, type) {
				if(obj && type) {
					var _key = (typeof obj == "number") ? obj : obj[custEventAttribute] || (obj[custEventAttribute] = custEventKey++),
						_cache = custEventCache[_key] || (custEventCache[_key] = {});
					type = [].concat(type);
					for(var i = 0; i < type.length; i++) {
						_cache[type[i]] || (_cache[type[i]] = []);
					}
					return _key;
				}
			},
			
			/**
			 * 对象自定义事件的取消定义 
			 * 当对象的所有事件定义都被取消时 删除对对象的引用
			 * @method define
			 * @static
			 * @param {Object|number} obj 对象引用或获取的(key); 必选
			 * @param {String} type 自定义事件名称; 可选 不填可取消所有事件的定义
			 */
			undefine: function(obj, type) {
				if (obj) {
					var _key = (typeof obj == "number") ? obj : obj[custEventAttribute];
					if (_key && custEventCache[_key]) {
						if (type) {
							type = [].concat(type);
							for(var i = 0; i < type.length; i++) {
								if (type[i] in custEventCache[_key]) delete custEventCache[_key][type[i]];
							}
						} else {
							delete custEventCache[_key];
						}
					}
				}
			},
			
			/**
			 * 事件添加或绑定
			 * @method add
			 * @static
			 * @param {Object|number} obj 对象引用或获取的(key); 必选
			 * @param {String} type 自定义事件名称; 必选
			 * @param {Function} fn 事件处理方法; 必选
			 * @param {Any} data 扩展数据任意类型; 可选
			 * @return {number} key 下标
			 */
			add: function(obj, type, fn, data) {
				return add(obj, type, fn, data, false);
			},
			/**
			 * 单次事件绑定
			 * @method once
			 * @static
			 * @param {Object|number} obj 对象引用或获取的(key); 必选
			 * @param {String} type 自定义事件名称; 必选
			 * @param {Function} fn 事件处理方法; 必选
			 * @param {Any} data 扩展数据任意类型; 可选
			 * @return {number} key 下标
			 */
			once: function(obj, type, fn, data) {
				return add(obj, type, fn, data, true);
			},
			/**
			 * 事件删除或解绑
			 * @method remove
			 * @static
			 * @param {Object|number} obj 对象引用或获取的(key); 必选
			 * @param {String} type 自定义事件名称; 可选; 为空时删除对象下的所有事件绑定
			 * @param {Function} fn 事件处理方法; 可选; 为空且type不为空时 删除对象下type事件相关的所有处理方法
			 * @return {number} key 下标
			 */
			remove: function(obj, type, fn) {
				if (obj) {
					var _cache = findCache(obj, type), _obj, index;
					if (_cache && (_obj = _cache.obj)) {
						if (isArray(_obj)) {
							if (fn) {
								//for (var i = 0; i < _obj.length && _obj[i].fn !== fn; i++);
								var i = 0;
								while(_obj[i]) {
									if(_obj[i].fn === fn) {
										break;
									}
									i++;
								}
								_obj.splice(i, 1);
							} else {
								_obj.splice(0, _obj.length);
							}
						} else {
							for (var i in _obj) {
								_obj[i] = [];
							}
						}
						return _cache.key;
					}
				}
			},
			
			/**
			 * 事件触发
			 * @method fire
			 * @static
			 * @param {Object|number} obj 对象引用或获取的(key); 必选
			 * @param {String} type 自定义事件名称; 必选
			 * @param {Any|Array} args 参数数组或单个的其他数据; 可选
			 * @param {Function} defaultAction 触发事件列表结束后的默认Function; 可选 注：当args不需要时请用undefined/null填充,以保证该参数为第四个参数
			 * @return {number} key 下标
			 */
			fire: function(obj, type, args, defaultAction) {
				return fire(obj, type, args, defaultAction);
			},
			/**
			 * 事件由源对象迁移到目标对象
			 * @method hook
			 * @static
			 * @param {Object} orig 源对象
			 * @param {Object} dest 目标对象
			 * @param {Object} typeMap 事件名称对照表
			 * {
			 * 	源事件名->目标事件名
			 * }
			 */
			hook: function(orig, dest, typeMap) {
				if(!orig || !dest || !typeMap) {
					return;
				}
				var destTypes = [],
					origKey = orig[custEventAttribute],
					origKeyCache = origKey && custEventCache[origKey],
					origTypeCache,
					destKey = dest[custEventAttribute] || (dest[custEventAttribute] = custEventKey++),
					keyHookCache;
				if(origKeyCache) {
					keyHookCache = hookCache[origKey +'_'+ destKey] || (hookCache[origKey +'_'+ destKey] = {});
					var fn = function(event) {
						var preventDefaultFlag = true;
						fire(dest, keyHookCache[event.type].type, Array.prototype.slice.apply(arguments, [1, arguments.length]), function() {
							preventDefaultFlag = false
						});
						preventDefaultFlag && event.preventDefault();
					};
					for(var origType in typeMap) {
						var destType = typeMap[origType];
						if(!keyHookCache[origType]) {
							if(origTypeCache = origKeyCache[origType]) {
								origTypeCache.push({fn: fn, data: undefined});
								keyHookCache[origType] = {
									fn: fn,
									type: destType
								};
								destTypes.push(destType);
							}
						}
					}
					that.define(dest, destTypes);
				}
			},
			/**
			 * 取消事件迁移
			 * @method unhook
			 * @static
			 * @param {Object} orig 源对象
			 * @param {Object} dest 目标对象
			 * @param {Object} typeMap 事件名称对照表
			 * {
			 * 	源事件名->目标事件名
			 * }
			 */
			unhook: function(orig, dest, typeMap) {
				if(!orig || !dest || !typeMap) {
					return;
				}
				var origKey = orig[custEventAttribute],
					destKey = dest[custEventAttribute],
					keyHookCache = hookCache[origKey +'_'+ destKey];
				if(keyHookCache) {
					for (var origType in typeMap) {
						var destType = typeMap[origType];
						if (keyHookCache[origType]) {
							that.remove(orig, origType, keyHookCache[origType].fn);
						}
					}
				}
			},
			/**
			 * 销毁
			 * @method destroy
			 * @static
			 */
			destroy: function() {
				custEventCache = {};
				custEventKey = 1;
				hookCache = {};
			}
		};
		return that;
	})();
	var utils = {
		count: 0,
		getUniqueKey: function(){
			return +new Date() + (Math.random()+'').replace('.','') + utils.count++;
		},
		json2str: (function(){
				function f(n){
					// Format integers to have at least two digits.
					return n < 10 ? '0' + n : n;
				}
				
				if (typeof Date.prototype.toJSON !== 'function') {
				
					Date.prototype.toJSON = function(key){
					
						return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
					};
					
					String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key){
						return this.valueOf();
					};
				}
				
				var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = { // table of character substitutions
					'\b': '\\b',
					'\t': '\\t',
					'\n': '\\n',
					'\f': '\\f',
					'\r': '\\r',
					'"': '\\"',
					'\\': '\\\\'
				}, rep;
				
				
				function quote(string){
				
					// If the string contains no control characters, no quote characters, and no
					// backslash characters, then we can safely slap some quotes around it.
					// Otherwise we must also replace the offending characters with safe escape
					// sequences.
					escapable.lastIndex = 0;
					return escapable.test(string) ? '"' +
					string.replace(escapable, function(a){
						var c = meta[a];
						return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					}) +
					'"' : '"' + string + '"';
				}
				
				
				function str(key, holder){
				
					// Produce a string from holder[key].
					var i, // The loop counter.
			 k, // The member key.
			 v, // The member value.
			 length, mind = gap, partial, value = holder[key];
					
					// If the value has a toJSON method, call it to obtain a replacement value.
					if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
						value = value.toJSON(key);
					}
					
					// If we were called with a replacer function, then call the replacer to
					// obtain a replacement value.
					if (typeof rep === 'function') {
						value = rep.call(holder, key, value);
					}
					
					// What happens next depends on the value's type.
					switch (typeof value) {
						case 'string':
							return quote(value);
							
						case 'number':
							
							// JSON numbers must be finite. Encode non-finite numbers as null.
							return isFinite(value) ? String(value) : 'null';
							
						case 'boolean':
						case 'null':
							
							// If the value is a boolean or null, convert it to a string. Note:
							// typeof null does not produce 'null'. The case is included here in
							// the remote chance that this gets fixed someday.
							return String(value);
							
						// If the type is 'object', we might be dealing with an object or an array or
						// null.
						case 'object':
							
							// Due to a specification blunder in ECMAScript, typeof null is 'object',
							// so watch out for that case.
							if (!value) {
								return 'null';
							}
							
							// Make an array to hold the partial results of stringifying this object value.
							gap += indent;
							partial = [];
							
							// Is the value an array?
							if (Object.prototype.toString.apply(value) === '[object Array]') {
							
								// The value is an array. Stringify every element. Use null as a placeholder
								// for non-JSON values.
								length = value.length;
								for (i = 0; i < length; i += 1) {
									partial[i] = str(i, value) || 'null';
								}
								
								// Join all of the elements together, separated with commas, and wrap them in
								// brackets.
								v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
								gap = mind;
								return v;
							}
							
							// If the replacer is an array, use it to select the members to be stringified.
							if (rep && typeof rep === 'object') {
								length = rep.length;
								for (i = 0; i < length; i += 1) {
									k = rep[i];
									if (typeof k === 'string') {
										v = str(k, value);
										if (v) {
											partial.push(quote(k) + (gap ? ': ' : ':') + v);
										}
									}
								}
							}
							else {
							
								// Otherwise, iterate through all of the keys in the object.
								for (k in value) {
									if (Object.hasOwnProperty.call(value, k)) {
										v = str(k, value);
										if (v) {
											partial.push(quote(k) + (gap ? ': ' : ':') + v);
										}
									}
								}
							}
							
							// Join all of the member texts together, separated with commas,
							// and wrap them in braces.
							v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
							gap = mind;
							return v;
					}
				}
				return function(value, replacer, space){
					if(window.JSON && window.JSON.stringify){
						return window.JSON.stringify(value, replacer, space);
					}
					// The stringify method takes a value and an optional replacer, and an optional
					// space parameter, and returns a JSON text. The replacer can be a function
					// that can replace values, or an array of strings that will select the keys.
					// A default replacer method can be provided. Use of the space parameter can
					// produce text that is more easily readable.
					var i;
					gap = '';
					indent = '';
					
					// If the space parameter is a number, make an indent string containing that
					// many spaces.
					if (typeof space === 'number') {
						for (i = 0; i < space; i += 1) {
							indent += ' ';
						}
						
						// If the space parameter is a string, it will be used as the indent string.
					}
					else 
						if (typeof space === 'string') {
							indent = space;
						}
					
					// If there is a replacer, it must be a function or an array.
					// Otherwise, throw an error.
					rep = replacer;
					if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
						throw new Error('JSON.stringify');
					}
					
					// Make a fake root object containing our value under the key of ''.
					// Return the result of stringifying the value.
					return str('', {
						'': value
					});
				};
		})(),
		str2json: function(str){
			try{
				return eval('('+str+')');
			}catch(e){
				return null;
			}
		},
		getUrlParam: function(name){
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象.
			var r = window.location.search.substr(1).match(reg);  //匹配目标参数
			if (r!=null){ 
				return unescape(r[2]);
			}
			return null;
		}
	};

	var iframeConnect = function(){
		var cidList = {};
		var event = {};
		var iid = window.name;

		var post = function(cid, cmd, param){			
			//iid    iframe的id 			
			//cid    这个任务的id
			//cmd    clinet段调用回调函数的方法名
			//param  这个任务的参数 数组
			var msg = utils.json2str(param === undefined ? {iid: iid, cid: cid, cmd: cmd} : {iid: iid, cid: cid, cmd: cmd, param: param});
			if(window.parent.postMessage){
				window.parent.postMessage(msg ,'*');
			}else{
				window.navigator['STK_IFRAME_CONNECT_OUT'](msg);
			}
		};
		var listener = function(evt){
			try{
				var data = utils.str2json(evt.data);
				if(data.cid && data.cid == '_EVENT_'){
					cEvt.define(event, data.call);
					cEvt.fire(event, data.call, data.rs);
				}
				else if(data.cid && data.cid in cidList){
					try{
						var call = data.call == 'callback' ? cidList[data.cid] : cidList[data.cid][data.call];
						call(data.rs);
						delete cidList[data.cid];
					}catch(e){}
				}
			}catch(e){}
		}

		if(window.postMessage){
			if(window.addEventListener){
				window.addEventListener('message', listener ,false);
			}else{
				window.attachEvent('onmessage', listener);
			}			
		}else{			
			window.navigator['STK_IFRAME_CONNECT_'+iid] = function(data){ listener({ data: data }) };			
		}

		return {
			trigger: function(cmd, param, callback){
				if((typeof param).toUpperCase() === 'FUNCTION'){
					callback = param;
					param = undefined;
				}
				var cid = utils.getUniqueKey();
				callback && (cidList[cid] = callback);
				post(cid, cmd, param);
			},
			on: function(cmd, fn){
				cEvt.define(event, cmd);
				cEvt.add(event, cmd, fn);
			},
			off: function(cmd, fn){
				cEvt.remove(event, cmd, fn);
			}
		};
	};

	//兼容原来的api
	var iconnect = window.iconnect = iframeConnect();
	window.iframeConnect = function(){
		return iconnect;
	};
	iconnect.setHeight = function(num, callback){
		iconnect.trigger('setHeight', num, callback);
	};
	iconnect.getLayoutInfo = function(callback){
		iconnect.trigger('getLayoutInfo', callback);
	};
	iconnect.oauth = function(options){
		if(options.appkey == null || options.callback == null){
			return;
		}
		var doc = document, iframe_id = "page_app_oauth_iframe";
		var url = "https://api.weibo.com/2/oauth2/authorize?client_id=" + options.appkey
					 + "&response_type=code&redirect_uri=" + encodeURIComponent(options.callback) + "&quick_auth=true";
		if(doc.getElementById(iframe_id) == null){
			var iframe = doc.createElement('iframe');
			iframe.id = iframe_id;
			// iframe.setAttribute("style", "position:absolute;left:-1000px;top:-1000px;display:none");
			iframe.style.cssText = "position:absolute;left:-1000px;top:-1000px;display:none";
			iframe.src = url;
			document.body.appendChild(iframe);
		} else {
			doc.getElementById(iframe_id).src = url;	
		}
	};
})(window, document);




