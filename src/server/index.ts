import Room, {
  RequestHandler,
  MessageHandler,
  RequestCallback,
  RoomEvents
} from "./Room";
import RoomPrototype from "./RoomPrototype";
import { ListenerFn } from "eventemitter3";

export default class RoomSystem {
  rooms: Map<string, Room> = new Map<string, Room>();
  private io: SocketIO.Server;

  roomPrototype: RoomPrototype = {
    messageHandlers: [],

    requestHandlers: [],

    eventListeners: [],

    addRequestHandler: (event: string | symbol, callback: RequestCallback) => {
      const previousHandlerIndex = this.roomPrototype.requestHandlers.findIndex(
        ({ event }) => event === event
      );

      if (previousHandlerIndex < 0) {
        this.roomPrototype.requestHandlers.push({ event, callback });
      } else {
        this.roomPrototype.requestHandlers[previousHandlerIndex] = {
          event,
          callback
        };
      }

      for (var [name, room] of this.rooms) {
        room.addRequestHandler({ event, callback });
      }
    },

    removeRequestHandler: (
      event: string | symbol,
      callback: RequestCallback
    ) => {
      const previousHandlerIndex = this.roomPrototype.requestHandlers.findIndex(
        ({ event }) => event === event
      );

      const previousHandler = this.roomPrototype.requestHandlers[
        previousHandlerIndex
      ];

      for (var [name, room] of this.rooms) {
        room.removeRequestHandler(previousHandler);
      }

      if (previousHandlerIndex >= 0) {
        this.roomPrototype.requestHandlers.splice(previousHandlerIndex, 1);
      }
    },

    addMessageHandler: (
      event: string | symbol,
      listener: (...args: any[]) => void
    ) => {
      this.roomPrototype.messageHandlers.push({ event, listener });

      for (var [name, room] of this.rooms) {
        room.addMessageHandler({ event, listener });
      }
    },

    removeMessageHandler: (
      event: string | symbol,
      listener: (...args: any[]) => void
    ) => {
      const previousHandlerIndex = this.roomPrototype.messageHandlers.findIndex(
        ({ event }) => event === event
      );

      const previousHandler = this.roomPrototype.requestHandlers[
        previousHandlerIndex
      ];

      for (var [name, room] of this.rooms) {
        room.removeMessageHandler({ event, listener });
      }
    },

    on: <T extends keyof RoomEvents>(
      event: T,
      listener: ListenerFn<T extends keyof RoomEvents ? RoomEvents[T] : never>,
      context?: any
    ): void => {
      for (var [name, room] of this.rooms) {
        room.on(event, listener);
      }

      this.roomPrototype.eventListeners.push({ event, listener });
    },

    off: <T extends keyof RoomEvents>(
      event: T,
      listener: ListenerFn<T extends keyof RoomEvents ? RoomEvents[T] : never>,
      context?: any
    ): void => {
      for (var [name, room] of this.rooms) {
        room.off(event, listener);
      }

      const eventListenerIndex = this.roomPrototype.eventListeners.findIndex(
        el => el.event == event && el.listener == listener
      );

      if (eventListenerIndex >= 0) {
        this.roomPrototype.eventListeners.splice(eventListenerIndex, 1);
      }
    }
  };

  constructor(io: SocketIO.Server) {
    this.io = io;

    this.io.on("connection", (socket: SocketIO.Socket) => {
      socket.on("joinRoom", (room, clb) => {
        socket.join(room);

        let roomm = this.rooms.get(room);

        if (!roomm) {
          roomm = new Room(room, io);

          for (const messageHandler of this.roomPrototype.messageHandlers) {
            roomm.addMessageHandler(messageHandler);
          }

          for (const requestHandle of this.roomPrototype.requestHandlers) {
            roomm.addRequestHandler(requestHandle);
          }

          for (const eventListener of this.roomPrototype.eventListeners) {
            roomm.on(eventListener.event, eventListener.listener);
          }
        }

        this.rooms.set(room, roomm);

        const username = `randomString${Math.random()}`;
        roomm.join(socket, username);

        // roomm.request("allo", function(req, res) {
        //   res(roomm.clients.length);
        // });

        clb?.call(null, username);
      });
    });
  }
}

// const RoomDatabase = (io: SocketIO.Server) => {
//   return {
//     addRoom: function(name: string) {
//       const room: Room = new Room(name, io);
//       room.on("emptyTimeout", () => {
//         this.removeRoom(room);
//       });

//       rooms.set(room.name, room);

//       return room;
//     },

//     removeRoom: function(room: Room) {
//       rooms.delete(room.name);
//     },

//     getRoom: function(name: string) {
//       return rooms.get(name);
//     },

//     isEmpty: function() {
//       return rooms.size;
//     }
//   };
// };
