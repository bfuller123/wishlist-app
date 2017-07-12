var auth = firebase.auth();
var currentUser;
var database = firebase.database().ref();

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

var itemFunctions = {
  addItem: function() {
    var itemName = $('#add-item-name').val().trim();
    var itemPrice = $('#add-item-price').val().trim();
    var itemLink = $('#add-item-link').val().trim();
    var d = new Date();
    var date = d.getTime();
    var uniqueItem = itemName + date
    var dateAdded = moment().format('MM/DD/YYYY');
    var thirtyDaysFromDate = moment().add(30, 'days').calendar();
    database.child(currentUser).update({
      [uniqueItem]:{
        name: itemName,
        itemPrice: itemPrice,
        itemLink: itemLink,
        dateAdded: dateAdded,
        readyToBuy: thirtyDaysFromDate
      }
    });
    authenticate.clearInputs();
  },
  addItemToTable: function(name, link, dateAdded) {
    // TODO: adds the item to the table
  },
  deleteItem: function() {
    // TODO: Make it so you can delete item from wishlist
  },
  loadItems: function() {
    // TODO: load items of wishlist
  },
  viewItem: function() {
    // TODO: views the items date it was added, when it is ready to buy
  },
  editItem: function() {
    // TODO: so you can update price or link
  }
}

$('#modal-sign-up').on('click', authenticate.passwordsMatch);
$('#modal-sign-in').on('click', authenticate.signIn);
$('.sign-out-button').on('click', authenticate.signOut);
$('#add-button').on('click', itemFunctions.addItem);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user.uid;
    $('.login-buttons').css('visibility', 'hidden');
    $('.sign-out-button').css('visibility', 'visible');
  }
  else {
    $('.login-buttons').css('visibility', 'visible');
    $('.sign-out-button').css('visibility', 'hidden');
  }
});
