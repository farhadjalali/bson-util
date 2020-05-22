"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse2 = exports.json2bson = exports.parse = exports.stringify = exports.StringifyMode = exports.stringify2 = exports.ID = void 0;
class ID {
    constructor(id) {
        this._bsontype = 'ObjectID';
        this.id = Buffer.from(id, "hex");
    }
    equals(another) {
        return this.id.toString("hex") == another.id.toString("hex");
    }
    toString() {
        return this.id.toString("hex");
    }
}
exports.ID = ID;
function stringify2(value) {
    value._0 = "";
    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return { _$: value._0 };
                }
                for (const attr in value) {
                    let val = value[attr];
                    if (val) {
                        if (val.constructor.toString() == "ObjectId")
                            value[attr] = { "$oid": val.toString() };
                        else if (val.constructor == RegExp)
                            value[attr] = { "$reg": val.toString() };
                        else if (val instanceof Date)
                            value[attr] = { "$date": val.toString() };
                    }
                }
                seen.add(value);
            }
            return value;
        };
    };
    const seen = new WeakSet();
    const setKeys = (obj, parentKey) => {
        if (seen.has(obj))
            return;
        seen.add(obj);
        for (const key in obj) {
            let val = obj[key];
            if (!val)
                continue;
            if (typeof val === "object" && val.constructor.toString() == "ObjectId") {
                if (val._0 == null) {
                    val._0 = parentKey + (Array.isArray(obj) ? `[${key}]` : `['${key}']`);
                }
                setKeys(val, val._0);
            }
        }
    };
    setKeys(value, "");
    let str = JSON.stringify(value, getCircularReplacer());
    return str;
}
exports.stringify2 = stringify2;
var StringifyMode;
(function (StringifyMode) {
    StringifyMode[StringifyMode["Normal"] = 0] = "Normal";
    StringifyMode[StringifyMode["Bson"] = 1] = "Bson";
})(StringifyMode = exports.StringifyMode || (exports.StringifyMode = {}));
function bson2json(bson) {
    if (bson == null)
        return bson;
    if (Array.isArray(bson)) {
        let json = [];
        for (const item of bson) {
            json.push(bson2json(item));
        }
        return json;
    }
    let json = {};
    for (const key in bson) {
        let val = bson[key];
        if (val == null)
            json[key] = val;
        else if (typeof val == "number" || typeof val == "string" || typeof val == "boolean")
            json[key] = val;
        else {
            switch (val.constructor.name.toLowerCase()) {
                case "id":
                case "objectid":
                    json[key] = { "$oid": val.toString() };
                    break;
                case "date":
                    json[key] = { "$Date": val.toISOString() };
                    break;
                case "regexp":
                    json[key] = { "$RegExp": val.toString() };
                    break;
                default:
                    json[key] = bson2json(val);
                    break;
            }
        }
    }
    return json;
}
function stringify(json, mode = StringifyMode.Normal) {
    if (json == null)
        return null;
    switch (mode) {
        case StringifyMode.Normal:
            return JSON.stringify(json);
        case StringifyMode.Bson:
            let _json = bson2json(json);
            return JSON.stringify(_json);
    }
}
exports.stringify = stringify;
function parse(text, mode = StringifyMode.Normal) {
    if (!text)
        return null;
    switch (mode) {
        case StringifyMode.Normal:
            return JSON.parse(text);
        case StringifyMode.Bson:
            let json = JSON.parse(text);
            return json2bson(json);
    }
}
exports.parse = parse;
function json2bson(json) {
    for (const key in json) {
        let val = json[key];
        if (val == null)
            continue;
        if (typeof val == "object") {
            if (val.$oid)
                json[key] = new ID(val.$oid);
            else if (val.$Date)
                json[key] = new Date(Date.parse(val.$Date));
            else if (val.$RegExp) {
                let match = val.$RegExp.match(/\/(.+)\/(.*)/);
                json[key] = new RegExp(match[1], match[2]);
            }
            else
                json[key] = json2bson(val);
        }
    }
    return json;
}
exports.json2bson = json2bson;
function parse2(str) {
    let json = typeof str == "string" ? JSON.parse(str) : str;
    let keys = {};
    const findKeys = (obj) => {
        if (obj && obj._0) {
            keys[obj._0] = obj;
            delete obj._0;
        }
        for (let key in obj) {
            if (typeof obj[key] === "object")
                findKeys(obj[key]);
        }
    };
    const seen = new WeakSet();
    const replaceRef = (obj) => {
        if (seen.has(obj))
            return;
        seen.add(obj);
        for (let key in obj) {
            let val = obj[key];
            if (!val)
                continue;
            if (typeof val === "object") {
                if (val.$oid) {
                    obj[key] = new ID(val.$oid);
                    continue;
                }
                if (val.$date) {
                    obj[key] = new Date(val.$date);
                    continue;
                }
                if (val._$ == "") {
                    obj[key] = json;
                }
                else if (val._$) {
                    obj[key] = eval('json' + val._$);
                }
                replaceRef(val);
            }
        }
    };
    delete json._0;
    findKeys(json);
    replaceRef(json);
    return json;
}
exports.parse2 = parse2;
//# sourceMappingURL=bson-util.js.map