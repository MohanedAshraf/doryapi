import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add Username']
  },
  title: {
    type: String  
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  reviewed: {
    type: String,
    enum: ['doctor', 'lab'],
    required :true

  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lab: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lab',
  }
});

// Prevent user from submitting more than one review for specific doctor
//ReviewSchema.index({doctor: 1,user: 1}, {unique: true});

// Static method to get avg rating and save
ReviewSchema.statics.getDoctorAverageRating = async function (doctorId) {

 

    const obj = await this.aggregate([{
        $match: {
          doctor: doctorId
        }
      },
      {
        $group: {
          _id: '$doctor',
          averageRating: {
            $avg: '$rating'
          }
        }
      }
    ]);

    try {
      await this.model('Doctor').findByIdAndUpdate(doctorId, {
        averageRating: obj[0].averageRating
      });
    } catch (err) {
      console.error(err);
    }
  

};

ReviewSchema.statics.getLabAverageRating = async function (labId) {

const obj = await this.aggregate([{
  $match: {
    lab: labId
  }
},
{
  $group: {
    _id: '$lab',
    averageRating: {
      $avg: '$rating'
    }
  }
}
]);

try {
await this.model('Lab').findByIdAndUpdate(labId, {
  averageRating: obj[0].averageRating
});
} catch (err) {
console.error(err);
}

};
// Call getAverageCost after save
ReviewSchema.post('save', function () {
  if(this.reviewed === 'doctor')
  this.constructor.getDoctorAverageRating(this.doctor);
  if(this.reviewed === 'lab')
  this.constructor.getLabAverageRating(this.lab);

});

// Call getAverageCost before remove
ReviewSchema.pre('remove', function () {
  if(this.reviewed === 'doctor')
  this.constructor.getDoctorAverageRating(this.doctor);
  if(this.reviewed === 'lab')
  this.constructor.getLabAverageRating(this.lab);
});

export default mongoose.model('Review', ReviewSchema);