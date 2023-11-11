const { Server } = require('socket.io');

const io = new Server(8080, {
    cors: true
});


const emailToSocket = new Map();
const socketToEmail = new Map();

io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on("room:join", data => {
        const { email, room } = data;
        emailToSocket.set(email, socket.id);
        socketToEmail.set(socket.id, email);

        socket.join(room);
        io.to(room).emit("user:joined", { email, id: socket.id });

        // emits a 'room:joined' event back to the client 
        // that just joined the room.
        io.to(socket.id).emit("room:join", data);
    });

    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });

})