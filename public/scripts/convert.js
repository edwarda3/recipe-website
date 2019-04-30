document.title = "Recipe Scalar - Convert";

var ingredient = $('<select/>').attr('id','conversionIngredient');

var ings = {'Water':1,
            'Milk':1,
            'Heavy Cream':1.009373,
            'Granulated/Brown Sugar':.8455651,
            'Caster Sugar':.951114,
            'AP Flour':.528344,
            'Bread Flour':.5367976,
            'Cake Flour':.4226752,
            'Gluten Free Flour':.51566384,
            'Salt':1.154303,
            'Butter':.9586275};

var massunits = {'gram':1,'kilogram':.001,'milligram':1000,'ounce':.035274,'pound':.00220462};
var volunits = {'milliliter':1,'liter':.001,'tablespoon':.067628,'teaspoon':.202884,'fluidoz':.033814,'cup':.00416667,'pint':.00211338,'quart':.00105669,'gallon':.000264172};

for (var ing in ings){
    ingredient.append( $('<option/>').val(ings[ing]).text(ing) );
}
ingredient.change(function(){
    changeValues($('.unitLabel').first().text(),parseFloat($('.unitAmount').first().val()))
});
$('main').append(ingredient);

for (var i in massunits){
    makeUnit(i);
}
for (var i in volunits){
    makeUnit(i);
}
changeValues($('.unitLabel').first().text(),100)

function makeUnit(unit){
    var div = $('<div/>').addClass('unitSection');
    div.append( $('<span/>').addClass('unitLabel').text(unit) );
    var inp = $('<input/>').addClass('unitAmount').attr('type','number').attr('step','any');
    div.append( inp );
    $('main').append(div);
    inp.bind('input',function(){
        changeValues(unit,parseFloat($(this).val()));
    });
}

function changeValues(unitName,unitVal){
    var basemass = 0;
    var basevol = 0;
    var ingratio = parseFloat(ingredient.val());
    if(unitName in massunits){
        basemass = unitVal / massunits[unitName];
        basevol = basemass / ingratio;
    }
    if(unitName in volunits){
        basevol = unitVal / volunits[unitName];
        basemass = basevol * ingratio;
    }
    $('.unitSection').each(function(index){
        var uname = $(this).find('.unitLabel').text();
        var uamt = $(this).find('.unitAmount');
        if(uname in massunits){
            newamt = Math.round(basemass*massunits[uname]*10000)/10000
            newroundedamt = Math.round(newamt);
            if(Math.abs(newamt-newroundedamt) < .05)
                newamt = newroundedamt;
            uamt.val(newamt);
        }
        if(uname in volunits){
            newamt = Math.round(basevol*volunits[uname]*10000)/10000
            newroundedamt = Math.round(newamt)
            if(Math.abs(newamt-newroundedamt) < .05)
                newamt = newroundedamt;
            uamt.val(newamt);
        }
    });
}
