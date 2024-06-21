import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 
//cookieParser is used to read and set cookies about user in browser. Do CRUD operation on user cookies

const app = express()


//We need more packages for our work: cors(cros origin resource sharing), cookie-parser, 
//For any middlewares, we use app.use(cors()) for using middleware or doing configuration settings
//app.use(cors())    //It is generic use of cros, we an configure it as below:
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))     //There are some more configurations to explore

//When our app runs it has to accept data in many formats, let it be json, BUT HOW much CAN IT ACCEPT
//WILL not setting LIMIT lead to server crash
//We set limit to prevent server crash in case of DOS
app.use(express.json({
    limit: '16kb',

}))


//Also data is coming as URL, encoded using some URL encoder(' ': %20)
//We also must configure express to understand these encodings
app.use(express.urlencoded({    //Even not passing anything to urlencoded will do our task but for extra configuration we do
    extended:true,
    limit: '16kb',
}))

//Configuration to save files, documents,images etc in public folder
app.use(express.static("public"))

//Configuration for CRUD operation on user cookies in a browser
app.use(cookieParser()) //We can pass optios also

//routes
import userRouter from "./routes/user.router.js"

//Routes declaration
//app.get() was used when routes and controller bothe are written in app.js

//Here we will use app.use for using middleware before routing


//app.use("/user", userRouter)
//https://localhost:8000/user/register

//If we are defining our api then we should encorpoorate it in the rooute as below:


app.use("/api/v1/user", userRouter)
//https://localhost:8000/api/v1/user/regiter



export {app} //We can also do: export default app



