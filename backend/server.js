const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const e = require("express");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// Kết nối MongoDB 
mongoose
  .connect("mongodb+srv://20225190:20225190@cluster0.bu0uywg.mongodb.net/?appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

// Định nghĩa schema và model người dùng
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, trim: true },
  age: { type: Number, required: true, min: 0 },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  address: { type: String },
});
const User = mongoose.model("User", UserSchema);

// API get
app.get("/api/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ page, limit, total, totalPages, data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API post
app.post("/api/users", async (req, res) => {
  try {
    const { name, age, email, address } = req.body;
    const newUser = await User.create({ name, age, email, address });

    res.status(201).json({
        message: "User created successfully",
        user: newUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// API put
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, email, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, age, email, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// API delete
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});