import Requerimiento from '../models/Requerimiento.js';
import Tarea from '../models/Tareas.js';
import Usuario from '../models/Usuario.js';

const obtenerRequerimientos = async (req, res) => {
    const requerimientos = await Requerimiento.find({
        '$or': [
            {'desarrolladores' : {$in:req.usuario}},
            {'creador' : {$in:req.usuario}}
        ]
    })
    .select('-tareas');
    res.json(requerimientos);
};
const nuevoRequerimiento = async (req, res) => {
    const requerimiento = new Requerimiento(req.body);
    requerimiento.creador = req.usuario._id;

    try {
        const requerimientoAlmacenado = await requerimiento.save();
        res.json(requerimientoAlmacenado);
    } catch (error) {
        console.log(error);
    }
};
const obtenerRequerimiento = async (req, res) => {
    const { id } = req.params;
    try {
        const requerimiento = await Requerimiento.findById(id)
        .populate({path:"tareas", populate: {path: "completado", select: "nombre"}})
        .populate('desarrolladores', 'nombre email');

        if (!requerimiento) {
            return res.status(404).json({ msg: "No Encontrado" });
        }
        if (requerimiento.creador.toString() !== req.usuario._id.toString() && 
            !requerimiento.desarrolladores.some(desa => desa._id.toString() === req.usuario._id.toString())) {
            return res.status(401).json({ msg: "Accion No Valida" });
        }

        // obtener las tareas de un proyecto 
        const tareas = await Tarea.find().where("requerimiento").equals(requerimiento._id);
        res.json(requerimiento);

    } catch (error) {
        return res.status(404).json({ msg: 'El id ingresado es invalido' });
    }

};

const editarRequerimiento = async (req, res) => {
    const { id } = req.params;

    try {
        const requerimiento = await Requerimiento.findById(id);

        if (!requerimiento) {
            return res.status(404).json({ msg: "No Encontrado" });
        }
        if (requerimiento.creador.toString() !== req.usuario._id.toString()) {
            return res.status(401).json({ msg: "Accion No Valida" });
        }

        requerimiento.titulo = req.body.titulo || requerimiento.titulo;
        requerimiento.descripcion = req.body.descripcion || requerimiento.descripcion;
        requerimiento.fechaEntrega = req.body.fechaEntrega || requerimiento.fechaEntrega;
        requerimiento.aplicacion = req.body.aplicacion || requerimiento.aplicacion;
        requerimiento.cliente = req.body.cliente || requerimiento.cliente;

        try {
            const requerimientoActualizado = await requerimiento.save();
            res.json(requerimientoActualizado);
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        return res.status(404).json({ msg: 'El id ingresado es invalido' });
    }
};

const eliminarRequerimiento = async (req, res) => {
    const { id } = req.params;
    try {
        const requerimiento = await Requerimiento.findById(id);

        if (!requerimiento) {
            return res.status(404).json({ msg: "No Encontrado" });
        }
        if (requerimiento.creador.toString() !== req.usuario._id.toString()) {
            return res.status(401).json({ msg: "Accion No Valida" });
        }

        try {
            await requerimiento.deleteOne();
            res.json({ msg: 'Requerimiento Eliminado' });
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        return res.status(404).json({ msg: 'El id ingresado es invalido' });
    }
};
const buscarDesarrollador = async (req, res) => {
    const {email} = req.body; 
    const usuario = await Usuario.findOne({email}).select('-confirmado -password -token -__v');

    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg:error.message});
    }

    res.json(usuario);
};
const agregarDesarrollador = async (req, res) => { 
    const requerimiento = await Requerimiento.findById(req.params.id);
    // existe requerimiento
    if(!requerimiento){
        const error = new Error('Requerimiento no encontrado');
        return res.status(404).json({msg:error.message});
    }

    // el creado del req puede agregar desarrolladores 
    if(requerimiento.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(404).json({msg:error.message});
    }

    const {email} = req.body; 
    const usuario = await Usuario.findOne({email}).select('-confirmado -password -token -__v -createdAt -updatedAt');

    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg:error.message});
    }

    // que el desarrollador no sea el admin del req 
    if(requerimiento.creador.toString() === usuario._id.toString()){
        const error = new Error('el creador del requerimiento no puede ser desarrollador');
        return res.status(404).json({msg:error.message});
    } 

    // si el desarrollador ya esta en el req 
    if(requerimiento.desarrolladores.includes(usuario._id)){
        const error = new Error('el desarrollador ya pertenece al requerimiento');
        return res.status(404).json({msg:error.message});
    }

    // esta ok, agregar 
    requerimiento.desarrolladores.push(usuario._id);
    await requerimiento.save();
    res.json({msg:'Desarrollador agregado correctamente'});

};
const eliminarDesarrollador = async (req, res) => {
    const requerimiento = await Requerimiento.findById(req.params.id);

    // existe requerimiento
    if(!requerimiento){
        const error = new Error('Requerimiento no encontrado');
        return res.status(404).json({msg:error.message});
    }

    // el creado del req puede agregar desarrolladores 
    if(requerimiento.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(404).json({msg:error.message});
    }

    // esta ok, para eliminar  
    requerimiento.desarrolladores.pull(req.body.id);

    await requerimiento.save();
    res.json({msg:'Desarrollador eliminado correctamente'});

 };

export {
    obtenerRequerimientos,
    nuevoRequerimiento,
    obtenerRequerimiento,
    editarRequerimiento,
    eliminarRequerimiento,
    buscarDesarrollador,
    agregarDesarrollador,
    eliminarDesarrollador
}