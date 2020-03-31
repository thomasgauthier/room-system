/// <reference types="socket.io" />
import Room from "./Room";
import RoomPrototype from "./RoomPrototype";
export default class RoomSystem {
    rooms: Map<string, Room>;
    private io;
    roomPrototype: RoomPrototype;
    constructor(io: SocketIO.Server);
}
