

var form = $('<form>').attr('id','loginForm');
form.append('Username: <input id="usernameEntry" type="text" placeholder="Username"/><br>');
form.append('Password: <input id="passwordEntry" type="password" placeholder="Password"/><br>');
$('main').append(form)

function hashCode(pw){
    var hash = 0;
    if(pw.length==0){ return hash; }
    for(var i=0; i<pw.length; i++){
        var c = pw.charCodeAt(i);
        hash = ((hash << 5)-hash)+c;
        hash = hash & hash;
    }
    return hash;
}

var submit = $('<button/>').attr('id','loginButton').text('Submit');
submit.bind('click',function(){
    $('.loginErrorMessage').remove();

    var username = $('#usernameEntry').val();
    var pw1 = $('#passwordEntry').val();
    var hashedpw = hashCode(pw1);
    socket.emit('loginAttempt',{'username':username,'hashedpw':hashedpw})
});

$('main').append(submit)

socket.on('loginSuccess',function(username){
    console.log('Successfully logged in as '+username)
    window.location.href = '/users/profile/'+username;
})
socket.on('loginFailure',function(){
    $('main').append( $('<span/>').addClass('loginErrorMessage').text('Failed to Login') )
})