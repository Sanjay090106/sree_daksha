const express = require('express');
const cors = require('cors');
const session = require('express-session');
const config = require('./src/config/config');
const uploadRouter = require('./src/routes/upload');

const app = express();

// Trust proxy (required for sessions/cookies behind Render's HTTPS proxy)
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Auth middleware - require login for protected routes
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
}

// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {};
    const emailStr = (email || '').toString().trim();
    const passwordStr = (password || '').toString();

    if (emailStr === config.authEmail && passwordStr === config.authPassword) {
        req.session.authenticated = true;
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// Logout API (optional)
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

// Auth check (for client-side verification)
app.get('/api/auth/check', (req, res) => {
    if (req.session && req.session.authenticated) {
        return res.json({ authenticated: true });
    }
    res.status(401).json({ authenticated: false });
});

// Root: redirect to login if not authenticated, else to upload page
app.get('/', (req, res) => {
    if (req.session && req.session.authenticated) {
        return res.redirect('/index.html');
    }
    res.redirect('/login.html');
});

// Serve static files
app.use(express.static('public'));

// Protected API routes
app.use('/api/upload-master-pdf', requireAuth);
app.use('/api', uploadRouter);

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
