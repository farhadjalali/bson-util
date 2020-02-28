"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main = require("./main");
describe("parse", () => {
    test("simple objectid", () => {
        let jsonText = "{\"_id\": {\"$oid\":\"5e4d167d186e2305c0760ace\"}}";
        let json = main.parse(jsonText);
        expect(typeof json == "object").toBeTruthy();
        expect(json._id).not.toBeNull();
        expect(json._id._bsontype).not.toBeNull();
        expect(json._id._bsontype).toBe("ObjectID");
    });
});
//# sourceMappingURL=main.test.js.map