class SimpleTupleMap<T extends [...any[]]> {
  private map: {
    keys: T[];
    values: any[];
  } = { keys: [], values: [] };

  set(key: T, value: Function) {
    this.map.keys.push(key);
    this.map.values.push(value);
  }

  get(key: T) {
    const index = this.map.keys.findIndex((k, index) =>
      k.every(member => member === key[index])
    );

    if (index >= 0) {
      return this.map.values[index];
    } else {
      return null;
    }
  }

  delete(key: T) {
    const index = this.map.keys.findIndex((k, index) =>
      k.every(member => member === key[index])
    );

    if (index >= 0) {
      const value = this.map.values[index];

      this.map.keys.splice(index, 1);
      this.map.values.splice(index, 1);

      return value;
    }

    return null;
  }
}

export = SimpleTupleMap;
