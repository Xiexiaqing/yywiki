/* 只能被dispatch调用使用
 */

export default function(msg) {
    return (dispatch, getState) => {
        dispatch({
            type: 'REPOCH_MSG',
            msg: msg
        });
    };
}