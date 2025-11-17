import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminUser {
  _id?: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'manager';
  created_at?: Date;
  updated_at?: Date;
}

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager'], default: 'manager' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
AdminUserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const AdminUser: any =
  mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

export default AdminUser;

