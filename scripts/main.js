// TODO: make so items can't be added without name
// TODO: when item is purchased, add price to amountspent, and add to purchasedItems

var auth = firebase.auth();
var viewingList = 'wishlist';
var database = firebase.database().ref();

var dummyUser = {
  uid: null,
  amountSaved: 100,
  amountSpent: 37,
  wishlist: {
    "echo":{
      name: 'Amazon Echo',
      dateAdded: '7/1/17',
      itemPrice: 0,
      itemLink: 'https://www.amazon.com/Amazon-Echo-Bluetooth-Speaker-with-Alexa-Black/dp/B00X4WHP5E/ref=sr_1_1?ie=UTF8&qid=1499742737&sr=8-1&keywords=alexa',
      readyToBuy: '8/1/17',
      unixReadyToBuy: 1501520400000,
      itemID: 'echo'
    }
  },
  deletedItems: Object.create(null),
  purchasedItems: Object.create(null),
  notReadyToBuyList: ["echo"],
  readyToBuyList: [],
  sortItems: function() {
    currentUser.notReadyToBuyList = [];
    currentUser.readyToBuyList = [];
    var wishlist = currentUser.wishlist
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

var currentUser = {
  uid: null,
  amountSaved: 0,
  amountSpent: 0,
  wishlist: {
    "echo":{
      name: 'Amazon Echo',
      dateAdded: '7/1/17',
      itemPrice: 0,
      itemLink: 'https://www.amazon.com/Amazon-Echo-Bluetooth-Speaker-with-Alexa-Black/dp/B00X4WHP5E/ref=sr_1_1?ie=UTF8&qid=1499742737&sr=8-1&keywords=alexa',
      readyToBuy: '8/1/17',
      unixReadyToBuy: 1501520400000,
      itemID: 'echo'
    }
  },
  deletedItems: Object.create(null),
  purchasedItems: Object.create(null),
  notReadyToBuyList: [],
  readyToBuyList: [],
  sortItems: function() {
    currentUser.notReadyToBuyList = [];
    currentUser.readyToBuyList = [];
    var wishlist = currentUser.wishlist
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
      currentUser = null;
      loadDummyInfo();
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
    ga('send', 'event', 'wishlist', 'add item');
    var itemName = $('#add-item-name').val().trim();
    var itemPrice = parseFloat($('#add-item-price').val().trim()) || 0;
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
    newButtonsCell.append('<button type="button" class="btn btn-sm blue-bkg view_button" data-toggle="modal" data-target="#view-modal" data-item="'+uniqueItem+'"> View </button>');
    newButtonsCell.append('<button type="button" class="btn btn-sm yellow-bkg edit_button" data-toggle="modal" data-target="#edit-modal" data-item="'+uniqueItem+'"> Edit </button>');
    newButtonsCell.append('<button type="button" class="btn btn-sm red-bkg delete_button" data-item="'+uniqueItem+'"> Delete </button>');
    newRow.append(newItem);
    newRow.append(newDate);
    newRow.append(newButtonsCell);
    $('tbody').append(newRow);
  },
  loadAmountSavedAndSpent: function(user) {
    database.child(user).child('amountSaved').on('value', function(snapshot){
      currentUser.amountSaved = snapshot.val();
      itemFunctions.updateSavedAndSpentOnSite();
    });
    database.child(user).child('amountSpent').on('value', function(snapshot){
      currentUser.amountSpent = snapshot.val();
      itemFunctions.updateSavedAndSpentOnSite();
    });
  },
  loadItems: function(user) {
    database.child(user).child('wishlist').on('value', function(snapshot){
      currentUser.wishlist = snapshot.val();
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
      itemFunctions.addItemToTable(currentUser.wishlist[itemName].name, currentUser.wishlist[itemName].itemLink, currentUser.wishlist[itemName].dateAdded, currentUser.wishlist[itemName].itemID);
    }
  },
  loadReadyToBuy: function() {
    viewingList = 'buylist';
    $('tbody').empty();
    $('thead').removeClass('green-bkg');
    $('thead').addClass('gray-bkg');
    for (var i = 0; i < currentUser.readyToBuyList.length; i++) {
      var itemName = currentUser.readyToBuyList[i];
      itemFunctions.addItemToTable(currentUser.wishlist[itemName].name, currentUser.wishlist[itemName].itemLink, currentUser.wishlist[itemName].dateAdded, currentUser.wishlist[itemName].itemID);
    }
  },
  viewItem: function() {
    var itemName = $(this).attr('data-item');
    var item = currentUser.wishlist[itemName];
    $('#viewModalLabel').text(item.name);
    $('#viewModalDateAdded').text(item.dateAdded);
    $('#viewModalReadyToBuyDate').text(item.readyToBuy);
    $('#viewModalPrice').text(item.itemPrice);
    $('#viewModalPreview').attr('src', item.itemLink);
  },
  editItem: function() {
    var itemName = $(this).attr('data-item');
    var item = currentUser.wishlist[itemName];
    $('#editModalLabel').text(item.name);
    $('#editModalName').val(item.name);
    $('#editModalPrice').val(item.itemPrice);
    $('#editModalPrice').attr('data-item', itemName);
    $('#editModalLink').val(item.itemLink);
  },
  deleteItem: function() {
    ga('send', 'event', 'wishlist', 'delete item');
    var itemName = $(this).attr('data-item');
    var itemToMove = currentUser.wishlist[itemName];
    currentUser.deletedItems[itemName] = itemToMove;
    delete currentUser.wishlist[itemName];
    itemFunctions.addPrice(itemToMove.itemPrice, 'amountSaved');
    itemFunctions.updateList('wishlist');
    itemFunctions.updateList('deletedItems');
  },
  addPrice: function(price, listToAddTo) {
    currentUser[listToAddTo] = parseFloat(currentUser[listToAddTo]) + parseFloat(price);
    database.child(currentUser.uid).update({
      [listToAddTo]: currentUser[listToAddTo]
    });
    itemFunctions.updateSavedAndSpentOnSite();
  },
  updateList: function(listToUpdate) {
    database.child(currentUser.uid).update({
      [listToUpdate]: currentUser[listToUpdate]
    });
  },
  updateSavedAndSpentOnSite: function() {
    $('#amountSaved').text(currentUser.amountSaved);
    $('#amountSpent').text(currentUser.amountSpent);
  },
  updateItem: function() {
    var itemName = $('#editModalPrice').attr('data-item');
    var item = currentUser.wishlist[itemName];
    item.name = $('#editModalName').val();
    item.itemPrice = $('#editModalPrice').val();
    item.itemLink = $('#editModalLink').val();
    itemFunctions.updateList('wishlist');
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

function loadDummyInfo() {
  currentUser = dummyUser;
  console.log(currentUser);
  itemFunctions.loadWishlist();
  itemFunctions.updateSavedAndSpentOnSite();
}

$('#modal-sign-up').on('click', authenticate.passwordsMatch);
$('#modal-sign-in').on('click', authenticate.signIn);
$('.sign-out-button').on('click', authenticate.signOut);
$('#add-button').on('click', itemFunctions.addItem);
$('.wishlist-button').on('click', itemFunctions.loadWishlist);
$('.buy-button').on('click', itemFunctions.loadReadyToBuy);
$('tbody').on('click', '.view_button', itemFunctions.viewItem);
$('tbody').on('click', '.edit_button', itemFunctions.editItem);
$('tbody').on('click', '.delete_button', itemFunctions.deleteItem);
$('#editModalUpdateButton').on('click', itemFunctions.updateItem);


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUser.uid = user.uid;
    $('tbody').empty();
    $('.login-buttons').css('visibility', 'hidden');
    $('.sign-out-button').css('visibility', 'visible');
    itemFunctions.loadItems(currentUser.uid);
    itemFunctions.loadAmountSavedAndSpent(currentUser.uid);
  }
  else {
    $('.login-buttons').css('visibility', 'visible');
    $('.sign-out-button').css('visibility', 'hidden');
  }
});
