//jshint esversion:6
const _ = require("lodash");

let users = [];
let cards = [];
let remainingCards = [];

//function to wipe the game
function resetGame(){
  users = [];
  cards = [];
  remainingCards = [];
}

//we create dummy users to check the count
function addUser(user){
  activeUsers=getAllUsers ();
  let newUser = user;
  if(activeUsers!==2){
    users.push(newUser);
  }
  console.log("A player is now in the game :");
  console.log(newUser);
}

//function to get how many users are in the game
function getAllUsers (){
  return users.length;
}

//remaining cards left to deal for the current game session
function setRemainingCards(cards){
  remainingCards = cards;
}
//getting the remaining cards left to deal for the current game session
function getRemainingCards(){
  return remainingCards;
}

//we get the initial card copy of our db
function setCards(cardsDB){
  cards=cardsDB;
}



module.exports = {
  addUser,
  getAllUsers,
  resetGame,
  setRemainingCards,
  getRemainingCards
};
