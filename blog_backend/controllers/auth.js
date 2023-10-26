import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const register = async (req, res) => {
  try {
    // Check existing user
    const checkUserQuery = "SELECT * from users WHERE email=? OR username=?";
    const existingUsers = await db.query(checkUserQuery, [req.body.email, req.body.username]);

    if (existingUsers.values.length) {
      return res.status(409).json("User already exists");
    }

    // Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const insertUserQuery = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
    const values = [req.body.username, req.body.email, hash];

    await db.query(insertUserQuery, [values]);
    return res.status(200).json("User has been created.");
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(404).json("User not found!");
    }

    // Check the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json("Wrong username or password!");
    }

    // Create and send a JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    const { password: userPassword, ...userWithoutPassword } = user;

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(userWithoutPassword);
  } catch (error) {
    // Handle errors using error-handling middleware or custom error responses
    res.status(500).json(error.message);
  }
};

export const logout = (req, res) => {};

const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE username = ?";

    db.query(query, [username], (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.length > 0 ? data[0] : null);
      }
    });
  });
};
