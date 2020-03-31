import EventEmitter from "eventemitter3";

const DELETE_ROOM_TIMEOUT = 5 * 60 * 1000;

export interface Client {
  socket: SocketIO.Socket;
  id: string;
}

export interface RoomEvents {
  emptyTimeout: [Room];
  userJoin: [Room, string, SocketIO.Socket];
}

export type RequestCallback = (
  socket: SocketIO.Socket,
  req: any,
  res: Function
) => void;

export interface RequestHandler {
  event: string | symbol;
  callback: RequestCallback;
}

type MessageHandlerListener = (socket: SocketIO.Socket, args: any[]) => void;

export interface MessageHandler {
  event: string | symbol;
  listener: MessageHandlerListener;
}

export default class Room extends EventEmitter<RoomEvents> {
  name: string;

  io: any;

  clients: Client[] = [];

  private emptyTimeout: NodeJS.Timeout = null;

  requestHandlers: RequestHandler[] = [];
  messageHandlers: MessageHandler[] = [];

  messageListenerBindedMap: Map<
    MessageHandlerListener,
    MessageHandlerListener
  > = new Map<MessageHandlerListener, MessageHandlerListener>();

  customData: { [key: string]: any } = {};

  constructor(name: string, io: SocketIO.Server) {
    super();
    this.name = name;

    this.io = io;
  }

  // public isUsernameTaken(id: string): boolean {
  //   return this.clients.findIndex(c => c.id === id) >= 0;
  // }

  onEmptyTimeout() {
    this.emit("emptyTimeout", this);
  }

  broadcast(channel: string, obj: any) {
    this.io.to(this.name).emit(channel, obj);
  }

  addRequestHandler(handler: RequestHandler) {
    const previousHandlerIndex = this.requestHandlers.findIndex(
      ({ event }) => event === handler.event
    );

    if (previousHandlerIndex >= 0) {
      this.requestHandlers[previousHandlerIndex] = handler;
    } else {
      this.requestHandlers.push(handler);
    }

    for (const socket of this.sockets) {
      this.addRequestHandlerToSocket(socket, handler);
    }
  }

  removeRequestHandler(handler: RequestHandler) {
    const previousHandlerIndex = this.requestHandlers.findIndex(
      ({ event }) => event === handler.event
    );

    if (previousHandlerIndex >= 0) {
      this.requestHandlers.splice(previousHandlerIndex, 1);

      for (const socket of this.sockets) {
        socket.removeAllListeners(handler.event);
      }
    }
  }

  addMessageHandler(handler: MessageHandler) {
    const previousHandlerIndex = this.messageHandlers.findIndex(
      ({ event }) => event === handler.event
    );

    if (previousHandlerIndex >= 0) {
      this.messageHandlers[previousHandlerIndex] = handler;
    } else {
      this.messageHandlers.push(handler);
    }

    for (const socket of this.sockets) {
      this.addMessageHandlerToSocket(socket, handler);
    }
  }

  removeMessageHandler(handler: MessageHandler) {
    const previousHandlerIndex = this.messageHandlers.findIndex(
      ({ event }) => event === handler.event
    );

    if (previousHandlerIndex >= 0) {
      const previousHandler = this.messageHandlers[previousHandlerIndex];
      this.messageHandlers.splice(previousHandlerIndex, 1);

      let listener = this.messageListenerBindedMap.get(
        previousHandler.listener
      );

      for (const socket of this.sockets) {
        socket.off(previousHandler.event, listener);
        this.messageListenerBindedMap.delete(previousHandler.listener);
      }
    }
  }

  private addRequestHandlerToSocket(
    socket: SocketIO.Socket,
    handler: RequestHandler
  ) {
    socket.removeAllListeners(handler.event);
    socket.on(handler.event, (req: any, callback: Function) => {
      handler.callback.call(this, socket, req, callback);
    });
  }

  private addMessageHandlerToSocket(
    socket: SocketIO.Socket,
    handler: MessageHandler
  ) {
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

  join(socket: SocketIO.Socket, id: string): Room {
    clearTimeout(this.emptyTimeout);

    socket.on;

    let existingClient = this.clients.find(c => c.id === id);
    if (existingClient) {
      existingClient.socket = socket;
    } else {
      const client = { socket, id };
      this.clients.push(client);
    }

    socket.on("disconnect", () => {
      let index = this.clients.findIndex(c => c.socket !== socket);

      if (index >= 0) {
        this.clients.splice(index, 1);
      }

      if (this.clients.length === 0) {
        this.emptyTimeout = setTimeout(
          this.onEmptyTimeout.bind(this),
          DELETE_ROOM_TIMEOUT
        );
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
