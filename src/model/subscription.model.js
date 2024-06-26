import mongoose, {Schema} from 'mongoose';

const subscription = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //User whixh is subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId, //User which is getting subscribed
        ref: "User"
    }
},
{timestamps:true})


export const Subscription = mongoose.model("Subscription", subscription)