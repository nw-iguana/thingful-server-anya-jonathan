const express = require('express')
const authRouter = express.Router()
const jsonBodyParser = express.json()
const AuthService = require('./auth-service')

authRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body
        const loginUser = { user_name, password }
        for (const [key, value] of Object.entries(loginUser)) {
            if (value == null) {
                return res.status(400).json({ error: `missing ${key} in request` })
            }
        }


        AuthService.getUserWithUsername(
            req.app.get('db'), loginUser.user_name)
            .then(dbUser => {
                if (!dbUser) {
                    return res.status(400).json({ error: 'incorrect username or password' })
                }
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch) {
                            return res.status(400).json({ error: 'incorrect username or password' })
                        }
                        const sub = dbUser.user_name
                        const payload = { user_id: dbUser.id }
                        res.send({ authToken: AuthService.createJwt(sub, payload) })
                    })
            })

            .catch(next)
    })

module.exports = authRouter