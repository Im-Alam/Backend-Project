import mongoose from 'mongoose';
import { DB_Name } from '../constants.js';


const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(`Mongo DB connected!! DB Host: ${connectionInstance.connection.host}`)
        console.log(connectionInstance)
    }
    catch(error){
        console.log("Mongo DB connection FAILED ", error)
        process.exit(1)
    }
}


export default connectDB