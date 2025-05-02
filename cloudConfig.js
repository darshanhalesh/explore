
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from "dotenv";
dotenv.config();




cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'profile_lms',
      allowedFormats: ["png",'jpg','jpeg'], // supports promises as well
      transformation: [{ width: 250, height: 250, crop: "fill" }], // Resize images

    },
  });
  const upload = multer({ storage })


  export {cloudinary,upload}