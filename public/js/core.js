//jshint esversion:6

//socket initialisation
var socket = io();
//a boolean to check the game room
var full = false;
//player object
var thePlayer;

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
    socket.emit("startGame");
  }
});

//here we grap the players ID(color)
socket.on("sendBackPlayer",function(player){
 alert(player.pID);
});

//here starts the game
socket.on("gameOn",function(information){
  console.log("P1 id : "+information.players[0].pID);
  console.log("P2 id : "+information.players[1].pID);
  console.log("Your id : "+thePlayer);
  $("#title").text("Το παιχνίδι ξεκίνησε");
  $("#title").append("<p>Είσαι ο παίκτης με το χρώμα</p>"+thePlayer.pID);
  for (var i=0; i< 2 ;i++){
    if (information.players[i].pID==playerID){
      //automatically render the starting hand
      $("#card"+i).append("<img src=\"images/"+information.players[i].startingHand[i].value+""+information.players[i].startingHand[i].suit+".png\" class=\"card-img-top\">");
    }
  }
});


socket.on("test",function(players){
  alert(players[0].pID);
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
    //everything went ok and you will now be redirected to loading page
  } else {

    //we send to our server player's name
    socket.emit("sendPlayer",username);
    $(".alert-primary").text("Επιτυχής σύνδεση ! Καλώς ήρθες " + username);
    setTimeout(hideLogin);
    $(".alert-primary").slideToggle(500);
    setTimeout(hideSuccessAlert, 2500);
  }
});
