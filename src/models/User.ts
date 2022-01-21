/** @format */

import { model, Schema } from "mongoose";

const schema = new Schema({
  _id: String,
  scales: Number,
  banned: Boolean,
  enablePayments: Boolean
});

export default model("User", schema);
