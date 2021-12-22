const express = require('express')
const { getAllUsers,getSingleUser,updateUser,updateUserPassword,showCurrentUser } = require('../controllers/userController')
const { authenticatedUser,authorizePermissions } = require('../middleware/authentication')
const router = express.Router()

router.use(authenticatedUser)

router.get('/',authorizePermissions('admin','owner'),getAllUsers)

router.get('/showMe',showCurrentUser)
router.patch('/updateUser',updateUser)
router.patch('/updatePassword',updateUserPassword)

router.get('/:id',getSingleUser)

module.exports = router