
// const http = require('http');
// const fs =require('fs');


// const home = fs.readFileSync('index.html');
// const about = fs.readFileSync('about.html');
// const sign = fs.readFileSync('sign.html');
// const contact = fs.readFileSync('contact.html');

//const hostname  =' 127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//     console.log(req.url);
//     url = req.url;
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/html');
//   if(url == '/')
//   res.end(home);
//   else if(url == '/about')
//   res.end(about);
//   else if(url == '/contact')
//   res.end(contact);
//   else if(url == '/sign')
//   res.end(sign);
//   else
//   console.log('this is an error');
// });
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });





// var express = require('express')
// var app = express();
// const port  = 80;
// const hostname  = '127.0.0.1';


// respond with "hello world" when a GET request is made to the homepage
// app.get('/', function (req, res) {
//   res.sendFile(path.join(_dirname , "/index.html")); 
// })
// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
//   });

require('dotenv').config()
 const express = require('express')
 const path  = require('path')
 const _dirname = path.resolve();
 const jwt  = require("jsonwebtoken")
const app = express()
const bodyparser = require('body-parser')
const mongoose = require('mongoose');
const { sign } = require('crypto');
const { response } = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');


var flash = require('connect-flash');

app.use(flash());
app.use(session({
  secret:'flashblog',
  saveUninitialized: true,
  resave: true
}));

// app.configure(function() {
//   app.use(express.cookieParser('keyboard cat'));
//   app.use(express.session({ cookie: { maxAge: 60000 }}));
  
// });
// const port  = process.env.PORT||300


main().catch(err => console.log(err));




async function main() {
  await mongoose.connect('mongodb://localhost:27017/signdb');}
const port = 2700;

const signSchema = new mongoose.Schema({
  FirstName: {
    type:String,
 
    
},
 LastName:  {
   type:String,
  
   
} ,
  Email: {
    type:String,
  unique:true
},
  Password: {
    type:String,
  unique:true
},
  ConfirmPassword: {
    type:String,
  unique:true
},
tokens:[{
  token:{
    type:String,
     required:true
  }
}]
});

signSchema.methods.generateAuthToken = async function(){
  try {
    const token = jwt.sign({_id:this._id.toString()},process.env.SECRET);
    // console.log(token);
    this.tokens = this.tokens.concat({token:token});
    await this.save();
    return token;
    
    
  } catch (error) {
    res.send("the error part"+error);
    // console.log("the error part"+error);
    
  }
}

// console.log(process.env.SECRET);

 const Sign = mongoose.model("Sign", signSchema);
 app.use(express.json());
 app.use(cookieParser());
 app.use(express.urlencoded({extended:false}));

const auth =  async(req,res,next)=>{
  try {
    const  token = req.cookies.jwt;
    const  verifyuser = jwt.verify(token,process.env.SECRET);
    
    console.log( verifyuser);
    const user = await Sign.findOne({_id:verifyuser._id});
    console.log(user.FirstName);
     req.user  = user;
    req.token = token;
    
   
    next();
    
  } catch (error) {
    res.status(401).send("login to your account");
    // // alert('please add text and amount')
    // req.flash('message', 'Welcome to Blog');
    //   res.send(req.flash('massage'));
    // res.redirect('/index.html');
    
  }
} 

// app.get('/flash', function(req, res){
//   // Set a flash message by passing the key, followed by the value, to req.flash().
//   req.flash(' Wrong credentials, try again');
//   res.redirect('/');
// });




app.get('/', (req, res) => {
  res.sendFile(path.join(_dirname , "/index.html"))
})
app.get('/about',auth, (req, res) => {

  // console.log(`this the cookie awasom ${req.cookies.jwt}`);

  res.sendFile(path.join(_dirname , "/about.html"))

})
app.get('/logout',auth, async(req, res) => {

  // console.log(`this the cookie awasom ${req.cookies.jwt}`);
      try {
        res.clearCookie("jwt");
      await req.user.save();
      console.log("logout successfully");
      res.sendFile(path.join(_dirname , "/index.html"))
      // res.render("index");
        
      } catch (error) {
        res.sendStatus(404).send(error);
        
      }
 
      // 
    

})



app.get('/contact', (req, res) => {
  res.sendFile(path.join(_dirname , "/contact.html"))
})
app.get('/expense',auth, (req, res) => {
  res.sendFile(path.join(_dirname , "/expense.html"))
})

app.get('/sign', (req, res) => {
  res.sendFile(path.join(_dirname , "/sign.html"))
})
// app.post("/sign", async (req,res)=>{
//   try {
    
//     console.log(req.body.FirstName);
//     res.send(req.body.FirstName);

//   } catch (error) {
//     res.status(400).send(error);
    
//   }

// })
  app.post('/sign', async(req, res)=>{
    try {
    const ema = req.body.Email
     
     
    //   res.sendFile(path.join(_dirname , "/contact.html"))
    //   })
    
    const pass = req.body.Password
    const cpass = req.body.ConfirmPassword
    const usemail =  await Sign.findOne({Email:ema});
    
    if (usemail) {
      res.status(201).send("this email already registered")
      
    }
    
    // else
    else { if(cpass!=pass){
        res.status(201).send("passwords are not matching")
      }
      // else if(cpass==pass){
      //   res.status(201).send("passwords are  matching")
      // }
      
      
    else {
      
      

        const myData = new Sign(req.body);
        const token = await myData.generateAuthToken();
        res.cookie("jwt",token,{
          expires:new Date(Date.now()+600000),
          httpOnly:true
        });
        // console.log("the token part"+token);
    myData.save().then(()=>{
    
      
    res.sendFile(path.join(_dirname , "/expense.html"))
    }).catch(()=>{
      res.status(400).send("item was not saved to the databse")
    })
}} }
    



 
      
      
    
//     var myData = new Sign(req.body);
//     myData.save().then(()=>{
//     // res.send("<script></script>")
//     res.sendFile(path.join(_dirname , "/about.html"))
//     }).catch(()=>{
//     res.status(400).send("item was not saved to the databse")
// })
  
  catch(error) { 
    res.status(404).send("could not signed up.try again");

  }
})
app.get('/gfg', (req, res) => {
  res.send(req.flash('message'));
});
  

app.post('/', async(req, res) => {
  try {
    const em = req.body.Email;
    const pas = req.body.Password;
    const useremail = await Sign.findOne({Email:em});
    const token = await useremail.generateAuthToken();

    res.cookie("jwt",token,{
      expires:new Date(Date.now()+600000),
      httpOnly:true
    });
    // console.log("the token part"+token);
    
    if (useremail.Password == pas) {
      res.status(201).sendFile(path.join(_dirname , "/expense.html"))

    } 
    else {
  //     req.flash('message', 'Wrong data ');
  // res.redirect('/gfg');
  res.status(201).send("invalid data");

      // res.render('index', { messages: req.flash('info') });
    }
    
  } catch (error) {
  //   req.flash('message', 'Welcome to Blog');
  //   res.send(req.flash('massage'));
  // res.redirect('/index.html');
  res.status(201).send("login to account first");
  }
 
  
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
