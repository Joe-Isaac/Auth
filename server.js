require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const app = express()

app.use(express.json())

const users = []

app.get("/users", authenticateToken, (req, res) => {
    console.log("Requested user info is", users)
    res.json(users)
})

function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"]
    console.log("Auth Header is ", authHeader)
    const token = authHeader && authHeader.split(' ')[1]

    if(token === null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log("Our user is ", user)
        console.log("This is the middleware eerrrorr....", err)
        if(err) return res.sendStatus(403)
        
        req.user = user
        next()
    })
}



app.listen(9000)