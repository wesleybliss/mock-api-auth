const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')

const app = express()
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000
const secret = 'abc123'

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const users = {}

class User {
    constructor(email, password) {
        this.id = uuidv4()
        this.email = email
        this.password = password
        this.createToken()
    }
    createToken() {
        this.token = jwt.sign({ email: this.email }, secret)
    }
}

// curl http://localhost:3000/users
app.get('/users', (req, res) => res.json(users))

// curl -XPOST http://localhost:3000/signup -d '{"email":"foo@bar.com","password":"abc123"}' -H 'Content-type: application/json'
app.post('/signup', (req, res) => {
    
    const { email, password } = req.body
    
    if (!email || !password)
        return res.json({ error: 'email & password required' })
    
    const user = new User(email, password)
    users[user.id] = user
    
    res.json(user)
    
})

// curl -XPOST http://localhost:3000/login -d '{"email":"foo@bar.com","password":"abc123"}' -H 'Content-type: application/json'
app.post('/login', (req, res) => {
    
    const { email, password } = req.body
    
    if (!email || !password)
        return res.json({ error: 'email & password required' })
    
    try {
        
        const user = Object.values(users).filter(it => it.email === email).shift()
        
        if (!user || !user.email)
            throw new Error('user not found')
        
        user.createToken()
        users[user.id] = user
        
        res.json(user)
        
    } catch (e) {
        
        res.json({ error: e.toString() })
        
    }
    
})

app.listen(port, host, () => console.log(`Listening on port http://${host}:${port}`))
