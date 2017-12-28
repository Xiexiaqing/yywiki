/*
 * 页面路由控制文件
 */
module.exports = function(sequelize) {
	return function *() {
		var path = this.path;
		var pug_name = 'index';
		var miss = false;

		if (miss) {
			this.redirect('/index');
			return;
		}

		this.render(pug_name);
	}
};