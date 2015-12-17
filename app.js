// app.js
/* 
simple jquery based page controller
By Andrew Rowe
2015
contact: mr_andrew_d_rowe@hotmail.com
phone: 0438177786
*/

var pet = new Tamogotchi();  // the tamogotchi

$(document).ready(function(){
    // show or hide buttons depending on pet status
    function hideShow($this, hide) {
        if( hide ){
            $this.hide();
        }else{
            $this.show();
        }
    };
    // update the values of the pet properties
    function updateValues(){
        $('#health').html(Math.trunc(pet.getHealth()));
        $('#hunger').html(Math.trunc(pet.getHungry()));
        $('#happy').html(Math.trunc(pet.getHappy()));
        $('#age').html(Math.trunc(pet.getAge()));
        
        // show hide buttons
        var dead = pet.isDead();
        
        hideShow($('#restart'), !dead);
        hideShow($('#feed'), dead);
        hideShow($('#play'), dead);
        hideShow($('#clean'), dead);
        hideShow($('#sleep'), dead);
    }
    // set initial display controls
    $('#give_birth').show();
    $('#pet_board').hide();
    // start an interval to update pet property values
    updateValues();
    setInterval(function(){
        updateValues();
    }, 1000 );
    // setup button handlers
    $('#feed').click(function(){
        pet.feed();
    });
    $('#play').click(function(){
        pet.play();
    });
    $('#clean').click(function(){
        pet.cleanUp();
    });
    $('#sleep').click(function(){
        pet.sendToBed();
    });
    // rebirth the pet on start or death
    $('#birth,#restart').click(function(){
        $('#give_birth').fadeOut().promise().then(function(){
            $('#pet_board').fadeIn()
        });
        pet.init(document.getElementById('pet'));
    });
});
