import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  let { firstName, lastName, email, userName, phone, password, role } =
    req.body;

  console.log(lastName, firstName, email, phone, userName, password);
  if (!role) {
    role = "user";
  }

  if (!firstName || !email || !userName || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("user exists");
    return res.status(200).json({ message: "user already exisita" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await new User({
    firstName,
    email,
    userName,
    phone,
    password: hashedPassword,
    role,
  });
  await newUser.save({ validateBeforeSave: false }).then(() => {
    console.log("new user saved", newUser._id);
  });
  const chqUser = await User.findById(newUser._id);

  if (chqUser) {
    console.log(chqUser);
    return res.status(200).json({ data: chqUser });
  } else {
    return res
      .status(500)
      .json({ message: "internal error fialed to register user" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const validateUser = await User.findOne({
    email,
  });
  if (!validateUser) {
    return res.status(400).json({ message: "wrong credentials" });
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    validateUser.password
  );
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "wrong credentials pass" });
  }

  const refresToken = await validateUser.generateRefreshToken();
  const accessToken = await validateUser.generateAccessToken();
  try {
    await User.findByIdAndUpdate(
      validateUser._id,
      { $set: { refresToken } },
      { new: true, runValidators: false }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    const loggedInUser = await User.findById(validateUser._id)
      .select("-password -refreshToken")
      .then(() => {
        return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refresToken", refresToken, options)
          .json({ data: { validateUser, refresToken, accessToken } });
      })
      .catch((err) => {
        console.log("error in login", err);
      });
  } catch (error) {
    console.log(error);
  }
};

export const loggoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, //remove field from document-> error for $set refreshToken: undefined
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "logout successful" });
};

export const deleteUserByEmail = async (req, res) => {
  const email = req.body.email;
  try {
    // Assuming you have a User model imported
    const result = await User.findOneAndDelete({ email });

    if (result) {
      console.log(`User with email ${email} has been deleted successfully.`);
      return { success: true, message: `User with email ${email} deleted.` };
    } else {
      console.log(`User with email ${email} not found.`);
      return { success: false, message: `User with email ${email} not found.` };
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Error deleting user.", error };
  }
};
