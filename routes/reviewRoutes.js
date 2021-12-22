const router = require('express').Router()
const {
    createReview,
    getAllReview,
    getSingleReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController')
const { authenticatedUser } = require('../middleware/authentication')



router.get('/',getAllReview)
router.get('/:id',getSingleReview)
router.use(authenticatedUser)
router.post('/',createReview)
router.route('/:id').patch(updateReview).delete(deleteReview)

module.exports = router