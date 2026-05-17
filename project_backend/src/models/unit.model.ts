import mongoose, { Document, Schema } from "mongoose";
import { Unit } from "../types/unit";

export interface UnitDocument extends Document, Omit<Unit, "id"> {}

const unitSchema = new Schema<UnitDocument>(
  {
    unit_name: { type: String, required: true },
  },
  { timestamps: true }
);

export const UnitDB = mongoose.model<UnitDocument>("Unit", unitSchema, "Units");
