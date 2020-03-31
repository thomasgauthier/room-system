"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const DELETE_ROOM_TIMEOUT = 5 * 60 * 1000;
class Room extends eventemitter3_1.default {
    constructor(name, io) {
        super();
        this.clients = [];
        this.emptyTimeout = null;
        this.name = name;
        this.io = io;
    }
    // public isUsernameTaken(id: string): boolean {
    //   return this.clients.findIndex(c => c.id === id) >= 0;
    // }
    onEmptyTimeout() {
        this.emit("emptyTimeout");
    }
    broadcast(channel, obj) {
        this.io.to(this.name).emit(channel, obj);
    }
    joinRoom(socket, id) {
        clearTimeout(this.emptyTimeout);
        let existingClient = this.clients.find(c => c.id === id);
        if (existingClient) {
            existingClient.socket = socket;
        }
        else {
            const client = { socket, id };
            this.clients.push(client);
        }
        socket.on("allow", () => {
            this.broadcast("pop", "pwe");
        });
        socket.on("disconnect", () => {
            let index = this.clients.findIndex(c => c.socket !== socket);
            if (index >= 0) {
                this.clients.splice(index, 1);
            }
            if (this.clients.length === 0) {
                this.emptyTimeout = setTimeout(this.onEmptyTimeout.bind(this), DELETE_ROOM_TIMEOUT);
            }
        });
        return this;
    }
}
exports.default = Room;
//# sourceMappingURL=Room.js.map