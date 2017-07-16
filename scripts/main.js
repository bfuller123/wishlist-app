// TODO: make so items can't be added without name
// TODO: items will be separated between ready to buy and not ready
// TODO: add to userdatabase -- wishlist, purchasedItems, deletedItems, amountsaved, amountspent
// TODO: when item is deleted, add price to amountsaved, and add to deletedItems
// TODO: when item is purchased, add price to amountspent, and add to purchasedItems

var auth = firebase.auth();
var currentUser;
var userWishlist;
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
    var dateAdded = moment().format('MM/DD/YY');
    var thirtyDaysFromDate = moment().add(30, 'days').calendar();
    database.child(currentUser).update({
      [uniqueItem]:{
        name: itemName,
        itemPrice: itemPrice,
        itemLink: itemLink,
        dateAdded: dateAdded,
        readyToBuy: thirtyDaysFromDate,
        itemID: uniqueItem
      }
    });
    authenticate.clearInputs();
  },
  addItemToTable: function(name, link, dateAdded, uniqueItem) {
    // TODO: adds the item to the table
    var newItem = $('<td class="item-name">');
    var newDate = $('<td class="item-date">');
    var newButtonsCell = $('<td class="item-buttons">');
    var newLink = $('<a>');
    var newRow = $('<tr>');
    newLink.text(name);
    newItem.append(newLink);
    newLink.attr('href', link);
    newLink.attr('target', '_blank');
    newDate.text(dateAdded);
    newItem.attr('data-item', uniqueItem);
    newButtonsCell.append('<button type="button" class="btn btn-sm blue-bkg view_button" data-item="'+uniqueItem+'"> View </button>');
    newButtonsCell.append('<button type="button" class="btn btn-sm yellow-bkg edit_button" data-item="'+uniqueItem+'"> Edit </button>');
    newButtonsCell.append('<button type="button" class="btn btn-sm red-bkg delete_button" data-item="'+uniqueItem+'"> Delete </button>');
    newRow.append(newItem);
    newRow.append(newDate);
    newRow.append(newButtonsCell);
    $('tbody').append(newRow);
  },
  deleteItem: function() {
    // TODO: Make it so you can delete item from wishlist
  },
  loadItems: function(user) {
    // TODO: load items of wishlist
    database.child(user).on('value', function(snapshot){
      userWishlist = snapshot.val();
      var itemsList = Object.keys(userWishlist);
      $('tbody').empty();
      for (var i = 0; i < itemsList.length; i++) {
        var itemName = itemsList[i];
        itemFunctions.addItemToTable(userWishlist[itemName].name, userWishlist[itemName].itemLink, userWishlist[itemName].dateAdded, userWishlist[itemName].itemID);
      }
    });
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
    itemFunctions.loadItems(currentUser);
  }
  else {
    $('.login-buttons').css('visibility', 'visible');
    $('.sign-out-button').css('visibility', 'hidden');
  }
});

// database.child(currentUser).on('value', function(snapshot) {
//   itemFunctions.loadItems(currentUser);
//   var listOfItems = Object.keys(userWishlist);
//   for(let i = 0; i < listOfItems; i++){
//     let item = userWishlist[listOfItems[i]];
//     itemFunctions.addItemToTable(item.name, item.link, item.dateAdded, item.itemID);
//   }
// })
