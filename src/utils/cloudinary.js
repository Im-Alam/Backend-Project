import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret:  process.env.CLOUD_API_SECRET
});


const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        //Upload file on cloudinary
        response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'

        })
        //File uploaded sucessfully on cloudinary
        console.log('File uploaded sucessfully on cloudinary with url:', response.url)
        return response
    }catch(error){
        //Even if file upload fails we must unlink the locally saved temporary file as:
        fs.unlinkSync(localFilePath)
        return null
    }
}


export {uploadOnCloudinary}