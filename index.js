const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken")
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;


// middleware
app.use(cors());
app.use(express.json());

//verify token , token save localstorage
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.szzkw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // use for add json data on backend
    const infoCollection = client.db('RestaurantDB').collection('DBInfo');

    // Create collectin for and user Informations
    const foodCollection = client.db('RestaurantDB').collection('Food');


     //jwt
     app.post("/jwt", async (req, res) => {
      const userEmail = req.body
      // console.log(userEmail)
      const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN, {
        expiresIn: '10d'
      })
      res.send({ token })
    })


    // get for all data from mongodb
    app.get('/all-foods', async (req, res) => {
      const cursor = infoCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // For update operation
    app.get('/foods/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await foodCollection.findOne(query);
      res.send(result);
    })

    // For Update operation
    app.put('/foods/:id', async(req,res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const options = {upsert: true};
      const UpdatedFoods = req.body;
      
      const Foods = {
        $set:{
          foodname:UpdatedFoods.foodname,
          quantity:UpdatedFoods.quantity,
          price:UpdatedFoods.price, 
          buyername:UpdatedFoods.buyername, 
          buyeremail:UpdatedFoods.buyeremail, 
          buyingdate:UpdatedFoods.buyingdate, 
          photoURL:UpdatedFoods.photoURL,
        }
      }
      const result = await foodCollection.updateOne(query, Foods, options);
      res.send(result)
    })

    // find data id wise for show details
    app.get('/all-foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        // Include only the `title` and `imdb` fields in each returned document
        projection: { name: 1, image: 1, category: 1, quantity: 1, madeBy: 1, foodOrig: 1, description: 1 },
      };
      const result = await infoCollection.findOne(query);
      res.send(result);
    })

    // For read user data from mongodb
    app.get('/foods', async(req,res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result); 
  })


    // using post operation for post food items on mongodb
    app.post('/foods', async (req, res) => {
      const addFoodItems = req.body;
      console.log(addFoodItems);
      const result = await foodCollection.insertOne(addFoodItems)
      res.send(result);
    })

    // Delete foods items 
    app.delete('/foods/:id', async (req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Art and craft server is running')
})

app.listen(port, () => {
  console.log(`Art and Craft Server is running on port: ${port}`)
})