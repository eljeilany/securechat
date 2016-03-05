// Load required packages
var User = require('../models/users');
var mongoose = require('mongoose');
var crypto = require('crypto');

// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
  var user = new User({
    _id : mongoose.Types.ObjectId(),
    username: req.body.username,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    sign_time: new Date(),
    password: req.body.password,
    t_time: new Date(),
    t_key : crypto.randomBytes(32),
  });
  //console.log(req);
  user.save(function(err) {
    if (err){
      res.send(err);
      console.log(err);
    }
    console.log(user);
    res.json({ message: 'New user added'});
  });
};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err){
      res.send(err);
      console.log(err);
    }
    console.log(users);
    res.json(users);
  });
};
