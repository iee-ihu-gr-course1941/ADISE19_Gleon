//jshint esversion:6

// TODO list
// populate starting hands to the server for each player after they are ready to start


//imports
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const socket = require("socket.io");
const http = require("http");
const _ = require('lodash');
const session = require("express-session");
const passport = require("passport");
const uid = require('uid-safe');
const passportLocalMongoose = require("passport-local-mongoose");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getUsers,
  getAllUsers,
  getRoom,
  setRemainingCards,
  getRemainingCards
} = require('./users');
//our port to connect
const port = process.env.PORT || 3000;
//we start a new express app
var app = express();
//starting the server
const server = http.Server(app);
io = socket(server);


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
//a boolean to check if the game is full or not
var gameFull = false;
//an array for players
var players = [];
//an array that indicates the current gameBoard
var board = [];
//a counter to check the players logged playing (2 max)
var usersInGame = 0;
//a boolean to check if game is on
var gameOn = false;
//temp socket id
var tempSocket;
//an array that represents the current gameBoard
var board=[];


//////////////////////////////////SESSION SETTINGS/////////////////////////////


//we setup our session's info
app.use(session({
  name: "sid",
  secret: 'secretSecret',
  resave: false,
  saveUninitialized: false
}));
//required code
app.use(passport.initialize());
app.use(passport.session());


/////////////////////////////database COLLECTION AND SCHEMA creation ////////////
//we create the SCHEMA of a card
const cardSchema = mongoose.Schema({
  suit: String, //(S)PADES , (H)EARTS , (D)IAMONDS , (C)LUBS
  value: String, //2 3 4 5 6 7 8 9 10 J Q K A
});
//we create our user's SCHEMA
const userSchema = mongoose.Schema({
  username: String,
  password: String,
  startingHand: [],
  currentTurn: {
    required: true,
    type: Boolean
  }
});
//plugin our Users with Passport for easier Authentication
userSchema.plugin(passportLocalMongoose);
//users collection (TABLE) that will hold the current active players
const User = mongoose.model("user", userSchema);
//code needed for passport initialisation
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//we create the collection (TABLE) where it will hold our cards
const Card = mongoose.model("card", cardSchema);
//we create the collection (TABLE) where it will hold our remainingCards
const RemainingCards = mongoose.model("remaining card", cardSchema);
//we create a temp table in our db with the current active players
const UsersInGame = mongoose.model("user in game", userSchema);

//we create our SCHEMA for the deck that will contain cards that use cardSchema
const deckSchema = mongoose.Schema({
  card: [cardSchema]
});

//we finally create the DECK collection (TABLE) that has the 52 cards.
const Deck = mongoose.model("deck", deckSchema);

// HOW WE SAVE ONE CARD
// let newCard = new Card({
//   suit:"S",
//   value:"A"
// });
// newCard.save();

//////////////////////////////SOCKETS' MANAGEMENT//////////////////////////////

io.on('connection', function(socket) {

  //we check if the the room is full with callback to client with the number of players
  socket.on('checkRoom', function(room) {
    // let users = getUsersInRoom(roomName);
    var tempUsers = getAllUsers();
    room(tempUsers);
  });
  socket.on("joinRoom", function(room) {
    socket.join(`${room}`, function() {
      //gives back the connected sockets to the specific room
      clients = io.sockets.adapter.rooms[`${room}`].sockets;

      console.log("Checking clients in this room");
      console.log(clients);
      // let rooms = Object.keys(socket.rooms);
      // console.log(rooms); // [ <socket.id>, 'room 237' ]
      io.to(`${room}`).emit('a new user has joined the room'); // broadcast to everyone in the room
    });
  });

  // io.in('game').emit('big-announcement', 'the game will start soon');

  tempSocket = socket.id;

  //when a user disconnets
  socket.on('disconnect', function() {
    removeUser(socket.id);
    console.log('A user disconnected');
  });

  //on startGame handler which is sent from client when game is ready to start
  socket.on("startGame", function() {
    console.log("game has started");
  });
});

//function for the initial card deal
function initialCardDeal() {
  let tempItems;
  let firstPlayerRandomCards;
  let remainingCards;
  let secondPlayerRandomCard;

  Card.find(function(err, foundItems) {
    //with lodash we can get random 6 items from our cards db. Which is
    //eventually our starting hand.
    //We initialise the first player's hand
    //update the hand of the users
    tempItems = foundItems;
  });

  //accesing all our users and giving the first two players random cards
  User.find(function(err, foundUsers) {

    // PLAYER 1 UPDATE
    firstPlayerRandomCards = _.sampleSize(tempItems, 6);
    remainingCards = _.difference(tempItems, firstPlayerRandomCards);
    User.updateOne({
      username: foundUsers[0].username
    }, {
      startingHand: firstPlayerRandomCards
    }, function(err, user) {
      if (err) {
        console.log(err);
      } else {
        console.log("User updated");
      }
    });

    // PLAYER 2 UPDATE
    secondPlayerRandomCards = _.sampleSize(remainingCards, 6);
    remainingCards = _.difference(remainingCards, secondPlayerRandomCards);
    setRemainingCards(remainingCards);
    User.updateOne({
      username: foundUsers[1].username
    }, {
      startingHand: secondPlayerRandomCards
    }, function(err, user) {
      if (err) {
        console.log(err);
      } else {
        console.log("User updated");
      }
    });
  });
}

//function to deal cards when all cards from players are finished
function dealCards() {
  let firstPlayerRandomCards;
  let secondPlayerRandomCard;
  let remainingCards = getRemainingCards();
  //with lodash we can get random 6 items from our cards db. Which is
  //eventually our starting hand.
  //We initialise the first player's hand
  //update the hand of the users
  console.log("Those are all the remaining cards");
  console.log(remainingCards);

  User.find(function(err, foundUsers) {

    // PLAYER 1 UPDATE
    firstPlayerRandomCards = _.sampleSize(remainingCards, 6);
    remainingCards = _.difference(remainingCards, firstPlayerRandomCards);
    User.updateOne({
      username: foundUsers[0].username
    }, {
      startingHand: firstPlayerRandomCards
    }, function(err, user) {
      if (err) {
        console.log(err);
      } else {
        console.log("User updated");
      }
    });
    // PLAYER 2 UPDATE
    secondPlayerRandomCards = _.sampleSize(remainingCards, 6);
    remainingCards = _.difference(remainingCards, secondPlayerRandomCards);
    User.updateOne({
      username: foundUsers[1].username
    }, {
      startingHand: secondPlayerRandomCards
    }, function(err, user) {
      if (err) {
        console.log(err);
      } else {
        console.log("User updated");
      }
    });
  });
}

//function to remove a card from the hand when it's played
function removeCardFromDeck(value,suit) {
  //we remove the card played from the array
  User.updateOne({}, {
    "$pull": {
      startingHand: {
        value: value,
        suit:suit
      }
    }
  }, {
    safe: true,
    multi: true
  }, function(err, card) {
    if (err){
      console.log(err);
    }else {
      console.log(card +" was removed from your hand !");
    }
  });

  let cardPlayed = value+suit;
  board.push(cardPlayed);
}

//function to check if it's user's turn
function checkTurn(username){
  User.find({username:username},function(err,user){
    if (err){
      console.log(err);
    }else {
      return user.currentTurn;
    }
  });
}


// HOME "/" HTTP requests
app.route("/")
  //GET to our home route
  .get(function(req, res) {
    initialCardDeal();

    // io.to(`${tempSocket}`).emit("test");
    //find how many players are registered
    // User.countDocuments(function(err, count) {
    //   console.log('there are %d users in our db', count);
    //   usersInGame = count;
    // });

    res.render("index");
  })
  //POST from our home route (login)
  .post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var room = req.body.room;

    const newUser = new User({
      username: username,
      password: password,
      room: room,
    });
    passport.authenticate('local', function(err, user, info) {
      // console.log("This is the info for the user : ");
      // console.log(user);
      players.push(user);

      //passport searches our DB if there is user with that username
      if (!user) {
        return res.redirect('/');
      }
      //since we found the user we now check if they typed their correct credentials
      req.login(newUser, function(err) {
        if (err) {
          console.log(err);
        }
        //Code below is after the user has been succesfully authenticated

        //check if the room has space
        let usersInRoom = getUsersInRoom(room);
        if (usersInRoom >= 2) {
          console.log("Room is full");
          //if not redirect to home
          return res.redirect('/');
        } else {
          //if there is room add the user in the room
          addUser(req.user._id, req.user.username, room);


          //send to the current socket
          // io.to(`${tempSocket}`).emit("authenticatedJoin", {
          //   username,
          //   room
          // });
          //increment users
          // usersInGame++;

          //render our main game page since everything went ok
          return res.render("game", {
            title: "Παρακαλώ περιμένετε τον 2ο παίκτη",
            startingHand: [],
            board:[],
            currentUser: req.user
            //callback to inform first player if room has filled
          }, function(err, info) {
            if (err) {
              console.log(err);
            } else {
              res.render("game", {
                title: "Παρακαλώ περιμένετε τον 2ο παίκτη",
                startingHand: [],
                board:[],
                currentUser: req.user
              });
              var tempUsers = getAllUsers();
              io.sockets.emit('checkRoom', tempUsers);
            }
          });
        }
      });
    })(req, res);
  });



//when a move is made
app.post("/update", function(req, res) {
  console.log("This is the card VALUE");
  console.log(req.body.cardValue);
  console.log("This is the card SUIT");
  console.log(req.body.cardSuit);
  removeCardFromDeck(req.body.cardValue,req.body.cardSuit);
  res.redirect("/game");
});

//when the game is ready to start we post /game
app.get("/game", function(req, res) {
  if (req.isAuthenticated()) {
    //req.user now represents our Authenticated user
    res.render("game", {
      title: "",
      board:board,
      startingHand: req.user.startingHand,
      currentUser: req.user
    });
  } else {
    res.redirect("/");
  }
});
//when the game is ready to start we post /game
app.post("/game", function(req, res) {
  if (req.isAuthenticated()) {
    //req.user now represents our Authenticated user
    res.render("game", {
      title: "",
      board:board,
      startingHand: req.user.startingHand,
      currentUser: req.user
    });
  }
});
//post /logout to kill our session and logout user
app.post("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});
//our register route
app.get("/register", function(req, res) {
  if (req.isAuthenticated()) {
    // usersInGame++;
    res.redirect("/");
  } else {
    res.render("register");
  }
});
//our POST from register form
app.post("/register", function(req, res) {
  //find how many players are registered
  // User.countDocuments(function(err, count) {
  //   console.log('there are %d users', count);
  //   usersInGame = count;
  // });
  //the .register is a method from passportLocalMongoose
  //which adds a new user to our DB
  User.register({
    username: req.body.username,
    currentTurn: false
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      players.push(user);
      //we authenticate the user and render the game page
      passport.authenticate("local")(req, res, function() {
        return res.redirect("/");
      });
    }
  });
});
//our GET request for all the cards in the DB
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
//needed from Passport
mongoose.set("useCreateIndex", true);
