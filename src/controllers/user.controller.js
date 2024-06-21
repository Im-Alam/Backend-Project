import { asyncHandler } from "../utils/asyncHandler.js";
//asyncHandler is higher orfder function that takes an function\


const userRegister = asyncHandler(async(req, res)=>{
    res.status(200).json({
        message:"ok",
    })
})

export {userRegister}