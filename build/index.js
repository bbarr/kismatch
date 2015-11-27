'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _kisschema = require('kisschema');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var resolver = function resolver(data) {
  return new Promise(function (res) {
    return res(data);
  });
};
var rejector = function rejector(data) {
  return new Promise(_, function (rej) {
    return rej(data);
  });
};
var isOdd = function isOdd(n) {
  return n % 2;
};
var last = function last(arr) {
  return arr[arr.length - 1];
};
var first = function first(arr) {
  return arr[0];
};
var init = function init(arr) {
  return arr.slice(0, arr.length - 1);
};
var isFunction = function isFunction(x) {
  return typeof x === 'function';
};
var max = function max(arr) {
  return arr.reduce(function (x, y) {
    return x > y ? x : y;
  }, 0);
};

var toPairs = function toPairs(arr) {
  return arr.reduce(function (pairs, item, i) {
    isOdd(i) ? last(pairs).push(item) : pairs.push([item]);
    return pairs;
  }, []);
};

var test = function test(pattern, data) {
  var count = 0;
  for (var key in pattern) {
    if (pattern.hasOwnProperty(key)) {
      if (isFunction(pattern[key].validate)) {
        if ((0, _kisschema.validate)(_defineProperty({}, key, pattern[key]), _defineProperty({}, key, data[key]))) {
          return 0;
        }
      } else if (pattern[key] !== data[key]) return 0;
      count++;
    }
  }
  return count;
};

var api = function api() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var groups = toPairs(args);
  var hasDefault = last(groups).length === 1;
  var pairs = hasDefault ? init(groups) : groups;
  var defaultFn = hasDefault ? last(last(groups)) : null;

  return function (payload) {

    var scores = pairs.map(function (pair) {
      return test(first(pair), payload);
    });

    var maxScore = max(scores);
    if (maxScore === 0) return defaultFn && defaultFn(payload);

    var indexOfBest = scores.indexOf(maxScore);
    var best = pairs[indexOfBest];

    return last(best)(payload);
  };
};

api.types = _kisschema.types;

exports.default = api;
