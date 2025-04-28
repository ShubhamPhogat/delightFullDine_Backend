import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    require: true,
    unique: true,
  },
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
  wishList: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Book",
    default: [],
  },
  refresToken: {
    type: String,
    default: "",
  },
});

userSchema.pre("save", function async(next) {
  if (this.isModified("password")) {
    const hashedPassword = bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  }
});
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_WEB_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_WEB_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_WEB_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_WEB_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
