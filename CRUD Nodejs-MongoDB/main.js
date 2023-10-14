//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session  = require('express-session');    

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

const db = mongoose.connection;

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}))

app.use((req, res, next)=>{
    res.locals.message =req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static(__dirname + '/uploads')); //para archivos estaticos

//motor de plantillas
app.set('view engine', 'ejs');  


//prefijo de ruta
app.use('', require('./routes/routes'));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});