
import assert from 'assert'
import * as km from '../lib/index.js'

function describe(txt, fn) {
  console.log('Describing:', txt)
  fn()
}

function it(txt, fn) {
  console.log('It', txt)
  fn()
}

describe('kismatch', () => {

  describe('simple examples', () => {

    it ('should run function for match', () => {

      const echo = km.match(
        { foo: 'bar' },
        payload => payload
      )

      const good = { foo: 'bar' }

      assert.equal(echo(good), good)
    })

    it ('should return null for non-match', () => {

      const echo = km.match(
        { foo: 'bar' },
        payload => payload
      )

      const bad = { foo: 'baz' }

      assert.equal(echo(bad), null)
    })

    it ('should not break when given undefined/null', () => {

      const echo = km.match(
        { foo: 'bar' },
        payload => payload
      )

      const bad = undefined

      assert.equal(echo(bad), null)
    })
  })

  describe('kisschema examples', () => {

    it ('should run function for match with kisschema', () => {

      const echo = km.match(
        { foo: km.types.string },
        payload => payload
      )

      const good = { foo: 'bar' }

      assert.equal(echo(good), good)
    })

    it ('should return null for non-match with kisschema', () => {

      const echo = km.match(
        { foo: km.types.string },
        payload => payload
      )

      const bad = { foo: 1 }

      assert.equal(echo(bad), null)
    })
  })

  describe('using a function instead of pattern object', () => {

    it ('should run function for match', () => {

      const echo = km.match(
        ({ foo }) => foo === 'bar',
        payload => payload
      )

      const good = { foo: 'bar' }

      assert.equal(echo(good), good)
    })

    it ('should return null for non-match', () => {

      const echo = km.match(
        ({ foo }) => foo === 'bar',
        payload => payload
      )

      const bad = { foo: 'zap' }

      assert.equal(echo(bad), null)
    })
  })

  describe('works on isRequired', () => {

    it ('should check both isRequired and base validation', () => {

      const echo = km.match(
        { foo: km.types.string.isRequired },
        payload => payload
      )

      const bad = { foo: 1 }

      assert.equal(echo(bad), null)
    })
  })

  describe('multiple matchers', () => {

    it ('should run function when matches multiple', () => {

      const echo = km.match(
        { foo: km.types.number, bar: 'baz' },
        payload => payload
      )

      const good = { foo: 1, bar: 'baz' }

      assert.equal(echo(good), good)
    })

    it ('should return null when one of multiple matchers is non-match', () => {

      const echo = km.match(
        { foo: km.types.array, bar: 'baz' },
        payload => payload
      )

      const bad = { foo: 1, bar: 'baz' }

      assert.equal(echo(bad), null)

    })

    it ('should choose strongest match by count matched properties', () => {

      const echo = km.match(

        { foo: km.types.number, bar: 'baz' },
        payload => payload,

        { repeat: true, foo: km.types.number, bar: 'baz' },
        payload => [ payload, payload ]
      )

      const good = { repeat: true, foo: 1, bar: 'baz' }

      assert.equal(JSON.stringify(echo(good)), JSON.stringify([ good, good ]))
    })
  })

  describe('default function', () => {

    it ('should call a given default function if no other matches found', () => {

      const echo = km.match(

        { foo: km.types.number, bar: 'baz' },
        payload => payload,

        () => 'some default'
      )

      const needsDefault = { foo: 1 }

      assert.equal(echo(needsDefault), 'some default')
    })
  })

  describe('nested patterns', () => {

    it ('should run function when matches', () => {

      const echo = km.match(
        { foo: { bar: 'baz' } },
        payload => payload
      )

      const good = { foo: { bar: 'baz' } }

      assert.equal(echo(good), good)
    })

    it ('should return null when one of multiple matchers is non-match', () => {

      const echo = km.match(
        { foo: { bar: 'baz' } },
        payload => payload
      )

      const bad = { foo: { bar: 1 } }

      assert.equal(echo(bad), null)
    })

    it ('should simply fail if data is not nested', () => {

      const echo = km.match(
        { foo: { bar: { zap: 1 } } },
        payload => payload
      )

      const bad = { foo: null }

      assert.equal(echo(bad), null)
    })

    it ('should match for multiple nested patterns', () => {

      const echo = km.match(
        { 
          foo: { bar: 'baz' },
          zap: { pip: 1 }
        },
        payload => payload
      )

      const bad = { foo: { bar: 'baz' }, zap: {} }

      assert.equal(echo(bad), null)
    })
  })

  describe('matched function execution', () => {

    it ('should call function with all given arguments!', () => {

      const echo = km.match(
        { foo: km.types.string, bar: 2 },
        (...args) => args
      )

      const good = { foo: 'hi', bar: 2 }

      assert.deepEqual(echo(good, 1, 2, 3, 4, 5), [ good, 1, 2, 3, 4, 5 ])
    })

    it ('should call default function with all given arguments', () => {

      const echo = km.match(
        { foo: km.types.string, bar: 2 },
        () => false,
        (...args) => args
      )

      const good = undefined

      assert.deepEqual(echo(good, 1, 2, 3, 4, 5), [ good, 1, 2, 3, 4, 5 ])
    })
  })
})
