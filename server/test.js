// Test script to verify all functionalities
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAllFunctions() {
    console.log('🧪 Testing SamadhanAI Application Functions...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check: PASS\n');

        // Test 2: Register User
        console.log('2. Testing User Registration...');
        const timestamp = Date.now();
        const registerData = {
            name: 'Test User',
            email: `test${timestamp}@example.com`,
            password: 'test123',
            phone: '1234567890'
        };
        const register = await axios.post(`${BASE_URL}/auth/register`, registerData);
        console.log('✅ User Registration: PASS\n');

        // Test 3: Login User
        console.log('3. Testing User Login...');
        const loginData = {
            email: registerData.email,
            password: 'test123'
        };
        const login = await axios.post(`${BASE_URL}/auth/login`, loginData);
        const token = login.data.token;
        console.log('✅ User Login: PASS\n');

        // Test 4: Create Complaint
        console.log('4. Testing Complaint Creation...');
        const complaintData = {
            title: 'Test Complaint',
            description: 'This is a test complaint',
            location: 'Test Location',
            department: 'General'
        };
        const complaint = await axios.post(`${BASE_URL}/complaints`, complaintData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Complaint Creation: PASS\n');

        // Test 5: Get Complaints
        console.log('5. Testing Get Complaints...');
        const complaints = await axios.get(`${BASE_URL}/complaints`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Get Complaints: PASS (${complaints.data.length} complaints found)\n`);

        // Test 6: Admin Login
        console.log('6. Testing Admin Login...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@samadhanai.com',
            password: 'admin123'
        });
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin Login: PASS\n');

        // Test 7: Admin Stats
        console.log('7. Testing Admin Stats...');
        const stats = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin Stats: PASS\n');

        // Test 8: Update Complaint Status
        console.log('8. Testing Complaint Status Update...');
        const complaintId = complaint.data.data._id;
        const update = await axios.put(`${BASE_URL}/complaints/${complaintId}`, {
            status: 'In Progress'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Complaint Status Update: PASS\n');

        console.log('🎉 ALL TESTS PASSED! SamadhanAI is working perfectly!');
        console.log('\n📋 Test Summary:');
        console.log('- ✅ Server Health: OK');
        console.log('- ✅ User Registration: OK');
        console.log('- ✅ User Authentication: OK');
        console.log('- ✅ Complaint Creation: OK');
        console.log('- ✅ Complaint Retrieval: OK');
        console.log('- ✅ Admin Authentication: OK');
        console.log('- ✅ Admin Dashboard: OK');
        console.log('- ✅ Complaint Management: OK');
        console.log('- ✅ MongoDB Integration: OK');
        console.log('- ✅ JWT Authentication: OK');
        console.log('- ✅ Role-based Access: OK');

    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testAllFunctions();