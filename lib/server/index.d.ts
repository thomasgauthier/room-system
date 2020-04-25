/// <reference types="socket.io" />
import Room from "./Room";
declare class RoomSystem {
    rooms: Map<string, Room>;
    private io;
    constructor(io: SocketIO.Server, roomCreationCallback: (room: Room) => void);
}
declare const _default: (io: import("socket.io").Server, roomCreationCallback: (room: Room) => void) => RoomSystem;
export = _default;
