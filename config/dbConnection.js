import mongoose from "mongoose";
mongoose.set('strictQuery',false)

const connectionToDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/learn'        
            
        );
        if (connection){
        console.log(`connected to mongodb:${connection.connection.host}`);
        }
    } catch (error) {
        console.log("connection failed", error);
        process.exit(1);
        
    }
};
export default connectionToDb