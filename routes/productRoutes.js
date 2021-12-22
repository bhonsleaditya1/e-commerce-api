const express = require('express')
const router = express.Router()

const {authenticatedUser,authorizePermissions} = require('../middleware/authentication')

const {getAllProducts,getSingleProduct,createProduct,updateProduct,deleteProduct,uploadImage} = require('../controllers/productController')
const {getSingleProductReviews} = require('../controllers/reviewController')


router.get('/',getAllProducts)
router.get('/:id',getSingleProduct)
router.get('/:id/reviews',getSingleProductReviews)
router.use(authenticatedUser,authorizePermissions('admin'))
router.post('/',createProduct)
router.route('/:id').patch(updateProduct).delete(deleteProduct)
router.post('/uploadImage',uploadImage)

module.exports = router