
##KISSchema

ReactJS propType-inspired schemas for plain old JS objects.

###Example:
```javascript

import { types, validate } from 'kisschema'

var emailType = types.custom({ 
  validate: (str) => /.@./.test(str),
  makeErrorMessage: (ctx, str) => `Error ${ctx.prop}: '${str}' doesn't really look like an email, dude`
})

var userSchema = {
  name: types.string.isRequired,
  email: emailType.isRequired,
  age: types.number,
  friends: types.arrayOf(userSchema)
}

validate(userSchema, {
  name: 'Brendan',
  email: 'brendan@example.com',
  friends: [ { name: 'Allison', email: 'allison@example.com' } ]
}) // => passes.. returns null

validate(userSchema, {
  name: 'Brendan',
  email: 'brendan@example.com',
  friends: [ { name: 'Allison', email: 'allison@example.com' } ]
}) // => passes.. returns null

validate(userSchema, {
  name: 'Brendan',
  email: 'brendan@example.com',
  friends: [ 1 ]
}) // => fails.. returns array of error messages about incorrect friends array

```

Types includes all those present in [React.PropTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation), with the exception of React-specific types: node and element.

In addition, our custom type is a bit more involved, requiring validate and error message functions:

```javascript
var shoutType = types.custom({
  validate: (val) => types.string.validate(val) && /!$/.test(val),
  makeErrorMessage: (ctx, val) => `Huh, ${ctx.prop} should really have been shouted.`
})
```

###API

* types.string
* types.number
* types.bool
* types.func
* types.array
* types.object
* types.oneOf
* types.oneOfType
* types.shape
* types.arrayOf
* types.objectOf

*any of the above types can be followed with .isRequired*

* validate(schema, obj, opts={})
  * returns null if passes, or an array of error messages if doesn't pass
  * ```opts``` can include the following props
    * ```failFast``` - Stops validating on the first error

