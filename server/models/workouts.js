import mongoose from "mongoose";

const Schema = mongoose.Schema;

const workoutSchema = new Schema({
  user: String,
  avgHeartRate: Number,
  bodyRegion: String,
  caloriesExpended: Number,
  date: Date,
  difficulty: String,
  distanceMi: Number,
  durationMs: Number,
  equipment: [String],
  preWorkoutMacros: Object,
  location: String,
  notes: String,
  reps: Number,
  restTimeMs: Number,
  sleepHrs: Number,
  targetMuscle: String,
  timeOfDay: String,
  workoutId: String,
  workoutName: String,
  workoutType: String,
  workoutWeight: Number,
  workoutVariations: [String],
});

workoutSchema.statics = {
  list({ query, fields, skip, limit }) {
    return this.find(query, fields)
      .skip(skip)
      .limit(limit) // add .sort() in the future.
      .exec()
      .then((workouts) => {
        if (workouts.length === 0) {
          throw new Error("No workouts matching your query.");
        }
        return workouts.map((workout) => workout.toObject());
      })
      .catch((error) => {
        console.error("Database Error:", error); // Optionally log the error
        return Promise.reject(
          new Error(`Database Error: ${error.message || error}`)
        );
      });
  },
};

export default mongoose.model("Workout", workoutSchema, "workouts");
