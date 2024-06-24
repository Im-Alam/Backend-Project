import dotenv from 'dotenv'
import connectDB from './db/index.js'
import {app} from './app.js'


dotenv.config({path : './.env'})

//When any asynchronous method completes, it returns a promise. connecDB() is async method.
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log('Server Connected at PORT ',process.env.PORT)
    })
})
.catch((error)=>{
    console.log('MongoDB connection FAILED!!', error)
})

