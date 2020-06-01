import {ID, stringify, parse} from "../index";
import {ObjectID} from "bson";

const sampleObjectID = "5e4d167d186e2305c0760ace";

test("test ID equals", () => {
	let id1 = new ID(sampleObjectID);
	let id2 = new ID(sampleObjectID);
	expect(id1.equals(id2)).toBeTruthy();
});

test("test ObjectID", () => {
	let id = {_id: new ObjectID(sampleObjectID)};
	let text = `{"_id":{"$oid":"${sampleObjectID}"}}`;
	let oid = parse(text, true, ObjectID);
	expect(oid.toString()).toBe(id.toString());
});

describe("simple", () => {
	let json = {
		name: "Canada",
		enable: true,
		no: null,
		age: 10.5
	};
	let text = `{"name":"Canada","enable":true,"no":null,"age":10.5}`;

	expect(parse(json as any)).toBe(json);

	test("stringify null", () => {
		let _text = stringify(null);
		expect(_text).toBeNull();
	});

	test("stringify", () => {
		let _text = stringify(json);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text);
		expect(_json).toStrictEqual(json);
	});

	test("parse empty", () => {
		let _json = parse("");
		expect(_json).toBeNull();
	});
});

describe("simple array", () => {
	let json = {
		addresses: [{city: "London"}, {city: "Paris"}],
		enable: true,
	};
	let text = `{"addresses":[{"city":"London"},{"city":"Paris"}],"enable":true}`;

	test("stringify", () => {
		let _text = stringify(json);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text);
		expect(_json).toStrictEqual(json);
	});
});

describe("bson simple", () => {
	let json = {
		_id: new ID(sampleObjectID),
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
		let _text = stringify(json, true);
		expect(_text).toBe(text);
	});

	test("bson simple parse", () => {
		let _json = parse(text, true);
		expect(_json).toEqual(json);
	});

});

describe("bson nested", () => {
	let json = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		address: {city: "London"}
	};
	let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","address":{"city":"London"}}`;

	test("stringify", () => {
		let _text = stringify(json, true);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, true);
		expect(_json).toEqual(json);
	});
});

describe("bson array", () => {
	let json = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		addresses: [{city: "London"}, {city: "Paris"}]
	};
	let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","addresses":[{"city":"London"},{"city":"Paris"}]}`;

	test("stringify", () => {
		let _text = stringify(json, true);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, true);
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
		let _text = stringify(json, true);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, true);
		expect(_json).toEqual(json);
	});
});

describe("bson circular", () => {
	let json = {
		name: "Shila",
		age: [30, 40],
		_id: {"name": sampleObjectID},
		self: null
	};
	json.self = json;
	let text = ` [{"name":1,"age":2,"_id":5,"self":0},"Shila",[3,4],30,40,{"name":6},"${sampleObjectID}"]`;

	test("stringify", () => {
		let _text = stringify(json, false);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, false);
		expect(_json).toEqual(json);
	});
});

describe("bson circular bson", () => {
	let json = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		self: null
	};
	json.self = json;
	let text = ` [{"_id":1,"name":3,"self":0},{"$oid":2},"5e4d167d186e2305c0760ace","Shila"]`;

	test("stringify", () => {
		let _text = stringify(json, true);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, true);
		expect(_json).toEqual(json);
	});
});

describe("bson array circular bson", () => {
	let json = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		self: null
	};
	json.self = json;
	let array = [json, json];
	let text = ` [[1,1],{"_id":2,"name":4,"self":1},{"$oid":3},"5e4d167d186e2305c0760ace","Shila"]`;

	test("stringify", () => {
		let _text = stringify(array, true);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, true);
		expect(_json).toEqual(array);
	});
});

describe("array of bson", () => {
	let json = [new ID(sampleObjectID), new ID(sampleObjectID)];
	let text = `[{"$oid":"${sampleObjectID}"},{"$oid":"${sampleObjectID}"}]`;

	test("stringify", () => {
		let _text = stringify(json, true);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, true);
		expect(_json).toEqual(json);
	});
});

describe("inner array of bson", () => {
	let json = {"ids": [new ID(sampleObjectID), new ID(sampleObjectID)]};
	let text = `{"ids":[{"$oid":"${sampleObjectID}"},{"$oid":"${sampleObjectID}"}]}`;

	test("stringify", () => {
		let _text = stringify(json, true);
		expect(_text).toBe(text);
	});

	test("parse", () => {
		let _json = parse(text, true);
		expect(_json).toEqual(json);
	});
});

describe("generate ID", () => {
	let newID = ID.generate();
	let newIDStr = newID.toString();
	expect(newIDStr.length).toEqual(24);

	let newID2 = ID.generate();
	let newIDStr2 = newID2.toString();
	expect(newIDStr2.length).toEqual(24);
});
