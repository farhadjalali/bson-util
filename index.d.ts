export declare class ID {
    constructor(id: string);
    static increment: number;
    static machine: number;
    static pid: number;
    static generateByBrowser(): ID;
    static generate(): ID;
    equals(another: ID): boolean;
    toString(): string;
    id: Uint8Array;
    _bsontype: string;
}
export declare function getBsonValue(val: any, seen: any): any;
export declare function stringify(json: any, bson?: boolean): string;
export declare function parse(text: string, bson?: boolean, oidType?: any): any;
export declare function json2bson(json: any, seen: any, oidType: any): any;
