export declare class ID {
    constructor(id: string);
    equals(another: ID): boolean;
    toString(): string;
    id: Uint8Array;
    _bsontype: string;
}
export declare function stringify(json: any, bson?: boolean): string;
export declare function parse(text: string, bson?: boolean): any;
export declare function json2bson(json: any, seen: any): any;
