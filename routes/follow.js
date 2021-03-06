var express = require('express');
var app = express.Router();
var error = require('./error');
var mysql = require('mysql');
var db = require('../public/db_structure');
var notification = require('./util/notification');
var isAuth = function(req, res, next) {
//console.log('Authenticating');
	if (req.isAuthenticated())
		next();
	else {
		req.flash('login', 'LOGIN');
		res.redirect('/login')
	}
};
app.get('/add', isAuth,function(req, res) {
	var errobj = error.err_insuff_params(res, req, ['follows']);
	var querystring = "";
	if(!errobj) {
		return;
	}

	var user_id = req.user.id;
	var follows = req.query.follows;

	notification.setFollower(user_id, follows,res);
});
app.get('/remove', isAuth,function(req, res) {
	var errobj = error.err_insuff_params(res, req, ['follows']);
	var querystring = "";
	if(!errobj) {
		return;
	}

	var user_id = req.user.id;
	var follows = req.query.follows;

	notification.removeFollower(user_id, follows, res);
	
});

app.get('/get',isAuth,function(req,res){
	if(req.query.id) {
		id = req.query.id;
	}
	else id = req.user.id;
	var querystring="SELECT * from noteshare.followers WHERE followers.userid="+mysql.escape(id)+";";
	db.querydb(querystring,function(arrFollowing){
		var querystring2="SELECT * from noteshare.followers WHERE followers.follows="+mysql.escape(id)+";";
		db.querydb(querystring2,function(arrFollowers){
		//console.log(arrFollowers);
		//console.log(arrFollowing);
			res.end(JSON.stringify({result:true,arrFollowing:arrFollowing,arrFollowers:arrFollowers}));
		});
	});
})
module.exports = app;