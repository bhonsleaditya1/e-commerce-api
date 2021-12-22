const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {UnauthenticatedError,BadRequestError} = require('../errors')
const { attachCookies,createTokenUser} = require('../utils')

const { removeListener, create } = require('../models/User')

const register = async(req,res)=>{
    const {email,name,password} = req.body
    const emailUsed = await User.findOne({email})
    if(emailUsed){
        throw new BadRequestError('Email already exists')
    }

    // first registered user is an admin
    const isFirstAccount = (await User.countDocuments({}))===0;
    const role = isFirstAccount ? 'admin':'user'
    const user = await User.create({name,email,password,role})
    const userToken = createTokenUser(user)
    attachCookies(res,userToken)
    res.status(StatusCodes.CREATED).json({user:userToken});
}

const login = async(req,res)=>{
    const {email,password} = req.body
    if(!email||!password){
        throw new BadRequestError('Email or Password is missing')
    }
    const user = await User.findOne({email})
    if(!user)
        throw new UnauthenticatedError('Invalid Credentials')
    const isMatch = await user.checkPassword(password)
    if(!isMatch){
        throw new UnauthenticatedError('Invalid Credentials')
    }
    const userToken = createTokenUser(user)
    attachCookies(res,userToken)
    res.status(StatusCodes.OK).json({user:userToken})
}

const logout = async(req,res)=>{
    res.cookie('token',' logout',{
        httpOnly:true,
        expires: new Date(Date.now())
    } )
    res.status(StatusCodes.OK).json({msg:'user logged out'})
}

module.exports = {
    register,
    login,
    logout
}