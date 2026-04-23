const bcrypt = require("bcrypt");
const UserModel = require("../model/UserModel");

exports.changePasswordWithoutToken = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    console.log("🔐 Change Password Request for:", email);

    // 1. Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // 3. Check new/confirm match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 4. Prevent same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    // 5. Update password only
    user.set("password", newPassword);
    await user.save({ validateBeforeSave: true });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Change password error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
