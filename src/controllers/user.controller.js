import { asyncHandler } from "../utils/asyncHandler.js";
//asyncHandler is higher orfder function that takes an function\
import { apiError } from "../utils/APIError.js";
import {User} from "../model/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/APIResponse.js";
import { configDotenv } from "dotenv";
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        
        const refreshToken = await user.generateRefreshToken()

        //We have user object, we have to add acess token to user object:
        user.refreshToken = refreshToken
        //To save the user object in database: Whle saving data to mogoode db, all validation are initiated and it saving fails
        //if any required firld is left empty. So we set validatinOnSave = false
        await user.save({validatBeforeSave:false})

        return {accessToken, refreshToken}

    }
    catch(error){
        throw new apiError(500, "Something went wrong while generating Tokens")
    }
}



const userRegister = asyncHandler(async(req, res)=>{
    /**
     * Get user details from frontend
     * Validate -> non-empty, valid character, etc
     * Check if user already exist using email or userid
     * Check for image, check for avatar
     * upload them on cloudinary, avatar is compusary
     * Create user object ---> create entry in database
     * remove password and refresh token field from response
     * check for user creation
     * return res
     */

    //Data coming from form or json, we can get it through req.body()
    //Data coming from url is handled in different way
    const {fullName, email, username, password} = req.body

    /*
    //VALIDATING THE FIELDS {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

        //We have to check the proper format of fields. We can do by running if else on each fiel or we can do as below:
        
        // if(fullname===""){
        //     throw new apiError(400, "Full name required")
        // }

        //?????What is predicate function? Is it call back. some takes predicate fumction
        //Below if statement runs for each value in array due to some() method of array
    */
    if([fullName,email,username,password].some((field)=>(field?.trim()===""))){
        throw new apiError(400, "All fields required")
    }
    //Now we have to check wheather user already exist or not. For this purpose we have to use user model and communicate with  database.
    //findOne returns first found entity.
    
    //User.findOne({email})
    
    //Below code is demonstration of checking email OR username to be existing in database.
    const existedUser = await User.findOne({
        $or:[{email},{username}]
    })

    if(existedUser){
        throw new apiError(409, "User with username or email already exist")
    }


    //BEFORE UPLOADING, FILE HANDELING AND VALIDATING
    //through express we get acess of req.body, through multer we get req.fles  (Its extra feature only becoz of middleware multer)
    const localAvatarPath = req.files?.avatar[0]?.path 
    //const localCoverImagePath = req.files?.coverImage[0]?.path
    let localCoverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        localCoverImagePath = req.files?.coverImage[0].path
    }
    //console.log(req.files, req.body)....

    //avatar is required field, we should check its existence.

    //console.log(localAvatarPath, localCoverImagePath)
    //console.log("cloudinary", req.files)

    if(!localAvatarPath){
        throw new apiError(400, "avatar is required")
    }

    //We have used await to wait for process to end the proceed to next step.
    const avatar = await uploadOnCloudinary(localAvatarPath)
    const coverImage = await uploadOnCloudinary(localCoverImagePath)

    //Now we have to use the link and insert into database, but if any required field is left empty then server will crash
    //so we check sucessful upload of avatar also
    if(!avatar){
        throw new apiError(400, "No avatar file on cloudinary")
    }

    

    //Entry to database
    const user = await User.create({
        fullName: fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //Checking weather user is created/ data is entred?
    //const createdUser = User.findById(user._id)
    //Using below select() we can select the required field, there is another way too
    
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user")
    }
    //console.log("Created user", createdUser)
    //If sucessfully entered into database:
    //Response
    return res.status(201)

})




const loginUser = asyncHandler(async(req,res)=>{
    /**
     * TO DOs:
     * Take user input from frontend: username & password
     * Check if username and password are in valid format
     * ckeck for presence of username in database
     *      If absent then return user not available
     * Match the password in db and given by user
     * If matched, assign acess token and refresh token
     *      else: wrong username or password
     * SEND cookies(secure cookies)
     */

    const {username, email, password}= req.body

    console.log(username, email, password)

    if(!username && !email){
        throw new apiError(400, "Username or email required")
    }

    //To ckeck either username or emil is available in database.
    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new apiError(404, "User doesn't exist")
    }

    //Checking password using bcrypt:
    const isValidpassword = await user.isCorrectPassword(password)

    if(!isValidpassword){
        throw new apiError(401, "Invalid user credential")
    }


    //Generating access token and refresh token:
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    //Now we have to send data to user, We must filter out irrelevat information and perform security measures
    const {_id, username_, fullName_, email_ } = user.toObject()
    const loggedInUser = {
        username: username_,
        _id,
        fullName_,
        email_
    }
    
    console.log("select func run over ...")

    //Sending access token cookies:
    const options= {
        httpOnly:true,
        secure:true
    } //This option is sent with cookies to not let it modified from frontend

    // In response we can send as many cookie as we want
    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, 
                acessToken: accessToken, 
                refreshToken: refreshToken

            },
            "User loggedin sucessfully"
        )
    )

    
})




const logoutUser = asyncHandler(async(req, res)=>{
    /**
     * We an delete acess token and refresh token that user have
     * But how we will acess which token user have
     * Do we need to run query that given usedid, and i will log you out: No, this way we will logout any user from other user page.
     * How do we do?
     *      We inject our own middleware,
     */
    //req.user._id: It returns user object created during authorization
    //We will use another method to find and update accesstoken
    await User.findOneAndUpdate(  //No need to store return, becoz only running of this function completes our task.
        req.user._id,
        {
            $set:{refreshToken:undefined}   
        },
        {
            new:true
        },
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out"))

})


const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefToken = req.cookie.refreshToken || req.body.refreshToken
    
    if(!incomingRefToken){
        throw new apiError(401, "Unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(401, "Session expired")
    
        }
    
        if(incomingRefToken !== user?.refreshToken){
            throw new apiError(401, "refresh token is exppired or used")
    
        }
    
        const {newAcessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user?._id)
    
        options = {
            httpOnly:true,
            secure: true
        }
        return res
        .status(200)
        .cookie("acessToken",newAcessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {newAcessToken, newRefreshToken,},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401, "Invalid refresh token or problem in refreshing token")
    }
})


const updatePassword = asyncHandler(async(req, res)=>{
    //Get detail for update from frontend using req.body
    const {oldPassword, newPassword} = req.body

    //Check if user is logged in..
    const user = await User.findById(req.user?._id)

    //Verify the oldPassword if its correct for current user
    const isPWCorrect = await User.isCorrectPassword(oldPassword)

    if(!isPWCorrect){
        throw new apiError(400, "Invalid password")
    }

    user.password = newPassword
    await user.save({validatBeforeSave:false})

    return res
    .status(200)
    .json(new apiResponse(200. {newPassword: newPassword}, "Pasword changed sucessfully"))

})



const currentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(200, req.user, "Current User detail fetched")
})



const updateAccountDetail = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body

    if(!fullName && !email){
        throw new apiError(400, "All fields required")

    }

    const user  = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{fullName:fullName, email:email}
        },
        {new:true}
    ).select("-password")
    
    return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated"))

})



const updateUserAvatar = asyncHandler(async(req, res)=>{
    /**
     * get file from frontend and load it to temporary local folder
     *  req.files
     * verify if user is logged in
     * upload on cloudinary and get the cloudinary url
     * update the avatar field of database with new url
     */
    const newAvatarFile = req.file?.path

    if(!newAvatarFile){
        throw new apiError(400, "Upload new avatar file")
    }

    const newCloudUrl = uploadOnCloudinary(avata)
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {avatar: newCloudUrl?.url}
        },
        {new : true}

    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "avatar upadated sucessfully"))
})


export {
    userRegister,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    currentUser,
    updateAccountDetail,
    updateUserAvatar
}


