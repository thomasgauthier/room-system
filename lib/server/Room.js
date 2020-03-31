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
        this.requestHandlers = [];
        this.messageHandlers = [];
        this.messageListenerBindedMap = new Map();
        this.customData = {};
        this.name = name;
        this.io = io;
    }
    // public isUsernameTaken(id: string): boolean {
    //   return this.clients.findIndex(c => c.id === id) >= 0;
    // }
    onEmptyTimeout() {
        this.emit("emptyTimeout", this);
    }
    broadcast(channel, obj) {
        this.io.to(this.name).emit(channel, obj);
    }
    addRequestHandler(handler) {
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
    removeRequestHandler(handler) {
        const previousHandlerIndex = this.requestHandlers.findIndex(({ event }) => event === handler.event);
        if (previousHandlerIndex >= 0) {
            this.requestHandlers.splice(previousHandlerIndex, 1);
            for (const socket of this.sockets) {
                socket.removeAllListeners(handler.event);
            }
        }
    }
    addMessageHandler(handler) {
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
            let listener = this.messageListenerBindedMap.get(previousHandler.listener);
            for (const socket of this.sockets) {
                socket.off(previousHandler.event, listener);
                this.messageListenerBindedMap.delete(previousHandler.listener);
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
        let listener = this.messageListenerBindedMap.get(handler.listener);
        if (!listener) {
            listener = (...args) => {
                handler.listener.call(this, socket, ...args);
            };
            this.messageListenerBindedMap.set(handler.listener, listener);
        }
        socket.on(handler.event, listener);
    }
    get sockets() {
        return this.clients.map(client => client.socket);
    }
    join(socket, id) {
        clearTimeout(this.emptyTimeout);
        socket.on;
        let existingClient = this.clients.find(c => c.id === id);
        if (existingClient) {
            existingClient.socket = socket;
        }
        else {
            const client = { socket, id };
            this.clients.push(client);
        }
        socket.on("disconnect", () => {
            let index = this.clients.findIndex(c => c.socket !== socket);
            if (index >= 0) {
                this.clients.splice(index, 1);
            }
            if (this.clients.length === 0) {
                this.emptyTimeout = setTimeout(this.onEmptyTimeout.bind(this), DELETE_ROOM_TIMEOUT);
            }
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
        return this;
    }
}
exports.default = Room;
//# sourceMappingURL=Room.js.map