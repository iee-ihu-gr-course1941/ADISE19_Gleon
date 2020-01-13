//jshint esversion:6
const _ = require("lodash");

var users = [];
var cards = [];
var remainingCards = [];

function resetGame(){
  users = [];
}

function addUser(user){
  activeUsers=getAllUsers ();
  let newUser = user;
  if(activeUsers!==2){
    users.push(newUser);
  }
  console.log("A player is now in the game :");
  console.log(newUser);
}

function getAllUsers (){
  return users.length;
}

function setRemainingCards(cards){
  remainingCards = cards;
}
function getRemainingCards(){
  return remainingCards;
}

function setCards(cardsDB){
  cards=cardsDB;
}

function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
}

function getUser(id) {
  const user = users.find((user) => user.id === id);
}

function getRoom(id){
  tempUser = _.find(users,{id:id});
  return tempUser;

}

function getUsers(room) {
  //using lodash to find an array of users that are in room
  return _.filter(users,{room:room});
}
module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsers,
  getAllUsers,
  getRoom,
  resetGame,
  setRemainingCards,
  getRemainingCards
};
