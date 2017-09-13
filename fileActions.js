var fs = require('fs') // fs is a library(part of node)

function readData(srcPath, callback) {
  fs.readFile(srcPath, 'utf8', function(err, fileContent) {
    if (err) throw err
    callback(fileContent)
  })
}

function writeData(savePath, text, callback) {
  fs.writeFile(savePath, text, { flag: 'w' }, function(err) {
    if (err) {
      throw err
    } else {
      callback()
    }
  })
}

function deleteData(deletePath, text, callback) {
  fs.deleteFile(deletePath, text, function(err, fileContent) {
    if (err) throw err
    callback(fileContent)
  })
}

module.exports = {
  readData: readData,
  writeData: writeData,
  deleteData: deleteData
}
