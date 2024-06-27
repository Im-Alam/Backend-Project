/**
 * We have to veryfy if user have access token
 * If available then remove,
 *      Else Not possible to logout if user is not logged in
 */

import { apiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";


//Here we are exporting simultaneously
//Below function will be use many time like in case of logout, posting content, liking content, commenting, etc...
export const verifyJWT = asyncHandler(async(req, _, next)=>{//_ is used in place of res becoz it was not used in below code.
    try {
        //We can get acessToke from cookies because we set it in cookies in user controller during login
        //Or we can  get it through custom header sent by user, with name authorization 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") //bearer is prefix of header sent as authorization
        console.log(token)
        if(!token){
            throw new apiError(401, "Unauthoried access")
        }
    
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new apiError(401, "Invalid access token")
        }
    
        //Adding one more field to req, we add user to req so that it can be acessed for logoout.
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message  || "Invalid credential for logout")
    }
})
