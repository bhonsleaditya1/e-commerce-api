const Review = require('../models/Review')
const Order = require('../models/Order')
const Product = require('../models/Product')
const CustomError = require('../errors')
const {checkPermissions} = require('../utils')
const { StatusCodes } = require('http-status-codes')

const fakeStripeAPI = async ({amount,currency})=>{
    const client_secret = 'someRamdomAmount'
    return {client_secret,amount,currency}
}

const createOrder = async(req,res)=>{
    const {items:cartItems,tax,shippingFee} = req.body
    if(!cartItems|| cartItems.length<1){
        throw new CustomError.BadRequestError('No cart items provided')
    }
    if(!tax|| !shippingFee){
        throw new CustomError.BadRequestError('Please provide tax and shipping fee')
    }
    let orderItems = []
    let subtotal = 0
    for(const item of cartItems){
        const dbProduct = await Product.findById(item.product)
        if(!dbProduct){
            throw new CustomError.BadRequestError(`No product with id: ${item.product}`)
        }
        const {name,price,image,_id} = dbProduct
        //console.log(name,price,image,_id);
        const singleOrder = {
            amount:item.amount,
            name,
            price,
            image,
            product:_id
        }
        // add item to order
        orderItems = [...orderItems,singleOrder]
        // calculate subtotal
        subtotal +=item.amount*price
        //console.log(orderItems,subtotal);
    }
    // calculate total
    const total = tax + shippingFee+ subtotal
    const paymentIntent = await fakeStripeAPI({
        amount:total,
        currency:'usd'
    })
    const order =  await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret:paymentIntent.client_secret,
        user:req.user.userId 
    })
    res.status(StatusCodes.CREATED).json({order,clientSecret:order.clientSecret})
}
const getAllOrders = async(req,res)=>{
    const orders = await Order.find();
    res.status(StatusCodes.OK).json({orders})
}
const getSingleOrder = async(req,res)=>{
    const {id:orderId} = req.params
    const order = await Order.findById(orderId)
    if(!order){
        throw new CustomError.NotFoundError(`No order with id: ${id}`)
    }
    checkPermissions(req.user,order.user)
    res.status(StatusCodes.OK).json({order})
}
const getCurrentUserOrder = async(req,res)=>{
    const orders = await Order.find({user:req.user.userId})
    res.status(StatusCodes.OK).json({orders,count:orders.length})
}
const updateOrder = async(req,res)=>{
    const {id:orderId} = req.params
    const {paymentIntent}  = req.body
    const order = await Order.findById(orderId)
    if(!order){
        throw new CustomError.NotFoundError(`No order with id: ${id}`)
    }
    checkPermissions(req.user,order.user)
    order.paymentIntent = paymentIntent
    order.status = 'paid'
    await order.save()
    res.status(StatusCodes.OK).json({order})
}

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrder,
    createOrder,
    updateOrder
}