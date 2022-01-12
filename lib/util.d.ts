import { MinLogEntry } from './types';
export declare let jsonStringifyReplacer: (_key: string, value: any) => unknown;
export declare let keepOnlyExtra: <T extends MinLogEntry>(logEntry: T) => Partial<T>;
