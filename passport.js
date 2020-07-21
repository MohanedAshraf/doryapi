const passport = require("passport");
const GooglePlusTokenStrategy = require("passport-google-plus-token")
const FacebookTokenStrategy = require('passport-facebook-token');
const User = require('./models/User');

//Facebook OAuth Strategy 
passport.use('facebookToken', new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET
  }, async (accessToken, refreshToken, profile, next) => {
    try {
      console.log('profile', profile);
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      
      const existingUser = await User.findOne({ "facebook.id": profile.id });
      if (existingUser) {
        return next(null, existingUser);
      }
  
      const newUser = new User({
        method: 'facebook',
        facebook: {
          id: profile.id,
          email: JSON.stringify(profile.emails[0])
        }
      });
  
      await newUser.save();
      next(null, newUser);
    } catch(error) {
      next(error, false, error.message);
    }
  }));
//Google OAUTH Strategy

passport.use("googleToken" ,new GooglePlusTokenStrategy({
    clientID: process.env.GOOGLE_ID ,
    clientSecret:process.env.GOOGLE_SECRET
} , async (accessToken , refreshToken , profile , next) => {
    try {
        // Should have full user profile over here
        console.log('profile', profile);
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
    
        const existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) {
            
          return next(null, existingUser);
        }
    
        const newUser = new User({
          method: 'google',
          google: {
            id: profile.id,
            email: JSON.stringify(profile.emails[0])
          }
        });
    
        await newUser.save();
        next(null, newUser);
      } catch(error) {
        next(error, false, error.message);
      }

}));
