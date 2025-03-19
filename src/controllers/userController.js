const User = require("../models/User");

// Add User
exports.addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      passwordHash,
      role,
      accountStatus,
      personalDetails,
      paymentMethods,
    } = req.body;

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || "customer",
      accountStatus: accountStatus || "active",
      personalDetails: {
        phoneNumber: personalDetails?.phoneNumber || "",
        country: personalDetails?.country || "",
        city: personalDetails?.city || "",
        state: personalDetails?.state || "",
        postalCode: personalDetails?.postalCode || "",
      },
      paymentMethods: paymentMethods || [],
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "Error creating user", details: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { personalDetails, ...updateData } = req.body;

    if (personalDetails) {
      updateData.personalDetails = {
        phoneNumber: personalDetails.phoneNumber || "",
        country: personalDetails.country || "",
        city: personalDetails.city || "",
        state: personalDetails.state || "",
        postalCode: personalDetails.postalCode || "",
      };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating user", details: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting user", details: error.message });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching user details", details: error.message });
  }
};

// Get Users
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const accountStatus = req.query.accountStatus || "";

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role && role !== "all") {
      query.role = role;
    }
    if (accountStatus && accountStatus !== "all") {
      query.accountStatus = accountStatus;
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      users,
      currentPage: page,
      totalPages,
      totalUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching users", details: error.message });
  }
};

// Update User Role and Status
exports.updateUserRoleAndStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, accountStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role, accountStatus },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: "Error updating user role and status",
      details: error.message,
    });
  }
};
