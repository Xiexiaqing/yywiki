var mongoose = require('mongoose');

module.exports = function() {
    var UserSchema = new mongoose.Schema({
        user_id         : { type: String, unique: true },
        signup_time     : String,
        password        : String,
        birthday        : String,
        remark          : String
    });

    return UserSchema;
};