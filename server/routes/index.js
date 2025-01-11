import express from "express";
import Workout from "../models/workouts.js";

const workoutsRouter = express.Router();

// GET all workouts
workoutsRouter.get("/", async (req, res) => {
  try {
    const workouts = await Workout.list({
      query: {},
      fields: {},
    });
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workouts", error });
  }
});

export default workoutsRouter;
