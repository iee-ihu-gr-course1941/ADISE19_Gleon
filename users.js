//jshint esversion:6

const users = [];
const boards = [];

function addUser(id, name, room) {
  var usersInRoom = getUsersInRoom(room);
  const user = {
    id,
    name,
    room
  };
  if (usersInRoom.length !== 2) {
    users.push(user);
  } else {
    return {
      error: 'No space in the room.'
    };
  }
  return {
    user
  };
}

function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
}

function getUser(id) {
  const user = users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  const usersInRoom = users.filter((user) => user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
