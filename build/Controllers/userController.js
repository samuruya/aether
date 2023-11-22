const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const createToken = (_id) => {
    const jwtKey = process.env.JWT_SECRET_KEY;
    
    return jwt.sign({_id}, jwtKey, {expiresIn: "30d"})
};


const registerUser = async(req, res) => {
    
    try{
        const {tag, email, password, regToken} = req.body

        let user = await userModel.findOne({email}); //check for user 
        let tagger = await userModel.findOne({tag}); //

        if(user) 
            return res.status(400).json("this email is already taken"); // error msg if email is already taken
        
        if(tagger) 
            return res.status(400).json("this name is already taken"); // error msg if email is already taken
        //validating user input
        if(!tag || !email || !password || !regToken) 
            return res.status(400).json("please fill all the fields");
    
        if(!validator.isEmail(email)) 
            return res.status(400).json("The email isnt a valid email");
    
        if(password.length <= 3)
            return res.status(400).json("your password needs to be atleast 4 chars long");
        
        if(regToken != process.env.LOGTOKEN)
            return res.status(400).json("wrong entry token");
        
        const bio = "No Bio Yet";
        const pfp = "https://i.ibb.co/m8bCySY/83bc8b88cf6bc4b4e04d153a418cde62.jpg";

        user = new userModel({tag, email, password, bio, pfp})
    
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
    
        await user.save()
    
        const token = createToken(user._id)
        
        res.status(200).json({_id: user._id, tag, email,  bio, pfp,token})
    }catch(error){
        console.log(error);
    }
}

const loginUser = async(req, res) => {
    const {email, password} = req.body;

    try{
        let user = await userModel.findOne({email}); //check for user 

        if(!user)
            return res.status(400).json("no user with this email was found");

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword)
            return res.status(400).json("Wrong Password");


        const token = createToken(user._id)
        res.status(200).json({_id: user._id, tag: user.tag, email, bio: user.bio, pfp: user.pfp, token})

    }catch(error) {
        console.log(error);
    }
}


const findUser = async(req, res) => {
    const userId = req.params.userId;
    try{
        const user = await userModel.findById(userId)

        res.status(200).json(user)
    }catch(error) {
        console.log(error);
    }
}

const getUsers = async(req, res) => {
    try{
        const users = await userModel.find()
        res.status(200).json(users)
    }catch(error) {
        console.log(error);
    }
}


module.exports = {registerUser, loginUser, findUser, getUsers}
