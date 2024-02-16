import Requerimiento from "../models/Requerimiento.js";
import Tarea from "../models/Tareas.js";

const agregarTarea = async (req, res) => {
    // valido si existe el requerimiento 
    const {requerimiento} = req.body;
    const existeRequerimiento = await Requerimiento.findById(requerimiento);
    if(!existeRequerimiento){
        const error = new Error ("El Requerimiento no existe");
        return res.status(404).json({msg:error.message});
    } 

    if(existeRequerimiento.creador.toString() !== req.usuario._id.toString()){
        const error = new Error ("No tienes los permisos para añadir tareas");
        return res.status(404).json({msg:error.message});  
    }

    try {
        // op1 
        //const tarea = new Tarea(req.body);
        //const tareaAlmacenada = await tarea.save();

        // op2 
        const tareaAlmacenada = await Tarea.create(req.body);
        
        existeRequerimiento.tareas.push(tareaAlmacenada._id);
        await existeRequerimiento.save();
        return res.json(tareaAlmacenada); 

    } catch (error) {
        console.log(error);
    }
};
const obtenerTarea = async (req, res) => {
    const {id} = req.params;
    const existeTarea = await Tarea.findById(id).populate("requerimiento");
    
    if(!existeTarea){
        const error = new Error ("No existe Tarea");
        return res.status(404).json({msg:error.message});  
    }

    if(existeTarea.requerimiento.creador.toString() !== req.usuario._id.toString()){
        const error = new Error ("Accion no valida");
        return res.status(403).json({msg:error.message});  
    }

    res.json(existeTarea);

};
const actualizarTarea = async (req, res) => {
    const {id} = req.params;
    const existeTarea = await Tarea.findById(id).populate("requerimiento");
    
    if(!existeTarea){
        const error = new Error ("No existe Tarea");
        return res.status(404).json({msg:error.message});  
    }

    if(existeTarea.requerimiento.creador.toString() !== req.usuario._id.toString()){
        const error = new Error ("Accion no valida");
        return res.status(403).json({msg:error.message});  
    }
 
    existeTarea.nombre = req.body.nombre || existeTarea.nombre;
    existeTarea.descripcion = req.body.descripcion || existeTarea.descripcion;
    existeTarea.fechaEntrega = req.body.fechaEntrega || existeTarea.fechaEntrega;
    existeTarea.prioridad = req.body.prioridad || existeTarea.prioridad;

    try {
        const tareaAlmacenada = await existeTarea.save();
        return res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error);        
    }


};
const eliminarTarea = async (req, res) => {
    const {id} = req.params;
    const existeTarea = await Tarea.findById(id).populate("requerimiento");
    
    if(!existeTarea){
        const error = new Error ("No existe Tarea");
        return res.status(404).json({msg:error.message});  
    }

    if(existeTarea.requerimiento.creador.toString() !== req.usuario._id.toString()){
        const error = new Error ("Accion no valida");
        return res.status(403).json({msg:error.message});  
    }

    try {
        const requerimiento = await Requerimiento.findById(existeTarea.requerimiento);
        requerimiento.tareas.pull(existeTarea._id);
        await Promise.allSettled([await requerimiento.save(), await existeTarea.deleteOne()]);
                
        res.json({msg:'La Tarea se elimino'});
    } catch (error) {
        console.log(error);        
    }
};
const cambiarEstado = async (req, res) => {
    const {id} = req.params;
    const existeTarea = await Tarea.findById(id).populate("requerimiento");
    
    if(!existeTarea){
        const error = new Error ("No existe Tarea");
        return res.status(404).json({msg:error.message});  
    }

    if(existeTarea.requerimiento.creador.toString() !== req.usuario._id.toString() &&
        !existeTarea.requerimiento.desarrolladores.some(desa => desa._id.toString() === req.usuario._id.toString())
    ){
        const error = new Error ("Accion no valida");
        return res.status(403).json({msg:error.message});  
    }

    existeTarea.estado = !existeTarea.estado;
    existeTarea.completado = req.usuario._id;
    await existeTarea.save();

    const tareaActualizada = await Tarea.findById(id)
    .populate("requerimiento")
    .populate("completado");

    res.json(tareaActualizada);
};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}