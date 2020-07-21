const mongoose = require('mongoose');

const HomeTestSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },

    testDescription: {
        type: String,
        required: true
    },
    acceptance: {
        type: Boolean,
        default: false
    },
    phone: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    desiredDate: {
        type:Number,
        required: true 
    },
    address: {
        type: String , 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lab: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lab',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true

    }
});

// Prevent user from booking more than one appointment for specific doctor
//AppointmentSchema.index({ doctor: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('HomeTest', HomeTestSchema);