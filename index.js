var moment = require('moment')
var hash = require('hash-sum')

exports.keyVals = function (data) {
  var cols = Object.keys(data)
  var vals = []
  var keys = []
  for (var i = 0; i < cols.length; i++) {
    var val = data[cols[i]]
    if (val === undefined) {
      continue
    } else if (val === null) {
      val = null
    } else if (val instanceof Date) {
      val = moment.utc(val.valueOf()).format()
    } else if (typeof val === 'object') {
      val = JSON.stringify(val)
    }
    keys.push(cols[i])
    vals.push(val)
  }
  return {keys, vals}
}

exports.sql = function (statement) {
  var args = [].slice.call(arguments, 1)
  var sql = []
  var values = []
  var count = 1
  var parts = statement.filter(s => s.trim())
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].indexOf('__ARG_') >= 0) {
      sql.push(parts[i].replace('__ARG_', `$${count}`))
      values.push(args[i])
      count++
    } else if (parts[i].indexOf('__SET_') >= 0) {
      var set = []
      for (var k = 0; k < args[i].keys.length; k++) {
        set.push(`${args[i].keys[k]}=$${count}`)
        values.push(args[i].vals[k])
        count++
      }
      sql.push(parts[i].replace('__SET_', set.join(', ')))
    } else if (parts[i].indexOf('__COL_') >= 0) {
      var col = []
      for (var l = 0; l < args[i].keys.length; l++) {
        col.push(`${args[i].keys[l]}`)
      }
      sql.push(parts[i].replace('__COL_', `(${col.join(', ')})`))
    } else if (parts[i].indexOf('__VAL_') >= 0) {
      var val = []
      for (var m = 0; m < args[i].keys.length; m++) {
        val.push(`$${count}`)
        count++
      }
      values = values.concat(args[i].vals)
      sql.push(parts[i].replace('__VAL_', `(${val.join(', ')})`))
    } else {
      sql.push(parts[i])
    }
  }

  var ends = args.splice(i)
  var suffix = ''
  if (ends.length > 0) {
    ends.unshift('')
    suffix = ends.join(' ')
  }

  var text = sql.join('') + suffix

  return {
    text,
    values,
    name: hash(text)
  }
}
