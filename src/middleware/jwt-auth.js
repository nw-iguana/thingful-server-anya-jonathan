const AuthService = require('../auth/auth-service')

const requireAuth = (req, res, next) => {
    const authToken = req.get('Authorization') || ''
    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(400).json({ error: 'missing Bearer Token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)
        AuthService.getUserWithUsername(req.app.get('db'), payload.sub)
            .then(user => {
                if (!user) {
                    return res.status(401).json({ error: 'unathorized request' })
                }
                req.user = user
                next()
            })
            .catch(error => {
                console.error(error)
                next(error)
            })

    }
    catch (error) {
        res.status(401).json({ error: 'unauthorized request' })
    }


}

module.exports = requireAuth