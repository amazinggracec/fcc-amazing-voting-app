'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    poll_name: String,
    user_id: String,
    date_created: {type: Date, default: Date.now()},
    date_last: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Poll', Poll);