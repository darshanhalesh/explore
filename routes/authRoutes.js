
import express from 'express'
const router=express.Router();
import { signup, login ,getprofile,logout, forgotpassword, resetpassword} from '../controllers/authController.js'
import { isLoggedIn } from '../middlewares/authmiddleware.js';
import { upload } from '../cloudConfig.js';



router.post('/signup',upload.single('avatar'),signup)
router.post('/login',login)
router.get('/logout',logout)
router.get('/me',isLoggedIn,getprofile)
router.post('/reset',forgotpassword)
router.post('/reset/:resetToken',resetpassword)

export default router;