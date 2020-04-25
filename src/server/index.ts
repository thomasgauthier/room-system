import Room from "./Room";

let users = 1;

class RoomSystem {
  rooms: Map<string, Room> = new Map<string, Room>();
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server, roomCreationCallback: (room: Room) => void) {
    this.io = io;

    this.io.on("connection", (socket: SocketIO.Socket) => {
      socket.on("joinRoom", async ({ room: roomId, username, password } : {username:string, room:string, password:string}, clb) => {
        socket.join(roomId);

        const room: Room = await new Promise((resolve, reject) => {
          let roomm = this.rooms.get(roomId);
          if (roomm) {
            resolve(roomm);
          } else {
            roomm = new Room(roomId, "password", io, () => {
              roomCreationCallback(roomm);
              resolve(roomm);
            });
          }
        });

        this.rooms.set(roomId, room);

        try {
          await room.join(socket, username, password);
          if (clb) clb({ status: 200 });
        } catch {
          if (clb) clb({ status: 401 });
        }
      });
    });
  }
}

export = (
  io: SocketIO.Server,
  roomCreationCallback: (room: Room) => void
): RoomSystem => {
  return new RoomSystem(io, roomCreationCallback);
};