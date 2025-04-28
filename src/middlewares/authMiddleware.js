import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { config } from "dotenv";
import dotenvPath from "../../dotenvPath.js";

config({ path: dotenvPath });
console.log(process.env.ACCESS_WEB_TOKEN_SECRET);
export const verifyJWT = async (req, res, next) => {
  try {
    // user cookie will have access token or for mobile user cookies will not be there, so accesstoken will be present in header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("not token");
    }
    const decodeToken = jwt.verify(token, process.env.ACCESS_WEB_TOKEN_SECRET);
    console.log("this is edecode", decodeToken);

    //in user.model generateAccessToken. Our access token has ._id
    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      console.log("no user");
    }
    //like .send,.body, we make our own method as .user
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
};
