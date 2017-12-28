var request = require("co-request");

module.exports = function(db_instance) {
	return function *(ctx, next, a) {
        if('GET' != this.method) return yield next;
        var user_id = this.query.user_id || '';

        if (user_id === '') {
            this.body = {
                code: 100005,
                msg: "数据获取错误",
                data: {}
            };

            return;
        }

        var type = this.query.type || 'all';
        var visiable_range = this.query.visiable_range || 'all';
        var page = this.query.page || 1;
        var page_size = this.query.page_size || 10;
        var count = (page - 1) * page_size;

        var condition = {
            user_id: user_id,
            visiable_range: visiable_range
        };

        if (type !== 'all') {
            condition.type = type;
        }
        
        var feed_model = db_instance['Feed'];
        var total_count = yield feed_model.find(condition).count();
        var res = yield feed_model.find(condition).sort({ date : 'desc' }).limit(page_size).skip(count);

        // 加工一下res再返回给前端
        var response_arr = [];
        for (var i = 0; i < res.length; i++) {
            var feed_item = {};
            feed_item.date = res[i].date;
            feed_item.text = res[i].text;
            feed_item.title = '';
            feed_item.type = res[i].type;
            
            if (res[i].type === 'pic') {
                feed_item.pics = [];
                for (var j = 0; j < res[i].files.length; j++) {
                    feed_item.pics.push({
                        url: 'http://127.0.0.1:3000/images/' + res[i].files[j]
                    });
                }
            } else if (res[i].type === 'video') {
                feed_item.video_url = 'http://127.0.0.1:3000/videos/' + res[i].files[0];
            } else if (res[i].type === 'article') {
                feed_item.title = '';
                feed_item.img_url = '';
                feed_item.article_id = '';
            }

            feed_item.belong_date = feed_item.date.split(" ")[0];

            response_arr.push(feed_item);
        }
        
        this.body = {
            code: 100000,
            msg: "",
            data: {
                list: response_arr,
                page: page,
                total_page: Math.ceil(total_count/page_size)
            }
        };
	}
};
