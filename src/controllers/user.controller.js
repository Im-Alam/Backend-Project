import { asyncHandler } from "../utils/asyncHandler.js";
//asyncHandler is higher orfder function that takes an function\
import { apiError } from "../utils/APIError.js";
import {User} from "../model/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/APIResponse.js";



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
    const {fullname, email, username, password} = req.body
    console.log({"email":email})

    /*
    //VALIDATING THE FIELDS {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

        //We have to check the proper format of fields. We can do by running if else on each fiel or we can do as below:
        
        // if(fullname===""){
        //     throw new apiError(400, "Full name required")
        // }

        //?????What is predicate function? Is it call back. some takes predicate fumction
        //Below if statement runs for each value in array due to some() method of array
    */
    if([fullname,email,username,password].some((field)=>(field?.trim()===""))){
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
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLower()
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

    //If sucessfully entered into database:
    //Response
    return res.status(200).json(apiResponse(200, createdUser, "user registered"))

})

export {userRegister}