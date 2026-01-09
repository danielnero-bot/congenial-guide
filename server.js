const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/projects', (req, res) => {
    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    fs.readFile(projectsPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read projects data' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please provide all fields' });
    }

    // In a real application, you would send an email here or save to a database.
    console.log(`Received contact form from ${name} (${email}): ${message}`);
    
    // Simulating message storage
    const messageData = {
        name,
        email,
        message,
        date: new Date().toISOString()
    };

    const messagesPath = path.join(__dirname, 'data', 'messages.json');
    
    let messages = [];
    if (fs.existsSync(messagesPath)) {
        const fileData = fs.readFileSync(messagesPath, 'utf8');
        messages = JSON.parse(fileData);
    }
    
    messages.push(messageData);
    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

    res.status(200).json({ success: true, message: 'Message received! Thank you for reaching out.' });
});

// Serve the frontend for any other routes (Disabled for debugging)
// app.get('/{splat}*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
