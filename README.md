# bson-util

**bson-util** is a super light (0.5K) and fast circular JSON and BSON serializer and parser. This package is supported on all browsers

## Install

```bash
npm install bson-util
```

## Features

* stringifies and parses json documents
* Observe the structural differences between two objects.
* Supports different result structure based on different needs such as Restful APIs, or MongoDB patches.

### Importing

#### nodejs

```javascript
// ESM
import {parse, stringify} from 'bson-util';

// CJS
const {parse, stringify} = require('bson-util');
```

## Examples

You can find more samples in **main.test.ts**.

``` javascript
var A: any = {b: new ObjectID(), c: 1};
A.a = A;

stringify(A); // {"b":{"$oid":"5e32849068f40e424a80fe42"},"c":1,"a":{"_$":""},"_0":""}

parse('{"b":{"$oid":"5e32849068f40e424a80fe42"},"c":1,"a":{"_$":""},"_0":""}'); 
  // {b: ObjectID("5e32849068f40e424a80fe42"), c: 1, a: {b: ObjectID...}}
```
