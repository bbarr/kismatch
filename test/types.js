
import assert from 'assert'
import km from '../src/index'

describe('kismatch', () => {

  describe('simple examples', () => {

    it ('should run function for match', () => {

      var echo = km(
        { foo: 'bar' },
        payload => payload
      )

      var good = { foo: 'bar' }

      assert.equal(echo(good), good)
    })

    it ('should return null for non-match', () => {

      var echo = km(
        { foo: 'bar' },
        payload => payload
      )

      var bad = { foo: 'baz' }

      assert.equal(echo(bad), null)
    })

    it ('should not break when given undefined/null', () => {

      var echo = km(
        { foo: 'bar' },
        payload => payload
      )

      var bad = undefined

      assert.equal(echo(bad), null)
    })
  })

  describe('kisschema examples', () => {

    it ('should run function for match with kisschema', () => {

      var echo = km(
        { foo: km.types.string },
        payload => payload
      )

      var good = { foo: 'bar' }

      assert.equal(echo(good), good)
    })

    it ('should return null for non-match with kisschema', () => {

      var echo = km(
        { foo: km.types.string },
        payload => payload
      )

      var bad = { foo: 1 }

      assert.equal(echo(bad), null)
    })
  })

  describe('using a function instead of pattern object', () => {

    it ('should run function for match', () => {

      var echo = km(
        ({ foo }) => foo === 'bar',
        payload => payload
      )

      var good = { foo: 'bar' }

      assert.equal(echo(good), good)
    })

    it ('should return null for non-match', () => {

      var echo = km(
        ({ foo }) => foo === 'bar',
        payload => payload
      )

      var bad = { foo: 'zap' }

      assert.equal(echo(bad), null)
    })
  })

  describe('works on isRequired', () => {

    it ('should check both isRequired and base validation', () => {

      var echo = km(
        { foo: km.types.string.isRequired },
        payload => payload
      )

      var bad = { foo: 1 }

      assert.equal(echo(bad), null)
    })
  })

  describe('multiple matchers', () => {

    it ('should run function when matches multiple', () => {

      var echo = km(
        { foo: km.types.number, bar: 'baz' },
        payload => payload
      )

      var good = { foo: 1, bar: 'baz' }

      assert.equal(echo(good), good)
    })

    it ('should return null when one of multiple matchers is non-match', () => {

      var echo = km(
        { foo: km.types.array, bar: 'baz' },
        payload => payload
      )

      var bad = { foo: 1, bar: 'baz' }

      assert.equal(echo(bad), null)

    })

    it ('should choose strongest match by count matched properties', () => {

      var echo = km(

        { foo: km.types.number, bar: 'baz' },
        payload => payload,

        { repeat: true, foo: km.types.number, bar: 'baz' },
        payload => [ payload, payload ]
      )

      var good = { repeat: true, foo: 1, bar: 'baz' }

      assert.equal(JSON.stringify(echo(good)), JSON.stringify([ good, good ]))
    })
  })

  describe('default function', () => {

    it ('should call a given default function if no other matches found', () => {

      var echo = km(

        { foo: km.types.number, bar: 'baz' },
        payload => payload,

        () => 'some default'
      )

      var needsDefault = { foo: 1 }

      assert.equal(echo(needsDefault), 'some default')
    })
  })

  describe('nested patterns', () => {

    it ('should run function when matches', () => {

      var echo = km(
        { foo: { bar: 'baz' } },
        payload => payload
      )

      var good = { foo: { bar: 'baz' } }

      assert.equal(echo(good), good)
    })

    it ('should return null when one of multiple matchers is non-match', () => {

      var echo = km(
        { foo: { bar: 'baz' } },
        payload => payload
      )

      var bad = { foo: { bar: 1 } }

      assert.equal(echo(bad), null)
    })

    it ('should simply fail if data is not nested', () => {

      var echo = km(
        { foo: { bar: { zap: 1 } } },
        payload => payload
      )

      var bad = { foo: null }

      assert.equal(echo(bad), null)
    })

    it ('should match for multiple nested patterns', () => {

      var echo = km(
        { 
          foo: { bar: 'baz' },
          zap: { pip: 1 }
        },
        payload => payload
      )

      var bad = { foo: { bar: 'baz' }, zap: {} }

      assert.equal(echo(bad), null)
    })
  })

  describe('matched function execution', () => {

    it ('should call function with all given arguments!', () => {

      var echo = km(
        { foo: km.types.string, bar: 2 },
        (...args) => args
      )

      var good = { foo: 'hi', bar: 2 }

      assert.deepEqual(echo(good, 1, 2, 3, 4, 5), [ good, 1, 2, 3, 4, 5 ])
    })

    it ('should call default function with all given arguments', () => {

      var echo = km(
        { foo: km.types.string, bar: 2 },
        () => false,
        (...args) => args
      )

      var good = undefined

      assert.deepEqual(echo(good, 1, 2, 3, 4, 5), [ good, 1, 2, 3, 4, 5 ])
    })
  })
})
