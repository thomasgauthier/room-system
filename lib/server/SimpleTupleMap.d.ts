declare class SimpleTupleMap<T extends [...any[]]> {
    private map;
    set(key: T, value: Function): void;
    get(key: T): any;
    delete(key: T): any;
}
export = SimpleTupleMap;
