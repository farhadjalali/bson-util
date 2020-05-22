/// <reference types="node" />
export declare class ID {
    constructor(id: string);
    equals(another: ID): boolean;
    toString(): string;
    id: Buffer;
    _bsontype: string;
}
export declare function stringify2(value: any): string;
export declare enum StringifyMode {
    Normal = 0,
    Bson = 1
}
export declare function stringify(json: any, mode?: StringifyMode): string;
export declare function parse(text: string, mode?: StringifyMode): any;
export declare function json2bson(json: any): any;
export declare function parse2(str: string): any;
