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

// node_modules/typia/lib/utils/RandomGenerator/RandomGenerator.js
var require_RandomGenerator = __commonJS((exports) => {
  var __read = exports && exports.__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === undefined || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.relativeJsonPointer = exports.jsonPointer = exports.duration = exports.time = exports.date = exports.datetime = exports.url = exports.uriTemplate = exports.uriReference = exports.uri = exports.ipv6 = exports.ipv4 = exports.iriReference = exports.iri = exports.idnHostname = exports.idnEmail = exports.hostname = exports.email = exports.uuid = exports.regex = exports.password = exports.byte = exports.pattern = exports.length = exports.pick = exports.array = exports.string = exports.number = exports.bigint = exports.integer = exports.boolean = undefined;
  var randexp_1 = __importDefault(require_randexp());
  var ALPHABETS = "abcdefghijklmnopqrstuvwxyz";
  var boolean = function() {
    return Math.random() < 0.5;
  };
  exports.boolean = boolean;
  var integer = function(min, max) {
    min !== null && min !== undefined || (min = 0);
    max !== null && max !== undefined || (max = 100);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  exports.integer = integer;
  var bigint = function(min, max) {
    return BigInt((0, exports.integer)(Number(min !== null && min !== undefined ? min : BigInt(0)), Number(max !== null && max !== undefined ? max : BigInt(100))));
  };
  exports.bigint = bigint;
  var number = function(min, max) {
    min !== null && min !== undefined || (min = 0);
    max !== null && max !== undefined || (max = 100);
    return Math.random() * (max - min) + min;
  };
  exports.number = number;
  var string = function(length2) {
    return new Array(length2 !== null && length2 !== undefined ? length2 : (0, exports.integer)(5, 10)).fill(0).map(function() {
      return ALPHABETS[(0, exports.integer)(0, ALPHABETS.length - 1)];
    }).join("");
  };
  exports.string = string;
  var array = function(closure, count) {
    return new Array(count !== null && count !== undefined ? count : (0, exports.length)()).fill(0).map(function(_e, index) {
      return closure(index);
    });
  };
  exports.array = array;
  var pick = function(array2) {
    return array2[(0, exports.integer)(0, array2.length - 1)];
  };
  exports.pick = pick;
  var length = function() {
    return (0, exports.integer)(0, 3);
  };
  exports.length = length;
  var pattern = function(regex2) {
    var r = new randexp_1.default(regex2);
    for (var i = 0;i < 10; ++i) {
      var str = r.gen();
      if (regex2.test(str))
        return str;
    }
    return r.gen();
  };
  exports.pattern = pattern;
  var byte = function() {
    return "vt7ekz4lIoNTTS9sDQYdWKharxIFAR54+z/umIxSgUM=";
  };
  exports.byte = byte;
  var password = function() {
    return (0, exports.string)((0, exports.integer)(4, 16));
  };
  exports.password = password;
  var regex = function() {
    return "/^(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$/";
  };
  exports.regex = regex;
  var uuid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  };
  exports.uuid = uuid;
  var email = function() {
    return "".concat((0, exports.string)(10), "@").concat((0, exports.string)(10), ".").concat((0, exports.string)(3));
  };
  exports.email = email;
  var hostname = function() {
    return "".concat((0, exports.string)(10), ".").concat((0, exports.string)(3));
  };
  exports.hostname = hostname;
  var idnEmail = function() {
    return (0, exports.email)();
  };
  exports.idnEmail = idnEmail;
  var idnHostname = function() {
    return (0, exports.hostname)();
  };
  exports.idnHostname = idnHostname;
  var iri = function() {
    return (0, exports.url)();
  };
  exports.iri = iri;
  var iriReference = function() {
    return (0, exports.url)();
  };
  exports.iriReference = iriReference;
  var ipv4 = function() {
    return (0, exports.array)(function() {
      return (0, exports.integer)(0, 255);
    }, 4).join(".");
  };
  exports.ipv4 = ipv4;
  var ipv6 = function() {
    return (0, exports.array)(function() {
      return (0, exports.integer)(0, 65535).toString(16);
    }, 8).join(":");
  };
  exports.ipv6 = ipv6;
  var uri = function() {
    return (0, exports.url)();
  };
  exports.uri = uri;
  var uriReference = function() {
    return (0, exports.url)();
  };
  exports.uriReference = uriReference;
  var uriTemplate = function() {
    return (0, exports.url)();
  };
  exports.uriTemplate = uriTemplate;
  var url = function() {
    return "https://".concat((0, exports.string)(10), ".").concat((0, exports.string)(3));
  };
  exports.url = url;
  var datetime = function(min, max) {
    return new Date((0, exports.number)(min !== null && min !== undefined ? min : Date.now() - 30 * DAY, max !== null && max !== undefined ? max : Date.now() + 7 * DAY)).toISOString();
  };
  exports.datetime = datetime;
  var date = function(min, max) {
    return new Date((0, exports.number)(min !== null && min !== undefined ? min : 0, max !== null && max !== undefined ? max : Date.now() * 2)).toISOString().substring(0, 10);
  };
  exports.date = date;
  var time = function() {
    return new Date((0, exports.number)(0, DAY)).toISOString().substring(11);
  };
  exports.time = time;
  var duration = function() {
    var period = durate([
      ["Y", (0, exports.integer)(0, 100)],
      ["M", (0, exports.integer)(0, 12)],
      ["D", (0, exports.integer)(0, 31)]
    ]);
    var time2 = durate([
      ["H", (0, exports.integer)(0, 24)],
      ["M", (0, exports.integer)(0, 60)],
      ["S", (0, exports.integer)(0, 60)]
    ]);
    if (period.length + time2.length === 0)
      return "PT0S";
    return "P".concat(period).concat(time2.length ? "T" : "").concat(time2);
  };
  exports.duration = duration;
  var jsonPointer = function() {
    return "/components/schemas/".concat((0, exports.string)(10));
  };
  exports.jsonPointer = jsonPointer;
  var relativeJsonPointer = function() {
    return "".concat((0, exports.integer)(0, 10), "#");
  };
  exports.relativeJsonPointer = relativeJsonPointer;
  var DAY = 86400000;
  var durate = function(elements) {
    return elements.filter(function(_a) {
      var _b = __read(_a, 2), _unit = _b[0], value = _b[1];
      return value !== 0;
    }).map(function(_a) {
      var _b = __read(_a, 2), unit = _b[0], value = _b[1];
      return "".concat(value).concat(unit);
    }).join("");
  };
});

// node_modules/typia/lib/utils/RandomGenerator/index.js
var require_RandomGenerator2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.RandomGenerator = undefined;
  exports.RandomGenerator = __importStar(require_RandomGenerator());
});

// node_modules/typia/lib/functional/$every.js
var require_$every = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$every = undefined;
  var $every = function(array, pred) {
    var error = null;
    for (var i = 0;i < array.length; ++i)
      if ((error = pred(array[i], i)) !== null)
        return error;
    return null;
  };
  exports.$every = $every;
});

// node_modules/typia/lib/TypeGuardError.js
var require_TypeGuardError = __commonJS((exports) => {
  var __extends = exports && exports.__extends || function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
    };
  }();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.TypeGuardError = undefined;
  var TypeGuardError = function(_super) {
    __extends(TypeGuardError2, _super);
    function TypeGuardError2(props) {
      var _newTarget = this.constructor;
      var _this = _super.call(this, props.message || "Error on ".concat(props.method, "(): invalid type").concat(props.path ? " on ".concat(props.path) : "", ", expect to be ").concat(props.expected)) || this;
      var proto = _newTarget.prototype;
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(_this, proto);
      else
        _this.__proto__ = proto;
      _this.method = props.method;
      _this.path = props.path;
      _this.expected = props.expected;
      _this.value = props.value;
      return _this;
    }
    return TypeGuardError2;
  }(Error);
  exports.TypeGuardError = TypeGuardError;
});

// node_modules/typia/lib/functional/$guard.js
var require_$guard = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$guard = undefined;
  var TypeGuardError_1 = require_TypeGuardError();
  var $guard = function(method) {
    return function(exceptionable, props, factory) {
      if (exceptionable === true)
        throw (factory !== null && factory !== undefined ? factory : function(props2) {
          return new TypeGuardError_1.TypeGuardError(props2);
        })({
          method,
          path: props.path,
          expected: props.expected,
          value: props.value
        });
      return false;
    };
  };
  exports.$guard = $guard;
});

// node_modules/typia/lib/functional/$join.js
var require_$join = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$join = undefined;
  var $join = function(str) {
    return variable(str) ? ".".concat(str) : "[".concat(JSON.stringify(str), "]");
  };
  exports.$join = $join;
  var variable = function(str) {
    return reserved(str) === false && /^[a-zA-Z_$][a-zA-Z_$0-9]*$/g.test(str);
  };
  var reserved = function(str) {
    return RESERVED.has(str);
  };
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
});

// node_modules/typia/lib/functional/$report.js
var require_$report = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$report = undefined;
  var $report = function(array) {
    var reportable = function(path) {
      if (array.length === 0)
        return true;
      var last = array[array.length - 1].path;
      return path.length > last.length || last.substring(0, path.length) !== path;
    };
    return function(exceptable, error) {
      if (exceptable && reportable(error.path))
        array.push(error);
      return false;
    };
  };
  exports.$report = $report;
});

// node_modules/typia/lib/functional/$is_between.js
var require_$is_between = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$is_between = undefined;
  var $is_between = function(value, minimum, maximum) {
    return minimum <= value && value <= maximum;
  };
  exports.$is_between = $is_between;
});

// node_modules/typia/lib/functional/$stoll.js
var require_$stoll = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$is_bigint_string = undefined;
  var $is_bigint_string = function(str) {
    try {
      BigInt(str);
      return true;
    } catch (_a) {
      return false;
    }
  };
  exports.$is_bigint_string = $is_bigint_string;
});

// node_modules/typia/lib/functional/is.js
var require_is = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.is = undefined;
  var _is_between_1 = require_$is_between();
  var _stoll_1 = require_$stoll();
  var is = function() {
    return {
      is_between: _is_between_1.$is_between,
      is_bigint_string: _stoll_1.$is_bigint_string
    };
  };
  exports.is = is;
});

// node_modules/typia/lib/functional/Namespace/functional.js
var require_functional = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.functionalAssert = undefined;
  var TypeGuardError_1 = require_TypeGuardError();
  var functionalAssert = function() {
    return {
      errorFactory: function(p) {
        return new TypeGuardError_1.TypeGuardError(p);
      }
    };
  };
  exports.functionalAssert = functionalAssert;
});

// node_modules/typia/lib/functional/$number.js
var require_$number = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$number = undefined;
  var TypeGuardError_1 = require_TypeGuardError();
  var $number = function(value) {
    if (isFinite(value) === false)
      throw new TypeGuardError_1.TypeGuardError({
        method: "typia.json.stringify",
        expected: "number",
        value,
        message: "Error on typia.json.stringify(): infinite or not a number."
      });
    return value;
  };
  exports.$number = $number;
});

// node_modules/typia/lib/functional/$rest.js
var require_$rest = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$rest = undefined;
  var $rest = function(str) {
    return str.length === 2 ? "" : "," + str.substring(1, str.length - 1);
  };
  exports.$rest = $rest;
});

// node_modules/typia/lib/functional/$string.js
var require_$string = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$string = undefined;
  var $string = function(str) {
    var len = str.length;
    var result = "";
    var last = -1;
    var point = 255;
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
  };
  exports.$string = $string;
});

// node_modules/typia/lib/functional/$tail.js
var require_$tail = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$tail = undefined;
  var $tail = function(str) {
    return str[str.length - 1] === "," ? str.substring(0, str.length - 1) : str;
  };
  exports.$tail = $tail;
});

// node_modules/typia/lib/functional/$throws.js
var require_$throws = __commonJS((exports) => {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$throws = undefined;
  var TypeGuardError_1 = require_TypeGuardError();
  var $throws = function(method) {
    return function(props) {
      throw new TypeGuardError_1.TypeGuardError(__assign(__assign({}, props), { method: "typia.".concat(method) }));
    };
  };
  exports.$throws = $throws;
});

// node_modules/typia/lib/functional/Namespace/json.js
var require_json = __commonJS((exports) => {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.stringify = undefined;
  var _number_1 = require_$number();
  var _rest_1 = require_$rest();
  var _string_1 = require_$string();
  var _tail_1 = require_$tail();
  var _throws_1 = require_$throws();
  var is_1 = require_is();
  var stringify = function(method) {
    return __assign(__assign({}, (0, is_1.is)()), { number: _number_1.$number, string: _string_1.$string, tail: _tail_1.$tail, rest: _rest_1.$rest, throws: (0, _throws_1.$throws)("json.".concat(method)) });
  };
  exports.stringify = stringify;
});

// node_modules/typia/lib/functional/$FormDataReader/$FormDataReader.js
var require_$FormDataReader = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.file = exports.blob = exports.array = exports.string = exports.bigint = exports.number = exports.boolean = undefined;
  var boolean = function(input) {
    return input instanceof File ? input : input === null ? undefined : input === "null" ? null : input.length === 0 ? true : input === "true" || input === "1" ? true : input === "false" || input === "0" ? false : input;
  };
  exports.boolean = boolean;
  var number = function(input) {
    return input instanceof File ? input : (input === null || input === undefined ? undefined : input.length) ? input === "null" ? null : toNumber(input) : undefined;
  };
  exports.number = number;
  var bigint = function(input) {
    return input instanceof File ? input : (input === null || input === undefined ? undefined : input.length) ? input === "null" ? null : toBigint(input) : undefined;
  };
  exports.bigint = bigint;
  var string = function(input) {
    return input instanceof File ? input : input === null ? undefined : input === "null" ? null : input;
  };
  exports.string = string;
  var array = function(input, alternative) {
    return input.length ? input : alternative;
  };
  exports.array = array;
  var blob = function(input) {
    return input instanceof Blob ? input : input === null ? undefined : input === "null" ? null : input;
  };
  exports.blob = blob;
  var file = function(input) {
    return input instanceof File ? input : input === null ? undefined : input === "null" ? null : input;
  };
  exports.file = file;
  var toNumber = function(str) {
    var value = Number(str);
    return isNaN(value) ? str : value;
  };
  var toBigint = function(str) {
    try {
      return BigInt(str);
    } catch (_a) {
      return str;
    }
  };
});

// node_modules/typia/lib/functional/$FormDataReader/index.js
var require_$FormDataReader2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$FormDataReader = undefined;
  exports.$FormDataReader = __importStar(require_$FormDataReader());
});

// node_modules/typia/lib/functional/$HeadersReader/$HeadersReader.js
var require_$HeadersReader = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.string = exports.number = exports.bigint = exports.boolean = undefined;
  var boolean = function(value) {
    return value !== undefined ? value === "true" ? true : value === "false" ? false : value : undefined;
  };
  exports.boolean = boolean;
  var bigint = function(value) {
    return value !== undefined ? toBigint(value) : undefined;
  };
  exports.bigint = bigint;
  var number = function(value) {
    return value !== undefined ? toNumber(value) : undefined;
  };
  exports.number = number;
  var string = function(value) {
    return value;
  };
  exports.string = string;
  var toBigint = function(str) {
    try {
      return BigInt(str);
    } catch (_a) {
      return str;
    }
  };
  var toNumber = function(str) {
    var value = Number(str);
    return isNaN(value) ? str : value;
  };
});

// node_modules/typia/lib/functional/$HeadersReader/index.js
var require_$HeadersReader2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$HeadersReader = undefined;
  exports.$HeadersReader = __importStar(require_$HeadersReader());
});

// node_modules/typia/lib/functional/$ParameterReader/$ParameterReader.js
var require_$ParameterReader = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.string = exports.number = exports.bigint = exports.boolean = undefined;
  var boolean = function(value) {
    return value !== "null" ? value === "true" || value === "1" ? true : value === "false" || value === "0" ? false : value : null;
  };
  exports.boolean = boolean;
  var bigint = function(value) {
    return value !== "null" ? toBigint(value) : null;
  };
  exports.bigint = bigint;
  var number = function(value) {
    return value !== "null" ? toNumber(value) : null;
  };
  exports.number = number;
  var string = function(value) {
    return value !== "null" ? value : null;
  };
  exports.string = string;
  var toNumber = function(str) {
    var value = Number(str);
    return isNaN(value) ? str : value;
  };
  var toBigint = function(str) {
    try {
      return BigInt(str);
    } catch (_a) {
      return str;
    }
  };
});

// node_modules/typia/lib/functional/$ParameterReader/index.js
var require_$ParameterReader2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$ParameterReader = undefined;
  exports.$ParameterReader = __importStar(require_$ParameterReader());
});

// node_modules/typia/lib/functional/$QueryReader/$QueryReader.js
var require_$QueryReader = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.array = exports.params = exports.string = exports.bigint = exports.number = exports.boolean = undefined;
  var boolean = function(str) {
    return str === null ? undefined : str === "null" ? null : str.length === 0 ? true : str === "true" || str === "1" ? true : str === "false" || str === "0" ? false : str;
  };
  exports.boolean = boolean;
  var number = function(str) {
    return (str === null || str === undefined ? undefined : str.length) ? str === "null" ? null : toNumber(str) : undefined;
  };
  exports.number = number;
  var bigint = function(str) {
    return (str === null || str === undefined ? undefined : str.length) ? str === "null" ? null : toBigint(str) : undefined;
  };
  exports.bigint = bigint;
  var string = function(str) {
    return str === null ? undefined : str === "null" ? null : str;
  };
  exports.string = string;
  var params = function(input) {
    if (typeof input === "string") {
      var index = input.indexOf("?");
      input = index === -1 ? "" : input.substring(index + 1);
      return new URLSearchParams(input);
    }
    return input;
  };
  exports.params = params;
  var array = function(input, alternative) {
    return input.length ? input : alternative;
  };
  exports.array = array;
  var toNumber = function(str) {
    var value = Number(str);
    return isNaN(value) ? str : value;
  };
  var toBigint = function(str) {
    try {
      return BigInt(str);
    } catch (_a) {
      return str;
    }
  };
});

// node_modules/typia/lib/functional/$QueryReader/index.js
var require_$QueryReader2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$QueryReader = undefined;
  exports.$QueryReader = __importStar(require_$QueryReader());
});

// node_modules/typia/lib/functional/Namespace/http.js
var require_http = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.query = exports.parameter = exports.headers = exports.formData = undefined;
  var _FormDataReader_1 = require_$FormDataReader2();
  var _HeadersReader_1 = require_$HeadersReader2();
  var _ParameterReader_1 = require_$ParameterReader2();
  var _QueryReader_1 = require_$QueryReader2();
  var formData = function() {
    return _FormDataReader_1.$FormDataReader;
  };
  exports.formData = formData;
  var headers = function() {
    return _HeadersReader_1.$HeadersReader;
  };
  exports.headers = headers;
  var parameter = function() {
    return _ParameterReader_1.$ParameterReader;
  };
  exports.parameter = parameter;
  var query = function() {
    return _QueryReader_1.$QueryReader;
  };
  exports.query = query;
});

// node_modules/typia/lib/utils/StringUtil/StringUtil.js
var require_StringUtil = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.escapeDuplicate = exports.capitalize = undefined;
  var capitalize = function(str) {
    return str.length ? str[0].toUpperCase() + str.slice(1) : str;
  };
  exports.capitalize = capitalize;
  var escapeDuplicate = function(keep) {
    return function(change) {
      return keep.includes(change) ? (0, exports.escapeDuplicate)(keep)("_".concat(change)) : change;
    };
  };
  exports.escapeDuplicate = escapeDuplicate;
});

// node_modules/typia/lib/utils/StringUtil/index.js
var require_StringUtil2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.StringUtil = undefined;
  exports.StringUtil = __importStar(require_StringUtil());
});

// node_modules/typia/lib/utils/NamingConvention/NamingConvention.js
var require_NamingConvention = __commonJS((exports) => {
  var snake = function(str) {
    var indexes = [];
    for (var i = 0;i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (65 <= code && code <= 90)
        indexes.push(i);
    }
    for (var i = indexes.length - 1;i > 0; --i) {
      var now = indexes[i];
      var prev = indexes[i - 1];
      if (now - prev === 1)
        indexes.splice(i, 1);
    }
    if (indexes.length !== 0 && indexes[0] === 0)
      indexes.splice(0, 1);
    if (indexes.length === 0)
      return str.toLowerCase();
    var ret = "";
    for (var i = 0;i < indexes.length; i++) {
      var first = i === 0 ? 0 : indexes[i - 1];
      var last = indexes[i];
      ret += str.substring(first, last).toLowerCase();
      ret += "_";
    }
    ret += str.substring(indexes[indexes.length - 1]).toLowerCase();
    return ret;
  };
  var camel = function(str) {
    return unsnake(function(str2) {
      if (str2.length === 0)
        return str2;
      else if (str2[0] === str2[0].toUpperCase())
        return str2[0].toLowerCase() + str2.substring(1);
      else
        return str2;
    })(str);
  };
  var pascal = function(str) {
    return unsnake(function(str2) {
      if (str2.length === 0)
        return str2;
      else if (str2[0] === str2[0].toLowerCase())
        return str2[0].toUpperCase() + str2.substring(1);
      else
        return str2;
    })(str);
  };
  var __read = exports && exports.__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === undefined || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.pascal = exports.camel = exports.snake = undefined;
  var StringUtil_1 = require_StringUtil2();
  exports.snake = snake;
  exports.camel = camel;
  exports.pascal = pascal;
  var unsnake = function(escaper) {
    return function(str) {
      var prefix = "";
      for (var i = 0;i < str.length; i++) {
        if (str[i] === "_")
          prefix += "_";
        else
          break;
      }
      if (prefix.length !== 0)
        str = str.substring(prefix.length);
      var indexes = [];
      for (var i = 0;i < str.length; i++) {
        var ch = str[i];
        if (ch !== "_")
          continue;
        var last_1 = indexes[indexes.length - 1];
        if (last_1 === undefined || last_1[0] + last_1[1] !== i)
          indexes.push([i, 1]);
        else
          ++last_1[1];
      }
      if (indexes.length === 0)
        return prefix + escaper(str);
      var ret = "";
      for (var i = 0;i < indexes.length; i++) {
        var _a = __read(indexes[i], 1), first = _a[0];
        if (i === 0)
          if (first === 0)
            ret += "_";
          else
            ret += str.substring(0, first);
        else {
          var _b = __read(indexes[i - 1], 2), prevFirst = _b[0], prevLength = _b[1];
          var piece_1 = str.substring(prevFirst + prevLength, first);
          if (piece_1.length)
            ret += StringUtil_1.StringUtil.capitalize(piece_1);
        }
      }
      var last = indexes[indexes.length - 1];
      var piece = str.substring(last[0] + last[1]);
      if (last.length)
        ret += StringUtil_1.StringUtil.capitalize(piece);
      return prefix + escaper(ret);
    };
  };
});

// node_modules/typia/lib/utils/NamingConvention/index.js
var require_NamingConvention2 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.NamingConvention = undefined;
  exports.NamingConvention = __importStar(require_NamingConvention());
});

// node_modules/typia/lib/functional/$convention.js
var require_$convention = __commonJS((exports) => {
  var __read = exports && exports.__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === undefined || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$convention = undefined;
  var $convention = function(rename) {
    var main = function(input) {
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
    };
    var object = function(input) {
      return Object.fromEntries(Object.entries(input).map(function(_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        return [rename(key), main(value)];
      }));
    };
    return main;
  };
  exports.$convention = $convention;
});

// node_modules/typia/lib/functional/Namespace/notations.js
var require_notations = __commonJS((exports) => {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.snake = exports.pascal = exports.camel = undefined;
  var NamingConvention_1 = require_NamingConvention2();
  var _convention_1 = require_$convention();
  var _throws_1 = require_$throws();
  var is_1 = require_is();
  var camel = function(method) {
    return __assign(__assign({}, base(method)), { any: (0, _convention_1.$convention)(NamingConvention_1.NamingConvention.camel) });
  };
  exports.camel = camel;
  var pascal = function(method) {
    return __assign(__assign({}, base(method)), { any: (0, _convention_1.$convention)(NamingConvention_1.NamingConvention.pascal) });
  };
  exports.pascal = pascal;
  var snake = function(method) {
    return __assign(__assign({}, base(method)), { any: (0, _convention_1.$convention)(NamingConvention_1.NamingConvention.snake) });
  };
  exports.snake = snake;
  var base = function(method) {
    return __assign(__assign({}, (0, is_1.is)()), { throws: (0, _throws_1.$throws)("notations.".concat(method)) });
  };
});

// node_modules/typia/lib/functional/$clone.js
var require_$clone = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$clone = undefined;
  var $clone = function(value) {
    return JSON.parse(JSON.stringify(value));
  };
  exports.$clone = $clone;
});

// node_modules/typia/lib/functional/$any.js
var require_$any = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$any = undefined;
  var _clone_1 = require_$clone();
  var $any = function(val) {
    return val !== undefined ? (0, _clone_1.$clone)(val) : undefined;
  };
  exports.$any = $any;
});

// node_modules/typia/lib/functional/Namespace/misc.js
var require_misc = __commonJS((exports) => {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.prune = exports.clone = undefined;
  var _any_1 = require_$any();
  var _throws_1 = require_$throws();
  var is_1 = require_is();
  var clone = function(method) {
    return __assign(__assign({}, (0, is_1.is)()), { throws: (0, _throws_1.$throws)("misc.".concat(method)), any: _any_1.$any });
  };
  exports.clone = clone;
  var prune = function(method) {
    return __assign(__assign({}, (0, is_1.is)()), { throws: (0, _throws_1.$throws)("misc.".concat(method)) });
  };
  exports.prune = prune;
});

// node_modules/typia/lib/functional/$ProtobufReader.js
var require_$ProtobufReader = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$ProtobufReader = undefined;
  var $ProtobufReader = function() {
    function $ProtobufReader2(buf) {
      this.buf = buf;
      this.ptr = 0;
      this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    $ProtobufReader2.prototype.index = function() {
      return this.ptr;
    };
    $ProtobufReader2.prototype.size = function() {
      return this.buf.length;
    };
    $ProtobufReader2.prototype.uint32 = function() {
      return this.varint32();
    };
    $ProtobufReader2.prototype.int32 = function() {
      return this.varint32();
    };
    $ProtobufReader2.prototype.sint32 = function() {
      var value = this.varint32();
      return value >>> 1 ^ -(value & 1);
    };
    $ProtobufReader2.prototype.uint64 = function() {
      return this.varint64();
    };
    $ProtobufReader2.prototype.int64 = function() {
      return this.varint64();
    };
    $ProtobufReader2.prototype.sint64 = function() {
      var value = this.varint64();
      return value >> N01 ^ -(value & N01);
    };
    $ProtobufReader2.prototype.bool = function() {
      return this.varint32() !== 0;
    };
    $ProtobufReader2.prototype.float = function() {
      var value = this.view.getFloat32(this.ptr, true);
      this.ptr += 4;
      return value;
    };
    $ProtobufReader2.prototype.double = function() {
      var value = this.view.getFloat64(this.ptr, true);
      this.ptr += 8;
      return value;
    };
    $ProtobufReader2.prototype.bytes = function() {
      var length = this.uint32();
      var from = this.ptr;
      this.ptr += length;
      return this.buf.subarray(from, from + length);
    };
    $ProtobufReader2.prototype.string = function() {
      return utf8.decode(this.bytes());
    };
    $ProtobufReader2.prototype.skip = function(length) {
      if (length === 0)
        while (this.u8() & 128)
          ;
      else {
        if (this.index() + length > this.size())
          throw new Error("Error on typia.protobuf.decode(): buffer overflow.");
        this.ptr += length;
      }
    };
    $ProtobufReader2.prototype.skipType = function(wireType) {
      switch (wireType) {
        case 0:
          this.skip(0);
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4)
            this.skipType(wireType);
          break;
        case 5:
          this.skip(4);
          break;
        default:
          throw new Error("Invalid wire type ".concat(wireType, " at offset ").concat(this.ptr, "."));
      }
    };
    $ProtobufReader2.prototype.varint32 = function() {
      var loaded;
      var value;
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
    };
    $ProtobufReader2.prototype.varint64 = function() {
      var loaded;
      var value;
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
    };
    $ProtobufReader2.prototype.u8 = function() {
      return this.view.getUint8(this.ptr++);
    };
    $ProtobufReader2.prototype.u8n = function() {
      return BigInt(this.u8());
    };
    return $ProtobufReader2;
  }();
  exports.$ProtobufReader = $ProtobufReader;
  var utf8 = new TextDecoder;
  var N01 = BigInt(1);
  var N7F = BigInt(127);
  var N80 = BigInt(128);
});

// node_modules/typia/lib/functional/$strlen.js
var require_$strlen = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$strlen = undefined;
  var $strlen = function(s) {
    var b;
    var i;
    var c;
    for (b = i = 0;c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1)
      ;
    return b;
  };
  exports.$strlen = $strlen;
});

// node_modules/typia/lib/functional/$ProtobufSizer.js
var require_$ProtobufSizer = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$ProtobufSizer = undefined;
  var _strlen_1 = require_$strlen();
  var $ProtobufSizer = function() {
    function $ProtobufSizer2(length) {
      if (length === undefined) {
        length = 0;
      }
      this.len = length;
      this.pos = [];
      this.varlen = [];
      this.varlenidx = [];
    }
    $ProtobufSizer2.prototype.bool = function() {
      this.len += 1;
    };
    $ProtobufSizer2.prototype.int32 = function(value) {
      if (value < 0) {
        this.len += 10;
      } else {
        this.varint32(value);
      }
    };
    $ProtobufSizer2.prototype.sint32 = function(value) {
      this.varint32(value << 1 ^ value >> 31);
    };
    $ProtobufSizer2.prototype.uint32 = function(value) {
      this.varint32(value);
    };
    $ProtobufSizer2.prototype.int64 = function(value) {
      this.varint64(typeof value === "number" ? BigInt(value) : value);
    };
    $ProtobufSizer2.prototype.sint64 = function(value) {
      if (typeof value === "number")
        value = BigInt(value);
      this.varint64(value << BigInt(1) ^ value >> BigInt(63));
    };
    $ProtobufSizer2.prototype.uint64 = function(value) {
      this.varint64(typeof value === "number" ? BigInt(value) : value);
    };
    $ProtobufSizer2.prototype.float = function(_value) {
      this.len += 4;
    };
    $ProtobufSizer2.prototype.double = function(_value) {
      this.len += 8;
    };
    $ProtobufSizer2.prototype.bytes = function(value) {
      this.uint32(value.byteLength);
      this.len += value.byteLength;
    };
    $ProtobufSizer2.prototype.string = function(value) {
      var len = (0, _strlen_1.$strlen)(value);
      this.varlen.push(len);
      this.uint32(len);
      this.len += len;
    };
    $ProtobufSizer2.prototype.fork = function() {
      this.pos.push(this.len);
      this.varlenidx.push(this.varlen.length);
      this.varlen.push(0);
    };
    $ProtobufSizer2.prototype.ldelim = function() {
      if (!(this.pos.length && this.varlenidx.length))
        throw new Error("Error on typia.protobuf.encode(): missing fork() before ldelim() call.");
      var endPos = this.len;
      var startPos = this.pos.pop();
      var idx = this.varlenidx.pop();
      var len = endPos - startPos;
      this.varlen[idx] = len;
      this.uint32(len);
    };
    $ProtobufSizer2.prototype.reset = function() {
      this.len = 0;
      this.pos.length = 0;
      this.varlen.length = 0;
      this.varlenidx.length = 0;
    };
    $ProtobufSizer2.prototype.varint32 = function(value) {
      this.len += value < 0 ? 10 : value < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5;
    };
    $ProtobufSizer2.prototype.varint64 = function(val) {
      val = BigInt.asUintN(64, val);
      while (val > NX7F) {
        ++this.len;
        val = val >> ND07;
      }
      ++this.len;
    };
    return $ProtobufSizer2;
  }();
  exports.$ProtobufSizer = $ProtobufSizer;
  var ND07 = BigInt(7);
  var NX7F = BigInt(127);
});

// node_modules/typia/lib/functional/$ProtobufWriter.js
var require_$ProtobufWriter = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.$ProtobufWriter = undefined;
  var $ProtobufWriter = function() {
    function $ProtobufWriter2(sizer) {
      this.sizer = sizer;
      this.buf = new Uint8Array(sizer.len);
      this.view = new DataView(this.buf.buffer);
      this.ptr = 0;
      this.varlenidx = 0;
    }
    $ProtobufWriter2.prototype.buffer = function() {
      return this.buf;
    };
    $ProtobufWriter2.prototype.bool = function(value) {
      this.byte(value ? 1 : 0);
    };
    $ProtobufWriter2.prototype.byte = function(value) {
      this.buf[this.ptr++] = value & 255;
    };
    $ProtobufWriter2.prototype.int32 = function(value) {
      if (value < 0)
        this.int64(value);
      else
        this.variant32(value >>> 0);
    };
    $ProtobufWriter2.prototype.sint32 = function(value) {
      this.variant32(value << 1 ^ value >> 31);
    };
    $ProtobufWriter2.prototype.uint32 = function(value) {
      this.variant32(value);
    };
    $ProtobufWriter2.prototype.sint64 = function(value) {
      value = BigInt(value);
      this.variant64(value << ND01 ^ value >> ND63);
    };
    $ProtobufWriter2.prototype.int64 = function(value) {
      this.variant64(BigInt(value));
    };
    $ProtobufWriter2.prototype.uint64 = function(value) {
      this.variant64(BigInt(value));
    };
    $ProtobufWriter2.prototype.float = function(val) {
      this.view.setFloat32(this.ptr, val, true);
      this.ptr += 4;
    };
    $ProtobufWriter2.prototype.double = function(val) {
      this.view.setFloat64(this.ptr, val, true);
      this.ptr += 8;
    };
    $ProtobufWriter2.prototype.bytes = function(value) {
      this.uint32(value.byteLength);
      for (var i = 0;i < value.byteLength; i++)
        this.buf[this.ptr++] = value[i];
    };
    $ProtobufWriter2.prototype.string = function(value) {
      var len = this.varlen();
      this.uint32(len);
      var binary = utf8.encode(value);
      for (var i = 0;i < binary.byteLength; i++)
        this.buf[this.ptr++] = binary[i];
    };
    $ProtobufWriter2.prototype.fork = function() {
      this.uint32(this.varlen());
    };
    $ProtobufWriter2.prototype.ldelim = function() {
    };
    $ProtobufWriter2.prototype.finish = function() {
      return this.buf;
    };
    $ProtobufWriter2.prototype.reset = function() {
      this.buf = new Uint8Array(this.sizer.len);
      this.view = new DataView(this.buf.buffer);
      this.ptr = 0;
      this.varlenidx = 0;
    };
    $ProtobufWriter2.prototype.variant32 = function(val) {
      while (val > 127) {
        this.buf[this.ptr++] = val & 127 | 128;
        val = val >>> 7;
      }
      this.buf[this.ptr++] = val;
    };
    $ProtobufWriter2.prototype.variant64 = function(val) {
      val = BigInt.asUintN(64, val);
      while (val > NX7F) {
        this.buf[this.ptr++] = Number(val & NX7F | NX80);
        val = val >> ND07;
      }
      this.buf[this.ptr++] = Number(val);
    };
    $ProtobufWriter2.prototype.varlen = function() {
      return this.varlenidx >= this.sizer.varlen.length ? 0 : this.sizer.varlen[this.varlenidx++];
    };
    return $ProtobufWriter2;
  }();
  exports.$ProtobufWriter = $ProtobufWriter;
  var utf8 = new TextEncoder;
  var ND01 = BigInt(1);
  var ND07 = BigInt(7);
  var ND63 = BigInt(63);
  var NX7F = BigInt(127);
  var NX80 = BigInt(128);
});

// node_modules/typia/lib/functional/Namespace/protobuf.js
var require_protobuf = __commonJS((exports) => {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.encode = exports.decode = undefined;
  var _ProtobufReader_1 = require_$ProtobufReader();
  var _ProtobufSizer_1 = require_$ProtobufSizer();
  var _ProtobufWriter_1 = require_$ProtobufWriter();
  var _strlen_1 = require_$strlen();
  var _throws_1 = require_$throws();
  var is_1 = require_is();
  var decode = function(method) {
    return __assign(__assign({}, (0, is_1.is)()), { Reader: _ProtobufReader_1.$ProtobufReader, throws: (0, _throws_1.$throws)("protobuf.".concat(method)) });
  };
  exports.decode = decode;
  var encode = function(method) {
    return __assign(__assign({}, (0, is_1.is)()), { Sizer: _ProtobufSizer_1.$ProtobufSizer, Writer: _ProtobufWriter_1.$ProtobufWriter, strlen: _strlen_1.$strlen, throws: (0, _throws_1.$throws)(method) });
  };
  exports.encode = encode;
});

// node_modules/typia/lib/functional/Namespace/index.js
var require_Namespace = __commonJS((exports) => {
  var __assign = exports && exports.__assign || function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.random = exports.validate = exports.assert = exports.is = exports.protobuf = exports.misc = exports.notations = exports.http = exports.json = exports.functional = undefined;
  var RandomGenerator_1 = require_RandomGenerator2();
  var _every_1 = require_$every();
  var _guard_1 = require_$guard();
  var _join_1 = require_$join();
  var _report_1 = require_$report();
  var TypeGuardError_1 = require_TypeGuardError();
  var is_1 = require_is();
  Object.defineProperty(exports, "is", { enumerable: true, get: function() {
    return is_1.is;
  } });
  exports.functional = __importStar(require_functional());
  exports.json = __importStar(require_json());
  exports.http = __importStar(require_http());
  exports.notations = __importStar(require_notations());
  exports.misc = __importStar(require_misc());
  exports.protobuf = __importStar(require_protobuf());
  var assert = function(method) {
    return __assign(__assign({}, (0, is_1.is)()), { join: _join_1.$join, every: _every_1.$every, guard: (0, _guard_1.$guard)("typia.".concat(method)), predicate: function(matched, exceptionable, closure) {
      if (matched === false && exceptionable === true)
        throw new TypeGuardError_1.TypeGuardError(__assign(__assign({}, closure()), { method: "typia.".concat(method) }));
      return matched;
    } });
  };
  exports.assert = assert;
  var validate = function() {
    return __assign(__assign({}, (0, is_1.is)()), { join: _join_1.$join, report: _report_1.$report, predicate: function(res) {
      return function(matched, exceptionable, closure) {
        if (matched === false && exceptionable === true)
          (function() {
            res.success && (res.success = false);
            var errorList = res.errors;
            var error = closure();
            if (errorList.length) {
              var last = errorList[errorList.length - 1].path;
              if (last.length >= error.path.length && last.substring(0, error.path.length) === error.path)
                return;
            }
            errorList.push(error);
            return;
          })();
        return matched;
      };
    } });
  };
  exports.validate = validate;
  var random = function() {
    return {
      generator: RandomGenerator_1.RandomGenerator,
      pick: RandomGenerator_1.RandomGenerator.pick
    };
  };
  exports.random = random;
});

// node_modules/typia/lib/functional.js
var require_functional2 = __commonJS((exports) => {
  var assertFunction = function() {
    halt("assertFunction");
  };
  var assertReturn = function() {
    halt("assertReturn");
  };
  var assertEqualsFunction = function() {
    halt("assertEqualsFunction");
  };
  var assertEqualsParameters = function() {
    halt("assertEqualsParameters");
  };
  var assertEqualsReturn = function() {
    halt("assertEqualsReturn");
  };
  var isFunction = function() {
    halt("isFunction");
  };
  var isParameters = function() {
    halt("isParameters");
  };
  var isReturn = function() {
    halt("isReturn");
  };
  var equalsFunction = function() {
    halt("equalsFunction");
  };
  var equalsParameters = function() {
    halt("equalsParameters");
  };
  var equalsReturn = function() {
    halt("equalsReturn");
  };
  var validateFunction = function() {
    halt("validateFunction");
  };
  var validateParameters = function() {
    halt("validateReturn");
  };
  var validateReturn = function() {
    halt("validateReturn");
  };
  var validateEqualsFunction = function() {
    halt("validateEqualsFunction");
  };
  var validateEqualsParameters = function() {
    halt("validateEqualsParameters");
  };
  var validateEqualsReturn = function() {
    halt("validateEqualsReturn");
  };
  var halt = function(name) {
    throw new Error("Error on typia.functional.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateEqualsReturn = exports.validateEqualsParameters = exports.validateEqualsFunction = exports.validateReturn = exports.validateParameters = exports.validateFunction = exports.equalsReturn = exports.equalsParameters = exports.equalsFunction = exports.isReturn = exports.isParameters = exports.isFunction = exports.assertEqualsReturn = exports.assertEqualsParameters = exports.assertEqualsFunction = exports.assertReturn = exports.assertParameters = exports.assertFunction = undefined;
  var Namespace = __importStar(require_Namespace());
  var assertFunctionPure = Object.assign(assertFunction, Namespace.assert("functional.assertFunction"), Namespace.functional.functionalAssert());
  exports.assertFunction = assertFunctionPure;
  var assertParametersPure = Object.assign(assertFunction, Namespace.assert("functional.assertFunction"), Namespace.functional.functionalAssert());
  exports.assertParameters = assertParametersPure;
  var assertReturnPure = Object.assign(assertReturn, Namespace.assert("functional.assertReturn"), Namespace.functional.functionalAssert());
  exports.assertReturn = assertReturnPure;
  var assertEqualsFunctionPure = Object.assign(assertEqualsFunction, Namespace.assert("functional.assertEqualsFunction"), Namespace.functional.functionalAssert());
  exports.assertEqualsFunction = assertEqualsFunctionPure;
  var assertEqualsParametersPure = Object.assign(assertEqualsParameters, Namespace.assert("functional.assertEqualsParameters"), Namespace.functional.functionalAssert());
  exports.assertEqualsParameters = assertEqualsParametersPure;
  var assertEqualsReturnPure = Object.assign(assertEqualsReturn, Namespace.assert("functional.assertEqualsReturn"), Namespace.functional.functionalAssert());
  exports.assertEqualsReturn = assertEqualsReturnPure;
  var isFunctionPure = Object.assign(isFunction, Namespace.is());
  exports.isFunction = isFunctionPure;
  var isParametersPure = Object.assign(isParameters, Namespace.is());
  exports.isParameters = isParametersPure;
  var isReturnPure = Object.assign(isReturn, Namespace.is());
  exports.isReturn = isReturnPure;
  var equalsFunctionPure = Object.assign(equalsFunction, Namespace.is());
  exports.equalsFunction = equalsFunctionPure;
  var equalsParametersPure = Object.assign(equalsParameters, Namespace.is());
  exports.equalsParameters = equalsParametersPure;
  var equalsReturnPure = Object.assign(equalsReturn, Namespace.is());
  exports.equalsReturn = equalsReturnPure;
  var validateFunctionPure = Object.assign(validateFunction, Namespace.validate());
  exports.validateFunction = validateFunctionPure;
  var validateParametersPure = Object.assign(validateParameters, Namespace.validate());
  exports.validateParameters = validateParametersPure;
  var validateReturnPure = Object.assign(validateReturn, Namespace.validate());
  exports.validateReturn = validateReturnPure;
  var validateEqualsFunctionPure = Object.assign(validateEqualsFunction, Namespace.validate());
  exports.validateEqualsFunction = validateEqualsFunctionPure;
  var validateEqualsParametersPure = Object.assign(validateEqualsParameters, Namespace.validate());
  exports.validateEqualsParameters = validateEqualsParametersPure;
  var validateEqualsReturnPure = Object.assign(validateEqualsReturn, Namespace.validate());
  exports.validateEqualsReturn = validateEqualsReturnPure;
});

// node_modules/typia/lib/http.js
var require_http2 = __commonJS((exports) => {
  var formData = function() {
    halt("formData");
  };
  var assertFormData = function() {
    halt("assertFormData");
  };
  var isFormData = function() {
    halt("isFormData");
  };
  var validateFormData = function() {
    halt("validateFormData");
  };
  var query = function() {
    halt("query");
  };
  var assertQuery = function() {
    halt("assertQuery");
  };
  var isQuery = function() {
    halt("isQuery");
  };
  var validateQuery = function() {
    halt("validateQuery");
  };
  var headers = function() {
    halt("headers");
  };
  var assertHeaders = function() {
    halt("assertHeaders");
  };
  var isHeaders = function() {
    halt("isHeaders");
  };
  var validateHeaders = function() {
    halt("validateHeaders");
  };
  var parameter = function() {
    halt("parameter");
  };
  var createFormData = function() {
    halt("createFormData");
  };
  var createAssertFormData = function() {
    halt("createAssertFormData");
  };
  var createIsFormData = function() {
    halt("createIsFormData");
  };
  var createValidateFormData = function() {
    halt("createValidateFormData");
  };
  var createQuery = function() {
    halt("createQuery");
  };
  var createAssertQuery = function() {
    halt("createAssertQuery");
  };
  var createIsQuery = function() {
    halt("createIsQuery");
  };
  var createValidateQuery = function() {
    halt("createValidateQuery");
  };
  var createHeaders = function() {
    halt("createHeaders");
  };
  var createAssertHeaders = function() {
    halt("createAssertHeaders");
  };
  var createIsHeaders = function() {
    halt("createIsHeaders");
  };
  var createValidateHeaders = function() {
    halt("createValidateHeaders");
  };
  var createParameter = function() {
    halt("createParameter");
  };
  var halt = function(name) {
    throw new Error("Error on typia.http.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createParameter = exports.createValidateHeaders = exports.createIsHeaders = exports.createAssertHeaders = exports.createHeaders = exports.createValidateQuery = exports.createIsQuery = exports.createAssertQuery = exports.createQuery = exports.createValidateFormData = exports.createIsFormData = exports.createAssertFormData = exports.createFormData = exports.parameter = exports.validateHeaders = exports.isHeaders = exports.assertHeaders = exports.headers = exports.validateQuery = exports.isQuery = exports.assertQuery = exports.query = exports.validateFormData = exports.isFormData = exports.assertFormData = exports.formData = undefined;
  var Namespace = __importStar(require_Namespace());
  var formDataPure = Object.assign(formData, Namespace.http.formData());
  exports.formData = formDataPure;
  var assertFormDataPure = Object.assign(assertFormData, Namespace.http.formData(), Namespace.assert("http.assertFormData"));
  exports.assertFormData = assertFormDataPure;
  var isFormDataPure = Object.assign(isFormData, Namespace.http.formData(), Namespace.is());
  exports.isFormData = isFormDataPure;
  var validateFormDataPure = Object.assign(validateFormData, Namespace.http.formData(), Namespace.validate());
  exports.validateFormData = validateFormDataPure;
  var queryPure = Object.assign(query, Namespace.http.query());
  exports.query = queryPure;
  var assertQueryPure = Object.assign(assertQuery, Namespace.http.query(), Namespace.assert("http.assertQuery"));
  exports.assertQuery = assertQueryPure;
  var isQueryPure = Object.assign(isQuery, Namespace.http.query(), Namespace.is());
  exports.isQuery = isQueryPure;
  var validateQueryPure = Object.assign(validateQuery, Namespace.http.query(), Namespace.validate());
  exports.validateQuery = validateQueryPure;
  var headersPure = Object.assign(headers, Namespace.http.headers());
  exports.headers = headersPure;
  var assertHeadersPure = Object.assign(assertHeaders, Namespace.http.headers(), Namespace.assert("http.assertHeaders"));
  exports.assertHeaders = assertHeadersPure;
  var isHeadersPure = Object.assign(isHeaders, Namespace.http.headers(), Namespace.is());
  exports.isHeaders = isHeadersPure;
  var validateHeadersPure = Object.assign(validateHeaders, Namespace.http.headers(), Namespace.validate());
  exports.validateHeaders = validateHeadersPure;
  var parameterPure = Object.assign(parameter, Namespace.http.parameter(), Namespace.assert("http.parameter"));
  exports.parameter = parameterPure;
  var createFormDataPure = Object.assign(createFormData, Namespace.http.formData());
  exports.createFormData = createFormDataPure;
  var createAssertFormDataPure = Object.assign(createAssertFormData, Namespace.http.formData(), Namespace.assert("http.createAssertFormData"));
  exports.createAssertFormData = createAssertFormDataPure;
  var createIsFormDataPure = Object.assign(createIsFormData, Namespace.http.formData(), Namespace.is());
  exports.createIsFormData = createIsFormDataPure;
  var createValidateFormDataPure = Object.assign(createValidateFormData, Namespace.http.formData(), Namespace.validate());
  exports.createValidateFormData = createValidateFormDataPure;
  var createQueryPure = Object.assign(createQuery, Namespace.http.query());
  exports.createQuery = createQueryPure;
  var createAssertQueryPure = Object.assign(createAssertQuery, Namespace.http.query(), Namespace.assert("http.createAssertQuery"));
  exports.createAssertQuery = createAssertQueryPure;
  var createIsQueryPure = Object.assign(createIsQuery, Namespace.http.query(), Namespace.is());
  exports.createIsQuery = createIsQueryPure;
  var createValidateQueryPure = Object.assign(createValidateQuery, Namespace.http.query(), Namespace.validate());
  exports.createValidateQuery = createValidateQueryPure;
  var createHeadersPure = Object.assign(createHeaders, Namespace.http.headers());
  exports.createHeaders = createHeadersPure;
  var createAssertHeadersPure = Object.assign(createAssertHeaders, Namespace.http.headers(), Namespace.assert("http.createAssertHeaders"));
  exports.createAssertHeaders = createAssertHeadersPure;
  var createIsHeadersPure = Object.assign(createIsHeaders, Namespace.http.headers(), Namespace.is());
  exports.createIsHeaders = createIsHeadersPure;
  var createValidateHeadersPure = Object.assign(createValidateHeaders, Namespace.http.headers(), Namespace.validate());
  exports.createValidateHeaders = createValidateHeadersPure;
  var createParameterPure = Object.assign(createParameter, Namespace.http.parameter(), Namespace.assert("http.createParameter"));
  exports.createParameter = createParameterPure;
});

// node_modules/typia/lib/json.js
var require_json2 = __commonJS((exports) => {
  var application = function() {
    halt("application");
  };
  var assertParse = function() {
    halt("assertParse");
  };
  var isParse = function() {
    halt("isParse");
  };
  var validateParse = function() {
    halt("validateParse");
  };
  var stringify = function() {
    halt("stringify");
  };
  var assertStringify = function() {
    halt("assertStringify");
  };
  var isStringify = function() {
    halt("isStringify");
  };
  var validateStringify = function() {
    halt("validateStringify");
  };
  var createIsParse = function() {
    halt("createIsParse");
  };
  var createAssertParse = function() {
    halt("createAssertParse");
  };
  var createValidateParse = function() {
    halt("createValidateParse");
  };
  var createStringify = function() {
    halt("createStringify");
  };
  var createAssertStringify = function() {
    halt("createAssertStringify");
  };
  var createIsStringify = function() {
    halt("createIsStringify");
  };
  var createValidateStringify = function() {
    halt("createValidateStringify");
  };
  var halt = function(name) {
    throw new Error("Error on typia.json.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createValidateStringify = exports.createIsStringify = exports.createAssertStringify = exports.createStringify = exports.createValidateParse = exports.createAssertParse = exports.createIsParse = exports.validateStringify = exports.isStringify = exports.assertStringify = exports.stringify = exports.validateParse = exports.isParse = exports.assertParse = exports.application = undefined;
  var Namespace = __importStar(require_Namespace());
  exports.application = application;
  var assertParsePure = Object.assign(assertParse, Namespace.assert("json.assertParse"));
  exports.assertParse = assertParsePure;
  var isParsePure = Object.assign(isParse, Namespace.is());
  exports.isParse = isParsePure;
  var validateParsePure = Object.assign(validateParse, Namespace.validate());
  exports.validateParse = validateParsePure;
  var stringifyPure = Object.assign(stringify, Namespace.json.stringify("stringify"));
  exports.stringify = stringifyPure;
  var assertStringifyPure = Object.assign(assertStringify, Namespace.assert("json.assertStringify"), Namespace.json.stringify("assertStringify"));
  exports.assertStringify = assertStringifyPure;
  var isStringifyPure = Object.assign(isStringify, Namespace.is(), Namespace.json.stringify("isStringify"));
  exports.isStringify = isStringifyPure;
  var validateStringifyPure = Object.assign(validateStringify, Namespace.validate(), Namespace.json.stringify("validateStringify"));
  exports.validateStringify = validateStringifyPure;
  var createIsParsePure = Object.assign(createIsParse, isParsePure);
  exports.createIsParse = createIsParsePure;
  var createAssertParsePure = Object.assign(createAssertParse, assertParsePure);
  exports.createAssertParse = createAssertParsePure;
  var createValidateParsePure = Object.assign(createValidateParse, validateParsePure);
  exports.createValidateParse = createValidateParsePure;
  var createStringifyPure = Object.assign(createStringify, stringifyPure);
  exports.createStringify = createStringifyPure;
  var createAssertStringifyPure = Object.assign(createAssertStringify, assertStringifyPure);
  exports.createAssertStringify = createAssertStringifyPure;
  var createIsStringifyPure = Object.assign(createIsStringify, isStringifyPure);
  exports.createIsStringify = createIsStringifyPure;
  var createValidateStringifyPure = Object.assign(createValidateStringify, validateStringifyPure);
  exports.createValidateStringify = createValidateStringifyPure;
});

// node_modules/typia/lib/misc.js
var require_misc2 = __commonJS((exports) => {
  var literals = function() {
    halt("literals");
  };
  var clone = function() {
    halt("clone");
  };
  var assertClone = function() {
    halt("assertClone");
  };
  var isClone = function() {
    halt("isClone");
  };
  var validateClone = function() {
    halt("validateClone");
  };
  var prune = function() {
    halt("prune");
  };
  var assertPrune = function() {
    halt("assertPrune");
  };
  var isPrune = function() {
    halt("isPrune");
  };
  var validatePrune = function() {
    halt("validatePrune");
  };
  var createClone = function() {
    halt("createClone");
  };
  var createAssertClone = function() {
    halt("createAssertClone");
  };
  var createIsClone = function() {
    halt("createIsClone");
  };
  var createValidateClone = function() {
    halt("createValidateClone");
  };
  var createPrune = function() {
    halt("createPrune");
  };
  var createAssertPrune = function() {
    halt("createAssertPrune");
  };
  var createIsPrune = function() {
    halt("createIsPrune");
  };
  var createValidatePrune = function() {
    halt("createValidatePrune");
  };
  var halt = function(name) {
    throw new Error("Error on typia.misc.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createValidatePrune = exports.createIsPrune = exports.createAssertPrune = exports.createPrune = exports.createValidateClone = exports.createIsClone = exports.createAssertClone = exports.createClone = exports.validatePrune = exports.isPrune = exports.assertPrune = exports.prune = exports.validateClone = exports.isClone = exports.assertClone = exports.clone = exports.literals = undefined;
  var Namespace = __importStar(require_Namespace());
  exports.literals = literals;
  var clonePure = Object.assign(clone, Namespace.misc.clone("clone"));
  exports.clone = clonePure;
  var assertClonePure = Object.assign(assertClone, Namespace.assert("misc.assertClone"), Namespace.misc.clone("assertClone"));
  exports.assertClone = assertClonePure;
  var isClonePure = Object.assign(isClone, Namespace.is(), Namespace.misc.clone("isClone"));
  exports.isClone = isClonePure;
  var validateClonePure = Object.assign(validateClone, Namespace.validate(), Namespace.misc.clone("validateClone"));
  exports.validateClone = validateClonePure;
  var prunePure = Object.assign(prune, Namespace.misc.prune("prune"));
  exports.prune = prunePure;
  var assertPrunePure = Object.assign(assertPrune, Namespace.assert("misc.assertPrune"), Namespace.misc.prune("assertPrune"));
  exports.assertPrune = assertPrunePure;
  var isPrunePure = Object.assign(isPrune, Namespace.is(), Namespace.misc.prune("isPrune"));
  exports.isPrune = isPrunePure;
  var validatePrunePure = Object.assign(validatePrune, Namespace.misc.prune("validatePrune"), Namespace.validate());
  exports.validatePrune = validatePrunePure;
  var createClonePure = Object.assign(createClone, clonePure);
  exports.createClone = createClonePure;
  var createAssertClonePure = Object.assign(createAssertClone, assertClonePure);
  exports.createAssertClone = createAssertClonePure;
  var createIsClonePure = Object.assign(createIsClone, isClonePure);
  exports.createIsClone = createIsClonePure;
  var createValidateClonePure = Object.assign(createValidateClone, validateClonePure);
  exports.createValidateClone = createValidateClonePure;
  var createPrunePure = Object.assign(createPrune, prunePure);
  exports.createPrune = createPrunePure;
  var createAssertPrunePure = Object.assign(createAssertPrune, assertPrunePure);
  exports.createAssertPrune = createAssertPrunePure;
  var createIsPrunePure = Object.assign(createIsPrune, isPrunePure);
  exports.createIsPrune = createIsPrunePure;
  var createValidatePrunePure = Object.assign(createValidatePrune, validatePrunePure);
  exports.createValidatePrune = createValidatePrunePure;
});

// node_modules/typia/lib/notations.js
var require_notations2 = __commonJS((exports) => {
  var camel = function() {
    return halt("camel");
  };
  var assertCamel = function() {
    return halt("assertCamel");
  };
  var isCamel = function() {
    return halt("isCamel");
  };
  var validateCamel = function() {
    return halt("validateCamel");
  };
  var pascal = function() {
    return halt("pascal");
  };
  var assertPascal = function() {
    return halt("assertPascal");
  };
  var isPascal = function() {
    return halt("isPascal");
  };
  var validatePascal = function() {
    return halt("validatePascal");
  };
  var snake = function() {
    return halt("snake");
  };
  var assertSnake = function() {
    return halt("assertSnake");
  };
  var isSnake = function() {
    return halt("isSnake");
  };
  var validateSnake = function() {
    return halt("validateSnake");
  };
  var createCamel = function() {
    halt("createCamel");
  };
  var createAssertCamel = function() {
    halt("createAssertCamel");
  };
  var createIsCamel = function() {
    halt("createIsCamel");
  };
  var createValidateCamel = function() {
    halt("createValidateCamel");
  };
  var createPascal = function() {
    halt("createPascal");
  };
  var createAssertPascal = function() {
    halt("createAssertPascal");
  };
  var createIsPascal = function() {
    halt("createIsPascal");
  };
  var createValidatePascal = function() {
    halt("createValidatePascal");
  };
  var createSnake = function() {
    halt("createSnake");
  };
  var createAssertSnake = function() {
    halt("createAssertSnake");
  };
  var createIsSnake = function() {
    halt("createIsSnake");
  };
  var createValidateSnake = function() {
    halt("createValidateSnake");
  };
  var halt = function(name) {
    throw new Error("Error on typia.notations.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createValidateSnake = exports.createIsSnake = exports.createAssertSnake = exports.createSnake = exports.createValidatePascal = exports.createIsPascal = exports.createAssertPascal = exports.createPascal = exports.createValidateCamel = exports.createIsCamel = exports.createAssertCamel = exports.createCamel = exports.validateSnake = exports.isSnake = exports.assertSnake = exports.snake = exports.validatePascal = exports.isPascal = exports.assertPascal = exports.pascal = exports.validateCamel = exports.isCamel = exports.assertCamel = exports.camel = undefined;
  var Namespace = __importStar(require_Namespace());
  var camelPure = Object.assign(camel, Namespace.notations.camel("camel"));
  exports.camel = camelPure;
  var assertCamelPure = Object.assign(assertCamel, Namespace.notations.camel("assertCamel"), Namespace.assert("notations.assertCamel"));
  exports.assertCamel = assertCamelPure;
  var isCamelPure = Object.assign(isCamel, Namespace.notations.camel("isCamel"), Namespace.is());
  exports.isCamel = isCamelPure;
  var validateCamelPure = Object.assign(validateCamel, Namespace.notations.camel("validateCamel"), Namespace.validate());
  exports.validateCamel = validateCamelPure;
  var pascalPure = Object.assign(pascal, Namespace.notations.pascal("pascal"));
  exports.pascal = pascalPure;
  var assertPascalPure = Object.assign(assertPascal, Namespace.notations.pascal("assertPascal"), Namespace.assert("notations.assertPascal"));
  exports.assertPascal = assertPascalPure;
  var isPascalPure = Object.assign(isPascal, Namespace.notations.pascal("isPascal"), Namespace.is());
  exports.isPascal = isPascalPure;
  var validatePascalPure = Object.assign(validatePascal, Namespace.notations.pascal("validatePascal"), Namespace.validate());
  exports.validatePascal = validatePascalPure;
  var snakePure = Object.assign(snake, Namespace.notations.snake("snake"));
  exports.snake = snakePure;
  var assertSnakePure = Object.assign(assertSnake, Namespace.notations.snake("assertSnake"), Namespace.assert("notations.assertSnake"));
  exports.assertSnake = assertSnakePure;
  var isSnakePure = Object.assign(isSnake, Namespace.notations.snake("isSnake"), Namespace.is());
  exports.isSnake = isSnakePure;
  var validateSnakePure = Object.assign(validateSnake, Namespace.notations.snake("validateSnake"), Namespace.validate());
  exports.validateSnake = validateSnakePure;
  var createCamelPure = Object.assign(createCamel, Namespace.notations.camel("createCamel"));
  exports.createCamel = createCamelPure;
  var createAssertCamelPure = Object.assign(createAssertCamel, Namespace.notations.camel("createAssertCamel"), Namespace.assert("notations.createAssertCamel"));
  exports.createAssertCamel = createAssertCamelPure;
  var createIsCamelPure = Object.assign(createIsCamel, Namespace.notations.camel("createIsCamel"), Namespace.is());
  exports.createIsCamel = createIsCamelPure;
  var createValidateCamelPure = Object.assign(createValidateCamel, Namespace.notations.camel("createValidateCamel"), Namespace.validate());
  exports.createValidateCamel = createValidateCamelPure;
  var createPascalPure = Object.assign(createPascal, Namespace.notations.pascal("createPascal"));
  exports.createPascal = createPascalPure;
  var createAssertPascalPure = Object.assign(createAssertPascal, Namespace.notations.pascal("createAssertPascal"), Namespace.assert("notations.createAssertPascal"));
  exports.createAssertPascal = createAssertPascalPure;
  var createIsPascalPure = Object.assign(createIsPascal, Namespace.notations.pascal("createIsPascal"), Namespace.is());
  exports.createIsPascal = createIsPascalPure;
  var createValidatePascalPure = Object.assign(createValidatePascal, Namespace.notations.pascal("createValidatePascal"), Namespace.validate());
  exports.createValidatePascal = createValidatePascalPure;
  var createSnakePure = Object.assign(createSnake, Namespace.notations.snake("createSnake"));
  exports.createSnake = createSnakePure;
  var createAssertSnakePure = Object.assign(createAssertSnake, Namespace.notations.snake("createAssertSnake"), Namespace.assert("notations.createAssertSnake"));
  exports.createAssertSnake = createAssertSnakePure;
  var createIsSnakePure = Object.assign(createIsSnake, Namespace.notations.snake("createIsSnake"), Namespace.is());
  exports.createIsSnake = createIsSnakePure;
  var createValidateSnakePure = Object.assign(createValidateSnake, Namespace.notations.snake("createValidateSnake"), Namespace.validate());
  exports.createValidateSnake = createValidateSnakePure;
});

// node_modules/typia/lib/protobuf.js
var require_protobuf2 = __commonJS((exports) => {
  var message = function() {
    halt("message");
  };
  var decode = function() {
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
  var encode = function() {
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
    throw new Error("Error on typia.protobuf.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createValidateEncode = exports.createAssertEncode = exports.createIsEncode = exports.createEncode = exports.createValidateDecode = exports.createAssertDecode = exports.createIsDecode = exports.createDecode = exports.validateEncode = exports.isEncode = exports.assertEncode = exports.encode = exports.validateDecode = exports.isDecode = exports.assertDecode = exports.decode = exports.message = undefined;
  var Namespace = __importStar(require_Namespace());
  exports.message = message;
  var decodePure = Object.assign(decode, Namespace.protobuf.decode("decode"));
  exports.decode = decodePure;
  var assertDecodePure = Object.assign(assertDecode, Namespace.assert("protobuf.assertDecode"), Namespace.protobuf.decode("assertDecode"));
  exports.assertDecode = assertDecodePure;
  var isDecodePure = Object.assign(isDecode, Namespace.is(), Namespace.protobuf.decode("isDecode"));
  exports.isDecode = isDecodePure;
  var validateDecodePure = Object.assign(validateDecode, Namespace.validate(), Namespace.protobuf.decode("validateDecode"));
  exports.validateDecode = validateDecodePure;
  var encodePure = Object.assign(encode, Namespace.protobuf.encode("encode"));
  exports.encode = encodePure;
  var assertEncodePure = Object.assign(assertEncode, Namespace.assert("protobuf.assertEncode"), Namespace.protobuf.encode("assertEncode"));
  exports.assertEncode = assertEncodePure;
  var isEncodePure = Object.assign(isEncode, Namespace.is(), Namespace.protobuf.encode("isEncode"));
  exports.isEncode = isEncodePure;
  var validateEncodePure = Object.assign(validateEncode, Namespace.validate(), Namespace.protobuf.encode("validateEncode"));
  exports.validateEncode = validateEncodePure;
  var createDecodePure = Object.assign(createDecode, Namespace.protobuf.decode("createDecode"));
  exports.createDecode = createDecodePure;
  var createIsDecodePure = Object.assign(createIsDecode, Namespace.is(), Namespace.protobuf.decode("createIsDecode"));
  exports.createIsDecode = createIsDecodePure;
  var createAssertDecodePure = Object.assign(createAssertDecode, Namespace.assert("protobuf.createAssertDecode"), Namespace.protobuf.decode("createAssertDecode"));
  exports.createAssertDecode = createAssertDecodePure;
  var createValidateDecodePure = Object.assign(createValidateDecode, Namespace.validate(), Namespace.protobuf.decode("createValidateDecode"));
  exports.createValidateDecode = createValidateDecodePure;
  var createEncodePure = Object.assign(createEncode, Namespace.protobuf.encode("createEncode"));
  exports.createEncode = createEncodePure;
  var createIsEncodePure = Object.assign(createIsEncode, Namespace.is(), Namespace.protobuf.encode("createIsEncode"));
  exports.createIsEncode = createIsEncodePure;
  var createAssertEncodePure = Object.assign(createAssertEncode, Namespace.assert("protobuf.createAssertEncode"), Namespace.protobuf.encode("createAssertEncode"));
  exports.createAssertEncode = createAssertEncodePure;
  var createValidateEncodePure = Object.assign(createValidateEncode, Namespace.validate(), Namespace.protobuf.encode("createValidateEncode"));
  exports.createValidateEncode = createValidateEncodePure;
});

// node_modules/typia/lib/reflect.js
var require_reflect = __commonJS((exports) => {
  var metadata = function() {
    halt("metadata");
  };
  var halt = function(name) {
    throw new Error("Error on typia.reflect.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.metadata = undefined;
  var metadataPure = Object.assign(metadata, { from: function(input) {
    return input;
  } });
  exports.metadata = metadataPure;
});

// node_modules/typia/lib/tags/Constant.js
var require_Constant = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/Default.js
var require_Default = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/ExclusiveMaximum.js
var require_ExclusiveMaximum = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/ExclusiveMinimum.js
var require_ExclusiveMinimum = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/Format.js
var require_Format = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/Maximum.js
var require_Maximum = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/MaxItems.js
var require_MaxItems = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/MaxLength.js
var require_MaxLength = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/Minimum.js
var require_Minimum = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/MinItems.js
var require_MinItems = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/MinLength.js
var require_MinLength = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/MultipleOf.js
var require_MultipleOf = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/JsonSchemaPlugin.js
var require_JsonSchemaPlugin = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/Pattern.js
var require_Pattern = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/TagBase.js
var require_TagBase = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/Type.js
var require_Type = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/ContentMediaType.js
var require_ContentMediaType = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/tags/index.js
var require_tags = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(require_Constant(), exports);
  __exportStar(require_Default(), exports);
  __exportStar(require_ExclusiveMaximum(), exports);
  __exportStar(require_ExclusiveMinimum(), exports);
  __exportStar(require_Format(), exports);
  __exportStar(require_Maximum(), exports);
  __exportStar(require_MaxItems(), exports);
  __exportStar(require_MaxLength(), exports);
  __exportStar(require_Minimum(), exports);
  __exportStar(require_MinItems(), exports);
  __exportStar(require_MinLength(), exports);
  __exportStar(require_MultipleOf(), exports);
  __exportStar(require_JsonSchemaPlugin(), exports);
  __exportStar(require_Pattern(), exports);
  __exportStar(require_TagBase(), exports);
  __exportStar(require_Type(), exports);
  __exportStar(require_ContentMediaType(), exports);
});

// node_modules/typia/lib/schemas/metadata/IJsDocTagInfo.js
var require_IJsDocTagInfo = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/schemas/json/IJsonApplication.js
var require_IJsonApplication = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/AssertionGuard.js
var require_AssertionGuard = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/IRandomGenerator.js
var require_IRandomGenerator = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/IValidation.js
var require_IValidation = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/Primitive.js
var require_Primitive = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/Resolved.js
var require_Resolved = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/CamelCase.js
var require_CamelCase = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/PascalCase.js
var require_PascalCase = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/SnakeCase.js
var require_SnakeCase = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/typia/lib/module.js
var require_module = __commonJS((exports) => {
  var assert = function() {
    halt("assert");
  };
  var assertGuard = function() {
    halt("assertGuard");
  };
  var is = function() {
    halt("is");
  };
  var validate = function() {
    halt("validate");
  };
  var assertEquals = function() {
    halt("assertEquals");
  };
  var assertGuardEquals = function() {
    halt("assertGuardEquals");
  };
  var equals = function() {
    halt("equals");
  };
  var validateEquals = function() {
    halt("validateEquals");
  };
  var random = function() {
    halt("random");
  };
  var createAssert = function() {
    halt("createAssert");
  };
  var createAssertGuard = function() {
    halt("createAssertGuard");
  };
  var createIs = function() {
    halt("createIs");
  };
  var createValidate = function() {
    halt("createValidate");
  };
  var createAssertEquals = function() {
    halt("createAssertEquals");
  };
  var createAssertGuardEquals = function() {
    halt("createAssertGuardEquals");
  };
  var createEquals = function() {
    halt("createEquals");
  };
  var createValidateEquals = function() {
    halt("createValidateEquals");
  };
  var createRandom = function() {
    halt("createRandom");
  };
  var halt = function(name) {
    throw new Error("Error on typia.".concat(name, "(): no transform has been configured. Read and follow https://typia.io/docs/setup please."));
  };
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createRandom = exports.createValidateEquals = exports.createEquals = exports.createAssertGuardEquals = exports.createAssertEquals = exports.createValidate = exports.createIs = exports.createAssertGuard = exports.createAssert = exports.random = exports.validateEquals = exports.equals = exports.assertGuardEquals = exports.assertEquals = exports.validate = exports.is = exports.assertGuard = exports.assert = exports.tags = exports.reflect = exports.protobuf = exports.notations = exports.misc = exports.json = exports.http = exports.functional = undefined;
  var Namespace = __importStar(require_Namespace());
  exports.functional = __importStar(require_functional2());
  exports.http = __importStar(require_http2());
  exports.json = __importStar(require_json2());
  exports.misc = __importStar(require_misc2());
  exports.notations = __importStar(require_notations2());
  exports.protobuf = __importStar(require_protobuf2());
  exports.reflect = __importStar(require_reflect());
  exports.tags = __importStar(require_tags());
  __exportStar(require_IJsDocTagInfo(), exports);
  __exportStar(require_IJsonApplication(), exports);
  __exportStar(require_AssertionGuard(), exports);
  __exportStar(require_IRandomGenerator(), exports);
  __exportStar(require_IValidation(), exports);
  __exportStar(require_TypeGuardError(), exports);
  __exportStar(require_Primitive(), exports);
  __exportStar(require_Resolved(), exports);
  __exportStar(require_CamelCase(), exports);
  __exportStar(require_PascalCase(), exports);
  __exportStar(require_SnakeCase(), exports);
  var assertPure = Object.assign(assert, Namespace.assert("assert"));
  exports.assert = assertPure;
  var assertGuardPure = Object.assign(assertGuard, Namespace.assert("assertGuard"));
  exports.assertGuard = assertGuardPure;
  var isPure = Object.assign(is, Namespace.assert("is"));
  exports.is = isPure;
  var validatePure = Object.assign(validate, Namespace.validate());
  exports.validate = validatePure;
  var assertEqualsPure = Object.assign(assertEquals, Namespace.assert("assertEquals"));
  exports.assertEquals = assertEqualsPure;
  var assertGuardEqualsPure = Object.assign(assertGuardEquals, Namespace.assert("assertGuardEquals"));
  exports.assertGuardEquals = assertGuardEqualsPure;
  var equalsPure = Object.assign(equals, Namespace.is());
  exports.equals = equalsPure;
  var validateEqualsPure = Object.assign(validateEquals, Namespace.validate());
  exports.validateEquals = validateEqualsPure;
  var randomPure = Object.assign(random, Namespace.random());
  exports.random = randomPure;
  var createAssertPure = Object.assign(createAssert, assertPure);
  exports.createAssert = createAssertPure;
  var createAssertGuardPure = Object.assign(createAssertGuard, assertGuardPure);
  exports.createAssertGuard = createAssertGuardPure;
  var createIsPure = Object.assign(createIs, isPure);
  exports.createIs = createIsPure;
  var createValidatePure = Object.assign(createValidate, validatePure);
  exports.createValidate = createValidatePure;
  var createAssertEqualsPure = Object.assign(createAssertEquals, assertEqualsPure);
  exports.createAssertEquals = createAssertEqualsPure;
  var createAssertGuardEqualsPure = Object.assign(createAssertGuardEquals, assertGuardEqualsPure);
  exports.createAssertGuardEquals = createAssertGuardEqualsPure;
  var createEqualsPure = Object.assign(createEquals, equalsPure);
  exports.createEquals = createEqualsPure;
  var createValidateEqualsPure = Object.assign(createValidateEquals, validateEqualsPure);
  exports.createValidateEquals = createValidateEqualsPure;
  var createRandomPure = Object.assign(createRandom, randomPure);
  exports.createRandom = createRandomPure;
});

// node_modules/typia/lib/index.js
var require_lib3 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var typia = __importStar(require_module());
  exports.default = typia;
  __exportStar(require_module(), exports);
});

// generated/index.ts
var import_typia = __toESM(require_lib3(), 1);
var validate = (input) => {
  const errors = [];
  const __is = (input2) => {
    return typeof input2 === "object" && input2 !== null && (typeof input2.name === "string" && (typeof input2.age === "number" && (Math.floor(input2.age) === input2.age && 0 <= input2.age && input2.age <= 4294967295 && 20 <= input2.age && input2.age < 100)));
  };
  if (__is(input) === false) {
    const $report = import_typia.default.createValidate.report(errors);
    ((input2, _path, _exceptionable = true) => {
      const $vo0 = (input3, _path2, _exceptionable2 = true) => [typeof input3.name === "string" || $report(_exceptionable2, {
        path: _path2 + ".name",
        expected: "string",
        value: input3.name
      }), typeof input3.age === "number" && (Math.floor(input3.age) === input3.age && 0 <= input3.age && input3.age <= 4294967295 || $report(_exceptionable2, {
        path: _path2 + ".age",
        expected: "number & Type<\"uint32\">",
        value: input3.age
      })) && (20 <= input3.age || $report(_exceptionable2, {
        path: _path2 + ".age",
        expected: "number & Minimum<20>",
        value: input3.age
      })) && (input3.age < 100 || $report(_exceptionable2, {
        path: _path2 + ".age",
        expected: "number & ExclusiveMaximum<100>",
        value: input3.age
      })) || $report(_exceptionable2, {
        path: _path2 + ".age",
        expected: "(number & Type<\"uint32\"> & Minimum<20> & ExclusiveMaximum<100>)",
        value: input3.age
      })].every((flag) => flag);
      return (typeof input2 === "object" && input2 !== null || $report(true, {
        path: _path + "",
        expected: "Author",
        value: input2
      })) && $vo0(input2, _path + "", true) || $report(true, {
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
console.log(validate({ name: "John", age: 30 }));
