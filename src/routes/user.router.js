import { Router } from "express";
import { userRegister } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"


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


export default router