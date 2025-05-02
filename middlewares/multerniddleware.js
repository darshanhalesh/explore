// importing multer
import multer from "multer";
// importing path module
import path from "path";

const upload = multer({
  dest: "./uploads",
  limits: { fileSize: 5 * 1024 * 1024 }, // 50mb max
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      // console.log('the file is>',file)
      cb(null, file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4"
    ) {
      cb(new Error("unsupported file type "), false);
      return;
    }
    cb(null, true);
  },
});

// exporting upload
export default upload;