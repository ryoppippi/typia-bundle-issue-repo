var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/ret/lib/types.js
var require_types = __commonJS((exports, module) => {
  module.exports = {
    ROOT: 0,
    GROUP: 1,
    POSITION: 2,
    SET: 3,
    RANGE: 4,
    REPETITION: 5,
    REFERENCE: 6,
    CHAR: 7
  };
});

// node_modules/ret/lib/sets.js
var require_sets = __commonJS((exports) => {
  var types = require_types();
  var INTS = () => [{ type: types.RANGE, from: 48, to: 57 }];
  var WORDS = () => {
    return [
      { type: types.CHAR, value: 95 },
      { type: types.RANGE, from: 97, to: 122 },
      { type: types.RANGE, from: 65, to: 90 }
    ].concat(INTS());
  };
  var WHITESPACE = () => {
    return [
      { type: types.CHAR, value: 9 },
      { type: types.CHAR, value: 10 },
      { type: types.CHAR, value: 11 },
      { type: types.CHAR, value: 12 },
      { type: types.CHAR, value: 13 },
      { type: types.CHAR, value: 32 },
      { type: types.CHAR, value: 160 },
      { type: types.CHAR, value: 5760 },
      { type: types.RANGE, from: 8192, to: 8202 },
      { type: types.CHAR, value: 8232 },
      { type: types.CHAR, value: 8233 },
      { type: types.CHAR, value: 8239 },
      { type: types.CHAR, value: 8287 },
      { type: types.CHAR, value: 12288 },
      { type: types.CHAR, value: 65279 }
    ];
  };
  var NOTANYCHAR = () => {
    return [
      { type: types.CHAR, value: 10 },
      { type: types.CHAR, value: 13 },
      { type: types.CHAR, value: 8232 },
      { type: types.CHAR, value: 8233 }
    ];
  };
  exports.words = () => ({ type: types.SET, set: WORDS(), not: false });
  exports.notWords = () => ({ type: types.SET, set: WORDS(), not: true });
  exports.ints = () => ({ type: types.SET, set: INTS(), not: false });
  exports.notInts = () => ({ type: types.SET, set: INTS(), not: true });
  exports.whitespace = () => ({ type: types.SET, set: WHITESPACE(), not: false });
  exports.notWhitespace = () => ({ type: types.SET, set: WHITESPACE(), not: true });
  exports.anyChar = () => ({ type: types.SET, set: NOTANYCHAR(), not: true });
});

// node_modules/ret/lib/util.js
var require_util = __commonJS((exports) => {
  var types = require_types();
  var sets = require_sets();
  var CTRL = "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^ ?";
  var SLSH = { "0": 0, t: 9, n: 10, v: 11, f: 12, r: 13 };
  exports.strToChars = function(str) {
    var chars_regex = /(\[\\b\])|(\\)?\\(?:u([A-F0-9]{4})|x([A-F0-9]{2})|(0?[0-7]{2})|c([@A-Z[\\\]^?])|([0tnvfr]))/g;
    str = str.replace(chars_regex, function(s, b, lbs, a16, b16, c8, dctrl, eslsh) {
      if (lbs) {
        return s;
      }
      var code = b ? 8 : a16 ? parseInt(a16, 16) : b16 ? parseInt(b16, 16) : c8 ? parseInt(c8, 8) : dctrl ? CTRL.indexOf(dctrl) : SLSH[eslsh];
      var c = String.fromCharCode(code);
      if (/[[\]{}^$.|?*+()]/.test(c)) {
        c = "\\" + c;
      }
      return c;
    });
    return str;
  };
  exports.tokenizeClass = (str, regexpStr) => {
    var tokens = [];
    var regexp = /\\(?:(w)|(d)|(s)|(W)|(D)|(S))|((?:(?:\\)(.)|([^\]\\]))-(?:\\)?([^\]]))|(\])|(?:\\)?([^])/g;
    var rs, c;
    while ((rs = regexp.exec(str)) != null) {
      if (rs[1]) {
        tokens.push(sets.words());
      } else if (rs[2]) {
        tokens.push(sets.ints());
      } else if (rs[3]) {
        tokens.push(sets.whitespace());
      } else if (rs[4]) {
        tokens.push(sets.notWords());
      } else if (rs[5]) {
        tokens.push(sets.notInts());
      } else if (rs[6]) {
        tokens.push(sets.notWhitespace());
      } else if (rs[7]) {
        tokens.push({
          type: types.RANGE,
          from: (rs[8] || rs[9]).charCodeAt(0),
          to: rs[10].charCodeAt(0)
        });
      } else if (c = rs[12]) {
        tokens.push({
          type: types.CHAR,
          value: c.charCodeAt(0)
        });
      } else {
        return [tokens, regexp.lastIndex];
      }
    }
    exports.error(regexpStr, "Unterminated character class");
  };
  exports.error = (regexp, msg) => {
    throw new SyntaxError("Invalid regular expression: /" + regexp + "/: " + msg);
  };
});

// node_modules/ret/lib/positions.js
var require_positions = __commonJS((exports) => {
  var types = require_types();
  exports.wordBoundary = () => ({ type: types.POSITION, value: "b" });
  exports.nonWordBoundary = () => ({ type: types.POSITION, value: "B" });
  exports.begin = () => ({ type: types.POSITION, value: "^" });
  exports.end = () => ({ type: types.POSITION, value: "$" });
});

// node_modules/ret/lib/index.js
var require_lib = __commonJS((exports, module) => {
  var util = require_util();
  var types = require_types();
  var sets = require_sets();
  var positions = require_positions();
  module.exports = (regexpStr) => {
    var i = 0, l, c, start = { type: types.ROOT, stack: [] }, lastGroup = start, last = start.stack, groupStack = [];
    var repeatErr = (i2) => {
      util.error(regexpStr, `Nothing to repeat at column ${i2 - 1}`);
    };
    var str = util.strToChars(regexpStr);
    l = str.length;
    while (i < l) {
      c = str[i++];
      switch (c) {
        case "\\":
          c = str[i++];
          switch (c) {
            case "b":
              last.push(positions.wordBoundary());
              break;
            case "B":
              last.push(positions.nonWordBoundary());
              break;
            case "w":
              last.push(sets.words());
              break;
            case "W":
              last.push(sets.notWords());
              break;
            case "d":
              last.push(sets.ints());
              break;
            case "D":
              last.push(sets.notInts());
              break;
            case "s":
              last.push(sets.whitespace());
              break;
            case "S":
              last.push(sets.notWhitespace());
              break;
            default:
              if (/\d/.test(c)) {
                last.push({ type: types.REFERENCE, value: parseInt(c, 10) });
              } else {
                last.push({ type: types.CHAR, value: c.charCodeAt(0) });
              }
          }
          break;
        case "^":
          last.push(positions.begin());
          break;
        case "$":
          last.push(positions.end());
          break;
        case "[":
          var not;
          if (str[i] === "^") {
            not = true;
            i++;
          } else {
            not = false;
          }
          var classTokens = util.tokenizeClass(str.slice(i), regexpStr);
          i += classTokens[1];
          last.push({
            type: types.SET,
            set: classTokens[0],
            not
          });
          break;
        case ".":
          last.push(sets.anyChar());
          break;
        case "(":
          var group = {
            type: types.GROUP,
            stack: [],
            remember: true
          };
          c = str[i];
          if (c === "?") {
            c = str[i + 1];
            i += 2;
            if (c === "=") {
              group.followedBy = true;
            } else if (c === "!") {
              group.notFollowedBy = true;
            } else if (c !== ":") {
              util.error(regexpStr, `Invalid group, character '${c}'` + ` after '?' at column ${i - 1}`);
            }
            group.remember = false;
          }
          last.push(group);
          groupStack.push(lastGroup);
          lastGroup = group;
          last = group.stack;
          break;
        case ")":
          if (groupStack.length === 0) {
            util.error(regexpStr, `Unmatched ) at column ${i - 1}`);
          }
          lastGroup = groupStack.pop();
          last = lastGroup.options ? lastGroup.options[lastGroup.options.length - 1] : lastGroup.stack;
          break;
        case "|":
          if (!lastGroup.options) {
            lastGroup.options = [lastGroup.stack];
            delete lastGroup.stack;
          }
          var stack = [];
          lastGroup.options.push(stack);
          last = stack;
          break;
        case "{":
          var rs = /^(\d+)(,(\d+)?)?\}/.exec(str.slice(i)), min, max;
          if (rs !== null) {
            if (last.length === 0) {
              repeatErr(i);
            }
            min = parseInt(rs[1], 10);
            max = rs[2] ? rs[3] ? parseInt(rs[3], 10) : Infinity : min;
            i += rs[0].length;
            last.push({
              type: types.REPETITION,
              min,
              max,
              value: last.pop()
            });
          } else {
            last.push({
              type: types.CHAR,
              value: 123
            });
          }
          break;
        case "?":
          if (last.length === 0) {
            repeatErr(i);
          }
          last.push({
            type: types.REPETITION,
            min: 0,
            max: 1,
            value: last.pop()
          });
          break;
        case "+":
          if (last.length === 0) {
            repeatErr(i);
          }
          last.push({
            type: types.REPETITION,
            min: 1,
            max: Infinity,
            value: last.pop()
          });
          break;
        case "*":
          if (last.length === 0) {
            repeatErr(i);
          }
          last.push({
            type: types.REPETITION,
            min: 0,
            max: Infinity,
            value: last.pop()
          });
          break;
        default:
          last.push({
            type: types.CHAR,
            value: c.charCodeAt(0)
          });
      }
    }
    if (groupStack.length !== 0) {
      util.error(regexpStr, "Unterminated group");
    }
    return start;
  };
  module.exports.types = types;
});

// node_modules/drange/lib/index.js
var require_lib2 = __commonJS((exports, module) => {
  class SubRange {
    constructor(low, high) {
      this.low = low;
      this.high = high;
      this.length = 1 + high - low;
    }
    overlaps(range) {
      return !(this.high < range.low || this.low > range.high);
    }
    touches(range) {
      return !(this.high + 1 < range.low || this.low - 1 > range.high);
    }
    add(range) {
      return new SubRange(Math.min(this.low, range.low), Math.max(this.high, range.high));
    }
    subtract(range) {
      if (range.low <= this.low && range.high >= this.high) {
        return [];
      } else if (range.low > this.low && range.high < this.high) {
        return [
          new SubRange(this.low, range.low - 1),
          new SubRange(range.high + 1, this.high)
        ];
      } else if (range.low <= this.low) {
        return [new SubRange(range.high + 1, this.high)];
      } else {
        return [new SubRange(this.low, range.low - 1)];
      }
    }
    toString() {
      return this.low == this.high ? this.low.toString() : this.low + "-" + this.high;
    }
  }

  class DRange {
    constructor(a, b) {
      this.ranges = [];
      this.length = 0;
      if (a != null)
        this.add(a, b);
    }
    _update_length() {
      this.length = this.ranges.reduce((previous, range) => {
        return previous + range.length;
      }, 0);
    }
    add(a, b) {
      var _add = (subrange) => {
        var i = 0;
        while (i < this.ranges.length && !subrange.touches(this.ranges[i])) {
          i++;
        }
        var newRanges = this.ranges.slice(0, i);
        while (i < this.ranges.length && subrange.touches(this.ranges[i])) {
          subrange = subrange.add(this.ranges[i]);
          i++;
        }
        newRanges.push(subrange);
        this.ranges = newRanges.concat(this.ranges.slice(i));
        this._update_length();
      };
      if (a instanceof DRange) {
        a.ranges.forEach(_add);
      } else {
        if (b == null)
          b = a;
        _add(new SubRange(a, b));
      }
      return this;
    }
    subtract(a, b) {
      var _subtract = (subrange) => {
        var i = 0;
        while (i < this.ranges.length && !subrange.overlaps(this.ranges[i])) {
          i++;
        }
        var newRanges = this.ranges.slice(0, i);
        while (i < this.ranges.length && subrange.overlaps(this.ranges[i])) {
          newRanges = newRanges.concat(this.ranges[i].subtract(subrange));
          i++;
        }
        this.ranges = newRanges.concat(this.ranges.slice(i));
        this._update_length();
      };
      if (a instanceof DRange) {
        a.ranges.forEach(_subtract);
      } else {
        if (b == null)
          b = a;
        _subtract(new SubRange(a, b));
      }
      return this;
    }
    intersect(a, b) {
      var newRanges = [];
      var _intersect = (subrange) => {
        var i = 0;
        while (i < this.ranges.length && !subrange.overlaps(this.ranges[i])) {
          i++;
        }
        while (i < this.ranges.length && subrange.overlaps(this.ranges[i])) {
          var low = Math.max(this.ranges[i].low, subrange.low);
          var high = Math.min(this.ranges[i].high, subrange.high);
          newRanges.push(new SubRange(low, high));
          i++;
        }
      };
      if (a instanceof DRange) {
        a.ranges.forEach(_intersect);
      } else {
        if (b == null)
          b = a;
        _intersect(new SubRange(a, b));
      }
      this.ranges = newRanges;
      this._update_length();
      return this;
    }
    index(index) {
      var i = 0;
      while (i < this.ranges.length && this.ranges[i].length <= index) {
        index -= this.ranges[i].length;
        i++;
      }
      return this.ranges[i].low + index;
    }
    toString() {
      return "[ " + this.ranges.join(", ") + " ]";
    }
    clone() {
      return new DRange(this);
    }
    numbers() {
      return this.ranges.reduce((result, subrange) => {
        var i = subrange.low;
        while (i <= subrange.high) {
          result.push(i);
          i++;
        }
        return result;
      }, []);
    }
    subranges() {
      return this.ranges.map((subrange) => ({
        low: subrange.low,
        high: subrange.high,
        length: 1 + subrange.high - subrange.low
      }));
    }
  }
  module.exports = DRange;
});

// node_modules/randexp/lib/randexp.js
var require_randexp = __commonJS((exports, module) => {
  var ret = require_lib();
  var DRange = require_lib2();
  var types = ret.types;
  module.exports = class RandExp {
    constructor(regexp, m) {
      this._setDefaults(regexp);
      if (regexp instanceof RegExp) {
        this.ignoreCase = regexp.ignoreCase;
        this.multiline = regexp.multiline;
        regexp = regexp.source;
      } else if (typeof regexp === "string") {
        this.ignoreCase = m && m.indexOf("i") !== -1;
        this.multiline = m && m.indexOf("m") !== -1;
      } else {
        throw new Error("Expected a regexp or string");
      }
      this.tokens = ret(regexp);
    }
    _setDefaults(regexp) {
      this.max = regexp.max != null ? regexp.max : RandExp.prototype.max != null ? RandExp.prototype.max : 100;
      this.defaultRange = regexp.defaultRange ? regexp.defaultRange : this.defaultRange.clone();
      if (regexp.randInt) {
        this.randInt = regexp.randInt;
      }
    }
    gen() {
      return this._gen(this.tokens, []);
    }
    _gen(token, groups) {
      var stack, str, n, i, l;
      switch (token.type) {
        case types.ROOT:
        case types.GROUP:
          if (token.followedBy || token.notFollowedBy) {
            return "";
          }
          if (token.remember && token.groupNumber === undefined) {
            token.groupNumber = groups.push(null) - 1;
          }
          stack = token.options ? this._randSelect(token.options) : token.stack;
          str = "";
          for (i = 0, l = stack.length;i < l; i++) {
            str += this._gen(stack[i], groups);
          }
          if (token.remember) {
            groups[token.groupNumber] = str;
          }
          return str;
        case types.POSITION:
          return "";
        case types.SET:
          var expandedSet = this._expand(token);
          if (!expandedSet.length) {
            return "";
          }
          return String.fromCharCode(this._randSelect(expandedSet));
        case types.REPETITION:
          n = this.randInt(token.min, token.max === Infinity ? token.min + this.max : token.max);
          str = "";
          for (i = 0;i < n; i++) {
            str += this._gen(token.value, groups);
          }
          return str;
        case types.REFERENCE:
          return groups[token.value - 1] || "";
        case types.CHAR:
          var code = this.ignoreCase && this._randBool() ? this._toOtherCase(token.value) : token.value;
          return String.fromCharCode(code);
      }
    }
    _toOtherCase(code) {
      return code + (97 <= code && code <= 122 ? -32 : 65 <= code && code <= 90 ? 32 : 0);
    }
    _randBool() {
      return !this.randInt(0, 1);
    }
    _randSelect(arr) {
      if (arr instanceof DRange) {
        return arr.index(this.randInt(0, arr.length - 1));
      }
      return arr[this.randInt(0, arr.length - 1)];
    }
    _expand(token) {
      if (token.type === ret.types.CHAR) {
        return new DRange(token.value);
      } else if (token.type === ret.types.RANGE) {
        return new DRange(token.from, token.to);
      } else {
        let drange = new DRange;
        for (let i = 0;i < token.set.length; i++) {
          let subrange = this._expand(token.set[i]);
          drange.add(subrange);
          if (this.ignoreCase) {
            for (let j = 0;j < subrange.length; j++) {
              let code = subrange.index(j);
              let otherCaseCode = this._toOtherCase(code);
              if (code !== otherCaseCode) {
                drange.add(otherCaseCode);
              }
            }
          }
        }
        if (token.not) {
          return this.defaultRange.clone().subtract(drange);
        } else {
          return this.defaultRange.clone().intersect(drange);
        }
      }
    }
    randInt(a, b) {
      return a + Math.floor(Math.random() * (1 + b - a));
    }
    get defaultRange() {
      return this._range = this._range || new DRange(32, 126);
    }
    set defaultRange(range) {
      this._range = range;
    }
    static randexp(regexp, m) {
      var randexp;
      if (typeof regexp === "string") {
        regexp = new RegExp(regexp, m);
      }
      if (regexp._randexp === undefined) {
        randexp = new RandExp(regexp, m);
        regexp._randexp = randexp;
      } else {
        randexp = regexp._randexp;
        randexp._setDefaults(regexp);
      }
      return randexp.gen();
    }
    static sugar() {
      RegExp.prototype.gen = function() {
        return RandExp.randexp(this);
      };
    }
  };
});

// node_modules/typia/lib/chunk-EP3KWYIW.mjs
var tags_exports = {};

// node_modules/typia/lib/chunk-TX5EWQFG.mjs
var __defProp2 = Object.defineProperty;
var __name = (target, value) => __defProp2(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};

// node_modules/typia/lib/chunk-MG2WNOGH.mjs
var $is_between = __name((value, minimum, maximum) => minimum <= value && value <= maximum, "$is_between");

// node_modules/typia/lib/chunk-6IOQL5X7.mjs
var $is_bigint_string = __name((str) => {
  try {
    BigInt(str);
    return true;
  } catch {
    return false;
  }
}, "$is_bigint_string");

// node_modules/typia/lib/chunk-JL3OMPIR.mjs
var is = __name(() => ({
  is_between: $is_between,
  is_bigint_string: $is_bigint_string
}), "is");

// node_modules/typia/lib/chunk-X5JY6VGL.mjs
var $join = __name((str) => variable(str) ? `.${str}` : `[${JSON.stringify(str)}]`, "$join");
var variable = __name((str) => reserved(str) === false && /^[a-zA-Z_$][a-zA-Z_$0-9]*$/g.test(str), "variable");
var reserved = __name((str) => RESERVED.has(str), "reserved");
var RESERVED = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "null",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with"
]);

// node_modules/typia/lib/chunk-2QB3XKXB.mjs
var $report = __name((array) => {
  const reportable = __name((path) => {
    if (array.length === 0)
      return true;
    const last = array[array.length - 1].path;
    return path.length > last.length || last.substring(0, path.length) !== path;
  }, "reportable");
  return (exceptable, error) => {
    if (exceptable && reportable(error.path))
      array.push(error);
    return false;
  };
}, "$report");

// node_modules/typia/lib/chunk-B345UMTR.mjs
var $every = __name((array, pred) => {
  let error = null;
  for (let i = 0;i < array.length; ++i)
    if ((error = pred(array[i], i)) !== null)
      return error;
  return null;
}, "$every");

// node_modules/typia/lib/chunk-ERALXJG2.mjs
var TypeGuardError = class extends Error {
  static {
    __name(this, "TypeGuardError");
  }
  method;
  path;
  expected;
  value;
  constructor(props) {
    super(props.message || `Error on ${props.method}(): invalid type${props.path ? ` on ${props.path}` : ""}, expect to be ${props.expected}`);
    const proto = new.target.prototype;
    if (Object.setPrototypeOf)
      Object.setPrototypeOf(this, proto);
    else
      this.__proto__ = proto;
    this.method = props.method;
    this.path = props.path;
    this.expected = props.expected;
    this.value = props.value;
  }
};

// node_modules/typia/lib/chunk-7UKAL7BO.mjs
var $guard = __name((method) => (exceptionable, props, factory) => {
  if (exceptionable === true)
    throw (factory ?? ((props2) => new TypeGuardError(props2)))({
      method,
      path: props.path,
      expected: props.expected,
      value: props.value
    });
  return false;
}, "$guard");

// node_modules/typia/lib/chunk-3TFN5QJ6.mjs
var import_randexp = __toESM(require_randexp(), 1);
var RandomGenerator_exports = {};
__export(RandomGenerator_exports, {
  array: () => array,
  bigint: () => bigint,
  boolean: () => boolean,
  byte: () => byte,
  date: () => date,
  datetime: () => datetime,
  duration: () => duration,
  email: () => email,
  hostname: () => hostname,
  idnEmail: () => idnEmail,
  idnHostname: () => idnHostname,
  integer: () => integer,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  iri: () => iri,
  iriReference: () => iriReference,
  jsonPointer: () => jsonPointer,
  length: () => length,
  number: () => number,
  password: () => password,
  pattern: () => pattern,
  pick: () => pick,
  regex: () => regex,
  relativeJsonPointer: () => relativeJsonPointer,
  string: () => string,
  time: () => time,
  uri: () => uri,
  uriReference: () => uriReference,
  uriTemplate: () => uriTemplate,
  url: () => url,
  uuid: () => uuid
});
var ALPHABETS = "abcdefghijklmnopqrstuvwxyz";
var boolean = __name(() => Math.random() < 0.5, "boolean");
var integer = __name((min, max) => {
  min ??= 0;
  max ??= 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}, "integer");
var bigint = __name((min, max) => BigInt(integer(Number(min ?? BigInt(0)), Number(max ?? BigInt(100)))), "bigint");
var number = __name((min, max) => {
  min ??= 0;
  max ??= 100;
  return Math.random() * (max - min) + min;
}, "number");
var string = __name((length2) => new Array(length2 ?? integer(5, 10)).fill(0).map(() => ALPHABETS[integer(0, ALPHABETS.length - 1)]).join(""), "string");
var array = __name((closure, count) => new Array(count ?? length()).fill(0).map((_e, index) => closure(index)), "array");
var pick = __name((array2) => array2[integer(0, array2.length - 1)], "pick");
var length = __name(() => integer(0, 3), "length");
var pattern = __name((regex2) => {
  const r = new import_randexp.default(regex2);
  for (let i = 0;i < 10; ++i) {
    const str = r.gen();
    if (regex2.test(str))
      return str;
  }
  return r.gen();
}, "pattern");
var byte = __name(() => "vt7ekz4lIoNTTS9sDQYdWKharxIFAR54+z/umIxSgUM=", "byte");
var password = __name(() => string(integer(4, 16)), "password");
var regex = __name(() => "/^(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$/", "regex");
var uuid = __name(() => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === "x" ? r : r & 3 | 8;
  return v.toString(16);
}), "uuid");
var email = __name(() => `${string(10)}@${string(10)}.${string(3)}`, "email");
var hostname = __name(() => `${string(10)}.${string(3)}`, "hostname");
var idnEmail = __name(() => email(), "idnEmail");
var idnHostname = __name(() => hostname(), "idnHostname");
var iri = __name(() => url(), "iri");
var iriReference = __name(() => url(), "iriReference");
var ipv4 = __name(() => array(() => integer(0, 255), 4).join("."), "ipv4");
var ipv6 = __name(() => array(() => integer(0, 65535).toString(16), 8).join(":"), "ipv6");
var uri = __name(() => url(), "uri");
var uriReference = __name(() => url(), "uriReference");
var uriTemplate = __name(() => url(), "uriTemplate");
var url = __name(() => `https://${string(10)}.${string(3)}`, "url");
var datetime = __name((min, max) => new Date(number(min ?? Date.now() - 30 * DAY, max ?? Date.now() + 7 * DAY)).toISOString(), "datetime");
var date = __name((min, max) => new Date(number(min ?? 0, max ?? Date.now() * 2)).toISOString().substring(0, 10), "date");
var time = __name(() => new Date(number(0, DAY)).toISOString().substring(11), "time");
var duration = __name(() => {
  const period = durate([
    [
      "Y",
      integer(0, 100)
    ],
    [
      "M",
      integer(0, 12)
    ],
    [
      "D",
      integer(0, 31)
    ]
  ]);
  const time2 = durate([
    [
      "H",
      integer(0, 24)
    ],
    [
      "M",
      integer(0, 60)
    ],
    [
      "S",
      integer(0, 60)
    ]
  ]);
  if (period.length + time2.length === 0)
    return "PT0S";
  return `P${period}${time2.length ? "T" : ""}${time2}`;
}, "duration");
var jsonPointer = __name(() => `/components/schemas/${string(10)}`, "jsonPointer");
var relativeJsonPointer = __name(() => `${integer(0, 10)}#`, "relativeJsonPointer");
var DAY = 86400000;
var durate = __name((elements) => elements.filter(([_unit, value]) => value !== 0).map(([unit, value]) => `${value}${unit}`).join(""), "durate");

// node_modules/typia/lib/chunk-KHA6K6FV.mjs
var assert = __name((method) => ({
  ...is(),
  join: $join,
  every: $every,
  guard: $guard(`typia.${method}`),
  predicate: __name((matched, exceptionable, closure) => {
    if (matched === false && exceptionable === true)
      throw new TypeGuardError({
        ...closure(),
        method: `typia.${method}`
      });
    return matched;
  }, "predicate")
}), "assert");
var validate = __name(() => ({
  ...is(),
  join: $join,
  report: $report,
  predicate: __name((res) => (matched, exceptionable, closure) => {
    if (matched === false && exceptionable === true)
      (() => {
        res.success &&= false;
        const errorList = res.errors;
        const error = closure();
        if (errorList.length) {
          const last = errorList[errorList.length - 1].path;
          if (last.length >= error.path.length && last.substring(0, error.path.length) === error.path)
            return;
        }
        errorList.push(error);
        return;
      })();
    return matched;
  }, "predicate")
}), "validate");
var random = __name(() => ({
  generator: RandomGenerator_exports,
  pick: RandomGenerator_exports.pick
}), "random");

// node_modules/typia/lib/chunk-RFZBHBM7.mjs
var $throws = __name((method) => (props) => {
  throw new TypeGuardError({
    ...props,
    method: `typia.${method}`
  });
}, "$throws");

// node_modules/typia/lib/chunk-QTYWQFMH.mjs
var $strlen = __name((s) => {
  let b;
  let i;
  let c;
  for (b = i = 0;c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1)
    ;
  return b;
}, "$strlen");

// node_modules/typia/lib/chunk-ITV5LOEO.mjs
var $ProtobufSizer = class {
  static {
    __name(this, "$ProtobufSizer");
  }
  len;
  pos;
  varlen;
  varlenidx;
  constructor(length2 = 0) {
    this.len = length2;
    this.pos = [];
    this.varlen = [];
    this.varlenidx = [];
  }
  bool() {
    this.len += 1;
  }
  int32(value) {
    if (value < 0) {
      this.len += 10;
    } else {
      this.varint32(value);
    }
  }
  sint32(value) {
    this.varint32(value << 1 ^ value >> 31);
  }
  uint32(value) {
    this.varint32(value);
  }
  int64(value) {
    this.varint64(typeof value === "number" ? BigInt(value) : value);
  }
  sint64(value) {
    if (typeof value === "number")
      value = BigInt(value);
    this.varint64(value << BigInt(1) ^ value >> BigInt(63));
  }
  uint64(value) {
    this.varint64(typeof value === "number" ? BigInt(value) : value);
  }
  float(_value) {
    this.len += 4;
  }
  double(_value) {
    this.len += 8;
  }
  bytes(value) {
    this.uint32(value.byteLength);
    this.len += value.byteLength;
  }
  string(value) {
    const len = $strlen(value);
    this.varlen.push(len);
    this.uint32(len);
    this.len += len;
  }
  fork() {
    this.pos.push(this.len);
    this.varlenidx.push(this.varlen.length);
    this.varlen.push(0);
  }
  ldelim() {
    if (!(this.pos.length && this.varlenidx.length))
      throw new Error("Error on typia.protobuf.encode(): missing fork() before ldelim() call.");
    const endPos = this.len;
    const startPos = this.pos.pop();
    const idx = this.varlenidx.pop();
    const len = endPos - startPos;
    this.varlen[idx] = len;
    this.uint32(len);
  }
  reset() {
    this.len = 0;
    this.pos.length = 0;
    this.varlen.length = 0;
    this.varlenidx.length = 0;
  }
  varint32(value) {
    this.len += value < 0 ? 10 : value < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5;
  }
  varint64(val) {
    val = BigInt.asUintN(64, val);
    while (val > NX7F) {
      ++this.len;
      val = val >> ND07;
    }
    ++this.len;
  }
};
var ND07 = BigInt(7);
var NX7F = BigInt(127);

// node_modules/typia/lib/chunk-WX5VYP4B.mjs
var $ProtobufWriter = class {
  static {
    __name(this, "$ProtobufWriter");
  }
  sizer;
  ptr;
  buf;
  view;
  varlenidx;
  constructor(sizer) {
    this.sizer = sizer;
    this.buf = new Uint8Array(sizer.len);
    this.view = new DataView(this.buf.buffer);
    this.ptr = 0;
    this.varlenidx = 0;
  }
  buffer() {
    return this.buf;
  }
  bool(value) {
    this.byte(value ? 1 : 0);
  }
  byte(value) {
    this.buf[this.ptr++] = value & 255;
  }
  int32(value) {
    if (value < 0)
      this.int64(value);
    else
      this.variant32(value >>> 0);
  }
  sint32(value) {
    this.variant32(value << 1 ^ value >> 31);
  }
  uint32(value) {
    this.variant32(value);
  }
  sint64(value) {
    value = BigInt(value);
    this.variant64(value << ND01 ^ value >> ND63);
  }
  int64(value) {
    this.variant64(BigInt(value));
  }
  uint64(value) {
    this.variant64(BigInt(value));
  }
  float(val) {
    this.view.setFloat32(this.ptr, val, true);
    this.ptr += 4;
  }
  double(val) {
    this.view.setFloat64(this.ptr, val, true);
    this.ptr += 8;
  }
  bytes(value) {
    this.uint32(value.byteLength);
    for (let i = 0;i < value.byteLength; i++)
      this.buf[this.ptr++] = value[i];
  }
  string(value) {
    const len = this.varlen();
    this.uint32(len);
    const binary = utf8.encode(value);
    for (let i = 0;i < binary.byteLength; i++)
      this.buf[this.ptr++] = binary[i];
  }
  fork() {
    this.uint32(this.varlen());
  }
  ldelim() {
  }
  finish() {
    return this.buf;
  }
  reset() {
    this.buf = new Uint8Array(this.sizer.len);
    this.view = new DataView(this.buf.buffer);
    this.ptr = 0;
    this.varlenidx = 0;
  }
  variant32(val) {
    while (val > 127) {
      this.buf[this.ptr++] = val & 127 | 128;
      val = val >>> 7;
    }
    this.buf[this.ptr++] = val;
  }
  variant64(val) {
    val = BigInt.asUintN(64, val);
    while (val > NX7F2) {
      this.buf[this.ptr++] = Number(val & NX7F2 | NX80);
      val = val >> ND072;
    }
    this.buf[this.ptr++] = Number(val);
  }
  varlen() {
    return this.varlenidx >= this.sizer.varlen.length ? 0 : this.sizer.varlen[this.varlenidx++];
  }
};
var utf8 = new TextEncoder;
var ND01 = BigInt(1);
var ND072 = BigInt(7);
var ND63 = BigInt(63);
var NX7F2 = BigInt(127);
var NX80 = BigInt(128);

// node_modules/typia/lib/chunk-XTLF3GSY.mjs
var ProtobufWire;
(function(ProtobufWire2) {
  ProtobufWire2[ProtobufWire2["VARIANT"] = 0] = "VARIANT";
  ProtobufWire2[ProtobufWire2["I64"] = 1] = "I64";
  ProtobufWire2[ProtobufWire2["LEN"] = 2] = "LEN";
  ProtobufWire2[ProtobufWire2["START_GROUP"] = 3] = "START_GROUP";
  ProtobufWire2[ProtobufWire2["END_GROUP"] = 4] = "END_GROUP";
  ProtobufWire2[ProtobufWire2["I32"] = 5] = "I32";
})(ProtobufWire || (ProtobufWire = {}));

// node_modules/typia/lib/chunk-IV3WS3BG.mjs
var $ProtobufReader = class {
  static {
    __name(this, "$ProtobufReader");
  }
  buf;
  ptr;
  view;
  constructor(buf) {
    this.buf = buf;
    this.ptr = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  index() {
    return this.ptr;
  }
  size() {
    return this.buf.length;
  }
  uint32() {
    return this.varint32();
  }
  int32() {
    return this.varint32();
  }
  sint32() {
    const value = this.varint32();
    return value >>> 1 ^ -(value & 1);
  }
  uint64() {
    return this.varint64();
  }
  int64() {
    return this.varint64();
  }
  sint64() {
    const value = this.varint64();
    return value >> N01 ^ -(value & N01);
  }
  bool() {
    return this.varint32() !== 0;
  }
  float() {
    const value = this.view.getFloat32(this.ptr, true);
    this.ptr += 4;
    return value;
  }
  double() {
    const value = this.view.getFloat64(this.ptr, true);
    this.ptr += 8;
    return value;
  }
  bytes() {
    const length2 = this.uint32();
    const from = this.ptr;
    this.ptr += length2;
    return this.buf.subarray(from, from + length2);
  }
  string() {
    return utf82.decode(this.bytes());
  }
  skip(length2) {
    if (length2 === 0)
      while (this.u8() & 128)
        ;
    else {
      if (this.index() + length2 > this.size())
        throw new Error("Error on typia.protobuf.decode(): buffer overflow.");
      this.ptr += length2;
    }
  }
  skipType(wireType) {
    switch (wireType) {
      case ProtobufWire.VARIANT:
        this.skip(0);
        break;
      case ProtobufWire.I64:
        this.skip(8);
        break;
      case ProtobufWire.LEN:
        this.skip(this.uint32());
        break;
      case ProtobufWire.START_GROUP:
        while ((wireType = this.uint32() & 7) !== ProtobufWire.END_GROUP)
          this.skipType(wireType);
        break;
      case ProtobufWire.I32:
        this.skip(4);
        break;
      default:
        throw new Error(`Invalid wire type ${wireType} at offset ${this.ptr}.`);
    }
  }
  varint32() {
    let loaded;
    let value;
    value = (loaded = this.u8()) & 127;
    if (loaded < 128)
      return value;
    value |= ((loaded = this.u8()) & 127) << 7;
    if (loaded < 128)
      return value;
    value |= ((loaded = this.u8()) & 127) << 14;
    if (loaded < 128)
      return value;
    value |= ((loaded = this.u8()) & 127) << 21;
    if (loaded < 128)
      return value;
    value |= ((loaded = this.u8()) & 15) << 28;
    if (loaded < 128)
      return value;
    if (this.u8() < 128)
      return value;
    if (this.u8() < 128)
      return value;
    if (this.u8() < 128)
      return value;
    if (this.u8() < 128)
      return value;
    if (this.u8() < 128)
      return value;
    return value;
  }
  varint64() {
    let loaded;
    let value;
    value = (loaded = this.u8n()) & N7F;
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(7);
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(14);
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(21);
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(28);
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(35);
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(42);
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(49);
    if (loaded < N80)
      return value;
    value |= ((loaded = this.u8n()) & N7F) << BigInt(56);
    if (loaded < N80)
      return value;
    value |= (this.u8n() & N01) << BigInt(63);
    return BigInt.asIntN(64, value);
  }
  u8() {
    return this.view.getUint8(this.ptr++);
  }
  u8n() {
    return BigInt(this.u8());
  }
};
var utf82 = new TextDecoder;
var N01 = BigInt(1);
var N7F = BigInt(127);
var N80 = BigInt(128);

// node_modules/typia/lib/chunk-YCB4JQWK.mjs
var protobuf_exports = {};
__export(protobuf_exports, {
  decode: () => decode,
  encode: () => encode
});
var decode = __name((method) => ({
  ...is(),
  Reader: $ProtobufReader,
  throws: $throws(`protobuf.${method}`)
}), "decode");
var encode = __name((method) => ({
  ...is(),
  Sizer: $ProtobufSizer,
  Writer: $ProtobufWriter,
  strlen: $strlen,
  throws: $throws(method)
}), "encode");

// node_modules/typia/lib/chunk-NYKJJAYN.mjs
var message = function() {
  halt("message");
};
var decode2 = function() {
  halt("decode");
};
var assertDecode = function() {
  halt("assertDecode");
};
var isDecode = function() {
  halt("isDecode");
};
var validateDecode = function() {
  halt("validateDecode");
};
var encode2 = function() {
  halt("encode");
};
var assertEncode = function() {
  halt("assertEncode");
};
var isEncode = function() {
  halt("isEncode");
};
var validateEncode = function() {
  halt("validateEncode");
};
var createDecode = function() {
  halt("createDecode");
};
var createIsDecode = function() {
  halt("createIsDecode");
};
var createAssertDecode = function() {
  halt("createAssertDecode");
};
var createValidateDecode = function() {
  halt("createValidateDecode");
};
var createEncode = function() {
  halt("createEncode");
};
var createIsEncode = function() {
  halt("createIsEncode");
};
var createAssertEncode = function() {
  halt("createAssertEncode");
};
var createValidateEncode = function() {
  halt("createValidateEncode");
};
var halt = function(name) {
  throw new Error(`Error on typia.protobuf.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var protobuf_exports2 = {};
__export(protobuf_exports2, {
  assertDecode: () => assertDecodePure,
  assertEncode: () => assertEncodePure,
  createAssertDecode: () => createAssertDecodePure,
  createAssertEncode: () => createAssertEncodePure,
  createDecode: () => createDecodePure,
  createEncode: () => createEncodePure,
  createIsDecode: () => createIsDecodePure,
  createIsEncode: () => createIsEncodePure,
  createValidateDecode: () => createValidateDecodePure,
  createValidateEncode: () => createValidateEncodePure,
  decode: () => decodePure,
  encode: () => encodePure,
  isDecode: () => isDecodePure,
  isEncode: () => isEncodePure,
  message: () => message,
  validateDecode: () => validateDecodePure,
  validateEncode: () => validateEncodePure
});
__name(message, "message");
__name(decode2, "decode");
var decodePure = Object.assign(decode2, protobuf_exports.decode("decode"));
__name(assertDecode, "assertDecode");
var assertDecodePure = Object.assign(assertDecode, assert("protobuf.assertDecode"), protobuf_exports.decode("assertDecode"));
__name(isDecode, "isDecode");
var isDecodePure = Object.assign(isDecode, is(), protobuf_exports.decode("isDecode"));
__name(validateDecode, "validateDecode");
var validateDecodePure = Object.assign(validateDecode, validate(), protobuf_exports.decode("validateDecode"));
__name(encode2, "encode");
var encodePure = Object.assign(encode2, protobuf_exports.encode("encode"));
__name(assertEncode, "assertEncode");
var assertEncodePure = Object.assign(assertEncode, assert("protobuf.assertEncode"), protobuf_exports.encode("assertEncode"));
__name(isEncode, "isEncode");
var isEncodePure = Object.assign(isEncode, is(), protobuf_exports.encode("isEncode"));
__name(validateEncode, "validateEncode");
var validateEncodePure = Object.assign(validateEncode, validate(), protobuf_exports.encode("validateEncode"));
__name(createDecode, "createDecode");
var createDecodePure = Object.assign(createDecode, protobuf_exports.decode("createDecode"));
__name(createIsDecode, "createIsDecode");
var createIsDecodePure = Object.assign(createIsDecode, is(), protobuf_exports.decode("createIsDecode"));
__name(createAssertDecode, "createAssertDecode");
var createAssertDecodePure = Object.assign(createAssertDecode, assert("protobuf.createAssertDecode"), protobuf_exports.decode("createAssertDecode"));
__name(createValidateDecode, "createValidateDecode");
var createValidateDecodePure = Object.assign(createValidateDecode, validate(), protobuf_exports.decode("createValidateDecode"));
__name(createEncode, "createEncode");
var createEncodePure = Object.assign(createEncode, protobuf_exports.encode("createEncode"));
__name(createIsEncode, "createIsEncode");
var createIsEncodePure = Object.assign(createIsEncode, is(), protobuf_exports.encode("createIsEncode"));
__name(createAssertEncode, "createAssertEncode");
var createAssertEncodePure = Object.assign(createAssertEncode, assert("protobuf.createAssertEncode"), protobuf_exports.encode("createAssertEncode"));
__name(createValidateEncode, "createValidateEncode");
var createValidateEncodePure = Object.assign(createValidateEncode, validate(), protobuf_exports.encode("createValidateEncode"));
__name(halt, "halt");

// node_modules/typia/lib/chunk-ULUUZHFX.mjs
var metadata = function() {
  halt2("metadata");
};
var halt2 = function(name) {
  throw new Error(`Error on typia.reflect.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var reflect_exports = {};
__export(reflect_exports, {
  metadata: () => metadataPure
});
__name(metadata, "metadata");
var metadataPure = Object.assign(metadata, {
  from: __name((input) => input, "from")
});
__name(halt2, "halt");

// node_modules/typia/lib/chunk-W3LCQMT7.mjs
var functional_exports = {};
__export(functional_exports, {
  functionalAssert: () => functionalAssert
});
var functionalAssert = __name(() => ({
  errorFactory: __name((p) => new TypeGuardError(p), "errorFactory")
}), "functionalAssert");

// node_modules/typia/lib/chunk-SYHW5227.mjs
var assertFunction = function() {
  halt3("assertFunction");
};
var assertReturn = function() {
  halt3("assertReturn");
};
var assertEqualsFunction = function() {
  halt3("assertEqualsFunction");
};
var assertEqualsParameters = function() {
  halt3("assertEqualsParameters");
};
var assertEqualsReturn = function() {
  halt3("assertEqualsReturn");
};
var isFunction = function() {
  halt3("isFunction");
};
var isParameters = function() {
  halt3("isParameters");
};
var isReturn = function() {
  halt3("isReturn");
};
var equalsFunction = function() {
  halt3("equalsFunction");
};
var equalsParameters = function() {
  halt3("equalsParameters");
};
var equalsReturn = function() {
  halt3("equalsReturn");
};
var validateFunction = function() {
  halt3("validateFunction");
};
var validateParameters = function() {
  halt3("validateReturn");
};
var validateReturn = function() {
  halt3("validateReturn");
};
var validateEqualsFunction = function() {
  halt3("validateEqualsFunction");
};
var validateEqualsParameters = function() {
  halt3("validateEqualsParameters");
};
var validateEqualsReturn = function() {
  halt3("validateEqualsReturn");
};
var halt3 = function(name) {
  throw new Error(`Error on typia.functional.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var functional_exports2 = {};
__export(functional_exports2, {
  assertEqualsFunction: () => assertEqualsFunctionPure,
  assertEqualsParameters: () => assertEqualsParametersPure,
  assertEqualsReturn: () => assertEqualsReturnPure,
  assertFunction: () => assertFunctionPure,
  assertParameters: () => assertParametersPure,
  assertReturn: () => assertReturnPure,
  equalsFunction: () => equalsFunctionPure,
  equalsParameters: () => equalsParametersPure,
  equalsReturn: () => equalsReturnPure,
  isFunction: () => isFunctionPure,
  isParameters: () => isParametersPure,
  isReturn: () => isReturnPure,
  validateEqualsFunction: () => validateEqualsFunctionPure,
  validateEqualsParameters: () => validateEqualsParametersPure,
  validateEqualsReturn: () => validateEqualsReturnPure,
  validateFunction: () => validateFunctionPure,
  validateParameters: () => validateParametersPure,
  validateReturn: () => validateReturnPure
});
__name(assertFunction, "assertFunction");
var assertFunctionPure = Object.assign(assertFunction, assert("functional.assertFunction"), functional_exports.functionalAssert());
var assertParametersPure = Object.assign(assertFunction, assert("functional.assertFunction"), functional_exports.functionalAssert());
__name(assertReturn, "assertReturn");
var assertReturnPure = Object.assign(assertReturn, assert("functional.assertReturn"), functional_exports.functionalAssert());
__name(assertEqualsFunction, "assertEqualsFunction");
var assertEqualsFunctionPure = Object.assign(assertEqualsFunction, assert("functional.assertEqualsFunction"), functional_exports.functionalAssert());
__name(assertEqualsParameters, "assertEqualsParameters");
var assertEqualsParametersPure = Object.assign(assertEqualsParameters, assert("functional.assertEqualsParameters"), functional_exports.functionalAssert());
__name(assertEqualsReturn, "assertEqualsReturn");
var assertEqualsReturnPure = Object.assign(assertEqualsReturn, assert("functional.assertEqualsReturn"), functional_exports.functionalAssert());
__name(isFunction, "isFunction");
var isFunctionPure = Object.assign(isFunction, is());
__name(isParameters, "isParameters");
var isParametersPure = Object.assign(isParameters, is());
__name(isReturn, "isReturn");
var isReturnPure = Object.assign(isReturn, is());
__name(equalsFunction, "equalsFunction");
var equalsFunctionPure = Object.assign(equalsFunction, is());
__name(equalsParameters, "equalsParameters");
var equalsParametersPure = Object.assign(equalsParameters, is());
__name(equalsReturn, "equalsReturn");
var equalsReturnPure = Object.assign(equalsReturn, is());
__name(validateFunction, "validateFunction");
var validateFunctionPure = Object.assign(validateFunction, validate());
__name(validateParameters, "validateParameters");
var validateParametersPure = Object.assign(validateParameters, validate());
__name(validateReturn, "validateReturn");
var validateReturnPure = Object.assign(validateReturn, validate());
__name(validateEqualsFunction, "validateEqualsFunction");
var validateEqualsFunctionPure = Object.assign(validateEqualsFunction, validate());
__name(validateEqualsParameters, "validateEqualsParameters");
var validateEqualsParametersPure = Object.assign(validateEqualsParameters, validate());
__name(validateEqualsReturn, "validateEqualsReturn");
var validateEqualsReturnPure = Object.assign(validateEqualsReturn, validate());
__name(halt3, "halt");

// node_modules/typia/lib/chunk-66ANC3YQ.mjs
var QueryReader_exports = {};
__export(QueryReader_exports, {
  array: () => array2,
  bigint: () => bigint2,
  boolean: () => boolean2,
  number: () => number2,
  params: () => params,
  string: () => string2
});
var boolean2 = __name((str) => str === null ? undefined : str === "null" ? null : str.length === 0 ? true : str === "true" || str === "1" ? true : str === "false" || str === "0" ? false : str, "boolean");
var number2 = __name((str) => str?.length ? str === "null" ? null : toNumber(str) : undefined, "number");
var bigint2 = __name((str) => str?.length ? str === "null" ? null : toBigint(str) : undefined, "bigint");
var string2 = __name((str) => str === null ? undefined : str === "null" ? null : str, "string");
var params = __name((input) => {
  if (typeof input === "string") {
    const index = input.indexOf("?");
    input = index === -1 ? "" : input.substring(index + 1);
    return new URLSearchParams(input);
  }
  return input;
}, "params");
var array2 = __name((input, alternative) => input.length ? input : alternative, "array");
var toNumber = __name((str) => {
  const value = Number(str);
  return isNaN(value) ? str : value;
}, "toNumber");
var toBigint = __name((str) => {
  try {
    return BigInt(str);
  } catch {
    return str;
  }
}, "toBigint");

// node_modules/typia/lib/chunk-24WYUYO5.mjs
var FormDataReader_exports = {};
__export(FormDataReader_exports, {
  array: () => array3,
  bigint: () => bigint3,
  blob: () => blob,
  boolean: () => boolean3,
  file: () => file,
  number: () => number3,
  string: () => string3
});
var boolean3 = __name((input) => input instanceof File ? input : input === null ? undefined : input === "null" ? null : input.length === 0 ? true : input === "true" || input === "1" ? true : input === "false" || input === "0" ? false : input, "boolean");
var number3 = __name((input) => input instanceof File ? input : input?.length ? input === "null" ? null : toNumber2(input) : undefined, "number");
var bigint3 = __name((input) => input instanceof File ? input : input?.length ? input === "null" ? null : toBigint2(input) : undefined, "bigint");
var string3 = __name((input) => input instanceof File ? input : input === null ? undefined : input === "null" ? null : input, "string");
var array3 = __name((input, alternative) => input.length ? input : alternative, "array");
var blob = __name((input) => input instanceof Blob ? input : input === null ? undefined : input === "null" ? null : input, "blob");
var file = __name((input) => input instanceof File ? input : input === null ? undefined : input === "null" ? null : input, "file");
var toNumber2 = __name((str) => {
  const value = Number(str);
  return isNaN(value) ? str : value;
}, "toNumber");
var toBigint2 = __name((str) => {
  try {
    return BigInt(str);
  } catch {
    return str;
  }
}, "toBigint");

// node_modules/typia/lib/chunk-4VKMZH7Y.mjs
var HeadersReader_exports = {};
__export(HeadersReader_exports, {
  bigint: () => bigint4,
  boolean: () => boolean4,
  number: () => number4,
  string: () => string4
});
var boolean4 = __name((value) => value !== undefined ? value === "true" ? true : value === "false" ? false : value : undefined, "boolean");
var bigint4 = __name((value) => value !== undefined ? toBigint3(value) : undefined, "bigint");
var number4 = __name((value) => value !== undefined ? toNumber3(value) : undefined, "number");
var string4 = __name((value) => value, "string");
var toBigint3 = __name((str) => {
  try {
    return BigInt(str);
  } catch {
    return str;
  }
}, "toBigint");
var toNumber3 = __name((str) => {
  const value = Number(str);
  return isNaN(value) ? str : value;
}, "toNumber");

// node_modules/typia/lib/chunk-HC4U3DLA.mjs
var ParameterReader_exports = {};
__export(ParameterReader_exports, {
  bigint: () => bigint5,
  boolean: () => boolean5,
  number: () => number5,
  string: () => string5
});
var boolean5 = __name((value) => value !== "null" ? value === "true" || value === "1" ? true : value === "false" || value === "0" ? false : value : null, "boolean");
var bigint5 = __name((value) => value !== "null" ? toBigint4(value) : null, "bigint");
var number5 = __name((value) => value !== "null" ? toNumber4(value) : null, "number");
var string5 = __name((value) => value !== "null" ? value : null, "string");
var toNumber4 = __name((str) => {
  const value = Number(str);
  return isNaN(value) ? str : value;
}, "toNumber");
var toBigint4 = __name((str) => {
  try {
    return BigInt(str);
  } catch {
    return str;
  }
}, "toBigint");

// node_modules/typia/lib/chunk-EKGBYURS.mjs
var http_exports = {};
__export(http_exports, {
  formData: () => formData,
  headers: () => headers,
  parameter: () => parameter,
  query: () => query
});
var formData = __name(() => FormDataReader_exports, "formData");
var headers = __name(() => HeadersReader_exports, "headers");
var parameter = __name(() => ParameterReader_exports, "parameter");
var query = __name(() => QueryReader_exports, "query");

// node_modules/typia/lib/chunk-2XYJ6UQE.mjs
var formData2 = function() {
  halt4("formData");
};
var assertFormData = function() {
  halt4("assertFormData");
};
var isFormData = function() {
  halt4("isFormData");
};
var validateFormData = function() {
  halt4("validateFormData");
};
var query2 = function() {
  halt4("query");
};
var assertQuery = function() {
  halt4("assertQuery");
};
var isQuery = function() {
  halt4("isQuery");
};
var validateQuery = function() {
  halt4("validateQuery");
};
var headers2 = function() {
  halt4("headers");
};
var assertHeaders = function() {
  halt4("assertHeaders");
};
var isHeaders = function() {
  halt4("isHeaders");
};
var validateHeaders = function() {
  halt4("validateHeaders");
};
var parameter2 = function() {
  halt4("parameter");
};
var createFormData = function() {
  halt4("createFormData");
};
var createAssertFormData = function() {
  halt4("createAssertFormData");
};
var createIsFormData = function() {
  halt4("createIsFormData");
};
var createValidateFormData = function() {
  halt4("createValidateFormData");
};
var createQuery = function() {
  halt4("createQuery");
};
var createAssertQuery = function() {
  halt4("createAssertQuery");
};
var createIsQuery = function() {
  halt4("createIsQuery");
};
var createValidateQuery = function() {
  halt4("createValidateQuery");
};
var createHeaders = function() {
  halt4("createHeaders");
};
var createAssertHeaders = function() {
  halt4("createAssertHeaders");
};
var createIsHeaders = function() {
  halt4("createIsHeaders");
};
var createValidateHeaders = function() {
  halt4("createValidateHeaders");
};
var createParameter = function() {
  halt4("createParameter");
};
var halt4 = function(name) {
  throw new Error(`Error on typia.http.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var http_exports2 = {};
__export(http_exports2, {
  assertFormData: () => assertFormDataPure,
  assertHeaders: () => assertHeadersPure,
  assertQuery: () => assertQueryPure,
  createAssertFormData: () => createAssertFormDataPure,
  createAssertHeaders: () => createAssertHeadersPure,
  createAssertQuery: () => createAssertQueryPure,
  createFormData: () => createFormDataPure,
  createHeaders: () => createHeadersPure,
  createIsFormData: () => createIsFormDataPure,
  createIsHeaders: () => createIsHeadersPure,
  createIsQuery: () => createIsQueryPure,
  createParameter: () => createParameterPure,
  createQuery: () => createQueryPure,
  createValidateFormData: () => createValidateFormDataPure,
  createValidateHeaders: () => createValidateHeadersPure,
  createValidateQuery: () => createValidateQueryPure,
  formData: () => formDataPure,
  headers: () => headersPure,
  isFormData: () => isFormDataPure,
  isHeaders: () => isHeadersPure,
  isQuery: () => isQueryPure,
  parameter: () => parameterPure,
  query: () => queryPure,
  validateFormData: () => validateFormDataPure,
  validateHeaders: () => validateHeadersPure,
  validateQuery: () => validateQueryPure
});
__name(formData2, "formData");
var formDataPure = Object.assign(formData2, http_exports.formData());
__name(assertFormData, "assertFormData");
var assertFormDataPure = Object.assign(assertFormData, http_exports.formData(), assert("http.assertFormData"));
__name(isFormData, "isFormData");
var isFormDataPure = Object.assign(isFormData, http_exports.formData(), is());
__name(validateFormData, "validateFormData");
var validateFormDataPure = Object.assign(validateFormData, http_exports.formData(), validate());
__name(query2, "query");
var queryPure = Object.assign(query2, http_exports.query());
__name(assertQuery, "assertQuery");
var assertQueryPure = Object.assign(assertQuery, http_exports.query(), assert("http.assertQuery"));
__name(isQuery, "isQuery");
var isQueryPure = Object.assign(isQuery, http_exports.query(), is());
__name(validateQuery, "validateQuery");
var validateQueryPure = Object.assign(validateQuery, http_exports.query(), validate());
__name(headers2, "headers");
var headersPure = Object.assign(headers2, http_exports.headers());
__name(assertHeaders, "assertHeaders");
var assertHeadersPure = Object.assign(assertHeaders, http_exports.headers(), assert("http.assertHeaders"));
__name(isHeaders, "isHeaders");
var isHeadersPure = Object.assign(isHeaders, http_exports.headers(), is());
__name(validateHeaders, "validateHeaders");
var validateHeadersPure = Object.assign(validateHeaders, http_exports.headers(), validate());
__name(parameter2, "parameter");
var parameterPure = Object.assign(parameter2, http_exports.parameter(), assert("http.parameter"));
__name(createFormData, "createFormData");
var createFormDataPure = Object.assign(createFormData, http_exports.formData());
__name(createAssertFormData, "createAssertFormData");
var createAssertFormDataPure = Object.assign(createAssertFormData, http_exports.formData(), assert("http.createAssertFormData"));
__name(createIsFormData, "createIsFormData");
var createIsFormDataPure = Object.assign(createIsFormData, http_exports.formData(), is());
__name(createValidateFormData, "createValidateFormData");
var createValidateFormDataPure = Object.assign(createValidateFormData, http_exports.formData(), validate());
__name(createQuery, "createQuery");
var createQueryPure = Object.assign(createQuery, http_exports.query());
__name(createAssertQuery, "createAssertQuery");
var createAssertQueryPure = Object.assign(createAssertQuery, http_exports.query(), assert("http.createAssertQuery"));
__name(createIsQuery, "createIsQuery");
var createIsQueryPure = Object.assign(createIsQuery, http_exports.query(), is());
__name(createValidateQuery, "createValidateQuery");
var createValidateQueryPure = Object.assign(createValidateQuery, http_exports.query(), validate());
__name(createHeaders, "createHeaders");
var createHeadersPure = Object.assign(createHeaders, http_exports.headers());
__name(createAssertHeaders, "createAssertHeaders");
var createAssertHeadersPure = Object.assign(createAssertHeaders, http_exports.headers(), assert("http.createAssertHeaders"));
__name(createIsHeaders, "createIsHeaders");
var createIsHeadersPure = Object.assign(createIsHeaders, http_exports.headers(), is());
__name(createValidateHeaders, "createValidateHeaders");
var createValidateHeadersPure = Object.assign(createValidateHeaders, http_exports.headers(), validate());
__name(createParameter, "createParameter");
var createParameterPure = Object.assign(createParameter, http_exports.parameter(), assert("http.createParameter"));
__name(halt4, "halt");

// node_modules/typia/lib/chunk-3YEWR4VS.mjs
var $tail = __name((str) => str[str.length - 1] === "," ? str.substring(0, str.length - 1) : str, "$tail");

// node_modules/typia/lib/chunk-P563YOO2.mjs
var $number = __name((value) => {
  if (isFinite(value) === false)
    throw new TypeGuardError({
      method: "typia.json.stringify",
      expected: "number",
      value,
      message: "Error on typia.json.stringify(): infinite or not a number."
    });
  return value;
}, "$number");

// node_modules/typia/lib/chunk-BBL77UNG.mjs
var $rest = __name((str) => {
  return str.length === 2 ? "" : "," + str.substring(1, str.length - 1);
}, "$rest");

// node_modules/typia/lib/chunk-P5ITYPJY.mjs
var $string = __name((str) => {
  const len = str.length;
  let result = "";
  let last = -1;
  let point = 255;
  for (var i = 0;i < len; i++) {
    point = str.charCodeAt(i);
    if (point < 32) {
      return JSON.stringify(str);
    }
    if (point >= 55296 && point <= 57343) {
      return JSON.stringify(str);
    }
    if (point === 34 || point === 92) {
      last === -1 && (last = 0);
      result += str.slice(last, i) + "\\";
      last = i;
    }
  }
  return last === -1 && '"' + str + '"' || '"' + result + str.slice(last) + '"';
}, "$string");

// node_modules/typia/lib/chunk-3J5LOGBO.mjs
var json_exports = {};
__export(json_exports, {
  stringify: () => stringify
});
var stringify = __name((method) => ({
  ...is(),
  number: $number,
  string: $string,
  tail: $tail,
  rest: $rest,
  throws: $throws(`json.${method}`)
}), "stringify");

// node_modules/typia/lib/chunk-SRIZVGAL.mjs
var application = function() {
  halt5("application");
};
var assertParse = function() {
  halt5("assertParse");
};
var isParse = function() {
  halt5("isParse");
};
var validateParse = function() {
  halt5("validateParse");
};
var stringify2 = function() {
  halt5("stringify");
};
var assertStringify = function() {
  halt5("assertStringify");
};
var isStringify = function() {
  halt5("isStringify");
};
var validateStringify = function() {
  halt5("validateStringify");
};
var createIsParse = function() {
  halt5("createIsParse");
};
var createAssertParse = function() {
  halt5("createAssertParse");
};
var createValidateParse = function() {
  halt5("createValidateParse");
};
var createStringify = function() {
  halt5("createStringify");
};
var createAssertStringify = function() {
  halt5("createAssertStringify");
};
var createIsStringify = function() {
  halt5("createIsStringify");
};
var createValidateStringify = function() {
  halt5("createValidateStringify");
};
var halt5 = function(name) {
  throw new Error(`Error on typia.json.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var json_exports2 = {};
__export(json_exports2, {
  application: () => application,
  assertParse: () => assertParsePure,
  assertStringify: () => assertStringifyPure,
  createAssertParse: () => createAssertParsePure,
  createAssertStringify: () => createAssertStringifyPure,
  createIsParse: () => createIsParsePure,
  createIsStringify: () => createIsStringifyPure,
  createStringify: () => createStringifyPure,
  createValidateParse: () => createValidateParsePure,
  createValidateStringify: () => createValidateStringifyPure,
  isParse: () => isParsePure,
  isStringify: () => isStringifyPure,
  stringify: () => stringifyPure,
  validateParse: () => validateParsePure,
  validateStringify: () => validateStringifyPure
});
__name(application, "application");
__name(assertParse, "assertParse");
var assertParsePure = Object.assign(assertParse, assert("json.assertParse"));
__name(isParse, "isParse");
var isParsePure = Object.assign(isParse, is());
__name(validateParse, "validateParse");
var validateParsePure = Object.assign(validateParse, validate());
__name(stringify2, "stringify");
var stringifyPure = Object.assign(stringify2, json_exports.stringify("stringify"));
__name(assertStringify, "assertStringify");
var assertStringifyPure = Object.assign(assertStringify, assert("json.assertStringify"), json_exports.stringify("assertStringify"));
__name(isStringify, "isStringify");
var isStringifyPure = Object.assign(isStringify, is(), json_exports.stringify("isStringify"));
__name(validateStringify, "validateStringify");
var validateStringifyPure = Object.assign(validateStringify, validate(), json_exports.stringify("validateStringify"));
__name(createIsParse, "createIsParse");
var createIsParsePure = Object.assign(createIsParse, isParsePure);
__name(createAssertParse, "createAssertParse");
var createAssertParsePure = Object.assign(createAssertParse, assertParsePure);
__name(createValidateParse, "createValidateParse");
var createValidateParsePure = Object.assign(createValidateParse, validateParsePure);
__name(createStringify, "createStringify");
var createStringifyPure = Object.assign(createStringify, stringifyPure);
__name(createAssertStringify, "createAssertStringify");
var createAssertStringifyPure = Object.assign(createAssertStringify, assertStringifyPure);
__name(createIsStringify, "createIsStringify");
var createIsStringifyPure = Object.assign(createIsStringify, isStringifyPure);
__name(createValidateStringify, "createValidateStringify");
var createValidateStringifyPure = Object.assign(createValidateStringify, validateStringifyPure);
__name(halt5, "halt");

// node_modules/typia/lib/chunk-KN6E5CY4.mjs
var $clone = __name((value) => JSON.parse(JSON.stringify(value)), "$clone");

// node_modules/typia/lib/chunk-VHPYXP2S.mjs
var $any = __name((val) => val !== undefined ? $clone(val) : undefined, "$any");

// node_modules/typia/lib/chunk-HY2UA72O.mjs
var misc_exports = {};
__export(misc_exports, {
  clone: () => clone,
  prune: () => prune
});
var clone = __name((method) => ({
  ...is(),
  throws: $throws(`misc.${method}`),
  any: $any
}), "clone");
var prune = __name((method) => ({
  ...is(),
  throws: $throws(`misc.${method}`)
}), "prune");

// node_modules/typia/lib/chunk-KOSSSGHT.mjs
var literals = function() {
  halt6("literals");
};
var clone2 = function() {
  halt6("clone");
};
var assertClone = function() {
  halt6("assertClone");
};
var isClone = function() {
  halt6("isClone");
};
var validateClone = function() {
  halt6("validateClone");
};
var prune2 = function() {
  halt6("prune");
};
var assertPrune = function() {
  halt6("assertPrune");
};
var isPrune = function() {
  halt6("isPrune");
};
var validatePrune = function() {
  halt6("validatePrune");
};
var createClone = function() {
  halt6("createClone");
};
var createAssertClone = function() {
  halt6("createAssertClone");
};
var createIsClone = function() {
  halt6("createIsClone");
};
var createValidateClone = function() {
  halt6("createValidateClone");
};
var createPrune = function() {
  halt6("createPrune");
};
var createAssertPrune = function() {
  halt6("createAssertPrune");
};
var createIsPrune = function() {
  halt6("createIsPrune");
};
var createValidatePrune = function() {
  halt6("createValidatePrune");
};
var halt6 = function(name) {
  throw new Error(`Error on typia.misc.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var misc_exports2 = {};
__export(misc_exports2, {
  assertClone: () => assertClonePure,
  assertPrune: () => assertPrunePure,
  clone: () => clonePure,
  createAssertClone: () => createAssertClonePure,
  createAssertPrune: () => createAssertPrunePure,
  createClone: () => createClonePure,
  createIsClone: () => createIsClonePure,
  createIsPrune: () => createIsPrunePure,
  createPrune: () => createPrunePure,
  createValidateClone: () => createValidateClonePure,
  createValidatePrune: () => createValidatePrunePure,
  isClone: () => isClonePure,
  isPrune: () => isPrunePure,
  literals: () => literals,
  prune: () => prunePure,
  validateClone: () => validateClonePure,
  validatePrune: () => validatePrunePure
});
__name(literals, "literals");
__name(clone2, "clone");
var clonePure = Object.assign(clone2, misc_exports.clone("clone"));
__name(assertClone, "assertClone");
var assertClonePure = Object.assign(assertClone, assert("misc.assertClone"), misc_exports.clone("assertClone"));
__name(isClone, "isClone");
var isClonePure = Object.assign(isClone, is(), misc_exports.clone("isClone"));
__name(validateClone, "validateClone");
var validateClonePure = Object.assign(validateClone, validate(), misc_exports.clone("validateClone"));
__name(prune2, "prune");
var prunePure = Object.assign(prune2, misc_exports.prune("prune"));
__name(assertPrune, "assertPrune");
var assertPrunePure = Object.assign(assertPrune, assert("misc.assertPrune"), misc_exports.prune("assertPrune"));
__name(isPrune, "isPrune");
var isPrunePure = Object.assign(isPrune, is(), misc_exports.prune("isPrune"));
__name(validatePrune, "validatePrune");
var validatePrunePure = Object.assign(validatePrune, misc_exports.prune("validatePrune"), validate());
__name(createClone, "createClone");
var createClonePure = Object.assign(createClone, clonePure);
__name(createAssertClone, "createAssertClone");
var createAssertClonePure = Object.assign(createAssertClone, assertClonePure);
__name(createIsClone, "createIsClone");
var createIsClonePure = Object.assign(createIsClone, isClonePure);
__name(createValidateClone, "createValidateClone");
var createValidateClonePure = Object.assign(createValidateClone, validateClonePure);
__name(createPrune, "createPrune");
var createPrunePure = Object.assign(createPrune, prunePure);
__name(createAssertPrune, "createAssertPrune");
var createAssertPrunePure = Object.assign(createAssertPrune, assertPrunePure);
__name(createIsPrune, "createIsPrune");
var createIsPrunePure = Object.assign(createIsPrune, isPrunePure);
__name(createValidatePrune, "createValidatePrune");
var createValidatePrunePure = Object.assign(createValidatePrune, validatePrunePure);
__name(halt6, "halt");

// node_modules/typia/lib/chunk-3UX7U24R.mjs
var $convention = __name((rename) => {
  const main = __name((input) => {
    if (typeof input === "object")
      if (input === null)
        return null;
      else if (Array.isArray(input))
        return input.map(main);
      else if (input instanceof Boolean || input instanceof BigInt || input instanceof Number || input instanceof String)
        return input.valueOf();
      else if (input instanceof Date)
        return new Date(input);
      else if (input instanceof Uint8Array || input instanceof Uint8ClampedArray || input instanceof Uint16Array || input instanceof Uint32Array || input instanceof BigUint64Array || input instanceof Int8Array || input instanceof Int16Array || input instanceof Int32Array || input instanceof BigInt64Array || input instanceof Float32Array || input instanceof Float64Array || input instanceof DataView)
        return input;
      else
        return object(input);
    return input;
  }, "main");
  const object = __name((input) => Object.fromEntries(Object.entries(input).map(([key, value]) => [
    rename(key),
    main(value)
  ])), "object");
  return main;
}, "$convention");

// node_modules/typia/lib/chunk-CLXKMTSC.mjs
var StringUtil_exports = {};
__export(StringUtil_exports, {
  capitalize: () => capitalize,
  escapeDuplicate: () => escapeDuplicate
});
var capitalize = __name((str) => str.length ? str[0].toUpperCase() + str.slice(1) : str, "capitalize");
var escapeDuplicate = __name((keep) => (change) => keep.includes(change) ? escapeDuplicate(keep)(`_${change}`) : change, "escapeDuplicate");

// node_modules/typia/lib/chunk-WOK6UZUJ.mjs
var snake = function(str) {
  const indexes = [];
  for (let i = 0;i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (65 <= code && code <= 90)
      indexes.push(i);
  }
  for (let i = indexes.length - 1;i > 0; --i) {
    const now = indexes[i];
    const prev = indexes[i - 1];
    if (now - prev === 1)
      indexes.splice(i, 1);
  }
  if (indexes.length !== 0 && indexes[0] === 0)
    indexes.splice(0, 1);
  if (indexes.length === 0)
    return str.toLowerCase();
  let ret = "";
  for (let i = 0;i < indexes.length; i++) {
    const first = i === 0 ? 0 : indexes[i - 1];
    const last = indexes[i];
    ret += str.substring(first, last).toLowerCase();
    ret += "_";
  }
  ret += str.substring(indexes[indexes.length - 1]).toLowerCase();
  return ret;
};
var camel = function(str) {
  return unsnake((str2) => {
    if (str2.length === 0)
      return str2;
    else if (str2[0] === str2[0].toUpperCase())
      return str2[0].toLowerCase() + str2.substring(1);
    else
      return str2;
  })(str);
};
var pascal = function(str) {
  return unsnake((str2) => {
    if (str2.length === 0)
      return str2;
    else if (str2[0] === str2[0].toLowerCase())
      return str2[0].toUpperCase() + str2.substring(1);
    else
      return str2;
  })(str);
};
var NamingConvention_exports = {};
__export(NamingConvention_exports, {
  camel: () => camel,
  pascal: () => pascal,
  snake: () => snake
});
__name(snake, "snake");
__name(camel, "camel");
__name(pascal, "pascal");
var unsnake = __name((escaper) => (str) => {
  let prefix = "";
  for (let i = 0;i < str.length; i++) {
    if (str[i] === "_")
      prefix += "_";
    else
      break;
  }
  if (prefix.length !== 0)
    str = str.substring(prefix.length);
  const indexes = [];
  for (let i = 0;i < str.length; i++) {
    const ch = str[i];
    if (ch !== "_")
      continue;
    const last2 = indexes[indexes.length - 1];
    if (last2 === undefined || last2[0] + last2[1] !== i)
      indexes.push([
        i,
        1
      ]);
    else
      ++last2[1];
  }
  if (indexes.length === 0)
    return prefix + escaper(str);
  let ret = "";
  for (let i = 0;i < indexes.length; i++) {
    const [first] = indexes[i];
    if (i === 0)
      if (first === 0)
        ret += "_";
      else
        ret += str.substring(0, first);
    else {
      const [prevFirst, prevLength] = indexes[i - 1];
      const piece2 = str.substring(prevFirst + prevLength, first);
      if (piece2.length)
        ret += StringUtil_exports.capitalize(piece2);
    }
  }
  const last = indexes[indexes.length - 1];
  const piece = str.substring(last[0] + last[1]);
  if (last.length)
    ret += StringUtil_exports.capitalize(piece);
  return prefix + escaper(ret);
}, "unsnake");

// node_modules/typia/lib/chunk-TV23ZDC6.mjs
var notations_exports = {};
__export(notations_exports, {
  camel: () => camel2,
  pascal: () => pascal2,
  snake: () => snake2
});
var camel2 = __name((method) => ({
  ...base(method),
  any: $convention(NamingConvention_exports.camel)
}), "camel");
var pascal2 = __name((method) => ({
  ...base(method),
  any: $convention(NamingConvention_exports.pascal)
}), "pascal");
var snake2 = __name((method) => ({
  ...base(method),
  any: $convention(NamingConvention_exports.snake)
}), "snake");
var base = __name((method) => ({
  ...is(),
  throws: $throws(`notations.${method}`)
}), "base");

// node_modules/typia/lib/chunk-MGRNGJTC.mjs
var camel3 = function() {
  return halt7("camel");
};
var assertCamel = function() {
  return halt7("assertCamel");
};
var isCamel = function() {
  return halt7("isCamel");
};
var validateCamel = function() {
  return halt7("validateCamel");
};
var pascal3 = function() {
  return halt7("pascal");
};
var assertPascal = function() {
  return halt7("assertPascal");
};
var isPascal = function() {
  return halt7("isPascal");
};
var validatePascal = function() {
  return halt7("validatePascal");
};
var snake3 = function() {
  return halt7("snake");
};
var assertSnake = function() {
  return halt7("assertSnake");
};
var isSnake = function() {
  return halt7("isSnake");
};
var validateSnake = function() {
  return halt7("validateSnake");
};
var createCamel = function() {
  halt7("createCamel");
};
var createAssertCamel = function() {
  halt7("createAssertCamel");
};
var createIsCamel = function() {
  halt7("createIsCamel");
};
var createValidateCamel = function() {
  halt7("createValidateCamel");
};
var createPascal = function() {
  halt7("createPascal");
};
var createAssertPascal = function() {
  halt7("createAssertPascal");
};
var createIsPascal = function() {
  halt7("createIsPascal");
};
var createValidatePascal = function() {
  halt7("createValidatePascal");
};
var createSnake = function() {
  halt7("createSnake");
};
var createAssertSnake = function() {
  halt7("createAssertSnake");
};
var createIsSnake = function() {
  halt7("createIsSnake");
};
var createValidateSnake = function() {
  halt7("createValidateSnake");
};
var halt7 = function(name) {
  throw new Error(`Error on typia.notations.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var notations_exports2 = {};
__export(notations_exports2, {
  assertCamel: () => assertCamelPure,
  assertPascal: () => assertPascalPure,
  assertSnake: () => assertSnakePure,
  camel: () => camelPure,
  createAssertCamel: () => createAssertCamelPure,
  createAssertPascal: () => createAssertPascalPure,
  createAssertSnake: () => createAssertSnakePure,
  createCamel: () => createCamelPure,
  createIsCamel: () => createIsCamelPure,
  createIsPascal: () => createIsPascalPure,
  createIsSnake: () => createIsSnakePure,
  createPascal: () => createPascalPure,
  createSnake: () => createSnakePure,
  createValidateCamel: () => createValidateCamelPure,
  createValidatePascal: () => createValidatePascalPure,
  createValidateSnake: () => createValidateSnakePure,
  isCamel: () => isCamelPure,
  isPascal: () => isPascalPure,
  isSnake: () => isSnakePure,
  pascal: () => pascalPure,
  snake: () => snakePure,
  validateCamel: () => validateCamelPure,
  validatePascal: () => validatePascalPure,
  validateSnake: () => validateSnakePure
});
__name(camel3, "camel");
var camelPure = Object.assign(camel3, notations_exports.camel("camel"));
__name(assertCamel, "assertCamel");
var assertCamelPure = Object.assign(assertCamel, notations_exports.camel("assertCamel"), assert("notations.assertCamel"));
__name(isCamel, "isCamel");
var isCamelPure = Object.assign(isCamel, notations_exports.camel("isCamel"), is());
__name(validateCamel, "validateCamel");
var validateCamelPure = Object.assign(validateCamel, notations_exports.camel("validateCamel"), validate());
__name(pascal3, "pascal");
var pascalPure = Object.assign(pascal3, notations_exports.pascal("pascal"));
__name(assertPascal, "assertPascal");
var assertPascalPure = Object.assign(assertPascal, notations_exports.pascal("assertPascal"), assert("notations.assertPascal"));
__name(isPascal, "isPascal");
var isPascalPure = Object.assign(isPascal, notations_exports.pascal("isPascal"), is());
__name(validatePascal, "validatePascal");
var validatePascalPure = Object.assign(validatePascal, notations_exports.pascal("validatePascal"), validate());
__name(snake3, "snake");
var snakePure = Object.assign(snake3, notations_exports.snake("snake"));
__name(assertSnake, "assertSnake");
var assertSnakePure = Object.assign(assertSnake, notations_exports.snake("assertSnake"), assert("notations.assertSnake"));
__name(isSnake, "isSnake");
var isSnakePure = Object.assign(isSnake, notations_exports.snake("isSnake"), is());
__name(validateSnake, "validateSnake");
var validateSnakePure = Object.assign(validateSnake, notations_exports.snake("validateSnake"), validate());
__name(createCamel, "createCamel");
var createCamelPure = Object.assign(createCamel, notations_exports.camel("createCamel"));
__name(createAssertCamel, "createAssertCamel");
var createAssertCamelPure = Object.assign(createAssertCamel, notations_exports.camel("createAssertCamel"), assert("notations.createAssertCamel"));
__name(createIsCamel, "createIsCamel");
var createIsCamelPure = Object.assign(createIsCamel, notations_exports.camel("createIsCamel"), is());
__name(createValidateCamel, "createValidateCamel");
var createValidateCamelPure = Object.assign(createValidateCamel, notations_exports.camel("createValidateCamel"), validate());
__name(createPascal, "createPascal");
var createPascalPure = Object.assign(createPascal, notations_exports.pascal("createPascal"));
__name(createAssertPascal, "createAssertPascal");
var createAssertPascalPure = Object.assign(createAssertPascal, notations_exports.pascal("createAssertPascal"), assert("notations.createAssertPascal"));
__name(createIsPascal, "createIsPascal");
var createIsPascalPure = Object.assign(createIsPascal, notations_exports.pascal("createIsPascal"), is());
__name(createValidatePascal, "createValidatePascal");
var createValidatePascalPure = Object.assign(createValidatePascal, notations_exports.pascal("createValidatePascal"), validate());
__name(createSnake, "createSnake");
var createSnakePure = Object.assign(createSnake, notations_exports.snake("createSnake"));
__name(createAssertSnake, "createAssertSnake");
var createAssertSnakePure = Object.assign(createAssertSnake, notations_exports.snake("createAssertSnake"), assert("notations.createAssertSnake"));
__name(createIsSnake, "createIsSnake");
var createIsSnakePure = Object.assign(createIsSnake, notations_exports.snake("createIsSnake"), is());
__name(createValidateSnake, "createValidateSnake");
var createValidateSnakePure = Object.assign(createValidateSnake, notations_exports.snake("createValidateSnake"), validate());
__name(halt7, "halt");

// node_modules/typia/lib/chunk-BNA5VIM5.mjs
var assert2 = function() {
  halt8("assert");
};
var assertGuard = function() {
  halt8("assertGuard");
};
var is2 = function() {
  halt8("is");
};
var validate2 = function() {
  halt8("validate");
};
var assertEquals = function() {
  halt8("assertEquals");
};
var assertGuardEquals = function() {
  halt8("assertGuardEquals");
};
var equals = function() {
  halt8("equals");
};
var validateEquals = function() {
  halt8("validateEquals");
};
var random2 = function() {
  halt8("random");
};
var createAssert = function() {
  halt8("createAssert");
};
var createAssertGuard = function() {
  halt8("createAssertGuard");
};
var createIs = function() {
  halt8("createIs");
};
var createValidate = function() {
  halt8("createValidate");
};
var createAssertEquals = function() {
  halt8("createAssertEquals");
};
var createAssertGuardEquals = function() {
  halt8("createAssertGuardEquals");
};
var createEquals = function() {
  halt8("createEquals");
};
var createValidateEquals = function() {
  halt8("createValidateEquals");
};
var createRandom = function() {
  halt8("createRandom");
};
var halt8 = function(name) {
  throw new Error(`Error on typia.${name}(): no transform has been configured. Read and follow https://typia.io/docs/setup please.`);
};
var module_exports = {};
__export(module_exports, {
  TypeGuardError: () => TypeGuardError,
  assert: () => assertPure,
  assertEquals: () => assertEqualsPure,
  assertGuard: () => assertGuardPure,
  assertGuardEquals: () => assertGuardEqualsPure,
  createAssert: () => createAssertPure,
  createAssertEquals: () => createAssertEqualsPure,
  createAssertGuard: () => createAssertGuardPure,
  createAssertGuardEquals: () => createAssertGuardEqualsPure,
  createEquals: () => createEqualsPure,
  createIs: () => createIsPure,
  createRandom: () => createRandomPure,
  createValidate: () => createValidatePure,
  createValidateEquals: () => createValidateEqualsPure,
  equals: () => equalsPure,
  functional: () => functional_exports2,
  http: () => http_exports2,
  is: () => isPure,
  json: () => json_exports2,
  misc: () => misc_exports2,
  notations: () => notations_exports2,
  protobuf: () => protobuf_exports2,
  random: () => randomPure,
  reflect: () => reflect_exports,
  tags: () => tags_exports,
  validate: () => validatePure,
  validateEquals: () => validateEqualsPure
});
__name(assert2, "assert");
var assertPure = Object.assign(assert2, assert("assert"));
__name(assertGuard, "assertGuard");
var assertGuardPure = Object.assign(assertGuard, assert("assertGuard"));
__name(is2, "is");
var isPure = Object.assign(is2, assert("is"));
__name(validate2, "validate");
var validatePure = Object.assign(validate2, validate());
__name(assertEquals, "assertEquals");
var assertEqualsPure = Object.assign(assertEquals, assert("assertEquals"));
__name(assertGuardEquals, "assertGuardEquals");
var assertGuardEqualsPure = Object.assign(assertGuardEquals, assert("assertGuardEquals"));
__name(equals, "equals");
var equalsPure = Object.assign(equals, is());
__name(validateEquals, "validateEquals");
var validateEqualsPure = Object.assign(validateEquals, validate());
__name(random2, "random");
var randomPure = Object.assign(random2, random());
__name(createAssert, "createAssert");
var createAssertPure = Object.assign(createAssert, assertPure);
__name(createAssertGuard, "createAssertGuard");
var createAssertGuardPure = Object.assign(createAssertGuard, assertGuardPure);
__name(createIs, "createIs");
var createIsPure = Object.assign(createIs, isPure);
__name(createValidate, "createValidate");
var createValidatePure = Object.assign(createValidate, validatePure);
__name(createAssertEquals, "createAssertEquals");
var createAssertEqualsPure = Object.assign(createAssertEquals, assertEqualsPure);
__name(createAssertGuardEquals, "createAssertGuardEquals");
var createAssertGuardEqualsPure = Object.assign(createAssertGuardEquals, assertGuardEqualsPure);
__name(createEquals, "createEquals");
var createEqualsPure = Object.assign(createEquals, equalsPure);
__name(createValidateEquals, "createValidateEquals");
var createValidateEqualsPure = Object.assign(createValidateEquals, validateEqualsPure);
__name(createRandom, "createRandom");
var createRandomPure = Object.assign(createRandom, randomPure);
__name(halt8, "halt");

// node_modules/typia/lib/index.mjs
var src_default = module_exports;

// generated/index.ts
var validate3 = (input) => {
  const errors = [];
  const __is = (input2) => {
    return typeof input2 === "object" && input2 !== null && (typeof input2.name === "string" && (typeof input2.age === "number" && (Math.floor(input2.age) === input2.age && 0 <= input2.age && input2.age <= 4294967295 && 20 <= input2.age && input2.age < 100)));
  };
  if (__is(input) === false) {
    const $report2 = src_default.createValidate.report(errors);
    ((input2, _path, _exceptionable = true) => {
      const $vo0 = (input3, _path2, _exceptionable2 = true) => [typeof input3.name === "string" || $report2(_exceptionable2, {
        path: _path2 + ".name",
        expected: "string",
        value: input3.name
      }), typeof input3.age === "number" && (Math.floor(input3.age) === input3.age && 0 <= input3.age && input3.age <= 4294967295 || $report2(_exceptionable2, {
        path: _path2 + ".age",
        expected: "number & Type<\"uint32\">",
        value: input3.age
      })) && (20 <= input3.age || $report2(_exceptionable2, {
        path: _path2 + ".age",
        expected: "number & Minimum<20>",
        value: input3.age
      })) && (input3.age < 100 || $report2(_exceptionable2, {
        path: _path2 + ".age",
        expected: "number & ExclusiveMaximum<100>",
        value: input3.age
      })) || $report2(_exceptionable2, {
        path: _path2 + ".age",
        expected: "(number & Type<\"uint32\"> & Minimum<20> & ExclusiveMaximum<100>)",
        value: input3.age
      })].every((flag) => flag);
      return (typeof input2 === "object" && input2 !== null || $report2(true, {
        path: _path + "",
        expected: "Author",
        value: input2
      })) && $vo0(input2, _path + "", true) || $report2(true, {
        path: _path + "",
        expected: "Author",
        value: input2
      });
    })(input, "$input", true);
  }
  const success = errors.length === 0;
  return {
    success,
    errors,
    data: success ? input : undefined
  };
};
console.log(validate3({ name: "John", age: 30 }));
