var test = require('tape')
var {sql, keyVals} = require('./index')

test('select', function (t) {
  t.plan(2)
  var id = 1
  var statement = sql`SELECT * FROM table WHERE id = __ARG_${id}`
  t.equal(statement.text, 'SELECT * FROM table WHERE id = $1')
  t.deepEqual(statement.values, [1])
})

test('update', function (t) {
  t.plan(2)
  var obj = {a: 1}
  var id = 1
  var statement = sql`UPDATE table SET __SET_${keyVals(obj)} WHERE id = __ARG_${id}`
  t.equal(statement.text, 'UPDATE table SET a=$1 WHERE id = $2')
  t.deepEqual(statement.values, [1, 1])
})

test('insert', function (t) {
  t.plan(2)
  var obj = {a: 1}
  var prepared = keyVals(obj)
  var statement = sql`INSERT INTO table __COL_${prepared} VALUES __VAL_${prepared}`
  t.equal(statement.text, 'INSERT INTO table (a) VALUES ($1)')
  t.deepEqual(statement.values, [1])
})