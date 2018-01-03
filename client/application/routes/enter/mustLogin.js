
/* @description 路由on_enter函数配置
 * @version 0.1
 * @returns {Json} 路由配置对象
 *	'/key': {
 *		component_path: '', // comps文件夹下智能组件地址{String}
 *		title:'',			// 页面标题{String}
 *		state_path: ''		// states文件夹下action文件地址{String}，初始化数据函数默认为"initAllData"
 *	}
 */

export default function(props) {
    let token = window.localStorage.getItem('jwt_token') || '';
    if (token) {
        return;
    }
    
    window.location.replace("/signin");
    return true;
}
