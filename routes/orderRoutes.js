const router = require('express').Router()

const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrder,
    createOrder,
    updateOrder
} = require('../controllers/orderController')

const {authenticatedUser,authorizePermissions} = require('../middleware/authentication')

router.use(authenticatedUser)
router.post('/',createOrder)
router.get('/showAllMyOrders',getCurrentUserOrder)
router.route('/:id').get(getSingleOrder).patch(updateOrder)

router.use(authorizePermissions('admin'))
router.get('/',getAllOrders)

module.exports = router
