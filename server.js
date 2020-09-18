import path ,{dirname} from 'path';
import { fileURLToPath } from 'url';
 const __dirname = dirname(fileURLToPath(import.meta.url));
import http  from "http";
import express  from 'express';
import socketio  from "socket.io";
import morgan  from 'morgan';
import colors  from 'colors';
import cookieParser  from 'cookie-parser';
import mongoSanitize  from 'express-mongo-sanitize';
import helmet  from 'helmet';
import xss  from 'xss-clean';
import rateLimit  from 'express-rate-limit';
import hpp  from 'hpp';
import cors  from 'cors';

// Load env vars
import  './utils/env.js'


// socket configuration
import WebSockets from "./utils/webSockets.js";


import errorHandler  from './middleware/error.js';
// DB configuration 
import connectDB  from './config/db.js';




// Connect to database
connectDB();

// Route files

import users  from './routes/users.js';
import doctors  from './routes/doctors.js';
import reviews  from './routes/reviews.js';
import appointments  from './routes/appointments.js';
import labs  from './routes/labs.js';
import homeTests from './routes/homeTests.js';
import schedules  from './routes/schedules.js';
import chats  from './routes/chats.js';


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
global.io.on('connection', WebSockets.connection);


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
