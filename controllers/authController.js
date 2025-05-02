import dotenv from "dotenv"; // Import dotenv to manage environment variables
import User from "../models/user.js"; // Import User model
import AppError from "../utils/error.util.js"; // Import custom error handling class
import { sourceMapsEnabled } from "process";
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto'


dotenv.config(); // Load environment variables from .env file

// Cookie configuration settings
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time (7 days)
  httpOnly: true, // Cookie is only accessible via HTTP, not JavaScript (security measure)
  secure: true, // Ensures cookies are only sent over HTTPS
};

// Signup function to register a new user
const signup = async (req, res, next) => {
  try {
    // Extract user details from request body

    // console.log("Incoming Request Body:", req.body);
    // console.log("Incoming File:", req.file);

    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      // If any field is missing, return an error
      return next(new AppError("all fields are must required", 400));
    }

    // Check if a user with the given email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("users already exists", 400));
    }

    let avatarData = {
      public_id: "default",
      secure_url:
        "https://mms.businesswire.com/media/20190911005503/en/644377/23/cloudinary_vertical_logo_for_white_bg_print.jpg",
    };
    // If user creation fails, return an error
    // if (!newUser) {
    //   return next(
    //     new AppError("user registration failed,please try some time after", 400)
    //   );
    // }

    if (req.file) {
      avatarData = {
        public_id: req.file.filename, // Auto-generated ID from Cloudinary
        secure_url: req.file.path, // Secure URL from Cloudinary
      };
    }
    const newUser = new User({
      name,
      email,
      password,
      avatar: avatarData,
    });

    // Save new user to database
    await newUser.save();

    // Remove password before sending response
    newUser.password = undefined;

    // Generate JWT token for the user
    const token = await newUser.generateJWTTOKEN();

    // Set token in cookies
    res.cookie("token", token, cookieOptions);

    // Return success response
    return res
      .status(201)
      .json({ success: true, message: "user registered sucesfully", newUser });
  } catch (e) {
    console.error(e); // Log any errors
    return res.status(500).json({ message: "server error", success: false }); // Return server error response
  }
};

// Login function to authenticate a user
const login = async (req, res, next) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return next(new AppError("all fields are required", 401));
    }

    // Find user by email and also fetch password field (as it is usually excluded)
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists and password matches
    if (!user || !user.comparePassword(password)) {
      return next(new AppError("email or password does not match", 400));
    }

    // Generate JWT token
    let token = await user.generateJWTTOKEN();

    // Remove password before sending response
    user.password = undefined;

    // Set token in cookies
    res.cookie("token", token, cookieOptions);

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "user logged in successfully", user });
  } catch (e) {
    console.error(e); // Log any errors
    return next(new AppError(e.message, 500)); // Return error response
  }
};

// Logout function
const logout = (req, res, next) => {
  try {
    res.cookie("token", null, {
      secure: true,
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (e) {
    console.error(e);
    return next(new AppError("Something went wrong", 500)); // Fixed error handling
  }
};

// Get profile function (currently empty)
const getprofile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json({
      success: true,
      message: "user details",
      user,
    });
  } catch (e) {
    console.error(e);
    return next(new AppError("failed to fetch profile "));
  }
};

const forgotpassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("email is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("email is not registered", 400));
  }
  const resetToken =  user.generatePasswordResetToken();
  await user.save();

  const resetpasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // setting up mail functionality
  const subject = "reset password ";
  const message = `click to reset your password ${resetpasswordUrl}`;
  console.log(message)

  try {
    await sendEmail(email, subject, message);
    res.status(200).json({
      success: true,
      message: `reset password token has been sent ${email} sucessfuly`,
    });
  } catch (e) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    
    await user.save();
    return next(new AppError(e.message, 500));
  }
};


const resetpassword = async (req,res) => {
 const {resetToken}=req.params;
 const {password}=req.body

 const forgotPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex')

 const user=await User.findOne({
  forgotPasswordToken,forgotPasswordExpiry:{$gt:Date.now()}
 })

 if(!user){
  return next(new AppError('token is invalid or expired please try again',400))
 }

 user.password=password
 user.forgotPasswordToken=undefined;
 user.forgotPasswordToken=undefined;
 user.save()

 res.status(200).json({
  success:true,
  message:'password changed successfully'
 })
};

// Export the functions for use in other parts of the application
export { signup, login, logout, getprofile, forgotpassword, resetpassword };
