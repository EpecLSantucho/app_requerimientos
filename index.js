import express from "express";
import conectarDB from "./config/db.js";
import dotenv from "dotenv";
import usuarioRouter from './routes/usuarioRoutes.js';
import requerimientoRouter from './routes/requerimientoRoutes.js';
import tareasRouter from './routes/tareaRoutes.js';
import cors from 'cors';

const app = express();
app.use(express.json()); // habilito recibir datos en formato json 

dotenv.config();

conectarDB();

// configurar CORS 
const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback){ 
     if(whiteList.includes(origin)){
        callback(null, true);
    }   else {
        callback(new Error('Error de CORS'));
    }   
    }
};

app.use(cors(corsOptions));

// routing 
app.use('/api/usuarios', usuarioRouter);
app.use('/api/requerimientos', requerimientoRouter);
app.use('/api/tareas', tareasRouter);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`servidor corriendo en el puerto ${PORT}`);
})

// conexion socket.io 
import {Server} from 'socket.io'
const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on('connection', (socket) => {
    //console.log('conectado a socket.io');

    // Definir los evento de socket.io
    socket.on('abrir proyecto', (requerimiento) => {
        socket.join(requerimiento);
    });

    socket.on('nueva tarea', (tarea) => {
        
        const requerimiento = tarea.requerimiento;
        //console.log(requerimiento);
        //console.log(tarea);
        socket.to(requerimiento).emit('tarea agregada', tarea);
    });

    socket.on('eliminar tarea', (tarea) => {
        const requerimiento = tarea.requerimiento;
        socket.to(requerimiento).emit('tarea eliminada', tarea);
    }) 

    socket.on('actualizar tarea', tarea => {
        const requerimiento = tarea.requerimiento._id;
        socket.to(requerimiento).emit('tarea actualizada', tarea);
    }) 

    socket.on('cambiar estado', tarea => {
        const requerimiento = tarea.requerimiento._id;
        socket.to(requerimiento).emit('nuevo estado', tarea);
    })

    
})