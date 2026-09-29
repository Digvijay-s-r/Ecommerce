const mongoose = require("mongoose");

const userPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate assignment of the same role to the same user
userPermissionSchema.index({ userId: 1, roleId: 1 }, { unique: true });

const UserPermission = mongoose.model("UserPermission", userPermissionSchema);

module.exports = UserPermission;
