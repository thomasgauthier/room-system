"use strict";
class SimpleTupleMap {
    constructor() {
        this.map = { keys: [], values: [] };
    }
    set(key, value) {
        this.map.keys.push(key);
        this.map.values.push(value);
    }
    get(key) {
        const index = this.map.keys.findIndex((k, index) => k.every(member => member === key[index]));
        if (index >= 0) {
            return this.map.values[index];
        }
        else {
            return null;
        }
    }
    delete(key) {
        const index = this.map.keys.findIndex((k, index) => k.every(member => member === key[index]));
        if (index >= 0) {
            const value = this.map.values[index];
            this.map.keys.splice(index, 1);
            this.map.values.splice(index, 1);
            return value;
        }
        return null;
    }
}
module.exports = SimpleTupleMap;
//# sourceMappingURL=SimpleTupleMap.js.map