// tamogotchi.js
/*
    By Andrew Rowe
    2015
    contact: mr_andrew_d_rowe@hotmail.com
    phone: 0438177786

    virtual pet class
    example:
    var pet = new Tamogotchi();
    
    // make it live
    pet.init(document.getElementById('pet'));
    
    control using this public action methods:
    feed() - decrease hunger
    play() - increase happiness
    cleanUp() - remove poops
    sendToBed() - send the pet to bed
*/


function Tamogotchi(){
    // constants
    // ==============
    // ages
    var AGE_BIRTH = 0;
    var AGE_BABY = 2;
    var AGE_CHILD = 6;
    var AGE_TEENAGER = 13;
    var AGE_ADULT = 20;
    var AGE_GRANDPA = 60;
    var AGE_DEAD = 90;
    // image
    var CANVAS_HEIGHT = 300;
    var CANVAS_WIDTH = 200;
    // pet property increments per tick period
    var POO_RATE = 0.05;
    var AGE_RATE = 0.1;
    var HUNGER_RATE = 0.1;
    var SLEEPY_RATE = 0.2;
    var ANGER_RATE = 0.1;
    // sleepy
    var SLEEP_WAKE = 0;
    var SLEEP_SLEEP = 20;
    var SLEEP_WAKEUP = 40;
    var SLEEP_DEAD = -1;
    // other contants
    var MAX_HEALTH = 100;
    var TICK_MILLISECONDS = 2000;
    // ================
    // where to show picture of pet
    var displayElement;
    var canvasCtx;
    var baseImage;
    var img_poop;
    // pet status variables
    var happy = 100;
    var poo = 0;
    var previousPoo = 0;
    var hungry = 0;
    var sleepy = 0;
    var age = 0;
    var sleepState = SLEEP_WAKE;
    var ageState = AGE_BIRTH;
    // the message to display on flash method
    var message = '';
    // inteval return value
    var timer;
    var tickCount = 0;
    // normal javascript self/this variable
    var self = this;
    
    // private methods
    // ===============
    
    // interval method to make pet live/die/poo/hunger
    // and change pet image
    function tick(){
        if( self.isDead() ){
            return;
        }
        if( ageState != AGE_BIRTH ){
            happy-= ANGER_RATE;
            hungry+= HUNGER_RATE;
            sleepy+= SLEEPY_RATE;
            if( sleepState != SLEEP_SLEEP ){
                poo+= POO_RATE;
            }
        }
        age+= AGE_RATE;
        
        tickCount++;
        update();
        draw();
    }
    
    // show message on pet for four seconds
    // _message: the message to display on the screen
    function flash(_message){
        message = _message;
        setTimeout(function(){
            message = "";
        },4000 );
    }
    
    // draw the background which changes color depending on pet health
    // green - healthy
    // blue - moderate
    // red - danger zone!
    function drawBackground(){
        
        var fillColor = 'green';
        var oldFillStyle = canvasCtx.fillStyle;
        
        if( self.getHealth() > MAX_HEALTH/2 ){
            fillColor = 'green';
        }
        
        if(self.getHealth() < MAX_HEALTH/2){
            fillColor = 'blue';
        }
        
        if(self.getHealth() < MAX_HEALTH/4){
            fillColor = 'red';
        }
        
        canvasCtx.fillStyle = fillColor;
        canvasCtx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);        
        canvasCtx.fillStyle = oldFillStyle;
    }
    
    // draw an image on the base of the canvas
    function drawBaseImage(_baseImage){
        var img = document.getElementById(_baseImage);
         // makes the pet image pulse like a hearbeat
        var heartBeatChange = 10;
        
        if( tickCount % 2 == 1 ){
            heartBeatChange = 20
        }
        try{
            canvasCtx.drawImage(img,
                heartBeatChange,
                heartBeatChange,
                CANVAS_WIDTH-(heartBeatChange*2),
                CANVAS_HEIGHT-(heartBeatChange*2));
        }catch(err){
            console.log('_baseImage',_baseImage);
            alert("drawing error:"+err);
        }
    }    
    
    // draw the pet based upon it's status properties
    function draw(){

        // draw poopies over the pet
        function drawPoop(){
            var poo_dimension = 20;
            var column = 0;
            var row = 0;
            
            for( var p = 0; p < Math.trunc(poo); p++ ){
                var x = poo_dimension + (column * (poo_dimension+5) );
                var y = row*poo_dimension;

                column++;
                if( x+(2*poo_dimension) > CANVAS_WIDTH ){
                    column = 0;
                    row++;
                }
                canvasCtx.drawImage(img_poop, 
                    x, 
                    y );
            }
        }
        
        drawBackground();
        var _baseImage = baseImage;
        
        if( sleepState == SLEEP_SLEEP ){
            _baseImage += "_sleep"; // use a sleepy image instead
        }
        
        // show dumping
        // should not be pooping when sleeping
        if( !self.isDead() && Math.trunc(poo) > previousPoo ){
            drawBaseImage('img_dump');
            setTimeout(function(){
                drawBaseImage(_baseImage);
                },TICK_MILLISECONDS - 500
            );
            previousPoo = Math.trunc(poo);
        }else{
            drawBaseImage(_baseImage);
        }
        
        if( !self.isDead() ){
            drawPoop();
        }
        
        // put any flash message onto the pet
        if( message ){
            canvasCtx.font = "bold 18px serif";
            canvasCtx.fillStyle = "yellow";
            canvasCtx.fillText(message, 10, CANVAS_HEIGHT/1.8, CANVAS_WIDTH);
        }
    }
    
    // update the health state and other
    // pet status properties
    function update(){
        if( self.getHealth() < 1 ){
            sleepState = SLEEP_DEAD;
            ageState = AGE_DEAD;
            baseImage = 'img_dead';
            message = "TAKE BETTER CARE";
        }else{
            // sleep state
            switch(sleepState){
                case SLEEP_WAKE:
                    if( sleepy > SLEEP_SLEEP ){
                        sleepState = SLEEP_SLEEP;
                        flash("TIME FOR BED");
                    }
                    break;
                case SLEEP_SLEEP:
                    if( sleepy > SLEEP_WAKEUP ){
                        sleepy = SLEEP_WAKE;
                        sleepState = SLEEP_WAKE;
                        flash("WAKE UP!");
                    }
                    break;
            }
            // age state
            switch(ageState){
                case AGE_BIRTH:
                    if( age > AGE_BABY ){
                        ageState = AGE_BABY;
                        baseImage = 'img_baby';
                        flash("I'M BORN!");
                    }
                    break;
                case AGE_BABY:
                    if( age > AGE_CHILD ){
                        ageState = AGE_CHILD;
                        baseImage = 'img_child';
                        flash("NO LONGER A BABY!");
                    }
                    break;
                case AGE_CHILD:
                    if( age > AGE_TEENAGER ){
                        ageState = AGE_TEENAGER;
                        baseImage = 'img_teenager';
                        flash("GET ME A MOTORBIKE!");
                    }
                    break;
                case AGE_TEENAGER:
                    if( age > AGE_ADULT ){
                        ageState = AGE_ADULT;
                        baseImage = 'img_adult';
                        flash("ALL GROWN UP!");
                    }
                    break;
                case AGE_ADULT:
                    if( age > AGE_GRANDPA ){
                        ageState = AGE_GRANDPA;
                        baseImage = 'img_grandpa';
                        flash("GET OFF MY LAWN!");
                    }
                    break;
                case AGE_GRANDPA:
                    if( age > AGE_DEAD ){
                        ageState = AGE_DEAD;
                        sleepState = SLEEP_DEAD;
                        baseImage = 'img_dead';
                        message = "DIED OF OLD AGE";
                    }
                    break;
            }
        }
    }
    
    // create the canvas to show the pet
    function createCanvasCtx(){
        var w = CANVAS_WIDTH;
        var h = CANVAS_HEIGHT;
        
        canvasCtx = displayElement.getContext("2d");
        displayElement.width = w; 
        displayElement.height = h;
    }

    
    // public getters
    // ==============
    
    this.isDead = function(){
        return ageState == AGE_DEAD;
    }
    
    this.getHealth = function(){
        return happy - hungry - poo;
    }
    
    this.getHappy = function(){
        return happy;
    }
    
    this.getPoo = function(){
        return poo;
    }
    
    this.getSleepy = function(){
        return sleepy;
    }
    
    this.getAge = function(){
        return age;
    }
    
    this.getHungry = function(){
        return hungry;
    }
    
    // public actions
    // ==============
    
    // feed the pet
    this.feed = function(){
        if( ageState == AGE_BIRTH ){
            return;
        }
        if( sleepState == SLEEP_SLEEP ){
            flash('SLEEPING!');
            return;
        }
        
        if( self.isDead() ){
            flash('TOO LATE!');
            return;
        }
        
        hungry-=10;
        if( hungry <= 0 ){
            hungry = 0;
            flash("I'M FULL!");
        }else{
            flash("NOM NOM NOM");
            drawBaseImage("img_eat");
        }
    }
    
    // make the pet sleep
    this.sendToBed = function(){
        if( self.isDead() || ageState == AGE_BIRTH || sleepState == SLEEP_SLEEP){
            return;
        }
        flash("GO TO BED!")
        sleepy = SLEEP_SLEEP;
    }
    
    // clean up a single poop
    this.cleanUp = function(){
        if( ageState == AGE_BIRTH || self.isDead() || poo < 1 ){
            return;
        }
        poo = Math.max(0,--poo);
        previousPoo = Math.trunc(poo);
        drawBaseImage("img_flush");
    }
    
    // play with the pet to make it happier
    this.play = function(){
        if( ageState == AGE_BIRTH ){
            return;
        }
        
        if( sleepState == SLEEP_SLEEP ){
            flash('LET ME SLEEP');
            return;
        }
        
        if( self.isDead() ){
            flash("I'M PLAYING DEAD");
            return;
        }
        happy+=5;
        if( happy > MAX_HEALTH){
            happy = MAX_HEALTH;
            flash("ENOUGH PLAY!");
        }else{
            flash("WEEEEE");
            drawBaseImage("img_play");
        }
    }
    // initialize the pet and set the displayElement
    // to draw the pet
    // _displayElement: DOM canvas element
    this.init = function(_displayElement){
        displayElement = _displayElement;
        createCanvasCtx();
        baseImage = 'img_egg';
        happy = MAX_HEALTH;
        poo = 0;
        previousPoo = 0;
        hungry = 0;
        sleepy = 0;
        age = 0;
        sleepState = SLEEP_WAKE;
        ageState = AGE_BIRTH;
        tickCount = 0;
        message = "";
        img_poop = document.getElementById('img_poop')
        draw()
        clearInterval(timer);
        timer = setInterval(tick,TICK_MILLISECONDS);
    };
}
