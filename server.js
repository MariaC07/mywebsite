var express = require('express')
var path = require('path')
var app = express()
var fs = require('fs')
// var readline = require('readline')
var bodyParser = require('body-parser')

// .txt file location
var txfilepath = './public/test.txt'

app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }))

// Define the port to run on
app.set('port', 3000)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))
// app.use(express.static(path.join(__dirname, 'public')))

//Create user
app.get('/', function(req, res) {
  res.render('index')
})

app.post('/', function(req, res) {
  var fname = req.body.firstName // Firstname
  var lname = req.body.lastName // lastname

  var fullname = fname + ',' + lname // Full Name

  // Write txt file
  var logger = fs.createWriteStream(txfilepath, {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })

  logger.write(fullname + '\n')
  console.log('Text File Updated!')
  res.render('success', {
    data: {
      backToListText: 'Go to Update Name',
      messageStart: 'User',
      userName: fname + ' ' + lname,
      messageEnd: 'has been created',
      backToFormText: 'Go back to Form'
    }
  })
})

app.get('/List', function(req, res) {
  var input = fs.createReadStream(txfilepath)
  //declare empty array that will be used to read users
  var data = []

  //readLines accepts 2 callback functions. First will be called each time after read from file and get array of users read from file.
  readLines(
    input,
    function(userArr) {
      //append new users to existing
      data = data.concat(userArr)
    },
    //this callback is called when read from file is complete, so we can render the list
    function() {
      res.render('List', { data: data })
    }
  )

  // console.log(data)
  // data = [{ Firstname: 'Jess', lastname: 'Fake', lineNumber: 2 }]
  // res.render('List', { data: data })
})

app.get('/Updateuser', function(req, res) {
  var ID = req.query.id
  var firstName, lastName
  get_line(txfilepath, ID - 1, function(err, line) {
    console.log('The line: ' + line)
    firstName = line.split(',')[0]
    lastName = line.split(',')[1]
  })

  res.render('Update', { ID: ID })
})

//Update user
// app.get('updatesuccess', function(req, res){
// res.render('updatesuccess', {firstname: req.query.first, lastname: req.query.last})
// })

app.post('/Updateuser', function(req, res) {
  var fname = req.body.firstName // Firstname
  var lname = req.body.lastName // lastname
  var fullname = fname + ',' + lname // Full Name
  // counting the line indexed 0
  var LineNumber = req.body.linenumber - 1

  fs.readFile(txfilepath, 'utf8', function(err, data) {
    if (err) {
      return err
    }
    var input = data.split('\n')
    input[LineNumber] = fullname
    input = input.join('\n')
    fs.writeFile(txfilepath, input, 'utf8', function(err) {
      if (err) return console.log(err)

      res.render('success', {
        data: {
          backToListText: 'Go back to list for more actions',
          messageStart: 'User',
          userName: fname + ' ' + lname,
          messageEnd: 'has been updated',
          backToFormText: 'Go back to Form'
        }
      })
    })
  })
})

// Delete User
app.get('/RemoveUser', function(req, res) {
  var ID = req.query.id

  fs.readFile(txfilepath, 'utf8', function(err, data) {
    if (err) {
      return console.log(err)
    }

    var input = data.split('\n')
    {
      //removes a particular index from error
      input.splice(ID - 1, 1)
    }

    input = input.join('\n')
    fs.writeFile(txfilepath, input, 'utf8', function(err) {
      if (err) return console.log(err)
      res.render('success', {
        data: {
          backToListText: 'Go back to list for more actions',
          messageStart: 'User has been Deleted',
          userName: '',
          messageEnd: '',
          backToFormText: 'Go back to Form'
        }
      })
    })
  })
})

function readLines(input, dataFunc, endFunc) {
  var remaining = ''
  //'on' comes from file system
  //reads the data from the line
  input.on('data', function(data) {
    remaining += data
    //its finding the last index of the new line
    var index = remaining.indexOf('\n')

    // an error of the line of the text file
    var recordarray = []
    //counter number dispalying the lines
    var lineNumber = 1
    while (index > -1) {
      var line = remaining.substring(0, index)
      var FullnameArray = line.split(',')
      var FullnameJson = {
        firstName: FullnameArray[0],
        lastName: FullnameArray[1],
        lineNumber: lineNumber
      }
      recordarray.push(FullnameJson)
      remaining = remaining.substring(index + 1)
      // func(line);
      index = remaining.indexOf('\n')
      lineNumber++
    }
    //call update function with new records
    dataFunc(recordarray)
  })

  // ends the action of sending html to the browser
  input.on('end', function() {
    endFunc()
  })
}

function func(data) {
  return 'Line: ' + data
}

// Read Nth line of file(any number of line)
function get_line(filename, line_no, callback) {
  var stream = fs.createReadStream(filename, {
    flags: 'r',
    encoding: 'utf-8',
    fd: null,
    mode: 0666, //file system permission
    bufferSize: 64 * 1024
  })

  var fileData = ''
  stream.on('data', function(data) {
    fileData += data

    var lines = fileData.split('\n')

    if (lines.length >= +line_no) {
      stream.destroy()
      callback(null, lines[+line_no])
    }
  })

  stream.on('error', function() {
    callback('Error', null)
  })

  stream.on('end', function() {
    callback('File end reached without finding line', null)
  })
}

app.listen(3000, function() {
  console.log('The server is running on port 3000')
})
