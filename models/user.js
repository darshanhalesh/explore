import mongoose from "mongoose";
import bcrypt, { compare } from 'bcrypt';
const { Schema } = mongoose;
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: [5, "name must be at leasat 5 character"],
    maxlength: [50, "name should be less than 50 characters"],
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please fill in a valid email address",
    ], // Matches
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
 
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
  forgotPasswordToken:String,
  forgotPasswordExpiry:Date
},{
    timestamps:true
});
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next() 
    }
    this.password= await bcrypt.hash(this.password,10);
})

userSchema.methods={
    generateJWTTOKEN: async function(){
        return jwt.sign({id:this._id,email:this.email,subscription:this.subscription,role:this.role}
            ,process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_EXPIRY
            }
        )
    },

    comparePassword:async function(plainTextPassword){
  return await bcrypt.compare(plainTextPassword,this.password)
    },
    generatePasswordResetToken: function(){
      const resetToken=crypto.randomBytes(20).toString('hex')
      this.forgotPasswordToken=crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
      this.forgotPasswordExpiry=Date.now()+15*60*1000
      return resetToken;
    }
}

const User = mongoose.model("User", userSchema);

export default User;
