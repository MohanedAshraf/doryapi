import mongoose from 'mongoose'
import slugify from 'slugify'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description can not be more than 500 characters']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  zipcode: {
    type: String
  },
  averageSessionTime: {
    type: Number
  },
  role: {
    type: String,
    enum: ['doctor'],
    default: 'doctor'
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    street: String,
    city: String,
    state: String,
    appartement: String,
    floor: String
  },
  speciality: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      'Dermatology',
      'Dentistry',
      'Psychiatry',
      'Pediatrics and New Born',
      'Neurology',
      'Orthopedics',
      'Gynaecology and Infertility',
      'Ear, Nose and Throat',
      'Cardiology and Vascular Disease',
      'Allergy and Immunology',
      'Andrology and Male Infertility',
      'Audiology',
      'Cardiology and Thoracic Surgery',
      'Chest and Respiratory',
      'Diabetes and Endocrinology',
      'Dietitian and Nutrition',
      'Family Medicine',
      'Gastroenterology and Endoscopy',
      'General Practice',
      'General Surgery',
      'Geriatrics',
      'Hematology',
      'Internal Medicine',
      'IVF and Infertility',
      'Nephrology',
      'Neurosurgery',
      'Obesity and Laparoscopic Surgery',
      'Oncology',
      'Oncology Surgery',
      'Ophthalmology',
      'Osteopathy',
      'Pain Management',
      'Pediatric Surgery',
      'Phoniatrics',
      'Physiotherapy and Sport Injuries',
      'Plastic Surgery',
      'Rheumatology',
      'Spinal Surgery',
      'Urology',
      'Vascular Surgery'
    ]
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must can not be more than 10']
  },
  sessionCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  homeConsultation: {
    type: Boolean,
    default: false
  },
  accountStatus: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
// Encrypt password using bcrypt
DoctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Sign JWT and return
DoctorSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// Create doctor slug from the name
DoctorSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// Geocode & create location field
// DoctorSchema.pre('save', async function(next) {
//   const loc = await geocoder.geocode(this.address);
//   this.location = {
//     type: 'Point',
//     coordinates: [loc[0].longitude, loc[0].latitude],
//     formattedAddress: loc[0].formattedAddress,
//     street: loc[0].streetName,
//     city: loc[0].city,
//     state: loc[0].stateCode,
//     zipCode: loc[0].zipCode,
//     country: loc[0].countryCode
//   };
//   // Do not save address in DB
//   this.address = undefined;
//   next();
// });

// Match user entered password to hashed password in database
DoctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('Doctor', DoctorSchema)
