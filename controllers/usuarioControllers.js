import Usuario from '../models/Usuario.js';
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js';

const registrar = async (req,res) => {
    // valido si existe email 
    const {email} = req.body;
    const existeEmailUsuario = await Usuario.findOne({email});
    if (existeEmailUsuario){
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({msg:error.message});
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();
        
        // enviar mail de registro 
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        });

        res.json({msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar tu Cuenta"});
    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req,res) => {
    // comprobar que el usuario existe 
    const {email, password} = req.body; 
    
    const usuarioExiste = await Usuario.findOne({email});
    if(!usuarioExiste){
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg:error.message});
    }
    // comprobar si el usuario esta confirmado 
    if(!usuarioExiste.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(404).json({msg:error.message});
    } 

    // comprobar su pass     
    if(await usuarioExiste.comprobarPassword(password)){
        res.json({
            _id:usuarioExiste._id,
            nombre:usuarioExiste.nombre,
            email:usuarioExiste.email,
            token: generarJWT(usuarioExiste._id)
        })
    } else {    
        const error = new Error('El Password es Incorrecto');
        return res.status(404).json({msg:error.message});
    }

}

const confirmar = async (req, res) => {
    const {token} = req.params;
    const existeTokenUsuario = await Usuario.findOne({token});
    if(!existeTokenUsuario){
        const error = new Error('Token no valido');
        return res.status(404).json({msg:error.message});
    } 

    try {
        existeTokenUsuario.confirmado = true;
        existeTokenUsuario.token = "";
        await existeTokenUsuario.save();
        res.json({msg: "Usuario confirmado correctamente"});    
    } catch (error) {
        console.log(error);
    }

}

const olvidePassword = async (req, res) => {
    // comprobar que el usuario existe 
    const {email} = req.body; 
    
    const usuarioExiste = await Usuario.findOne({email});
    if(!usuarioExiste){
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg:error.message});
    }

    try {
        usuarioExiste.token = generarId();
        await usuarioExiste.save();

        // enviar mail
        emailOlvidePassword({
            email: usuarioExiste.email,
            nombre: usuarioExiste.nombre,
            token: usuarioExiste.token
        })
        res.json({msg:'Hemos enviado un email con las instrucciones'});
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;

    const existeTokenUsuario = await Usuario.findOne({token});

    if(existeTokenUsuario){
        res.json({msg:'Token valido y el usuario existe'})
    } else {
        const error = new Error('Token no valido');
        return res.status(404).json({msg:error.message});
    }
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token});

    if(usuario){
        usuario.password = password;
        usuario.token = "";
        try {
            await usuario.save();
            res.json({msg:'Password Modificado Correctamente'});
        } catch (error) {
            console.log(error);
        }
    } else {
        const error = new Error('Token no valido');
        return res.status(404).json({msg:error.message});
    }
}

const perfil = (req, res) => {
    const {usuario} = req;
    res.json(usuario);
}
export {
        registrar,
        autenticar,
        confirmar,
        olvidePassword,
        comprobarToken,
        nuevoPassword,
        perfil
        }; 