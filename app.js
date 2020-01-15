//jshint esversion:6
//imports
require('dotenv').config();
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
  getAllUsers,
  resetGame,
  setRemainingCards,
  getRemainingCards
} = require('./users');
//our port to connect
const port = process.env.PORT || 3000;
//we start a new express app
let app = express();
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
app.use(express.static(__dirname + "/public"));

//a boolean to check if game is on
let gameOn;
//an array that represents the current gameBoard
let board = [];
//an array containing only the values of the cards played on board
let boardValues=[];
//a counter to check how many players are out of cards
let outOfCards=0;

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
//our connection to mongoDB on our kseriDB, if there is no DB with the current
//name it will be automatically created.

mongoose.connect("mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASS+"@cluster0-rsv4x.mongodb.net/test?retryWrites=true&w=majority/kseriDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(err) {
  console.log(err);
  console.log("Database connected");
});
//needed from Passport
mongoose.set("useCreateIndex", true);



const cardSchema = mongoose.Schema({
  suit: String, //(S)PADES , (H)EARTS , (D)IAMONDS , (C)LUBS
  value: String, //2 3 4 5 6 7 8 9 10 J Q K A
});
//we create our user's SCHEMA
const userSchema = mongoose.Schema({
  username: String,
  password: String,
  startingHand: [],
  cardsTaken: [],
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

  socket.on("startGame", function() {
    gameOn = true;
    initialCardDeal();
    turn();
    // socket.broadcast.emit("refresh");
    io.emit("refresh");
  });
  //if game has not started we always check if the room has filled
  if (!gameOn) {
    let tempUsers = getAllUsers();
    io.sockets.emit('checkRoom', tempUsers);
  }
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
    User.find(function(err, foundUsers) {
      // PLAYER 1 UPDATE
      firstPlayerRandomCards = _.sampleSize(foundItems, 6);
      remainingCards = _.difference(foundItems, firstPlayerRandomCards);
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
function removeCardFromDeck(user, value, suit) {
  //we remove the card played from the array
  User.updateOne({
    username: user
  }, {
    "$pull": {
      startingHand: {
        value: value,
        suit: suit
      }
    }
  }, {
    safe: true,
    multi: true
  }, function(err, card) {
    if (err) {
      console.log(err);
    }
  });


}

//function to swap turns
function turn() {
  User.find(function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      //they are equal only when the game begins when they are both FALSE
      if (foundUsers[0].currentTurn === foundUsers[1].currentTurn) {
        User.updateOne({
          username: foundUsers[0].username
        }, {
          //the oposite of what the other player is
          currentTurn: !foundUsers[1].currentTurn
        }, function(err, user) {
          if (err) {
            console.log(err);
          } else {
            console.log("TURNS WERE THE SAME, NOW THEY AINT");
          }
        });
        //IF PLAYER 1  HAS JUST PLAYED SO HIS CURRENT TURN IS TRUE AND WE NEED TO SWITCH IT
      } else if (foundUsers[0].currentTurn) {
        //we switch it off now and we tell the player his turn now is false.
        User.updateOne({
          username: foundUsers[0].username
        }, {
          currentTurn: false
        }, function(err, user) {
          if (err) {
            console.log(err);
          } else {
            console.log("PLAYER 1 TURN IS NOW FALSE");
          }
        });
        //NOW THAT WE HAVE SWITCHED PLAYER1 TURN TO FALSE, WE NEED TO SET TRUE FOR PLAYER2
        User.updateOne({
          //we search the second player by his username
          username: foundUsers[1].username
        }, {
          //we set his current turn to true
          currentTurn: true
        }, function(err, user) {
          if (err) {
            console.log(err);
          } else {
            console.log("PLAYER 2 TURN IS NOW TRUE");
          }
        });
        //IF PLAYER 2  HAS JUST PLAYED SO PLAYER1's CURRENT TURN IS FALSE
      } else if (!foundUsers[0].currentTurn) {
        //we search for the first player
        User.updateOne({
          //and we set his current turn to false
          username: foundUsers[0].username
        }, {
          currentTurn: true
        }, function(err, user) {
          if (err) {
            console.log(err);
          } else {
            console.log("PLAYER 1 TURN IS NOW TRUE");
          }
        });
          //NOW THAT WE HAVE SWITCHED PLAYER1 TURN TO TRUE, WE NEED TO SET FALSE FOR PLAYER2
        User.updateOne({
          username: foundUsers[1].username
        }, {
          currentTurn: false
        }, function(err, user) {
          if (err) {
            console.log(err);
          } else {
            console.log("PLAYER 2 TURN IS NOW FALSE");
          }
        });
      }
    }
  });
}

//function to check if the card played is the same as the last played
//basicly our main logic
function checkBoard(user, value, suit) {
  //we want to check if the last played card value, is equal to the last card's value on board
  if (boardValues[boardValues.length - 1] === value || value === "J" ) {
    //then if this is true we want to push the board to our players cards taken in our db.
    User.updateOne({
      username: user
    }, {
      "$push": {
        cardsTaken: board
      }
    }, function(err, user) {
      if (err) {
        console.log(err);
      }
    });
    //we reset our board and we emit to clear the board to all clients
    board = [];
    boardValues=[];
    io.emit("clearBoard");
  }else {
    //if the card is not the same as the last one, we add the card on the board
    let cardPlayed = value + suit;
    //we add the card player in our board to populate
    board.push(cardPlayed);
    boardValues.push(value);
  }
}

function checkCardsInHand(user){
  if (outOfCards>=2){
    dealCards();
  }
}

// HOME "/" HTTP requests
app.route("/")
  //GET to our home route
  .get(function(req, res) {
    let tempUsers = getAllUsers();
    //we let the client now the game is now full
    if (tempUsers >= 2) {
      io.emit("full");
    }
    res.render("index");
  })
  //POST from our home route (login)
  .post(function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let room = req.body.room;

    const newUser = new User({
      username: username,
      password: password,
      room: room,
    });
    let tempUsers = getAllUsers();

    if (tempUsers < 2) {
      passport.authenticate('local', function(err, user, info) {
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
          //if there is space in room add the user in the room
          addUser(req.user);
          //render our main game page since everything went ok
          return res.render("game", {
            gameOn: gameOn,
            startingHand: req.user.startingHand,
            board: board,
            currentUser: req.user
          });
        });
      })(req, res);
    } else {
      console.log("Game room is full");
      res.redirect("/");
    }
  });

//when a move is made
app.post("/update", function(req, res) {
  //we remove the card that the player played from his hand
  removeCardFromDeck(req.user.username, req.body.cardValue, req.body.cardSuit);
  //we check if the card played is the same as the last one played
  checkBoard(req.user.username, req.body.cardValue, req.body.cardSuit);
  //we switch turns
  turn();
  //check if players have still cards in hands
  if (req.user.startingHand.length==0){
    outOfCards++;
  }
  //if both players are out of cards
  if (outOfCards==2){
    dealCards();
  }
  //emit to clients to update screen
  io.emit("refresh2");
  //redirect
  res.redirect("/game");
});
//when the game is ready to start we post /game
app.get("/game", function(req, res) {
  if (req.isAuthenticated()) {

    //req.user now represents our Authenticated user
    res.render("game", {
      gameOn: gameOn,
      board: board,
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
      gameOn: gameOn,
      board: board,
      startingHand: req.user.startingHand,
      currentUser: req.user
    });
  }
});
//a GET route for the current game status
app.get("/status", function(req, res) {
  let currentTurnUser;
  let player1Cards;
  let player2Cards;
  User.find(function(err, foundUsers) {
    //since we know only the first two indexes are the players
    //otherwise we had to use a for loop "for (let i=0;i<foundUsers.length;i++)"
    if (foundUsers[0].currentTurn === true) {
      currentTurnUser = foundUsers[0].username;
    }
    if (foundUsers[1].currentTurn === true) {
      currentTurnUser = foundUsers[1].username;
    }
    player1Cards = foundUsers[0].startingHand.length;
    player2Cards = foundUsers[1].startingHand.length;
    res.render("status", {
      gameOn: gameOn,
      currentTurnUser: currentTurnUser,
      board: board,
      player1Cards: player1Cards,
      player2Cards: player2Cards
    });
  });
});
//a GET to wipe the current game fresh
app.get("/reset", function(req, res) {
  //game now is off
  gameOn = false;
  //reseting the users and the temp board arrays
  resetGame();
  //wiping the board
  board = [];

  //we wipe all the cards from players' hands
  User.updateMany({}, {
    "$set": {
      cardsTaken: []
    }
  }, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log(user + " boards have been wiped !");
    }
  });
  //we delete our starting hand
  User.updateMany({}, {
    "$set": {
      startingHand: []
    }
  }, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log(user + " boards have been wiped !");
    }
  });
  //all turns are now false
  User.updateMany({}, {
    "$set": {
      currentTurn: false
    }
  }, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log(user + " boards have been wiped !");
    }
  });
  io.emit("empty");
  req.logout();
  res.redirect("/");


});
//a GET request to get all users or a specific user
app.get("/users", function(req, res) {
  User.find(function(err, users) {
    res.render("results", {
      results: users
    });
  });
});
//a GET request to get a specific user
app.get("/users/:u", function(req, res) {
  User.find({
    username: req.params.u
  }, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      if (user.length === 0) {
        res.render("results", {
          results: user
        });
      } else {
        res.render("results", {
          results: user
        });
      }
    }
  });
});
//post /logout to kill our session and logout user
app.post("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});
//our register route
app.get("/register", function(req, res) {
  res.render("register");
});
//our POST from register form
app.post("/register", function(req, res) {
  User.register({
    username: req.body.username,
    currentTurn: false
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
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
  });
});

//server start to port 3000
server.listen(port, function(err) {
  console.log("Server started on port 3000");
});
