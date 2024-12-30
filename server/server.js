import express from "express";
import dotenv from "dotenv";
// import { message } from "./message.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Status endpoint
app.get("/status", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "This API is working you fool! PS, your face.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
