const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://YOUR-FRONTEND.vercel.app",
];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    })
);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

const userSocketMap = {};
const socketRoomMap = {}; // NEW

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join-room", ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socketRoomMap[socket.id] = roomId; // store room
        socket.join(roomId);

        const clients = Array.from(
            io.sockets.adapter.rooms.get(roomId) || []
        ).map((socketId) => ({
            socketId,
            username: userSocketMap[socketId],
        }));

        io.to(roomId).emit("joined", {
            clients,
            socketId: socket.id,
        });
    });

    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-change", { code });
    });

    socket.on("sync-code", ({ socketId, code }) => {
        io.to(socketId).emit("code-change", { code });
    });

    socket.on("language-change", ({ roomId, language }) => {
        socket.to(roomId).emit("language-change", { language });
    });

    socket.on("sync-language", ({ socketId, language }) => {
        io.to(socketId).emit("sync-language", { language });
    });

    socket.on("leave-room", ({ roomId }) => {
        const username = userSocketMap[socket.id];

        socket.leave(roomId);

        io.to(roomId).emit("user-left", {
            socketId: socket.id,
            username,
        });

        delete userSocketMap[socket.id];
        delete socketRoomMap[socket.id];
    });

    socket.on("disconnect", () => {
        const username = userSocketMap[socket.id];
        const roomId = socketRoomMap[socket.id];

        if (roomId) {
            io.to(roomId).emit("user-left", {
                socketId: socket.id,
                username,
            });
        }

        delete userSocketMap[socket.id];
        delete socketRoomMap[socket.id];
    });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});