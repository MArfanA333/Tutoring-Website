const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const mongoose = require('mongoose');
const Users = require('../server/models/Users');
const Session = require('../server/models/Session');
const Booking = require('../server/models/Booking');
const Notifications = require('../server/models/Notification');

// Mock database setup
// Mock database setup
beforeAll(async () => {
    const mongoUri = "mongodb+srv://b00093780:dbUserPassword@webappcluster.jzxur.mongodb.net/tutor";
    if (!mongoose.connection.readyState) {
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

// Login Route Test
describe('POST /login', () => {
    beforeEach(async () => {
        // Add a mock user to the database
        await Users.create({
            username: 'test@example.com',
            password: 'password123',
            role: 'Student',
            ausID: '12345',
            name: 'Test User',
            Major: 'CS',
        });
    });

    afterEach(async () => {
        await Users.deleteMany();
    });

    test('should login successfully with valid credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.user.username).toBe('test@example.com');
    });

    test('should fail to login with invalid credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password!');
    });
});


describe('User Model Unit Tests', () => {
    test('should create a user successfully', async () => {
        const user = new Users({
            username: 'test@example.com',
            password: 'password123',
            role: 'Student',
            ausID: '12345',
            name: 'Test User',
            Major: 'CS',
        });

        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.username).toBe('test@example.com');
    });

    test('should fail if required fields are missing', async () => {
        const user = new Users({
            username: 'test@example.com',
        });

        let err;
        try {
            await user.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.errors.password).toBeDefined();
        expect(err.errors.role).toBeDefined();
    });
});


// Get Unbooked Sessions Test
describe('GET /api/unbooked-sessions', () => {
    beforeEach(async () => {
        // Add mock sessions
        await Session.create([
            { Course: 'Math 101', Booked: 'No', Tutor_name: 'tutor1', SessionType:'Individual', Tutor_username: 'tutor@aus.edu' },
            { Course: 'Physics 101', Booked: 'Yes', Tutor_name: 'tutor2', SessionType:'Individual', Tutor_username: 'tutor2@aus.edu' },
        ]);
    });

    afterEach(async () => {
        await Session.deleteMany();
    });

    test('should return unbooked sessions', async () => {
        const response = await request(app).get('/api/unbooked-sessions');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].Course).toBe('Math 101');
    });
});

// Book Session Test
describe('POST /api/book-session', () => {
    let session;

    beforeEach(async () => {
        session = await Session.create({
            Course: 'Chemistry 101',
            Booked: 'No',
            Tutor_name: 'tutor1',
            SessionType:'Individual', 
            Tutor_username: 'tutor@aus.edu'
        });
    });

    afterEach(async () => {
        await Session.deleteMany();
        await Booking.deleteMany();
    });

    test('should book a session successfully', async () => {
        const response = await request(app)
            .post('/api/book-session')
            .send({
                sessionId: session._id,
                tutorUsername: 'tutor@aus.edu',
                studentUsername: 'student@aus.edu',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Session booked successfully!');

        // Verify the session is marked as booked
        const updatedSession = await Session.findById(session._id);
        expect(updatedSession.Booked).toBe('Yes');

        // Verify the booking exists
        const booking = await Booking.findOne({ Session_id: session._id });
        expect(booking).not.toBeNull();
        expect(booking.Student_username).toBe('student@aus.edu');
    });

    test('should prevent booking own session', async () => {
        const response = await request(app)
            .post('/api/book-session')
            .send({
                sessionId: session._id,
                tutorUsername: 'tutor@aus.edu',
                studentUsername: 'tutor@aus.edu',
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Tutors cannot book their own sessions.');
    });
});

// Cancel Booking Test
describe('POST /api/cancel-booking', () => {
    let booking;

    beforeEach(async () => {
        const session = await Session.create({
            Course: 'Biology 101',
            Booked: 'Yes',
            Tutor_name: 'tutor1',
            SessionType:'Individual', 
            Tutor_username: 'tutor@aus.edu'
        });

        booking = await Booking.create({
            Session_id: session._id,
            Student_username: 'student@aus.edu',
            Tutor_username: 'tutor@aus.edu',
        });
    });

    afterEach(async () => {
        await Booking.deleteMany();
        await Session.deleteMany();
    });

    test('should cancel a booking successfully', async () => {
        const response = await request(app)
            .post('/api/cancel-booking')
            .send({ bookingId: booking._id });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Booking canceled successfully!');

        // Verify the session is marked as not booked
        const session = await Session.findById(booking.Session_id);
        expect(session.Booked).toBe('No');
    });
});
