const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aea2zks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentCollection = client
      .db("learnersDB")
      .collection("assignments");
    const submissionsCollection = client
      .db("learnersDB")
      .collection("submissions");

    // assignments apis
    app.get("/assignments", async (req, res) => {
      const result = await assignmentCollection.find().toArray();
      res.send(result);
    });
    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });

    app.post("/assignments", async (req, res) => {
      const assignmentData = req.body;
      const result = await assignmentCollection.insertOne(assignmentData);
      res.send(result);
    });
    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const assignmentData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDocs = {
        $set: {
          ...assignmentData,
        },
      };
      const result = await assignmentCollection.updateOne(
        query,
        updateDocs,
        options
      );
      res.send(result);
    });

    // submissions api
    app.get("/submissions", async (req, res) => {
      const result = await submissionsCollection.find().toArray();
      res.send(result);
    });

    app.post("/submissions", async (req, res) => {
      const submissionData = req.body;
      const result = await submissionsCollection.insertOne(submissionData);
      res.send(result);
    });

    // get all submitted assignment by Specefic User
    app.get("/submissions/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await submissionsCollection.find(query).toArray();
      res.send(result);
    });

    // get all pending assignment from data
    app.get("/pendings", async (req, res) => {
      const query = { status: "pending" };
      const result = await submissionsCollection.find(query).toArray();
      res.send(result);
    });

    // updated submitted assignments status
    app.patch("/submissions/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDocs = {
        $set: {
          ...status,
        },
      };
      const result = await submissionsCollection.updateOne(query, updateDocs);
      res.send(result);
    });

    // get all assignments data for pagination
    app.get("/all-assignments", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      console.log(size, page);
      let query = {};
      if (filter) query = { level: filter };

      const result = await assignmentCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // get all assignments data count
    app.get("/assignments-count", async (req, res) => {
      const filter = req.query.filter;
      let query = {};
      if (filter) query = { level: filter };
      const count = await assignmentCollection.countDocuments(query);
      res.send({ count });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("studybuddy server is running");
});
app.listen(port, () => {
  console.log(`study server running on port ${port}`);
});
