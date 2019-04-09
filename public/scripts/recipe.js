var socket = io();

// Function which scales all ingredients.
// @param scalar: The scalar to scale everything by
// @param exclude: The index of the ingredient entry to exclude from scaling (This will be the one that is edited)
function scale(scalar,exclude){
    var ingAmounts = $('.recipeIngredientAmount');
    ingAmounts.each(function(i,element){
        if(i != exclude){    
            var originalval = rec.ingredients[i].amount;
            ingAmounts.eq(i).val((originalval*scalar).toFixed(2));
        }
    });
}

// Bind an input event to change the scaling of ingredients
$('#ingredientScalar').bind('input',function(){
    if(!isNaN($(this).val())){
        var scalar = parseFloat($(this).val()).toFixed(2);
        if(scalar > 0) scale(scalar,-1);
    }
});

var container = $('<div/>').attr('id','recipeContainer');
container.append( $('<ul/>').attr('id','recipeIngredientsList') );
container.append( $('<ol/>').attr('id','recipeInstructionsList') );
$('main').append(container);

// Make a div for each ingredient
rec.ingredients.forEach(function(ingredient,index){
    var item = $('<div/>').addClass('recipeIngredient');
    item.append( $('<span/>').addClass('recipeIngredientName').text(ingredient.name) );
    //The input object for each amount is special and needs to be able to be changed
    var input = $('<input type=number step=0.01 value/>').addClass('recipeIngredientAmount').val(ingredient.amount);
    var originalval = ingredient.amount;
    //The change in input will scale everything else to the proper amount
    input.bind('input',function(){
        if(!isNaN($(this).val())){
            var newval = $(this).val();
            if(newval > 0){
                var scalar = (newval/originalval).toFixed(2);
                $('#ingredientScalar').val(scalar);
                scale(scalar,index); //Exclude the current input because otherwise this locks up.
            }
        }
    });
    item.append(input);
    if(ingredient.unit.toLowerCase() != 'unit')
        item.append( $('<span/>').addClass('recipeIngredientUnit').text(ingredient.unit) );
    var li = $('<li/>').append(item);
    $('#recipeIngredientsList').append(li);
});

rec.instructions.forEach(function(instruction){
    var inst = $('<div/>').addClass('recipeInstruction');
    inst.append( $('<span/>').addClass('recipeInstructionText').text(instruction) );
    var li = $('<li/>').append(inst);
    $('#recipeInstructionsList').append(li);
});
