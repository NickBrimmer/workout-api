import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";

import workoutsRouter from "./routes/index.js";

const host = process.env.MONGO_HOST || "localhost";
const port = process.env.MONGO_PORT || "27017";
const dbName = process.env.MONGO_DB_NAME || "workout-database";
const username = encodeURIComponent(process.env.MONGO_USER || "");
const password = encodeURIComponent(process.env.MONGO_PASS || "");
const authSource = process.env.MONGO_AUTH_DB || "";
const ssl = process.env.MONGO_SSL === "true";

dotenv.config();
const changingId = uuidv4();

const app = express(helmet());

const PORT = process.env.PORT || 3000;

// Status endpoint
app.use("/status", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: `This API is working ${changingId}`,
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/workouts", workoutsRouter);

mongoose.Promise = Promise;

const options = [];
if (ssl) {
  options.push("ssl=true");
}
if (authSource) {
  options.push(`authSource=${authSource}`);
}
const optionsString = options.length > 0 ? `?${options.join("&")}` : "";
const credentials = username && password ? `${username}:${password}@` : "";
const connectionString = `mongodb://${credentials}${host}:${port}/${dbName}${optionsString}`;
console.log("connectionString", connectionString);
mongoose
  .connect(connectionString, {
    appname: "workout-api",
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
