//jshint esversion:6

//socket initialisation
const socket = io();
//a boolean to check the game room
var full = false;
//player object
var thePlayer;
//user's username in the db
var playerUsername;


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

// //Always updated to check how many players are currently playing
// socket.on("usersInGame", function(userInGame) {
//   if (userInGame >= 2) {
//     full = true;
//     socket.emit("startGame");
//   }
// });



socket.on("test", function() {
  alert("TEST IS TRIGGERED");
});

socket.on("authenticatedJoin", function(user) {
  let room = user.room;
  alert("The user has now authenticated and joined the room");
  alert(room);
  socket.join(room);
});

  //we check if the room is full
  socket.emit('checkRoom',function(room) {
    console.log("This is people in the room");
    console.log(room);
    if (room===2){
      $(".loadingLabel").text("Το παιχνίδι μπορεί να ξεκινήσει !");
      $("#startButton").removeAttr("disabled");
    }
  });




socket.on("newGame", function() {
  // THE GAME STARTS BUT THE COUNTER OF USERS IS 1 STEP BEHIND
  alert("new game has started");
});

//here starts the game
socket.on("gameOn", function(information) {
  console.log(information.players[0].startingHand);
  $("#title").text("Το παιχνίδι είναι έτοιμο να ξεκινήσει");
  $("#startGameForm").submit();
  // for (var j=0;j<6;j++){
  //   if (information.players[0].username==playerUsername){
  //     //automatically render the starting hand
  //     $("#card"+j).append("<img src=\"images/"+information.players[0].startingHand[j].value+""+information.players[0].startingHand[j].suit+".png\" class=\"card-img-top\">");
  //   }else {
  //     //automatically render the starting hand
  //     $("#card"+j).append("<img src=\"images/"+information.players[1].startingHand[j].value+""+information.players[1].startingHand[j].suit+".png\" class=\"card-img-top\">");
  //   }
  // }
});


//making cards draggable
$(".playingCard").draggable({
  revert: "invalid"
});
//making the table droppable
$("#tablePicture").droppable({
  accept: ".playingCard",
  //drop function to get info about what card was dropped and who dropped it
  drop: function(event, ui) {
    console.log(event);
    console.log(ui);
    //disable dragging after card being dropped
    $(ui.draggable).draggable('disable');
    //parent card ID
    var droppedItemId = ui.draggable.attr("id");

    console.log(droppedItemId);
    //automatically center dropped card
    ui.draggable.position({
      my: "center",
      at: "center",
      of: $(this),
      using: function(pos) {
        $(this).animate(pos, "slow", "linear");
      }
    });
  }
});


// submit button on click event
$("#submitBtn").on("click", function(e) {
  window.scrollTo(0, 0);
  //we save the username value
  var username = $("#username").val();
  var password = $("#password").val();
  var room = $("#room").val();
  //the username must not be empty
  if (username == "" || password == "" || room == "") {
    $(".alert-warning").text("Το όνομα χρήστη/κωδικός/δωμάτιο δεν μπορούν να είναι κενά !");
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
