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

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please provide all fields' });
    }

    console.log(`Received contact form from ${name} (${email}): ${message}`);
    
    // 1. Prepare data for Discord Webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (discordWebhookUrl) {
        try {
            // Using a dynamic import for fetch if using Node 18+ or requiring it if installed
            // For universal compatibility, we'll try to use the built-in fetch if available
            const fetch = global.fetch || require('node-fetch');
            
            await fetch(discordWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: "📧 New Portfolio Message",
                        color: 3447003, // Blue
                        fields: [
                            { name: "Name", value: name, inline: true },
                            { name: "Email", value: email, inline: true },
                            { name: "Message", value: message }
                        ],
                        timestamp: new Date().toISOString()
                    }]
                })
            });
            console.log("Notification sent to Discord.");
        } catch (discordError) {
            console.error("Failed to send Discord notification:", discordError.message);
        }
    } else {
        console.warn("DISCORD_WEBHOOK_URL not found in environment variables.");
    }

    // 2. Fallback: Simulating message storage (may not persist on Render)
    const messageData = {
        name,
        email,
        message,
        date: new Date().toISOString()
    };

    const messagesPath = path.join(__dirname, 'data', 'messages.json');
    
    try {
        let messages = [];
        if (fs.existsSync(messagesPath)) {
            const fileData = fs.readFileSync(messagesPath, 'utf8');
            messages = JSON.parse(fileData);
        }
        messages.push(messageData);
        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
    } catch (fsError) {
        console.error("Local file save failed (expected on some hosts):", fsError.message);
    }

    res.status(200).json({ success: true, message: 'Message received! Thank you for reaching out.' });
});

// Serve the frontend for any other routes (Disabled for debugging)
// app.get('/{splat}*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
