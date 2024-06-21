import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)   
      // We can console log the elements in file.
      //Also we can name the file manually so that files don't get overwrited by another file of same name we are saving.
      //eg - file.filename + Date.now()+'-'+Math.round(Math.random()*1E5)
    }
  })
  
//Exporting the upload to local disk.
export const upload = multer({ storage: storage })
