import main = require("../bson-util");
import {ID, StringifyMode} from "../bson-util";

const sampleObjectID = "5e4d167d186e2305c0760ace";

test("simple stringify", () => {
	let json = {
		name: "Canada",
		enable: true,
		no: null,
		age: 10.5,
		date: new Date(Date.UTC(2020, 0, 1)),
		match: /^\w+/g
	};
	let text = main.stringify(json);
	expect(text).toBe(`{"name":"Canada","enable":true,"no":null,"age":10.5,"date":"2020-01-01T00:00:00.000Z","match":{}}`);
});

test("simple parse", () => {
	let text = `{"name":"Canada","age":10.5}`;
	let json = main.parse(text);
	expect(json).toStrictEqual({name: "Canada", age: 10.5});
});

test("bson simple stringify", () => {
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
	let text = main.stringify(json, StringifyMode.Bson);
	expect(text).toBe(`{"_id":{"$oid":"${sampleObjectID}"},"name":"Canada","enable":true,"no":null,"age":10.5,"date":{"$Date":"2020-01-01T00:00:00.000Z"},"match":{"$RegExp":"/^\\\\w+/g"}}`);
});

test("bson simple parse", () => {
	let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Canada","enable":true,"no":null,"age":10.5,"date":{"$Date":"2020-01-01T00:00:00.000Z"},"match":{"$RegExp":"/^\\\\w+/g"}}`;
	let json = main.parse(text, StringifyMode.Bson);
	let expectedJson = {
		_id: new ID(sampleObjectID),
		name: "Canada",
		enable: true,
		no: null,
		age: 10.5,
		date: new Date(Date.UTC(2020, 0, 1)),
		match: /^\w+/g
	};
	expect(json).toEqual(expectedJson);
});

test("bson nested stringify", () => {
	let json = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		address: {city: "London"}
	};
	let text = main.stringify(json, StringifyMode.Bson);
	expect(text).toBe(`{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","address":{"city":"London"}}`);
});

test("bson nested parse", () => {
	let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","address":{"city":"London","date":{"$Date":"2020-01-01T00:00:00.000Z"}}}`;
	let json = main.parse(text, StringifyMode.Bson);
	let expectedJson = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		address: {city: "London", date: new Date(Date.UTC(2020, 0, 1))}
	};
	expect(json).toEqual(expectedJson);
});


test("bson array stringify", () => {
	let json = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		addresses: [{city: "London"}, {city: "Paris"}]
	};
	let text = main.stringify(json, StringifyMode.Bson);
	expect(text).toBe(`{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","addresses":[{"city":"London"},{"city":"Paris"}]}`);
});

test("bson array parse", () => {
	let text = `{"_id":{"$oid":"${sampleObjectID}"},"name":"Shila","addresses":[{"city":"London"},{"city":"Paris"}]}`;
	let json = main.parse(text, StringifyMode.Bson);
	let expectedJson = {
		_id: new ID(sampleObjectID),
		name: "Shila",
		addresses: [{city: "London"}, {city: "Paris"}]
	};
	expect(json).toEqual(expectedJson);
});
