import React from 'react';
import nav_imgae from 'statics/images/navline.png';

export default class Nav extends React.Component {
    handle = () =>{
        $.get("logout",function(res){
            var result = res;
            if(result=='1') {   
                alert('你已成功注销！');
                window.location.replace('/login');
            } else{
                alert('注销失败！');
            }
        });
    }
    render() {
        // 遮脸的name需要换一个地方取
        return (
            <div className="navclass">
                <img src={ nav_imgae } className="Navimg"  alt="..."  />
            </div>
        );
    }
}