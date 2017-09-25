var express = require('express')
var path = require('path')
var app = express()
var fs = require('fs')
var ejs = require('ejs')

var bodyParser = require('body-parser')

// Define the port to run on
app.set('port', 3000)

// .txt file location
var txfilepath = './Public/test.txt'

app.use(express.static(path.join(__dirname, 'public')))

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port
  console.log('Server is running on port ' + port)
})

//Create user
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/', function(req, res) {
  var fname = req.body.firstName // Firstname
  var lname = req.body.lastName // lastname

  var fullname = fname + ',' + lname // Full Name
  res.send(
    '<a href= "/List">Go to Update Name</a> <br/> User  <b> ' +
      fname +
      ' ' +
      lname +
      ' </b> has been created' +
      '<br> <a href= "/">Go back to Form</a>'
  ) // return html with return URL

  // Write txt file
  var logger = fs.createWriteStream(txfilepath, {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })

  logger.write(fullname + '\n')
  console.log('Text File Updated!')
})
app.get('/List', function(req, res) {
  var input = fs.createReadStream(txfilepath)
  var tbl = readLines(input, res)
})

app.get('/Updateuser', function(req, res) {
  var ID = req.query.id
  var firstName, lastName
  get_line(txfilepath, ID - 1, function(err, line) {
    console.log('The line: ' + line)
    firstName = line.split(',')[0]
    lastName = line.split(',')[1]
  })

  fs.readFile(path.join(__dirname, '/public/Update.html'), 'utf-8', function(
    err,
    content
  ) {
    if (err) {
      res.end('error occurred')
      return
    }
    var renderedHtml = ejs.render(content, {
      firstName: firstName,
      lastName: lastName,
      ID: ID
    }) //get rendered HTML code
    res.end(renderedHtml)
  })
})

//Update user
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
    //this to be explained
    input[LineNumber] = fullname
    input = input.join('\n')
    fs.writeFile(txfilepath, input, 'utf8', function(err) {
      if (err) return console.log(err)
      res.send(
        '<a href= "/List">Go back to list for more actions</a> <br/> User <b>' +
          fname +
          ' ' +
          lname +
          ' </b> has been updated' +
          '<br> <a href= "/">Go back to Form</a>'
      ) // return html with return URL
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
      res.send(
        '<a href= "/List">Go back to List</a> <br/> User has been Deleted' +
          '<br> <a href= "/">Go back to Form</a>'
      ) // return html with return URL
    })
  })
})

function readLines(input, func) {
  var remaining = ''
  //'on' comes from file system
  //reads the data from the line
  input.on('data', function(data) {
    remaining += data
    //is gonna find the last index of the new line
    var index = remaining.indexOf('\n')

    //is an error of the line of the text file
    var reocordarray = []
    //is counter number dispalying the lines
    var lineNumber = 1
    while (index > -1) {
      var line = remaining.substring(0, index)
      var FullnameArray = line.split(',')
      var FullnameJson = {
        Firstname: FullnameArray[0],
        lastname: FullnameArray[1],
        lineNumber: lineNumber
      }
      reocordarray.push(FullnameJson)
      remaining = remaining.substring(index + 1)
      // func(line);
      index = remaining.indexOf('\n')
      lineNumber++
    }
    var tbl = createTable(reocordarray)
    console.log(reocordarray)
    func.send(tbl)
    //return tbl;
  })
  // ends the action of sending html to the browser
  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining)
    }
  })
}

function func(data) {
  return 'Line: ' + data
}

function createTable(data) {
  var tbl =
    '<a href="/"><button>Create User</button></a><br/><table><tbody><tr><th><u>Firstname</u></th><th><u>Lastname</u></th><th><u>Action</u></th><th><u>Update</u></th><th><u>Delete</u></th><tr>'
  console.log(data[0].Firstname)

  for (var i = 0; i < data.length; i++) {
    var tr = '<tr>'
    tr = tr + '<td>' + data[i].Firstname + '</td>'
    tr = tr + '<td>' + data[i].lastname + '</td>'
    tr = tr + '<td>' + data[i].lineNumber + '</td>'
    tr =
      tr +
      '<td><a href="/Updateuser?id=' +
      data[i].lineNumber +
      '"><button>Update</button></a></td>'
    tr =
      tr +
      '<td><a href="/RemoveUser?id=' +
      data[i].lineNumber +
      '"><button>Delete</button></a></td>'

    tr = tr + '</tr>'
    tbl = tbl + tr
  }
  return tbl
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
