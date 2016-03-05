// Load required packages
var User = require('../models/users');
var mongoose = require('mongoose');
var crypto = require('crypto');
var sha256 = crypto.createHash("sha256");
var aes = require('./aes');


function encryptctr(data,password){
var cipher = crypto.createCipher('aes-256-ctr',password)
var crypted = cipher.update(data,'utf8','hex')
crypted += cipher.final('hex');
return crypted;
}

function decryptctr(data,password){
var decipher = crypto.createDecipher('aes-256-ctr',password)
var dec = decipher.update(data,'hex','utf8')
dec += decipher.final('utf8');
return dec;
}

function encryptgcm(data, password, iv) {
  var cipher = crypto.createCipheriv('aes-256-gcm', password, iv)
  var encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex');
  var tag = cipher.getAuthTag();
  return {
    content: encrypted,
    tag: tag
  };
}

function decryptgcm(encrypted, password, iv) {
  var decipher = crypto.createDecipheriv('aes-256-gcm', password, iv)
  decipher.setAuthTag(encrypted.tag);
  var dec = decipher.update(encrypted.content, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

// Create endpoint /api/users for POST
exports.postAuth = function(req, res) {
  //console.log(JSON.parse(req.body));
  // console.log(req.body);
   console.log(req.headers.data.email);
  // console.log(req.Body);
  req.headers.data = JSON.parse(req.headers.data);
  console.log(req.headers.data);
  User.findOne({ email: req.headers.data.email }, function (err, user) {
    if(err|| user == null){
      res.json({Error:'Unknown account'});
      return;
    }
    sha256 = crypto.createHash("sha256");
    var key = Buffer.concat([new Buffer(user.password, 'base64'), new Buffer(user.t_salt, 'base64')]) ;
    sha256.update(key.toString('base64'), "base64");//utf8 here
    var hash = new Buffer(sha256.digest("base64"), 'base64');
    var data = null;
    try{
      var iv = req.headers.data.iv;
      data = aes.decryptgcm(req.headers.data.data,hash, new Buffer(req.headers.data.iv, 'base64') );
      data = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
      console.log('data');
      console.log(data);
    }catch(err){
      console.log(err);
      return;
      res.send(404,err);
    }

    if(!(data.token_recieved == user.token && data.recieved)){
      res.json({Error: 'Unsupported state or unable to authenticate data'});
    }else{
      data = {
        pad:crypto.randomBytes(randomInt(16,32)).toString('base64'),
        key: user.t_key,
        endpad:crypto.randomBytes(randomInt(16,32)).toString('base64'),
      };
      user.t_time = new Date();
      user.save(function (err) {
        if (err) return console.log(err);
      });
      console.log("post en");
      console.log(iv);
      console.log(hash.toString('base64'));
      console.log(aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),hash,new Buffer(iv, 'base64')));
      res.json({data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),hash,new Buffer(iv, 'base64'))});
    }
  });
};

// Create endpoint /api/users for GET
exports.getAuth = function(req, res) {
  console.log(req.query);

  User.findOne({ email: req.query.email }, function (err, user) {
    if(err|| user == null){
      res.json({Error:'Unknown account'});
      return;
    }else{
      if((new Date).getTime() - user.t_time > 10*60000){
        user.t_time = new Date();
        user.t_key = crypto.randomBytes(32).toString('base64');
        user.t_salt = crypto.randomBytes(32).toString('base64');
        user.token = mongoose.Types.ObjectId();
      }
      user.save(function (err) {
        if (err) return console.log(err);
      });
      data = {
        pad:crypto.randomBytes(randomInt(16,32)).toString('base64'),
        token: user.token,
        iv:crypto.randomBytes(12).toString('base64'),
        endpad:crypto.randomBytes(randomInt(16,32)).toString('base64'),
      };
      sha256 = crypto.createHash("sha256");
      var key = Buffer.concat([new Buffer(user.password, 'base64'), new Buffer(user.t_salt, 'base64')]) ;
      console.log(key.toString('base64'));
      console.log('hash:');
      sha256.update(key.toString('base64'), "base64");//utf8 here
      var hash = new Buffer(sha256.digest("base64"), 'base64');
      console.log(hash.toString('base64'));
      //d2:aes.decryptctr(aes.encryptctr((new Buffer(JSON.stringify(data))).toString('base64'),hash),hash),
      try{
        res.json({t_salt: user.t_salt, data:aes.encryptgcm(new Buffer(JSON.stringify(data)).toString('base64'),hash,new Buffer(req.headers.iv, 'base64'))});
      }catch(err){
        console.log(err);
      }
    }
  });
};

// Create endpoint /api/users for POST
exports.Token = function(req, res) {
  req.headers.data = JSON.parse(req.headers.data);
  User.findOne({ email: req.headers.data.email }, function (err, user) {
    if(err|| user == null){
      res.json({Error:'Unknown account'});
      return;
    }
    var data = null;
    try{
      console.log(req.headers.data.iv);
      console.log(user.t_key);
      console.log(req.headers.data.data);
      data =aes.decryptgcm(req.headers.data.data,new Buffer(user.t_key, 'base64'),new Buffer(req.headers.data.iv, 'base64'));
      data = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
      console.log(data);
    }catch(err){
      console.log(err);
      res.send(404,err);
    }
    if(err|| data == null){
      res.json({Error:'Unknown account'});
      return;
    }
    if(!data.token == user.token){
      res.json({Error: 'Unsupported state or unable to authenticate data'});
    }else{
      data = {
        pad:crypto.randomBytes(randomInt(16,32)).toString('base64'),
        status: true,
        endpad:crypto.randomBytes(randomInt(16,32)).toString('base64'),
      };
      user.t_time = new Date();
      user.save(function (err) {
        if (err) return console.log(err);
      });
      res.json({data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),new Buffer(user.t_key, 'base64'),new Buffer(req.headers.data.iv, 'base64'))});
    }
  });
};

exports.authio = function(req, callback) {
  req = JSON.parse(req);
  User.findOne({ email: req.email }, function (err, user) {
    if(err|| user == null){
      callback(true,false);
      return;
    }
    var data = null;
    try{
      data = aes.decryptgcm(req.data.data,new Buffer(user.t_key, 'base64'),new Buffer(req.iv, 'base64'));
      data = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
    }catch(err){
      console.log(err);
      callback(true,false,null);
    }
    if(data == null){
      callback(true,false,null);
      return;
    }
    if(!data.token == user.token){
      callback(new Error('Unsupported state or unable to authenticate data'));
    }else{
      callback(null,true,user);
    }
  });
};

// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
  var user = new User({
    _id : mongoose.Types.ObjectId(),
    username: req.body.username,
    fname: req.body.first_name,
    lname: req.body.last_name,
    email: req.body.email,
    sign_time: new Date(),
    t_time: new Date(),
    t_key :crypto.randomBytes(32).toString('base64'),
    t_salt : crypto.randomBytes(32).toString('base64'),
    token :mongoose.Types.ObjectId(),
    password: req.body.password
  });
  //console.log(req);
  user.save(function(err) {
    if (err){
      res.send(404,null);
      console.log(err);
      return
    }
    console.log(user);
    res.status(200).send('<html><body></body><script type="text/javascript">window.location.href="/#";</script></html>');
    //res.json({ message: 'New user added',user: user });
  });
};
