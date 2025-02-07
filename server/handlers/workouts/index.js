// const { Validator } = require("jsonschema");
// const { Serializer } = require("../../serializers/jsonapi");

// const { APIError } = require("../../helpers/APIError");
// const Site = require("../../models/site");
// const utils = require("../../helpers/utils");
import Workout from "../../models/workouts.js";

export async function findAll(req, res) {
  try {
    const workouts = await Workout.list({
      query: {},
      fields: {},
    });
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workouts", error });
  }
}
