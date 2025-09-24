import mongoose from 'mongoose';
import crypto from 'crypto';

const VoteSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: [true, 'Election is required'],
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Voter is required'],
  },
  candidate: {
    type: String,
    required: [true, 'Selected candidate is required'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  transactionHash: {
    type: String,
    default: function() {
      // Generate a simulated blockchain transaction hash
      // In a real implementation, this would be the actual blockchain transaction hash
      const data = this.electionId + this.voterId + this.candidate + Date.now();
      return crypto.createHash('sha256').update(data).digest('hex');
    }
  }
});

// Ensure a voter can only vote once per election
VoteSchema.index({ electionId: 1, voterId: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
