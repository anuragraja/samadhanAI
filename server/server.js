require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samadhanai', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected to SamadhanAI DB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const ComplaintSchema = new mongoose.Schema({
    userId: { type: String, default: 'user123' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    department: { type: String, default: 'Pending AI Analysis' },
    status: { type: String, default: 'Submitted' },
    priority: { type: String, default: 'Normal' },
    createdAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', ComplaintSchema);

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'SamadhanAI API is running' });
});

// Create Complaint
app.post('/api/complaints', async (req, res) => {
    try {
        const { title, description, location } = req.body;
        
        // Mock AI Logic here
        let department = 'Public Safety';
        let priority = 'Normal';
        
        const text = (title + " " + description).toLowerCase();
        if(text.includes('water') || text.includes('leak')) department = 'Water Department';
        if(text.includes('electricity') || text.includes('light') || text.includes('power')) department = 'Electricity Department';
        if(text.includes('road') || text.includes('pothole')) department = 'Road Department';
        
        if(text.includes('emergency') || text.includes('urgent') || text.includes('burst')) priority = 'High';

        const newComplaint = new Complaint({
            title,
            description,
            location,
            department,
            priority,
            status: 'Under Review'
        });

        const saved = await newComplaint.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all complaints for dashboard
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json({ success: true, data: complaints });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
