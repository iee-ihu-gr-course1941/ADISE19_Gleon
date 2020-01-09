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
const { addUser, removeUser, getUser, getUsersInRoom, getUsers } = require('./users');
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
  pName: String,
  password: String,
  startingHand: [cardSchema],
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
  //when a user connects
  // console.log("A user has connected");
  //incrementing users by 1
  // users++;
  // console.log("current users are " + users);
  //when a user disconnets
  // socket.on('disconnect', function() {
  //   //decrement user upon leaving
  //   users--;
  //   console.log('A user disconnected');
  // });

  socket.on("join" ,function(user,fn){
    console.log(user);
    socket.join(user.room);
    addUser(socket.id,user.username,user.room);
    console.log("Users currently in the room "+user.room);
    console.log(getUsersInRoom(user.room));
    fn(getUsersInRoom(user.room));


  });


  //on startGame handler which is sent from client when game is ready to start
  socket.on("startGame", function() {
    console.log("game has started");
    const user = getUser(socket.id);
    if (user){
      io.to(user.room).emit("newGame");
    }
    // let remainingCards = [];
    // Card.find(function(err, foundItems) {
    //   //with lodash we can get random 6 items from our cards db. Which is
    //   //eventually our starting hand.
    //   //We initialise the first player's hand
    //   players[0].startingHand = _.sampleSize(foundItems, 6);
    //   //we remove the cards from the rest deck
    //   remainingCards = _.difference(foundItems, players[0].startingHand);
    //   //doing the same for the second player
    //   players[1].startingHand = _.sampleSize(remainingCards, 6);
    //   remainingCards = _.difference(remainingCards, players[0].startingHand);
    //   //if the game is not ON emit the start
    //   if (!gameOn) {
    //     io.sockets.emit("gameOn", {
    //       players,
    //       remainingCards
    //     });
    //   }
    //   //game is now on
    //   gameOn = true;
    // });
  });
});

// "/" HTTP requests
app.route("/")
  //GET to our home route
  .get(function(req, res) {

    //find how many players are registered
    // User.countDocuments(function(err, count) {
    //   console.log('there are %d users in our db', count);
    //   usersInGame = count;
    // });

    res.render("index");
  })
  //POST from our home route (login)
  .post(function(req, res) {
    const newUser = new User({
      username: req.body.username,
      password: req.body.password
    });
    passport.authenticate('local', function(err, user, info) {
      // console.log("This is the info for the user : ");
      // console.log(user);
      players.push(user);
      if (!user) {
        return res.redirect('/');
      }
      //since we found the user we now check if they typed their correct credentials
      req.login(newUser, function(err) {
        if (err) {
          console.log(err);
        }
        //increment users
        // usersInGame++;
        //render our main game page since everything went ok
        return res.render("game", {
          title: "Παρακαλώ περιμένετε τον 2ο παίκτη",
          startingHand: []
        });
      });
    })(req, res);
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
//our post from register form
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
        // usersInGame++;
        var title = "asdasd";
        return res.redirect("/");
      });
    }
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

//when the game is ready to start we post /game
app.post("/game", function(req, res) {
  if (req.isAuthenticated()) {
    //req.user now represents our Authenticated user
    console.log(req.user);
    res.render("game", {
      title: " Ξερη 2020",
      startingHand: req.user.startingHand
    });
  }
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
