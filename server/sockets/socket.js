const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios');

const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        // console.log(data);
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre es necesario'
            });

        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));

        callback(usuarios.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje', (data, callback) => {
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.emit('crearMensaje', mensaje);
        // client.broadcast.to(persona.sala).emit('crearMensaje', crearMensaje('Administrador', `${persona.nombre} se unio al chat`));
        callback(mensaje);
    });

    client.on('disconnect', () => {
        let personaborrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaborrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaborrada.nombre} abandonó el chat`));
        client.broadcast.to(personaborrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaborrada.sala));

    });

    //Mensajes privados
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    });
});