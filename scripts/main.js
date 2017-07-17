// TODO: make so items can't be added without name
// TODO: add to userdatabase -- purchasedItems, deletedItems
// TODO: when item is deleted, add price to amountsaved, and add to deletedItems
// TODO: when item is purchased, add price to amountspent, and add to purchasedItems

var auth = firebase.auth();
var viewingList = 'wishlist';
var database = firebase.database().ref();

var currentUser = {
  uid: null,
  fullWishlist: null,
  notReadyToBuyList: [],
  readyToBuyList: [],
  sortItems: function() {
    currentUser.notReadyToBuyList = [];
    currentUser.readyToBuyList = [];
    var wishlist = currentUser.fullWishlist
    var date = Date.now();
    var wishlistItems = Object.keys(wishlist);
    for (var i = 0; i < wishlistItems.length; i++) {
      var currentItem = wishlistItems[i];
      if (date > wishlist[currentItem].unixReadyToBuy) {
        currentUser.readyToBuyList.push(wishlist[currentItem].itemID);
      }
      else {
        currentUser.notReadyToBuyList.push(wishlist[currentItem].itemID);
      }
    }
  }
}

var authenticate = {
  signUp: function(email, password) {
    auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      $('#sign-up-modal-error').text(errorMessage);
    });
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        createNewUser(user.uid);
        authenticate.clearInputs();
        $('#sign-up-modal').modal('hide');
        document.getElementById('wishlist-table').scrollIntoView();
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
        $('#sign-in-modal').modal('hide');
        document.getElementById('wishlist-table').scrollIntoView();
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
    var date = Date.now();
    var thirtyDaysMilliseconds = 2592000000;
    var uniqueItem = itemName + date
    var dateAdded = moment().format('MM/DD/YY');
    var thirtyDaysFromDate = moment().add(30, 'days').calendar();
    database.child(currentUser.uid).child('wishlist').update({
      [uniqueItem]:{
        name: itemName,
        itemPrice: itemPrice,
        itemLink: itemLink,
        dateAdded: dateAdded,
        readyToBuy: thirtyDaysFromDate,
        unixReadyToBuy: date+thirtyDaysMilliseconds,
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
    database.child(user).child('wishlist').on('value', function(snapshot){
      currentUser.fullWishlist = snapshot.val();
      currentUser.sortItems();

      if (viewingList == 'wishlist') {
        itemFunctions.loadWishlist();
      }
      else {
        itemFunctions.loadReadyToBuy();
      }
    });
  },
  loadWishlist: function() {
    viewingList = 'wishlist';
    $('tbody').empty();
    $('thead').removeClass('gray-bkg');
    $('thead').addClass('green-bkg');
    for (var i = 0; i < currentUser.notReadyToBuyList.length; i++) {
      var itemName = currentUser.notReadyToBuyList[i];
      itemFunctions.addItemToTable(currentUser.fullWishlist[itemName].name, currentUser.fullWishlist[itemName].itemLink, currentUser.fullWishlist[itemName].dateAdded, currentUser.fullWishlist[itemName].itemID);
    }
  },
  loadReadyToBuy: function() {
    viewingList = 'buylist';
    $('tbody').empty();
    $('thead').removeClass('green-bkg');
    $('thead').addClass('gray-bkg');
    for (var i = 0; i < currentUser.readyToBuyList.length; i++) {
      var itemName = currentUser.readyToBuyList[i];
      itemFunctions.addItemToTable(currentUser.fullWishlist[itemName].name, currentUser.fullWishlist[itemName].itemLink, currentUser.fullWishlist[itemName].dateAdded, currentUser.fullWishlist[itemName].itemID);
    }
  },
  viewItem: function() {
    // TODO: views the items date it was added, when it is ready to buy
  },
  editItem: function() {
    // TODO: so you can update price or link
  }
}

function createNewUser(user) {
  console.log('creating user in database');
  database.child(user).set({
      wishlist: {
        'Robot001':{
          name: 'Robot',
          itemPrice: 0,
          itemLink: '',
          dateAdded: '01/01/01',
          readyToBuy: '01/01/20',
          unixReadyToBuy: 1577858460000,
          itemID: 'Robot001'
        }
      },
      amountSpent: 0,
      amountSaved: 0
  })
}

$('#modal-sign-up').on('click', authenticate.passwordsMatch);
$('#modal-sign-in').on('click', authenticate.signIn);
$('.sign-out-button').on('click', authenticate.signOut);
$('#add-button').on('click', itemFunctions.addItem);
$('.wishlist-button').on('click', itemFunctions.loadWishlist);
$('.buy-button').on('click', itemFunctions.loadReadyToBuy);


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUser.uid = user.uid;
    $('.login-buttons').css('visibility', 'hidden');
    $('.sign-out-button').css('visibility', 'visible');
    itemFunctions.loadItems(currentUser.uid);
  }
  else {
    $('.login-buttons').css('visibility', 'visible');
    $('.sign-out-button').css('visibility', 'hidden');
  }
});
