import mongoose from 'mongoose'

const AppointmentSchema = new mongoose.Schema({
  patientNumber: {
    type: Number
  },
  patientName: {
    type: String
  },
  sessionBegun: {
    type: Boolean,
    default: false
  },
  phone: {
    type: Number
  },
  age: {
    type: Number
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  schedule: {
    type: mongoose.Schema.ObjectId,
    ref: 'Schedule',
    required: true
  }
})

export default mongoose.model('Appointment', AppointmentSchema)
