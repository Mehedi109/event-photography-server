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
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");

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
      const eventName = req.body.eventName;
      const price = req.body.price;
      const hour = req.body.hour;
      const image = req.files.image;
      const picData = image.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const categories = {
        eventName,
        price,
        hour,
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

    // delete api for categories
    app.delete("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await categoriesCollection.deleteOne(query);
      res.send(result);
    });

    // post api of orders
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      console.log(result);
      res.json(result);
    });

    // get api for orders of login user
    app.get("/myOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    // get api for orders
    app.get("/orders", async (req, res) => {
      const cursor = await ordersCollection.find({}).toArray();
      res.send(cursor);
    });
    // delete api for orders
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    // post api for review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
    });

    // get api for review
    app.get("/review", async (req, res) => {
      const review = reviewCollection.find({});
      const result = await review.toArray();
      res.send(result);
      // console.log(review);
    });

    // get api for orders of login user
    app.get("/myOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    // post api for users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const cursor = await usersCollection.insertOne(user);
      res.send(cursor);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running the server");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
