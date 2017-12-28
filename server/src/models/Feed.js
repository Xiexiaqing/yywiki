var mongoose = require('mongoose');

module.exports = function() {
    var FeedSchema = new mongoose.Schema({
        feed_id         : { type: String, unique: true },
        log_time        : String,
        user_id         : String,
        type            : String,
        text            : String,
        article_id      : String,
        files           : Array,
        date            : String,
        visiable_range  : String,
        remark          : String
    });

    return FeedSchema;
};