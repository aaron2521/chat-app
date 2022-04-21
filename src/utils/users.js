const users = []

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if (!username || !room) {
    return {
      error: 'Username an room is required',
    }
  }
  const existingUser = users.find((users) => {
    return users.room === room && users.username === username
  })

  if (existingUser) {
    return {
      error: 'Username in use',
    }
  }

  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUsers = (id) => {
  const user = users.find((user) => user.id === id)
  if (user) {
    return user
  }
}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  return users.filter((user) => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUsers,
  getUsersInRoom,
}
