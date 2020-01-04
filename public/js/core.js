//jshint esversion:6

//socket initialisation
var socket = io();
//a boolean to check the game room
var full = false;

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

//Always updated to check how many players are currently playing
socket.on("usersInGame", function(userInGame) {
  if (userInGame >= 2) {
    full = true;
  }
});
//making cards draggable
$(".playingCard").draggable({
  revert: "invalid"
});
//making the table droppable
$("#tablePicture").droppable({
  accept: ".playingCard",
  //drop function to get info about what card was dropped and who dropped it
  drop: function(event,ui){
    console.log(event);
    console.log(ui);
    console.log($(ui.draggable));
    //disable dragging after card being dropped
    $(ui.draggable).draggable('disable');

  }
});


// submit button on click event
$("#submitBtn").on("click", function(e) {

  //we save the username value
  var username = $("#username").val();
  //the username must not be space
  if (username == "") {
    $(".alert-warning").text("Το όνομα χρήστη δε μπορεί να είναι κενό !");
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
    //everything went ok and you will now be redirected to game page
  } else {
    $(".alert-primary").text("Επιτυχής σύνδεση ! Καλώς ήρθες " + username);
    setTimeout(hideLogin);
    $(".alert-primary").slideToggle(500);
    setTimeout(hideSuccessAlert, 2500);
  }
});
