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
var fs = require('fs')

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var nameFileLocation = './public/test.txt'

app.post('/createUser', function(req, res) {
  //read the user and return the first and last name
  // store the first and the last name
  //inform the user that his data has been stored

  var fullUsername = getFullUsername(req.body)
  storeUserNameInFile(fullUsername, nameFileLocation, function() {
    res.send('User ' + fullUsername + ', has been created.')
  })
})

function getFullUsername(form) {
  var fullUsername = form.firstName + ' ' + form.lastName
  return fullUsername
}
function storeUserNameInFile(nameFileLocation, fullUsername, onSuccess) {
  fs.writeFile(nameFileLocation, fullUsername, { flag: 'w' }, function(err) {
    if (err) {
      throw err
    } else {
      onSuccess()
    }
  })
}

// app.get('/readUser', function(req, res) {
//   //check if there is a stored user
//   //inform the user if there isn't a stored user
//   //read the file and get the firstName and the lastName
//   // send the firstName and lastName to the user
//   userActions.readUser(function(fileContent) {
//     res.send(fileContent)
//   })
// })
//
// app.get('/updateUser', function(req, res) {
//   //check if there is a stored user
//
//   //inform the user if there isn't a stored user
//   //update the firstName and the lastName with the new info
//   // inform user that the user has been stored successfully
//   userActions.updateUser(function(fileContent) {
//     //to be filled in later on
//   })
// })
//
// app.delete('/deleteUser', function(req, res) {
//   //check if there is a stored user
//   //inform the user if there isn't a stored user
//   //delete the stored user
//   //inform user that the user has been successfully removed
//
//   // userActions.deleteuser(req.body.firstName, function() {
//   //   res.send('Hello ' + req.body.firstName + ', has been deleted')
//   })
// })
//
// function readUser(srcPath, callback) {
//   fs.readFile(srcPath, 'utf8', function(err, fileContent) {
//     if (err) throw err
//     callback(fileContent)
//   })
// }
//
// function updateUser() {}
//
// function deleteUser(deletePath, fileName, callback) {
//   fs.unlink(deletePath, fileName, function(err, fileContent) {
//     if (err) throw err
//     callback()
//   })
// }
//

app.use(express.static('public'))

app.listen(3000, function() {
  console.log('Listening on port 3000!')
})
