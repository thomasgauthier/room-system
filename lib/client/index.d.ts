/// <reference types="socket.io-client" />
declare class Room implements SocketIOClient.Socket {
    io: SocketIOClient.Manager;
    nsp: string;
    id: string;
    connected: boolean;
    disconnected: boolean;
    private socket;
    constructor(authentication: {
        username: string;
        room: string;
        password: string;
    }, url?: string, opts?: SocketIOClient.ConnectOpts, clb?: Function);
    request(event: string, req: any): Promise<unknown>;
    open(): SocketIOClient.Socket;
    connect(): SocketIOClient.Socket;
    send(...args: any[]): SocketIOClient.Socket;
    emit(event: string, ...args: any[]): SocketIOClient.Socket;
    close(): SocketIOClient.Socket;
    disconnect(): SocketIOClient.Socket;
    compress(compress: boolean): SocketIOClient.Socket;
    on(event: string, fn: Function): SocketIOClient.Emitter;
    addEventListener(event: string, fn: Function): SocketIOClient.Emitter;
    once(event: string, fn: Function): SocketIOClient.Emitter;
    off(event: string, fn?: Function): SocketIOClient.Emitter;
    removeListener(event: string, fn?: Function): SocketIOClient.Emitter;
    removeEventListener(event: string, fn?: Function): SocketIOClient.Emitter;
    removeAllListeners(): SocketIOClient.Emitter;
    listeners(event: string): Function[];
    hasListeners(event: string): boolean;
}
export = Room;
