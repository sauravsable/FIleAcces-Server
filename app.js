const express=require('express');
const mongoose=require('mongoose');
const bodyparser=require('body-parser');
const cors=require('cors');
const bcrypt=require("bcryptjs");
require('dotenv').config();

const port= process.env.PORT || 5000;
const link = process.env.MONGO_LINK;

const app=express();
mongoose.connect(link).then(()=> console.log("Database connected")).catch(err => console.log(err));

const usermodel=require('./models/user');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({origin:'http://localhost:3000',credentials:true}));

app.post("/register",async(req,res)=>{

    try{
        const check=await usermodel.findOne({email:req.body.email});

        if(check){
            res.json("exist");
        }
        else{
            req.body.password=await bcrypt.hash(req.body.password,10);
            let user=new usermodel(req.body);
            let data=await user.save();
            res.send(data);
        }
    }
    catch(e){
        res.json("not exist")
    }

});

app.post("/login",async(req,res)=>{

        const result=await usermodel.findOne({email:req.body.email});
        if(result){
            const ismatch=await bcrypt.compare(req.body.password,result.password);

            if(ismatch){
                if(result.email==="Admin@gmail.com"){
                    res.json({result,data:"admin"});
                }
                else{
                    res.json(result);
                }   
            }
            else{
                res.json('Notmatch');
            }
        }
        else{
            res.json("Notfound");
        }
    
});


app.post('/getusers', async (req, res) => {
    console.log(req.body);
    try {
      const data = await usermodel.find({ _id: { $ne: req.body.userId } });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching user data' });
    }
});

app.post('/getuserData', async (req, res) => {
    console.log(req.body);
    try {
      const data = await usermodel.findOne({ _id:req.body.userId});
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching user data' });
    }
});



app.put('/grantaccess', async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await usermodel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.access = true;
      await user.save();
      res.json("access granted");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating and saving user access' });
    }
});
 
app.put('/withdrawaccess', async (req, res) => {
    try {
      const userId = req.body.userId;
      const user = await usermodel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.access = false;
      await user.save();
      res.json("access withdraw");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating and saving user access' });
    }
});
  

app.listen(port,()=>{
    console.log("server started");
});