const CustomErr = require('../errors')
const { isTokenValid } = require('../utils')


const authenticatedUser = async(req,res,next)=>{
    const token = req.signedCookies.token
    if(!token){
        throw new CustomErr.UnauthenticatedError('Authentication Invalid')
    }
    try {
        const {name,role,userId} = isTokenValid({token})
        req.user = {name,userId,role}
        next()
    } catch (error) {
        throw new CustomErr.UnauthenticatedError('Authentication Invalid')
    }
}
/* const authorizePermissions = (req,res,next)=>{
    if(req.user.role!=='admin'){
        throw new CustomErr.UnauthorizedError('Unauthorized to access route')  
    }
    next()
} */

const authorizePermissions = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            throw new CustomErr.UnauthorizedError('Unauthorized to access route')
        }
        next()
    }
}
module.exports= {
    authenticatedUser,
    authorizePermissions
}