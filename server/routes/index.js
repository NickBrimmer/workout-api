import express from "express";
import { findAll } from "../handlers/workouts/index.js";

const workoutsRouter = express.Router();

workoutsRouter.get("/", findAll);

export default workoutsRouter;
