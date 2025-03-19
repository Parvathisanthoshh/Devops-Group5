const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');
 
const userRoutes = require('./routes/userRoutes');
 
const app = express();
 
const db = config.get('mongoURI');
 
// Middleware
app.use(express.json());
app.use(cors());
 
mongoose
.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));
 
// Routes
app.use('/api/auth', userRoutes);
 
// Sample Route
app.get('/', (req, res) => {
    res.send('Patient Information System API');
});
 
// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));