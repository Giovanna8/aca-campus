var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var courseSchema = new Schema({

module.exports = mongoose.model('course', courseSchema);