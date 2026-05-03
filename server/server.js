require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = {};
const socketToRoom = {};
const socketToPosition = [];

io.on("connection", (socket) => {
  socket.on("join room", (data) => {
    const roomID = data.roomID;
    // Required so io.to(roomID) / socket.to(roomID) deliver to this game room
    socket.join(roomID);

    if (users[roomID]) {
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const indexInRoom = socketToPosition.filter((p) => p.room === roomID).length;
    socketToPosition.push({
      id: socket.id,
      room: roomID,
      name: data.name,
      x: 380 + (indexInRoom % 4) * 80,
      y: 100 + Math.floor(indexInRoom / 4) * 70,
      direction: null,
      quit: false,
    });
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);
    socket.emit("all users", usersInThisRoom);

    // Sync positions to everyone in the room (joiner is already in roomID)
    const tempPositions = socketToPosition.filter((pos) => pos.room === roomID);
    io.to(roomID).emit("receive move", { all: tempPositions });
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("send message", (data) => {
    const roomID = socketToRoom[socket.id];
    if (roomID) {
      socket.to(roomID).emit("receive message", data);
    }
  });

  socket.on("send move", (data) => {
    let me = {};
    for (let i = 0; i < socketToPosition.length; i++) {
      if (socketToPosition[i].id === data.id) {
        socketToPosition[i].x = data.x;
        socketToPosition[i].y = data.y;
        socketToPosition[i].direction = data.direction;
        socketToPosition[i].quit = data.quit;
        me = socketToPosition[i];
        break;
      }
    }
    let tempPositions = socketToPosition.filter(
      (pos) => pos.room === data.room
    );
    const roomID = socketToRoom[socket.id];
    if (roomID) {
      io.to(roomID).emit("receive move", { all: tempPositions, me: me });
    }
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
    // Remove from socketToPosition array (it's an array, not an object)
    const index = socketToPosition.findIndex((pos) => pos.id === socket.id);
    if (index !== -1) {
      socketToPosition.splice(index, 1);
    }
    if (roomID) {
      io.to(roomID).emit("user left", socket.id);
      const tempPositions = socketToPosition.filter((pos) => pos.room === roomID);
      io.to(roomID).emit("receive move", { all: tempPositions, me: null });
    }

    delete socketToRoom[socket.id];
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  // Serve React app for all routes (required for React Router)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

const port = process.env.PORT || 3001;
const host = process.env.HOST || "0.0.0.0"; // Listen on all interfaces for network access
server.listen(port, host, () => {
  console.log(
    `Server is running on http://${
      host === "0.0.0.0" ? "localhost" : host
    }:${port}`
  );
  if (host === "0.0.0.0") {
    console.log(`Server is accessible from your local network`);
  }
});

// require('dotenv').config();
// const express = require("express");
// const http = require("http");
// const app = express();
// const cors = require("cors");
// const { Server } = require("socket.io");

// app.use(cors());

// const server = http.createServer(app);

// const io = new Server(server, {
// 	cors: {
// 		origin: "*",
// 		methods: ["GET", "POST"],
// 	},
// })

// const users = {};
// const socketToRoom = {};
// const socketToPosition = [];

// io.on('connection', socket => {
//     socket.on("join room", roomID => {
//         if (users[roomID]) {
//             users[roomID].push(socket.id);
//         } else {
//             users[roomID] = [socket.id];
//         }

//         socketToRoom[socket.id] = roomID;
//         socketToPosition.push({ id: socket.id, room: roomID, x: 400, y: 100 });
//         const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
//         socket.emit('all users', usersInThisRoom);
//     });

//     socket.on("sending signal", payload => {
//         io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
//     });

//     socket.on("returning signal", payload => {
//         io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
//     });

//     socket.on('send message', (data) => {
// 		socket.broadcast.emit('receive message', data)
// 	})

// 	socket.on('send move', (data) => {
//         let me = {};
//         for (let i = 0; i < socketToPosition.length; i ++) {
//             if (socketToPosition[i].id === data.id) {
//                 socketToPosition[i].x = data.x;
//                 socketToPosition[i].y = data.y;
//                 me = socketToPosition[i];
//                 break;
//             }
//         }
//         let tempPositions = socketToPosition.filter(pos => pos.room === data.room);
// 		socket.broadcast.emit('receive move', { all: tempPositions, me: me});
//         io.to(data.id).emit('receive move', { all: tempPositions, me: me });
// 	})

//     socket.on('disconnect', () => {
//         const roomID = socketToRoom[socket.id];
//         let room = users[roomID];
//         if (room) {
//             room = room.filter(id => id !== socket.id);
//             users[roomID] = room;
//         }
//         socket.broadcast.emit('user left', socket.id);
//     });
// });

// server.listen(3001, () => console.log('server is running on port 3001'));
