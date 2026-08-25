import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["manager", "driver", "rental_owner"], default: "driver", required: true },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    photo: { type: String, default: "" },
    licence: { type: String, default: "" },
    licenceExpiry: { type: String, default: "" },
    licenceClass: { type: String, default: "" },
    issueDate: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    employmentStatus: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
