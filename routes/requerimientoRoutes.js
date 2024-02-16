import express from 'express';
import {
    obtenerRequerimientos,
    nuevoRequerimiento,
    obtenerRequerimiento,
    editarRequerimiento,
    eliminarRequerimiento,
    buscarDesarrollador,
    agregarDesarrollador,
    eliminarDesarrollador
} from '../controllers/requerimientoControllers.js';

import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.route('/')
    .get(checkAuth,obtenerRequerimientos)
    .post(checkAuth,nuevoRequerimiento);

router.route('/:id')
    .get(checkAuth, obtenerRequerimiento)
    .put(checkAuth, editarRequerimiento)
    .delete(checkAuth, eliminarRequerimiento)

router.post('/desarrolladores', checkAuth, buscarDesarrollador);
router.post('/desarrolladores/:id', checkAuth, agregarDesarrollador);
router.post('/eliminar-desarrollador/:id', checkAuth, eliminarDesarrollador);


export default router;