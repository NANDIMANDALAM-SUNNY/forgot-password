const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const randomString = require('randomstring')
const {userSchema} = require('../model/dbSchema')

const saltRound = 10;
const secretKey = "sunny"


const hashPassword = async (password)=>{
    let salt = await bcrypt.genSalt(saltRound);
    let hashedPassword = await bcrypt.hash(password,salt)
    return hashedPassword
}
let hashCompare = async (password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword)
}


const createToken = async(email,role)=>{
    let token = await jwt.sign({email,role},secretKey,{expiresIn:"1m"})
    return token
}
const jwtDecode = async (token) =>{
    let data = await jwt.decode(token)
    return data
}


const validate =async (req,res,next)=>{
    const token = req.header('jwttoken');
    if(!token) return res.status(401).send('Access denied. No token provided.');
    const data = await jwtDecode(token)
    const currentTime = Math.round(new Date()/1000)
    if(currentTime<=data.exp) {
        next()
    }    
    else{
        res.send({
            statusCode:401,
            message:"Token Expired"
        })
    }
}



const registerMail = async (name,email)=>{
    try {
         var transporter = nodemailer.createTransport({
         service:'gmail',
         auth:{
             user:'n.sunny170@gmail.com',
             pass:'goaqvmnboxeuqxuo'
         },
         tls:{
             rejectUnauthorized:false
         }
     });

     var  mailOptions={
             from: "myemail@gmail.com",
             to: email,
             subject: "Reset Password",
             text: "Hello world?", 
             html: `             
             <div style="margin:50px">
             <div style=" border: 1px solid black;border-radius: 30px;padding:20px ">
             <h3>Thank you for joining with us</h3>
                 <p>You will get notified for the latest news and updates</p>
                 <img width="300px" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQKfVYiWBAIiYbX252T8tlMEDMoOZdTWf52sv3mFFV&s"  />
             </div>
         <p style="color:grey">You're receiving this email because this gmail account is associated with us.</p>
          </div>
             `,    
     }
      transporter.sendMail(mailOptions, function(error, response) {
                  if (error) {
                      console.log(error);
                      return;
                  }
                  console.log('Message sent');
                  transporter.close();
              });
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}  





const roleAdmin =async (req,res,next)=>{
    let token = req.headers.authorization.split(" ")[1]
    let data = await jwtDecode(token)
    let currentTime = Math.round(new Date()/1000)
   
    if(data.role == "admin") {
        next()
    }    
    else{
        res.send({
            statusCode:401,
            message:"Token invalid"
        })
    }
}



// forgot Password
const forgot_password = async (req,res)=>{
    try {
     const userData =  await userSchema.findOne({email:req.body.email})
     if(!userData) return res.status(200).send({message:"Invalid Email"})
     const payload={
            email:req.body.email,
    }
    const token = jwt.sign(payload,secretKey,{expiresIn:'3m'})
     const data = await  userSchema.updateOne({email:req.body.email},{$set:{token:token}});
      sendResetpasswordMail(userData.name,userData.email,userData._id,token)
       res.send({
          statusCode:200,
            message:"Please check your email for to reset mail"
       })

    } catch (error) {
        console.log(error)
        res.send({
            statusCode:400,
            message:error
        })
    }
}
// sending Mail
const sendResetpasswordMail = async (name,email,id,token)=>{
    try {
         var transporter = nodemailer.createTransport({
         service:'gmail',
         auth:{
             user:'n.sunny170@gmail.com',
             pass:'goaqvmnboxeuqxuo'
         },
         tls:{
             rejectUnauthorized:false
         }
     });

     var  mailOptions={
             from: "myemail@gmail.com",
             to: email,
             subject: "Reset Password",
             text: "Hello world?", 
             html: `             
             <div style="margin:50px">
             <h3>Reset your password</h3>
             <div style=" border: 1px solid black;border-radius: 30px;padding:20px ">
                 <p>We heard that you lost your password. Sorry about that!</p>
                 <p>But don’t worry! You can use the following button to reset your password:</p>
                 <button style="padding:10px;background-color:green;color:white;border:none" > <a style="color:white" href="http://localhost:3000/resetpassword/${id}/${token}"  target=_blank>Reset your password</a></button>
                 <p>f you don’t use this link within 15 minutes, it will expire. To get a new password reset link, visit:<a href="" target=_blank> here</a>  </p>
                 <img width="300px" src="https://www.getillustrations.com/packs/zanzi-free-illustrations-for-websites/scenes/_1x/security%20_%20lock,%20key,%20login,%20safety,%20protection,%20padlock,%20locked,%20unlock_md.png"/>
             </div>
         <p style="color:grey">You're receiving this email because a password reset was requested for your account.</p>
          </div>
             `,    
     }
      transporter.sendMail(mailOptions, function(error, response) {
                  if (error) {
                      console.log(error);
                      return;
                  }
                  console.log('Message sent');
                  transporter.close();
              });
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}  






//verifyPassword
const verifyPassword =async (req,res)=>{
    try {
        const token = req.params.token;
        const tokenData = await  userSchema.findOne({token:token}) 
        if(!tokenData) {
          return  res.send({
                statusCode:200,
                message:"The Link has been already used"
            })
        } 
        const decodeJWt = await jwtDecode(tokenData.token);
        let currentTime = Math.round(new Date()/1000)
        if(currentTime<=decodeJWt.exp) {
            res.send({
                statusCode:200,
                message:"User Verified"
            })
        }
        else{
            res.send({
                statusCode:400,
                message:"Link has been expired"
            })
        }

    } catch (error) {
        console.log(error);
        res.status(400).send({success:false,msg:"Error"})
    }

}


const newPassword =async (req,res)=>{
    const {id,token }= req.params
    const password = req.body.password;
    console.log(id,token)
    const newPassword = await hashPassword(password);
    const updatePassword = await userSchema.findByIdAndUpdate({_id:id,token:token},{$set:{password:newPassword,token:""}},{new:true});  //new true returns updated data
    res.send({
        statusbar:200,
        success:true,
        message:"passWord Reset Successfully",
        data:updatePassword
    })

}


module.exports={hashPassword,hashCompare,createToken,jwtDecode,roleAdmin,validate,forgot_password,verifyPassword,newPassword,registerMail}


