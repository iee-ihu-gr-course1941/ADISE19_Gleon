//jshint esversion:6

//socket initialisation
const socket = io();
//a boolean to check the game room
let full = false;
//bool to check if game is on
let gameIsOn = false;

//method to hide the alerts
function hideSuccessAlert() {
  $(".alert-primary").slideToggle(500);
}
//method to hide the alerts
function hideWarningAlert() {
  $(".alert-warning").slideToggle(500);
}
//method to hide the alerts
function hideErrorAlert() {
  $(".alert-danger").slideToggle(500);
}
//method to hide the alerts
function hideLogin() {
  $("#login-form").hide(500);
}

//checking always if room has 2 players
socket.on("checkRoom",function(users){
  if (users === 2) {
    $(".loadingLabel").text("Το παιχνίδι μπορεί να ξεκινήσει !");
    $("#startButton").removeAttr("disabled").removeClass("btn-sm").addClass("btn-lg");
    $("#loadingLabel").hide();
  }
});

socket.on("full",function(){
  full=true;
});
socket.on("empty",function(){
  full=false;

});

// when new game starts we hide the start button and spinner
socket.on("newGame", function() {
  // The game now starts for everyone
  $("#startButton").hide();
  $("#spin").hide();
});

//we relocate the second player to the game page
socket.on("refresh",function(){
  // alert("REFRESHED");
  location.replace("/game");

});


  //we relocate the second player to the game page
  socket.on("refresh2",function(){
    // alert("REFRESHED");
      location=location;

  });

// start game on click event
$("#startButton").on("click",function(e){
  socket.emit("startGame");
});

//we remove the board when a player has taken the cards
socket.on("clearBoard",function(){
  $(".row.cardsPlayedFrame").remove();
  location=location;
});

$("#removeHand").on("click",function(){
  $(".row.cardsPlayedFrame").remove();
});

// submit button on click event
$("#submitBtn").on("click", function(e) {
  window.scrollTo(0, 0);
  //we save the username value
  let username = $("#username").val();
  let password = $("#password").val();
  let room = $("#room").val();
  //the username must not be empty
  if (username == "" || password == "" || room == "") {
    $(".alert-warning").text("Το όνομα χρήστη/κωδικός δεν μπορούν να είναι κενά !");
    $(".alert-warning").slideToggle(500);
    setTimeout(hideWarningAlert, 2500);
    //we prevent the form from submiting
    e.preventDefault();

    //if the game is full then we will give a warning message
  } else if (full) {
    $(".alert-warning").text("Το δωμάτιο αυτή τη στιγμή είναι γεμάτο !");
    $(".alert-warning").slideToggle(500);
    setTimeout(hideWarningAlert, 2500);
    e.preventDefault();
    //everything went ok and you will now be redirected to loading page
  } else {
    $(".alert-primary").text("Επιτυχής σύνδεση ! Καλώς ήρθες " + username);
    setTimeout(hideLogin);
    $(".alert-primary").slideToggle(500);
    setTimeout(hideSuccessAlert, 2500);
  }
});
