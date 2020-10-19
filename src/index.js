const express = require("express");
require("./db/mongoose.js");

const app = express();

const port = process.env.PORT;

const userRouter = require('./routers/users');
const taskRouter = require('./routers/tasks.js');

/*const multer = require('multer');

const upload = multer({
    dest:'TestFiles',
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match('\.(docx|doc|pdf)$')){
            return cb(new Error('the files must be docx, doc or pdf'));
        }
        cb(undefined, true);
    }
})
app.post('/upload', upload.single('avatar'), (req, res) => {
    try{
        res.send();
    }catch(error) {
        res.status(500).send('error')
    }
})*/
app.use(express.json());

app.use(userRouter);

app.use(taskRouter);

app.listen(port, () => console.log('the server listen to port ' + port));
