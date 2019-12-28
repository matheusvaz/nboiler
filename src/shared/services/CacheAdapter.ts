import { Injectable } from '@nestjs/common';
import redis from 'redis';
import redisTesting from 'redis-mock';
import { promisify } from 'util';

@Injectable()
export class CacheAdapter {
    private client: redis.RedisClient;

    constructor() {
        this.client =
            process.env.APP_ENV === 'testing'
                ? redisTesting.createClient()
                : redis.createClient({
                      host: process.env.CACHE_HOST,
                      port: parseInt(process.env.CACHE_PORT),
                  });
    }

    public async get<T>(key: string): Promise<T> {
        const getAsync = promisify(this.client.get).bind(this.client);
        const raw = await getAsync(key);

        return JSON.parse(raw);
    }

    public async getRaw(key: string): Promise<string> {
        const getAsync = promisify(this.client.get).bind(this.client);
        return await getAsync(key);
    }

    public async set(
        key: string,
        value: string | object,
        expiry?: number,
    ): Promise<boolean> {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }

        const setAsync = promisify(this.client.set).bind(this.client);
        return await setAsync(key, value, 'EX', expiry);
    }

    public async remove(key: string): Promise<boolean> {
        const removeAsync = promisify(this.client.del).bind(this.client);
        return await removeAsync(key);
    }
}
