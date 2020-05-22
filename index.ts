export class ID {
	constructor(id: string) {
		this.id = new Uint8Array(id.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
	}

	equals(another: ID): boolean {
		return this.toString() == another.toString();
	}

	toString(): string {
		return Array.from(this.id).map(i => ('0' + i.toString(16)).slice(-2)).join('');
	}

	id: Uint8Array;
	_bsontype = 'ObjectID';
}

function getBsonValue(val: any, seen): any {
	if (val == null || typeof val == "number" || typeof val == "string" || typeof val == "boolean")
		return val;
	else if (Array.isArray(val))
		return val.map(item => getBsonValue(item, seen));
	else {
		switch (val.constructor.name.toLowerCase()) {
			case "id":
			case "objectid":
				return {"$oid": val.toString()};

			case "date":
				return {"$Date": val.toISOString()};

			case "regexp":
				return {"$RegExp": val.toString()};

			default:
				if (seen.has(val)) return seen.get(val);
				else {
					let newJson = {};
					bson2json(val, newJson, seen);
					return newJson;
				}
		}
	}
}

function bson2json(bson: any, json: any, seen): void {
	if (!seen.has(bson)) {
		seen.set(bson, json);

		for (const key in bson) {
			json[key] = getBsonValue(bson[key], seen);
		}
	}
}

export function stringify(json: any, bson: boolean = false): string {
	if (json == null) return null;

	if (!bson)
		return stringifyCircular(json);
	else {
		let seen = new WeakMap();

		if (Array.isArray(json)) {
			let array = json.map(item => getBsonValue(item, seen));
			return stringifyCircular(array);
		}

		let newJson = {};
		bson2json(json, newJson, seen);
		return stringifyCircular(newJson);
	}
}

export function parse(text: string, bson: boolean = false): any {
	if (!text) return null;
	if (typeof text != "string") {
		return text;
	}

	if (!bson)
		return parseCircular(text);
	else {
		let json = parseCircular(text);
		let seen = new WeakSet();
		return json2bson(json, seen);
	}
}

export function json2bson(json, seen): any {
	if (seen.has(json)) return json;
	seen.add(json);

	for (const key in json) {
		let val = json[key];
		if (val == null) continue;
		if (typeof val == "object") {
			if (val.$oid)
				json[key] = new ID(val.$oid);
			else if (val.$Date)
				json[key] = new Date(Date.parse(val.$Date));
			else if (val.$RegExp) {
				let match = val.$RegExp.match(/\/(.+)\/(.*)/);
				json[key] = new RegExp(match[1], match[2]);
			} else
				json[key] = json2bson(val, seen);
		}
	}
	return json;
}

function encode(data, list, seen) {
	let stored, key, value, i, l;
	let seenIndex = seen.get(data);
	if (seenIndex != null) return seenIndex;
	let index = list.length;
	let proto = Object.prototype.toString.call(data);
	if (proto === '[object Object]') {
		stored = {};
		seen.set(data, index);
		list.push(stored);
		let keys = Object.keys(data);
		for (i = 0, l = keys.length; i < l; i++) {
			key = keys[i];
			value = data[key];
			stored[key] = encode(value, list, seen);
		}
	} else if (proto === '[object Array]') {
		stored = [];
		seen.set(data, index);
		list.push(stored);
		for (i = 0, l = data.length; i < l; i++) {
			value = data[i];
			stored[i] = encode(value, list, seen);
		}
	} else {
		list.push(data);
	}
	return index
}

function decode(list) {
	let i = list.length;
	let j, k, data, key, value, proto;
	while (i--) {
		data = list[i];
		proto = Object.prototype.toString.call(data);
		if (proto === '[object Object]') {
			let keys = Object.keys(data);
			for (j = 0, k = keys.length; j < k; j++) {
				key = keys[j];
				value = list[data[key]];
				data[key] = value
			}
		} else if (proto === '[object Array]') {
			for (j = 0, k = data.length; j < k; j++) {
				value = list[data[j]];
				data[j] = value
			}
		}
	}
}

function stringifyCircular(data, space?) {
	try {
		return arguments.length === 1 ? JSON.stringify(data) : JSON.stringify(data, space);
	} catch (e) {
		let list = [];
		encode(data, list, new Map());
		return space ? ' ' + JSON.stringify(list, null, space) : ' ' + JSON.stringify(list);
	}
}

function parseCircular(data: string): any {
	let hasCircular = /^\s/.test(data);
	if (!hasCircular) {
		return JSON.parse(data);
	} else {
		let list = JSON.parse(data);
		decode(list);
		return list[0]
	}
}
