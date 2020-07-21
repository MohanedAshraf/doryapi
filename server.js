const path = require('path');
const http = require("http");
const express = require('express');
const socketio = require("socket.io");
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


// socket configuration
const webSockets = require("./utils/webSockets.js");


const errorHandler = require('./middleware/error');
// DB configuration 
const connectDB = require('./config/db');


// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files

const users = require('./routes/users');
const doctors = require('./routes/doctors');
const reviews = require('./routes/reviews');
const appointments = require('./routes/appointments');
const labs = require('./routes/labs');
const homeTests = require('./routes/homeTests');
const schedules = require('./routes/schedules');
const chats = require('./routes/chats');


const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
//app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers

app.use('/api/v1/users', users);
app.use('/api/v1/doctors', doctors);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/appointments', appointments);
app.use('/api/v1/labs', labs);
app.use('/api/v1/homeTests', homeTests);
app.use('/api/v1/schedules', schedules);
app.use('/api/v1/chats', chats);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

/** Create socket connection */
global.io = socketio.listen(server);
global.io.on('connection', webSockets.connection)

server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
