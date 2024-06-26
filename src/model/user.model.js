import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



const userSchema = new Schema({
    username: {
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true //In mongoDB, to make any field searchabel in optimized way we keep it true.
    },
    email: {
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type:String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type:String, //Will be cloudnary url
        required: true,
    },
    coverImage: {
        type:String, //cloudinary url
    },
    watchHistory: [//Its array because it will hold multiple values
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    /**
     * This(watchHistory) field makes our project complicated and of next level
     * We will use basic queries like insert many, delete many etc
     * But we will use a special mongoose aggregation pipeline module called "mongoose-aggregate-pagenate-v2"
     * "mongoose-aggregate-pagenate-v2" : It helps in writing aggregation queries.
     * aggregation pipeline itself is a crash course
     */

    password: {
        type: String, //It is not recommended to keep password in clear string in DB, It has to be encrypted.
        required: [true, "password is required"]     //This format display message if password is not provided
    },
    refreshToken: {
        type: String
    }

},{timestamps: true}   //It add two extra field, createdAt and updatedAt
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
        
    this.password = await bcrypt.hash(this.password, 10)  //Numberr here refers to no of rounds to be taken to encrypt the password
    next()
})

userSchema.methods.isCorrectPassword = async function(password){
    return await bcrypt.compare(password, this.password) //It return true/false. It takes entred password(password) and encrypted password(this.password) and compare them.
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
    {
        _id : this._id,
        email : this.email,
        username : this.username,
        fullName : this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_EXPIRY
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRY
    )
}


export const User = mongoose.model("User", userSchema)