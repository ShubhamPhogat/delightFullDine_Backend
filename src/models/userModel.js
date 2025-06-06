import mongoose from "mongoose";
import bcryptjs from "bcryptjs"; // Changed to bcryptjs to match controller
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    default: "User",
  },
  wishList: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  refreshToken: {
    // Fixed typo: was 'refresToken'
    type: String,
    default: "",
  },
});

// REMOVED THE PRE-SAVE HOOK - This was causing double hashing!
// Since you're manually hashing in the controller, we don't need this

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
