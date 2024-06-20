import multer from "multer";



 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)   // We can console log the elements in file.
    }
  })
  
  const upload = multer({ storage: storage })
