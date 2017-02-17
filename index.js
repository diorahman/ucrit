var moment = require('moment')
var hash = require('hash-sum')

exports.keyVals = function (data) {
  var keys = Object.keys(data)
  var vals = []
  for (var i = 0; i < keys.length; i++) {
    var val = data[keys[i]]
    if (val === undefined || val === null) {
      val = 'NULL'
    } else if (typeof val === 'string') {
      val = `'${val}'`
    } else if (val instanceof Date) {
      val = `'${moment.utc(val.valueOf()).format()}'`
    } else if (typeof val === 'object') {
      val = `'${JSON.stringify(val)}'`
    }
    vals.push(val)
  }
  return {keys, vals}
}

exports.sql = function (statement) {
  var args = [].slice.call(arguments, 1)
  var sql = ''
  var count = 1
  var values = []
  for (var i = 0; i < statement.length; i++) {
    if (statement[i].indexOf('__ARG_') >= 0) {
      sql += statement[i].replace('__ARG_', `$${count}`)
      values.push(args[i])
      count++
    } else if (statement[i].indexOf('__SET_') >= 0) {
      var set = []
      for (var k = 0; k < args[i].keys.length; k++) {
        set.push(`${args[i].keys[k]}=$${count}`)
        values.push(args[i].vals[k])
        count++
      }
      sql += statement[i].replace('__SET_', set.join(', '))
    } else if (statement[i].indexOf('__COL_') >= 0) {
      var col = []
      for (var l = 0; l < args[i].keys.length; l++) {
        col.push(`${args[i].keys[l]}`)
      }
      sql += statement[i].replace('__COL_', `(${col.join(', ')})`)
    } else if (statement[i].indexOf('__VAL_') >= 0) {
      var val = []
      for (var m = 0; m < args[i].keys.length; m++) {
        val.push(`$${count}`)
        count++
      }
      values = values.concat(args[i].vals)
      sql += statement[i].replace('__VAL_', `(${val.join(', ')})`)
    } else {
      sql += statement[i]
    }
  }

  return {
    text: sql,
    values,
    name: hash(sql)
  }
}
