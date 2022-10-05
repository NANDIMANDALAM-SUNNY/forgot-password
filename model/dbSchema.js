const mongoose = require('mongoose');
const validator = require('validator')   //validation of schema

let users = new mongoose.Schema( //creating the schema
    { 
        name:{
            type:"string",
            required:true
        },
        email:{
            type:"string",
            required:true,
            lowercase:true,
            unique:true,
            validate:(value)=>{
                return validator.isEmail(value)
            }
        },
        mobileNumber:{
            type:"string",
            required:"true",
            default:'000-000-0000'
        },
        role:{
            type:"string",
            required:"true",
            default:'student'
        },
        password:{
            type:"string",
            required:true
        },  
        createdAt:{
            type:Date,
            default:Date.now(),
            expireAfterSeconds: 30 
        },
        token:{
            type:"string",
            default:"",
        }
    }
)
const userSchema = mongoose.model('users',users);  //model name
module.exports={userSchema,mongoose}