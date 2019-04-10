

var recipesection = $('<div/>').attr('id','recipeList')
socket.emit('getRecipes',{username:obj});

socket.on('recipes',function(res){
    $('#loadingText').remove();
    console.log(res)
    res.forEach(function(entry){
        var link = $('<a/>',{ text:entry.name, href:'/recipes/'+entry._id }).addClass('recipeLink');
        $('#recipeList').append( $('<li/>').addClass('recipeListEntry').append(link) );
    });
});


$('main').append( $('<h2/>').addClass('usernameTitle').text(obj+"'s recipes") );
$('main').append( $('<p/>').attr('id','loadingText').text('Loading Recipes...') );
$('main').append( recipesection );

socket.on('loggedUserStatus',function(loggedusername){
    var changepass = $('<a/>',{text:'Change Password',href:'/users/profile/changepassword'}).attr('id','changePasswordLink');
    $('main').prepend(changepass);
});