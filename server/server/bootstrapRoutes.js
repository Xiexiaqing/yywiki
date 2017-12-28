var routesConfig = require('../config/routes');
var send = require('koa-send');
var path = require('path');
var mongoose = require('mongoose');

var db = mongoose.createConnection('mongodb://127.0.0.1/yywiki');
var model_instance = {};

module.exports = function(app, router) {
	for(var o in routesConfig) {
		var model = routesConfig[o].model || [];
		var unique_model = {};
		
		for (var i = 0; i < model.length; i++) {
			var temp_model = require('../src/models/' + model[i])();

			if (!model_instance[model[i]]) {
				model_instance[model[i]] = db.model(model[i], temp_model);
			}

			unique_model[model[i]] = model_instance[model[i]];
		}

		var controller = routesConfig[o].controller;
		controller = controller ? require('../src/controllers/' + controller).call(this, unique_model) : null;

		if (routesConfig[o].method && routesConfig[o].method === 'post') {
			// app.use(route.post(o, controller));
			router.post(o, controller);
			continue;
		}

		// app.use(route.get(o, controller));
		router.get(o, controller);
	}

	app.use(router.routes());
	app.use(router.allowedMethods());

	// 404路由也返回默认html
	app.use(require('../src/controllers/app')());
};