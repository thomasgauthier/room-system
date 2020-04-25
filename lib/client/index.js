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
const socket_io_client_1 = __importDefault(require("socket.io-client"));
class Room {
    constructor(authentication, url, opts, clb) {
        this.socket = socket_io_client_1.default(url, opts);
        this.socket.emit("joinRoom", authentication, function (ack) {
            clb === null || clb === void 0 ? void 0 : clb.call(null, ack);
        });
    }
    request(event, req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    this.socket.emit(event, req, function (res) {
                        resolve(res);
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
    open() {
        return this.socket.open();
    }
    connect() {
        return this.socket.connect();
    }
    send(...args) {
        return this.socket.send(...args);
    }
    emit(event, ...args) {
        return this.socket.emit(event, ...args);
    }
    close() {
        return this.socket.close();
    }
    disconnect() {
        return this.socket.disconnect();
    }
    compress(compress) {
        return this.socket.compress(compress);
    }
    on(event, fn) {
        return this.socket.on(event, fn);
    }
    addEventListener(event, fn) {
        return this.socket.addEventListener(event, fn);
    }
    once(event, fn) {
        return this.socket.once(event, fn);
    }
    off(event, fn) {
        return this.socket.off(event, fn);
    }
    removeListener(event, fn) {
        return this.socket.removeListener(event, fn);
    }
    removeEventListener(event, fn) {
        return this.socket.removeEventListener(event, fn);
    }
    removeAllListeners() {
        return this.socket.removeAllListeners();
    }
    listeners(event) {
        return this.socket.listeners(event);
    }
    hasListeners(event) {
        return this.socket.hasListeners(event);
    }
}
module.exports = Room;
//# sourceMappingURL=index.js.map