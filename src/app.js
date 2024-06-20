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



























export {app} //We can also do: export default app



