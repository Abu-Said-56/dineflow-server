const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;


// middleware
app.use(cors());
app.use(express.json());


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


    const infoCollection = client.db('RestaurantDB').collection('DBInfo');

    // get for all data from mongodb
    app.get('/all-foods', async(req, res) =>{
        const cursor = infoCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // find data id wise for show details
    app.get('/all-foods/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};

        const options = {
          // Include only the `title` and `imdb` fields in each returned document
            projection: {  name: 1, image: 1, category: 1,  quantity: 1, madeBy: 1, foodOrig :1, description: 1 },
          };
      

        const result = await infoCollection.findOne(query);
        res.send(result);
    })

    // For Parchase 
    

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