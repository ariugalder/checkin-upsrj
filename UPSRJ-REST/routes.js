const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define a route to fetch data from the "alumno" collection
router.get('/alumnos', async (req, res) => {
  try {
    const db = mongoose.connection;
    const collection = db.collection('alumno');

    // Retrieve all documents from the collection
    const alumnos = await collection.find().toArray();

    // Send the data as a response
    res.json(alumnos);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

module.exports = router;
