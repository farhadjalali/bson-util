export class ID {
	constructor(id: string) {
		this.id = Buffer.from(id, "hex");
	}

	equals(another: ID): boolean {
		return this.id.toString("hex") == another.id.toString("hex");
	}

	toString(): string {
		return this.id.toString("hex");
	}

	id: Buffer;
	_bsontype = 'ObjectID';
}

export function stringify2(value): string {
	value._0 = "";

	const getCircularReplacer = () => {
		const seen = new WeakSet();
		return (key, value) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) {
					return {_$: value._0};
				}

				for (const attr in value) {
					let val = value[attr];
					if (val) {
						if (val.constructor.toString() == "ObjectId")
							value[attr] = {"$oid": val.toString()};

						else if (val.constructor == RegExp)
							value[attr] = {"$reg": val.toString()};

						else if (val instanceof Date)
							value[attr] = {"$date": val.toString()};
					}
				}
				seen.add(value);
			}
			return value;
		};
	};

	const seen = new WeakSet();
	const setKeys = (obj, parentKey) => {
		if (seen.has(obj)) return;
		seen.add(obj);

		for (const key in obj) {
			let val = obj[key];
			if (!val) continue;
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

export enum StringifyMode {
	Normal = 0,
	Bson = 1,
}

function bson2json(bson: any): any {
	if (bson == null) return bson;

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
					json[key] = {"$oid": val.toString()};
					break;

				case "date":
					json[key] = {"$Date": val.toISOString()};
					break;

				case "regexp":
					json[key] = {"$RegExp": val.toString()};
					break;

				default:
					json[key] = bson2json(val);
					break;
			}
		}
	}
	return json;
}

export function stringify(json: any, mode: StringifyMode = StringifyMode.Normal): string {
	if (json == null) return null;

	switch (mode) {
		case StringifyMode.Normal:
			return JSON.stringify(json);

		case StringifyMode.Bson:
			let _json = bson2json(json);
			return JSON.stringify(_json);
	}
}

export function parse(text: string, mode: StringifyMode = StringifyMode.Normal): any {
	if (!text) return null;

	switch (mode) {
		case StringifyMode.Normal:
			return JSON.parse(text);

		case StringifyMode.Bson:
			let json = JSON.parse(text);
			return json2bson(json);
	}
}

export function json2bson(json): any {
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
				json[key] = json2bson(val);
		}
	}
	return json;
}

export function parse2(str: string): any {
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
		if (seen.has(obj)) return;
		seen.add(obj);

		for (let key in obj) {
			let val = obj[key];
			if (!val) continue;
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
				} else if (val._$) {
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
