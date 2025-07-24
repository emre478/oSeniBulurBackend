const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../Models/userModel");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("🟢 Gelen veriler:", { username, email, password });

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log("🟡 Kullanıcı zaten var");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, email, hashedPassword);

    console.log("✅ Yeni kullanıcı oluşturuldu:", user);
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error("❌ Hata:", err); // 👈 burada detaylı hatayı göreceğiz
    res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login };
