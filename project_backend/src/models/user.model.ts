import mongoose, { Schema, HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

// Plain data shape for a user (matches src/types/users.ts except `id` which is provided by mongoose)
export interface UserDocument extends Document {
  name: string;
  "date of birth": string;
  role: string;
  email: string;
  password: string;
}

// Document type (mongoose document with methods + fields)

const userSchema = new Schema<UserDocument>({
  name: String,
  "date of birth": String,
  role: String,
  email: String,
  password: String,
});

// Hash password before saving user document
const SALT_ROUNDS = 10;

userSchema.pre("save", async function (next) {
  const user = this as HydratedDocument<UserDocument>;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (err) {
    next(err as any);
  }
});

// Export model typed with the plain User shape; document helpers/types are available via UserDocument
export const UserDB = mongoose.model("User", userSchema, "users");
