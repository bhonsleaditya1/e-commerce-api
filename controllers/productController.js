const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')

const createProduct = async(req,res)=>{
    req.body.user = req.user.userId;
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
}
const getAllProducts = async(req,res)=>{
    const products = await Product.find()
    res.status(StatusCodes.OK).json({products,count:products.length})
}
const getSingleProduct = async(req,res)=>{
    const product = await Product.find({_id:req.params.id}).populate('reviews')
    if(!product){
        throw new CustomError.NotFoundError(`There is no product with id: ${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({product})
}
const updateProduct = async(req,res)=>{
    const product = await Product.find({_id:req.params.id})
    if(!product){
        throw new CustomError.NotFoundError(`There is no product with id: ${req.params.id}`)
    }
    if(!product.user===req.user.userId.toString()){
        throw new CustomError.UnauthorizedError('Not authorized to access this route')
    }
    await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
    res.status(StatusCodes.OK).json({msg:'Success! Updated'})
}
const deleteProduct = async(req,res)=>{
    const product = await Product.findOne({_id:req.params.id})
    if(!product){
        throw new CustomError.NotFoundError(`There is no product with id: ${req.params.id}`)
    }
    if(!product.user===req.user.userId.toString()){
        throw new CustomError.UnauthorizedError('Not authorized to access this route')
    }
    await product.remove()
    res.status(StatusCodes.OK).json({msg:'Success'})
}
const uploadImage = async(req,res)=>{
    if(!req.files){
        throw new CustomError.BadRequestError('No file uploaded')
    }
    const productImage = req.files.image
    if(!productImage.mimetype.startsWith('image')){
        throw new CustomError.BadRequestError('Please upload image')
    }
    const maxSize = 1024*1024
    if(productImage.size>maxSize){
        throw new CustomError.BadRequestError('Please upload smaller than 1MB')
    }
    const imagePath = path.join(__dirname,'../public/uploads'+`${productImage}`)
    await productImage.mv(imagePath)
    res.status(StatusCodes.OK).json({image:`/uploads/${productImage.name}`})
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}