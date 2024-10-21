const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MySQL Database connection (adjusted for your database)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Assuming you're using default MySQL username
    password: '', // Leave empty if you don’t have a password
    database: 'hospital-management-system' // Your database name as per your setup
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.io connection event
io.on('connection', (socket) => {
    console.log('New user connected');

    // Listen for messages from clients
    socket.on('message', (data) => {
        console.log('Message received: ', data);

        // Save message to MySQL database
        const query = 'INSERT INTO chat_messages (message) VALUES (?)';
        db.query(query, [data], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return;
            }
            console.log('Message saved to database with ID:', result.insertId); // Log the ID of the inserted message
        });

        // Broadcast the message to all connected clients
        io.emit('message', data);
    });

    // Listen for user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Define the port the server will listen on
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
