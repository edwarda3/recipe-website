var fs = require('fs');
var config = require('./config.json');
var express = require('express');
var mongo = require('mongodb');
var mongoose = mongo.MongoClient;

var dbuser = config.user;
var dbpass = config.pass;
var mongoremote = config.dbip;
var url = "mongodb://"+dbuser+":"+dbpass+"@"+mongoremote+":27017/recipes";

mongoose.connect(url,function(err,db){
	if(err) throw err;
	console.log("MongoDB connection established")
});

var app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	session = require('express-session')({
		secret: 'randomsecret1234',
		resave: true,
		saveUninitialized: true
	}),
	sharedsession = require('express-socket.io-session');
app.use(session);
io.use(sharedsession(session,{
	autoSave:true
}));

/*
app.use(function(req,res,next){
    if(!req.secure){
        return res.redirect(['https://',req.get('Host'),req.url].join(''));
    }
    next();
});
*/

const server_port = 3000
//server startup
http.listen(server_port, function(){
	console.log("server running on port " + this.address().port);
});

//routings
app.set('view engine', 'ejs');
app.get('/', function(req, res){
	res.redirect('/recipes');
});
app.get('/create', function(req, res){
	res.render('index.ejs', {'script': 'create.js','object':null});
});
app.get('/users/signup', function(req, res){
	res.render('index.ejs', {'script': 'signup.js','object':null});
});
app.get('/users/login', function(req, res){
	res.render('index.ejs', {'script': 'login.js','object':null});
});
app.get('/users/logout', function(req, res){
	req.session.destroy();
	res.redirect('/users/login');
});
app.get('/users/profile/:username', function(req, res){
	var username = req.params.username;
	mongoose.connect(url,function(err,db){
		if(err)
			throw err;
		else{
			var dbo = db.db('recipes');
			dbo.collection('users').findOne({'username':username},function(err,userdata){
				if(err)
					throw err; //TODO send 404 page
				res.render('index.ejs', {'script':'userpage.js','object': userdata.username});
				db.close();
			});
		}
	});
});
app.get('/recipes', function(req, res){
	res.render('index.ejs', {'script': 'recipes.js','object':null});
});
//Get the recipe ID and get the data, send that data to the client
app.get('/recipes/:recipeID', function(req, res){
	var recipeID = req.params.recipeID;
	mongoose.connect(url,function(err,db){
		if(err)
			throw err;
		else{
			var r_id = new mongo.ObjectID(recipeID)
			var dbo = db.db('recipes');
			dbo.collection('recipes').findOne(r_id,function(err,recipe){
				if(err)
					throw err;
				//We send the recipe object, which has fields name,ingredients[],instructions[].
				res.render('index.ejs', {'script':'recipe.js','object': recipe});
				db.close();
			});
		}
	});
});
app.use(express.static('public')); //serves index.html



io.on('connection',function(socket){

	socket.on('getLoggedStatus',function(){
		var username = socket.handshake.session.username;
		if(username == null){
			socket.emit('noLoggedUser')
		}
		else{
			socket.emit('loggedUserStatus',username)
		}
	});

	//Inserting a single recipe
	socket.on('insertRecipe',function(data){
		mongoose.connect(url,function(err,db){
			if(err){
				socket.emit('connectionError');
				throw err;
			}
			var dbo = db.db('recipes');
			dbo.collection('recipes').insertOne(data,function(err,res){
				if(err) socket.emit('connectionError');
				else{ 
					socket.emit('insertionSuccess',res.ops[0]._id);
				}
				db.close();
			});
		});
	});

	socket.on('updateRecipe',function(data){
		mongoose.connect(url,function(err,db){
			if(err)
				throw err;
			else{
				var r_id = new mongo.ObjectID(data.r_id);
				var dbo = db.db('recipes');
				dbo.collection('recipes').updateOne({'_id':r_id},{$set:{'ingredients':data.ingredients}},function(err,res){
					if(err)
						throw err;
					console.log('Updated r_id '+data.r_id);
					socket.emit('updateSuccess')
					db.close();
				});
			}
		});
	});

	socket.on('deleteRecipe',function(data){
		mongoose.connect(url,function(err,db){
			if(err)
				throw err;
			else{
				var r_id = new mongo.ObjectID(data.r_id);
				var dbo = db.db('recipes');
				dbo.collection('recipes').deleteOne({'_id':r_id},function(err,res){
					if(err)
						throw err;
					console.log('Deleted r_id '+data.r_id);
					socket.emit('deleteSuccess')
					db.close();
				});
			}
		});
	});

	socket.on('getRecipes',function(data){
		mongoose.connect(url,function(err,db){
			if(err){
				socket.emit('connectionError');
				throw err;
			}
			var dbo = db.db('recipes');
			var filter = {};
			if(data.username != null) filter['creator'] = data.username;
			dbo.collection('recipes').find(filter).toArray(function(err,res){
				if(err) socket.emit('connectionError');
				else socket.emit('recipes',res)
				db.close();
			});
		});
	});
	socket.on('registerNewUser',function(user){
		mongoose.connect(url,function(err,db){
			if(err){
				socket.emit('connectionError');
				throw err;
			}
			var dbo = db.db('recipes');
			var lusername = user.username.toLowerCase();
			dbo.collection('users').findOne({'low_username':lusername},function(err,founduser){
				if(err)
						throw err;
				if(founduser == null){
					var insertuser = {'username': user.username,'low_username': lusername, 'hashedpw': user.hashedpw};
					dbo.collection('users').insertOne(insertuser,function(err,res){
						if(err) socket.emit('connectionError');
						else{
							socket.handshake.session.username = user.username;
							socket.handshake.session.save();
							console.log('Registered '+user.username)
							socket.emit('registrationSuccess',user.username);
						}
						db.close();
					});
				}
			});
		});
	});
	socket.on('loginAttempt',function(userdata){
		mongoose.connect(url,function(err,db){
			if(err)
				throw err;
			else{
				var dbo = db.db('recipes');
				var lusername = userdata.username.toLowerCase();
				dbo.collection('users').findOne({'low_username':lusername,'hashedpw':userdata.hashedpw},function(err,founduser){
					if(err)
						throw err;
					if(founduser != null){
						socket.handshake.session.username = founduser.username;
						socket.handshake.session.save();
						console.log('Logged in '+founduser.username)
						socket.emit('loginSuccess',founduser.username);
					} else socket.emit('loginFailure');
				});
			}
		});
	});
});
