const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017';
const dbName = 'Cascade';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/Cascade', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define the User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  location: String
});

const User = mongoose.model('users', userSchema);

const ngoSchema = new mongoose.Schema({
  Name: String,
  PhoneNo: String,
  Address: String,
  Email: String,
  Website: String,
});
const NGO = mongoose.model('NGOs', ngoSchema);

// API endpoint to fetch NGOs
app.get('/api/NGOs', async (req, res) => {
  try {
    console.log('Fetching NGOs from database...');
    const NGOs = await NGO.find({});
    console.log('NGOs fetched');
    res.json(NGOs);
  } catch (err) {
    console.error('Error fetching NGOs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve NGO.html
app.get('/NGO.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'NGO.html'));
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// API endpoint to fetch users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'Signup.html'));
});

app.post('/submit', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received form data:', { email, password });
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users');
    const user = await collection.findOne({ email });
    if (user && password === user.password) {
      console.log("Login successful");

      res.send('/Main.html');
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});


app.post('/signup', async (req, res) => {
  const { name, email, password, location } = req.body;
  console.log('Received form data:', { name, email, password, location });
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users');
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already exists');
    }
    if (!isValidPassword(password)) {
      return res.status(400).send('Password must be at least 8 characters long and contain at least one special character');
    }
    const result = await collection.insertOne({ name: name, email: email, password: password, location: location });
    console.log('User data inserted successfully:', result.insertedId);
    res.send("/Main.html");
  } catch (error) {
    console.error('Error inserting user data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[!@#$%^&*])([a-zA-Z0-9!@#$%^&*]{8,})$/;
  return passwordRegex.test(password);
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});