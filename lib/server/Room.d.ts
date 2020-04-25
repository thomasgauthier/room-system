/// <reference types="socket.io" />
import EventEmitter from "eventemitter3";
import SimpleTupleMap from "./SimpleTupleMap";
export interface Client {
    socket: SocketIO.Socket;
    id: string;
}
export interface RoomEvents {
    emptyTimeout: [Room];
    userJoin: [Room, string, SocketIO.Socket];
    userLeave: [Room, string, SocketIO.Socket];
}
export declare type RequestCallback = (socket: SocketIO.Socket, req: any, res: Function) => void;
export interface RequestHandler {
    event: string | symbol;
    callback: RequestCallback;
}
export declare type MessageHandlerListener = (socket: SocketIO.Socket, ...args: any[]) => void;
export interface MessageHandler {
    event: string | symbol;
    listener: MessageHandlerListener;
}
export default class Room extends EventEmitter<RoomEvents> {
    name: string;
    hash: string;
    io: any;
    clients: Client[];
    private emptyTimeout;
    requestHandlers: RequestHandler[];
    messageHandlers: MessageHandler[];
    customData: {
        [key: string]: any;
    };
    messageHandlerMap: SimpleTupleMap<[SocketIO.Socket, Function]>;
    constructor(name: string, password: string, io: SocketIO.Server, callback?: Function);
    isUsernameTaken(id: string): boolean;
    onEmptyTimeout(): void;
    broadcast(channel: string, obj: any): void;
    addRequestHandler(event: string | symbol, callback: RequestCallback): void;
    removeRequestHandler(event: string | symbol): void;
    addMessageHandler(event: string | symbol, listener: MessageHandlerListener): void;
    removeMessageHandler(handler: MessageHandler): void;
    private addRequestHandlerToSocket;
    private addMessageHandlerToSocket;
    get sockets(): import("socket.io").Socket[];
    join(socket: SocketIO.Socket, id: string, password: string): Promise<Room>;
}
