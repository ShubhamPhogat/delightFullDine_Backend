import { User } from "../models/userModel.js";
import bcryptjs from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    let { firstName, lastName, email, userName, phone, password, role } =
      req.body;

    console.log(lastName, firstName, email, phone, userName, password);

    // Set default role if not provided
    if (!role) {
      role = "user";
    }

    // Validate required fields
    if (!firstName || !email || !userName || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("user exists");
      return res.status(409).json({ message: "User already exists" }); // Changed status code
    }

    // Hash the password
    const saltRounds = 12; // Increased salt rounds for better security
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      firstName,
      lastName, // Added lastName to the user creation
      email,
      userName,
      phone,
      password: hashedPassword,
      role,
    });

    // Save the user
    const savedUser = await newUser.save();
    console.log("new user saved", savedUser._id);

    // Remove password from response
    const userResponse = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      userName: savedUser.userName,
      phone: savedUser.phone,
      role: savedUser.role,
    };

    return res.status(201).json({
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({
      message: "Internal server error - failed to register user",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const validateUser = await User.findOne({ email });
    if (!validateUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordCorrect = await bcryptjs.compare(
      password,
      validateUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const refreshToken = await validateUser.generateRefreshToken();
    const accessToken = await validateUser.generateAccessToken();

    // Update user with refresh token
    await User.findByIdAndUpdate(
      validateUser._id,
      { $set: { refreshToken } }, // Fixed typo: was 'refresToken'
      { new: true, runValidators: false }
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    // Get logged in user without password and refreshToken
    const loggedInUser = await User.findById(validateUser._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options) // Fixed typo: was 'refresToken'
      .json({
        message: "Login successful",
        data: {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
      });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: 1 }, // Remove field from document
      },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await User.findOneAndDelete({ email });

    if (result) {
      console.log(`User with email ${email} has been deleted successfully.`);
      return res.status(200).json({
        success: true,
        message: `User with email ${email} deleted successfully.`,
      });
    } else {
      console.log(`User with email ${email} not found.`);
      return res.status(404).json({
        success: false,
        message: `User with email ${email} not found.`,
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting user.",
      error: error.message,
    });
  }
};
