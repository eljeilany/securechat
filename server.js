// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var auth = require('./controllers/auth');
var fs = require('fs');
// Load data Schemas
var user = require('./controllers/user');
var aes = require('./controllers/aes');
var User = require('./models/users');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/msg');

// Create our Express application
var app = express();

//var server = require('http').Server(app);
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/dtccl.com/privkey.pem');
var certificate = fs.readFileSync('/etc/letsencrypt/live/dtccl.com/cert.pem');

var https = require('https');
var server = https.createServer({
    key: privateKey,
    cert: certificate
}, app);

var io = require('socket.io')(server);

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var credentials = {key: privateKey, cert: certificate};
// Use body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use environment defined port or 3000
var port = process.env.PORT || 443;




// Create our Express router
var router = express.Router();
app.use('/securechat', express.static(__dirname + '/public'));
// Create endpoint handlers for normal echo
router.route('/auth')
  .post(auth.postAuth)
  .get(auth.getAuth);

// Create endpoint handlers for first echo
router.route('/Token')
  .post(auth.Token);

  // Create endpoint handlers for /users
router.route('/users')
  .post(auth.postUsers);

  // Create endpoint handlers for /users
router.route('/')
  .post(auth.postUsers);

// Register all our routes with /api
app.use('/', router);

// // Create endpoint handlers for /clients
// router.route('/clients')
//   .post(authController.isAuthenticated, clientController.postClients)
//   .get(authController.isAuthenticated, clientController.getClients);
var active = {};
io.use(function(socket, next) {
  console.log(socket.request._query.data);
  var data = socket.request._query.data;
  console.log("new");
  auth.authio(data, function(err, authorized,user){
    if (err || !authorized) {
      console.log("not authorised");
      next(new Error("not authorized"));
    }else{
      socket.user = user;
      console.log("authorised");
      next();
    }
  });
});
io.on('connection', function(socket){
  console.log("new");
  active[socket.user._id] = socket;
  socket.t_key = crypto.randomBytes(32).toString('base64');
  iv = crypto.randomBytes(12).toString('base64');
  data = {
    pad:crypto.randomBytes(randomInt(8,12)),
    key: socket.t_key,
    contacts: socket.user.contacts,
    endpad:crypto.randomBytes(randomInt(8,12)),
  };
  socket.active = false;
  socket.emit('registred',{iv:iv,data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),new Buffer(socket.user.t_key, 'base64'),new Buffer(iv, 'base64'))});
  socket.on('registred',function(arg){
    console.log('reg res');
    console.log(arg);
    console.log(socket.t_key);
    var data = null;
    // try{
      key =  socket.t_key;
      data = aes.decryptgcm(arg.data,new Buffer(key, 'base64'),new Buffer(arg.iv, 'base64'));
      data = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
      console.log('reg good');
    // }catch(err){
    //   console.log(err);
    //   socket.disconnect(new Error('Unsupported state or unable to authenticate data'));
    // }
    if (!(data && data.message == 'done')) {
      socket.disconnect(new Error('Unsupported state or unable to authenticate data'));
    }
  });

  // socket.on('send',function(arg){
  //   var data = null;
  //   try{
  //     data = aes.decryptgmc(arg.data,new Buffer(scket.t_key, 'base64'),new Buffer(arg.iv, 'base64'));
  //     data = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
  //   }catch(err){
  //     console.log(err);
  //     socket.disconnect(new Error('Unsupported state or unable to authenticate data'));
  //   }
  //   if (!(data && data.message == 'done')) {
  //     socket.disconnect(new Error('Unsupported state or unable to authenticate data'));
  //   }
  // });

  socket.on('send',function(arg){
    var data = null;
    try{
      data = aes.decryptgcm(arg.data,new Buffer(socket.t_key, 'base64'),new Buffer(arg.iv, 'base64'));
      data = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
    }catch(err){
      console.log(err);
      socket.disconnect(new Error('Unsupported state or unable to authenticate data'));
    }
    if (data) {
        if(typeof(active[data.id]) == 'undefined' ){
          data = {
            pad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
            sent : false,
            endpad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
          }
          iv = crypto.randomBytes(12).toString('base64');
          socket.emit('send', {iv:iv,data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),new Buffer(socket.t_key, 'base64'),new Buffer(iv, 'base64'))});
        }else{
          var contact={};
          contact.first_name = socket.user.fname;
          contact.last_name = socket.user.lname;
          contact.email = socket.user.email;
          contact.id = socket.user._id;
          var lookup = {};
          for (var i = 0, len = active[data.id].user.contacts.length; i < len; i++) {
              lookup[active[data.id].user.contacts[i].id] = active[data.id].user.contacts[i];
          }
          var newc = false;
          // if(typeof(active[data.id].user.contacts[contact.id]) == 'undefined'){
          //     active[data.id].user.contacts.push(contact);
          //     active[data.id].user.save();
          //     newc = true;
          // }
          var recipid = data.id;
          data = {
            pad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
            message : data.message,
            sourse : contact,
            new : newc,
            endpad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
          }
          iv = crypto.randomBytes(12).toString('base64');
          active[recipid].emit('newmessage', {iv:iv,data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),new Buffer(active[recipid].t_key, 'base64'),new Buffer(iv, 'base64'))});

          data = {
            pad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
            sent : true,
            endpad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
          }
          iv = crypto.randomBytes(12).toString('base64');
          socket.emit('send', {iv:iv,data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),new Buffer(socket.t_key, 'base64'),new Buffer(iv, 'base64'))});
        }
    }
  });

  socket.on('finduser',function(arg){
    var data = null;
    try{
      data = aes.decryptgcm(arg.data,new Buffer(socket.t_key, 'base64'),new Buffer(arg.iv, 'base64'));
      data = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
    }catch(err){
      console.log(err);
      socket.disconnect(new Error('Unsupported state or unable to authenticate data'));
    }
    if (data) {
      console.log(data);
      User.findOne({ email: data.email }, function (err, user) {
        console.log(user);
        if(user== null){
          data = {
            pad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
            found : false,
            endpad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
          }
          iv = crypto.randomBytes(12).toString('base64');
          socket.emit('finduser', {iv:iv,data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),new Buffer(socket.t_key, 'base64'),new Buffer(iv, 'base64'))});
        }else{
          // var contact ={
          //     first_name: String,
          //     last_name: String, // data encoded in base64
          //     email: String,
          //     id: mongoose.Schema.Types.ObjectId
          // };
          var contact={};
          contact.first_name = user.fname;
          contact.last_name = user.lname;
          contact.email = user.email;
          contact.id = user._id;

          // var contacts = socket.user.contacts;
          // if(!(contacts.length >0)) contacts = [];
          // contacts[user._id] = contact;
          var nfound = true;
          for (var i = 0, len = socket.user.contacts.length; i < len; i++) {
              if(socket.user.contacts[i].email == user.email) {
                nfound = false;
                break;
                };
          }
          if(nfound) socket.user.contacts.push(contact);
          console.log(socket.user);
          console.log(contact);
          console.log(user._id);
          socket.user.save();
          data = {
            pad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
            found : true,
            contact : contact,
            endpad:crypto.randomBytes(randomInt(8,12)).toString('base64'),
          }
          iv = crypto.randomBytes(12).toString('base64');
          console.log('ready to emit');
          console.log(iv);
          console.log(socket.t_key);
          socket.emit('finduser', {iv:iv,data:aes.encryptgcm((new Buffer(JSON.stringify(data))).toString('base64'),new Buffer(socket.t_key, 'base64'),new Buffer(iv, 'base64'))});
        }
      });
    }
  });
})

// Start the server
server.listen(port);
// https.createServer({
//     key: privateKey,
//     cert: certificate
// }, app).listen(port);
console.log('it\'s aliiiive, nihaahaaaaaaa //// port: ' + port);
