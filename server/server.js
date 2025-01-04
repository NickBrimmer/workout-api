import express from "express";
import dotenv from "dotenv";

import { v4 as uuidv4 } from "uuid";

dotenv.config();
const changingId = uuidv4();

const app = express();
const PORT = process.env.PORT || 3000;

// Status endpoint
app.get("/status", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: `This API is working ${changingId}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
