import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'
const isLoggedIn = async (req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return next(new AppError("unathourized ,please login again",401))
    }
    try{
    const userDetails= await jwt.verify(token,process.env.JWT_SECRET)
      req.user=userDetails;
      
      next()}
      catch(e){
        console.error(e)
        return next(new AppError("Invalid or expired token, please login again", 401))
      }
}
export {isLoggedIn}