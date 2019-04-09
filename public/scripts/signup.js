

var form = $('<form>').attr('id','registrationForm');
form.append('Username: <input id="usernameEntry" type="text" placeholder="Username"/><br>');
form.append('Password: <input id="passwordEntry" type="password" placeholder="Password"/><br>');
form.append('Confirm Password: <input id="passwordEntry2" type="password" placeholder="Confirm Password"/><br>');

$('main').append(form)

function checkpw(pw1,pw2){
    if(pw1 != pw2)
        return 1;
    if(pw1.length < 8)
        return 2;
    else return 0;
}

function error(eid){
    var str = 'Something went wrong...'
    if(eid==1) str = 'Passwords do not match.';
    if(eid==2) str = 'Passwords does not meet length requirement (8).';
    $('main').append( $('<span/>').addClass('registrationErrorMessage').text(str) )
}

function hashCode(str){
    var hash = 0;
    if(str.length==0){ return hash; }
    for(var i=0; i<str.length; i++){
        var c = str.charCodeAt(i);
        hash = ((hash << 5)-hash)+c;
        hash = hash & hash;
    }
    return hash;
}

var submit = $('<button/>').attr('id','signupButton').text('Submit');
submit.bind('click',function(){
    $('.registrationErrorMessage').remove();

    var username = $.trim($('#usernameEntry').val());
    var pw1 = $('#passwordEntry').val();
    var pw2 = $('#passwordEntry2').val();
    var check = checkpw(pw1,pw2);
    if(check != 0){
        error(check)
        return false;
    } else {
        var hashedpw = hashCode(pw1);
        socket.emit('registerNewUser',{'username':username,'hashedpw':hashedpw})
    }
});

$('main').append(submit)

socket.on('registrationSuccess',function(username){
    console.log('Successfully registered as '+username)
    window.location.href = '/users/profile/'+username;
})