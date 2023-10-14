const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar el almacenamiento de Multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); // Utilizar 'path' para obtener una ruta absoluta
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '_' + file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single('image');

// Ruta para insertar la imagen y guardarla en la base de datos
router.post('/add', upload, (req, res) => {
    if (req.file) {
        const movie = new Movie({
            title: req.body.title,
            year: req.body.year,
            genre: req.body.genre,
            image: req.file.filename,
        });
        movie.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'Movie added successfully'
            };
            res.redirect('/');
        })
        .catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
    } else {
        // Manejar el caso en el que no se cargó ningún archivo
        res.json({ message: 'No file uploaded', type: 'danger' });
    }
});

// Traer todas las películas
router.get('/', (req, res) => {
    Movie.find({})
        .then(movies => {
            res.render('index', {
                title: 'Home Page',
                movies: movies // Pasar las películas a la vista
            });
        })
        .catch(err => {
            console.error(err);
            // Manejar errores
        });
});

// Crear la ruta para la página de agregar películas
router.get('/add', (req, res) => {
    res.render('add_movies', {
        title: 'Add Movies'
    });
});

// Editar una película
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const movie = await Movie.findById(id).exec();

        if (!movie) {
            return res.redirect('/');
        }

        res.render('edit_movies.ejs', {
            title: 'Edit Movie',
            movie: movie,
        });
    } catch (err) {
        console.error(err);
        // Manejar errores
        res.redirect('/');
    }
});

// Ruta para actualizar una película
router.post('/update/:id', upload, (req, res) => {
    const id = req.params.id;
    const update = {
        title: req.body.title,
        year: req.body.year,
        genre: req.body.genre,
    };

    if (req.file) {
        update.image = req.file.filename;
    } else {
        // Si no se envió una nueva imagen, usa la imagen existente (se guarda en un campo oculto en el formulario).
        update.image = req.body.old_image;
    }

    Movie.findByIdAndUpdate(id, update)
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'Movie updated successfully'
            };
            res.redirect('/');
        })
        .catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
});

// Eliminar una película
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    
    try {
        const movie = await Movie.findOneAndRemove({ _id: id });
        if (movie && movie.image !== '') {
            const imagePath = path.join(__dirname, '../uploads', movie.image);
            fs.unlinkSync(imagePath);
        }

        req.session.message = {
            type: 'info',
            message: 'Movie deleted successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router;
