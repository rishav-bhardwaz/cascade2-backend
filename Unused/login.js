const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Route to handle login requests
app.post('/login', (req, res) => {
    // Retrieve email and password from the request body
    const { email, password } = req.body;

    // Here, you would typically validate the login credentials
    // For demonstration, let's assume the login is successful if email and password are not empty
    if (email && password) {
        // If login is successful, send a success response
        res.status(200).send('Login successful');
    } else {
        // If login fails, send a failure response
        res.status(401).send('Login failed');
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});