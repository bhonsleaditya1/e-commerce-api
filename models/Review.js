const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    rating:{
        type:Number,
        required:[true,'Please provide rating'],
        max:5,
        min:1
    },
    title:{
        type:String,
        trim:true,
        required:[true,'Please provide title'],
        maxlength:25
    },
    comment:{
        type:String,
        required:[true,'Please provide comment'],
        maxlength:500
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    product:{
        type:mongoose.Schema.ObjectId,
        ref:'Product',
        required:true
    }
},{timestamps:true}
)

ReviewSchema.index({product:1,user:1},{unique:true})

ReviewSchema.statics.calculateAverageRating = async function(productId){
    const result = await this.aggregate([
        {$match:{product:productId}},
        {$group:{
            _id:'$product',
            averageRating:{$avg:'$rating'},
            numOfReviews:{$sum:1}
        }}
    ])
    try {
        await this.model('Product').findOneAndUpdate({_id:productId},{
            averageRating:Math.ceil(result[0]?.averageRating||0),
            numOfReviews: result[1]?.numOfReviews||0
        })
    } catch (error) {
        console.log(error);
    }
}

ReviewSchema.post('save',async function(){
    await this.constructor.calculateAverageRating(this.product)
    //console.log('post save hook called')
})

ReviewSchema.post('remove',async function(){
    await this.constructor.calculateAverageRating(this.product)
    //console.log('post remove hook called')
})

module.exports = mongoose.model('Review',ReviewSchema)