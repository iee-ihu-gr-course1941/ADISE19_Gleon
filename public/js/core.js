function hideSuccessAlert() {
  $(".alert-primary").slideToggle(500);
}

function hideWarningAlert() {
  $(".alert-warning").slideToggle(500);
}

function hideErrorAlert() {
  $(".alert-danger").slideToggle(500);
}

function hideLogin() {
  $("#login-form").hide(500);
}

$("#submitBtn").on("click", function(e) {

  var username = $("#username").val();
  if (username == "") {
    $(".alert-warning").text("Το όνομα χρήστη δε μπορεί να είναι κενό !");
    $(".alert-warning").slideToggle(500);
    setTimeout(hideWarningAlert, 2500);
    e.preventDefault();
    //$(".alert-warning").text("");
  } else if (username == "esentis") {
    $(".alert-primary").text("Επιτυχής σύνδεση ! Καλώς ήρθες " + username);
    setTimeout(hideLogin);
    $(".alert-primary").slideToggle(500);
    setTimeout(hideSuccessAlert, 2500);
  } else {
    $(".alert-danger").text("Το όνομα χρήστη δεν βρέθηκε !");
    $(".alert-danger").slideToggle(500);
    setTimeout(hideErrorAlert, 2500);
    e.preventDefault();
  }
});
