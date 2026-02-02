const express = require('express');
const cors = require('cors');
const config = require('./src/config/config');
const uploadRouter = require('./src/routes/upload');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', uploadRouter);

// Health check
app.get('/', (req, res) => {
    res.send('Payroll PDF System is Running');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
