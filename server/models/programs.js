/* npm packages */
const mongoose = require("mongoose");

/* app imports */
const { APIError } = require("../helpers/APIError");
const { generateSlug } = require("../helpers/utils");

const Schema = mongoose.Schema;

const programSchema = new Schema(
  {
    careers: [String],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }], // array of [ _id ] that belong to Category
    createdAt: Date,
    credential: String,
    cip: String,
    code: String,
    institutionId: String,
    locations: [String],
    name: String,
    requestInfoEmail: String,
    transfers: [{ name: String, url: String, _id: false }],
    tuitionLink: String,
    tuitionRange: [String],
  }
  //   { timestamps: true }
);

programSchema.statics = {
  /**
   * Create a Single New Program
   * @param {String} subdomain
   * @param {Object} newProg - a single Program Object
   * @returns {Promise<Program, APIError>}
   */
  create(newProg) {
    return this.findOne({
      subdomain: newProg.subdomain,
      slug: newProg.slug,
      institutionId: newProg.institutionId,
    })
      .exec()
      .then((prog) => {
        /* first quick query to check if program exists, at which point throw a 409 */
        if (prog)
          return Promise.reject(
            new APIError(
              409,
              "Program Already Exists",
              `There is already a program with the slug '${newProg.slug}' and institution ID ${newProg.institutionId}`
            )
          );
        /* second query to save new program if no conflict */
        return newProg
          .save()
          .then((finalProg) => finalProg.toObject())
          .catch((error) =>
            Promise.reject(
              new APIError(500, "Database Error", `Internal DB Error: ${error}`)
            )
          );
      })
      .catch((error) => {
        /* catch the 409 conflict error, or alternatively a generic mongo error */
        let mongoError = error;
        if (!(mongoError instanceof APIError))
          mongoError = new APIError(
            500,
            mongoError.name,
            `Internal Database Error: ${mongoError}`
          );
        return Promise.reject(mongoError);
      });
  },
  /**
   * Create Multiple New Programs
   * @param {String} subdomain
   * @param {Object} newPrograms - Array with multiple Program Objects
   * @returns {Promise<Program, APIError>}
   */
  createMany(newPrograms, subdomain) {
    return this.deleteMany({ subdomain: subdomain })
      .then(() => {
        return this.insertMany(newPrograms).catch((error) => {
          /* catch the 409 conflict error, or alternatively a generic mongo error */
          let mongoError = error;
          if (!(mongoError instanceof APIError))
            mongoError = new APIError(
              500,
              mongoError.name,
              `Internal Database Error: ${mongoError}`
            );
          return Promise.reject(mongoError);
        });
      })
      .catch((error) => {
        /* catch the 409 conflict error, or alternatively a generic mongo error */
        let mongoError = error;
        if (!(mongoError instanceof APIError))
          mongoError = new APIError(
            500,
            mongoError.name,
            `Internal Database Error: ${mongoError}`
          );
        return Promise.reject(mongoError);
      });
  },
  /**
   * Delete a single program
   * @param {String} subdomain
   * @param {String} programSlug
   * @returns {Promise<Program, APIError>}
   */
  delete(subdomain, programSlug, institutionId) {
    const query = { subdomain, slug: programSlug };
    if (institutionId) {
      query.institutionId = institutionId;
    }
    return this.findOneAndRemove(query)
      .exec()
      .then((prog) => {
        if (prog) return true;
        throw new APIError(
          404,
          "Program Not Found",
          `No program with the slug '${programSlug}' ${
            institutionId ? `and institutionId ${institutionId}` : ""
          } found.`
        );
      })
      .catch((error) => {
        let mongoError = error;
        if (!(error instanceof APIError))
          mongoError = new APIError(
            500,
            mongoError.name,
            `Internal Database Error: ${mongoError}`
          );
        return Promise.reject(mongoError);
      });
  },
  /**
   * Get a single program
   * @param {String} subdomain
   * @param {String} programSlug
   * @param {Object} fields - fields query to filter by
   * @returns {Promise<Program, APIError>}
   */
  get({ subdomain, programSlug, institutionId }) {
    const query = { subdomain, slug: programSlug };
    if (institutionId) {
      query.institutionId = institutionId;
    }
    return this.findOne(query)
      .populate("categories", "name slug -_id")
      .exec()
      .then((program) => {
        if (program) return handleOnetConversion(program);

        const notFoundError = new APIError(
          404,
          "Program Not Found",
          `No program with the slug '${programSlug}' ${
            institutionId ? `and institution ID ${institutionId}` : ""
          } found.`
        );
        return Promise.reject(notFoundError);
      });
  },
  /**
   * Get a list of programs
   * @param {Object} query - pre-formatted query { subdomain: 'testsite' }
   * @param {Object} fields - which fields to select
   * @param {String} offset - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @param {String} sort - sort the results by desired fields
   * @returns {Promise<Programs, APIError>}
   */
  list({ query, fields, offset, limit, sortBy }) {
    const model = this;

    return model
      .countDocuments(query)
      .then((programCount) => {
        if (programCount === 0 && query.subdomain) {
          throw new APIError(
            404,
            "No programs Found",
            `No programs found matching your query on subdomain '${query.subdomain}'.`
          );
        }

        return model
          .find(query, fields)
          .collation({ locale: "en" })
          .skip(offset)
          .limit(limit)
          .sort(sortBy)
          .populate("categories", "name slug -_id")
          .exec()
          .then((programs) => {
            const programsList = {
              programs: programs.map((program) => {
                if (program.careers) return handleOnetConversion(program);
                return program;
              }),
              count: programCount,
            };
            return programsList;
          })

          .catch((error) => {
            let mongoError = error;
            if (!(error instanceof APIError))
              mongoError = new APIError(
                500,
                "Database Error",
                `Internal DB Error: ${error}`
              );
            return Promise.reject(mongoError);
          });
      })
      .catch((error) => {
        let mongoError = error;
        if (!(error instanceof APIError))
          mongoError = new APIError(
            500,
            "Database Error",
            `Internal DB Error: ${error}`
          );
        return Promise.reject(mongoError);
      });
  },
  /**
   * Patch/Update a single program
   * @param {String} subdomain
   * @param {String} programSlug
   * @param {Object} patchBody - the deserialized JSON body of the program attributes
   * @returns {Promise<Program, APIError>}
   */
  patch(subdomain, programSlug, patchBody, institutionId) {
    const query = { subdomain, slug: programSlug };
    if (institutionId) {
      query.institutionId = institutionId;
    }
    return this.findOne(query, { name: 1, credential: 1 })
      .lean()
      .exec()
      .then((currentProg) => {
        if (!currentProg)
          throw new APIError(
            404,
            "Program Not Found",
            `No program with the slug '${programSlug}' found.`
          );
        const updatedProg = patchBody;
        const { name, credential } = currentProg;

        /**
         * The following ugly block determines how to update the `slug` attribute.
         * Because name and credential are not required in the PATCH request, there
         * needs to be special handling for which part(s) of the slug to draw from the
         * new patch body, and which part(s) to draw from the database record.
         * NOTE: User changing the name/credential will alter the slug in the route for future requests
         */

        if (updatedProg.name && updatedProg.credential)
          /* user changed the name AND credential */
          updatedProg.slug = generateSlug(
            updatedProg.name,
            updatedProg.credential
          );
        else if (updatedProg.name && !updatedProg.credential)
          /* user changed the name but NOT the credential; use credential from database */
          updatedProg.slug = generateSlug(
            updatedProg.name,
            currentProg.credential
          );
        else if (!updatedProg.name && updatedProg.credential)
          /* user changed the credential but NOT the name; use name from database */
          updatedProg.slug = generateSlug(
            currentProg.name,
            updatedProg.credential
          );

        return this.findOneAndUpdate(query, patchBody, {
          new: true,
        })
          .exec()
          .then((prog) => {
            if (!prog)
              throw new APIError(
                404,
                "Program Not Found",
                `No program with the slug '${programSlug}' ${
                  institutionId ? `and institution ID ${institutionId}` : ""
                } found.`
              );
            return prog.toObject();
          });
      })
      .catch((error) => {
        let mongoError = error;
        if (!(error instanceof APIError))
          mongoError = new APIError(
            500,
            "Database Error",
            `Internal DB Error: ${error}`
          );
        return Promise.reject(mongoError);
      });
  },
  /**
   * Remove a list of Categories from a list of Programs. The inverse of applyCategoriesToPrograms.
   * @param {String} subdomain
   * @param {Array} progSlugs - array of programSlugs
   * @param {Object} category_id - the Mongo Object ID of the category (yes underscore is intentional) to apply
   * @returns {Promise<Program, APIError>}
   */
  removeCategoryFromPrograms(subdomain, progSlugs, category_id) {
    return this.updateMany(
      { subdomain, slug: { $in: progSlugs } },
      { $pull: { categories: category_id } }
    )
      .then((status) => {
        if (status.nModified == 0)
          return Promise.reject(
            new APIError(
              404,
              "Programs Not Found",
              "No programs corresponding to the requested slugs were found."
            )
          );
        else if (status.nModified !== progSlugs.length)
          return {
            warning:
              " Warning: Some of the requested program slugs were not found.",
          };

        return { warning: false };
      })
      .catch((error) => {
        let mongoError = error;
        if (!(error instanceof APIError))
          mongoError = new APIError(
            500,
            mongoError.name,
            `Internal Database Error: ${mongoError}`
          );
        return Promise.reject(mongoError);
      });
  },
};

// pass Mongoose Schema to a Mongoose Model for app use
module.exports = mongoose.model("Program", programSchema, "programs");
