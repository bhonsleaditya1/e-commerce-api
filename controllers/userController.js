const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors') 
const {createTokenUser,attachCookies, checkPermissions} = require('../utils')


const getAllUsers = async (req,res)=>{
    const users = await User.find({role:'user'}).select('-password')
    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async(req,res)=>{
    const user = await User.find({_id:req.params.id}).select('-password')
    if(!user){
        throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`)
    }
    checkPermissions(req.user,user._id)
    res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async(req,res)=>{
    res.status(StatusCodes.OK).json({user:req.user})
}

/* const updateUser = async(req,res)=>{
    const {name,email} = req.body
    if(!email||!name){
        throw new CustomError.BadRequestError('Please provide all values')
    }
    const user = await User.findOneAndUpdate(
        {_id:req.user.userId},
        {email,name},
        {new:true,runValidators:true}
    )
    const userToken = createTokenUser(user)
    attachCookies(res,userToken)
    res.status(StatusCodes.OK).json({user:userToken})
} */

const updateUser = async(req,res)=>{
    const {name,email} = req.body
    if(!email||!name){
        throw new CustomError.BadRequestError('Please provide all values')
    }
    const user = await User.findOne({_id:req.user.userId})
    user.email = email
    user.name = name
    await user.save()
    const userToken = createTokenUser(user)
    attachCookies(res,userToken)
    res.status(StatusCodes.OK).json({user:userToken})
}

const updateUserPassword = async(req,res)=>{
    const{oldPassword,newPassword} = req.body
    if(!oldPassword||!newPassword){
        throw new CustomError.BadRequestError('Please provide both passwords')
    }
    const user = await User.findOne({_id:req.user.userId})
    const isMatch = await user.checkPassword(oldPassword)
    if(!isMatch){
        throw new CustomError.UnauthenticatedError('Password is not correct')
    }
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({msg:'Success! Password updated'})
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}