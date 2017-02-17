## ucrit

A small utility to prepare SQL prepared statement.

```js
var id = 1
var statement = sql`SELECT * FROM table WHERE id = __ARG_${id}`

// you will get
{ text: 'SELECT * FROM table WHERE id = $1',
  values: [ 1 ],
    name: '773ce390' }
```

### license 

MIT
