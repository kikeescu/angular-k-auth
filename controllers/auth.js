const { response } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async( req, res = response ) =>{  // "res = response"  es para el tipado y ayuda

    console.log( ' ' );
    console.log( '------> Crear usuario <-------' );
    const { name, email, password } = req.body;
    console.log('name: ', name);
    console.log('email: ', email);
    console.log('password: ', password);

    try {
        
        // Verificar que el email no exista
        const usuario = await Usuario.findOne({ email: email});

        if( usuario ){
            return res.status(400).json({
                ok: false,
                msg: "El usuario ya existe con ese email"
            });
        }

        // Crear el usuario usando el modelo
        const dbUser = new Usuario( req.body );

    
        // Encriptar (Hashear) la contraseña 
        const salt =  bcrypt.genSaltSync(); 
        dbUser.password = bcrypt.hashSync( password, salt );
    
    
        // generar el JWT (Json Web Token)
        const token = await generarJWT( dbUser.id, name );

        // Crear el usuari en la DB
        await dbUser.save();
    
     
        // Generar respuesta exitosa
        return res.status(201).json({
            ok: true,
            uid: dbUser.id,
            name: name,
            email: email,
            token
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error, consulte con el administrador'
        });
    }

}


const loginUsuario = async ( req, res = response ) => {

    console.log( ' ' );
    console.log( '------> Login <-------' );
    const { email, password } = req.body;
    console.log('email: ', email);
    console.log('password: ', password);

    try {

        // leemos de la BD por email
        const dbUser = await Usuario.findOne({ email });

        if ( !dbUser ) {

            return res.status(400).json({
                ok: false,
                msg: 'El correo no existe'
            });
        }

        // Confirmar si el password coincide
        const validPassword = bcrypt.compareSync( password, dbUser.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'El password no es válido'
            }); 
        }

        // Generar el JWT
        const token = await generarJWT( dbUser.id, dbUser.name );

         //Respuesta:
         return res.json({  // por defecto status 200
            ok: true,
            uid: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            token
         });

        
    } catch (error) {
        console.log(error);
        return  res.status(500).json({
            ok: false,
            msg: 'Ha ocurrido un error. Pongase en contacto con el Administrador.'
        });
    }

}

const revalidarToken = async ( req, res = response) => {
   
    console.log( ' ' );
    console.log( '------> Revalidar token <-------' );
    const { uid } = req;
    console.log('uid: ', uid);
    

    //Leemos de la BD por uid
    const dbUser = await Usuario.findById(uid);
    console.log('name: ', dbUser.name);
    console.log("email: ", dbUser.email);
    
    //Generar el JWT
    const token = await generarJWT( uid, dbUser.name, dbUser.email);

    return res.json({
        ok: true,
        uid,  //uid: uid ...
        name: dbUser.name,
        email: dbUser.email,
        token
    });

}



module.exports = {
    crearUsuario,  //crearUsuario: crearUsuario
    loginUsuario,
    revalidarToken
}