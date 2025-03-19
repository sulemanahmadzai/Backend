const User = require("../models/User");
const bcrypt = require("bcrypt");

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-passwordHash -twoFactorSecret"
    );
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching profile." });
  }
};
// Get User Profile



exports.updateProfile = async (req, res) => {
  const { name, phoneNumber, country, city, state, postalCode } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    console.log(user);
    // Update basic profile fields
    if (name !== undefined) user.name = name;

    // Ensure personalDetails is initialized
    if (!user.personalDetails) {
      user.personalDetails = {};
    }

    // Update personal details subdocument
    if (phoneNumber !== undefined)
      user.personalDetails.phoneNumber = phoneNumber;
    if (country !== undefined) user.personalDetails.country = country;
    if (city !== undefined) user.personalDetails.city = city;
    if (state !== undefined) user.personalDetails.state = state;
    if (postalCode !== undefined) user.personalDetails.postalCode = postalCode;

    // Save the updated user document
    await user.save();

    res.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating profile." });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new password required." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Assuming passwordHash stores bcrypt hash
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ error: "Current password is incorrect." });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error changing password." });
  }
};
