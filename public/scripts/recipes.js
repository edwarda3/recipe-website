
var currentNum = 0;

var container = $('<div/>').attr('id','recipeListContainer');
container.append($('<ul/>').attr('id','recipeList'));

$('main').append( $('<p/>').attr('id','loadingText').text('Loading Recipes...') );

$('main').append(container);

socket.emit('getRecipes',{});

socket.on('recipes',function(res){
    $('#loadingText').remove()
    res.forEach(function(entry){
        var link = $('<a/>',{ text:entry.name, href:'/recipes/'+entry._id }).addClass('recipeLink');
        $('#recipeList').append( $('<li/>').addClass('recipeListEntry').append(link) );
    });
});

socket.on('connectionError',function(){
    console.log('Error connecting to database. Please try again later')
});