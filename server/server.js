require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'samadhanai-secret-key-2024';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|mp4|mov|avi/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Harshali:Harshali123@cluster0.y6fjrcb.mongodb.net/?appName=Cluster0')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err.message));

// ─── Socket.io ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`${socket.id} joined ${room}`);
    });
    socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

// ─── Schemas ───────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'department_admin', 'super_admin'], default: 'user' },
    department: { type: String, enum: ['Water Department', 'Electricity Department', 'Road Department', 'Public Safety', 'Garbage Department', 'General', null], default: null },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const TimelineSchema = new mongoose.Schema({
    status: String,
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedByName: String,
    timestamp: { type: Date, default: Date.now }
});

const ComplaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    department: { type: String, default: 'General' },
    category: { type: String, default: 'General' },
    status: { type: String, enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'], default: 'Submitted' },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent', 'Emergency'], default: 'Normal' },
    images: [{ type: String }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String },
    adminNotes: { type: String },
    timeline: [TimelineSchema],
    aiScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);

// ─── Auth Middleware ────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Access token required' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'department_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// ─── AI Classification Engine ───────────────────────────────────────────────
function classifyComplaint(title, description) {
    const text = (title + ' ' + description).toLowerCase();

    const departments = {
        'Water Department': {
            keywords: /water|leak|pipe|drain|sewage|drinking water|tap|flood|plumbing|borewel|handpump|seepage|overflow/,
            category: 'Water & Sanitation'
        },
        'Electricity Department': {
            keywords: /electric|light|power|pole|cable|wire|shock|transformer|outage|blackout|streetlight|short circuit|voltage/,
            category: 'Electricity & Power'
        },
        'Road Department': {
            keywords: /road|pothole|street|pavement|highway|bridge|traffic|footpath|signal|divider|speed breaker|crater|crack/,
            category: 'Roads & Infrastructure'
        },
        'Public Safety': {
            keywords: /safety|crime|police|robbery|theft|assault|murder|fire|accident|riot|harassment|danger|threat|violence/,
            category: 'Public Safety'
        },
        'Garbage Department': {
            keywords: /garbage|trash|waste|dustbin|rubbish|litter|dump|cleaning|sanitation|sweeping|smell|stink|compost/,
            category: 'Sanitation & Waste'
        }
    };

    let department = 'General';
    let category = 'General Issue';

    for (const [dept, config] of Object.entries(departments)) {
        if (config.keywords.test(text)) {
            department = dept;
            category = config.category;
            break;
        }
    }

    // Priority Logic
    let priority = 'Normal';
    let aiScore = 30;

    if (/emergency|life threatening|death|dying|murder|explosion|blast|gas leak|electrocuted|drowning|collapsed|trapped/.test(text)) {
        priority = 'Emergency'; aiScore = 100;
    } else if (/urgent|accident|fire|robbery|assault|burst pipe|no water|total outage|dangerous|critical|severe/.test(text)) {
        priority = 'Urgent'; aiScore = 80;
    } else if (/broken|damaged|overflow|blocked|leak|major|important|high|many complaints/.test(text)) {
        priority = 'High'; aiScore = 60;
    } else if (/low|minor|small|slight|little/.test(text)) {
        priority = 'Low'; aiScore = 20;
    } else {
        aiScore = 40;
    }

    return { department, category, priority, aiScore };
}

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'SamadhanAI API running', timestamp: new Date() });
});

// Auth: Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await new User({ name, email, password: hashedPassword, phone, role: 'user' }).save();
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true, message: 'Registration successful', token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, department: user.department },
            JWT_SECRET, { expiresIn: '7d' }
        );
        res.json({
            success: true, message: 'Login successful', token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Complaints: Create
app.post('/api/complaints', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, location, lat, lng } = req.body;
        const { department, category, priority, aiScore } = classifyComplaint(title, description);
        const images = req.files ? req.files.map(f => f.filename) : [];

        const complaint = new Complaint({
            userId: req.user.id, title, description, location,
            lat: lat || null, lng: lng || null,
            department, category, priority, aiScore, images, status: 'Submitted',
            timeline: [{ status: 'Submitted', note: 'Complaint submitted by citizen. AI classification complete.', changedByName: 'System AI' }]
        });

        const saved = await complaint.save();
        await saved.populate('userId', 'name email');

        // Real-time events
        io.to('admin_room').emit('new_complaint', saved);
        if (['High', 'Urgent', 'Emergency'].includes(priority)) {
            io.to('admin_room').emit('emergency_alert', saved);
        }
        io.to(`user_${req.user.id}`).emit('complaint_submitted', saved);

        res.status(201).json({ success: true, data: saved, message: `Complaint submitted — Routed to ${department}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Complaints: Get (role-aware)
app.get('/api/complaints', authenticateToken, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'user') query.userId = req.user.id;
        else if (req.user.role === 'department_admin') query.department = req.user.department;

        const { status, priority, department, search } = req.query;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (department && req.user.role === 'super_admin') query.department = department;
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];

        const complaints = await Complaint.find(query)
            .populate('userId', 'name email phone')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: complaints, count: complaints.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Complaints: Get single
app.get('/api/complaints/:id', authenticateToken, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('assignedTo', 'name email');
        if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
        res.json({ success: true, data: complaint });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Complaints: Update (admin)
app.put('/api/complaints/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, resolution, assignedTo, adminNotes, priority } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

        const admin = await User.findById(req.user.id).select('name');

        const updateData = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (resolution) updateData.resolution = resolution;
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (priority) updateData.priority = priority;

        // Add to timeline
        if (status) {
            updateData.$push = {
                timeline: {
                    status,
                    note: resolution || adminNotes || `Status changed to ${status}`,
                    changedBy: req.user.id,
                    changedByName: admin?.name || 'Admin'
                }
            };
        }

        const updated = await Complaint.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('userId', 'name email')
            .populate('assignedTo', 'name email');

        // Real-time events
        io.to('admin_room').emit('complaint_updated', updated);
        io.to(`user_${updated.userId._id}`).emit('complaint_status_changed', updated);

        res.json({ success: true, data: updated, message: 'Complaint updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'department_admin') query.department = req.user.department;

        const [total, resolved, pending, urgent, emergency] = await Promise.all([
            Complaint.countDocuments(query),
            Complaint.countDocuments({ ...query, status: 'Resolved' }),
            Complaint.countDocuments({ ...query, status: { $in: ['Submitted', 'Under Review', 'In Progress'] } }),
            Complaint.countDocuments({ ...query, priority: { $in: ['Urgent'] }, status: { $ne: 'Resolved' } }),
            Complaint.countDocuments({ ...query, priority: 'Emergency', status: { $ne: 'Resolved' } })
        ]);

        // Department breakdown
        const depts = ['Water Department', 'Electricity Department', 'Road Department', 'Public Safety', 'Garbage Department'];
        const departmentStats = await Promise.all(depts.map(async (dept) => {
            const dQuery = req.user.role === 'department_admin' ? { department: dept } : { department: dept };
            const [dTotal, dResolved] = await Promise.all([
                Complaint.countDocuments(dQuery),
                Complaint.countDocuments({ ...dQuery, status: 'Resolved' })
            ]);
            return { department: dept, total: dTotal, resolved: dResolved };
        }));

        // Monthly trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyData = await Complaint.aggregate([
            { $match: { ...query, createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const recentComplaints = await Complaint.find(query)
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: { total, resolved, pending, urgent, emergency, departmentStats, monthlyData, recentComplaints }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Users list
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Setup admin (run once)
app.post('/api/setup-admin', async (req, res) => {
    try {
        if (await User.findOne({ role: 'super_admin' })) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await new User({ name: 'Super Admin', email: 'admin@samadhanai.com', password: hashedPassword, role: 'super_admin' }).save();

        const depts = ['Water Department', 'Electricity Department', 'Road Department', 'Public Safety', 'Garbage Department'];
        for (const dept of depts) {
            const key = dept.toLowerCase().replace(/ /g, '');
            await new User({ name: `${dept} Admin`, email: `${key}@samadhanai.com`, password: hashedPassword, role: 'department_admin', department: dept }).save();
        }
        res.json({ success: true, message: 'Admin users created. Login: admin@samadhanai.com / admin123' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Chatbot API
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message required' });

        const lMsg = message.toLowerCase();
        let reply = '';

        if (/hello|hi|hey|namaste/.test(lMsg)) {
            reply = '🙏 Namaste! I am SamadhanAI — your civic grievance assistant. I can help you register complaints, track them, or answer your questions. How may I help you today?';
        } else if (/register|new complaint|raise|submit/.test(lMsg)) {
            reply = '📋 To register a complaint:\n1. Click "Raise Complaint" in the navigation menu.\n2. Enter your complaint title and detailed description.\n3. Auto-detect your location or pin it on the map.\n4. Upload photos/videos as evidence (optional).\n5. Click "Submit to AI Analyzer" — our AI will auto-classify and route it to the correct department!';
        } else if (/track|status|complaint id|update/.test(lMsg)) {
            reply = '🔍 To track your complaint:\n1. Go to "Track Complaint" in the menu.\n2. You\'ll see all your complaints with live status updates.\n3. Click any complaint to see full details, timeline, and admin notes.\n\nStatuses: Submitted → Under Review → In Progress → Resolved';
        } else if (/emergency|urgent|danger|help|accident|fire|crime/.test(lMsg)) {
            reply = '🚨 EMERGENCY PROTOCOL:\n• For life-threatening emergencies, call 112 immediately!\n• When you submit a complaint with emergency keywords, our AI auto-flags it as HIGH PRIORITY.\n• Admin teams are notified INSTANTLY via real-time alerts.\n• Emergency contacts:\n  Police: 100 | Fire: 101 | Ambulance: 108';
        } else if (/department|water|electricity|road|garbage|safety/.test(lMsg)) {
            reply = '🏢 We have 5 departments:\n• 💧 Water Department — Leaks, pipes, sewage\n• ⚡ Electricity — Outages, poles, wires\n• 🛣️ Roads — Potholes, signals, bridges\n• 🛡️ Public Safety — Crime, accidents, fire\n• 🗑️ Garbage — Waste, cleaning, dustbins\n\nOur AI automatically routes your complaint to the right department!';
        } else if (/resolved|solved|when|how long/.test(lMsg)) {
            reply = '⏱️ Resolution timelines:\n• Emergency: Within 24 hours\n• Urgent: Within 3 days\n• High Priority: Within 7 days\n• Normal: Within 15 days\n• Low Priority: Within 30 days\n\nYou\'ll receive real-time notifications when your complaint status changes!';
        } else if (/login|register|account|sign up/.test(lMsg)) {
            reply = '👤 Account help:\n• New user? Click "Register" to create a free account.\n• Already registered? Click "Login" with your email and password.\n• All complaint tracking requires a free account.\n• Your data is secure with JWT authentication.';
        } else {
            reply = '🤖 I\'m here to help! You can ask me about:\n• 📋 How to register a complaint\n• 🔍 How to track complaint status\n• 🚨 Emergency procedures\n• 🏢 Department information\n• ⏱️ Resolution timelines\n\nTry asking: "How do I register a complaint?" or "What are the emergency contacts?"';
        }

        res.json({ success: true, reply });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const server = httpServer.listen(PORT, () => console.log(`✅ SamadhanAI Server running on port ${PORT}`));
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') { console.error(`❌ Port ${PORT} in use.`); process.exit(1); }
});
