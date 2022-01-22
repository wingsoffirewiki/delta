/** @format */

import { model, Schema } from "mongoose";

const schema = new Schema({
  _id: String,
  scales: { type: Number, default: 0 },
  banned: { type: Boolean, default: false },
  enablePayments: { type: Boolean, default: true }
});

export default model("User", schema);
