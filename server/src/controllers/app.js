/*
 * 页面路由控制文件
 */
module.exports = function(sequelize) {
	return function *() {
		var path = this.path;
		var pug_name = 'release';
		var miss = false;
		var now_env = process.env.NODE_ENV;

		if (now_env === 'development') {
			pug_name = 'dev';
		}

		if (miss) {
			this.redirect('/dev');
			return;
		}

		this.render(pug_name);
	}
};