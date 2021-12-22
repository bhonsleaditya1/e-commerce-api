const { StatusCodes } = require('http-status-codes')
const Review = require('../models/Review')
const Product = require('../models/Product')
const CustomError = require('../errors')
const {checkPermissions} = require('../utils')

const createReview = async(req,res)=>{
    const {product:productId} = req.body
    const product = await Product.findById(productId)
    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)
    }
    const submitted = await Review.findOne({
        product:productId, user:req.user.userId
    })
    if(submitted){
        throw new CustomError.BadRequestError('Already submitted review for this product')
    }
    req.body.user = req.user.userId
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}
const getAllReview = async(req,res)=>{
    const reviews = await Review.find().populate({
        path:'product',
        select:'name company price',
    }).populate({
        path:'user',
        select:'name',
    });
    res.status(StatusCodes.OK).json({count:reviews.length,reviews})
}
const getSingleReview = async(req,res)=>{
    const review = await Review.findById(req.params.id)
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({review})
}
const updateReview = async(req,res)=>{
    const {params:{id:reviewId},body:{rating,title,comment}} = req
    const review = await Review.findById(reviewId)
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
    }
    checkPermissions(req.user,review.user)
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save()

    res.status(StatusCodes.OK).json({review})
}
const deleteReview = async(req,res)=>{
    const {id:reviewId} = req.params
    const review = await Review.findById(reviewId)
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)
    }
    checkPermissions(req.user,review.user)
    await review.delete()
    res.status(StatusCodes.OK).json({msg:'Success!! Removed review'})
}

const getSingleProductReviews = async(req,res) =>{
    const {id:productId} = req.params
    const reviews = await Review.find({product:productId})
    res.status(StatusCodes.OK).json({reviews,count:reviews.length})
}


module.exports = {
    createReview,
    getAllReview,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
}