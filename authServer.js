require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const app = express()

app.use(express.json())

const users = [];
let refresherToken = [];

//Login a user and grant them an access token
app.post("/users/login", async (req, res) => {
    const user = users.find(x => x.name === req.body.name)
    console.log(user, " comes before error")
    if(user == null){
        return res.status(400).send("authentication failed")
    }

    try{
        if(await bcrypt.compare(req.body.password, user.password)){
            
            console.log("My user is ", user.name)
            const accessToken = generateToken(user.name)
            const refreshToken = jwt.sign({name : user.name}, process.env.REFRESH_TOKEN_SECRET, {expiresIn : '40s'})
            refresherToken.push(refreshToken)
            res.status(200).json({ accessToken : accessToken, refreshToken: refreshToken})
        }
        else{
            res.status(401).send("not allowed")
        }
        
    }
    catch(e){
        console.log(e, " is the error")
        res.status(500).send()
    }
})


function generateToken(user){
    return jwt.sign({name: user}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '100s'})
}

//Sign up a user
app.post("/users", async (req, res) => {
    try{
        //Bcrypt is async therefore our function must be async
    //make a salt then hash the password and save the salted hash

    // const salt = await bcrypt.genSalt()

    //gen salt will take 10 rounds by default.
     //const hashPassword = await bcrypt.hash(req.body.password, salt)

    //A shorter way of hashing and salting in a single line

    const hashPassword = await bcrypt.hash(req.body.password, 10) //second parameter is number of rounds when generating a salt

    console.log("This is my hashed password ", hashPassword )
    // console.log("This is my salt ", salt)

    //we can now save the hashed password in our 'database'


    const user = {
        name: req.body.name,
        password: hashPassword
    }

    users.push(user)
    console.log("User has been created ", user)
    console.log("Our current users array has ", users)

    res.status(201).send()
    }
    catch(e){
        console.log(e, " is the error")
        res.status(500).send()
    }
})

app.post("/token", (req, res) => {
    const refreshToken = req.body.token
    if(refreshToken === null) return res.sendStatus(401)
    if(!refresherToken.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403)
        const accessToken = generateToken({name : user.name})
    res.json({ accessToken : accessToken})
    })
})

app.delete("/logout", (req, res)=>{
    refresherToken = refresherToken.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.listen(8000)