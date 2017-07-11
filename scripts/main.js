var auth = firebase.auth();

var authenticate = {
  signUp: function(email, password) {
    auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      $('#sign-up-modal-error').text(errorMessage);
    });
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        authenticate.clearInputs();
      }
    })
  },
  signIn: function() {
    var email = $('#sign-in-modal-email').val().trim();
    var password = $('#sign-in-modal-password').val().trim();
    auth.signInWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      $('#sign-in-modal-error').text(errorMessage);
    });
    firebase.auth().onAuthStateChanged(function(user){
      if (user) {
        authenticate.clearInputs();
      }
    })
  },
  signOut: function() {
    auth.signOut().then(function() {
      console.log('Successful sign out');
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  },
  passwordsMatch: function() {
    var email = $('#sign-up-modal-email').val().trim();
    var password1 = $('#sign-up-modal-password').val().trim();
    var password2 = $('#sign-up-modal-password-2').val().trim();
    if (password1 === password2) {
      authenticate.signUp(email, password1);
    }
    else {
      $('#sign-up-modal-error').text("Passwords do not match!");
    }
  },
  clearInputs: function() {
    $('input').val("");
    $('#sign-up-modal-error').text("");
    $('#sign-in-modal-error').text("");
  }
}

$('#modal-sign-up').on('click', authenticate.passwordsMatch);
$('#modal-sign-in').on('click', authenticate.signIn);
$('.sign-out-button').on('click', authenticate.signOut);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    $('.login-buttons').css('visibility', 'hidden');
    $('.sign-out-button').css('visibility', 'visible');
  } else {
    $('.login-buttons').css('visibility', 'visible');
    $('.sign-out-button').css('visibility', 'hidden');
  }
});
