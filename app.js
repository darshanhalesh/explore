import express from 'express';

import cors from "cors";
import cookieParser from 'cookie-parser';
import userroutes from "./routes/authRoutes.js";
import morgan from 'morgan';
import errormiddleware from './middlewares/errormiddlewares.js';

// Create an instance of an Express application
const app = express();





// Middleware
app.use(cors({ origin: ['http://localhost:3000'], methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'))
// Define a port num

// Define a route for the root URL
app.get('/home', (req, res) => {
  res.send('Hello, World!');
});

app.use("/api/v1/user", userroutes);

app.all("*", (req, res) => {
    res.status(404).send('Oops, page not found');
});
app.use(errormiddleware);

// Start the server and listen on the defined port
export default app