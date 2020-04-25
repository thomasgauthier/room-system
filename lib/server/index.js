"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const Room_1 = __importDefault(require("./Room"));
let users = 1;
class RoomSystem {
    constructor(io, roomCreationCallback) {
        this.rooms = new Map();
        this.io = io;
        this.io.on("connection", (socket) => {
            socket.on("joinRoom", ({ room: roomId, username, password }, clb) => __awaiter(this, void 0, void 0, function* () {
                socket.join(roomId);
                const room = yield new Promise((resolve, reject) => {
                    let roomm = this.rooms.get(roomId);
                    if (roomm) {
                        resolve(roomm);
                    }
                    else {
                        roomm = new Room_1.default(roomId, "password", io, () => {
                            roomCreationCallback(roomm);
                            resolve(roomm);
                        });
                    }
                });
                this.rooms.set(roomId, room);
                try {
                    yield room.join(socket, username, password);
                    if (clb)
                        clb({ status: 200 });
                }
                catch (_a) {
                    if (clb)
                        clb({ status: 401 });
                }
            }));
        });
    }
}
module.exports = (io, roomCreationCallback) => {
    return new RoomSystem(io, roomCreationCallback);
};
//# sourceMappingURL=index.js.map