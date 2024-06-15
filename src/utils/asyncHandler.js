//FUNCTION DECLARATION
//const asyncHandler = ()=>{}
//const asyncHandler = (func)=>()=>{}
//const asyncHandler = (func)=>(async(func)=>{})     all above are same


//BELOW CODE IS USING try{} and catch(){}
// const asyncHandler =(func)=>async(req, res, next)=>{
//     try{
//         await func(req,res,next)
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message
//         })
//     }
// }

//USING PROMISES
const asyncHandler = (requestHandler)=>{
    (req, res, next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}







export {asyncHandler}


