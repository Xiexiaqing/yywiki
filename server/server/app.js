var koa = require('koa');
var path = require('path');
var fs = require('fs');
var serve = require('koa-static');
var router = require('koa-router')();
var logger = require('koa-logger');
var jsonp = require('koa-jsonp');
var Pug = require('koa-pug');
var cors = require('koa-cors');

var config = require('../config');
var bootstrapRoutes = require('./bootstrapRoutes');
var err_middleware = require('../src/middleware/error');
var referer_middleware = require('../src/middleware/referer');
var token_middleware = require('../src/middleware/token');

module.exports = function() {
	/******************************************************
	 * Initialize application
	 ******************************************************/
	var app = module.exports = koa();
	app.use(logger());
	app.use(cors({
		headers: "Authorization",
		methods: 'GET,PUT,POST,HEAD,OPTIONS'
	}));
	app.context.env = process.env.NODE_ENV;

	/** Define pug template render **/
	var pug = new Pug({
	  	viewPath: path.resolve(path.join(__dirname, '../src/'), 'views'),
	  	debug: true,
	  	locals: {
	    	page_title: 'Koa-pug',
	    	author: 'wudi3'
	  	},
	  	app: app
	});

	app.use(token_middleware(app));
	app.use(referer_middleware(app));
	app.use(err_middleware(app));

	/** Define public path, for css/js/images **/
	app.use(serve(path.join(__dirname, '../src/public')));

	/** Define error middleware **/

	/******************************************************
	 * Initialize Sequelize
	 ******************************************************/
	// var sequelize = require('../src/common/sequelize');
	
	/******************************************************
	 * Bootstrap route by config
	 ******************************************************/
	bootstrapRoutes(app, router);

	/******************************************************
	 * Start server
	 ******************************************************/
	//if (!module.parent) {  
	  	var port = process.env.PORT || config.port || 8001;
	  	app.listen(port);
	  	console.log('Running %s site at: http://localhost:%d', config.projectName, port);
	//}
};