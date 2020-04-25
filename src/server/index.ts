import Room from "./Room";
import randomStringGenerator from "../utils/randomStringGenerator";
let users = 1;

class RoomSystem {
  rooms: Map<string, Room> = new Map<string, Room>();
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server, roomCreationCallback: (room: Room) => void) {
    this.io = io;

    this.io.on("connection", (socket: SocketIO.Socket) => {
      socket.on(
        "joinRoom",
        async (
          {
            room: roomId,
            username,
            password,
          }: { username: string; room: string; password: string },
          clb
        ) => {
          socket.join(roomId);

          if (!username) {
            username = randomStringGenerator();
          }

          const room: Room = await new Promise((resolve, reject) => {
            let room = this.rooms.get(roomId);
            if (room) {
              resolve(room);
            } else {
              room = new Room(roomId, "password", io, () => {
                roomCreationCallback(room);
                resolve(room);
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
        }
      );
    });
  }
}

export = (
  io: SocketIO.Server,
  roomCreationCallback: (room: Room) => void
): RoomSystem => {
  return new RoomSystem(io, roomCreationCallback);
};
