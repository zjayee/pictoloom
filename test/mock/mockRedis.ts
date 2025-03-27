export class MockRedis {
  private store: Record<string, any>;

  constructor() {
    this.store = {};
  }

  async set(key: string, value: any): Promise<void> {
    this.store[key] = value;
  }

  async get(key: string): Promise<any> {
    return this.store[key];
  }

  async hSet(key: string, mapping: Record<string, any>): Promise<void> {
    if (!this.store[key]) {
      this.store[key] = {};
    }
    Object.assign(this.store[key], mapping);
  }

  async hGet(key: string, field: string): Promise<any> {
    return this.store[key]?.[field];
  }

  async hGetAll(key: string): Promise<Record<string, any>> {
    return this.store[key] || {};
  }

  async hLen(key: string): Promise<number> {
    return Object.keys(this.store[key] || {}).length;
  }

  async zAdd(key: string, ...args: any[]): Promise<void> {
    if (!this.store[key]) {
      this.store[key] = [];
    }
    this.store[key].push(...args);
    this.store[key].sort((a: any, b: any) => a.score - b.score);
  }

  async zRange(key: string, start: number, end: number): Promise<any[]> {
    return this.store[key]?.slice(start, end) || [];
  }

  async zIncrBy(key: string, member: string, increment: number): Promise<void> {
    if (this.store[key]) {
      for (const entry of this.store[key]) {
        if (entry.member === member) {
          entry.score += increment;
          break;
        }
      }
    }
  }
}
