const express = require("express");
const cors = require("cors");
const PORT = process.env.port || 3000;
const app = express()
const jwt = require("jsonwebtoken")
require('dotenv').config();



//midddlewares
app.use(express.json())
app.use(cors());


const verifyJWT = (req,res,next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
    return  res.status(401).send({error:true,message:"unauthorized user"})
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token,process.env.JWT_SECRET, (error,decoded) => {
    if(error){ 
     return res.status(401).send({error:true,message:"unauthorized user"})
    }
    req.decoded = decoded;
    next()
  })
}


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud-2023.h8uagaz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    //collections
    const usersCollection = client.db('sportifyDB').collection('users');
    const classCollection = client.db('sportifyDB').collection('classes');
    
    app.post("/jwt", (req,res) => {
      const {email} = req.body;
      const token = jwt.sign({email} , process.env.JWT_SECRET,
        {expiresIn:"4h"}
        )
      res.send(token)
    })

  const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      if (user.role !== 'admin') {
        return res.status(403).send({ error: true, message: "forbiden" })
      }
      next()
    }
    
    app.get('/' , (req,res) => {
        res.send("i am sportigy camp")
    })


   

    //jwt token
    

    // create a new user
    app.post('/user', async(req,res) => {
     const user = req.body;
     const existingUser = await usersCollection.findOne({email:user.email})
     if(existingUser){
       return res.send("user already exist")
     }
     const result = await usersCollection.insertOne(user)
     res.send(result)
    })
    
    //verify admin role
    app.get('/user/admin/:email', verifyJWT, async (req,res) =>{
      const email = req.params.email;
      console.log(req.decoded.email,email)
      if(req.decoded.email !== email) {
       return  res.send({admin:false})
      }
      const query ={email:email}
      const user = await usersCollection.findOne(query)
      const result = {admin:user?.role === "admin"}
      console.log(result)
      res.send(result)
    })


    

    //verify instractor role
    app.get('/user/instructor/:email', verifyJWT, async (req,res) =>{
      const email = req.params.email;
       console.log(req.decoded.email,email)
      if(req.decoded.email !== email) {
       return res.send({instructor:false})
      }
      const query ={email:email}
      const user = await usersCollection.findOne(query)
      const result = {instructor:user?.role === "instructor"}
        console.log(result)
      res.send(result)
    })


 
    //add a class
    app.post("/add/class" , verifyJWT,  async (req,res) => {
       const data = req.body;
       const result = await classCollection.insertOne(data)
       res.send(result)
    })
  


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.listen(PORT , () => {
    console.log('app is runnig')
})