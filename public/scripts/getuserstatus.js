var socket = io();

var loggeduser = null;
socket.emit('getLoggedStatus');
socket.on('loggedUserStatus',function(loggedusername){
    //Remove sign up and log in and replace with logout button
    loggeduser = loggedusername;

    $('#navSignUp').remove()
    $('#navLogIn').remove()
    $('#nav').append( $('<li/>').attr('id','navLogOut').append( $('<a/>',{ text:'Log Out', href:'/users/logout' }) ) );
});