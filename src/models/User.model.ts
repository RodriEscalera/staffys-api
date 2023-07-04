import { Schema, Types, model } from "mongoose";
import { hash, genSalt, compare } from "bcrypt";
import crypto from "crypto";
import { User } from "../types/user.types";

export interface UserModelProps extends User, Document {
  _id: Types.ObjectId;
  hashPassword: (password: string, salt: string) => Promise<string>;
  validatePassword: (password: string) => Promise<boolean>;
  generateResetPasswordCode: () => Promise<string>;
  resetPassword: (code: string, password: string) => Promise<void>;
}

const UserSchema = new Schema<UserModelProps>(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    salt: { type: String },
    is_admin: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    urlphoto: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    resetToken: { type: String, default: null },
    pendingPackages: [
      { type: Schema.Types.ObjectId, ref: "Package", default: [] },
    ],
    currentPackage: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },
    historyPackages: [
      { type: Schema.Types.ObjectId, ref: "Package", default: [] },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.hashPassword = async function (
  password: string,
  salt: string
) {
  const hashedPassword = await hash(password, salt);
  return hashedPassword;
};

UserSchema.methods.validatePassword = async function (password: string) {
  const isMatch = await compare(password, this.password);
  return isMatch;
};

UserSchema.methods.generateResetPasswordCode = async function () {
  const code = crypto.randomInt(100000, 1000000).toString();
  const hashedCode = await this.hashPassword(code, this.salt);
  this.resetToken = hashedCode;
  await this.save();
  return code;
};

UserSchema.methods.resetPassword = async function (
  code: string,
  newPassword: string
) {
  if (code.length !== 6) throw new Error("Invalid code");

  const isMatch = await compare(code, this.resetToken);

  if (!isMatch) {
    throw new Error("Invalid code");
  }

  const hashedPassword = await this.hashPassword(newPassword, this.salt);

  this.password = hashedPassword;
  this.resetToken = undefined;

  await this.save();
};

UserSchema.pre<UserModelProps>("save", async function () {
  try {
    const salt = await genSalt();
    const hashedPassword = await this.hashPassword(this.password, salt);

    this.salt = salt;
    this.password = hashedPassword;
  } catch (error) {
    console.error(error);
  }
});

const User = model<UserModelProps>("Users", UserSchema);

export default User;
