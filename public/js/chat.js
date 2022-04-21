const socket = io()

// socket.on('message', (mes) => {
//     console.log(mes)
// })

const $messageForm = document.querySelector('#form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messages = document.querySelector('#messages')
const $locationMessages = document.querySelector('#locationMessages')
const $sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const autoscroll = () => {
  // const $newMessage = $messages.lastElementChild

  // const newMessageStyles = getComputedStyle($newMessage)
  // const newMessageMargin = parseInt(newMessageStyles)
  // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // const visibleHeight = $messages.offsetHeight

  // const containerHeight = $messages.scrollHeight

  // const scrollOffset = $messages.scrollTop + visibleHeight

  // if(containerHeight - newMessageHeight <= scrollOffset){
  //   $messages.scrollTop = $messages.scrollHeight
  // }
  $messages.scrollTop = $messages.scrollHeight

  // if ($messages.scrollTop + $messages.clientHeight === $messages.scrollHeight) {
  //   $messages.scrollTop = $messages.scrollHeight
  // }
}

socket.on('locationMessage', (url) => {
  console.log(url)
  const html = Mustache.render(locationTemplate, {
    name: url.name,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a'),
  })
  $locationMessages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('message', (mes) => {
  // console.log(mes)
  const html = Mustache.render(messageTemplate, {
    name: mes.name,
    mes: mes.text,
    createdAt: moment(mes.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  })
  $sidebar.innerHTML = html
})

// socket.on('countUpdated', (count) => {
//     console.log('the count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  $messageFormButton.setAttribute('disabled', 'disabled')

  const x = e.target.elements.message.value
  socket.emit('sendMessage', x, (error) => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if (error) {
      return console.log(error)
    }
    console.log('delivered')
  })
})

const $locationButton = document.querySelector('#send-location')

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }
  $locationButton.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (mes) => {
        console.log(mes)
        $locationButton.removeAttribute('disabled')
      }
    )
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
