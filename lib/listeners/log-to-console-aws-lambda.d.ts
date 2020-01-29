import { MinLogLevel, MinLogListener } from '../types';
import { Fn, MaybePromise } from 'lodash-firecloud/types';
declare global {
    namespace NodeJS {
        interface WriteStream {
            _handle: import('stream').Pipe & {
                setBlocking: (blocking: boolean) => void;
            };
        }
    }
}
declare module '../types' {
    interface MinLogEntry {
        ctx?: {
            awsRequestId?: string;
        };
    }
}
export interface Cfg {
    /**
     * Any log entry less important that cfg.level is ignored.
     */
    level?: MinLogLevel;
}
export declare let format: (formatArgs_0: string, ...formatArgs_1: any[]) => void;
export declare let logToConsoleAwsLambda: (cfg?: Cfg | Promise<Cfg> | Fn<MaybePromise<Cfg>, unknown[]>) => MinLogListener;
export default logToConsoleAwsLambda;
