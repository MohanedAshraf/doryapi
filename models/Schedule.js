const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({

  bookSystem: {
    type: String,
    enum: ['byNumber', 'byTime'],
  },
  currentNumber: Number,
  totalNumber: Number,
  sessionCost: Number,
  startedAt: {
    type: Number,
  },
  endedAt: {
    type: Number,
  },

  time: String,
  day: String,
  formate: {
    type: String,
    enum: ['pm', 'am']
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: true
  },
  
});

module.exports = mongoose.model('Schedule', ScheduleSchema);