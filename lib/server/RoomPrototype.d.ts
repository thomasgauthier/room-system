import { MessageHandler, RequestHandler, RequestCallback, RoomEvents } from "./Room";
import { ListenerFn } from "eventemitter3";
export default interface RoomPrototype {
    messageHandlers: MessageHandler[];
    requestHandlers: RequestHandler[];
    eventListeners: {
        event: keyof RoomEvents;
        listener: (...args: any[]) => void;
    }[];
    addRequestHandler: (event: string | symbol, callback: RequestCallback) => void;
    removeRequestHandler: (event: string | symbol, callback: RequestCallback) => void;
    addMessageHandler: (event: string | symbol, listener: (...args: any[]) => void) => void;
    removeMessageHandler: (event: string | symbol, listener: (...args: any[]) => void) => void;
    on: <T extends (keyof RoomEvents)>(event: T, fn: ListenerFn<T extends keyof RoomEvents ? RoomEvents[T] : never>, context?: any) => void;
    off: <T extends (keyof RoomEvents)>(event: T, fn: ListenerFn<T extends keyof RoomEvents ? RoomEvents[T] : never>, context?: any) => void;
}
