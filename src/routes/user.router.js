import { Router } from "express";
import { loginUser, logoutUser, userRegister } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",//This name has to be saame in frontend
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    userRegister
)

router.route("/login").post(loginUser)

//Here we require auth middleware to know wewther user is logged in or not
//It is called secured route
router.route("/logout").post(verifyJWT,logoutUser)
export default router