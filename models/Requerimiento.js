import mongoose from "mongoose";

const requerimientoShema = mongoose.Schema({
    titulo: {
        type: String,
        trim: true,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true   
    },
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    aplicacion: {
        type: String,
        trim: true,
        required: true,
        enum: ["Sueldo", "Recursos Humanos", "Legales", "Automotores", "Mesa de Entrada", "Comercial", "Otra"]           
    },
    cliente: {
        type: String,
        trim: true,
        required: true   
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
    },
    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tarea"
        }
    ],
    desarrolladores: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario" 
        }
    ]
},{
    timestamps: true
});

const Requerimiento = mongoose.model('Requerimiento', requerimientoShema);

export default Requerimiento;