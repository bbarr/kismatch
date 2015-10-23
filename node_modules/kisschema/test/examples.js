
import assert from 'assert'
import ks from '../src/index'

var emailType = ks.types.custom({
  validate: (str) => /.@./.test(str),
  makeErrorMessage: (ctx, str) => `Error ${ctx.prop}: '${str}' doesn't really look like an email, dude`
})

var Author = {
  name: ks.types.string.isRequired,
  email: emailType.isRequired,
  bookIds: ks.types.arrayOf(ks.types.string)
}

var Book = {
  id: ks.types.string.isRequired,
  author: ks.types.shape(Author).isRequired
}

describe('examples', () => {
  
  describe ('Author schema', () => {

    it ('should pass with valid author', () => {
      var author = {
        name: 'Bob Cobb',
        email: 'bob@cobb.com',
        bookIds: []
      }
      assert(!ks.validate(Author, author))
    })

    it ('should fail when missing required prop', () => {
      var author = {
        name: 'Bob Cobb',
        bookIds: []
      }
      assert.equal(ks.validate(Author, author).length, 1)
    })
  })

  describe ('Book schema', () => {

    it ('should pass with valid book', () => {
      var book = {
        id: '123',
        author: {
          name: 'Bob Cobb',
          email: 'bob@cobb.com'
        }
      }
      assert(!ks.validate(Book, book))
    })

    it ('should fail when missing required prop', () => {
      var author = {
        name: 'Bob Cobb',
        bookIds: [ ]
      }
      assert.equal(ks.validate(Author, author).length, 1)
    })
  })
})
