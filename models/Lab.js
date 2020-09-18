import mongoose from 'mongoose';
import slugify from 'slugify';
import geocoder from '../utils/geocoder.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const LabSchema = new mongoose.Schema({
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
        branch: [{

            address: {
                type: String,
                required: [true, 'Please add an address']
            },
            phone: {
                type: String,
                maxlength: [20, 'Phone number can not be longer than 20 characters']
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
                }
            }

        }],

        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },

        openingHours: {
            type: [{
                day: {
                    type: String,
                    required: true
                },
                start: {
                    type: Number,
                    required: true
                },
                end: {
                    type: Number,
                    required: true
                }

            }],
            required: true
        },

        role: {
            type: String,
            enum: ['lab'],
            default: 'lab'
        },
    
        test: {

            type: [{
                testName: {
                    type: String,
                    required: true
                },
                testPrice: {
                    type: Number,
                    required: true
                }
            }],

            required: true

        },
        scan: {

            type: [{
                scanName: {
                    type: String,
                    required: true
                },
                scanPrice: {
                    type: Number,
                    required: true
                }
            }],

            required: true

        },
        averageRating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating must can not be more than 10']
        },

        photo: {
            type: String,
            default: 'no-photo.jpg'
        },
        homeTest: {
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
        },


    }

);
// Encrypt password using bcrypt
LabSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
LabSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};


// Create Lab slug from the name
LabSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
});

// Geocode & create location field
// LabSchema.pre('save', async function (next) {
//     const branches = this.branch;
//     for (const branch of branches){
//         const loc = await geocoder.geocode(branch.address);
//         branch.location = {
//             type: 'Point',
//             coordinates: [loc[0].longitude, loc[0].latitude],
//             formattedAddress: loc[0].formattedAddress,
//             street: loc[0].streetName,
//             city: loc[0].city,
//             state: loc[0].stateCode,
//             zipCode: loc[0].zipCode,
//             country: loc[0].countryCode
//         };
//     }

//   this.branch = branches ;
    
//     next();
// });


// Match user entered password to hashed password in database
LabSchema.methods.matchPassword = async function (enteredPassword) {

    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('lab', LabSchema); 