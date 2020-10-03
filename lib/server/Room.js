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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const SimpleTupleMap_1 = __importDefault(require("./SimpleTupleMap"));
const argon2 = __importStar(require("argon2"));
const DELETE_ROOM_TIMEOUT = 5 * 60 * 1000;
class Room extends eventemitter3_1.default {
    constructor(name, password, io, callback) {
        super();
        this.hash = null;
        this.clients = [];
        this.emptyTimeout = null;
        this.requestHandlers = [];
        this.messageHandlers = [];
        this.customData = {};
        this.messageHandlerMap = new SimpleTupleMap_1.default();
        this.name = name;
        this.io = io;
        if (password) {
            argon2.hash(password).then((hash) => {
                this.hash = hash;
                if (callback)
                    callback(this);
            });
        }
        else {
            if (callback)
                callback(this);
        }
    }
    isUsernameTaken(id) {
        return this.clients.findIndex(c => c.id === id) >= 0;
    }
    onEmptyTimeout() {
        this.emit("emptyTimeout", this);
    }
    broadcast(channel, obj) {
        this.io.to(this.name).emit(channel, obj);
    }
    addRequestHandler(event, callback) {
        const handler = { event, callback };
        const previousHandlerIndex = this.requestHandlers.findIndex(({ event }) => event === handler.event);
        if (previousHandlerIndex >= 0) {
            this.requestHandlers[previousHandlerIndex] = handler;
        }
        else {
            this.requestHandlers.push(handler);
        }
        for (const socket of this.sockets) {
            this.addRequestHandlerToSocket(socket, handler);
        }
    }
    removeRequestHandler(event) {
        const previousHandlerIndex = this.requestHandlers.findIndex(({ event }) => event === event);
        if (previousHandlerIndex >= 0) {
            this.requestHandlers.splice(previousHandlerIndex, 1);
            for (const socket of this.sockets) {
                socket.removeAllListeners(event);
            }
        }
    }
    addMessageHandler(event, listener) {
        const handler = { event, listener };
        const previousHandlerIndex = this.messageHandlers.findIndex(({ event }) => event === handler.event);
        if (previousHandlerIndex >= 0) {
            this.messageHandlers[previousHandlerIndex] = handler;
        }
        else {
            this.messageHandlers.push(handler);
        }
        for (const socket of this.sockets) {
            this.addMessageHandlerToSocket(socket, handler);
        }
    }
    removeMessageHandler(handler) {
        const previousHandlerIndex = this.messageHandlers.findIndex(({ event }) => event === handler.event);
        if (previousHandlerIndex >= 0) {
            const previousHandler = this.messageHandlers[previousHandlerIndex];
            this.messageHandlers.splice(previousHandlerIndex, 1);
            for (const socket of this.sockets) {
                let listener = this.messageHandlerMap.get([socket, handler.listener]);
                socket.off(previousHandler.event, listener);
            }
        }
    }
    addRequestHandlerToSocket(socket, handler) {
        socket.removeAllListeners(handler.event);
        socket.on(handler.event, (req, callback) => {
            handler.callback.call(this, socket, req, callback);
        });
    }
    addMessageHandlerToSocket(socket, handler) {
        let listener = (...args) => {
            handler.listener(socket, ...args);
        };
        this.messageHandlerMap.set([socket, handler.listener], listener);
        socket.on(handler.event, listener);
    }
    get sockets() {
        return this.clients.map((client) => client.socket);
    }
    join(socket, id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const verified = !this.hash || (yield argon2.verify(this.hash, password));
                if (!verified) {
                    reject();
                    return;
                }
                clearTimeout(this.emptyTimeout);
                socket.on;
                let existingClient = this.clients.find((c) => c.id === id);
                if (existingClient) {
                    existingClient.socket = socket;
                }
                else {
                    const client = { socket, id };
                    this.clients.push(client);
                }
                socket.on("disconnect", () => {
                    let index = this.clients.findIndex((c) => c.socket === socket);
                    if (index >= 0) {
                        this.clients.splice(index, 1);
                    }
                    if (this.clients.length === 0) {
                        this.emptyTimeout = setTimeout(this.onEmptyTimeout.bind(this), DELETE_ROOM_TIMEOUT);
                    }
                    setTimeout(() => {
                        this.emit("userLeave", this, id, socket);
                    }, 0);
                });
                for (const handler of this.requestHandlers) {
                    this.addRequestHandlerToSocket(socket, handler);
                }
                for (const handler of this.messageHandlers) {
                    this.addMessageHandlerToSocket(socket, handler);
                }
                setTimeout(() => {
                    this.emit("userJoin", this, id, socket);
                }, 0);
                resolve(this);
            }));
        });
    }
}
exports.default = Room;
//# sourceMappingURL=Room.js.map