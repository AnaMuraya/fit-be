const express = require("express");
const cors = require("cors");

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded

const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
const Role = db.role;

//open mongoose connection to MongoDB
db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Successfully connected to MongoDB`);
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

//creating the two rows in roles collection
const initial = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({ name: "user" }).save((err) => {
        err && console.log("error", err);
        console.log(`Added user to roles collection`);
      });
      new Role({ name: "admin" }).save((err) => {
        err && console.log("error", err);
        console.log(`Added admin to roles collection`);
      });
    }
  });
};

//routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to fitness application" });
});
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
