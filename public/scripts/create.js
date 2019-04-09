var socket = io();

var form = $('<form>').attr('id','addRecipeForm');
form.append('Name: <input class="recipeName" type="text"/>');
form.append($('<h3/>').text('Ingredients'))
form.append($('<div/>').attr('id','recipeIngredients'));
form.append($('<h3/>').text('Instructions'))
form.append($('<div/>').attr('id','recipeInstructions'));

function addIng(){
    var section = $('<div/>').addClass('ingredientDiv');
    var ingredientname = $('<input type="text" text="Name" />').addClass('ingNameInput');
    var ingredientamount = $('<input type="number" step="0.05" text="Name" />').addClass('ingAmountInput');
    var ingredientunit = $('<input type="text" text="Name" />').addClass('ingUnitInput');
    section.append(ingredientname,ingredientamount,ingredientunit);
    $('#recipeIngredients').append(section);
}
function addInst(){
    var section = $('<div/>').addClass('instructionDiv');
    var label = $('<span/>').text($('.instructionDiv').length +1 + ':  ');
    var inst = $('<input type="text" text="Instruction" />').addClass('instInput');
    section.append(label,inst);
    $('#recipeInstructions').append(section);
}

var addIngButton = $('<button/>').addClass('addButton createButton').text('Add Ingredient');
addIngButton.click(addIng);

var addInstButton = $('<button/>').addClass('addButton createButton').text('Add Instruction');
addInstButton.click(addInst);

var commitButton = $('<button/>').addClass('commitButton createButton').text('Save');
commitButton.click(function(){
    var name = $('.recipeName')[0].value;
    var ings = [];
    $('.ingredientDiv').each(function(i,obj){
        var ingName = obj.childNodes[0].value;
        var ingAmount = obj.childNodes[1].value;
        var ingUnit = obj.childNodes[2].value;
        var ingredient = {'name':ingName, 'amount': ingAmount, 'unit': ingUnit};
        ings.push(ingredient);
    });
    var insts = [];
    $('.instructionDiv').each(function(i,obj){
        insts.push(obj.childNodes[1].value);
    });
    var recipe = {'name':name,'ingredients':ings,'instructions':insts};
    socket.emit('insertRecipe',recipe)
});

addIng();
addInst();

$('main').append(form)
$('main').append(addIngButton)
$('main').append(addInstButton)
$('main').append(commitButton)

socket.on('insertionError',function(){
    console.log('Error inserting recipe into database. Please try again later')
});
socket.on('insertionSuccess',function(){
    console.log('Successfully inserted recipe into database.')
});