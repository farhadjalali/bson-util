"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const sampleObjectID = "5e4d167d186e2305c0760ace";
test("test ID equals", () => {
    let id1 = new index_1.ID(sampleObjectID);
    let id2 = new index_1.ID(sampleObjectID);
    expect(id1.equals(id2)).toBeTruthy();
});
describe("simple", () => {
    let json = {
        name: "Canada",
        enable: true,
        no: null,
        age: 10.5
    };
    let text = `{"name":"Canada","enable":true,"no":null,"age":10.5}`;
    expect(index_1.parse(json)).toBe(json);
    test("stringify null", () => {
        let _text = index_1.stringify(null);
        expect(_text).toBeNull();
    });
    test("stringify", () => {
        let _text = index_1.stringify(json);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text);
        expect(_json).toStrictEqual(json);
    });
    test("parse empty", () => {
        let _json = index_1.parse("");
        expect(_json).toBeNull();
    });
});
describe("simple array", () => {
    let json = {
        addresses: [{ city: "London" }, { city: "Paris" }],
        enable: true,
    };
    let text = `{"addresses":[{"city":"London"},{"city":"Paris"}],"enable":true}`;
    test("stringify", () => {
        let _text = index_1.stringify(json);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text);
        expect(_json).toStrictEqual(json);
    });
});
describe("bson simple", () => {
    let json = {
        _id: new index_1.ID(sampleObjectID),
        name: "Canada",
        enable: true,
        no: null,
        no2: undefined,
        age: 10.5,
        date: new Date(Date.UTC(2020, 0, 1)),
        match: /^\w+/g
    };
    let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Canada","enable":true,"no":null,"age":10.5,"date":{"$Date":"2020-01-01T00:00:00.000Z"},"match":{"$RegExp":"/^\\\\w+/g"}}`;
    test("stringify", () => {
        let _text = index_1.stringify(json, true);
        expect(_text).toBe(text);
    });
    test("bson simple parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(json);
    });
});
describe("bson nested", () => {
    let json = {
        _id: new index_1.ID(sampleObjectID),
        name: "Shila",
        address: { city: "London" }
    };
    let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","address":{"city":"London"}}`;
    test("stringify", () => {
        let _text = index_1.stringify(json, true);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(json);
    });
});
describe("bson array", () => {
    let json = {
        _id: new index_1.ID(sampleObjectID),
        name: "Shila",
        addresses: [{ city: "London" }, { city: "Paris" }]
    };
    let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","addresses":[{"city":"London"},{"city":"Paris"}]}`;
    test("stringify", () => {
        let _text = index_1.stringify(json, true);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(json);
    });
});
describe("simple bson circular", () => {
    let json = {
        name: "Shila",
        self: null
    };
    json.self = json;
    let text = ` [{"name":1,"self":0},"Shila"]`;
    test("stringify", () => {
        let _text = index_1.stringify(json, true);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(json);
    });
});
describe("bson circular", () => {
    let json = {
        name: "Shila",
        age: [30, 40],
        _id: { "name": sampleObjectID },
        self: null
    };
    json.self = json;
    let text = ` [{"name":1,"age":2,"_id":5,"self":0},"Shila",[3,4],30,40,{"name":6},"${sampleObjectID}"]`;
    test("stringify", () => {
        let _text = index_1.stringify(json, false);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, false);
        expect(_json).toEqual(json);
    });
});
describe("bson circular bson", () => {
    let json = {
        _id: new index_1.ID(sampleObjectID),
        name: "Shila",
        self: null
    };
    json.self = json;
    let text = ` [{"_id":1,"name":3,"self":0},{"$oid":2},"5e4d167d186e2305c0760ace","Shila"]`;
    test("stringify", () => {
        let _text = index_1.stringify(json, true);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(json);
    });
});
describe("bson array circular bson", () => {
    let json = {
        _id: new index_1.ID(sampleObjectID),
        name: "Shila",
        self: null
    };
    json.self = json;
    let array = [json, json];
    let text = ` [[1,1],{"_id":2,"name":4,"self":1},{"$oid":3},"5e4d167d186e2305c0760ace","Shila"]`;
    test("stringify", () => {
        let _text = index_1.stringify(array, true);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(array);
    });
});
describe("array of bson", () => {
    let json = [new index_1.ID(sampleObjectID), new index_1.ID(sampleObjectID)];
    let text = `[{"$oid":"${sampleObjectID}"},{"$oid":"${sampleObjectID}"}]`;
    test("stringify", () => {
        let _text = index_1.stringify(json, true);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(json);
    });
});
describe("inner array of bson", () => {
    let json = { "ids": [new index_1.ID(sampleObjectID), new index_1.ID(sampleObjectID)] };
    let text = `{"ids":[{"$oid":"${sampleObjectID}"},{"$oid":"${sampleObjectID}"}]}`;
    test("stringify", () => {
        let _text = index_1.stringify(json, true);
        expect(_text).toBe(text);
    });
    test("parse", () => {
        let _json = index_1.parse(text, true);
        expect(_json).toEqual(json);
    });
});
//# sourceMappingURL=index.test.js.map