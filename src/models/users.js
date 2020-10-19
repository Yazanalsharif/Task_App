const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("this is not Email");
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value) {
            if(value.toLowerCase().includes("password")){
                throw new Error("the password contain password word");
            }
        }
    },
    age:{
        type: Number,
        //the Function Name validate
        validate(value) {
            if(value < 0) {
                throw new Error("you can't set the age as negative Number");
            }
        },
        
    },
    tokens:[{
        token:{
            type: String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});
//we have to use the same Name of Method toJSON to convert the object to json and delete the properity and and back it again by 
//app.use(express.json()); to an object.
//toJSON is the method that will convert the json data to an object so when we property from object it will deleted when we convered to object
//example
//const pre = {name: 'yazan'};
//pre.toJSON = function() {
//    return {}
//}
//console.log(pre);
//console.log(pre.toJSON());
userSchema.virtual('myTasks', {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    
    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({_id: this._id.toString()}, process.env.TOKEN_SECRET);
    this.tokens = this.tokens.concat({token});
    await this.save();

    return token;
}

userSchema.statics.findByCredintal = async (email, password) => {
    const user = await User.findOne({email});
    if(!user) {
        throw new Error('the user Does Not Exist');
    }

    const isMatch = await bcryptjs.compare(password, user.password);
        if(!isMatch) {
        throw new Error('Invalid Data');
    }
    
    return user;
}

userSchema.pre('save', async function (next) {
    const user = this;
    
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
    }
    next();
})

const User = mongoose.model("User", userSchema);



module.exports = User;