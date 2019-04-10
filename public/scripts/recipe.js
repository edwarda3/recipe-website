

$('main').append( $('<h2/>').addClass('recipeTitle').text(obj.name) );
$('main').append( $('<h3/>').addClass('scalarLabel').text('Scalar') );
$('main').append( $('<input type="number" step="0.01">').attr('id','ingredientScalar').val('1') );

editmode = false;

// Function which scales all ingredients.
// @param scalar: The scalar to scale everything by
// @param exclude: The index of the ingredient entry to exclude from scaling (This will be the one that is edited)
function scale(scalar,exclude){
    var ingAmounts = $('.recipeIngredientAmount');
    ingAmounts.each(function(i,element){
        if(i != exclude){    
            var originalval = obj.ingredients[i].amount;
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
obj.ingredients.forEach(function(ingredient,index){
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
                if(!editmode) { 
                    var scalar = (newval/originalval).toFixed(2);
                    $('#ingredientScalar').val(scalar);
                    scale(scalar,index); //Exclude the current input because otherwise this locks up.
                }
            }
        }
    });
    item.append(input);
    if(ingredient.unit.toLowerCase() != 'unit')
        item.append( $('<span/>').addClass('recipeIngredientUnit').text(ingredient.unit) );
    var li = $('<li/>').append(item);
    $('#recipeIngredientsList').append(li);
});

obj.instructions.forEach(function(instruction){
    var inst = $('<div/>').addClass('recipeInstruction');
    inst.append( $('<span/>').addClass('recipeInstructionText').text(instruction) );
    var li = $('<li/>').append(inst);
    $('#recipeInstructionsList').append(li);
});

socket.on('loggedUserStatus',function(loggedusername){
    if(loggeduser == obj.creator){
        var editbutton = $('<button/>').attr('id','editRecipeButton').text('Edit');
        editbutton.bind('click',function(){
            editmode = !editmode;
            if(!editmode){ //exit edit mode
                $(this).text('Edit');
                var ings = [];
                var ing = $('.recipeIngredient');
                ing.each(function(i,element){
                    var name = ing.eq(i)[0].childNodes[0].textContent;
                    var amount = ing.eq(i)[0].childNodes[1].value;
                    var unit = ''
                    if (ing.eq(i)[0].childNodes.length >= 3)
                        unit = ing.eq(i)[0].childNodes[2].textContent;
                    newdata = {'name':name, 'amount': amount, 'unit': unit};
                    ings.push(newdata);
                });
                var newdata = {'r_id':obj._id,'ingredients':ings,};
                socket.emit('updateRecipe',newdata)
            } else {
                $(this).text('Save');
                $('#updateSuccessMessage').remove();
            }
        });
        editbutton.insertAfter( $('.recipeTitle') );

        var delbutton = $('<button/>').attr('id','deleteRecipeButton').text('Delete');
        delbutton.bind('click',function(){
            if(confirm('Do you really want to delete recipe: '+obj.name))
                socket.emit('deleteRecipe',{'r_id':obj._id});
        });
        delbutton.insertAfter( editbutton );
    }
});
socket.on('updateSuccess',function(){
    $('<span/>').attr('id','updateSuccessMessage').addClass('successMessage').text('Recipe Update Successful').insertAfter( $('#editRecipeButton') );
})
socket.on('deleteSuccess',function(){
    alert('Successfully deleted recipe');
    window.location.href = '/recipes'
})