require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:4202';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);

app.use(express.json());

app.use('/api', apiRouter);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});