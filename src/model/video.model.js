import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
/**
 * This(watchHistory) field makes our project complicated and of next level
 * Wewill use basic queries like insert many, delete many etc
 * But we will use a special mongoose aggregation pipeline module called "mongoose-aggregate-pagenate-v2"
 * "mongoose-aggregate-pagenate-v2" : It helps in writing aggregation queries.
 * aggregation pipeline itself is a crash course
 */


const videoSchema = new Schema({
    videoFile:{
        type: String, //clouinary url
        required: true,
    },
    thumbnail: {
        type: String, //cloudinary url
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    duration: {
        type: Number,   //obtained from cloudinary url.
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamp: true})

//Adding plugin to videoSchema
videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema)