import mongoose from 'mongoose';
import { DB_Name } from '../constants.js';

//Database is always in another continent: use async wait
//Use try: catch: to handle any kind of error
const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(`Mongo DB connected!! DB Host: ${connectionInstance.connection.host}`)
        //console.log(connectionInstance)
    }
    catch(error){
        console.log("Mongo DB connection FAILED ", error)
        process.exit(1)
    }
}


export default connectDB