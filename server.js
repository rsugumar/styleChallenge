var restify = require('restify');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var CookieParser = require('restify-cookies');

var Auth = require('./models/AuthModel.js');
var config = require('./config');
var db = mongoose.connect(config.database);

function register(req, res, next) {
   Auth.findOne({email: req.body.email}, function(err, result) {
         if (err) {
            console.log('Error occurred!');
         } else {
            if (!result) {
               var auth = new Auth();
               auth.email = req.body.email;
               auth.password = req.body.password;
               auth.save();
               res.send(202, 'Register req received');
            } else {
               res.send(409, 'User already exists!');
            }
         }
   });
   return next();
}

function auth(req, res, next) {
   Auth.findOne({email: req.body.email, password: req.body.password}, function(err, result) {
         if (err) {
            console.log('Error occurred!');
         } else {
            if (!result) {
               res.send(401, 'Auth credentials incorrect');
            } else {
               var hour = 3600000;
               var token = jwt.sign({ email: req.body.email},
                  config.secret,
                  {
                     expiresIn: '3d' // expires in 3 days
                  });
               res.setCookie('access_token', token, {maxAge: hour});
               res.send(202, 'User auth success!');
            }
         }
   });
   return next();
}

function changePassword(req, res, next) {
   Auth.findOne({email: req.body.email, password: req.body.password},
         function(err, result) {
            if (err) {
               console.log('Error occurred!');
            } else {
               if (!result) {
                  res.send(401, 'Auth credentials incorrect');
               } else {
                  result.password = req.body.newpassword;
                  result.save();
                  res.send(202, 'New password changed!');
               }
            }
   });
   return next();
}

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(CookieParser.parse);

server.post('/api/register', register);
server.post('/api/auth', auth);
server.post('/api/passwdchange', changePassword);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
