//jshint esversion:6
const _ = require("lodash");

var users = [];
var cards = [];
var usersinroom= [];

function addUser(id,name,room){
  console.log(room);

  usersInThisRoom=getUsersInRoom(room);
  const user = { id, name, room };
  if(usersInThisRoom!==2){
    users.push(user);
  }
  console.log("this is the users array");
  console.log(users);
}


// const addUser = ({ id, name, room }) => {
//   name = name.trim().toLowerCase();
//   room = room.trim().toLowerCase();
//
//   if(!name || !room) return { error: 'Username and room are required.' };
//   let usersinroom=getUsersInRoom(room);
//   const user = { id, name, room };
//   if(usersinroom.length!==2){
//     users.push(user.name);
//   }else{
//     return { error: 'Room is full.' };
//   }
//   return { user };
// };

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

function getAllUsers (){
  return users;
}

function getUsersInRoom(room) {
  //using lodash to find an array of users that are in room
  return _.filter(users,{room:room}).length;
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getUsers,
  getAllUsers,
  getRoom
};
