import mongoose from 'mongoose';

const ElectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the election'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  candidates: {
    type: [String],
    required: [true, 'Please provide at least one candidate'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one candidate must be specified'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Election || mongoose.model('Election', ElectionSchema);
