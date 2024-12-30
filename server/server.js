import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Status endpoint
app.get("/status", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Service is running your face!!! hello, nick, i see you",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
