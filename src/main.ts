import {ObjectId, EJSON} from 'bson';

export function stringify(value): string {
	value._0 = "";

	const getCircularReplacer = () => {
		const seen = new WeakSet();
		return (key, value) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) {
					return {_$: value._0};
				}

				for (let attr in value) {
					let val = value[attr];
					if (val) {
						if (val.constructor == ObjectId)
							value[attr] = {"$oid": val.toString()};

						if (val instanceof Date)
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

		for (let key in obj) {
			let val = obj[key];
			if (!val) continue;
			if (typeof val === "object" && val.constructor != ObjectId) {
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

export function parse(str: string): any {
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
					obj[key] = new ObjectId(val.$oid);
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

export function json2bson(doc: any): any {
	return EJSON.deserialize(doc);
}

export function bson2json(doc: any): any {
	return EJSON.serialize(doc);
}
