
/* @description 路由配置文件
 * @version 0.1
 * @returns {Json} 路由配置对象
 *	'/key': {
 *		component_path: '', // comps文件夹下智能组件地址{String}
 *		title:'',			// 页面标题{String}
 *		state_path: ''		// states文件夹下action文件地址{String}，初始化数据函数默认为"initAllData"
 *	}
 */

module.exports = {
    route: {
        '/errpage': {
            component_path: 'Error/Error',
            title: '出错啦',
            state_path: ''
        },
        '/home': {
            component_path: 'Home/Home',
            title: '首页',
            state_path: 'home/index'
        },
        '/article': {
            component_path: 'Article/Article',
            title: "文章",
            state_path: ""
        },
        '/create': {
            component_path: 'Create/Create',
            title: "发消息",
            state_path: "create/index"
        }
    },
    root: '/',
    index_route: '/home',
    wrap_component_path: 'App/App',
    error_component_path: 'Error/Error'
};
