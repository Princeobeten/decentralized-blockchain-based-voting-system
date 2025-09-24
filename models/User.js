import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  walletAddress: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter',
  },
  passwordHash: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Add validation to ensure either email/password OR walletAddress is provided
UserSchema.pre('validate', function(next) {
  if ((this.email && this.passwordHash) || this.walletAddress) {
    next();
  } else {
    next(new Error('Either email/password OR wallet address must be provided'));
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
