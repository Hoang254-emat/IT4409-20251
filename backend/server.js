// Cài đặt thư viện dotenv: npm install dotenv [cite: 114]
require("dotenv").config(); // Đọc thông tin từ file .env [cite: 115]
const express = require("express"); // [cite: 116]
const mongoose = require("mongoose"); // [cite: 117]
const cors = require("cors"); // [cite: 118]

const app = express(); // [cite: 119, 120]

// Middleware
app.use(cors()); // Cho phép truy cập từ các domain khác (Frontend) [cite: 121]
app.use(express.json()); // Hỗ trợ đọc dữ liệu định dạng JSON từ request [cite: 122]

// Kết nối MongoDB sử dụng biến môi trường MONGO_URI [cite: 123, 124]
mongoose
  .connect(process.env.MONGO_URI) 
  .then(() => console.log("Connected to MongoDB")) // [cite: 125]
  .catch((err) => console.error("MongoDB Error:", err)); // [cite: 126]

// Định nghĩa Schema và Model người dùng
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, trim: true },
  age: { type: Number, required: true, min: 0 },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  address: { type: String },
});
const User = mongoose.model("User", UserSchema);

// --- CÁC API CRUD ---

// 1. API Lấy danh sách người dùng (Phân trang + Tìm kiếm)
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

// 2. API Thêm người dùng mới
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

// 3. API Cập nhật người dùng
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

// 4. API Xóa người dùng
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

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});