import connectDB from "./src/config/db-connect.js";
import app from "./index.js";
import dotenv from 'dotenv';
dotenv.config();

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on ${process.env.PORT}`)
});