
import assert from 'assert'
import ks from '../src/index'

var describeBasicType = (typeName, type, passingValue, failingValue) => {

  it ('should have isRequired option', () => {
    assert(type.isRequired)
  })

  describe('.validate', () => {

    it ('should return true if passed', () => {
      assert.equal(type.validate(passingValue), true)
    })

    it ('should return false if failed', () => {
      assert.equal(type.validate(failingValue), false)
    })
  })

  describe('.makeErrorMessage', () => {

    it ('should return a helpful message', () => {
      assert.equal(
        type.makeErrorMessage({ prop: 'test-prop' }),
        `test-prop should be of type: ${typeName}`
      )
    })
  })
}

describe('kisschema', () => {

  describe('kisschema types', () => {

    describe('kisschema.types.string', () => {
      describeBasicType('string', ks.types.string, '', 1)
    })

    describe('kisschema.types.number', () => {
      describeBasicType('number', ks.types.number, 1, '')
    })

    describe('kisschema.types.bool', () => {
      describeBasicType('boolean', ks.types.bool, true, 1)
    })

    describe('kisschema.types.object', () => {
      describeBasicType('object', ks.types.object, {}, 1)
    })

    describe('kisschema.types.array', () => {
      describeBasicType('array', ks.types.array, [], 1)
    })

    describe('kisschema.types.func', () => {
      describeBasicType('function', ks.types.func, function() {}, 1)
    })

    describe('kisschema.types.oneOf', () => {

      it ('should have isRequired option', () => {
        assert(ks.types.oneOf().isRequired)
      })

      it ('should return true if test value is one that was given to oneOf()', () => {
        var type = ks.types.oneOf([ 'a', 'b', 'c' ])
        assert.equal(type.validate('a'), true)
      })

      it ('should return false if test value is not one that was given to oneOf()', () => {
        var type = ks.types.oneOf([ 'a', 'b', 'c' ])
        assert.equal(type.validate('d'), false)
      })

      it ('should offer a helpful error message', () => {
        var possibilities = [ 'a', 'b', 'c' ]
        var type = ks.types.oneOf(possibilities)
        assert.equal(
          type.makeErrorMessage({ prop: 'test-prop' }),
          `test-prop should match one of: ${JSON.stringify(possibilities)}`
        )
      })
    })

    describe('kisschema.types.oneOfType', () => {

      it ('should have isRequired option', () => {
        assert(ks.types.oneOfType().isRequired)
      })

      it ('should return true if test value matches any of the given types', () => {
        var type = ks.types.oneOfType([
          ks.types.string,
          ks.types.number
        ])
        assert.equal(type.validate('a'), true)
        assert.equal(type.validate(3), true)
      })

      it ('should return false if test value matches any of the given schemas', () => {
        var type = ks.types.oneOfType([ 
          { a: ks.types.string },
          ks.types.number
        ])
        assert.equal(type.validate({ a: '1' }), true)
        assert.equal(type.validate(1), true)
      })

      it ('should offer a helpful error message', () => {
        var possibilities = [ 
          { a: ks.types.string },
          ks.types.number
        ]
        var type = ks.types.oneOfType(possibilities)
        assert.equal(
          type.makeErrorMessage({ prop: 'test-prop' }),
          `test-prop should be one of type: ${possibilities.map((p) => p.toString())}`
        )
      })
    })

    describe('kisschema.types.arrayOf', () => {

      it ('should have isRequired option', () => {
        assert(ks.types.arrayOf().isRequired)
      })

      it ('should return true if test value matches any of the given types', () => {
        var type = ks.types.arrayOf({ a: ks.types.number })
        assert.equal(type.validate([ { a: 1 } ]), true)
      })

      it ('should return false if test value matches any of the given schemas', () => {
        var type = ks.types.arrayOf({ a: ks.types.number }) 
        assert.equal(type.validate([ { a: '1' } ]), false)
      })

      it ('should offer a helpful error message', () => {
        var item = { a: ks.types.number }
        var type = ks.types.arrayOf(item) 
        assert.equal(
          type.makeErrorMessage({ prop: 'test-prop' }),
          `test-prop should be an array containing items of type: ${item.toString()}`
        )
      })
    })

    describe('kisschema.types.objectOf', () => {

      it ('should have isRequired option', () => {
        assert(ks.types.objectOf().isRequired)
      })

      it ('should return true if test value matches any of the given types', () => {
        var type = ks.types.objectOf(ks.types.number)
        assert.equal(type.validate({ a: 1 }), true)
      })

      it ('should return false if test value matches any of the given schemas', () => {
        var type = ks.types.objectOf(ks.types.number) 
        assert.equal(type.validate({ a: '1' }), false)
      })

      it ('should offer a helpful error message', () => {
        var type = ks.types.objectOf(ks.types.number) 
        assert.equal(
          type.makeErrorMessage({ prop: 'test-prop' }),
          `test-prop should be an object containing items of type: ${ks.types.number.toString()}`
        )
      })
    })

    describe('kisschema.types.instanceOf', () => {

      it ('should have isRequired option', () => {
        assert(ks.types.instanceOf().isRequired)
      })

      it ('should return true if instance of the given constructor', () => {
        var Animal = function() {}
        var type = ks.types.instanceOf(Animal)
        assert.equal(type.validate(new Animal), true)
      })

      it ('should return false if not instance of the given constructor', () => {
        var Animal = function() {}
        var type = ks.types.instanceOf(Animal)
        assert.equal(type.validate({}), false)
      })

      it ('should offer a helpful error message', () => {
        var Animal = function() {}
        var type = ks.types.instanceOf(Animal)
        assert.equal(
          type.makeErrorMessage({ prop: 'test-prop' }),
          `test-prop should be an instance of ${Animal.toString()}`
        )
      })
    })

    describe('kisschema.types.shape', () => {

      it ('should have isRequired option', () => {
        assert(ks.types.shape({
          a: ks.types.string,
          b: ks.types.array
        }).isRequired)
      })

      it ('should return true if shape/schema is satisfied', () => {

        var type = ks.types.shape({
          a: ks.types.string,
          b: ks.types.array
        })

        assert.equal(type.validate({ a: '', b: [] }), true)
      })

      it ('should return false if shape/schema is not satisfied', () => {
        var type = ks.types.shape({
          a: ks.types.string,
          b: ks.types.array
        })

        assert.equal(type.validate({ a: '', b: 3 }), false)
      })

      it ('should offer a helpful error message', () => {
        var schema = {
          a: ks.types.string,
          b: ks.types.array
        }
        var type = ks.types.shape(schema)

        assert.equal(
          type.makeErrorMessage({ prop: 'test-prop' }), 
          `test-prop should match shape/schema ${schema.toString()}`
        )
      })
    })

    describe('kisschema.types.any', () => {

      it ('should have isRequired option', () => {
        assert(ks.types.any.isRequired)
      })

      it ('should return true if given existy', () => {
        assert.equal(ks.types.any.validate({}), true)
      })

      it ('should return false if given non-existy', () => {
        assert.equal(ks.types.any.validate(), false)
      })

      it ('should offer a helpful error message', () => {
        assert.equal(
          ks.types.any.makeErrorMessage({ prop: 'test-prop' }), 
          `test-prop should be "any"thing... just not undefined or null`
        )
      })
    })

    describe('kisschema.types.custom', () => {

      it ('should throw if type interface not met', () => {
        assert.throws(ks.types.custom)
      })

      it ('should have isRequired option', () => {
        assert(ks.types.custom({
          validate() {},
          makeErrorMessage() {} 
        }).isRequired)
      })

      it ('should return true if custom type is satisfied', () => {
        var type = ks.types.custom({ 
          validate: (x) => x === 'a custom thing',
          makeErrorMessage: (ctx, x) => 'bad!'
        })
        assert.equal(type.validate('a custom thing'), true)
      })

      it ('should return false if custom type is not satisfied', () => {
        var type = ks.types.custom({ 
          validate: (x) => x === 'a custom thing',
          makeErrorMessage: (ctx, x) => 'bad!'
        })
        assert.equal(type.validate([]), false)
      })

      it ('should offer a helpful error message', () => {
        var type = ks.types.custom({ 
          validate: (x) => x === 'a custom thing',
          makeErrorMessage: (ctx, x) => 'bad!'
        })
        assert.equal(type.makeErrorMessage({ prop: 'test-prop' }), `bad!`)
      })
    })

  })

  describe('kisschema.validate', () => {
    
    it ('should return null if all passed', () => {
      var schema = { a: ks.types.string, b: ks.types.number }
      var obj = { a: '1', b: 1 }
      assert.equal(ks.validate(schema, obj), null)
    })

    it ('should return array of errors if there are failures', () => {
      var schema = { a: ks.types.array, b: ks.types.string, c: ks.types.object }
      var obj = { a: '1', b: 1, c: {} }
      var errors = ks.validate(schema, obj)
      assert.equal(errors.length, 2)
      assert.equal(errors[0], ks.types.array.makeErrorMessage({ prop: 'a' }, '1'))
      assert.equal(errors[1], ks.types.string.makeErrorMessage({ prop: 'b' }, 1))
    })

    it ('should respect isRequired extention', () => {
      var schema = { a: ks.types.string.isRequired, b: ks.types.number }
      var obj = { b: 1 }
      var errors = ks.validate(schema, obj)
      assert.equal(errors.length, 1)
      assert.equal(errors[0], ks.types.string.isRequired.makeErrorMessage({ prop: 'a' }, null))
    })

    describe('options', () => {

      describe('stopOnFail', () => {
        
        it ('should stop immediately on any error', () => {
          var schema = { a: ks.types.string.isRequired, b: ks.types.number }
          var obj = { b: '1' }
          var errors = ks.validate(schema, obj)
          assert.equal(errors.length, 2)
          var limitedErrors = ks.validate(schema, obj, { failFast: true })
          assert.equal(limitedErrors.length, 1)
        })
      })
    })
  })
})
