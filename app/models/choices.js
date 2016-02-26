'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Choices = new Schema({
    poll_id: String,
    poll_option: String,
    votes: 0
});

module.exports = mongoose.model('Choices', Choices);