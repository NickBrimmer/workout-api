const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const workoutSchema = new Schema({});

// methods on your validating model
workoutSchema.statics = {};

module.exports = mongoose.model("Workout", workoutSchema, "workouts");
