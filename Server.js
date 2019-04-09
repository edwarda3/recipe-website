var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongodb').MongoClient;

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
app.get('/recipes/:recipeID', function(req, res){
        var recipeID = req.params.recipeID;
		app.set('view engine', 'ejs');
        res.render('profile2.ejs', {recipeID: recipeID});
});
app.use(express.static('public')); //serves index.html

io.on('connection',function(socket){
	console.log('A User Connected');

	socket.on('insertRecipe',function(data){
		mongoose.connect(url,function(err,db){
			if(err){
				socket.emit('insertionError');
				throw err;
			}
			var dbo = db.db('recipes');
			dbo.collection('recipes').insertOne(data,function(err,res){
				if(err){
					socket.emit('insertionError');
					throw err;
				}
				console.log('Inserted 1 item');
				console.log(data);
				socket.emit('insertionSuccess');
				db.close();
			});
		});
	});
});