require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'samadhanai-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://03-prac:03-prac6268@03-prac.po5ieuj.mongodb.net/prooo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected to SamadhanAI DB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'department_admin', 'super_admin'], default: 'user' },
    department: { type: String, enum: ['Water Department', 'Electricity Department', 'Road Department', 'Public Safety', 'General'], default: null },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const ComplaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    department: { type: String, default: 'General' },
    status: { type: String, enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'], default: 'Submitted' },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
    images: [{ type: String }], // Array of image filenames
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);

// Middleware to verify JWT
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

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'department_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'SamadhanAI API is running' });
});

// User Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'user'
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, department: user.department },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create Complaint with Image Upload
app.post('/api/complaints', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, location } = req.body;
        const userId = req.user.id;

        // AI Logic for department and priority assignment
        let department = 'General';
        let priority = 'Normal';

        const text = (title + " " + description).toLowerCase();
        if(text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('drainage')) {
            department = 'Water Department';
        } else if(text.includes('electricity') || text.includes('light') || text.includes('power') || text.includes('pole') || text.includes('cable')) {
            department = 'Electricity Department';
        } else if(text.includes('road') || text.includes('pothole') || text.includes('street') || text.includes('pavement')) {
            department = 'Road Department';
        } else if(text.includes('safety') || text.includes('crime') || text.includes('police') || text.includes('emergency')) {
            department = 'Public Safety';
        }

        if(text.includes('emergency') || text.includes('urgent') || text.includes('burst') || text.includes('broken') || text.includes('dangerous')) {
            priority = 'High';
        } else if(text.includes('critical') || text.includes('severe')) {
            priority = 'Urgent';
        }

        // Handle uploaded images
        const images = req.files ? req.files.map(file => file.filename) : [];

        const newComplaint = new Complaint({
            userId,
            title,
            description,
            location,
            department,
            priority,
            images,
            status: 'Submitted'
        });

        const saved = await newComplaint.save();
        await saved.populate('userId', 'name email');

        res.status(201).json({
            success: true,
            data: saved,
            message: 'Complaint submitted successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get complaints (filtered by user role)
app.get('/api/complaints', authenticateToken, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'user') {
            // Users see only their own complaints
            query.userId = req.user.id;
        } else if (req.user.role === 'department_admin') {
            // Department admins see complaints for their department
            query.department = req.user.department;
        }
        // Super admins see all complaints

        const complaints = await Complaint.find(query)
            .populate('userId', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: complaints });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update complaint status (admin only)
app.put('/api/complaints/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, resolution, assignedTo } = req.body;
        const complaintId = req.params.id;

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (resolution) updateData.resolution = resolution;
        if (assignedTo) updateData.assignedTo = assignedTo;

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            updateData,
            { new: true }
        ).populate('userId', 'name email').populate('assignedTo', 'name email');

        if (!updatedComplaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        res.json({
            success: true,
            data: updatedComplaint,
            message: 'Complaint updated successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get dashboard stats (admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'department_admin') {
            query.department = req.user.department;
        }

        const totalComplaints = await Complaint.countDocuments(query);
        const resolvedComplaints = await Complaint.countDocuments({ ...query, status: 'Resolved' });
        const pendingComplaints = await Complaint.countDocuments({
            ...query,
            status: { $in: ['Submitted', 'Under Review', 'In Progress'] }
        });
        const escalatedComplaints = await Complaint.countDocuments({
            ...query,
            priority: 'Urgent',
            status: { $ne: 'Resolved' }
        });

        // Get recent complaints
        const recentComplaints = await Complaint.find(query)
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                total: totalComplaints,
                resolved: resolvedComplaints,
                pending: pendingComplaints,
                escalated: escalatedComplaints,
                recentComplaints
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create default admin user (run once)
app.post('/api/setup-admin', async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'super_admin' });
        if (adminExists) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new User({
            name: 'Super Admin',
            email: 'admin@samadhanai.com',
            password: hashedPassword,
            role: 'super_admin'
        });

        await admin.save();

        // Create department admins
        const departments = ['Water Department', 'Electricity Department', 'Road Department', 'Public Safety'];
        for (const dept of departments) {
            const deptAdmin = new User({
                name: `${dept} Admin`,
                email: `${dept.toLowerCase().replace(' ', '')}@samadhanai.com`,
                password: hashedPassword,
                role: 'department_admin',
                department: dept
            });
            await deptAdmin.save();
        }

        res.json({ success: true, message: 'Admin users created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
