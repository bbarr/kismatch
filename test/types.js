
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
})
