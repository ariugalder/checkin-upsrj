const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.use(express.json());

mongoose
  .connect('mongodb://127.0.0.1:27017/checkinupsrj', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log('Oh no! MongoDB connection error!');
    console.log(err);
  });

// Define un esquema para el modelo "Alumno"
const alumnoSchema = new mongoose.Schema({
  name: String,
  id: { type: String, unique: true },
  career: String,
  email: { type: String, unique: true },
  password: String,
  lastCheckInTime: String, // Nuevo campo para almacenar la última hora de check-in
});

// Crea el modelo "Alumno" utilizando el esquema definido
const Alumno = mongoose.model('Alumno', alumnoSchema);

// Define un esquema para el modelo "CheckIn"
const checkInSchema = new mongoose.Schema({
  dateTime: String,
  user: String,
});

// Crea el modelo "CheckIn" utilizando el esquema definido
const CheckIn = mongoose.model('CheckIn', checkInSchema);

app.get('/alumnos', async (req, res) => {
  try {
    const alumnos = await Alumno.find();
    res.json(alumnos);
  } catch (error) {
    console.error('Error al obtener los alumnos:', error);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { name, id, career, email, password } = req.body;

    const existingAlumno = await Alumno.findOne({ $or: [{ email }, { id }] });
    if (existingAlumno) {
      res.status(400).json({ error: 'Email or ID already exists' });
      return;
    }

    const newAlumno = new Alumno({
      name,
      id,
      career,
      email,
      password,
    });

    console.log('Registrando nuevo alumno:', newAlumno);

    await newAlumno.save();

    console.log('Alumno registrado exitosamente:', newAlumno);

    res.status(201).json({ message: 'Alumno registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar el alumno:', error);
    res.status(500).json({ error: 'Error al registrar el alumno' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const alumno = await Alumno.findOne({ email });

    if (!alumno) {
      res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos' });
      return;
    }

    if (alumno.password !== password) {
      res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos' });
      return;
    }

    res.json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    res.status(500).json({ error: 'Error durante el inicio de sesión' });
  }
});

app.post('/checkin', async (req, res) => {
  try {
    const { user, dateTime } = req.body;

    console.log('Registrando check-in:', user, dateTime);

    // Verificar si el usuario ya ha realizado un check-in hoy
    const today = new Date().toLocaleDateString();
    const lastCheckIn = await CheckIn.findOne({ user }).sort({ dateTime: -1 });

    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn.dateTime).toLocaleDateString();
      if (lastCheckInDate === today) {
        res.status(400).json({ error: 'You have already checked-in today' });
        return;
      }
    }

    // Crea una instancia del modelo CheckIn con los datos proporcionados
    const newCheckIn = new CheckIn({
      user,
      dateTime,
    });

    // Guarda el nuevo check-in en la base de datos
    await newCheckIn.save();

    // Actualiza la última hora de check-in en el usuario correspondiente
    await Alumno.findOneAndUpdate({ email: user }, { lastCheckInTime: dateTime });

    console.log('Check-in guardado exitosamente:', newCheckIn);

    // Envía una respuesta de éxito
    res.status(201).json({ message: 'Check-in guardado exitosamente' });
  } catch (error) {
    console.error('Error al guardar el check-in:', error);
    res.status(500).json({ error: 'Error al guardar el check-in' });
  }
});

app.get('/checkin', async (req, res) => {
  try {
    const { user } = req.query;

    // Obtiene todos los check-ins del usuario específico
    const checkIns = await CheckIn.find({ user });

    res.json(checkIns);
  } catch (error) {
    console.error('Error al obtener los check-ins:', error);
    res.status(500).json({ error: 'Error al obtener los check-ins' });
  }
});

app.listen(3000, () => {
  console.log('Listening on PORT 3000...');
});