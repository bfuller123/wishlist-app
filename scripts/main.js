var auth = firebase.auth();

var authenticate = {
  signUp = function() {
    var email = $('#modal-email').val().trim();
    var password = $('#modal-password').val().trim();
    auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  },
  signIn = function() {
    var email = $('.modal-email').val().trim();
    var password = $('.modal-password').val().trim();
    auth.signInWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  },
  signOut = function() {
    auth.signOut().then(function() {
      console.log('Successful sign out');
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  }
}

$('#sign-in-button').on('click', );
