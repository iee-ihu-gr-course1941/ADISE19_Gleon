//jshint esversion:6

//imports
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const socket = require("socket.io");
const http = require("http");
var _ = require('lodash');

//our port to connect
const port = 3000;
//we start a new express app
var app = express();
//starting the server
const server = http.Server(app);
const io = socket(server);


//we use EJS as the express view engine
app.set('view engine', 'ejs');
//we use bodyParser to grab HTML content
app.use(bodyParser.urlencoded({
  extended: true
}));
//we need to specify the folder that will use our application's resources
app.use(express.static("public"));

//a counter to see how many users are currently on our app
var users = 0;
//a counter to check the players logged playing (2 max)
var userInGame = 0 ;
//a boolean to check if the game is full or not
var gameFull = false ;
//SOCKETS' MANAGEMENT
io.on('connection', function(socket) {
  //incrementing users by 1
  users++;
  console.log("current users are "+users);
  //when a user connects
  console.log("A user has connected");
  //when a user disconnets
  socket.on('disconnect', function() {
    //decrement user upon leaving
    users--;
    console.log('A user disconnected');
  });
  //send to client how many players are currently in the game
  socket.emit("usersInGame",userInGame);

  // //Send a message after a timeout of 4seconds
  // setTimeout(function() {
  //   //socket.send sends a message
  //    socket.send('Sent a message 4seconds after connection!');
  // }, 4000);
});


/////////////////////////////database COLLECTION AND SCHEMA creation ////////////
//we create the SCHEMA of a card
const cardSchema = mongoose.Schema({
  suit: String, //SPADES , HEARTS , DIAMONDS , CLUBS
  value: String, //2 3 4 5 6 7 8 9 10 J Q K A
});

//we create the collection (TABLE) where it will hold our cards
const Card = mongoose.model("card", cardSchema);

//we create our SCHEMA for the deck that will contain cards that use cardSchema
const deckSchema = mongoose.Schema({
  card: [cardSchema]
});

//we finally create the DECK collection (TABLE) that has the 52 cards.
const Deck = mongoose.model("deck", deckSchema);
// HOW WE SAVE ONE CARD
// let newCard = new Card({
//   suit:"spades",
//   value:"A"
// });
// newCard.save();




// "/" HTTP requests
app.route("/")

  .get(function(req, res) {
    console.log("Users in game are "+userInGame);
    res.render("index");
  })

  .post(function(req, res) {
    let startingHand = [];
    let remainingCards = [];
    let user = req.body.usernameText;
    Card.find(function(err, foundItems) {
      //with lodash we can get random 6 items from our cards db. Which is
      //eventually our starting hand.
      startingHand = _.sampleSize(foundItems, 6);
      //we create a new deck which has all the elements besides the starting hand
      remainingCards = _.difference(foundItems, startingHand);
    });
    userInGame++;
    res.render("game", {
      gameBoard: "Welcome " + user + " waiting the game to start..."
    });
  });




app.get("/cards", function(req, res) {
  Card.find(function(err, foundItems) {
    res.send(foundItems);
    //eventually our starting hand.
    startingHand = _.sampleSize(foundItems, 6);
    //we create a new deck which has all the elements besides the starting hand
    remainingCards = _.difference(foundItems, startingHand);
    console.log(startingHand);
    console.log(remainingCards);

  });
});


//server start to port 3000
server.listen(port, function(err) {
  console.log("Server started on port 3000");
});

//our connection to mongoDB on our kseriDB, if there is no DB with the current
//name it will be automatically created.
mongoose.connect("mongodb://localhost:27017/kseriDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function() {
  console.log("Database connected on port 27017");
});
