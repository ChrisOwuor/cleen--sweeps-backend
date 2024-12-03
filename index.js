const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const eventRoutes = require("./routes/eventRoutes");

const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log("MongoDB Connected");
    });
  })
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth/users", userRoutes);
app.use("/api/auth/organizations", organizationRoutes);
app.use("/api/invite", invitationRoutes);
app.use("/api/event", eventRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Community Clean-Up Coordination App");
});

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message,
  });
});
