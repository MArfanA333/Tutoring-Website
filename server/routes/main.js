const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Models:
const Users = require('../models/Users');
const TutoredCourses = require('../models/TutoredCourses');
const Session = require('../models/Session');
const Booking = require('../models/Booking');
const Application = require('../models/Application');
const Notifications = require('../models/Notification');
const Documents = require('../models/Documents');
const session = require('express-session');

router.use(bodyParser.json());
router.use(cors());
router.use(express.urlencoded({ extended: false }));

// -----------------------------------------
// RENDER ROUTES
// -----------------------------------------

// Render Login Page
router.get('', (req, res) => {
    const locals = { title: "Login" };
    res.render('login', { locals, layout: false });
});

router.get('/admin', (req, res) => {
    const locals = { title: "Admin Page" };
    res.render('admin', {locals, layout:false});
});

router.get('/signup', (req, res) => {
    const locals = { title: "Sign Up" };
    res.render('signup', { locals, layout: false });
});

// Render Browse Page
router.get('/browse', (req, res) => {
    const locals = { title: "Browse" };
    res.render('browse', { locals });
});

// Render Index/Home Page
router.get('/index', (req, res) => {
    const locals = { title: "Home Page" };
    res.render('index', { locals });
});

// Render Manage Bookings Page
router.get('/managebooking', (req, res) => {
    const locals = { title: "Manage Bookings" };
    res.render('managebooking', { locals });
});

router.get('/tutorApp', (req, res) => {
    const locals = { title: "Tutor Application" };
    res.render('tutorApp', {locals, layout: false});
});

router.get('/managesession', (req, res) => {
    const locals = { title: "Manage Sessions" };
    res.render('manageSession', {locals});
});

router.get('/profile', (req, res) => {
    const locals = { title: "Profile" };
    res.render('profile', {locals});
});



// -----------------------------------------
// API ROUTES
// -----------------------------------------

// Login API
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ username: email, password });
        if (user) {
            res.status(200).json({
                message: 'Login successful',
                user: {
                    username: user.username,
                    password: user.password,
                    role: user.role,
                    ausID: user.ausID,
                    name: user.name,
                    Major: user.Major,
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get All Unbooked Sessions
router.get("/api/unbooked-sessions", async (req, res) => {
    try {
        const sessions = await Session.find({ Booked: "No" });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error fetching unbooked sessions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/api/debug/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('Session_id');
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Debugging failed.' });
    }
});

// Book a Session
router.post("/api/book-session", async (req, res) => {
    try {
        const { sessionId, tutorUsername, studentUsername } = req.body;

        // Check if session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }

        // Prevent tutor from booking their own session
        if (session.Tutor_username === studentUsername) {
            return res
                .status(403)
                .json({ message: "Tutors cannot book their own sessions." });
        }

        // Check if the user has already booked this session
        const existingBooking = await Booking.findOne({
            Session_id: sessionId,
            Student_username: studentUsername,
        });
        if (existingBooking) {
            return res
                .status(400)
                .json({ message: "You have already booked this session." });
        }

        // Create a booking
        await Booking.create({
            Student_username: studentUsername,
            Tutor_username: tutorUsername,
            Session_id: sessionId,
        });

        // Update session to mark it as booked only if session type is not "Group"
        if (session.SessionType !== "Group") {
            session.Booked = "Yes";
            await session.save();
        }

        // Create a notification for the tutor
        const notification = new Notifications({
            Student_username: session.Tutor_username,
            Heading: 'New Session Booking',
            Body: `${studentUsername} has booked a session for ${session.Course} on ${new Date(session.DateTime).toLocaleString()}`
        });

        await notification.save(); // Save the notification for the tutor

        res.status(200).json({ message: "Session booked successfully!" });
    } catch (error) {
        console.error("Error booking session:", error);
        res.status(500).json({ message: "Failed to book the session." });
    }
});


// Get Bookings by Student Username
router.get('/api/bookings/:username', async (req, res) => {
    try {
        let  username  = req.params.username;

        // Find all bookings for the user and populate session details
        const bookings = await Booking.find({ Student_username: username }).populate("Session_id");
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// Get sessions by tutor Username
router.get('/api/sessions/:username', async (req, res) => {
    try {
        let username  = req.params.username;

        // Find all bookings for the user and populate session details
        const sessions = await Session.find({ Tutor_username: username });
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
});


// Cancel a Booking
router.post("/api/cancel-booking", async (req, res) => {
    try {
        let { bookingId } = req.body;

        // Find and delete the booking
        const booking = await Booking.findByIdAndDelete(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Mark session as not booked
        await Session.findByIdAndUpdate(booking.Session_id, { Booked: "No" });

        res.status(200).json({ message: "Booking canceled successfully!" });
    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ message: "Failed to cancel the booking" });
    }
});

router.post('/api/send-notification', async (req, res) => {
    try {
        const { tutorUsername, notification } = req.body;

        // Create and save the notification
        const newNotification = new Notifications({
            Student_username: tutorUsername,
            Heading: notification.Heading,
            Body: notification.Body,
        });

        await newNotification.save();

        res.status(200).json({ message: 'Notification sent successfully!' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Failed to send notification' });
    }
});

// Cancel a Booking
router.post("/api/cancel-booking-session", async (req, res) => {
    try {
        const { SessionId } = req.body;

        if (!SessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        // Find and delete the booking
        const booking = await Booking.findOneAndDelete({ Session_id: SessionId });

        // If no booking is found, return a success response
        if (!booking) {
            return res.status(200).json({ message: "No booking found for the given Session ID. Nothing to cancel." });
        }

        // Mark session as not booked
        await Session.findByIdAndUpdate(booking.Session_id, { Booked: "No" });

        res.status(200).json({ message: "Booking canceled successfully!" });
    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ message: "Failed to cancel the booking" });
    }
});

// Delete a session
router.post("/api/delete-session", async (req, res) => {
    try {
        let { sessionId } = req.body;

        // Ensure sessionId is valid
        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        // Find and delete the session
        const session = await Session.findByIdAndDelete(sessionId); // Pass the sessionId directly
        if (!session) {
            return res.status(404).json({ message: `Session not found: ${sessionId}` });
        }

        res.status(200).json({ message: "Session deleted successfully!" });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ message: "Failed to delete the session", error });
    }
});

// Getting tutored courses for the user
router.get('/api/tutored-courses/:username', async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const courses = await TutoredCourses.find({ Username: username });

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: 'No courses found for this tutor' });
        }

        res.status(200).json(courses.map(course => course.Course)); // Return only the course names
    } catch (error) {
        console.error('Error fetching tutored courses:', error);
        res.status(500).json({ message: 'Error fetching tutored courses' });
    }
});

// Add a session:
router.post("/api/add-session", async (req, res) => {
    try {
        const { course, dateTime, sessionType, booked, tutorName, tutorUsername } = req.body;

        // Create a new session document
        const newSession = new Session({
            Course: course,
            DateTime: dateTime,
            SessionType: sessionType,
            Booked: booked,
            Tutor_name: tutorName,
            Tutor_username: tutorUsername,
        });

        // Save the session to the database
        const savedSession = await newSession.save();

        res.status(201).json(savedSession); // Return the saved session
    } catch (error) {
        console.error("Error adding session:", error);
        res.status(500).json({ message: "Failed to add session" });
    }
});

// Get user details:
router.post("/api/get-user", async (req, res) => {
    try {
        const userId = req.body // Assuming userId is stored in the session
        const user = await Users.find({username:userId}).select("-password"); // Exclude password for security

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Failed to fetch user data" });
    }
});

router.get("/api/tutor-courses", async (req, res) => {
    const { username } = req.query;

    try {
        // Find the courses the tutor teaches
        const courses = await TutoredCourses.find({ Username: username }).select("Course -_id");

        // Extract the course names into an array
        const courseList = courses.map((course) => course.Course);

        res.status(200).json(courseList);
    } catch (error) {
        console.error("Error fetching tutor's courses:", error);
        res.status(500).json({ message: "Failed to fetch courses." });
    }
});

// Update user:
router.post("/api/update-user", async (req, res) => {
    const { username, name, ausID, password, Major } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required to update the user profile." });
    }

    try {
        // Fetch the user from the database
        const user = await Users.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update the user fields if provided
        const oldName = user.name;
        user.name = name || user.name;
        user.ausID = ausID || user.ausID;
        user.password = password || user.password;
        user.Major = Major || user.Major;

        // Save the updated user to the database
        await user.save();

        // If the user is a tutor, update the sessions where the user is the tutor
        if (user.role === 'Tutor') {
            // Update the Tutor_name in all sessions where this user is the tutor
            await Session.updateMany(
                { Tutor_username: username }, // Find sessions with this tutor's username
                { $set: { Tutor_name: user.name } } // Update the Tutor_name field with the new name
            );
        }

        res.status(200).json({ message: "User profile and associated sessions updated successfully!" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "An error occurred while updating the user profile and sessions." });
    }
});

// Signup API:
router.post('/api/signup', async (req, res) => {

    const { username, ausID, Major, password, name, role } = req.body;

    // Validate fields
    if (!username || !ausID || !Major || !password || !name) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the user already exists
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Create the new user without password hashing
    const newUser = new Users({ username,password, role,ausID,name,Major});

    try {
        await newUser.save();
        res.status(201).json({ message: 'Signup successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving user to the database.' });
    }
});


router.post("/api/application/submit", async (req, res) => {
    try {
        const { username, standing, course, grade } = req.body;

        // Find the user by username to get their _id
        const user = await Users.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the user already applied for the course
        const existingApplication = await Application.findOne({ 
            Student_username: user._id, 
            Course: course 
        });

        // Check if the user is already approved to tutor the course
        const approvedTutoring = await TutoredCourses.findOne({ 
            Username: user._id, 
            Course: course 
        });

        if (existingApplication || approvedTutoring) {
            return res.status(400).json({ 
                message: existingApplication 
                    ? "You have already applied for this course." 
                    : "You are already approved to tutor this course."
            });
        }

        // Save the new application with user ID
        const application = new Application({
            Student_username: user._id, // Store user ID
            Standing: standing,
            Course: course,
            Grade: grade
        });

        await application.save();
        res.status(201).json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Failed to submit application." });
    }
});

router.get("/api/application/check", async (req, res) => {
    try {
        const { username, course } = req.query;

        // Check if the user has already applied for the course
        const existingApplication = await Application.findOne({ 
            Student_username: username, 
            Course: course 
        });

        // Check if the user is already approved to tutor the course
        const approvedTutoring = await TutoredCourses.findOne({ 
            Username: username, 
            Course: course 
        });

        if (existingApplication || approvedTutoring) {
            return res.status(200).json({
                exists: true,
                message: existingApplication 
                    ? "You have already applied for this course." 
                    : "You are already approved to tutor this course."
            });
        }

        res.status(200).json({ exists: false });
    } catch (error) {
        console.error("Error checking application:", error);
        res.status(500).json({ message: "Failed to check application." });
    }
});


// Approve an application
router.post("/api/application/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;

        // Find the application
        const application = await Application.findById(id).populate("Student_username");
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        const { Student_username, Course } = application;

        // Insert the course into TutoredCourses
        const tutoredCourse = new TutoredCourses({
            Username: Student_username.username, // Adjust field name
            Course
        });
        await tutoredCourse.save();

        // Update user role to Tutor
        if (Student_username.role !== "Tutor") {
            Student_username.role = "Tutor";
            await Student_username.save();
        }

        // Create notification
        const notification = new Notifications({
            Student_username: application.Student_username.username,
            Heading: 'Application Approved',
            Body: `Congratulations! Your application to tutor ${application.Course} has been approved.`
        });
        
        await notification.save();
        // Delete the application
        await Application.findByIdAndDelete(id);

        res.status(200).json({ message: "Application approved successfully." });
    } catch (error) {
        console.error("Error approving application:", error);
        res.status(500).json({ message: "Failed to approve application." });
    }
});

// Reject an application
router.delete('/api/application/:id/reject', async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { id } = req.params;

        // Find the application
        const application = await Application.findById(id).populate("Student_username");
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        const { Student_username, Course } = application;

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Create notification
        const notification = new Notifications({
            Student_username: application.Student_username.username,
            Heading: 'Application Rejected',
            Body: `We're sorry to inform you that your application to tutor ${application.Course} has been rejected.`
        });

        await notification.save();
        await Application.findByIdAndDelete(applicationId); // Optionally remove the application

        res.status(200).json({ message: 'Application rejected and notification created' });
    } catch (error) {
        console.error('Error rejecting application:', error);
        res.status(500).json({ message: 'Failed to reject application' });
    }
});

// Fetch all applications with user details
router.get("/api/applications", async (req, res) => {
    try {
        const applications = await Application.find().populate("Student_username"); // Adjust field names based on your User schema
        res.status(200).json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Failed to fetch applications." });
    }
});

router.delete('/api/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Notifications.findByIdAndDelete(id);
        res.status(200).json({ message: 'Notification deleted successfully.' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification.' });
    }
});

router.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await Notifications.find();
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});

// Get notifications for a specific student
router.get('/api/notifications/:studentUsername', async (req, res) => {
    try {
        const { studentUsername } = req.params;

        // Find notifications for the logged-in user
        const notifications = await Notifications.find({ "Student_username": studentUsername });

        res.status(200).json(notifications); // Send back the notifications
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

// Fetch session details and list all students (via bookings)
router.get('/api/session/:sessionId', async (req, res) => {
    try {
        const sessionID = req.params.sessionId;
        const session = await Session.findById(new mongoose.Types.ObjectId(sessionID)); // Find the session
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Find all bookings for the session to get the students
        const bookings = await Booking.find({ Session_id: session._id });

        // Extract the list of student usernames
        const studentUsernames = bookings.map(booking => booking.Student_username);

        // Format response
        const sessionDetails = {
            _id:session._id,
            Course: session.Course,
            SessionType: session.SessionType,
            DateTime: session.DateTime,
            Tutor_name: session.Tutor_name,
            Tutor_username: session.Tutor_username,
            Students_usernames: studentUsernames,  // List of student usernames
        };

        res.json(sessionDetails);
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ message: 'Failed to fetch session details' });
    }
});

router.get('/session/:sessionId', async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Get the list of students from the bookings collection
        const bookings = await Booking.find({ Session_id: session._id });
        const studentUsernames = bookings.map(booking => booking.Student_username);

        // Fetch the student emails (assuming you have a User model)
        const studentEmails = await Promise.all(studentUsernames.map(async (username) => {
            const user = await Users.findOne({ username });
            return user ? user.email : '';
        }));

        // Get the tutor's email
        const tutor = await Users.findOne({ username: session.Tutor_username });

        // Prepare session details
        const sessionDetails = {
            Course: session.Course,
            SessionType: session.SessionType,
            DateTime: session.DateTime,
            Tutor_name: session.Tutor_name,
            Tutor_email: tutor ? tutor.email : '',
            Students: studentUsernames.map((username, index) => ({
                username,
                email: studentEmails[index]
            })),  // List of student objects with username and email
        };

        // Send session data as a response (render in a template if needed)
        res.render('sessionPage', { session: sessionDetails });

    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ message: 'Failed to fetch session details' });
    }
});

// Fetch user details by username
router.get('/api/user/:username', async (req, res) => {
    try {
        const user = await Users.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ email: user.email }); // Send the user's email
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
});

// API route to handle document uploads
router.post('/api/upload-document', async (req, res) => {
    try {
        const { sessionId, documentName, documentLink } = req.body;

        if (!sessionId || !documentName || !documentLink) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Create a new document entry
        const newDocument = new Documents({
            Session_id: sessionId,
            Document_name: documentName,
            Document_link: documentLink
        });

        // Save the document to the database
        await newDocument.save();

        res.status(200).json({ message: 'Document uploaded successfully!' });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Failed to upload document.' });
    }
});

// Upload Document API
router.post('/api/upload-document-tutor', async (req, res) => {
    const { sessionId, documentName, documentLink } = req.body;

    try {
        // Add document to the database
        const document = new Documents({
            Session_id: sessionId,
            Document_name: documentName,
            Document_link: documentLink,
        });
        await document.save();

        // Fetch the session details to get the tutor's username
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Fetch all bookings for this session to get student usernames
        const bookings = await Booking.find({ Session_id: sessionId });

        const studentUsernames = bookings.map((booking) => booking.Student_username);

        // Create notifications for each student
        const notifications = studentUsernames.map((username) => ({
            Student_username: username,
            Heading: 'New Document Added',
            Body: `The tutor for your session "${session.Course}" has added a new document: ${documentName}.`,
        }));

        // Save notifications to the database
        await Notifications.insertMany(notifications);

        res.status(201).json({ message: 'Document uploaded and notifications sent.' });
    } catch (error) {
        console.error('Error uploading document or sending notifications:', error);
        res.status(500).json({ message: 'An error occurred while uploading the document.' });
    }
});

// Route to fetch all documents for a specific session
router.get('/api/documents/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Fetch all documents for the given sessionId
        const documents = await Documents.find({ Session_id: sessionId });

        if (!documents || documents.length === 0) {
            return res.status(404).json({ message: 'No documents found for this session' });
        }

        res.status(200).json(documents); // Return the list of documents
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// Route to delete a document by its ID
router.delete('/api/delete-document/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;

        // Find and delete the document by ID
        const deletedDocument = await Documents.findByIdAndDelete(new mongoose.Types.ObjectId(documentId));

        if (!deletedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
});

// API to get the count of students enrolled in a session
router.get('/api/session-enrollment-count/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;

        // Count the number of bookings for the session
        const count = await Booking.countDocuments({ Session_id: sessionId });

        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching session enrollment count:', error);
        res.status(500).json({ message: 'Failed to fetch enrollment count.' });
    }
});

module.exports = router;
