import dotenv from 'dotenv' 


import app from './app.js'
import connectionToDb from './config/dbConnection.js';

dotenv.config()

const PORT=process.env.PORT ||3001;



app.listen(PORT,async()=>{
    await connectionToDb();
    console.log(`app is running at http:localhost:${PORT}`);
})