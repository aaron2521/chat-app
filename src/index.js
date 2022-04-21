const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUsers, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => {
  console.log('New Websocket connection')

  socket.on('join', ({ username, room }, callback) => {
    const {error, user} = addUser({id: socket.id, username,room})
    
    if(error){
      return callback(error)
    }
    socket.join(user.room)

    socket.emit('message', generateMessage('Admin','Welcome'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))

    callback()

    io.to(user.room).emit('roomData',{
      room: user.room,
      users: getUsersInRoom(user.room)
    })
  })

  // socket.emit('countUpdated', count)

  // socket.on('increment', () => {
  //     count ++
  //     io.emit('countUpdated', count)
  // })

  socket.on('sendMessage', (mes, callback) => {
    const user = getUsers(socket.id)
    const filter = new Filter()
    if (filter.isProfane(mes)) {
      return callback('profane is not allowed')
    }
    io.to(user.room).emit('message', generateMessage(user.username,mes))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUsers(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocation(
        user.username,`https://www.google.com/maps/?q=${coords.latitude},${coords.longitude}`
      )
    )
    callback('Location Shared')
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has diconnected`))
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log('server is up on port ' + port)
})
