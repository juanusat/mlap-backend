require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const apiRouter = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigin = `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}`;
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);

app.use(express.json());
// Parse cookies so auth middleware can read req.cookies.token
app.use(cookieParser());

app.use('/api', apiRouter);

app.use(errorMiddleware);

const PORT = process.env.BACKEND_PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});