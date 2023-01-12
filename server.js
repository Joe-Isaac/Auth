const express = require("express")
const bcrypt = require("bcrypt")
const app = express()

app.use(express.json())

const users = []

app.get("/users", (req, res) => {
    console.log("Requested user info is", users)
    res.json(users)
})

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

    res.status(201).send()
    }
    catch(e){
        console.log(e, " is the error")
        res.status(500).send()
    }
})

app.post("/users/login", async (req, res) => {
    const user = users.find(x => x.name === req.body.name)
    console.log(user, " comes before error")
    if(user == null){
        return res.status(400).send("authentication failed")
    }

    try{
        if(await bcrypt.compare(req.body.password, user.password)){
            res.send("successfully logged in")
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

app.listen(9000)