

$('main').append( $('<h2/>').addClass('recipeTitle').text(obj.name) );
$('main').append( $('<h3/>').addClass('scalarLabel').text('Scalar') );
$('main').append( $('<input type="number" step="0.01">').attr('id','ingredientScalar').val(obj.servings) );

editmode = false;

// Function which scales all ingredients.
// @param scalar: The scalar to scale everything by
// @param exclude: The index of the ingredient entry to exclude from scaling (This will be the one that is edited)
function scale(scalar,exclude){
    var ingAmounts = $('.recipeIngredientAmount');
    ingAmounts.each(function(i,element){
        if(i != exclude){
            var originalval = obj.ingredients[i].amount;
            var originalScalar = obj.servings;
            var newval = (originalval*scalar)/originalScalar;
            ingAmounts.eq(i).val(newval.toFixed(2));
        }
    });
}

// Bind an input event to change the scaling of ingredients
$('#ingredientScalar').bind('input',function(){
    if(!isNaN($(this).val()) && !editmode){
        var scalar = parseFloat($(this).val()).toFixed(2);
        if(scalar > 0) scale(scalar,-1);
    }
});

var container = $('<div/>').attr('id','recipeContainer');
container.append( $('<ul/>').attr('id','recipeIngredientsList') );
container.append( $('<hr>') );
container.append( $('<h3/>').addClass('recipeInstructionsLabel').text('Instructions') );
container.append( $('<div/>').attr('id','recipeInstructionsList') );
$('main').append(container);

// Make a div for each ingredient
obj.ingredients.forEach(function(ingredient,index){
    var item = $('<div/>').addClass('recipeIngredient');
    item.append( $('<hr>'));
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
    inst.append( $('<span/>').text($('.recipeInstruction').length +1 + ':  ') );
    inst.append( $('<span/>').addClass('recipeInstructionText').text(instruction) );
    $('#recipeInstructionsList').append(inst);
});

socket.on('loggedUserStatus',function(loggedusername){
    if(loggeduser == obj.creator){
        addRecipeOwnerActions();
    }
});


// Add recipe modification options: Edit, Delete recipe
function addRecipeOwnerActions(){
    var recipeModDiv = $('<div/>').attr('id','recipeMod');
    var editbutton = $('<button/>').attr('id','editRecipeButton').text('Edit');
    editbutton.bind('click',function(){
        if(!editmode) //enter edit mode
            enterEditMode();
        else 
            exitEditModeAndSave();
    });

    //Delete Recipe Button
    var delbutton = $('<button/>').attr('id','deleteRecipeButton').text('Delete');
    delbutton.bind('click',function(){
        if(confirm('Do you really want to delete recipe: '+obj.name))
            socket.emit('deleteRecipe',{'r_id':obj._id});
    });

    //Add the buttons to the page
    recipeModDiv.append(editbutton);
    recipeModDiv.append(delbutton);
    recipeModDiv.insertAfter( $('.recipeTitle') );
}

//Go into edit mode, convert to edit mode if entering from display
function enterEditMode(){
    $('#editRecipeButton').text('Save');
    $('.successMessage').remove();
    if(!editmode)
        convertIngredientsToEditMode();
        convertInstructionsToEditMode();
    editmode = true;
}

//Checks and gets all values that could have changed and sends them back to server.
//Abort saving if illegal values detected
function exitEditModeAndSave(){
    $('#editRecipeButton').text('Edit');
    $('.failureMessage').remove();
    var valid = true;

    //Get servings update
    var serv = $('#ingredientScalar').val();
    if(isNaN(serv) && serv > 0){
        $('<span/>').addClass('failureMessage').text('Serving size must be a positive number').insertAfter( $('#recipeMod') );
        valid = false;
    }

    //Get Ingredients Update
    var ings = getIngredientValues();
    if(ings == false){
        $('<span/>').addClass('failureMessage').text('Ingredient Amounts must be positive numbers').insertAfter( $('#recipeMod') );
        valid = false;
    }

    //Get Instructions Updates
    var insts = getInstructionValues();
    
    if(valid){
        convertIngredientsToDisplayMode();
        convertInstructionsToDisplayMode();
        editmode = false;
        var newdata = {'r_id':obj._id,'servings':serv,'ingredients':ings,'instructions':insts};
        socket.emit('updateRecipe',newdata)
    }
}

//Get a list of ingredient objects {name,amount,unit}
//If any non positive number is entered, abort commit
function getIngredientValues(){
    var ings = [];
    $('.recipeIngredient').each(function(index){
        var name = $(this).find('.recipeIngredientName').text();
        var amount = $(this).find('.recipeIngredientAmount').val();
        if(isNaN(amount) || amount < 0) return false; //Err and return control to edit mode if non-number is encountered, or negative
        var unit = ''
        if ( $(this).find('.recipeIngredientUnit').length > 0)
            unit = $(this).find('.recipeIngredientUnit').text();
        newdata = {'name':name, 'amount': amount, 'unit': unit};
        ings.push(newdata);
    });
    $('.recipeIngredientNew').each(function(index){
        var name = $(this).find('.ingNameInput').val();
        var amount = $(this).find('.ingAmountInput').val();
        if(isNaN(amount) || amount < 0) return false; //Err and return control to edit mode if non-number is encountered, or negative
        var unit = $(this).find('.ingUnitInput').val();
        newdata = {'name':name, 'amount': amount, 'unit': unit};
        ings.push(newdata);
    });
    return ings;
}

//Get rid of ingredients label, add button, and remove buttons.
function convertIngredientsToDisplayMode(){
    $('.removeDiv').remove();
    $('.addButton').remove();
    $('.recipeSectionLabel').remove();
}

//Put in more inputs for ingredients...
function convertIngredientsToEditMode(){
    $('.recipeIngredient').each(function(i){
        var remButton = $('<i/>').addClass('material-icons buttonIcon removeDiv').html('close');
        $(this).append(remButton);
        remButton.bind('click',function(){
            $(this).parent().remove();
        });
    });
    
    $('#recipeIngredientsList').prepend($('<h3/>').addClass('recipeSectionLabel').text('Ingredients'));
    var addIngButton = $('<i/>').addClass('material-icons buttonIcon addButton').html('add');
    addIngButton.bind('click',function(){
        var item = $('<div/>').addClass('recipeIngredientNew');
        item.append( $('<hr>'));
        var ingredientname = $('<input type="text" placeholder="Name" />').addClass('ingNameInput');
        var ingredientamount = $('<input type="number" step="0.01" placeholder="Amount" />').addClass('ingAmountInput');
        var ingredientunit = $('<input type="text" placeholder="Unit" />').addClass('ingUnitInput');
        var remButton = $('<i/>').addClass('material-icons buttonIcon').html('close'); 
        remButton.bind('click',function(){
            item.remove();
        });
        item.append(ingredientname,ingredientamount,ingredientunit,remButton);
        $('#recipeIngredientsList').append( $('<li/>').append(item) );
    });
    addIngButton.insertAfter($('.recipeSectionLabel'));
}

//Gets the values of the instruction fields. Ignores the field if empty
function getInstructionValues(){
    var insts = [];
    $('.recipeInstruction').each(function(index){
        var inst = $(this).find('.recipeInstructionEdit').val();
        if(inst.length > 0)
            insts.push(inst);
    });
    return insts;
}

//Converts the instructions section from Edit Mode to Display Mode.
//Changes each instruction back to a span. Remove delete buttons and add button.
function convertInstructionsToDisplayMode(){
    $('.recipeInstruction').each(function(index){
        var instDiv = $(this);
        instDiv.append( $('<span/>').addClass('recipeInstructionText').text($(this).find('.recipeInstructionEdit').val()) );
        instDiv.find('.recipeInstructionEdit').remove();
        instDiv.find('.removeDiv').remove();
    });
    $('.addButton').remove();
}

//Converts the instructions section from Display Mode to Edit Mode.
//Changes each instruction to a editable textarea. Add remove buttons and an add button.
function convertInstructionsToEditMode(){
    //Add + button
    var addInstButton = $('<i/>').addClass('material-icons buttonIcon addButton').html('add');
    addInstButton.bind('click',function(){
        var inst = $('<div/>').addClass('recipeInstruction');
        inst.append( $('<span/>').text($('.recipeInstruction').length +1 + ':  ') );
        inst.append( $('<textarea rows="1" type="text"/>').addClass('recipeInstructionEdit') );
        $('#recipeInstructionsList').append(inst);
    });
    addInstButton.insertAfter( $('.recipeInstructionsLabel') );

    //Make Instructions into Textareas
    $('.recipeInstruction').each(function(index){
        var instDiv = $(this);
        instDiv.append( $('<textarea rows="1" type="text"/>').addClass('recipeInstructionEdit').val($(this).find('.recipeInstructionText').text()) );
        instDiv.find('.recipeInstructionText').remove();
        //Add remove icon button
        var remButton = $('<i/>').addClass('material-icons buttonIcon removeDiv').html('close');
        remButton.bind('click',function(){
            //Remove the div that holds this X button
            instDiv.remove();
            //Update all other instruction numbers such that they don't skip
            $('.recipeInstruction span').each(function(index){
                $(this).text((index+1).toString()+': ');
            });
        });
        instDiv.append(remButton)
    });
}



socket.on('updateSuccess',function(){
    $('<span/>').attr('id','updateSuccessMessage').addClass('successMessage').text('Recipe Update Successful').insertAfter( $('#recipeMod') );
    if($('.recipeIngredientNew').length > 0){
        location.reload();
    }
})
socket.on('deleteSuccess',function(){
    alert('Successfully deleted recipe');
    window.location.href = '/recipes'
})
