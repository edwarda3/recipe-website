var socket = io();

//The form has ingredient and Instruction Sections.
var form = $('<form>').attr('id','addRecipeForm');
form.append('Name: <input class="recipeName" type="text" placeholder="Recipe Name"/>');

//Ingredients
form.append($('<hr>'))
form.append($('<h3/>').text('Ingredients'))
var addIngButton = $('<button/>').addClass('addButton createButton').text('Add Ingredient');
form.append(addIngButton);
form.append($('<div/>').attr('id','recipeIngredients'));

//Instructions
form.append($('<hr>'))
form.append($('<h3/>').text('Instructions'))
var addInstButton = $('<button/>').addClass('addButton createButton').text('Add Instruction');
form.append(addInstButton);
form.append($('<div/>').attr('id','recipeInstructions'));

//Function for adding Ingredients
function addIng(){
    var section = $('<div/>').addClass('ingredientDiv');
    var ingredientname = $('<input type="text" placeholder="Name" />').addClass('ingNameInput');
    var ingredientamount = $('<input type="number" step="0.05" placeholder="Amount" />').addClass('ingAmountInput');
    var ingredientunit = $('<input type="text" placeholder="Unit" />').addClass('ingUnitInput');
    section.append(ingredientname,ingredientamount,ingredientunit);
    $('#recipeIngredients').append(section);
    //Prevent form button from refreshing page.
    return false;
}

//Function for adding instructions
function addInst(){
    var section = $('<div/>').addClass('instructionDiv');
    var label = $('<span/>').text($('.instructionDiv').length +1 + ':  ');
    var inst = $('<input type="text" placeholder="Instruction" />').addClass('instInput');
    section.append(label,inst);
    $('#recipeInstructions').append(section);
    return false;
}

addIngButton.click(addIng);
addInstButton.click(addInst);

//Save and pack recipe into object to send to server and db.
var commitButton = $('<button/>').addClass('commitButton createButton').text('Save');
commitButton.click(function(){
    $('.insertionErrorMessage').remove();

    var name = $('.recipeName')[0].value;
    
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
    if(ings.length>0 && inst.length > 0){
        var recipe = {'name':name,'ingredients':ings,'instructions':insts};
        socket.emit('insertRecipe',recipe)
    }
    else{
        $('main').append( $('<span/>').addClass('insertionErrorMessage').text('Please enter at least one ingredient and one instruction.') )
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