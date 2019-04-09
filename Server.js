var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = mongo.MongoClient;

var url = "mongodb://localhost:27017/";

mongoose.connect(url,function(err,db){
	if(err) throw err;
	console.log("MongoDB connection established")
});

var app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

//server startup
http.listen(parseInt(process.argv[2]), function(){
	console.log("server running on port " + this.address().port);
});

//routings
app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/create', function(req, res){
	res.sendFile(__dirname + '/public/create.html');
});
app.get('/recipes', function(req, res){
	res.sendFile(__dirname + '/public/recipes.html');
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
				app.set('view engine', 'ejs');
				//We send the recipe object, which has fields name,ingredients[],instructions[].
				res.render('recipe.ejs', {'recipe': recipe});
				db.close();
			});
		}
	});
});
app.use(express.static('public')); //serves index.html

io.on('connection',function(socket){

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

	//Getting recipes from the skip index.
	//Retreives 20 values at a time.
	socket.on('getRecipes',function(skip){
		mongoose.connect(url,function(err,db){
			if(err){
				socket.emit('connectionError');
				throw err;
			}
			var dbo = db.db('recipes');
			dbo.collection('recipes').find().limit(10).skip(skip).toArray(function(err,res){
				if(err) socket.emit('connectionError');
				else socket.emit('recipes',res)
				db.close();
			});
		});
	});
});