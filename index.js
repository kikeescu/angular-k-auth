const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbConnection } = require('./db/config');
require('dotenv').config();

//console.log( process.env );

// Crear el servidor/aplicacin Express
const app = express();

// Conexión a la DB
dbConnection();

// Directorio Público
app.use( express.static('public') );

// CORS (middleware)
app.use( cors() );


// Lectura y parseo del body de la peticion (otro middleware)
app.use( express.json() );


// Rutas (otro middleware)
app.use( '/api/auth', require('./routes/auth') );


// Manejar el resto de rutas:
//**************************
app.get( '*', (req, res ) => {
    res.sendFile( path.resolve( __dirname, 'public/index.html') );
});
//**************************

app.listen( process.env.PORT , () => {
    console.log(`Servidor corriendo en puerto: ${ process.env.PORT }`);
} );