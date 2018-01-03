
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
            on_enter: 'mustLogin',
            state_path: 'home/index'
        },
        '/article': {
            component_path: 'Article/Article',
            title: "文章",
            on_enter: 'mustLogin',
            state_path: ""
        },
        '/create': {
            component_path: 'Create/Create',
            title: "发消息",
            on_enter: 'mustLogin',
            state_path: "create/index"
        },
        '/mine': {
            component_path: 'Mine/Mine',
            title: "我",
            on_enter: 'mustLogin',
            state_path: "mine/index"
        },
        '/signin': {
            component_path: 'Signin/Signin',
            title: "登录",
            state_path: "signin/index"
        },
        '/signup': {
            component_path: 'Signup/Signup',
            title: "注册",
            state_path: "signup/index"
        }
    },
    root: '/',
    index_route: '/home',
    wrap_component_path: 'App/App',
    error_component_path: 'Error/Error'
};
