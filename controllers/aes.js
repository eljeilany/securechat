var crypto = require('crypto');
exports.sha256 = crypto.createHash("sha256");

exports.encryptctr = function (data,password){
var cipher = crypto.createCipher('aes-256-ctr',password)
var crypted = cipher.update(data,'base64','base64')
crypted += cipher.final('base64');
console.log(crypted);
return crypted;
}

exports.decryptctr = function (data,password){
var decipher = crypto.createDecipher('aes-256-ctr',password)
var dec = decipher.update(data,'base64','base64')
dec += decipher.final('base64');
return dec;
}

exports.encryptgcm = function (data, password, iv) {
  var cipher = crypto.createCipheriv('aes-256-gcm', password, iv)
  var encrypted = cipher.update(data, 'base64', 'base64')
  encrypted += cipher.final('base64');
  var tag = cipher.getAuthTag();
  return Buffer.concat([new Buffer(encrypted, 'base64'), new Buffer(tag, 'base64')]).toString('base64');
}

exports.decryptgcm = function (encrypted, password, iv) {
  encrypted = new Buffer(encrypted, 'base64');
  content = new Buffer(encrypted.length -16);
  tag = new Buffer(16);
  encrypted.copy(content, 0, 0, encrypted.length -16);
  encrypted.copy(tag, 0, encrypted.length -16,encrypted.length);
  var decipher = crypto.createDecipheriv('aes-256-gcm', password, iv)
  decipher.setAuthTag(tag);
  var dec = decipher.update(content, 'base64', 'base64')
  dec += decipher.final('base64');
  return dec;
}
