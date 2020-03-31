/// <reference types="socket.io" />
import EventEmitter from "eventemitter3";
export interface Client {
    socket: SocketIO.Socket;
    id: string;
}
export interface RoomEvents {
    emptyTimeout: [Room];
    userJoin: [Room, string, SocketIO.Socket];
}
export declare type RequestCallback = (socket: SocketIO.Socket, req: any, res: Function) => void;
export interface RequestHandler {
    event: string | symbol;
    callback: RequestCallback;
}
declare type MessageHandlerListener = (socket: SocketIO.Socket, args: any[]) => void;
export interface MessageHandler {
    event: string | symbol;
    listener: MessageHandlerListener;
}
export default class Room extends EventEmitter<RoomEvents> {
    name: string;
    io: any;
    clients: Client[];
    private emptyTimeout;
    requestHandlers: RequestHandler[];
    messageHandlers: MessageHandler[];
    messageListenerBindedMap: Map<MessageHandlerListener, MessageHandlerListener>;
    customData: {
        [key: string]: any;
    };
    constructor(name: string, io: SocketIO.Server);
    onEmptyTimeout(): void;
    broadcast(channel: string, obj: any): void;
    addRequestHandler(handler: RequestHandler): void;
    removeRequestHandler(handler: RequestHandler): void;
    addMessageHandler(handler: MessageHandler): void;
    removeMessageHandler(handler: MessageHandler): void;
    private addRequestHandlerToSocket;
    private addMessageHandlerToSocket;
    get sockets(): import("socket.io").Socket[];
    join(socket: SocketIO.Socket, id: string): Room;
}
export {};
