const express = require("express");
const cors = require("cors");
const PORT = process.env.port || 3000;
const app = express()
require('dotenv').config();



//midddlewares
app.use(express.json())
app.use(cors());




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
    

    app.get('/' , (req,res) => {
        res.send("i am sportigy camp")
    })

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