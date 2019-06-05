const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
  validatePassword(password) {
    if (password.length < 8) {
      return 'password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'password must be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'password cannot start or end with empty spaces'
    }
    if (!strongRegex.test(password)) {
      return 'password must have an upper case, a lower case, a number, and a special character'
    }
    return null;
  },
  hasUserWithUserName(db, user_name) {
    return db('thingful_users')
      .where({ user_name })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db('thingful_users')
      .insert(newUser)
      .returning('*')
      .then(([user]) => user)
  },
  serializeUser(user) {
    return {
      user_name: xss(user.user_name),
      full_name: xss(user.full_name),
      nickname: xss(user.nickname)
    }
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  }
}

module.exports = UsersService;