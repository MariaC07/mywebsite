// var express = require('express')
// var app = express()
//
// app.use(express.static('public'))
//
// app.get('/', function(req, res) {
//   res.sendFile('Hello world!')
//   // console.log('REQUEST-------------------------------------\n')
//   // console.log(req)
//   // console.log('RESPONSE-------------------------------------\n')
//   // console.log(res)
//   //res.render('api/page.html')
// })
//
// app.listen(3000, function() {
//   console.log('Listening on port 3000')
// })
var express = require('express')
var app = express()

var fileActions = require('./fileActions')

var nameFileLocation = './public/test.txt'

app.get('/read', function(req, res) {
  fileActions.readData(nameFileLocation, function(fileContent) {
    res.send(fileContent)
  })
})

app.post('/formHandler', function(req, res) {
  fileActions.writeData(nameFileLocation, req.body.firstName, function() {
    res.send('Hello ' + req.body.firstName + ', your name has been stored.')
  })
})

app.use(express.static('public'))

app.listen(3000, function() {
  console.log('Listening on port 3000!')
})
