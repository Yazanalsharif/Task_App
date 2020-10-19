const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require("../models/users");
const auth = require('../middlewares/auth');
const router = express.Router();
const {sendWelcomeMessage, sendWhyCansaling} = require('../mails/email');

//handle users Route 
router.post("/users", async (req, res) => {
    try{
        const user = new User(req.body);
        const token = await user.generateAuthToken();
        sendWelcomeMessage(user.email, user.name)
        await user.save();
        res.status(201).send({user, token});
    }catch(error) {
        console.log(error);
        res.status(400).send({error:error.message});
    }
});
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredintal(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }catch(e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        
        await req.user.save();
        res.send(req.user);
    }catch(error) {
        res.status(500).send('you have to auth')
    }
    
});
router.post('/users/logout/all', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save()
        res.send(req.user)
    }catch (error) {

    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('you Must Upload jpg jpeg or png'));
        }
        cb(undefined, true);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'),async (req, res) => {
    const avatar = await sharp(req.file.buffer).png().resize({width:250, height:250}).toBuffer();
    req.user.avatar = avatar;
    await req.user.save();
    res.send(req.user);
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});



//get all users from database
router.get("/users/me", auth,  async (req, res) => {
    try{
       res.send(req.user);
    }catch(error) {
        res.status(500).send(error);
    }
    
})
//get user by id
router.get("/users/:id", async (req, res) => {
    try{
        const _id = req.params.id;
        const result = await User.findById(_id);
        if(!result) {
            return res.status(404).send();
        }

        res.send(result);
    }catch(error){
        res.status(500).send(error);
    }
    

});
router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) {
            throw new Error('there is No Data');
        }
        console.log(req.params.id);
        res.set({'Content-Type' : 'image/png'});
        res.send(user.avatar);
    }catch(error) {
       
        res.status(400).send({error:error.message});
    }
})

router.patch("/users/me", auth, async (req, res) => {
    const ubdates = Object.keys(req.body);
    const allowdUbdates = ['name', 'age', 'password', 'email'];
    const isValid = ubdates.every(ubdate => allowdUbdates.includes(ubdate));
    
    if(!isValid) {
        return res.status(400).send({error: "invalid Ubdates"});
    }
    try{

        ubdates.forEach(ubdate => req.user[ubdate] = req.body[ubdate]);
        await req.user.save();
        res.send(req.user);
    }catch(error) {
        console.log(error)
        res.status(400).send(error)
    }

});

router.delete('/users/me', auth,  async (req, res) => {
    try {
        sendWhyCansaling(req.user.email, req.user.name);
        await req.user.remove();
        res.send(req.user);
    } catch(error) {
        res.status(500).send('Error');
    }
});
router.delete('/users/me/avatar', auth,async (req, res) => {
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.send(req.user);
    }catch(error) {
        console.log(error);
        res.status(500).send('error form server');
    }
  

})

module.exports = router;