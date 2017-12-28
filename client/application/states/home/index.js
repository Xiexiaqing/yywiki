import admin_trans from 'kits/trans/admin';
import setMsgToast from 'kits/setMsgToast';
import jsonToQuery from 'kits/jsonToQuery';

export function initPage() {
    return async (dispatch, getState) => {
        try {
            dispatch(getList({ user_id: 'yiyi' }));
        } catch (e) {
            dispatch(setMsgToast(e.message));
        }
    };
}

export function getList(post_data) {
    return async (dispatch, getState) => {
        try {
            let now_feed_list = Array.concat([], getState()['home.index'].feed_list);
            if (post_data.page === 1) {
                now_feed_list = [];
            }

            admin_trans.request('list', jsonToQuery(post_data)).then(function(succ_res){
                now_feed_list = now_feed_list.concat(succ_res.data.list);
                now_feed_list.sort(function(a, b){ return a.date < b.date; })

                dispatch({
                    type: 'LIST_INIT_DATA',
                    feed_list: now_feed_list,
                    page: succ_res.data.page,
                    total_page: succ_res.data.total_page
                });
            }, function(err_res){
                dispatch(setMsgToast(err_res.msg || '网络错误，请稍后再试'));
            });
        } catch (e) {
            dispatch(setMsgToast(e.message));
        }
    };
}

export function setMsg(msg) {
    return {
        type: "AUDIT_SETTING_UPDATE_MSG",
        msg: msg
    };
};

//-----------------
// reducer block
//-----------------
export const initialState = {
    msg: '',
    feed_list: [
        // {
        //     type: "text",
        //     title: '',
        //     text: '伊伊刚才醒了，没找到我，叫了一生妈，然后我赶紧过去应答一声。小家伙摸了一下我的胳膊转过头又睡了。',
        //     date: "2017-12-17 23:15",
        //     belong_date: "2017-12-17"
        // },
        // {
        //     type: "pic",
        //     pics: [
        //         {
        //             url: "http://wx1.sinaimg.cn/large/61e7f4aaly1fmsuxm2b6nj20dm0h1q3a.jpg"
        //         },
        //         {
        //             url: "http://wx2.sinaimg.cn/large/61e7f4aaly1fmsuxm3f6vj208c0b40su.jpg"
        //         },
        //         {
        //             url: "http://wx1.sinaimg.cn/large/61e7f4aaly1fmsuxp61unj20go0iqq3q.jpg"
        //         },
        //         {
        //             url: "http://wx1.sinaimg.cn/large/61e7f4aaly1fmsuxm3jb3j20b40bstas.jpg"
        //         },
        //         {
        //             url: "http://wx1.sinaimg.cn/large/61e7f4aaly1fmsuxwli25j20dw0hdmxd.jpg"
        //         },
        //         {
        //             url: "http://wx1.sinaimg.cn/large/61e7f4aaly1fmsuxrb9k5j20dw0afwet.jpg"
        //         },
        //         {
        //             url: "http://wx1.sinaimg.cn/large/61e7f4aaly1fmsuxp5a6ej20z418ggpk.jpg"
        //         }
        //     ],
        //     title: 'McDonald\'s invites you',
        //     text: '哈哈，圣诞快乐',
        //     date: "2017-12-17 23:15",
        //     belong_date: "2017-12-17"
        // },
        // {
        //     type: "article",
        //     img_url: 'https://wx4.sinaimg.cn/crop.0.0.550.309.1000/006DqfGBgy1fmqw7ksaglj30fa0bgaaf.jpg',
        //     title: '国宝级演员印度有阿米尔汗，英国有憨豆，中国谁能称为国宝演员？',
        //     article_id: "123asd0",
        //     text: '不是所有的兼职汪都需要风吹日晒',
        //     date: "2017-12-17 23:15",
        //     belong_date: "2017-12-17"
        // },
        // {
        //     type: "video",
        //     video_url: 'https://gslb.miaopai.com/stream/gVPRVh5sc6pC3t9PyIdn3Nrub8WPlU2urz9Ikg__.mp4?yx=&refer=weibo_app&mpflag=8&mpr=1514165556&Expires=1514181592&ssig=PdcEflrQZ0&KID=unistore,video',
        //     text: '圣诞节快乐哦！',
        //     date: "2017-12-17 23:15",
        //     belong_date: "2017-12-17"
        // }
    ],
    cur_page: 1,
    total_page: 0,
    has_more: true
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case 'LIST_INIT_DATA':
            return {
                ...state,
                feed_list: action.feed_list,
                cur_page: action.page,
                total_page: action.total_page,
                has_more: action.total_page > action.page ? true : false
            };
            
        default:
            return state;
    }
}
