//jshint esversion:6

//imports
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require ("mongoose");
var _ = require('lodash');


//we start a new express app
var app = express();
//we use EJS as the express view engine
app.set('view engine', 'ejs');
//we use bodyParser to grab HTML content
app.use(bodyParser.urlencoded({
  extended: true
}));
//we need to specify the folder that will use our application's resources
app.use(express.static("public"));



/////////////////////////////database COLLECTION AND SCHEMA creation ////////////

//we create the SCHEMA of a card
const cardSchema = mongoose.Schema({
  suit:String, //SPADES , HEARTS , DIAMONDS , CLUBS
  value: String,//2 3 4 5 6 7 8 9 10 J Q K A
});

//we create the collection (TABLE) where it will hold our cards
const Card = mongoose.model("card",cardSchema);

//we create our SCHEMA for the deck that will contain cards that use cardSchema
const deckSchema = mongoose.Schema({
  card:[cardSchema]
});

//we finally create the DECK collection (TABLE) that has the 52 cards.
const Deck = mongoose.model("deck",deckSchema);


// HOW WE SAVE ONE CARD
// let newCard = new Card({
//   suit:"spades",
//   value:"A"
// });
// newCard.save();




// "/" HTTP requests
app.route("/")

.get(function(req,res){
  res.render("index");
})

.post(function(req,res){
  let startingHand = [];
  let remainingCards = [];
  let user = req.body.usernameText;
  Card.find(function(err,foundItems){
    //with lodash we can get random 6 items from our cards db. Which is
    //eventually our starting hand.
    startingHand = _.sampleSize(foundItems,6);
    //we create a new deck which has all the elements besides the starting hand
    remainingCards = _.difference(foundItems,startingHand);

  });
  res.render("game",{
    gameBoard: "Welcome "+user+ " waiting the game to start..."
  });

});




app.get("/cards",function(req,res){
  Card.find(function(err,foundItems){
    res.send(foundItems);

  });
});


//server start to port 3000
app.listen(3000,function(err){
    console.log("Server started on port 3000");
});

//our connection to mongoDB on our kseriDB, if there is no DB with the current
//name it will be automatically created.
mongoose.connect("mongodb://localhost:27017/kseriDB",{ useNewUrlParser: true, useUnifiedTopology: true },function(){
    console.log("Database connected on port 27017");
});
