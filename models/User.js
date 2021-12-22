const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide name'],
        minlength:3,
        maxlength:50
    },
    email:{
        type:String,
        required:[true,'Please provide email'],
        unique:true,
        validate:{
            validator: validator.isEmail,
            message:'Please provide valid email'
        }
    },
    password:{
        type:String,
        required:[true,'Please provide password']
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    }
},{timestamps:true})

UserSchema.pre('save',async function(){
    // console.log(this.modifiedPaths())
    // console.log(this.isModified('name'))
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password,salt)
    }
})

UserSchema.methods.checkPassword = async function(password){
    const isSame = await bcrypt.compare(password,this.password)
    return isSame
}

module.exports = mongoose.model('User', UserSchema)