
//The form has ingredient and Instruction Sections.
var form = $('<form>').attr('id','addRecipeForm');
form.append('Name: <input class="recipeName" type="text" placeholder="Recipe Name"/><br>');
form.append('Servings: <input class="recipeServings" type="number" placeholder="Servings"/>');

//Ingredients
form.append($('<hr>'))
form.append($('<h3/>').addClass('recipeSectionLabel').text('Ingredients'))
var addIngButton = $('<button/>').addClass('addButton createButton').text('+');
form.append(addIngButton);
form.append($('<div/>').attr('id','recipeIngredients'));

//Instructions
form.append($('<hr>'))
form.append($('<h3/>').addClass('recipeSectionLabel').text('Instructions'))
var addInstButton = $('<button/>').addClass('addButton createButton').text('+');
form.append(addInstButton);
form.append($('<div/>').attr('id','recipeInstructions'));

//Function for adding Ingredients
function addIng(){
    var section = $('<div/>').addClass('ingredientDiv');
    var ingredientname = $('<input type="text" placeholder="Name" />').addClass('ingNameInput');
    var ingredientamount = $('<input type="number" step="0.05" placeholder="Amount" />').addClass('ingAmountInput');
    var ingredientunit = $('<input type="text" placeholder="Unit" />').addClass('ingUnitInput');
    var remButton = $('<button/>').addClass('remButton').text('🗙');
    remButton.bind('click',function(){section.remove();});
    section.append(ingredientname,ingredientamount,ingredientunit,remButton);
    $('#recipeIngredients').append(section);
    //Prevent form button from refreshing page.
    return false;
}

//Function for adding instructions
function addInst(){
    var section = $('<div/>').addClass('instructionDiv');
    var label = $('<span/>').text($('.instructionDiv').length +1 + ':  ');
    var inst = $('<input type="text" placeholder="Instruction" />').addClass('instInput');
    var remButton = $('<button/>').addClass('remButton').text('🗙');
    remButton.bind('click',function(){section.remove();});
    section.append(label,inst,remButton);
    $('#recipeInstructions').append(section);
    return false;
}

addIngButton.click(addIng);
addInstButton.click(addInst);

//Save and pack recipe into object to send to server and db.
var commitButton = $('<button/>').addClass('commitButton createButton').text('Save');
commitButton.click(function(){
    $('.failureMessage').remove();
    var valid = true;
    if(loggeduser == null){
        $('main').append( $('<span/>').addClass('failureMessage').text('You must be logged into perform this action.') );
        valid = false;
    }

    var name = $('.recipeName').val();
    var servings = $('.recipeServings').val();
    if(!name){
        $('main').append( $('<span/>').addClass('failureMessage').text('Needs a name!.') );
        valid = false;
    }
    if(!servings){
        $('main').append( $('<span/>').addClass('failureMessage').text('Needs a serving count!.') );
        valid = false;
    }
    
    //Store ingredients as an array of objects.
    //Each object should have {name,amount,unit} elements.
    var ings = [];
    $('.ingredientDiv').each(function(i,obj){
        var ingName = obj.childNodes[0].value;
        var ingAmount = obj.childNodes[1].value;
        var ingUnit = obj.childNodes[2].value;
        var ingredient = {'name':ingName, 'amount': ingAmount, 'unit': ingUnit};
        ings.push(ingredient);
    });
    //Instructions are simply an array of strings.
    var insts = [];
    $('.instructionDiv').each(function(i,obj){
        insts.push(obj.childNodes[1].value);
    });
    if(ings.length<=0 && insts.length <= 0){
        $('main').append( $('<span/>').addClass('failureMessage').text('Please enter at least one ingredient and one instruction.') )
        valid = false;
    }
    if(valid){
        var recipe = {'creator':loggeduser,'name':name,'servings':servings,'ingredients':ings,'instructions':insts};
        socket.emit('insertRecipe',recipe)
    }
});


$('main').append(form)
$('main').append($('<hr>'))
$('main').append(commitButton)

socket.on('connectionError',function(){
    console.log('Error inserting recipe into database. Please try again later')
});
socket.on('insertionSuccess',function(id){
    console.log('Successfully inserted recipe into database.')
    window.location.href = '/recipes/'+id;
});

socket.on('noLoggedUser',function(){
    $('main').prepend( $('<span/>').addClass('loggedStatusWarning').text('Note: You must be logged in to create recipes') );
});