import express from 'express';
import {registrar,
        autenticar,
        confirmar,
        olvidePassword,
        comprobarToken,
        nuevoPassword,
        perfil } from '../controllers/usuarioControllers.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// Autenticacion, registro y confirmacion de usuarios 
router.post('/', registrar); // crea un nuevo usuario 
router.post('/login', autenticar); // login usuario
router.get('/confirmar/:token', confirmar); // confirma cuenta usuario 
router.post('/olvide-password', olvidePassword); // confirma cuenta usuario 
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword); // confirma cuenta usuario y nuevo pass 

router.get('/perfil', checkAuth, perfil);

export default router;