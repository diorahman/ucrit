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

test('insert', function (t) {
    t.plan(2)
    var obj = {a: 1, b: '2017-12-30T17:00:00Z', c: 'dc486f89-fff3-42bf-adfe-b6479494881e'}
    var prepared = keyVals(obj)
    var statement = sql`INSERT INTO table __COL_${prepared} VALUES __VAL_${prepared}`
    t.equal(statement.text, 'INSERT INTO table (a, b, c) VALUES ($1, $2::date, $3::uuid)')
    t.deepEqual(statement.values, [1, '2017-12-30T17:00:00Z', 'dc486f89-fff3-42bf-adfe-b6479494881e'])
})

test('insert', function (t) {
  t.plan(2)
  var obj = {a: 1, b: undefined, c: true, d: null, e: undefined}
  var prepared = keyVals(obj)
  var statement = sql`INSERT INTO table __COL_${prepared} VALUES __VAL_${prepared}`
  t.equal(statement.text, 'INSERT INTO table (a, c, d) VALUES ($1, $2, $3)')
  t.deepEqual(statement.values, [1, true, null])
})

test('select', function (t) {
  t.plan(2)
  var id = 1
  var any = true
  var statement = sql`
    SELECT * FROM table WHERE id = __ARG_${id}
    ${any ? 'AND deleted_at IS NULL' : ''}
    ${any ? 'AND activated_at IS NULL' : ''}`
  t.equal(statement.text.trim(), 'SELECT * FROM table WHERE id = $1 AND deleted_at IS NULL AND activated_at IS NULL')
  t.equal(1, 1)
})

test('filter', function (t) {
  t.plan(1)
  var cols = ['a', 'b', 'c']
  var statement = sql`
    SELECT __FIL_${cols} FROM table
  `
  t.equal(statement.text.trim(), 'SELECT a, b, c FROM table')
})
