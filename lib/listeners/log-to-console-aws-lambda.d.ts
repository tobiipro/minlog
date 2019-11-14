import { MinLogListener } from '../types';
export declare let format: (formatArgs_0: string, ...formatArgs_1: any[]) => void;
export declare let logToConsoleAwsLambda: (cfg?: {
    /**
     * Any log entry less important that cfg.level is ignored.
     */
    level?: string | number;
}) => MinLogListener;
export default logToConsoleAwsLambda;
