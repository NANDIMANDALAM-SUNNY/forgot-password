var express = require('express');
var router = express.Router();
const {userSchema,mongoose} = require('../model/dbSchema')
const {dburl, mongodb} = require('../dbConnection')
const {hashPassword,hashCompare,createToken, jwtDecode,validate,roleAdmin,forgot_password,verifyPassword,newPassword,registerMail} = require('../Authenticaton/Authenticaton')


mongoose.connect(dburl).then(
  () => {console.log(`Db is Connected`) },
  err => { console.log(`Db is not Connected`) }
);

router.get('/',async (req,res)=>{
  res.send("Hello from Backend")
})


 router.get('/userData' ,validate, async (req,res)=>{
  const token = req.header('jwttoken');
  let verifyToken = await jwtDecode(token)
  let user = await userSchema.findOne({email:verifyToken.email})
  if(user){
    res.send({
      statusCode:200,
      data:user
    })
  }
  else{
    res.send({
      message:"Unauthrized"
    })
  }
 })

router.post('/signup',async (req,res)=>{
try {
  let user = await userSchema.find({email:req.body.email})
  if(user.length){
    res.send({
      statusCode:400,
      message:"User Already exists"
    })
  }
  else{
    let hashedPassword = await hashPassword(req.body.password)
    req.body.password = hashedPassword
    const newUser = await userSchema.create(req.body)
    if(newUser){
      registerMail(req.body.name,req.body.email)
     }
    res.send({
      statusCode:500,
        message:"Sign up sucessfully"
     }) 
    }
} 


catch (error) {
 console.log(error)
 res.send({
  statusCode:500,
    message:"Error"
 }) 
}
 })

 
router.post('/login',async (req,res)=>{
  try {
    let user = await userSchema.findOne({email:req.body.email})
    if(user._id){
      let compare = await hashCompare(req.body.password,user.password)
        if(!compare) return res.status(400).json("Invalid Credentials")
           const jwttoken = await createToken(user.email,user.role)
             res.send({
               statusCode:400,
               message:"Signed in Succesfully ",
               data:jwttoken
               })
        }
    else{
      res.send({
        statusCode:400,
        message:"User Does Not exists"
      })
    }
  } catch (error) {
   console.log(error)
   res.send({
    statusCode:500,
      message:"Message"
   }) 
  }
   })
router.post('/forgotpassword',forgot_password)  //forgot Mail
router.get('/resetpassword/:id/:token',verifyPassword)
router.post('/newpassword/:id/:token',newPassword)



module.exports = router;





