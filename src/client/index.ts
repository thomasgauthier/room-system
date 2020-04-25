import io from "socket.io-client";

class Room implements SocketIOClient.Socket {
  io: SocketIOClient.Manager;
  nsp: string;
  id: string;
  connected: boolean;
  disconnected: boolean;

  private socket: SocketIOClient.Socket;

  constructor(
    authentication: { username: string; room: string; password: string },
    url?: string,
    opts?: SocketIOClient.ConnectOpts,
    clb?: Function
  ) {
    this.socket = io(url, opts);

    this.socket.emit("joinRoom", authentication, function (ack: any) {
      clb?.call(null, ack);
    });
  }

  async request(event: string, req: any) {
    return new Promise((resolve, reject) => {
      try {
        this.socket.emit(event, req, function (res: any) {
          resolve(res);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  open(): SocketIOClient.Socket {
    return this.socket.open();
  }
  connect(): SocketIOClient.Socket {
    return this.socket.connect();
  }
  send(...args: any[]): SocketIOClient.Socket {
    return this.socket.send(...args);
  }
  emit(event: string, ...args: any[]): SocketIOClient.Socket {
    return this.socket.emit(event, ...args);
  }
  close(): SocketIOClient.Socket {
    return this.socket.close();
  }
  disconnect(): SocketIOClient.Socket {
    return this.socket.disconnect();
  }
  compress(compress: boolean): SocketIOClient.Socket {
    return this.socket.compress(compress);
  }
  on(event: string, fn: Function): SocketIOClient.Emitter {
    return this.socket.on(event, fn);
  }
  addEventListener(event: string, fn: Function): SocketIOClient.Emitter {
    return this.socket.addEventListener(event, fn);
  }
  once(event: string, fn: Function): SocketIOClient.Emitter {
    return this.socket.once(event, fn);
  }
  off(event: string, fn?: Function): SocketIOClient.Emitter {
    return this.socket.off(event, fn);
  }
  removeListener(event: string, fn?: Function): SocketIOClient.Emitter {
    return this.socket.removeListener(event, fn);
  }
  removeEventListener(event: string, fn?: Function): SocketIOClient.Emitter {
    return this.socket.removeEventListener(event, fn);
  }
  removeAllListeners(): SocketIOClient.Emitter {
    return this.socket.removeAllListeners();
  }
  listeners(event: string): Function[] {
    return this.socket.listeners(event);
  }
  hasListeners(event: string): boolean {
    return this.socket.hasListeners(event);
  }
}

export = Room;
