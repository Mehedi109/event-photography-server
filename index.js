const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ppmn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("event-photography");
    const categoriesCollection = database.collection("categories");
    const ordersCollection = database.collection("orders");

    // get api of categories
    app.get("/categories", async (req, res) => {
      const cursor = await categoriesCollection.find({}).toArray();
      res.send(cursor);
    });

    // get api of categories for specific id
    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await categoriesCollection.findOne(query);
      res.send(result);
    });

    app.post("/addCategories", async (req, res) => {
      //   const categories = req.body;
      console.log(req.body);
      const name = req.body.name;
      const price = req.body.price;
      const image = req.files.image;
      const picData = image.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const categories = {
        name,
        price,
        image: imageBuffer,
      };
      const result = await categoriesCollection.insertOne(categories);
      console.log(result);
      res.json(result);
    });

    // post api of orders
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      console.log(result);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
