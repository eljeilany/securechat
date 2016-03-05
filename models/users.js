/**************************************************
This File Contains The implementation of the Securechat data strutures
and schemas. If you're not working on the backend, You don't need
to modify this file, Or worry about it for that matter.

Author: Sidi Mohamed Jeilany.
contact: sidimed.jeilany@gmail.com
***************************************************/

var mongoose = require('mongoose');
var crypto = require('crypto');

var ContactSchema = new mongoose.Schema({
    first_name: String,
    last_name: String, // data encoded in base64
    email: String,
    id: mongoose.Schema.Types.ObjectId
});
var UserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, // Elt ID (it is better an safer to use native mongo ids)
    username: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    sign_time: Date, // Submit time
    last_seen: Date, // Submit time
    t_time: Date,
    t_salt: String,
    t_key: String,
    contacts:[mongoose.Schema.Types.Mixed],
    token:{ type: mongoose.Schema.Types.ObjectId, unique: true},
    profile_id: mongoose.Schema.Types.ObjectId
});
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
function bufferToBase64 (buf) {
    var binstr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    return btoa(binstr);
}
function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();
  console.log(toBuffer(str2ab(user.password)).toString('base64') );
  // Password changed so we need to hash it
  var sha256 = crypto.createHash("sha256");
  sha256.update(toBuffer(str2ab(user.password)).toString('base64'), "base64");//utf8 here
  var hash = sha256.digest("base64");
  user.password = hash;
  callback();
});

UserSchema.methods.verifyPassword = function(password, cb) {
  // bcrypt.compare(password, this.password, function(err, isMatch) {
  //   if (err) return cb(err);
  //   cb(null, isMatch);
  // });
};

module.exports = mongoose.model('User',UserSchema);
