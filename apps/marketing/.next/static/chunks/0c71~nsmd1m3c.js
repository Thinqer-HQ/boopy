(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  "object" == typeof document ? document.currentScript : void 0,
  72609,
  (e, t, r) => {
    function n(e) {
      return (
        e &&
        e.constructor &&
        "function" == typeof e.constructor.isBuffer &&
        e.constructor.isBuffer(e)
      );
    }
    function i(e) {
      return e;
    }
    function o(e, t) {
      let r = (t = t || {}).delimiter || ".",
        o = t.maxDepth,
        a = t.transformKey || i,
        s = {};
      return (
        !(function e(i, l, u) {
          ((u = u || 1),
            Object.keys(i).forEach(function (d) {
              let c = i[d],
                p = t.safe && Array.isArray(c),
                h = Object.prototype.toString.call(c),
                f = n(c),
                g = l ? l + r + a(d) : a(d);
              if (
                !p &&
                !f &&
                ("[object Object]" === h || "[object Array]" === h) &&
                Object.keys(c).length &&
                (!t.maxDepth || u < o)
              )
                return e(c, g, u + 1);
              s[g] = c;
            }));
        })(e),
        s
      );
    }
    ((t.exports = o),
      (o.flatten = o),
      (o.unflatten = function e(t, r) {
        let a = (r = r || {}).delimiter || ".",
          s = r.overwrite || !1,
          l = r.transformKey || i,
          u = {};
        if (n(t) || "[object Object]" !== Object.prototype.toString.call(t)) return t;
        function d(e) {
          let t = Number(e);
          return isNaN(t) || -1 !== e.indexOf(".") || r.object ? e : t;
        }
        return (
          Object.keys(
            (t = Object.keys(t).reduce(function (e, n) {
              var i, s;
              let l,
                u = Object.prototype.toString.call(t[n]);
              return ("[object Object]" === u || "[object Array]" === u) &&
                ((s = t[n]),
                (l = Object.prototype.toString.call(s)),
                s &&
                  ("[object Array]" === l
                    ? s.length
                    : "[object Object]" === l
                      ? Object.keys(s).length
                      : !void 0))
                ? Object.keys((i = o(t[n], r))).reduce(function (e, t) {
                    return ((e[n + a + t] = i[t]), e);
                  }, e)
                : ((e[n] = t[n]), e);
            }, {}))
          ).forEach(function (n) {
            let i = n.split(a).map(l),
              o = d(i.shift()),
              c = d(i[0]),
              p = u;
            for (; void 0 !== c; ) {
              if ("__proto__" === o) return;
              let e = Object.prototype.toString.call(p[o]),
                t = "[object Object]" === e || "[object Array]" === e;
              if (!s && !t && void 0 !== p[o]) return;
              (((!s || t) && (s || null != p[o])) ||
                (p[o] = "number" != typeof c || r.object ? {} : []),
                (p = p[o]),
                i.length > 0 && ((o = d(i.shift())), (c = d(i[0]))));
            }
            p[o] = e(t[n], r);
          }),
          u
        );
      }));
  },
  29801,
  (e, t, r) => {
    "use strict";
    t.exports = function e(t, r) {
      if (t === r) return !0;
      if (t && r && "object" == typeof t && "object" == typeof r) {
        if (t.constructor !== r.constructor) return !1;
        if (Array.isArray(t)) {
          if ((n = t.length) != r.length) return !1;
          for (i = n; 0 != i--; ) if (!e(t[i], r[i])) return !1;
          return !0;
        }
        if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
        if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
        if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
        if ((n = (o = Object.keys(t)).length) !== Object.keys(r).length) return !1;
        for (i = n; 0 != i--; ) if (!Object.prototype.hasOwnProperty.call(r, o[i])) return !1;
        for (i = n; 0 != i--; ) {
          var n,
            i,
            o,
            a = o[i];
          if (!e(t[a], r[a])) return !1;
        }
        return !0;
      }
      return t != t && r != r;
    };
  },
  68971,
  (e, t, r) => {
    t.exports = (function t(r, n, i) {
      function o(s, l) {
        if (!n[s]) {
          if (!r[s]) {
            var u = e.t;
            return !l && u ? u(s, !0) : a(s, !0);
          }
          ((l = n[s] = { exports: {} }),
            r[s][0].call(
              l.exports,
              function (e) {
                return o(r[s][1][e] || e);
              },
              l,
              l.exports,
              t,
              r,
              n,
              i
            ));
        }
        return n[s].exports;
      }
      for (var a = e.t, s = 0; s < i.length; s++) o(i[s]);
      return o;
    })(
      {
        1: [
          function (e, t, r) {
            (function (n, i, o, a, s, l, u, d, c) {
              "use strict";
              var p = e("crypto");
              function h(e, t) {
                var r;
                return (
                  void 0 ===
                    (r =
                      "passthrough" !== (t = m(e, t)).algorithm
                        ? p.createHash(t.algorithm)
                        : new b()).write && ((r.write = r.update), (r.end = r.update)),
                  y(t, r).dispatch(e),
                  r.update || r.end(""),
                  r.digest
                    ? r.digest("buffer" === t.encoding ? void 0 : t.encoding)
                    : ((e = r.read()), "buffer" !== t.encoding ? e.toString(t.encoding) : e)
                );
              }
              (((r = t.exports = h).sha1 = function (e) {
                return h(e);
              }),
                (r.keys = function (e) {
                  return h(e, { excludeValues: !0, algorithm: "sha1", encoding: "hex" });
                }),
                (r.MD5 = function (e) {
                  return h(e, { algorithm: "md5", encoding: "hex" });
                }),
                (r.keysMD5 = function (e) {
                  return h(e, { algorithm: "md5", encoding: "hex", excludeValues: !0 });
                }));
              var f = p.getHashes ? p.getHashes().slice() : ["sha1", "md5"],
                g = (f.push("passthrough"), ["buffer", "hex", "binary", "base64"]);
              function m(e, t) {
                var r = {};
                if (
                  ((r.algorithm = (t = t || {}).algorithm || "sha1"),
                  (r.encoding = t.encoding || "hex"),
                  (r.excludeValues = !!t.excludeValues),
                  (r.algorithm = r.algorithm.toLowerCase()),
                  (r.encoding = r.encoding.toLowerCase()),
                  (r.ignoreUnknown = !0 === t.ignoreUnknown),
                  (r.respectType = !1 !== t.respectType),
                  (r.respectFunctionNames = !1 !== t.respectFunctionNames),
                  (r.respectFunctionProperties = !1 !== t.respectFunctionProperties),
                  (r.unorderedArrays = !0 === t.unorderedArrays),
                  (r.unorderedSets = !1 !== t.unorderedSets),
                  (r.unorderedObjects = !1 !== t.unorderedObjects),
                  (r.replacer = t.replacer || void 0),
                  (r.excludeKeys = t.excludeKeys || void 0),
                  void 0 === e)
                )
                  throw Error("Object argument required.");
                for (var n = 0; n < f.length; ++n)
                  f[n].toLowerCase() === r.algorithm.toLowerCase() && (r.algorithm = f[n]);
                if (-1 === f.indexOf(r.algorithm))
                  throw Error(
                    'Algorithm "' +
                      r.algorithm +
                      '"  not supported. supported values: ' +
                      f.join(", ")
                  );
                if (-1 === g.indexOf(r.encoding) && "passthrough" !== r.algorithm)
                  throw Error(
                    'Encoding "' +
                      r.encoding +
                      '"  not supported. supported values: ' +
                      g.join(", ")
                  );
                return r;
              }
              function v(e) {
                if ("function" == typeof e)
                  return (
                    null !=
                    /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(
                      Function.prototype.toString.call(e)
                    )
                  );
              }
              function y(e, t, r) {
                function n(e) {
                  return t.update ? t.update(e, "utf8") : t.write(e, "utf8");
                }
                return (
                  (r = r || []),
                  {
                    dispatch: function (t) {
                      return this[
                        "_" + (null === (t = e.replacer ? e.replacer(t) : t) ? "null" : typeof t)
                      ](t);
                    },
                    _object: function (t) {
                      var i,
                        a = Object.prototype.toString.call(t),
                        s = /\[object (.*)\]/i.exec(a);
                      if (
                        ((s = (s = s ? s[1] : "unknown:[" + a + "]").toLowerCase()),
                        0 <= (a = r.indexOf(t)))
                      )
                        return this.dispatch("[CIRCULAR:" + a + "]");
                      if ((r.push(t), void 0 !== o && o.isBuffer && o.isBuffer(t)))
                        return (n("buffer:"), n(t));
                      if ("object" === s || "function" === s || "asyncfunction" === s)
                        return (
                          (a = Object.keys(t)),
                          e.unorderedObjects && (a = a.sort()),
                          !1 === e.respectType ||
                            v(t) ||
                            a.splice(0, 0, "prototype", "__proto__", "constructor"),
                          e.excludeKeys &&
                            (a = a.filter(function (t) {
                              return !e.excludeKeys(t);
                            })),
                          n("object:" + a.length + ":"),
                          (i = this),
                          a.forEach(function (r) {
                            (i.dispatch(r), n(":"), e.excludeValues || i.dispatch(t[r]), n(","));
                          })
                        );
                      if (!this["_" + s]) {
                        if (e.ignoreUnknown) return n("[" + s + "]");
                        throw Error('Unknown object type "' + s + '"');
                      }
                      this["_" + s](t);
                    },
                    _array: function (t, i) {
                      i = void 0 !== i ? i : !1 !== e.unorderedArrays;
                      var o = this;
                      if ((n("array:" + t.length + ":"), !i || t.length <= 1))
                        return t.forEach(function (e) {
                          return o.dispatch(e);
                        });
                      var a = [],
                        i = t.map(function (t) {
                          var n = new b(),
                            i = r.slice();
                          return (
                            y(e, n, i).dispatch(t),
                            (a = a.concat(i.slice(r.length))),
                            n.read().toString()
                          );
                        });
                      return ((r = r.concat(a)), i.sort(), this._array(i, !1));
                    },
                    _date: function (e) {
                      return n("date:" + e.toJSON());
                    },
                    _symbol: function (e) {
                      return n("symbol:" + e.toString());
                    },
                    _error: function (e) {
                      return n("error:" + e.toString());
                    },
                    _boolean: function (e) {
                      return n("bool:" + e.toString());
                    },
                    _string: function (e) {
                      (n("string:" + e.length + ":"), n(e.toString()));
                    },
                    _function: function (t) {
                      (n("fn:"),
                        v(t) ? this.dispatch("[native]") : this.dispatch(t.toString()),
                        !1 !== e.respectFunctionNames &&
                          this.dispatch("function-name:" + String(t.name)),
                        e.respectFunctionProperties && this._object(t));
                    },
                    _number: function (e) {
                      return n("number:" + e.toString());
                    },
                    _xml: function (e) {
                      return n("xml:" + e.toString());
                    },
                    _null: function () {
                      return n("Null");
                    },
                    _undefined: function () {
                      return n("Undefined");
                    },
                    _regexp: function (e) {
                      return n("regex:" + e.toString());
                    },
                    _uint8array: function (e) {
                      return (n("uint8array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _uint8clampedarray: function (e) {
                      return (
                        n("uint8clampedarray:"),
                        this.dispatch(Array.prototype.slice.call(e))
                      );
                    },
                    _int8array: function (e) {
                      return (n("int8array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _uint16array: function (e) {
                      return (n("uint16array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _int16array: function (e) {
                      return (n("int16array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _uint32array: function (e) {
                      return (n("uint32array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _int32array: function (e) {
                      return (n("int32array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _float32array: function (e) {
                      return (n("float32array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _float64array: function (e) {
                      return (n("float64array:"), this.dispatch(Array.prototype.slice.call(e)));
                    },
                    _arraybuffer: function (e) {
                      return (n("arraybuffer:"), this.dispatch(new Uint8Array(e)));
                    },
                    _url: function (e) {
                      return n("url:" + e.toString());
                    },
                    _map: function (t) {
                      return (
                        n("map:"),
                        (t = Array.from(t)),
                        this._array(t, !1 !== e.unorderedSets)
                      );
                    },
                    _set: function (t) {
                      return (
                        n("set:"),
                        (t = Array.from(t)),
                        this._array(t, !1 !== e.unorderedSets)
                      );
                    },
                    _file: function (e) {
                      return (n("file:"), this.dispatch([e.name, e.size, e.type, e.lastModfied]));
                    },
                    _blob: function () {
                      if (e.ignoreUnknown) return n("[blob]");
                      throw Error(
                        'Hashing Blob objects is currently not supported\n(see https://github.com/puleos/object-hash/issues/26)\nUse "options.replacer" or "options.ignoreUnknown"\n'
                      );
                    },
                    _domwindow: function () {
                      return n("domwindow");
                    },
                    _bigint: function (e) {
                      return n("bigint:" + e.toString());
                    },
                    _process: function () {
                      return n("process");
                    },
                    _timer: function () {
                      return n("timer");
                    },
                    _pipe: function () {
                      return n("pipe");
                    },
                    _tcp: function () {
                      return n("tcp");
                    },
                    _udp: function () {
                      return n("udp");
                    },
                    _tty: function () {
                      return n("tty");
                    },
                    _statwatcher: function () {
                      return n("statwatcher");
                    },
                    _securecontext: function () {
                      return n("securecontext");
                    },
                    _connection: function () {
                      return n("connection");
                    },
                    _zlib: function () {
                      return n("zlib");
                    },
                    _context: function () {
                      return n("context");
                    },
                    _nodescript: function () {
                      return n("nodescript");
                    },
                    _httpparser: function () {
                      return n("httpparser");
                    },
                    _dataview: function () {
                      return n("dataview");
                    },
                    _signal: function () {
                      return n("signal");
                    },
                    _fsevent: function () {
                      return n("fsevent");
                    },
                    _tlswrap: function () {
                      return n("tlswrap");
                    },
                  }
                );
              }
              function b() {
                return {
                  buf: "",
                  write: function (e) {
                    this.buf += e;
                  },
                  end: function (e) {
                    this.buf += e;
                  },
                  read: function () {
                    return this.buf;
                  },
                };
              }
              r.writeToStream = function (e, t, r) {
                return (void 0 === r && ((r = t), (t = {})), y((t = m(e, t)), r).dispatch(e));
              };
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/fake_9a5aa49d.js",
              "/"
            );
          },
          { buffer: 3, crypto: 5, lYpoI2: 11 },
        ],
        2: [
          function (e, t, r) {
            (function (e, t, n, i, o, a, s, l, u) {
              !(function (e) {
                "use strict";
                var t = "u" > typeof Uint8Array ? Uint8Array : Array;
                function r(e) {
                  return 43 === (e = e.charCodeAt(0)) || 45 === e
                    ? 62
                    : 47 === e || 95 === e
                      ? 63
                      : e < 48
                        ? -1
                        : e < 58
                          ? e - 48 + 26 + 26
                          : e < 91
                            ? e - 65
                            : e < 123
                              ? e - 97 + 26
                              : void 0;
                }
                ((e.toByteArray = function (e) {
                  if (0 < e.length % 4)
                    throw Error("Invalid string. Length must be a multiple of 4");
                  var n,
                    i,
                    o = e.length,
                    o = "=" === e.charAt(o - 2) ? 2 : +("=" === e.charAt(o - 1)),
                    a = new t((3 * e.length) / 4 - o),
                    s = 0 < o ? e.length - 4 : e.length,
                    l = 0;
                  function u(e) {
                    a[l++] = e;
                  }
                  for (n = 0; n < s; n += 4)
                    (u(
                      (0xff0000 &
                        (i =
                          (r(e.charAt(n)) << 18) |
                          (r(e.charAt(n + 1)) << 12) |
                          (r(e.charAt(n + 2)) << 6) |
                          r(e.charAt(n + 3)))) >>
                        16
                    ),
                      u((65280 & i) >> 8),
                      u(255 & i));
                  return (
                    2 == o
                      ? u(255 & (i = (r(e.charAt(n)) << 2) | (r(e.charAt(n + 1)) >> 4)))
                      : 1 == o &&
                        (u(
                          ((i =
                            (r(e.charAt(n)) << 10) |
                            (r(e.charAt(n + 1)) << 4) |
                            (r(e.charAt(n + 2)) >> 2)) >>
                            8) &
                            255
                        ),
                        u(255 & i)),
                    a
                  );
                }),
                  (e.fromByteArray = function (e) {
                    var t,
                      r,
                      n,
                      i,
                      o = e.length % 3,
                      a = "";
                    function s(e) {
                      return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(
                        e
                      );
                    }
                    for (t = 0, n = e.length - o; t < n; t += 3)
                      a +=
                        s(((i = r = (e[t] << 16) + (e[t + 1] << 8) + e[t + 2]) >> 18) & 63) +
                        s((i >> 12) & 63) +
                        s((i >> 6) & 63) +
                        s(63 & i);
                    switch (o) {
                      case 1:
                        a = (a += s((r = e[e.length - 1]) >> 2)) + s((r << 4) & 63) + "==";
                        break;
                      case 2:
                        a =
                          (a =
                            (a += s((r = (e[e.length - 2] << 8) + e[e.length - 1]) >> 10)) +
                            s((r >> 4) & 63)) +
                          s((r << 2) & 63) +
                          "=";
                    }
                    return a;
                  }));
              })(void 0 === r ? (this.base64js = {}) : r);
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/base64-js/lib/b64.js",
              "/node_modules/gulp-browserify/node_modules/base64-js/lib"
            );
          },
          { buffer: 3, lYpoI2: 11 },
        ],
        3: [
          function (e, t, r) {
            (function (t, n, i, o, a, s, l, u, d) {
              var c = e("base64-js"),
                p = e("ieee754");
              function i(e, t, r) {
                if (!(this instanceof i)) return new i(e, t, r);
                var n,
                  o,
                  a,
                  s,
                  l = typeof e;
                if ("base64" === t && "string" == l)
                  for (
                    e = (s = e).trim ? s.trim() : s.replace(/^\s+|\s+$/g, "");
                    e.length % 4 != 0;
                  )
                    e += "=";
                if ("number" == l) n = O(e);
                else if ("string" == l) n = i.byteLength(e, t);
                else {
                  if ("object" != l)
                    throw Error("First argument needs to be a number, array or string.");
                  n = O(e.length);
                }
                if (
                  (i._useTypedArrays
                    ? (o = i._augment(new Uint8Array(n)))
                    : (((o = this).length = n), (o._isBuffer = !0)),
                  i._useTypedArrays && "number" == typeof e.byteLength)
                )
                  o._set(e);
                else if (
                  C((s = e)) ||
                  i.isBuffer(s) ||
                  (s && "object" == typeof s && "number" == typeof s.length)
                )
                  for (a = 0; a < n; a++) i.isBuffer(e) ? (o[a] = e.readUInt8(a)) : (o[a] = e[a]);
                else if ("string" == l) o.write(e, 0, t);
                else if ("number" == l && !i._useTypedArrays && !r)
                  for (a = 0; a < n; a++) o[a] = 0;
                return o;
              }
              function h(e, t, r, n) {
                n ||
                  (B("boolean" == typeof r, "missing or invalid endian"),
                  B(null != t, "missing offset"),
                  B(t + 1 < e.length, "Trying to read beyond buffer length"));
                var i,
                  n = e.length;
                if (!(n <= t))
                  return (
                    r
                      ? ((i = e[t]), t + 1 < n && (i |= e[t + 1] << 8))
                      : ((i = e[t] << 8), t + 1 < n && (i |= e[t + 1])),
                    i
                  );
              }
              function f(e, t, r, n) {
                n ||
                  (B("boolean" == typeof r, "missing or invalid endian"),
                  B(null != t, "missing offset"),
                  B(t + 3 < e.length, "Trying to read beyond buffer length"));
                var i,
                  n = e.length;
                if (!(n <= t))
                  return (
                    r
                      ? (t + 2 < n && (i = e[t + 2] << 16),
                        t + 1 < n && (i |= e[t + 1] << 8),
                        (i |= e[t]),
                        t + 3 < n && (i += (e[t + 3] << 24) >>> 0))
                      : (t + 1 < n && (i = e[t + 1] << 16),
                        t + 2 < n && (i |= e[t + 2] << 8),
                        t + 3 < n && (i |= e[t + 3]),
                        (i += (e[t] << 24) >>> 0)),
                    i
                  );
              }
              function g(e, t, r, n) {
                if (
                  (n ||
                    (B("boolean" == typeof r, "missing or invalid endian"),
                    B(null != t, "missing offset"),
                    B(t + 1 < e.length, "Trying to read beyond buffer length")),
                  !(e.length <= t))
                )
                  return 32768 & (n = h(e, t, r, !0)) ? -1 * (65535 - n + 1) : n;
              }
              function m(e, t, r, n) {
                if (
                  (n ||
                    (B("boolean" == typeof r, "missing or invalid endian"),
                    B(null != t, "missing offset"),
                    B(t + 3 < e.length, "Trying to read beyond buffer length")),
                  !(e.length <= t))
                )
                  return 0x80000000 & (n = f(e, t, r, !0)) ? -1 * (0xffffffff - n + 1) : n;
              }
              function v(e, t, r, n) {
                return (
                  n ||
                    (B("boolean" == typeof r, "missing or invalid endian"),
                    B(t + 3 < e.length, "Trying to read beyond buffer length")),
                  p.read(e, t, r, 23, 4)
                );
              }
              function y(e, t, r, n) {
                return (
                  n ||
                    (B("boolean" == typeof r, "missing or invalid endian"),
                    B(t + 7 < e.length, "Trying to read beyond buffer length")),
                  p.read(e, t, r, 52, 8)
                );
              }
              function b(e, t, r, n, i) {
                if (
                  (i ||
                    (B(null != t, "missing value"),
                    B("boolean" == typeof n, "missing or invalid endian"),
                    B(null != r, "missing offset"),
                    B(r + 1 < e.length, "trying to write beyond buffer length"),
                    L(t, 65535)),
                  !((i = e.length) <= r))
                )
                  for (var o = 0, a = Math.min(i - r, 2); o < a; o++)
                    e[r + o] = (t & (255 << (8 * (n ? o : 1 - o)))) >>> (8 * (n ? o : 1 - o));
              }
              function w(e, t, r, n, i) {
                if (
                  (i ||
                    (B(null != t, "missing value"),
                    B("boolean" == typeof n, "missing or invalid endian"),
                    B(null != r, "missing offset"),
                    B(r + 3 < e.length, "trying to write beyond buffer length"),
                    L(t, 0xffffffff)),
                  !((i = e.length) <= r))
                )
                  for (var o = 0, a = Math.min(i - r, 4); o < a; o++)
                    e[r + o] = (t >>> (8 * (n ? o : 3 - o))) & 255;
              }
              function _(e, t, r, n, i) {
                (i ||
                  (B(null != t, "missing value"),
                  B("boolean" == typeof n, "missing or invalid endian"),
                  B(null != r, "missing offset"),
                  B(r + 1 < e.length, "Trying to write beyond buffer length"),
                  N(t, 32767, -32768)),
                  e.length <= r || b(e, 0 <= t ? t : 65535 + t + 1, r, n, i));
              }
              function j(e, t, r, n, i) {
                (i ||
                  (B(null != t, "missing value"),
                  B("boolean" == typeof n, "missing or invalid endian"),
                  B(null != r, "missing offset"),
                  B(r + 3 < e.length, "Trying to write beyond buffer length"),
                  N(t, 0x7fffffff, -0x80000000)),
                  e.length <= r || w(e, 0 <= t ? t : 0xffffffff + t + 1, r, n, i));
              }
              function k(e, t, r, n, i) {
                (i ||
                  (B(null != t, "missing value"),
                  B("boolean" == typeof n, "missing or invalid endian"),
                  B(null != r, "missing offset"),
                  B(r + 3 < e.length, "Trying to write beyond buffer length"),
                  T(t, 34028234663852886e22, -34028234663852886e22)),
                  e.length <= r || p.write(e, t, r, n, 23, 4));
              }
              function S(e, t, r, n, i) {
                (i ||
                  (B(null != t, "missing value"),
                  B("boolean" == typeof n, "missing or invalid endian"),
                  B(null != r, "missing offset"),
                  B(r + 7 < e.length, "Trying to write beyond buffer length"),
                  T(t, 17976931348623157e292, -17976931348623157e292)),
                  e.length <= r || p.write(e, t, r, n, 52, 8));
              }
              ((r.Buffer = i),
                (r.SlowBuffer = i),
                (r.INSPECT_MAX_BYTES = 50),
                (i.poolSize = 8192),
                (i._useTypedArrays = (function () {
                  try {
                    var e = new ArrayBuffer(0),
                      t = new Uint8Array(e);
                    return (
                      (t.foo = function () {
                        return 42;
                      }),
                      42 === t.foo() && "function" == typeof t.subarray
                    );
                  } catch (e) {
                    return !1;
                  }
                })()),
                (i.isEncoding = function (e) {
                  switch (String(e).toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "binary":
                    case "base64":
                    case "raw":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      return !0;
                    default:
                      return !1;
                  }
                }),
                (i.isBuffer = function (e) {
                  return !(null == e || !e._isBuffer);
                }),
                (i.byteLength = function (e, t) {
                  var r;
                  switch (((e += ""), t || "utf8")) {
                    case "hex":
                      r = e.length / 2;
                      break;
                    case "utf8":
                    case "utf-8":
                      r = P(e).length;
                      break;
                    case "ascii":
                    case "binary":
                    case "raw":
                      r = e.length;
                      break;
                    case "base64":
                      r = A(e).length;
                      break;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      r = 2 * e.length;
                      break;
                    default:
                      throw Error("Unknown encoding");
                  }
                  return r;
                }),
                (i.concat = function (e, t) {
                  if (
                    (B(C(e), "Usage: Buffer.concat(list, [totalLength])\nlist should be an Array."),
                    0 === e.length)
                  )
                    return new i(0);
                  if (1 === e.length) return e[0];
                  if ("number" != typeof t) for (o = t = 0; o < e.length; o++) t += e[o].length;
                  for (var r = new i(t), n = 0, o = 0; o < e.length; o++) {
                    var a = e[o];
                    (a.copy(r, n), (n += a.length));
                  }
                  return r;
                }),
                (i.prototype.write = function (e, t, r, n) {
                  (isFinite(t)
                    ? isFinite(r) || ((n = r), (r = void 0))
                    : ((h = n), (n = t), (t = r), (r = h)),
                    (t = Number(t) || 0));
                  var o,
                    a,
                    s,
                    l,
                    u,
                    d,
                    c,
                    p,
                    h = this.length - t;
                  switch (
                    ((!r || h < (r = Number(r))) && (r = h),
                    (n = String(n || "utf8").toLowerCase()))
                  ) {
                    case "hex":
                      u = (function (e, t, r, n) {
                        r = Number(r) || 0;
                        var o = e.length - r;
                        ((!n || o < (n = Number(n))) && (n = o),
                          B((o = t.length) % 2 == 0, "Invalid hex string"),
                          o / 2 < n && (n = o / 2));
                        for (var a = 0; a < n; a++) {
                          var s = parseInt(t.substr(2 * a, 2), 16);
                          (B(!isNaN(s), "Invalid hex string"), (e[r + a] = s));
                        }
                        return ((i._charsWritten = 2 * a), a);
                      })(this, e, t, r);
                      break;
                    case "utf8":
                    case "utf-8":
                      ((d = this), (c = t), (p = r), (u = i._charsWritten = z(P(e), d, c, p)));
                      break;
                    case "ascii":
                    case "binary":
                      ((o = t),
                        (a = r),
                        (u = i._charsWritten =
                          z(
                            (function (e) {
                              for (var t = [], r = 0; r < e.length; r++)
                                t.push(255 & e.charCodeAt(r));
                              return t;
                            })(e),
                            this,
                            o,
                            a
                          )));
                      break;
                    case "base64":
                      ((d = this), (c = t), (p = r), (u = i._charsWritten = z(A(e), d, c, p)));
                      break;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      ((s = t),
                        (l = r),
                        (u = i._charsWritten =
                          z(
                            (function (e) {
                              for (var t, r, n = [], i = 0; i < e.length; i++)
                                ((t = (r = e.charCodeAt(i)) >> 8), n.push((r %= 256)), n.push(t));
                              return n;
                            })(e),
                            this,
                            s,
                            l
                          )));
                      break;
                    default:
                      throw Error("Unknown encoding");
                  }
                  return u;
                }),
                (i.prototype.toString = function (e, t, r) {
                  var n, i, o;
                  if (
                    ((e = String(e || "utf8").toLowerCase()),
                    (t = Number(t) || 0),
                    (r = void 0 !== r ? Number(r) : this.length) === t)
                  )
                    return "";
                  switch (e) {
                    case "hex":
                      n = (function (e, t, r) {
                        var n = e.length;
                        ((!t || t < 0) && (t = 0), (!r || r < 0 || n < r) && (r = n));
                        for (var i = "", o = t; o < r; o++) i += M(e[o]);
                        return i;
                      })(this, t, r);
                      break;
                    case "utf8":
                    case "utf-8":
                      n = (function (e, t, r) {
                        var n = "",
                          i = "";
                        r = Math.min(e.length, r);
                        for (var o = t; o < r; o++)
                          e[o] <= 127
                            ? ((n += D(i) + String.fromCharCode(e[o])), (i = ""))
                            : (i += "%" + e[o].toString(16));
                        return n + D(i);
                      })(this, t, r);
                      break;
                    case "ascii":
                    case "binary":
                      n = (function (e, t, r) {
                        var n = "";
                        r = Math.min(e.length, r);
                        for (var i = t; i < r; i++) n += String.fromCharCode(e[i]);
                        return n;
                      })(this, t, r);
                      break;
                    case "base64":
                      ((o = r),
                        (n =
                          0 === (i = t) && o === this.length
                            ? c.fromByteArray(this)
                            : c.fromByteArray(this.slice(i, o))));
                      break;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      n = (function (e, t, r) {
                        for (var n = e.slice(t, r), i = "", o = 0; o < n.length; o += 2)
                          i += String.fromCharCode(n[o] + 256 * n[o + 1]);
                        return i;
                      })(this, t, r);
                      break;
                    default:
                      throw Error("Unknown encoding");
                  }
                  return n;
                }),
                (i.prototype.toJSON = function () {
                  return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
                }),
                (i.prototype.copy = function (e, t, r, n) {
                  if (
                    ((t = t || 0),
                    (n = n || 0 === n ? n : this.length) !== (r = r || 0) &&
                      0 !== e.length &&
                      0 !== this.length)
                  ) {
                    (B(r <= n, "sourceEnd < sourceStart"),
                      B(0 <= t && t < e.length, "targetStart out of bounds"),
                      B(0 <= r && r < this.length, "sourceStart out of bounds"),
                      B(0 <= n && n <= this.length, "sourceEnd out of bounds"),
                      n > this.length && (n = this.length));
                    var o = (n = e.length - t < n - r ? e.length - t + r : n) - r;
                    if (o < 100 || !i._useTypedArrays)
                      for (var a = 0; a < o; a++) e[a + t] = this[a + r];
                    else e._set(this.subarray(r, r + o), t);
                  }
                }),
                (i.prototype.slice = function (e, t) {
                  var r = this.length;
                  if (((e = E(e, r, 0)), (t = E(t, r, r)), i._useTypedArrays))
                    return i._augment(this.subarray(e, t));
                  for (var n = t - e, o = new i(n, void 0, !0), a = 0; a < n; a++)
                    o[a] = this[a + e];
                  return o;
                }),
                (i.prototype.get = function (e) {
                  return (
                    console.log(".get() is deprecated. Access using array indexes instead."),
                    this.readUInt8(e)
                  );
                }),
                (i.prototype.set = function (e, t) {
                  return (
                    console.log(".set() is deprecated. Access using array indexes instead."),
                    this.writeUInt8(e, t)
                  );
                }),
                (i.prototype.readUInt8 = function (e, t) {
                  if (
                    (t ||
                      (B(null != e, "missing offset"),
                      B(e < this.length, "Trying to read beyond buffer length")),
                    !(e >= this.length))
                  )
                    return this[e];
                }),
                (i.prototype.readUInt16LE = function (e, t) {
                  return h(this, e, !0, t);
                }),
                (i.prototype.readUInt16BE = function (e, t) {
                  return h(this, e, !1, t);
                }),
                (i.prototype.readUInt32LE = function (e, t) {
                  return f(this, e, !0, t);
                }),
                (i.prototype.readUInt32BE = function (e, t) {
                  return f(this, e, !1, t);
                }),
                (i.prototype.readInt8 = function (e, t) {
                  if (
                    (t ||
                      (B(null != e, "missing offset"),
                      B(e < this.length, "Trying to read beyond buffer length")),
                    !(e >= this.length))
                  )
                    return 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e];
                }),
                (i.prototype.readInt16LE = function (e, t) {
                  return g(this, e, !0, t);
                }),
                (i.prototype.readInt16BE = function (e, t) {
                  return g(this, e, !1, t);
                }),
                (i.prototype.readInt32LE = function (e, t) {
                  return m(this, e, !0, t);
                }),
                (i.prototype.readInt32BE = function (e, t) {
                  return m(this, e, !1, t);
                }),
                (i.prototype.readFloatLE = function (e, t) {
                  return v(this, e, !0, t);
                }),
                (i.prototype.readFloatBE = function (e, t) {
                  return v(this, e, !1, t);
                }),
                (i.prototype.readDoubleLE = function (e, t) {
                  return y(this, e, !0, t);
                }),
                (i.prototype.readDoubleBE = function (e, t) {
                  return y(this, e, !1, t);
                }),
                (i.prototype.writeUInt8 = function (e, t, r) {
                  (r ||
                    (B(null != e, "missing value"),
                    B(null != t, "missing offset"),
                    B(t < this.length, "trying to write beyond buffer length"),
                    L(e, 255)),
                    t >= this.length || (this[t] = e));
                }),
                (i.prototype.writeUInt16LE = function (e, t, r) {
                  b(this, e, t, !0, r);
                }),
                (i.prototype.writeUInt16BE = function (e, t, r) {
                  b(this, e, t, !1, r);
                }),
                (i.prototype.writeUInt32LE = function (e, t, r) {
                  w(this, e, t, !0, r);
                }),
                (i.prototype.writeUInt32BE = function (e, t, r) {
                  w(this, e, t, !1, r);
                }),
                (i.prototype.writeInt8 = function (e, t, r) {
                  (r ||
                    (B(null != e, "missing value"),
                    B(null != t, "missing offset"),
                    B(t < this.length, "Trying to write beyond buffer length"),
                    N(e, 127, -128)),
                    t >= this.length ||
                      (0 <= e ? this.writeUInt8(e, t, r) : this.writeUInt8(255 + e + 1, t, r)));
                }),
                (i.prototype.writeInt16LE = function (e, t, r) {
                  _(this, e, t, !0, r);
                }),
                (i.prototype.writeInt16BE = function (e, t, r) {
                  _(this, e, t, !1, r);
                }),
                (i.prototype.writeInt32LE = function (e, t, r) {
                  j(this, e, t, !0, r);
                }),
                (i.prototype.writeInt32BE = function (e, t, r) {
                  j(this, e, t, !1, r);
                }),
                (i.prototype.writeFloatLE = function (e, t, r) {
                  k(this, e, t, !0, r);
                }),
                (i.prototype.writeFloatBE = function (e, t, r) {
                  k(this, e, t, !1, r);
                }),
                (i.prototype.writeDoubleLE = function (e, t, r) {
                  S(this, e, t, !0, r);
                }),
                (i.prototype.writeDoubleBE = function (e, t, r) {
                  S(this, e, t, !1, r);
                }),
                (i.prototype.fill = function (e, t, r) {
                  if (
                    ((t = t || 0),
                    (r = r || this.length),
                    B(
                      "number" ==
                        typeof (e = "string" == typeof (e = e || 0) ? e.charCodeAt(0) : e) &&
                        !isNaN(e),
                      "value is not a number"
                    ),
                    B(t <= r, "end < start"),
                    r !== t && 0 !== this.length)
                  ) {
                    (B(0 <= t && t < this.length, "start out of bounds"),
                      B(0 <= r && r <= this.length, "end out of bounds"));
                    for (var n = t; n < r; n++) this[n] = e;
                  }
                }),
                (i.prototype.inspect = function () {
                  for (var e = [], t = this.length, n = 0; n < t; n++)
                    if (((e[n] = M(this[n])), n === r.INSPECT_MAX_BYTES)) {
                      e[n + 1] = "...";
                      break;
                    }
                  return "<Buffer " + e.join(" ") + ">";
                }),
                (i.prototype.toArrayBuffer = function () {
                  if ("u" < typeof Uint8Array)
                    throw Error("Buffer.toArrayBuffer not supported in this browser");
                  if (i._useTypedArrays) return new i(this).buffer;
                  for (var e = new Uint8Array(this.length), t = 0, r = e.length; t < r; t += 1)
                    e[t] = this[t];
                  return e.buffer;
                }));
              var I = i.prototype;
              function E(e, t, r) {
                return "number" != typeof e
                  ? r
                  : t <= (e = ~~e)
                    ? t
                    : 0 <= e || 0 <= (e += t)
                      ? e
                      : 0;
              }
              function O(e) {
                return (e = ~~Math.ceil(+e)) < 0 ? 0 : e;
              }
              function C(e) {
                return (
                  Array.isArray ||
                  function (e) {
                    return "[object Array]" === Object.prototype.toString.call(e);
                  }
                )(e);
              }
              function M(e) {
                return e < 16 ? "0" + e.toString(16) : e.toString(16);
              }
              function P(e) {
                for (var t = [], r = 0; r < e.length; r++) {
                  var n = e.charCodeAt(r);
                  if (n <= 127) t.push(e.charCodeAt(r));
                  else
                    for (
                      var i = r,
                        o =
                          (55296 <= n && n <= 57343 && r++,
                          encodeURIComponent(e.slice(i, r + 1))
                            .substr(1)
                            .split("%")),
                        a = 0;
                      a < o.length;
                      a++
                    )
                      t.push(parseInt(o[a], 16));
                }
                return t;
              }
              function A(e) {
                return c.toByteArray(e);
              }
              function z(e, t, r, n) {
                for (var i = 0; i < n && !(i + r >= t.length || i >= e.length); i++)
                  t[i + r] = e[i];
                return i;
              }
              function D(e) {
                try {
                  return decodeURIComponent(e);
                } catch (e) {
                  return String.fromCharCode(65533);
                }
              }
              function L(e, t) {
                (B("number" == typeof e, "cannot write a non-number as a number"),
                  B(0 <= e, "specified a negative value for writing an unsigned value"),
                  B(e <= t, "value is larger than maximum value for type"),
                  B(Math.floor(e) === e, "value has a fractional component"));
              }
              function N(e, t, r) {
                (B("number" == typeof e, "cannot write a non-number as a number"),
                  B(e <= t, "value larger than maximum allowed value"),
                  B(r <= e, "value smaller than minimum allowed value"),
                  B(Math.floor(e) === e, "value has a fractional component"));
              }
              function T(e, t, r) {
                (B("number" == typeof e, "cannot write a non-number as a number"),
                  B(e <= t, "value larger than maximum allowed value"),
                  B(r <= e, "value smaller than minimum allowed value"));
              }
              function B(e, t) {
                if (!e) throw Error(t || "Failed assertion");
              }
              i._augment = function (e) {
                return (
                  (e._isBuffer = !0),
                  (e._get = e.get),
                  (e._set = e.set),
                  (e.get = I.get),
                  (e.set = I.set),
                  (e.write = I.write),
                  (e.toString = I.toString),
                  (e.toLocaleString = I.toString),
                  (e.toJSON = I.toJSON),
                  (e.copy = I.copy),
                  (e.slice = I.slice),
                  (e.readUInt8 = I.readUInt8),
                  (e.readUInt16LE = I.readUInt16LE),
                  (e.readUInt16BE = I.readUInt16BE),
                  (e.readUInt32LE = I.readUInt32LE),
                  (e.readUInt32BE = I.readUInt32BE),
                  (e.readInt8 = I.readInt8),
                  (e.readInt16LE = I.readInt16LE),
                  (e.readInt16BE = I.readInt16BE),
                  (e.readInt32LE = I.readInt32LE),
                  (e.readInt32BE = I.readInt32BE),
                  (e.readFloatLE = I.readFloatLE),
                  (e.readFloatBE = I.readFloatBE),
                  (e.readDoubleLE = I.readDoubleLE),
                  (e.readDoubleBE = I.readDoubleBE),
                  (e.writeUInt8 = I.writeUInt8),
                  (e.writeUInt16LE = I.writeUInt16LE),
                  (e.writeUInt16BE = I.writeUInt16BE),
                  (e.writeUInt32LE = I.writeUInt32LE),
                  (e.writeUInt32BE = I.writeUInt32BE),
                  (e.writeInt8 = I.writeInt8),
                  (e.writeInt16LE = I.writeInt16LE),
                  (e.writeInt16BE = I.writeInt16BE),
                  (e.writeInt32LE = I.writeInt32LE),
                  (e.writeInt32BE = I.writeInt32BE),
                  (e.writeFloatLE = I.writeFloatLE),
                  (e.writeFloatBE = I.writeFloatBE),
                  (e.writeDoubleLE = I.writeDoubleLE),
                  (e.writeDoubleBE = I.writeDoubleBE),
                  (e.fill = I.fill),
                  (e.inspect = I.inspect),
                  (e.toArrayBuffer = I.toArrayBuffer),
                  e
                );
              };
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/buffer/index.js",
              "/node_modules/gulp-browserify/node_modules/buffer"
            );
          },
          { "base64-js": 2, buffer: 3, ieee754: 10, lYpoI2: 11 },
        ],
        4: [
          function (e, t, r) {
            (function (r, n, i, o, a, s, l, u, d) {
              var i = e("buffer").Buffer,
                c = new i(4);
              (c.fill(0),
                (t.exports = {
                  hash: function (e, t, r, n) {
                    for (
                      var o = t(
                          (function (e, t) {
                            e.length % 4 != 0 &&
                              ((r = e.length + (4 - (e.length % 4))), (e = i.concat([e, c], r)));
                            for (
                              var r, n = [], o = t ? e.readInt32BE : e.readInt32LE, a = 0;
                              a < e.length;
                              a += 4
                            )
                              n.push(o.call(e, a));
                            return n;
                          })((e = i.isBuffer(e) ? e : new i(e)), n),
                          8 * e.length
                        ),
                        t = n,
                        a = new i(r),
                        s = t ? a.writeInt32BE : a.writeInt32LE,
                        l = 0;
                      l < o.length;
                      l++
                    )
                      s.call(a, o[l], 4 * l, !0);
                    return a;
                  },
                }));
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/crypto-browserify/helpers.js",
              "/node_modules/gulp-browserify/node_modules/crypto-browserify"
            );
          },
          { buffer: 3, lYpoI2: 11 },
        ],
        5: [
          function (e, t, r) {
            (function (t, n, i, o, a, s, l, u, d) {
              var i = e("buffer").Buffer,
                c = e("./sha"),
                p = e("./sha256"),
                h = e("./rng"),
                f = { sha1: c, sha256: p, md5: e("./md5") },
                g = new i(64);
              function m(e, t) {
                var r = f[(e = e || "sha1")],
                  n = [];
                return (
                  r || v("algorithm:", e, "is not yet supported"),
                  {
                    update: function (e) {
                      return (i.isBuffer(e) || (e = new i(e)), n.push(e), e.length, this);
                    },
                    digest: function (e) {
                      var o = i.concat(n),
                        o = t
                          ? (function (e, t, r) {
                              (i.isBuffer(t) || (t = new i(t)),
                                i.isBuffer(r) || (r = new i(r)),
                                t.length > 64
                                  ? (t = e(t))
                                  : t.length < 64 && (t = i.concat([t, g], 64)));
                              for (var n = new i(64), o = new i(64), a = 0; a < 64; a++)
                                ((n[a] = 54 ^ t[a]), (o[a] = 92 ^ t[a]));
                              return ((r = e(i.concat([n, r]))), e(i.concat([o, r])));
                            })(r, t, o)
                          : r(o);
                      return ((n = null), e ? o.toString(e) : o);
                    },
                  }
                );
              }
              function v() {
                var e = [].slice.call(arguments).join(" ");
                throw Error(
                  [
                    e,
                    "we accept pull requests\nhttp://github.com/dominictarr/crypto-browserify",
                  ].join("\n")
                );
              }
              (g.fill(0),
                (r.createHash = function (e) {
                  return m(e);
                }),
                (r.createHmac = m),
                (r.randomBytes = function (e, t) {
                  if (!t || !t.call) return new i(h(e));
                  try {
                    t.call(this, void 0, new i(h(e)));
                  } catch (e) {
                    t(e);
                  }
                }));
              var y,
                b = [
                  "createCredentials",
                  "createCipher",
                  "createCipheriv",
                  "createDecipher",
                  "createDecipheriv",
                  "createSign",
                  "createVerify",
                  "createDiffieHellman",
                  "pbkdf2",
                ],
                w = function (e) {
                  r[e] = function () {
                    v("sorry,", e, "is not implemented yet");
                  };
                };
              for (y in b) w(b[y], y);
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/crypto-browserify/index.js",
              "/node_modules/gulp-browserify/node_modules/crypto-browserify"
            );
          },
          { "./md5": 6, "./rng": 7, "./sha": 8, "./sha256": 9, buffer: 3, lYpoI2: 11 },
        ],
        6: [
          function (e, t, r) {
            (function (r, n, i, o, a, s, l, u, d) {
              var c = e("./helpers");
              function p(e, t) {
                ((e[t >> 5] |= 128 << (t % 32)), (e[14 + (((t + 64) >>> 9) << 4)] = t));
                for (
                  var r = 0x67452301, n = -0x10325477, i = -0x67452302, o = 0x10325476, a = 0;
                  a < e.length;
                  a += 16
                ) {
                  var s = r,
                    l = n,
                    u = i,
                    d = o,
                    r = f(r, n, i, o, e[a + 0], 7, -0x28955b88),
                    o = f(o, r, n, i, e[a + 1], 12, -0x173848aa),
                    i = f(i, o, r, n, e[a + 2], 17, 0x242070db),
                    n = f(n, i, o, r, e[a + 3], 22, -0x3e423112);
                  ((r = f(r, n, i, o, e[a + 4], 7, -0xa83f051)),
                    (o = f(o, r, n, i, e[a + 5], 12, 0x4787c62a)),
                    (i = f(i, o, r, n, e[a + 6], 17, -0x57cfb9ed)),
                    (n = f(n, i, o, r, e[a + 7], 22, -0x2b96aff)),
                    (r = f(r, n, i, o, e[a + 8], 7, 0x698098d8)),
                    (o = f(o, r, n, i, e[a + 9], 12, -0x74bb0851)),
                    (i = f(i, o, r, n, e[a + 10], 17, -42063)),
                    (n = f(n, i, o, r, e[a + 11], 22, -0x76a32842)),
                    (r = f(r, n, i, o, e[a + 12], 7, 0x6b901122)),
                    (o = f(o, r, n, i, e[a + 13], 12, -0x2678e6d)),
                    (i = f(i, o, r, n, e[a + 14], 17, -0x5986bc72)),
                    (r = g(
                      r,
                      (n = f(n, i, o, r, e[a + 15], 22, 0x49b40821)),
                      i,
                      o,
                      e[a + 1],
                      5,
                      -0x9e1da9e
                    )),
                    (o = g(o, r, n, i, e[a + 6], 9, -0x3fbf4cc0)),
                    (i = g(i, o, r, n, e[a + 11], 14, 0x265e5a51)),
                    (n = g(n, i, o, r, e[a + 0], 20, -0x16493856)),
                    (r = g(r, n, i, o, e[a + 5], 5, -0x29d0efa3)),
                    (o = g(o, r, n, i, e[a + 10], 9, 0x2441453)),
                    (i = g(i, o, r, n, e[a + 15], 14, -0x275e197f)),
                    (n = g(n, i, o, r, e[a + 4], 20, -0x182c0438)),
                    (r = g(r, n, i, o, e[a + 9], 5, 0x21e1cde6)),
                    (o = g(o, r, n, i, e[a + 14], 9, -0x3cc8f82a)),
                    (i = g(i, o, r, n, e[a + 3], 14, -0xb2af279)),
                    (n = g(n, i, o, r, e[a + 8], 20, 0x455a14ed)),
                    (r = g(r, n, i, o, e[a + 13], 5, -0x561c16fb)),
                    (o = g(o, r, n, i, e[a + 2], 9, -0x3105c08)),
                    (i = g(i, o, r, n, e[a + 7], 14, 0x676f02d9)),
                    (r = m(
                      r,
                      (n = g(n, i, o, r, e[a + 12], 20, -0x72d5b376)),
                      i,
                      o,
                      e[a + 5],
                      4,
                      -378558
                    )),
                    (o = m(o, r, n, i, e[a + 8], 11, -0x788e097f)),
                    (i = m(i, o, r, n, e[a + 11], 16, 0x6d9d6122)),
                    (n = m(n, i, o, r, e[a + 14], 23, -0x21ac7f4)),
                    (r = m(r, n, i, o, e[a + 1], 4, -0x5b4115bc)),
                    (o = m(o, r, n, i, e[a + 4], 11, 0x4bdecfa9)),
                    (i = m(i, o, r, n, e[a + 7], 16, -0x944b4a0)),
                    (n = m(n, i, o, r, e[a + 10], 23, -0x41404390)),
                    (r = m(r, n, i, o, e[a + 13], 4, 0x289b7ec6)),
                    (o = m(o, r, n, i, e[a + 0], 11, -0x155ed806)),
                    (i = m(i, o, r, n, e[a + 3], 16, -0x2b10cf7b)),
                    (n = m(n, i, o, r, e[a + 6], 23, 0x4881d05)),
                    (r = m(r, n, i, o, e[a + 9], 4, -0x262b2fc7)),
                    (o = m(o, r, n, i, e[a + 12], 11, -0x1924661b)),
                    (i = m(i, o, r, n, e[a + 15], 16, 0x1fa27cf8)),
                    (r = v(
                      r,
                      (n = m(n, i, o, r, e[a + 2], 23, -0x3b53a99b)),
                      i,
                      o,
                      e[a + 0],
                      6,
                      -0xbd6ddbc
                    )),
                    (o = v(o, r, n, i, e[a + 7], 10, 0x432aff97)),
                    (i = v(i, o, r, n, e[a + 14], 15, -0x546bdc59)),
                    (n = v(n, i, o, r, e[a + 5], 21, -0x36c5fc7)),
                    (r = v(r, n, i, o, e[a + 12], 6, 0x655b59c3)),
                    (o = v(o, r, n, i, e[a + 3], 10, -0x70f3336e)),
                    (i = v(i, o, r, n, e[a + 10], 15, -1051523)),
                    (n = v(n, i, o, r, e[a + 1], 21, -0x7a7ba22f)),
                    (r = v(r, n, i, o, e[a + 8], 6, 0x6fa87e4f)),
                    (o = v(o, r, n, i, e[a + 15], 10, -0x1d31920)),
                    (i = v(i, o, r, n, e[a + 6], 15, -0x5cfebcec)),
                    (n = v(n, i, o, r, e[a + 13], 21, 0x4e0811a1)),
                    (r = v(r, n, i, o, e[a + 4], 6, -0x8ac817e)),
                    (o = v(o, r, n, i, e[a + 11], 10, -0x42c50dcb)),
                    (i = v(i, o, r, n, e[a + 2], 15, 0x2ad7d2bb)),
                    (n = v(n, i, o, r, e[a + 9], 21, -0x14792c6f)),
                    (r = y(r, s)),
                    (n = y(n, l)),
                    (i = y(i, u)),
                    (o = y(o, d)));
                }
                return [r, n, i, o];
              }
              function h(e, t, r, n, i, o) {
                return y(((t = y(y(t, e), y(n, o))) << i) | (t >>> (32 - i)), r);
              }
              function f(e, t, r, n, i, o, a) {
                return h((t & r) | (~t & n), e, t, i, o, a);
              }
              function g(e, t, r, n, i, o, a) {
                return h((t & n) | (r & ~n), e, t, i, o, a);
              }
              function m(e, t, r, n, i, o, a) {
                return h(t ^ r ^ n, e, t, i, o, a);
              }
              function v(e, t, r, n, i, o, a) {
                return h(r ^ (t | ~n), e, t, i, o, a);
              }
              function y(e, t) {
                var r = (65535 & e) + (65535 & t);
                return (((e >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r);
              }
              t.exports = function (e) {
                return c.hash(e, p, 16);
              };
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/crypto-browserify/md5.js",
              "/node_modules/gulp-browserify/node_modules/crypto-browserify"
            );
          },
          { "./helpers": 4, buffer: 3, lYpoI2: 11 },
        ],
        7: [
          function (e, t, r) {
            (function (e, r, n, i, o, a, s, l, u) {
              t.exports = function (e) {
                for (var t, r = Array(e), n = 0; n < e; n++)
                  (0 == (3 & n) && (t = 0x100000000 * Math.random()),
                    (r[n] = (t >>> ((3 & n) << 3)) & 255));
                return r;
              };
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/crypto-browserify/rng.js",
              "/node_modules/gulp-browserify/node_modules/crypto-browserify"
            );
          },
          { buffer: 3, lYpoI2: 11 },
        ],
        8: [
          function (e, t, r) {
            (function (r, n, i, o, a, s, l, u, d) {
              var c = e("./helpers");
              function p(e, t) {
                ((e[t >> 5] |= 128 << (24 - (t % 32))), (e[15 + (((t + 64) >> 9) << 4)] = t));
                for (
                  var r,
                    n,
                    i,
                    o = Array(80),
                    a = 0x67452301,
                    s = -0x10325477,
                    l = -0x67452302,
                    u = 0x10325476,
                    d = -0x3c2d1e10,
                    c = 0;
                  c < e.length;
                  c += 16
                ) {
                  for (var p = a, g = s, m = l, v = u, y = d, b = 0; b < 80; b++) {
                    o[b] = b < 16 ? e[c + b] : f(o[b - 3] ^ o[b - 8] ^ o[b - 14] ^ o[b - 16], 1);
                    var w = h(
                        h(
                          f(a, 5),
                          ((w = s),
                          (n = l),
                          (i = u),
                          (r = b) < 20
                            ? (w & n) | (~w & i)
                            : !(r < 40) && r < 60
                              ? (w & n) | (w & i) | (n & i)
                              : w ^ n ^ i)
                        ),
                        h(
                          h(d, o[b]),
                          (r = b) < 20
                            ? 0x5a827999
                            : r < 40
                              ? 0x6ed9eba1
                              : r < 60
                                ? -0x70e44324
                                : -0x359d3e2a
                        )
                      ),
                      d = u,
                      u = l,
                      l = f(s, 30),
                      s = a,
                      a = w;
                  }
                  ((a = h(a, p)), (s = h(s, g)), (l = h(l, m)), (u = h(u, v)), (d = h(d, y)));
                }
                return [a, s, l, u, d];
              }
              function h(e, t) {
                var r = (65535 & e) + (65535 & t);
                return (((e >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r);
              }
              function f(e, t) {
                return (e << t) | (e >>> (32 - t));
              }
              t.exports = function (e) {
                return c.hash(e, p, 20, !0);
              };
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha.js",
              "/node_modules/gulp-browserify/node_modules/crypto-browserify"
            );
          },
          { "./helpers": 4, buffer: 3, lYpoI2: 11 },
        ],
        9: [
          function (e, t, r) {
            (function (r, n, i, o, a, s, l, u, d) {
              function c(e, t) {
                var r = (65535 & e) + (65535 & t);
                return (((e >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r);
              }
              function p(e, t) {
                var r,
                  n = [
                    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
                    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
                    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
                    0xfc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
                    0x6ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
                    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
                    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
                    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
                    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
                  ],
                  i = [
                    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
                    0x1f83d9ab, 0x5be0cd19,
                  ],
                  o = Array(64);
                ((e[t >> 5] |= 128 << (24 - (t % 32))), (e[15 + (((t + 64) >> 9) << 4)] = t));
                for (var a, s, l = 0; l < e.length; l += 16) {
                  for (
                    var u = i[0],
                      d = i[1],
                      p = i[2],
                      h = i[3],
                      m = i[4],
                      v = i[5],
                      y = i[6],
                      b = i[7],
                      w = 0;
                    w < 64;
                    w++
                  )
                    ((o[w] =
                      w < 16
                        ? e[w + l]
                        : c(
                            c(
                              c(f((s = o[w - 2]), 17) ^ f(s, 19) ^ g(s, 10), o[w - 7]),
                              f((s = o[w - 15]), 7) ^ f(s, 18) ^ g(s, 3)
                            ),
                            o[w - 16]
                          )),
                      (r = c(
                        c(c(c(b, f((s = m), 6) ^ f(s, 11) ^ f(s, 25)), (m & v) ^ (~m & y)), n[w]),
                        o[w]
                      )),
                      (a = c(f((a = u), 2) ^ f(a, 13) ^ f(a, 22), (u & d) ^ (u & p) ^ (d & p))),
                      (b = y),
                      (y = v),
                      (v = m),
                      (m = c(h, r)),
                      (h = p),
                      (p = d),
                      (d = u),
                      (u = c(r, a)));
                  ((i[0] = c(u, i[0])),
                    (i[1] = c(d, i[1])),
                    (i[2] = c(p, i[2])),
                    (i[3] = c(h, i[3])),
                    (i[4] = c(m, i[4])),
                    (i[5] = c(v, i[5])),
                    (i[6] = c(y, i[6])),
                    (i[7] = c(b, i[7])));
                }
                return i;
              }
              var h = e("./helpers"),
                f = function (e, t) {
                  return (e >>> t) | (e << (32 - t));
                },
                g = function (e, t) {
                  return e >>> t;
                };
              t.exports = function (e) {
                return h.hash(e, p, 32, !0);
              };
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha256.js",
              "/node_modules/gulp-browserify/node_modules/crypto-browserify"
            );
          },
          { "./helpers": 4, buffer: 3, lYpoI2: 11 },
        ],
        10: [
          function (e, t, r) {
            (function (e, t, n, i, o, a, s, l, u) {
              ((r.read = function (e, t, r, n, i) {
                var o,
                  a,
                  s = 8 * i - n - 1,
                  l = (1 << s) - 1,
                  u = l >> 1,
                  d = -7,
                  c = r ? i - 1 : 0,
                  p = r ? -1 : 1,
                  i = e[t + c];
                for (
                  c += p, o = i & ((1 << -d) - 1), i >>= -d, d += s;
                  0 < d;
                  o = 256 * o + e[t + c], c += p, d -= 8
                );
                for (
                  a = o & ((1 << -d) - 1), o >>= -d, d += n;
                  0 < d;
                  a = 256 * a + e[t + c], c += p, d -= 8
                );
                if (0 === o) o = 1 - u;
                else {
                  if (o === l) return a ? NaN : (1 / 0) * (i ? -1 : 1);
                  ((a += Math.pow(2, n)), (o -= u));
                }
                return (i ? -1 : 1) * a * Math.pow(2, o - n);
              }),
                (r.write = function (e, t, r, n, i, o) {
                  var a,
                    s,
                    l = 8 * o - i - 1,
                    u = (1 << l) - 1,
                    d = u >> 1,
                    c = 5960464477539062e-23 * (23 === i),
                    p = n ? 0 : o - 1,
                    h = n ? 1 : -1,
                    o = +(t < 0 || (0 === t && 1 / t < 0));
                  for (
                    isNaN((t = Math.abs(t))) || t === 1 / 0
                      ? ((s = +!!isNaN(t)), (a = u))
                      : ((a = Math.floor(Math.log(t) / Math.LN2)),
                        t * (n = Math.pow(2, -a)) < 1 && (a--, (n *= 2)),
                        2 <= (t += 1 <= a + d ? c / n : c * Math.pow(2, 1 - d)) * n &&
                          (a++, (n /= 2)),
                        u <= a + d
                          ? ((s = 0), (a = u))
                          : 1 <= a + d
                            ? ((s = (t * n - 1) * Math.pow(2, i)), (a += d))
                            : ((s = t * Math.pow(2, d - 1) * Math.pow(2, i)), (a = 0)));
                    8 <= i;
                    e[r + p] = 255 & s, p += h, s /= 256, i -= 8
                  );
                  for (
                    a = (a << i) | s, l += i;
                    0 < l;
                    e[r + p] = 255 & a, p += h, a /= 256, l -= 8
                  );
                  e[r + p - h] |= 128 * o;
                }));
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/ieee754/index.js",
              "/node_modules/gulp-browserify/node_modules/ieee754"
            );
          },
          { buffer: 3, lYpoI2: 11 },
        ],
        11: [
          function (e, t, r) {
            (function (e, r, n, i, o, a, s, l, u) {
              var d, c, p;
              function h() {}
              (((e = t.exports = {}).nextTick =
                ((c = "u" > typeof window && window.setImmediate),
                (p = "u" > typeof window && window.postMessage && window.addEventListener),
                c
                  ? function (e) {
                      return window.setImmediate(e);
                    }
                  : p
                    ? ((d = []),
                      window.addEventListener(
                        "message",
                        function (e) {
                          var t = e.source;
                          (t !== window && null !== t) ||
                            "process-tick" !== e.data ||
                            (e.stopPropagation(), 0 < d.length && d.shift()());
                        },
                        !0
                      ),
                      function (e) {
                        (d.push(e), window.postMessage("process-tick", "*"));
                      })
                    : function (e) {
                        setTimeout(e, 0);
                      })),
                (e.title = "browser"),
                (e.browser = !0),
                (e.env = {}),
                (e.argv = []),
                (e.on = h),
                (e.addListener = h),
                (e.once = h),
                (e.off = h),
                (e.removeListener = h),
                (e.removeAllListeners = h),
                (e.emit = h),
                (e.binding = function (e) {
                  throw Error("process.binding is not supported");
                }),
                (e.cwd = function () {
                  return "/";
                }),
                (e.chdir = function (e) {
                  throw Error("process.chdir is not supported");
                }));
            }).call(
              this,
              e("lYpoI2"),
              "u" > typeof self ? self : "u" > typeof window ? window : {},
              e("buffer").Buffer,
              arguments[3],
              arguments[4],
              arguments[5],
              arguments[6],
              "/node_modules/gulp-browserify/node_modules/process/browser.js",
              "/node_modules/gulp-browserify/node_modules/process"
            );
          },
          { buffer: 3, lYpoI2: 11 },
        ],
      },
      {},
      [1]
    )(1);
  },
  34451,
  (e) => {
    "use strict";
    let t, r, n, i, o, a, s, l, u, d, c, p;
    var h,
      f,
      g,
      m,
      v,
      y,
      b,
      w,
      _,
      j,
      k,
      S,
      I,
      E,
      O,
      C,
      M,
      P,
      A,
      z,
      D,
      L,
      N,
      T,
      B,
      R,
      $,
      F,
      W,
      H,
      U,
      Z,
      V,
      q,
      Y,
      K,
      X,
      G,
      J,
      Q,
      ee,
      et,
      er,
      en,
      ei,
      eo,
      ea,
      es,
      el,
      eu,
      ed,
      ec,
      ep,
      eh,
      ef,
      eg,
      em,
      ev,
      ey,
      eb,
      ex,
      ew,
      e_,
      ej,
      ek,
      eS,
      eI,
      eE,
      eO,
      eC,
      eM,
      eP,
      eA,
      ez,
      eD,
      eL,
      eN,
      eT,
      eB,
      eR,
      e$,
      eF,
      eW,
      eH,
      eU,
      eZ,
      eV,
      eq,
      eY,
      eK,
      eX,
      eG,
      eJ,
      eQ,
      e0,
      e1,
      e2,
      e4,
      e5,
      e6,
      e3,
      e8,
      e7,
      e9,
      te,
      tt,
      tr,
      tn,
      ti,
      to,
      ta,
      ts,
      tl,
      tu,
      td,
      tc,
      tp,
      th,
      tf,
      tg,
      tm,
      tv,
      ty,
      tb,
      tx,
      tw,
      t_,
      tj,
      tk,
      tS,
      tI,
      tE,
      tO,
      tC,
      tM,
      tP,
      tA,
      tz,
      tD,
      tL,
      tN,
      tT,
      tB,
      tR,
      t$,
      tF,
      tW,
      tH,
      tU,
      tZ,
      tV,
      tq,
      tY,
      tK,
      tX,
      tG,
      tJ,
      tQ,
      t0,
      t1,
      t2,
      t4,
      t5,
      t6,
      t3,
      t8,
      t7,
      t9,
      re,
      rt,
      rr,
      rn,
      ri,
      ro,
      ra = e.i(43476),
      rs = e.i(71645);
    e.i(47167);
    var rl = e.i(72609),
      ru = e.i(29801),
      rd = Object.create,
      rc = Object.defineProperty,
      rp = Object.defineProperties,
      rh = Object.getOwnPropertyDescriptor,
      rf = Object.getOwnPropertyDescriptors,
      rg = Object.getOwnPropertyNames,
      rm = Object.getOwnPropertySymbols,
      rv = Object.getPrototypeOf,
      ry = Object.prototype.hasOwnProperty,
      rb = Object.prototype.propertyIsEnumerable,
      rx = (e, t, r) =>
        t in e
          ? rc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      rw = (e, t) => {
        for (var r in t || (t = {})) ry.call(t, r) && rx(e, r, t[r]);
        if (rm) for (var r of rm(t)) rb.call(t, r) && rx(e, r, t[r]);
        return e;
      },
      r_ = (e, t) => {
        var r = {};
        for (var n in e) ry.call(e, n) && 0 > t.indexOf(n) && (r[n] = e[n]);
        if (null != e && rm)
          for (var n of rm(e)) 0 > t.indexOf(n) && rb.call(e, n) && (r[n] = e[n]);
        return r;
      },
      rj = (e, t, r) =>
        new Promise((n, i) => {
          var o = (e) => {
              try {
                s(r.next(e));
              } catch (e) {
                i(e);
              }
            },
            a = (e) => {
              try {
                s(r.throw(e));
              } catch (e) {
                i(e);
              }
            },
            s = (e) => (e.done ? n(e.value) : Promise.resolve(e.value).then(o, a));
          s((r = r.apply(e, t)).next());
        }),
      rk =
        ((r = { "../tsup-config/react-import.js"() {} }),
        function () {
          return (r && (n = (0, r[rg(r)[0]])((r = 0))), n);
        });
    (rk(), rk(), rk());
    var rS = (e, t) =>
        Object.keys(t).reduce((e, r) => ("slot" === t[r].type ? rw({ [r]: [] }, e) : e), e),
      rI = (e) => !!e && "function" == typeof e.then,
      rE = (e) => e.reduce((e, t) => rw(rw({}, e), t), {}),
      rO = ({
        value: e,
        fields: t,
        mappers: r,
        propKey: n = "",
        propPath: i = "",
        id: o = "",
        config: a,
        recurseSlots: s = !1,
      }) => {
        var l, u, d;
        let c = null == (l = t[n]) ? void 0 : l.type,
          p = r[c];
        if (p && "slot" === c) {
          let l = e || [],
            u = s
              ? l.map((e) => {
                  var t;
                  let n = a.components[e.type];
                  if (!n) throw Error(`Could not find component config for ${e.type}`);
                  let i = null != (t = n.fields) ? t : {};
                  return rO({
                    value: rp(rw({}, e), rf({ props: rS(e.props, i) })),
                    fields: i,
                    mappers: r,
                    id: e.props.id,
                    config: a,
                    recurseSlots: s,
                  });
                })
              : l;
          return u.some(rI)
            ? Promise.all(u)
            : p({ value: u, parentId: o, propName: i, field: t[n], propPath: i });
        }
        if (p && t[n]) return p({ value: e, parentId: o, propName: n, field: t[n], propPath: i });
        if (e && "object" == typeof e)
          if (!Array.isArray(e))
            return "$$typeof" in e
              ? e
              : rC({
                  value: e,
                  fields:
                    (null == (d = t[n]) ? void 0 : d.type) === "object" ? t[n].objectFields : t,
                  mappers: r,
                  id: o,
                  getPropPath: (e) => `${i}.${e}`,
                  config: a,
                  recurseSlots: s,
                });
          else {
            let l = (null == (u = t[n]) ? void 0 : u.type) === "array" ? t[n].arrayFields : null;
            if (!l) return e;
            let d = e.map((e, t) =>
              rO({
                value: e,
                fields: l,
                mappers: r,
                propKey: n,
                propPath: `${i}[${t}]`,
                id: o,
                config: a,
                recurseSlots: s,
              })
            );
            return d.some(rI) ? Promise.all(d) : d;
          }
        return e;
      },
      rC = ({
        value: e,
        fields: t,
        mappers: r,
        id: n,
        getPropPath: i,
        config: o,
        recurseSlots: a,
      }) => {
        let s = Object.entries(e).map(([e, s]) => {
          let l = rO({
            value: s,
            fields: t,
            mappers: r,
            propKey: e,
            propPath: i(e),
            id: n,
            config: o,
            recurseSlots: a,
          });
          return rI(l) ? l.then((t) => ({ [e]: t })) : { [e]: l };
        }, {});
        return s.some(rI) ? Promise.all(s).then(rE) : rE(s);
      };
    function rM(e, t, r, n = !1) {
      var i, o, a, s, l;
      let u = "type" in e ? e.type : "root",
        d = "root" === u ? r.root : null == (i = r.components) ? void 0 : i[u],
        c = rC({
          value: rS(
            null != (o = e.props) ? o : {},
            null != (a = null == d ? void 0 : d.fields) ? a : {}
          ),
          fields: null != (s = null == d ? void 0 : d.fields) ? s : {},
          mappers: t,
          id: e.props && null != (l = e.props.id) ? l : "root",
          getPropPath: (e) => e,
          config: r,
          recurseSlots: n,
        });
      return rI(c)
        ? c.then((t) => rp(rw({}, e), rf({ props: t })))
        : rp(rw({}, e), rf({ props: c }));
    }
    function rP(e, t, r) {
      var n, i;
      let o = (e) =>
        rM(
          e,
          {
            slot: ({ value: e, parentId: t, propName: n }) => {
              var i;
              return null != (i = r(e, { parentId: t, propName: n })) ? i : e;
            },
          },
          t,
          !0
        );
      if ("props" in e) return o(e);
      let a = null != (n = e.zones) ? n : {},
        s = e.content.map(o);
      return {
        root: o(e.root),
        content: null != (i = r(s, { parentId: "root", propName: "default-zone" })) ? i : s,
        zones: Object.keys(a).reduce((e, t) => rp(rw({}, e), rf({ [t]: a[t].map(o) })), {}),
      };
    }
    (rk(), rk(), rk());
    var rA = [
        { width: 360, height: "auto", icon: "Smartphone", label: "Small" },
        { width: 768, height: "auto", icon: "Tablet", label: "Medium" },
        { width: 1280, height: "auto", icon: "Monitor", label: "Large" },
      ],
      rz = {
        data: { content: [], root: {}, zones: {} },
        ui: {
          leftSideBarVisible: !0,
          rightSideBarVisible: !0,
          arrayState: {},
          itemSelector: null,
          componentList: {},
          isDragging: !1,
          previewMode: "edit",
          viewports: {
            current: { width: rA[0].width, height: rA[0].height || "auto" },
            options: [],
            controlsVisible: !0,
          },
          field: { focus: null },
        },
        indexes: { nodes: {}, zones: {} },
      };
    (rk(), rk(), rk(), rk());
    var rD = "root",
      rL = "default-zone",
      rN = `${rD}:${rL}`;
    (rk(), rk());
    var { flatten: rT, unflatten: rB } = rl.default;
    function rR(e, t, r = (e) => e, n = (e) => e) {
      var i;
      let o = {},
        a = {},
        s = {},
        l = (e, t, n, i, o) => {
          var s;
          let [l] = t.split(":"),
            d = (null != (s = r(n, t, i)) ? s : n) || [],
            [c, p] = t.split(":"),
            h = `${o || l}:${p}`,
            f = d.map((t, r) => u(t, [...e, h], r));
          return ((a[h] = { contentIds: f.map((e) => e.props.id), type: i }), [h, f]);
        },
        u = (r, i, a) => {
          var u, d;
          let c = n(r, i, a);
          if (!c) return r;
          let p = c.props.id,
            h = rp(
              rw(
                {},
                rM(
                  c,
                  {
                    slot: ({ value: e, parentId: t, propPath: r }) => {
                      let [n, o] = l(i, `${t}:${r}`, e, "slot", t);
                      return o;
                    },
                  },
                  t
                ).props
              ),
              rf({ id: p })
            );
          (function (e, t, r, n = []) {
            Object.entries(t.zones || {}).forEach(([t, i]) => {
              let [o] = t ? (t && t.indexOf(":") > -1 ? t.split(":") : [rN, t]) : [];
              o === e.props.id && r(n, t, i);
            });
          })(
            r,
            e.data,
            (e, t, r) => {
              let [n, i] = l(e, t, r, "dropzone", p);
              o[n] = i;
            },
            i
          );
          let f = rp(rw({}, r), rf({ props: h })),
            g = i[i.length - 1],
            [m, v] = g ? g.split(":") : [null, ""];
          s[p] = {
            data: f,
            flatData:
              ((u = f),
              (d = t),
              rp(rw({}, u), rf({ props: rT(rM(u, { slot: () => null }, d).props) }))),
            path: i,
            parentId: m,
            zone: v,
          };
          let y = rp(rw({}, f), rf({ props: rw({}, f.props) }));
          return ("root" === h.id && (delete y.type, delete y.props.id), y);
        },
        d = e.data.zones || {},
        [c, p] = l([], rN, e.data.content, "root"),
        h = Object.keys(o);
      Object.keys(d || {}).forEach((e) => {
        let [t] = e.split(":");
        if (h.includes(e)) return;
        let [r, n] = l([rN], e, d[e], "dropzone", t);
        o[e] = n;
      }, o);
      let f = u(
          {
            type: "root",
            props: rp(
              rw({}, null != (i = e.data.root.props) ? i : e.data.root),
              rf({ id: "root" })
            ),
          },
          [],
          -1
        ),
        g = rp(rw({}, e.data.root), rf({ props: f.props }));
      return rp(
        rw({}, e),
        rf({
          data: { root: g, content: p, zones: rw(rw({}, e.data.zones), o) },
          indexes: { nodes: rw(rw({}, e.indexes.nodes), s), zones: rw(rw({}, e.indexes.zones), a) },
        })
      );
    }
    (rk(), rk(), rk(), rk(), rk());
    var r$ = (e, t) =>
        e
          ? Object.keys(e.props || {}).reduce((r, n) => {
              let i = (null == e ? void 0 : e.props) || {},
                o = (null == t ? void 0 : t.props) || {};
              return rp(rw({}, r), rf({ [n]: !(0, ru.default)(o[n], i[n]) }));
            }, {})
          : {},
      rF = {},
      rW = (e, t, ...r) =>
        rj(void 0, [e, t, ...r], function* (e, t, r = {}, n, i, o = "replace") {
          let a = "type" in e && "root" !== e.type ? t.components[e.type] : t.root,
            s = rw({}, e),
            l = (null == a ? void 0 : a.resolveData) && e.props,
            u = "id" in e.props ? e.props.id : "root";
          if (l) {
            let { item: t = null, resolved: i = {} } = rF[u] || {};
            if ("force" !== o && e && (0, ru.default)(e, t)) return { node: i, didChange: !1 };
            let l = r$(e, t);
            n && n(e);
            let { props: d, readOnly: c = {} } = yield a.resolveData(e, {
              changed: l,
              lastData: t,
              metadata: rw(rw({}, r), a.metadata),
              trigger: o,
            });
            ((s.props = rw(rw({}, e.props), d)), Object.keys(c).length && (s.readOnly = c));
          }
          let d = yield rM(
            s,
            {
              slot: (e) =>
                rj(void 0, [e], function* ({ value: e }) {
                  return yield Promise.all(
                    e.map((e) =>
                      rj(void 0, null, function* () {
                        return (yield rW(e, t, r, n, i, o)).node;
                      })
                    )
                  );
                }),
            },
            t
          );
          return (
            l && i && i(s),
            (rF[u] = { item: e, resolved: d }),
            { node: d, didChange: !(0, ru.default)(e, d) }
          );
        });
    (rk(), rk());
    var rH = (e, t) => {
      if (t === rN) return e;
      let r = rp(rw({}, e), rf({ zones: e.zones ? rw({}, e.zones) : {} }));
      return ((r.zones[t] = r.zones[t] || []), r);
    };
    function rU(e, t, r, n, i) {
      let o = (0, rs.useMemo)(
          () =>
            Object.keys(r).reduce((e, t) => {
              let o, a;
              return (
                (o = rw({}, e)),
                (a = {
                  [t]: (e) => {
                    var { parentId: o } = e,
                      a = r_(e, ["parentId"]);
                    let s = a.propPath.replace(/\[\d+\]/g, "[*]"),
                      l =
                        (null == n ? void 0 : n[a.propPath]) ||
                        (null == n ? void 0 : n[s]) ||
                        i ||
                        !1,
                      u = r[t];
                    return null == u
                      ? void 0
                      : u(rp(rw({}, a), rf({ isReadOnly: l, componentId: o })));
                  },
                }),
                rp(o, rf(a))
              );
            }, {}),
          [r, n, i]
        ),
        a = (0, rs.useMemo)(() => rM(t, o, e).props, [e, t, o]);
      return (0, rs.useMemo)(() => rw(rw({}, t.props), a), [t.props, a]);
    }
    (rk(), rk());
    var rZ = (e, t = e) => ({
      slot: ({ value: r, propName: n, field: i, isReadOnly: o }) => {
        let a = o ? t : e;
        return (e) =>
          a(
            rp(
              rw(
                {
                  allow: (null == i ? void 0 : i.type) === "slot" ? i.allow : [],
                  disallow: (null == i ? void 0 : i.type) === "slot" ? i.disallow : [],
                },
                e
              ),
              rf({ zone: n, content: r })
            )
          );
      },
    });
    function rV(e, t, r, n = r, i, o) {
      return rU(e, t, rZ(r, n), i, o);
    }
    (rk(), rk());
    var rq = (e) => (0, ra.jsx)(rK, rw({}, e)),
      rY = ({ config: e, item: t, metadata: r }) => {
        let n,
          i,
          o = e.components[t.type],
          a = rV(e, t, (t) => (0, ra.jsx)(rq, rp(rw({}, t), rf({ config: e, metadata: r }))));
        return (0, ra.jsx)(
          o.render,
          ((n = rw({}, a)),
          (i = { puck: rp(rw({}, a.puck), rf({ metadata: r || {} })) }),
          rp(n, rf(i)))
        );
      },
      rK = (0, rs.forwardRef)(function (
        { className: e, style: t, content: r, config: n, metadata: i },
        o
      ) {
        return (0, ra.jsx)("div", {
          className: e,
          style: t,
          ref: o,
          children: r.map((e) =>
            n.components[e.type]
              ? (0, ra.jsx)(rY, { config: n, item: e, metadata: i }, e.props.id)
              : null
          ),
        });
      }),
      rX = ra;
    let rG = "u" > typeof crypto && crypto.randomUUID && crypto.randomUUID.bind(crypto),
      rJ = new Uint8Array(16),
      rQ = [];
    for (let e = 0; e < 256; ++e) rQ.push((e + 256).toString(16).slice(1));
    let r0 = function (e, r, n) {
        if (rG && !r && !e) return rG();
        let i =
          (e = e || {}).random ||
          (
            e.rng ||
            function () {
              if (
                !t &&
                !(t =
                  "u" > typeof crypto &&
                  crypto.getRandomValues &&
                  crypto.getRandomValues.bind(crypto))
              )
                throw Error(
                  "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported"
                );
              return t(rJ);
            }
          )();
        if (((i[6] = (15 & i[6]) | 64), (i[8] = (63 & i[8]) | 128), r)) {
          n = n || 0;
          for (let e = 0; e < 16; ++e) r[n + e] = i[e];
          return r;
        }
        return (function (e, t = 0) {
          return (
            rQ[e[t + 0]] +
            rQ[e[t + 1]] +
            rQ[e[t + 2]] +
            rQ[e[t + 3]] +
            "-" +
            rQ[e[t + 4]] +
            rQ[e[t + 5]] +
            "-" +
            rQ[e[t + 6]] +
            rQ[e[t + 7]] +
            "-" +
            rQ[e[t + 8]] +
            rQ[e[t + 9]] +
            "-" +
            rQ[e[t + 10]] +
            rQ[e[t + 11]] +
            rQ[e[t + 12]] +
            rQ[e[t + 13]] +
            rQ[e[t + 14]] +
            rQ[e[t + 15]]
          );
        })(i);
      },
      r1 = (e) => {
        let t,
          r = new Set(),
          n = (e, n) => {
            let i = "function" == typeof e ? e(t) : e;
            if (!Object.is(i, t)) {
              let e = t;
              ((t = (null != n ? n : "object" != typeof i || null === i)
                ? i
                : Object.assign({}, t, i)),
                r.forEach((r) => r(t, e)));
            }
          },
          i = () => t,
          o = {
            setState: n,
            getState: i,
            getInitialState: () => a,
            subscribe: (e) => (r.add(e), () => r.delete(e)),
          },
          a = (t = e(n, i, o));
        return o;
      },
      r2 = (e) => (e ? r1(e) : r1),
      r4 = (e) => e;
    function r5(e, t = r4) {
      let r = rs.default.useSyncExternalStore(
        e.subscribe,
        rs.default.useCallback(() => t(e.getState()), [e, t]),
        rs.default.useCallback(() => t(e.getInitialState()), [e, t])
      );
      return (rs.default.useDebugValue(r), r);
    }
    let r6 = (e) => {
        let t = r2(e),
          r = (e) => r5(t, e);
        return (Object.assign(r, t), r);
      },
      r3 = (e) => (e ? r6(e) : r6),
      r8 = (e) => (t, r, n) => {
        let i = n.subscribe;
        return (
          (n.subscribe = (e, t, r) => {
            let o = e;
            if (t) {
              let i = (null == r ? void 0 : r.equalityFn) || Object.is,
                a = e(n.getState());
              ((o = (r) => {
                let n = e(r);
                if (!i(a, n)) {
                  let e = a;
                  t((a = n), e);
                }
              }),
                (null == r ? void 0 : r.fireImmediately) && t(a, a));
            }
            return i(o);
          }),
          e(t, r, n)
        );
      };
    var r7 = Symbol.for("preact-signals");
    function r9() {
      if (no > 1) no--;
      else {
        var e,
          t = !1,
          r = nu;
        for (nu = void 0; void 0 !== r; ) (r.S.v === r.v && (r.S.i = r.i), (r = r.o));
        for (; void 0 !== ni; ) {
          var n = ni;
          for (ni = void 0, na++; void 0 !== n; ) {
            var i = n.u;
            if (((n.u = void 0), (n.f &= -3), !(8 & n.f) && nf(n)))
              try {
                n.c();
              } catch (r) {
                t || ((e = r), (t = !0));
              }
            n = i;
          }
        }
        if (((na = 0), no--, t)) throw e;
      }
    }
    function ne(e) {
      if (no > 0) return e();
      ((nl = ++ns), no++);
      try {
        return e();
      } finally {
        r9();
      }
    }
    var nt = void 0;
    function nr(e) {
      var t = nt;
      nt = void 0;
      try {
        return e();
      } finally {
        nt = t;
      }
    }
    var nn,
      ni = void 0,
      no = 0,
      na = 0,
      ns = 0,
      nl = 0,
      nu = void 0,
      nd = 0;
    function nc(e) {
      if (void 0 !== nt) {
        var t = e.n;
        if (void 0 === t || t.t !== nt)
          return (
            (t = { i: 0, S: e, p: nt.s, n: void 0, t: nt, e: void 0, x: void 0, r: t }),
            void 0 !== nt.s && (nt.s.n = t),
            (nt.s = t),
            (e.n = t),
            32 & nt.f && e.S(t),
            t
          );
        if (-1 === t.i)
          return (
            (t.i = 0),
            void 0 !== t.n &&
              ((t.n.p = t.p),
              void 0 !== t.p && (t.p.n = t.n),
              (t.p = nt.s),
              (t.n = void 0),
              (nt.s.n = t),
              (nt.s = t)),
            t
          );
      }
    }
    function np(e, t) {
      ((this.v = e),
        (this.i = 0),
        (this.n = void 0),
        (this.t = void 0),
        (this.l = 0),
        (this.W = null == t ? void 0 : t.watched),
        (this.Z = null == t ? void 0 : t.unwatched),
        (this.name = null == t ? void 0 : t.name));
    }
    function nh(e, t) {
      return new np(e, t);
    }
    function nf(e) {
      for (var t = e.s; void 0 !== t; t = t.n)
        if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
      return !1;
    }
    function ng(e) {
      for (var t = e.s; void 0 !== t; t = t.n) {
        var r = t.S.n;
        if ((void 0 !== r && (t.r = r), (t.S.n = t), (t.i = -1), void 0 === t.n)) {
          e.s = t;
          break;
        }
      }
    }
    function nm(e) {
      for (var t = e.s, r = void 0; void 0 !== t; ) {
        var n = t.p;
        (-1 === t.i
          ? (t.S.U(t), void 0 !== n && (n.n = t.n), void 0 !== t.n && (t.n.p = n))
          : (r = t),
          (t.S.n = t.r),
          void 0 !== t.r && (t.r = void 0),
          (t = n));
      }
      e.s = r;
    }
    function nv(e, t) {
      (np.call(this, void 0),
        (this.x = e),
        (this.s = void 0),
        (this.g = nd - 1),
        (this.f = 4),
        (this.W = null == t ? void 0 : t.watched),
        (this.Z = null == t ? void 0 : t.unwatched),
        (this.name = null == t ? void 0 : t.name));
    }
    function ny(e) {
      var t = e.m;
      if (((e.m = void 0), "function" == typeof t)) {
        no++;
        var r = nt;
        nt = void 0;
        try {
          t();
        } catch (t) {
          throw ((e.f &= -2), (e.f |= 8), nb(e), t);
        } finally {
          ((nt = r), r9());
        }
      }
    }
    function nb(e) {
      for (var t = e.s; void 0 !== t; t = t.n) t.S.U(t);
      ((e.x = void 0), (e.s = void 0), ny(e));
    }
    function nx(e) {
      if (nt !== this) throw Error("Out-of-order effect");
      (nm(this), (nt = e), (this.f &= -2), 8 & this.f && nb(this), r9());
    }
    function nw(e, t) {
      ((this.x = e),
        (this.m = void 0),
        (this.s = void 0),
        (this.u = void 0),
        (this.f = 32),
        (this.name = null == t ? void 0 : t.name),
        nn && nn.push(this));
    }
    function n_(e, t) {
      var r = new nw(e, t);
      try {
        r.c();
      } catch (e) {
        throw (r.d(), e);
      }
      var n = r.d.bind(r);
      return ((n[Symbol.dispose] = n), n);
    }
    ((np.prototype.brand = r7),
      (np.prototype.h = function () {
        return !0;
      }),
      (np.prototype.S = function (e) {
        var t = this,
          r = this.t;
        r !== e &&
          void 0 === e.e &&
          ((e.x = r),
          (this.t = e),
          void 0 !== r
            ? (r.e = e)
            : nr(function () {
                var e;
                null == (e = t.W) || e.call(t);
              }));
      }),
      (np.prototype.U = function (e) {
        var t = this;
        if (void 0 !== this.t) {
          var r = e.e,
            n = e.x;
          (void 0 !== r && ((r.x = n), (e.e = void 0)),
            void 0 !== n && ((n.e = r), (e.x = void 0)),
            e === this.t &&
              ((this.t = n),
              void 0 === n &&
                nr(function () {
                  var e;
                  null == (e = t.Z) || e.call(t);
                })));
        }
      }),
      (np.prototype.subscribe = function (e) {
        var t = this;
        return n_(
          function () {
            var r = t.value,
              n = nt;
            nt = void 0;
            try {
              e(r);
            } finally {
              nt = n;
            }
          },
          { name: "sub" }
        );
      }),
      (np.prototype.valueOf = function () {
        return this.value;
      }),
      (np.prototype.toString = function () {
        return this.value + "";
      }),
      (np.prototype.toJSON = function () {
        return this.value;
      }),
      (np.prototype.peek = function () {
        var e = nt;
        nt = void 0;
        try {
          return this.value;
        } finally {
          nt = e;
        }
      }),
      Object.defineProperty(np.prototype, "value", {
        get: function () {
          var e = nc(this);
          return (void 0 !== e && (e.i = this.i), this.v);
        },
        set: function (e) {
          if (e !== this.v) {
            if (na > 100) throw Error("Cycle detected");
            (0 !== no &&
              0 === na &&
              this.l !== nl &&
              ((this.l = nl), (nu = { S: this, v: this.v, i: this.i, o: nu })),
              (this.v = e),
              this.i++,
              nd++,
              no++);
            try {
              for (var t = this.t; void 0 !== t; t = t.x) t.t.N();
            } finally {
              r9();
            }
          }
        },
      }),
      (nv.prototype = new np()),
      (nv.prototype.h = function () {
        if (((this.f &= -3), 1 & this.f)) return !1;
        if (32 == (36 & this.f) || ((this.f &= -5), this.g === nd)) return !0;
        if (((this.g = nd), (this.f |= 1), this.i > 0 && !nf(this))) return ((this.f &= -2), !0);
        var e = nt;
        try {
          (ng(this), (nt = this));
          var t = this.x();
          (16 & this.f || this.v !== t || 0 === this.i) &&
            ((this.v = t), (this.f &= -17), this.i++);
        } catch (e) {
          ((this.v = e), (this.f |= 16), this.i++);
        }
        return ((nt = e), nm(this), (this.f &= -2), !0);
      }),
      (nv.prototype.S = function (e) {
        if (void 0 === this.t) {
          this.f |= 36;
          for (var t = this.s; void 0 !== t; t = t.n) t.S.S(t);
        }
        np.prototype.S.call(this, e);
      }),
      (nv.prototype.U = function (e) {
        if (void 0 !== this.t && (np.prototype.U.call(this, e), void 0 === this.t)) {
          this.f &= -33;
          for (var t = this.s; void 0 !== t; t = t.n) t.S.U(t);
        }
      }),
      (nv.prototype.N = function () {
        if (!(2 & this.f)) {
          this.f |= 6;
          for (var e = this.t; void 0 !== e; e = e.x) e.t.N();
        }
      }),
      Object.defineProperty(nv.prototype, "value", {
        get: function () {
          if (1 & this.f) throw Error("Cycle detected");
          var e = nc(this);
          if ((this.h(), void 0 !== e && (e.i = this.i), 16 & this.f)) throw this.v;
          return this.v;
        },
      }),
      (nw.prototype.c = function () {
        var e = this.S();
        try {
          if (8 & this.f || void 0 === this.x) return;
          var t = this.x();
          "function" == typeof t && (this.m = t);
        } finally {
          e();
        }
      }),
      (nw.prototype.S = function () {
        if (1 & this.f) throw Error("Cycle detected");
        ((this.f |= 1), (this.f &= -9), ny(this), ng(this), no++);
        var e = nt;
        return ((nt = this), nx.bind(this, e));
      }),
      (nw.prototype.N = function () {
        2 & this.f || ((this.f |= 2), (this.u = ni), (ni = this));
      }),
      (nw.prototype.d = function () {
        ((this.f |= 8), 1 & this.f || nb(this));
      }),
      (nw.prototype.dispose = function () {
        this.d();
      }));
    var nj = Object.create,
      nk = Object.defineProperty,
      nS = Object.defineProperties,
      nI = Object.getOwnPropertyDescriptor,
      nE = Object.getOwnPropertyDescriptors,
      nO = Object.getOwnPropertySymbols,
      nC = Object.prototype.hasOwnProperty,
      nM = Object.prototype.propertyIsEnumerable,
      nP = (e) => {
        throw TypeError(e);
      },
      nA = (e, t, r) =>
        t in e
          ? nk(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      nz = (e, t) => nk(e, "name", { value: t, configurable: !0 }),
      nD = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      nL = (e) => (void 0 !== e && "function" != typeof e ? nP("Function expected") : e),
      nN = (e, t, r, n, i) => ({
        kind: nD[e],
        name: t,
        metadata: n,
        addInitializer: (e) => (r._ ? nP("Already initialized") : i.push(nL(e || null))),
      }),
      nT = (e, t) => {
        let r, n;
        return nA(t, ((r = "metadata"), (n = Symbol[r]) ? n : Symbol.for("Symbol." + r)), e[3]);
      },
      nB = (e, t, r, n) => {
        for (var i = 0, o = e[t >> 1], a = o && o.length; i < a; i++)
          1 & t ? o[i].call(r) : (n = o[i].call(r, n));
        return n;
      },
      nR = (e, t, r, n, i, o) => {
        var a,
          s,
          l,
          u,
          d,
          c = 7 & t,
          p = !!(8 & t),
          h = !!(16 & t),
          f = c > 3 ? e.length + 1 : c ? (p ? 1 : 2) : 0,
          g = nD[c + 5],
          m = c > 3 && (e[f - 1] = []),
          v = e[f] || (e[f] = []),
          y =
            c &&
            (h || p || (i = i.prototype),
            c < 5 &&
              (c > 3 || !h) &&
              nI(
                c < 4
                  ? i
                  : {
                      get [r]() {
                        return nW(this, o);
                      },
                      set [r](x) {
                        return nU(this, o, x);
                      },
                    },
                r
              ));
        c ? h && c < 4 && nz(o, (c > 2 ? "set " : c > 1 ? "get " : "") + r) : nz(i, r);
        for (var b = n.length - 1; b >= 0; b--)
          ((u = nN(c, r, (l = {}), e[3], v)),
            c &&
              ((u.static = p),
              (u.private = h),
              (d = u.access = { has: h ? (e) => nF(i, e) : (e) => r in e }),
              3 ^ c &&
                (d.get = h ? (e) => (1 ^ c ? nW : nZ)(e, i, 4 ^ c ? o : y.get) : (e) => e[r]),
              c > 2 &&
                (d.set = h ? (e, t) => nU(e, i, t, 4 ^ c ? o : y.set) : (e, t) => (e[r] = t))),
            (s = (0, n[b])(
              c ? (c < 4 ? (h ? o : y[g]) : c > 4 ? void 0 : { get: y.get, set: y.set }) : i,
              u
            )),
            (l._ = 1),
            4 ^ c || void 0 === s
              ? nL(s) && (c > 4 ? m.unshift(s) : c ? (h ? (o = s) : (y[g] = s)) : (i = s))
              : "object" != typeof s || null === s
                ? nP("Object expected")
                : (nL((a = s.get)) && (y.get = a),
                  nL((a = s.set)) && (y.set = a),
                  nL((a = s.init)) && m.unshift(a)));
        return (c || nT(e, i), y && nk(i, r, y), h ? (4 ^ c ? o : y) : i);
      },
      n$ = (e, t, r) => t.has(e) || nP("Cannot " + r),
      nF = (e, t) =>
        Object(t) !== t ? nP('Cannot use the "in" operator on this value') : e.has(t),
      nW = (e, t, r) => (n$(e, t, "read from private field"), r ? r.call(e) : t.get(e)),
      nH = (e, t, r) =>
        t.has(e)
          ? nP("Cannot add the same private member more than once")
          : t instanceof WeakSet
            ? t.add(e)
            : t.set(e, r),
      nU = (e, t, r, n) => (n$(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r),
      nZ = (e, t, r) => (n$(e, t, "access private method"), r);
    function nV(e, t) {
      if (t) {
        let r;
        return new nv(
          () => {
            let n = e();
            return n && r && t(r, n) ? r : ((r = n), n);
          },
          void 0
        );
      }
      return new nv(e, void 0);
    }
    function nq(e, t) {
      if (Object.is(e, t)) return !0;
      if (null === e || null === t) return !1;
      if ("function" == typeof e && "function" == typeof t) return e === t;
      if (e instanceof Set && t instanceof Set) {
        if (e.size !== t.size) return !1;
        for (let r of e) if (!t.has(r)) return !1;
        return !0;
      }
      if (Array.isArray(e))
        return !!Array.isArray(t) && e.length === t.length && !e.some((e, r) => !nq(e, t[r]));
      if ("object" == typeof e && "object" == typeof t) {
        let r = Object.keys(e),
          n = Object.keys(t);
        return r.length === n.length && !r.some((r) => !nq(e[r], t[r]));
      }
      return !1;
    }
    function nY({ get: e }, t) {
      return {
        init: (e) => nh(e),
        get() {
          return e.call(this).value;
        },
        set(t) {
          let r = e.call(this);
          r.peek() !== t && (r.value = t);
        },
      };
    }
    function nK(e, t) {
      let r = new WeakMap();
      return function () {
        let t = r.get(this);
        return (t || ((t = nV(e.bind(this))), r.set(this, t)), t.value);
      };
    }
    function nX(e = !0) {
      return function (t, r) {
        r.addInitializer(function () {
          let t = "field" === r.kind || r.static ? this : Object.getPrototypeOf(this),
            n = Object.getOwnPropertyDescriptor(t, r.name);
          n &&
            Object.defineProperty(
              t,
              r.name,
              nS(
                ((e, t) => {
                  for (var r in t || (t = {})) nC.call(t, r) && nA(e, r, t[r]);
                  if (nO) for (var r of nO(t)) nM.call(t, r) && nA(e, r, t[r]);
                  return e;
                })({}, n),
                nE({ enumerable: e })
              )
            );
        });
      };
    }
    function nG(...e) {
      let t = e.map(n_);
      return () => t.forEach((e) => e());
    }
    ((O = [nY]), (E = [nY]), (I = [nY]), (S = [nX()]), (k = [nX()]), (j = [nX()]));
    var nJ = class {
      constructor(e, t = Object.is) {
        ((this.defaultValue = e),
          (this.equals = t),
          nB(C, 5, this),
          nH(this, D),
          nH(this, M, nB(C, 8, this)),
          nB(C, 11, this),
          nH(this, L, nB(C, 12, this)),
          nB(C, 15, this),
          nH(this, R, nB(C, 16, this)),
          nB(C, 19, this),
          (this.reset = this.reset.bind(this)),
          this.reset());
      }
      get current() {
        return nW(this, D, F);
      }
      get initial() {
        return nW(this, D, A);
      }
      get previous() {
        return nW(this, D, T);
      }
      set current(e) {
        let t = nr(() => nW(this, D, F));
        (e && t && this.equals(t, e)) ||
          ne(() => {
            (nW(this, D, A) || nU(this, D, e, z), nU(this, D, t, B), nU(this, D, e, W));
          });
      }
      reset(e = this.defaultValue) {
        ne(() => {
          (nU(this, D, void 0, B), nU(this, D, e, z), nU(this, D, e, W));
        });
      }
    };
    function nQ(e) {
      return nr(() => {
        let t = {};
        for (let r in e) t[r] = e[r];
        return t;
      });
    }
    ((C = [, , , nj(null)]),
      (M = new WeakMap()),
      (D = new WeakSet()),
      (L = new WeakMap()),
      (R = new WeakMap()),
      (A = (P = nR(C, 20, "#initial", O, D, M)).get),
      (z = P.set),
      (T = (N = nR(C, 20, "#previous", E, D, L)).get),
      (B = N.set),
      (F = ($ = nR(C, 20, "#current", I, D, R)).get),
      (W = $.set),
      nR(C, 2, "current", S, nJ),
      nR(C, 2, "initial", k, nJ),
      nR(C, 2, "previous", j, nJ),
      nT(C, nJ));
    var n0 = class {
      constructor() {
        nH(this, H, new WeakMap());
      }
      get(e, t) {
        var r;
        return e ? (null == (r = nW(this, H).get(e)) ? void 0 : r.get(t)) : void 0;
      }
      set(e, t, r) {
        var n;
        if (e)
          return (
            nW(this, H).has(e) || nW(this, H).set(e, new Map()),
            null == (n = nW(this, H).get(e)) ? void 0 : n.set(t, r)
          );
      }
      clear(e) {
        var t;
        return e ? (null == (t = nW(this, H).get(e)) ? void 0 : t.clear()) : void 0;
      }
    };
    H = new WeakMap();
    var n1 = Object.create,
      n2 = Object.defineProperty,
      n4 = Object.getOwnPropertyDescriptor,
      n5 = Object.getOwnPropertySymbols,
      n6 = Object.prototype.hasOwnProperty,
      n3 = Object.prototype.propertyIsEnumerable,
      n8 = (e, t) => ((t = Symbol[e]) ? t : Symbol.for("Symbol." + e)),
      n7 = (e) => {
        throw TypeError(e);
      },
      n9 = Math.pow,
      ie = (e, t, r) =>
        t in e
          ? n2(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      it = (e, t) => n2(e, "name", { value: t, configurable: !0 }),
      ir = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      ii = (e) => (void 0 !== e && "function" != typeof e ? n7("Function expected") : e),
      io = (e, t, r, n, i) => ({
        kind: ir[e],
        name: t,
        metadata: n,
        addInitializer: (e) => (r._ ? n7("Already initialized") : i.push(ii(e || null))),
      }),
      ia = (e, t) => ie(t, n8("metadata"), e[3]),
      is = (e, t, r, n, i, o) => {
        var a,
          s,
          l,
          u,
          d,
          c = 7 & t,
          p = !!(8 & t),
          h = !!(16 & t),
          f = c > 3 ? e.length + 1 : c ? (p ? 1 : 2) : 0,
          g = ir[c + 5],
          m = c > 3 && (e[f - 1] = []),
          v = e[f] || (e[f] = []),
          y =
            c &&
            (h || p || (i = i.prototype),
            c < 5 &&
              (c > 3 || !h) &&
              n4(
                c < 4
                  ? i
                  : {
                      get [r]() {
                        return id(this, o);
                      },
                      set [r](x) {
                        return ic(this, o, x);
                      },
                    },
                r
              ));
        c ? h && c < 4 && it(o, (c > 2 ? "set " : c > 1 ? "get " : "") + r) : it(i, r);
        for (var b = n.length - 1; b >= 0; b--)
          ((u = io(c, r, (l = {}), e[3], v)),
            c &&
              ((u.static = p),
              (u.private = h),
              (d = u.access = { has: h ? (e) => iu(i, e) : (e) => r in e }),
              3 ^ c &&
                (d.get = h ? (e) => (1 ^ c ? id : ip)(e, i, 4 ^ c ? o : y.get) : (e) => e[r]),
              c > 2 &&
                (d.set = h ? (e, t) => ic(e, i, t, 4 ^ c ? o : y.set) : (e, t) => (e[r] = t))),
            (s = (0, n[b])(
              c ? (c < 4 ? (h ? o : y[g]) : c > 4 ? void 0 : { get: y.get, set: y.set }) : i,
              u
            )),
            (l._ = 1),
            4 ^ c || void 0 === s
              ? ii(s) && (c > 4 ? m.unshift(s) : c ? (h ? (o = s) : (y[g] = s)) : (i = s))
              : "object" != typeof s || null === s
                ? n7("Object expected")
                : (ii((a = s.get)) && (y.get = a),
                  ii((a = s.set)) && (y.set = a),
                  ii((a = s.init)) && m.unshift(a)));
        return (c || ia(e, i), y && n2(i, r, y), h ? (4 ^ c ? o : y) : i);
      },
      il = (e, t, r) => t.has(e) || n7("Cannot " + r),
      iu = (e, t) =>
        Object(t) !== t ? n7('Cannot use the "in" operator on this value') : e.has(t),
      id = (e, t, r) => (il(e, t, "read from private field"), r ? r.call(e) : t.get(e)),
      ic = (e, t, r, n) => (il(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r),
      ip = (e, t, r) => (il(e, t, "access private method"), r),
      ih = class e {
        constructor(e, t) {
          ((this.x = e), (this.y = t));
        }
        static delta(t, r) {
          return new e(t.x - r.x, t.y - r.y);
        }
        static distance(e, t) {
          return Math.hypot(e.x - t.x, e.y - t.y);
        }
        static equals(e, t) {
          return e.x === t.x && e.y === t.y;
        }
        static from({ x: t, y: r }) {
          return new e(t, r);
        }
      },
      ig = class e {
        constructor(e, t, r, n) {
          ((this.left = e),
            (this.top = t),
            (this.width = r),
            (this.height = n),
            (this.scale = { x: 1, y: 1 }));
        }
        get inverseScale() {
          return { x: 1 / this.scale.x, y: 1 / this.scale.y };
        }
        translate(t, r) {
          let { top: n, left: i, width: o, height: a, scale: s } = this,
            l = new e(i + t, n + r, o, a);
          return (
            (l.scale = ((e, t) => {
              for (var r in t || (t = {})) n6.call(t, r) && ie(e, r, t[r]);
              if (n5) for (var r of n5(t)) n3.call(t, r) && ie(e, r, t[r]);
              return e;
            })({}, s)),
            l
          );
        }
        get boundingRectangle() {
          let { width: e, height: t, left: r, top: n, right: i, bottom: o } = this;
          return { width: e, height: t, left: r, top: n, right: i, bottom: o };
        }
        get center() {
          let { left: e, top: t, right: r, bottom: n } = this;
          return new ih((e + r) / 2, (t + n) / 2);
        }
        get area() {
          let { width: e, height: t } = this;
          return e * t;
        }
        equals(t) {
          if (!(t instanceof e)) return !1;
          let { left: r, top: n, width: i, height: o } = this;
          return r === t.left && n === t.top && i === t.width && o === t.height;
        }
        containsPoint(e) {
          let { top: t, left: r, bottom: n, right: i } = this;
          return t <= e.y && e.y <= n && r <= e.x && e.x <= i;
        }
        intersectionArea(t) {
          var r, n;
          let i, o, a, s;
          return t instanceof e
            ? ((r = this),
              (i = Math.max((n = t).top, r.top)),
              (o = Math.max(n.left, r.left)),
              (a = Math.min(n.left + n.width, r.left + r.width)),
              (s = Math.min(n.top + n.height, r.top + r.height)),
              o < a && i < s ? (a - o) * (s - i) : 0)
            : 0;
        }
        intersectionRatio(e) {
          let { area: t } = this,
            r = this.intersectionArea(e);
          return r / (e.area + t - r);
        }
        get bottom() {
          let { top: e, height: t } = this;
          return e + t;
        }
        get right() {
          let { left: e, width: t } = this;
          return e + t;
        }
        get aspectRatio() {
          let { width: e, height: t } = this;
          return e / t;
        }
        get corners() {
          return [
            { x: this.left, y: this.top },
            { x: this.right, y: this.top },
            { x: this.left, y: this.bottom },
            { x: this.right, y: this.bottom },
          ];
        }
        static from({ top: t, left: r, width: n, height: i }) {
          return new e(r, t, n, i);
        }
        static delta(e, t, r = { x: "center", y: "center" }) {
          let n = (e, t) => {
            let n = r[t],
              i = "x" === t ? e.left : e.top,
              o = "x" === t ? e.width : e.height;
            return "start" == n ? i : "end" == n ? i + o : i + o / 2;
          };
          return ih.delta({ x: n(e, "x"), y: n(e, "y") }, { x: n(t, "x"), y: n(t, "y") });
        }
        static intersectionRatio(t, r) {
          return e.from(t).intersectionRatio(e.from(r));
        }
      },
      im = class extends ((V = nJ), (Z = [nK]), (U = [nK]), V) {
        constructor(e) {
          (super(ih.from(e), (e, t) => ih.equals(e, t)),
            ((e, t, r, n) => {
              for (var i = 0, o = e[t >> 1], a = o && o.length; i < a; i++)
                1 & t ? o[i].call(r) : (n = o[i].call(r, n));
            })(Y, 5, this),
            ((e, t, r) =>
              t.has(e)
                ? n7("Cannot add the same private member more than once")
                : t instanceof WeakSet
                  ? t.add(e)
                  : t.set(e, r))(this, q, 0),
            (this.velocity = { x: 0, y: 0 }));
        }
        get delta() {
          return ih.delta(this.current, this.initial);
        }
        get direction() {
          let { current: e, previous: t } = this;
          if (!t) return null;
          let r = { x: e.x - t.x, y: e.y - t.y };
          return r.x || r.y
            ? Math.abs(r.x) > Math.abs(r.y)
              ? r.x > 0
                ? "right"
                : "left"
              : r.y > 0
                ? "down"
                : "up"
            : null;
        }
        get current() {
          return super.current;
        }
        set current(e) {
          let { current: t } = this,
            r = ih.from(e),
            n = { x: r.x - t.x, y: r.y - t.y },
            i = Date.now(),
            o = i - id(this, q),
            a = (e) => Math.round((e / o) * 100);
          ne(() => {
            (ic(this, q, i), (this.velocity = { x: a(n.x), y: a(n.y) }), (super.current = r));
          });
        }
        reset(e = this.defaultValue) {
          (super.reset(ih.from(e)), (this.velocity = { x: 0, y: 0 }));
        }
      };
    function iv({ x: e, y: t }, r) {
      let n = Math.abs(e),
        i = Math.abs(t);
      return "number" == typeof r
        ? Math.sqrt(n9(n, 2) + n9(i, 2)) > r
        : "x" in r && "y" in r
          ? n > r.x && i > r.y
          : "x" in r
            ? n > r.x
            : "y" in r && i > r.y;
    }
    ((Y = [, , , n1(null != (h = null == V ? void 0 : V[n8("metadata")]) ? h : null)]),
      (q = new WeakMap()),
      is(Y, 2, "delta", Z, im),
      is(Y, 2, "direction", U, im),
      ia(Y, im));
    var iy = (((f = iy || {}).Horizontal = "x"), (f.Vertical = "y"), f),
      ib = Object.values(iy),
      ix = Object.create,
      iw = Object.defineProperty,
      i_ = Object.defineProperties,
      ij = Object.getOwnPropertyDescriptor,
      ik = Object.getOwnPropertyDescriptors,
      iS = Object.getOwnPropertySymbols,
      iI = Object.prototype.hasOwnProperty,
      iE = Object.prototype.propertyIsEnumerable,
      iO = (e, t) => ((t = Symbol[e]) ? t : Symbol.for("Symbol." + e)),
      iC = (e) => {
        throw TypeError(e);
      },
      iM = (e, t, r) =>
        t in e
          ? iw(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      iP = (e, t) => {
        for (var r in t || (t = {})) iI.call(t, r) && iM(e, r, t[r]);
        if (iS) for (var r of iS(t)) iE.call(t, r) && iM(e, r, t[r]);
        return e;
      },
      iA = (e, t) => i_(e, ik(t)),
      iz = (e, t) => iw(e, "name", { value: t, configurable: !0 }),
      iD = (e, t) => {
        var r = {};
        for (var n in e) iI.call(e, n) && 0 > t.indexOf(n) && (r[n] = e[n]);
        if (null != e && iS)
          for (var n of iS(e)) 0 > t.indexOf(n) && iE.call(e, n) && (r[n] = e[n]);
        return r;
      },
      iL = (e) => {
        var t;
        return [, , , ix(null != (t = null == e ? void 0 : e[iO("metadata")]) ? t : null)];
      },
      iN = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      iT = (e) => (void 0 !== e && "function" != typeof e ? iC("Function expected") : e),
      iB = (e, t, r, n, i) => ({
        kind: iN[e],
        name: t,
        metadata: n,
        addInitializer: (e) => (r._ ? iC("Already initialized") : i.push(iT(e || null))),
      }),
      iR = (e, t) => iM(t, iO("metadata"), e[3]),
      i$ = (e, t, r, n) => {
        for (var i = 0, o = e[t >> 1], a = o && o.length; i < a; i++)
          1 & t ? o[i].call(r) : (n = o[i].call(r, n));
        return n;
      },
      iF = (e, t, r, n, i, o) => {
        var a,
          s,
          l,
          u,
          d,
          c = 7 & t,
          p = !!(8 & t),
          h = !!(16 & t),
          f = c > 3 ? e.length + 1 : c ? (p ? 1 : 2) : 0,
          g = iN[c + 5],
          m = c > 3 && (e[f - 1] = []),
          v = e[f] || (e[f] = []),
          y =
            c &&
            (h || p || (i = i.prototype),
            c < 5 &&
              (c > 3 || !h) &&
              ij(
                c < 4
                  ? i
                  : {
                      get [r]() {
                        return iU(this, o);
                      },
                      set [r](x) {
                        return iV(this, o, x);
                      },
                    },
                r
              ));
        c ? h && c < 4 && iz(o, (c > 2 ? "set " : c > 1 ? "get " : "") + r) : iz(i, r);
        for (var b = n.length - 1; b >= 0; b--)
          ((u = iB(c, r, (l = {}), e[3], v)),
            c &&
              ((u.static = p),
              (u.private = h),
              (d = u.access = { has: h ? (e) => iH(i, e) : (e) => r in e }),
              3 ^ c &&
                (d.get = h ? (e) => (1 ^ c ? iU : iq)(e, i, 4 ^ c ? o : y.get) : (e) => e[r]),
              c > 2 &&
                (d.set = h ? (e, t) => iV(e, i, t, 4 ^ c ? o : y.set) : (e, t) => (e[r] = t))),
            (s = (0, n[b])(
              c ? (c < 4 ? (h ? o : y[g]) : c > 4 ? void 0 : { get: y.get, set: y.set }) : i,
              u
            )),
            (l._ = 1),
            4 ^ c || void 0 === s
              ? iT(s) && (c > 4 ? m.unshift(s) : c ? (h ? (o = s) : (y[g] = s)) : (i = s))
              : "object" != typeof s || null === s
                ? iC("Object expected")
                : (iT((a = s.get)) && (y.get = a),
                  iT((a = s.set)) && (y.set = a),
                  iT((a = s.init)) && m.unshift(a)));
        return (c || iR(e, i), y && iw(i, r, y), h ? (4 ^ c ? o : y) : i);
      },
      iW = (e, t, r) => t.has(e) || iC("Cannot " + r),
      iH = (e, t) =>
        Object(t) !== t ? iC('Cannot use the "in" operator on this value') : e.has(t),
      iU = (e, t, r) => (iW(e, t, "read from private field"), r ? r.call(e) : t.get(e)),
      iZ = (e, t, r) =>
        t.has(e)
          ? iC("Cannot add the same private member more than once")
          : t instanceof WeakSet
            ? t.add(e)
            : t.set(e, r),
      iV = (e, t, r, n) => (iW(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r),
      iq = (e, t, r) => (iW(e, t, "access private method"), r);
    function iY(e, t) {
      return { plugin: e, options: t };
    }
    function iK(e) {
      return (t) => iY(e, t);
    }
    function iX(e) {
      return "function" == typeof e ? { plugin: e, options: void 0 } : e;
    }
    K = [nY];
    var iG = class {
      constructor(e, t) {
        ((this.manager = e),
          (this.options = t),
          iZ(this, G, i$(X, 8, this, !1)),
          i$(X, 11, this),
          iZ(this, J, new Set()));
      }
      enable() {
        this.disabled = !1;
      }
      disable() {
        this.disabled = !0;
      }
      isDisabled() {
        return nr(() => this.disabled);
      }
      configure(e) {
        this.options = e;
      }
      registerEffect(e) {
        let t = n_(e.bind(this));
        return (iU(this, J).add(t), t);
      }
      destroy() {
        iU(this, J).forEach((e) => e());
      }
      static configure(e) {
        return iY(this, e);
      }
    };
    ((X = iL(null)),
      (G = new WeakMap()),
      (J = new WeakMap()),
      iF(X, 4, "disabled", K, iG, G),
      iR(X, iG));
    var iJ = class extends iG {},
      iQ = class {
        constructor(e) {
          ((this.manager = e), (this.instances = new Map()), iZ(this, Q, []));
        }
        get values() {
          return Array.from(this.instances.values());
        }
        set values(e) {
          let t = e
              .map(iX)
              .reduceRight(
                (e, t) => (e.some(({ plugin: e }) => e === t.plugin) ? e : [t, ...e]),
                []
              ),
            r = t.map(({ plugin: e }) => e);
          for (let e of iU(this, Q))
            if (!r.includes(e)) {
              if (e.prototype instanceof iJ) continue;
              this.unregister(e);
            }
          for (let { plugin: e, options: r } of t) this.register(e, r);
          iV(this, Q, r);
        }
        get(e) {
          return this.instances.get(e);
        }
        register(e, t) {
          let r = this.instances.get(e);
          if (r) return (r.options !== t && (r.options = t), r);
          let n = new e(this.manager, t);
          return (this.instances.set(e, n), n);
        }
        unregister(e) {
          let t = this.instances.get(e);
          t && (t.destroy(), this.instances.delete(e));
        }
        destroy() {
          for (let e of this.instances.values()) e.destroy();
          this.instances.clear();
        }
      };
    function i0(e, t) {
      return e.priority === t.priority
        ? e.type === t.type
          ? t.value - e.value
          : t.type - e.type
        : t.priority - e.priority;
    }
    Q = new WeakMap();
    var i1 = [],
      i2 = class extends iG {
        constructor(e) {
          (super(e),
            iZ(this, ee),
            iZ(this, et),
            (this.computeCollisions = this.computeCollisions.bind(this)),
            iV(this, et, nh(i1)),
            (this.destroy = nG(
              () => {
                let e = this.computeCollisions(),
                  t = nr(() => this.manager.dragOperation.position.current);
                if (e !== i1) {
                  let e = iU(this, ee);
                  if ((iV(this, ee, t), e && t.x == e.x && t.y == e.y)) return;
                } else iV(this, ee, void 0);
                iU(this, et).value = e;
              },
              () => {
                let { dragOperation: e } = this.manager;
                e.status.initialized && this.forceUpdate();
              }
            )));
        }
        forceUpdate(e = !0) {
          nr(() => {
            e ? (iU(this, et).value = this.computeCollisions()) : iV(this, ee, void 0);
          });
        }
        computeCollisions(e, t) {
          let { registry: r, dragOperation: n } = this.manager,
            { source: i, shape: o, status: a } = n;
          if (!a.initialized || !o) return i1;
          let s = [],
            l = [];
          for (let o of null != e ? e : r.droppables) {
            if (o.disabled || (i && !o.accepts(i))) continue;
            let e = null != t ? t : o.collisionDetector;
            if (!e) continue;
            (l.push(o), o.shape);
            let r = nr(() => e({ droppable: o, dragOperation: n }));
            r && (null != o.collisionPriority && (r.priority = o.collisionPriority), s.push(r));
          }
          return 0 === l.length ? i1 : (s.sort(i0), s);
        }
        get collisions() {
          return iU(this, et).value;
        }
      };
    ((ee = new WeakMap()), (et = new WeakMap()));
    var i4 = class {
        constructor() {
          this.registry = new Map();
        }
        addEventListener(e, t) {
          let { registry: r } = this,
            n = new Set(r.get(e));
          return (n.add(t), r.set(e, n), () => this.removeEventListener(e, t));
        }
        removeEventListener(e, t) {
          let { registry: r } = this,
            n = new Set(r.get(e));
          (n.delete(t), r.set(e, n));
        }
        dispatch(e, ...t) {
          let { registry: r } = this,
            n = r.get(e);
          if (n) for (let e of n) e(...t);
        }
      },
      i5 = class extends i4 {
        constructor(e) {
          (super(), (this.manager = e));
        }
        dispatch(e, t) {
          let r = [t, this.manager];
          super.dispatch(e, ...r);
        }
      };
    function i6(e, t = !0) {
      let r = !1;
      return iA(iP({}, e), {
        cancelable: t,
        get defaultPrevented() {
          return r;
        },
        preventDefault() {
          t && (r = !0);
        },
      });
    }
    var i3 = class extends iJ {
        constructor(e) {
          super(e);
          let t = [];
          this.destroy = nG(
            () => {
              let { dragOperation: r, collisionObserver: n } = e;
              r.status.initializing && ((t = []), n.enable());
            },
            () => {
              let r,
                { collisionObserver: n, monitor: i } = e,
                { collisions: o } = n;
              if (n.isDisabled()) return;
              let a = i6({ collisions: o });
              if (
                (i.dispatch("collision", a),
                a.defaultPrevented ||
                  ((r = t), o.map(({ id: e }) => e).join("") === r.map(({ id: e }) => e).join("")))
              )
                return;
              t = o;
              let [s] = o;
              nr(() => {
                var t;
                (null == s ? void 0 : s.id) !==
                  (null == (t = e.dragOperation.target) ? void 0 : t.id) &&
                  (n.disable(),
                  e.actions.setDropTarget(null == s ? void 0 : s.id).then(() => {
                    n.enable();
                  }));
              });
            }
          );
        }
      },
      i8 =
        (((g = i8 || {})[(g.Lowest = 0)] = "Lowest"),
        (g[(g.Low = 1)] = "Low"),
        (g[(g.Normal = 2)] = "Normal"),
        (g[(g.High = 3)] = "High"),
        (g[(g.Highest = 4)] = "Highest"),
        g),
      i7 =
        (((m = i7 || {})[(m.Collision = 0)] = "Collision"),
        (m[(m.ShapeIntersection = 1)] = "ShapeIntersection"),
        (m[(m.PointerIntersection = 2)] = "PointerIntersection"),
        m);
    ((el = [nY]), (es = [nK]), (ea = [nK]), (eo = [nK]), (ei = [nK]), (en = [nK]), (er = [nK]));
    var i9 = class {
      constructor() {
        (i$(eu, 5, this), iZ(this, ed, i$(eu, 8, this, "idle")), i$(eu, 11, this));
      }
      get current() {
        return this.value;
      }
      get idle() {
        return "idle" === this.value;
      }
      get initializing() {
        return "initializing" === this.value;
      }
      get initialized() {
        let { value: e } = this;
        return "idle" !== e && "initialization-pending" !== e;
      }
      get dragging() {
        return "dragging" === this.value;
      }
      get dropped() {
        return "dropped" === this.value;
      }
      set(e) {
        this.value = e;
      }
    };
    ((eu = iL(null)),
      (ed = new WeakMap()),
      iF(eu, 4, "value", el, i9, ed),
      iF(eu, 2, "current", es, i9),
      iF(eu, 2, "idle", ea, i9),
      iF(eu, 2, "initializing", eo, i9),
      iF(eu, 2, "initialized", ei, i9),
      iF(eu, 2, "dragging", en, i9),
      iF(eu, 2, "dropped", er, i9),
      iR(eu, i9));
    var oe = class {
      constructor(e) {
        this.manager = e;
      }
      setDragSource(e) {
        let { dragOperation: t } = this.manager;
        t.sourceIdentifier = "string" == typeof e || "number" == typeof e ? e : e.id;
      }
      setDropTarget(e) {
        return nr(() => {
          let { dragOperation: t } = this.manager,
            r = null != e ? e : null;
          if (t.targetIdentifier === r) return Promise.resolve(!1);
          t.targetIdentifier = r;
          let n = i6({ operation: t.snapshot() });
          return (
            t.status.dragging && this.manager.monitor.dispatch("dragover", n),
            this.manager.renderer.rendering.then(() => n.defaultPrevented)
          );
        });
      }
      start(e) {
        return nr(() => {
          let { dragOperation: t } = this.manager;
          if ((null != e.source && this.setDragSource(e.source), !t.source))
            throw Error("Cannot start a drag operation without a drag source");
          if (!t.status.idle) throw Error("Cannot start a drag operation while another is active");
          let r = new AbortController(),
            { event: n, coordinates: i } = e;
          ne(() => {
            (t.status.set("initialization-pending"),
              (t.shape = null),
              (t.canceled = !1),
              (t.activatorEvent = null != n ? n : null),
              t.position.reset(i));
          });
          let o = i6({ operation: t.snapshot() });
          return (
            (this.manager.monitor.dispatch("beforedragstart", o), o.defaultPrevented)
              ? (t.reset(), r.abort())
              : (t.status.set("initializing"),
                (t.controller = r),
                this.manager.renderer.rendering.then(() => {
                  if (r.signal.aborted) return;
                  let { status: e } = t;
                  "initializing" === e.current &&
                    (t.status.set("dragging"),
                    this.manager.monitor.dispatch("dragstart", {
                      nativeEvent: n,
                      operation: t.snapshot(),
                      cancelable: !1,
                    }));
                })),
            r
          );
        });
      }
      move(e) {
        return nr(() => {
          var t, r;
          let { dragOperation: n } = this.manager,
            { status: i, controller: o } = n;
          if (!i.dragging || !o || o.signal.aborted) return;
          let a = i6(
            { nativeEvent: e.event, operation: n.snapshot(), by: e.by, to: e.to },
            null == (t = e.cancelable) || t
          );
          ((null == (r = e.propagate) || r) && this.manager.monitor.dispatch("dragmove", a),
            queueMicrotask(() => {
              var t, r, i, o, s;
              if (a.defaultPrevented) return;
              let l =
                null != (s = e.to)
                  ? s
                  : {
                      x:
                        n.position.current.x +
                        (null != (r = null == (t = e.by) ? void 0 : t.x) ? r : 0),
                      y:
                        n.position.current.y +
                        (null != (o = null == (i = e.by) ? void 0 : i.y) ? o : 0),
                    };
              n.position.current = l;
            }));
        });
      }
      stop(e = {}) {
        return nr(() => {
          var t, r;
          let n,
            { dragOperation: i } = this.manager,
            { controller: o } = i;
          if (!o || o.signal.aborted) return;
          o.abort();
          let a = () => {
            this.manager.renderer.rendering.then(() => {
              i.status.set("dropped");
              let e = nr(() => {
                  var e;
                  return (null == (e = i.source) ? void 0 : e.status) === "dropping";
                }),
                t = () => {
                  (i.controller === o && (i.controller = void 0), i.reset());
                };
              if (e) {
                let { source: e } = i,
                  r = n_(() => {
                    (null == e ? void 0 : e.status) === "idle" && (r(), t());
                  });
              } else this.manager.renderer.rendering.then(t);
            });
          };
          ((i.canceled = null != (t = e.canceled) && t),
            this.manager.monitor.dispatch("dragend", {
              nativeEvent: e.event,
              operation: i.snapshot(),
              canceled: null != (r = e.canceled) && r,
              suspend: () => {
                let e = { resume: () => {}, abort: () => {} };
                return (
                  (n = new Promise((t, r) => {
                    ((e.resume = t), (e.abort = r));
                  })),
                  e
                );
              },
            }),
            n ? n.then(a).catch(() => i.reset()) : a());
        });
      }
    };
    ((ef = [nY]), (eh = [nY]), (ep = [nY]), (ec = [nY]));
    var ot = class {
      constructor(e, t) {
        (iZ(this, em, i$(eg, 8, this)),
          i$(eg, 11, this),
          iZ(this, ev, i$(eg, 12, this)),
          i$(eg, 15, this),
          iZ(this, ey, i$(eg, 16, this)),
          i$(eg, 19, this),
          iZ(this, eb, i$(eg, 20, this)),
          i$(eg, 23, this));
        const { effects: r, id: n, data: i = {}, disabled: o = !1, register: a = !0 } = e;
        ((this.manager = t),
          (this.id = n),
          (this.data = i),
          (this.disabled = o),
          (this.effects = () => {
            var e;
            return [
              () => {
                let { id: e, manager: t } = this;
                if (e !== n)
                  return (
                    null == t || t.registry.register(this),
                    () => (null == t ? void 0 : t.registry.unregister(this))
                  );
              },
              ...(null != (e = null == r ? void 0 : r()) ? e : []),
            ];
          }),
          (this.register = this.register.bind(this)),
          (this.unregister = this.unregister.bind(this)),
          (this.destroy = this.destroy.bind(this)),
          t && a && queueMicrotask(this.register));
      }
      register() {
        var e;
        return null == (e = this.manager) ? void 0 : e.registry.register(this);
      }
      unregister() {
        var e;
        null == (e = this.manager) || e.registry.unregister(this);
      }
      destroy() {
        var e;
        null == (e = this.manager) || e.registry.unregister(this);
      }
    };
    ((eg = iL(null)),
      (em = new WeakMap()),
      (ev = new WeakMap()),
      (ey = new WeakMap()),
      (eb = new WeakMap()),
      iF(eg, 4, "manager", ef, ot, em),
      iF(eg, 4, "id", eh, ot, ev),
      iF(eg, 4, "data", ep, ot, ey),
      iF(eg, 4, "disabled", ec, ot, eb),
      iR(eg, ot));
    var or = class {
        constructor() {
          ((this.map = nh(new Map())),
            (this.cleanupFunctions = new WeakMap()),
            (this.register = (e, t) => {
              let r = this.map.peek(),
                n = r.get(e),
                i = () => this.unregister(e, t);
              if (n === t) return i;
              if (n) {
                let e = this.cleanupFunctions.get(n);
                (null == e || e(), this.cleanupFunctions.delete(n));
              }
              let o = new Map(r);
              (o.set(e, t), (this.map.value = o));
              let a = nG(...t.effects());
              return (this.cleanupFunctions.set(t, a), i);
            }),
            (this.unregister = (e, t) => {
              let r = this.map.peek();
              if (r.get(e) !== t) return;
              let n = this.cleanupFunctions.get(t);
              (null == n || n(), this.cleanupFunctions.delete(t));
              let i = new Map(r);
              (i.delete(e), (this.map.value = i));
            }));
        }
        [Symbol.iterator]() {
          return this.map.peek().values();
        }
        get value() {
          return this.map.value.values();
        }
        has(e) {
          return this.map.value.has(e);
        }
        get(e) {
          return this.map.value.get(e);
        }
        destroy() {
          for (let e of this) {
            let t = this.cleanupFunctions.get(e);
            (null == t || t(), e.destroy());
          }
          this.map.value = new Map();
        }
      },
      on = class extends ((eI = ot),
      (eS = [nY]),
      (ek = [nY]),
      (ej = [nY]),
      (e_ = [nK]),
      (ew = [nK]),
      (ex = [nK]),
      eI) {
        constructor(e, t) {
          var { modifiers: r, type: n, sensors: i } = e,
            o = iD(e, ["modifiers", "type", "sensors"]);
          (super(o, t),
            i$(eE, 5, this),
            iZ(this, eO, i$(eE, 8, this)),
            i$(eE, 11, this),
            iZ(this, eC, i$(eE, 12, this)),
            i$(eE, 15, this),
            iZ(this, eM, i$(eE, 16, this, this.isDragSource ? "dragging" : "idle")),
            i$(eE, 19, this),
            (this.type = n),
            (this.sensors = i),
            (this.modifiers = r),
            (this.alignment = o.alignment));
        }
        get isDropping() {
          return "dropping" === this.status && this.isDragSource;
        }
        get isDragging() {
          return "dragging" === this.status && this.isDragSource;
        }
        get isDragSource() {
          var e, t;
          return (
            (null == (t = null == (e = this.manager) ? void 0 : e.dragOperation.source)
              ? void 0
              : t.id) === this.id
          );
        }
      };
    ((eE = iL(eI)),
      (eO = new WeakMap()),
      (eC = new WeakMap()),
      (eM = new WeakMap()),
      iF(eE, 4, "type", eS, on, eO),
      iF(eE, 4, "modifiers", ek, on, eC),
      iF(eE, 4, "status", ej, on, eM),
      iF(eE, 2, "isDropping", e_, on),
      iF(eE, 2, "isDragging", ew, on),
      iF(eE, 2, "isDragSource", ex, on),
      iR(eE, on));
    var oi = class extends ((eT = ot),
    (eN = [nY]),
    (eL = [nY]),
    (eD = [nY]),
    (ez = [nY]),
    (eA = [nY]),
    (eP = [nK]),
    eT) {
      constructor(e, t) {
        var { accept: r, collisionDetector: n, collisionPriority: i, type: o } = e;
        (super(iD(e, ["accept", "collisionDetector", "collisionPriority", "type"]), t),
          i$(eB, 5, this),
          iZ(this, eR, i$(eB, 8, this)),
          i$(eB, 11, this),
          iZ(this, e$, i$(eB, 12, this)),
          i$(eB, 15, this),
          iZ(this, eF, i$(eB, 16, this)),
          i$(eB, 19, this),
          iZ(this, eW, i$(eB, 20, this)),
          i$(eB, 23, this),
          iZ(this, eH, i$(eB, 24, this)),
          i$(eB, 27, this),
          (this.accept = r),
          (this.collisionDetector = n),
          (this.collisionPriority = i),
          (this.type = o));
      }
      accepts(e) {
        let { accept: t } = this;
        return (
          !t ||
          ("function" == typeof t
            ? t(e)
            : !!e.type && (Array.isArray(t) ? t.includes(e.type) : e.type === t))
        );
      }
      get isDropTarget() {
        var e, t;
        return (
          (null == (t = null == (e = this.manager) ? void 0 : e.dragOperation.target)
            ? void 0
            : t.id) === this.id
        );
      }
    };
    ((eB = iL(eT)),
      (eR = new WeakMap()),
      (e$ = new WeakMap()),
      (eF = new WeakMap()),
      (eW = new WeakMap()),
      (eH = new WeakMap()),
      iF(eB, 4, "accept", eN, oi, eR),
      iF(eB, 4, "type", eL, oi, e$),
      iF(eB, 4, "collisionDetector", eD, oi, eF),
      iF(eB, 4, "collisionPriority", ez, oi, eW),
      iF(eB, 4, "shape", eA, oi, eH),
      iF(eB, 2, "isDropTarget", eP, oi),
      iR(eB, oi));
    var oo = class extends iG {
        constructor(e, t) {
          (super(e, t), (this.manager = e), (this.options = t));
        }
      },
      oa = class extends iG {
        constructor(e, t) {
          (super(e, t), (this.manager = e), (this.options = t));
        }
        apply(e) {
          return e.transform;
        }
      },
      os = class {
        constructor(e) {
          ((this.draggables = new or()),
            (this.droppables = new or()),
            (this.plugins = new iQ(e)),
            (this.sensors = new iQ(e)),
            (this.modifiers = new iQ(e)));
        }
        register(e, t) {
          if (e instanceof on) return this.draggables.register(e.id, e);
          if (e instanceof oi) return this.droppables.register(e.id, e);
          if (e.prototype instanceof oa) return this.modifiers.register(e, t);
          if (e.prototype instanceof oo) return this.sensors.register(e, t);
          if (e.prototype instanceof iG) return this.plugins.register(e, t);
          throw Error("Invalid instance type");
        }
        unregister(e) {
          if (e instanceof ot)
            return e instanceof on
              ? this.draggables.unregister(e.id, e)
              : e instanceof oi
                ? this.droppables.unregister(e.id, e)
                : () => {};
          if (e.prototype instanceof oa) return this.modifiers.unregister(e);
          if (e.prototype instanceof oo) return this.sensors.unregister(e);
          if (e.prototype instanceof iG) return this.plugins.unregister(e);
          throw Error("Invalid instance type");
        }
        destroy() {
          (this.draggables.destroy(),
            this.droppables.destroy(),
            this.plugins.destroy(),
            this.sensors.destroy(),
            this.modifiers.destroy());
        }
      };
    ((eJ = [nK]),
      (eG = [nY]),
      (eX = [nY]),
      (eK = [nY]),
      (eY = [nY]),
      (eq = [nY]),
      (eV = [nK]),
      (eZ = [nK]),
      (eU = [nK]));
    var ol = class {
      constructor(e) {
        (i$(e2, 5, this),
          iZ(this, eQ),
          iZ(this, e0),
          iZ(this, e1, new nJ(void 0, (e, t) => (e && t ? e.equals(t) : e === t))),
          (this.status = new i9()),
          iZ(this, e4, i$(e2, 8, this, !1)),
          i$(e2, 11, this),
          iZ(this, e5, i$(e2, 12, this, null)),
          i$(e2, 15, this),
          iZ(this, e6, i$(e2, 16, this, null)),
          i$(e2, 19, this),
          iZ(this, e3, i$(e2, 20, this, null)),
          i$(e2, 23, this),
          iZ(this, e8, i$(e2, 24, this, [])),
          i$(e2, 27, this),
          (this.position = new im({ x: 0, y: 0 })),
          iZ(this, e7, { x: 0, y: 0 }),
          iV(this, eQ, e));
      }
      get shape() {
        let { current: e, initial: t, previous: r } = iU(this, e1);
        return e && t ? { current: e, initial: t, previous: r } : null;
      }
      set shape(e) {
        e ? (iU(this, e1).current = e) : iU(this, e1).reset();
      }
      get source() {
        var e;
        let t = this.sourceIdentifier;
        if (null == t) return null;
        let r = iU(this, eQ).registry.draggables.get(t);
        return (r && iV(this, e0, r), null != (e = null != r ? r : iU(this, e0)) ? e : null);
      }
      get target() {
        var e;
        let t = this.targetIdentifier;
        return null != t && null != (e = iU(this, eQ).registry.droppables.get(t)) ? e : null;
      }
      get transform() {
        let { x: e, y: t } = this.position.delta,
          r = { x: e, y: t };
        for (let e of this.modifiers) r = e.apply(iA(iP({}, this.snapshot()), { transform: r }));
        return (iV(this, e7, r), r);
      }
      snapshot() {
        return nr(() => ({
          source: this.source,
          target: this.target,
          activatorEvent: this.activatorEvent,
          transform: iU(this, e7),
          shape: this.shape ? nQ(this.shape) : null,
          position: nQ(this.position),
          status: nQ(this.status),
          canceled: this.canceled,
        }));
      }
      reset() {
        ne(() => {
          (this.status.set("idle"),
            (this.sourceIdentifier = null),
            (this.targetIdentifier = null),
            iU(this, e1).reset(),
            this.position.reset({ x: 0, y: 0 }),
            iV(this, e7, { x: 0, y: 0 }),
            (this.modifiers = []));
        });
      }
    };
    ((e2 = iL(null)),
      (eQ = new WeakMap()),
      (e0 = new WeakMap()),
      (e1 = new WeakMap()),
      (e4 = new WeakMap()),
      (e5 = new WeakMap()),
      (e6 = new WeakMap()),
      (e3 = new WeakMap()),
      (e8 = new WeakMap()),
      (e7 = new WeakMap()),
      iF(e2, 2, "shape", eJ, ol),
      iF(e2, 4, "canceled", eG, ol, e4),
      iF(e2, 4, "activatorEvent", eX, ol, e5),
      iF(e2, 4, "sourceIdentifier", eK, ol, e6),
      iF(e2, 4, "targetIdentifier", eY, ol, e3),
      iF(e2, 4, "modifiers", eq, ol, e8),
      iF(e2, 2, "source", eV, ol),
      iF(e2, 2, "target", eZ, ol),
      iF(e2, 2, "transform", eU, ol),
      iR(e2, ol));
    var ou = {
        get rendering() {
          return Promise.resolve();
        },
      },
      od = class {
        constructor(e) {
          this.destroy = () => {
            (this.dragOperation.status.idle || this.actions.stop({ canceled: !0 }),
              this.dragOperation.modifiers.forEach((e) => e.destroy()),
              this.registry.destroy(),
              this.collisionObserver.destroy());
          };
          const {
              plugins: t = [],
              sensors: r = [],
              modifiers: n = [],
              renderer: i = ou,
            } = null != e ? e : {},
            o = new i5(this),
            a = new os(this);
          ((this.registry = a),
            (this.monitor = o),
            (this.renderer = i),
            (this.actions = new oe(this)),
            (this.dragOperation = new ol(this)),
            (this.collisionObserver = new i2(this)),
            (this.plugins = [i3, ...t]),
            (this.modifiers = n),
            (this.sensors = r));
          const { destroy: s } = this,
            l = nG(() => {
              var e, t, r;
              let n = nr(() => this.dragOperation.modifiers),
                i = this.modifiers;
              (n !== i && n.forEach((e) => e.destroy()),
                (this.dragOperation.modifiers =
                  null !=
                  (r =
                    null == (t = null == (e = this.dragOperation.source) ? void 0 : e.modifiers)
                      ? void 0
                      : t.map((e) => {
                          let { plugin: t, options: r } = iX(e);
                          return new t(this, r);
                        }))
                    ? r
                    : i));
            });
          this.destroy = () => {
            (l(), s());
          };
        }
        get plugins() {
          return this.registry.plugins.values;
        }
        set plugins(e) {
          this.registry.plugins.values = e;
        }
        get modifiers() {
          return this.registry.modifiers.values;
        }
        set modifiers(e) {
          this.registry.modifiers.values = e;
        }
        get sensors() {
          return this.registry.sensors.values;
        }
        set sensors(e) {
          this.registry.sensors.values = e;
        }
      },
      oc = (e) => {
        throw TypeError(e);
      },
      op = (e, t, r) => t.has(e) || oc("Cannot " + r),
      oh = (e, t, r) => (op(e, t, "read from private field"), t.get(e)),
      of = (e, t, r) =>
        t.has(e)
          ? oc("Cannot add the same private member more than once")
          : t instanceof WeakSet
            ? t.add(e)
            : t.set(e, r),
      og = (e, t, r, n) => (op(e, t, "write to private field"), t.set(e, r), r),
      om = (e, t, r) => (op(e, t, "access private method"), r);
    function ov(e) {
      return (
        !!e &&
        (e instanceof KeyframeEffect ||
          ("getKeyframes" in e && "function" == typeof e.getKeyframes))
      );
    }
    function oy(e, t) {
      let r = e.getAnimations();
      if (r.length > 0)
        for (let e of r) {
          if ("running" !== e.playState) continue;
          let { effect: r } = e,
            n = (ov(r) ? r.getKeyframes() : []).filter(t);
          if (n.length > 0) return [n[n.length - 1], e];
        }
      return null;
    }
    function ob(e) {
      let { width: t, height: r, top: n, left: i, bottom: o, right: a } = e.getBoundingClientRect();
      return { width: t, height: r, top: n, left: i, bottom: o, right: a };
    }
    var ox =
      "u" > typeof window && void 0 !== window.document && void 0 !== window.document.createElement;
    function ow(e) {
      let t = Object.prototype.toString.call(e);
      return "[object Window]" === t || "[object global]" === t;
    }
    function o_(e) {
      return "nodeType" in e;
    }
    function oj(e) {
      var t, r, n;
      return e
        ? ow(e)
          ? e
          : o_(e)
            ? "defaultView" in e
              ? null != (t = e.defaultView)
                ? t
                : window
              : null != (n = null == (r = e.ownerDocument) ? void 0 : r.defaultView)
                ? n
                : window
            : window
        : window;
    }
    function ok(e) {
      let { Document: t } = oj(e);
      return e instanceof t || ("nodeType" in e && e.nodeType === Node.DOCUMENT_NODE);
    }
    function oS(e) {
      return (
        !(!e || ow(e)) &&
        (e instanceof oj(e).HTMLElement ||
          ("namespaceURI" in e &&
            "string" == typeof e.namespaceURI &&
            e.namespaceURI.endsWith("html")))
      );
    }
    function oI(e) {
      return (
        e instanceof oj(e).SVGElement ||
        ("namespaceURI" in e && "string" == typeof e.namespaceURI && e.namespaceURI.endsWith("svg"))
      );
    }
    function oE(e) {
      return e
        ? ow(e)
          ? e.document
          : o_(e)
            ? ok(e)
              ? e
              : oS(e) || oI(e)
                ? e.ownerDocument
                : document
            : document
        : document;
    }
    function oO(e, t = e.getBoundingClientRect(), r = 0) {
      var n;
      let i = t,
        { ownerDocument: o } = e,
        a = null != (n = o.defaultView) ? n : window,
        s = e.parentElement;
      for (; s && s !== o.documentElement; ) {
        if (
          !(function (e) {
            if ("DETAILS" === e.tagName && !1 === e.open) return !1;
            let { overflow: t, overflowX: r, overflowY: n } = getComputedStyle(e);
            return "visible" === t && "visible" === r && "visible" === n;
          })(s)
        ) {
          let e = s.getBoundingClientRect(),
            t = r * (e.bottom - e.top),
            n = r * (e.right - e.left),
            o = r * (e.bottom - e.top),
            a = r * (e.right - e.left);
          (((i = {
            top: Math.max(i.top, e.top - t),
            right: Math.min(i.right, e.right + n),
            bottom: Math.min(i.bottom, e.bottom + o),
            left: Math.max(i.left, e.left - a),
            width: 0,
            height: 0,
          }).width = i.right - i.left),
            (i.height = i.bottom - i.top));
        }
        s = s.parentElement;
      }
      let l = a.innerWidth,
        u = a.innerHeight,
        d = r * u,
        c = r * l;
      return (
        ((i = {
          top: Math.max(i.top, 0 - d),
          right: Math.min(i.right, l + c),
          bottom: Math.min(i.bottom, u + d),
          left: Math.max(i.left, 0 - c),
          width: 0,
          height: 0,
        }).width = i.right - i.left),
        (i.height = i.bottom - i.top),
        i.width < 0 && (i.width = 0),
        i.height < 0 && (i.height = 0),
        i
      );
    }
    function oC() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    function oM(e) {
      return "value" in e;
    }
    function oP(e) {
      return "CANVAS" === e.tagName;
    }
    var oA = new WeakMap(),
      oz = class {
        constructor() {
          ((this.entries = new Set()),
            (this.clear = () => {
              for (let e of this.entries) {
                let [t, { type: r, listener: n, options: i }] = e;
                t.removeEventListener(r, n, i);
              }
              this.entries.clear();
            }));
        }
        bind(e, t) {
          let r = Array.isArray(t) ? t : [t],
            n = [];
          for (let t of r) {
            let { type: r, listener: i, options: o } = t,
              a = [e, t];
            (e.addEventListener(r, i, o), this.entries.add(a), n.push(a));
          }
          return function () {
            for (let [e, { type: t, listener: r, options: i }] of n) e.removeEventListener(t, r, i);
          };
        }
      };
    function oD(e) {
      let t = null == e ? void 0 : e.ownerDocument.defaultView;
      if (t && t.self !== t.parent) return t.frameElement;
    }
    function oL(e, t) {
      let r, n;
      return function (...i) {
        let o = this;
        if (n) {
          let a;
          (null == r || r(),
            (a = setTimeout(
              () => {
                (e.apply(o, i), (n = performance.now()));
              },
              t - (performance.now() - n)
            )),
            (r = () => clearTimeout(a)));
        } else (e.apply(o, i), (n = performance.now()));
      };
    }
    var oN = ox
        ? ResizeObserver
        : class {
            observe() {}
            unobserve() {}
            disconnect() {}
          },
      oT = class extends oN {
        constructor(e) {
          (super((t) => {
            oh(this, e9) ? e(t, this) : og(this, e9, !0);
          }),
            of(this, e9, !1));
        }
      };
    e9 = new WeakMap();
    var oB = Array.from({ length: 100 }, (e, t) => t / 100),
      oR = class {
        constructor(e, t, r = { debug: !1, skipInitial: !1 }) {
          ((this.element = e),
            (this.callback = t),
            of(this, tl),
            (this.disconnect = () => {
              var e, t, r;
              (og(this, ta, !0),
                null == (e = oh(this, tr)) || e.disconnect(),
                null == (t = oh(this, tn)) || t.disconnect(),
                oh(this, ti).disconnect(),
                null == (r = oh(this, to)) || r.remove());
            }),
            of(this, te, !0),
            of(this, tt),
            of(this, tr),
            of(this, tn),
            of(this, ti),
            of(this, to),
            of(this, ta, !1),
            of(
              this,
              ts,
              oL(() => {
                var e, t, r;
                let { element: n } = this;
                if (
                  (null == (e = oh(this, tn)) || e.disconnect(),
                  oh(this, ta) || !oh(this, te) || !n.isConnected)
                )
                  return;
                let i = null != (t = n.ownerDocument) ? t : document,
                  { innerHeight: o, innerWidth: a } = null != (r = i.defaultView) ? r : window,
                  s = n.getBoundingClientRect(),
                  { top: l, left: u, bottom: d, right: c } = oO(n, s),
                  p = -Math.floor(l),
                  h = -Math.floor(u),
                  f = -Math.floor(a - c),
                  g = -Math.floor(o - d),
                  m = `${p}px ${f}px ${g}px ${h}px`;
                ((this.boundingClientRect = s),
                  og(
                    this,
                    tn,
                    new IntersectionObserver(
                      (e) => {
                        let [t] = e,
                          { intersectionRect: r } = t;
                        1 !==
                          (1 !== t.intersectionRatio
                            ? t.intersectionRatio
                            : ig.intersectionRatio(r, oO(n))) && oh(this, ts).call(this);
                      },
                      { threshold: oB, rootMargin: m, root: i }
                    )
                  ),
                  oh(this, tn).observe(n),
                  om(this, tl, tu).call(this));
              }, 75)
            ),
            (this.boundingClientRect = e.getBoundingClientRect()),
            og(
              this,
              te,
              (function (e, t = e.getBoundingClientRect()) {
                let { width: r, height: n } = oO(e, t);
                return r > 0 && n > 0;
              })(e, this.boundingClientRect)
            ));
          let n = !0;
          this.callback = (e) => {
            (n && ((n = !1), r.skipInitial)) || t(e);
          };
          const i = e.ownerDocument;
          ((null == r ? void 0 : r.debug) &&
            (og(this, to, document.createElement("div")),
            (oh(this, to).style.background = "rgba(0,0,0,0.15)"),
            (oh(this, to).style.position = "fixed"),
            (oh(this, to).style.pointerEvents = "none"),
            i.body.appendChild(oh(this, to))),
            og(
              this,
              ti,
              new IntersectionObserver(
                (t) => {
                  var r, n;
                  let { boundingClientRect: i, isIntersecting: o } = t[t.length - 1],
                    { width: a, height: s } = i,
                    l = oh(this, te);
                  (og(this, te, o),
                    (a || s) &&
                      (l && !o
                        ? (null == (r = oh(this, tn)) || r.disconnect(),
                          this.callback(null),
                          null == (n = oh(this, tr)) || n.disconnect(),
                          og(this, tr, void 0),
                          oh(this, to) && (oh(this, to).style.visibility = "hidden"))
                        : oh(this, ts).call(this),
                      o &&
                        !oh(this, tr) &&
                        (og(this, tr, new oT(oh(this, ts))), oh(this, tr).observe(e))));
                },
                { threshold: oB, root: i }
              )
            ),
            oh(this, te) && !r.skipInitial && this.callback(this.boundingClientRect),
            oh(this, ti).observe(e));
        }
      };
    ((te = new WeakMap()),
      (tt = new WeakMap()),
      (tr = new WeakMap()),
      (tn = new WeakMap()),
      (ti = new WeakMap()),
      (to = new WeakMap()),
      (ta = new WeakMap()),
      (ts = new WeakMap()),
      (tl = new WeakSet()),
      (tu = function () {
        var e, t;
        !oh(this, ta) &&
          (om(this, tl, td).call(this),
          (e = this.boundingClientRect) === (t = oh(this, tt)) ||
            (e &&
              t &&
              e.top == t.top &&
              e.left == t.left &&
              e.right == t.right &&
              e.bottom == t.bottom) ||
            (this.callback(this.boundingClientRect), og(this, tt, this.boundingClientRect)));
      }),
      (td = function () {
        if (oh(this, to)) {
          let { top: e, left: t, width: r, height: n } = oO(this.element);
          ((oh(this, to).style.overflow = "hidden"),
            (oh(this, to).style.visibility = "visible"),
            (oh(this, to).style.top = `${Math.floor(e)}px`),
            (oh(this, to).style.left = `${Math.floor(t)}px`),
            (oh(this, to).style.width = `${Math.floor(r)}px`),
            (oh(this, to).style.height = `${Math.floor(n)}px`));
        }
      }));
    var o$ = new WeakMap(),
      oF = new WeakMap(),
      oW = class {
        constructor(e, t, r) {
          ((this.callback = t),
            of(this, tc),
            of(this, tp, !1),
            of(this, th),
            of(
              this,
              tf,
              oL((e) => {
                if (
                  !oh(this, tp) &&
                  e.target &&
                  "contains" in e.target &&
                  "function" == typeof e.target.contains
                ) {
                  for (let t of oh(this, th))
                    if (e.target.contains(t)) {
                      this.callback(oh(this, tc).boundingClientRect);
                      break;
                    }
                }
              }, 75)
            ));
          const n = (function (e) {
              let t = new Set(),
                r = oD(e);
              for (; r; ) (t.add(r), (r = oD(r)));
              return t;
            })(e),
            i = (function (e, t) {
              let r = new Set();
              for (let n of e) {
                let e = (function (e, t) {
                  let r = o$.get(e);
                  return (
                    r ||
                      (r = {
                        disconnect: new oR(
                          e,
                          (t) => {
                            let r = o$.get(e);
                            r && r.callbacks.forEach((e) => e(t));
                          },
                          { skipInitial: !0 }
                        ).disconnect,
                        callbacks: new Set(),
                      }),
                    r.callbacks.add(t),
                    o$.set(e, r),
                    () => {
                      (r.callbacks.delete(t),
                        0 === r.callbacks.size && (o$.delete(e), r.disconnect()));
                    }
                  );
                })(n, t);
                r.add(e);
              }
              return () => r.forEach((e) => e());
            })(n, t),
            o = (function (e, t) {
              var r;
              let n = e.ownerDocument;
              if (!oF.has(n)) {
                let e = new AbortController(),
                  t = new Set();
                (document.addEventListener("scroll", (e) => t.forEach((t) => t(e)), {
                  capture: !0,
                  passive: !0,
                  signal: e.signal,
                }),
                  oF.set(n, { disconnect: () => e.abort(), listeners: t }));
              }
              let { listeners: i, disconnect: o } = null != (r = oF.get(n)) ? r : {};
              return i && o
                ? (i.add(t),
                  () => {
                    (i.delete(t), 0 === i.size && (o(), oF.delete(n)));
                  })
                : () => {};
            })(e, oh(this, tf));
          (og(this, th, n),
            og(this, tc, new oR(e, t, r)),
            (this.disconnect = () => {
              oh(this, tp) || (og(this, tp, !0), i(), o(), oh(this, tc).disconnect());
            }));
        }
      };
    function oH(e) {
      return (
        "showPopover" in e &&
        "hidePopover" in e &&
        "function" == typeof e.showPopover &&
        "function" == typeof e.hidePopover
      );
    }
    function oU(e) {
      try {
        oH(e) &&
          e.isConnected &&
          e.hasAttribute("popover") &&
          !e.matches(":popover-open") &&
          e.showPopover();
      } catch (e) {}
    }
    function oZ(e) {
      return !!ox && !!e && e === oE(e).scrollingElement;
    }
    function oV(e) {
      let t = oj(e),
        r = oZ(e)
          ? (function (e) {
              let { documentElement: t } = oE(e),
                r = t.clientWidth,
                n = t.clientHeight;
              return { top: 0, left: 0, right: r, bottom: n, width: r, height: n };
            })(e)
          : ob(e),
        n = oZ(e)
          ? { height: t.innerHeight, width: t.innerWidth }
          : { height: e.clientHeight, width: e.clientWidth },
        i = {
          current: { x: e.scrollLeft, y: e.scrollTop },
          max: { x: e.scrollWidth - n.width, y: e.scrollHeight - n.height },
        },
        o = i.current.y <= 0,
        a = i.current.x <= 0,
        s = i.current.y >= i.max.y,
        l = i.current.x >= i.max.x;
      return { rect: r, position: i, isTop: o, isLeft: a, isBottom: s, isRight: l };
    }
    ((tc = new WeakMap()), (tp = new WeakMap()), (th = new WeakMap()), (tf = new WeakMap()));
    var oq = class {
        constructor(e) {
          ((this.scheduler = e),
            (this.pending = !1),
            (this.tasks = new Set()),
            (this.resolvers = new Set()),
            (this.flush = () => {
              let { tasks: e, resolvers: t } = this;
              for (let t of ((this.pending = !1),
              (this.tasks = new Set()),
              (this.resolvers = new Set()),
              e))
                t();
              for (let e of t) e();
            }));
        }
        schedule(e) {
          return (
            this.tasks.add(e),
            this.pending || ((this.pending = !0), this.scheduler(this.flush)),
            new Promise((e) => this.resolvers.add(e))
          );
        }
      },
      oY = new oq((e) => {
        "function" == typeof requestAnimationFrame ? requestAnimationFrame(e) : e();
      }),
      oK = new oq((e) => setTimeout(e, 50)),
      oX = new Map(),
      oG = oX.clear.bind(oX);
    function oJ(e, t = !1) {
      if (!t) return oQ(e);
      let r = oX.get(e);
      return (r || ((r = oQ(e)), oX.set(e, r), oK.schedule(oG)), r);
    }
    function oQ(e) {
      return oj(e).getComputedStyle(e);
    }
    var o0 = { excludeElement: !0 };
    function o1(e, t = o0) {
      let { limit: r, excludeElement: n } = t,
        i = new Set();
      return e
        ? (function t(o) {
            if ((null != r && i.size >= r) || !o) return i;
            if (ok(o) && null != o.scrollingElement && !i.has(o.scrollingElement))
              return (i.add(o.scrollingElement), i);
            if (!oS(o)) return oI(o) ? t(o.parentElement) : i;
            if (i.has(o)) return i;
            let a = oJ(o, !0);
            if (
              ((n && o === e) ||
                ((function (e, t = oJ(e, !0)) {
                  let r = /(auto|scroll|overlay)/;
                  return ["overflow", "overflowX", "overflowY"].some((e) => {
                    let n = t[e];
                    return "string" == typeof n && r.test(n);
                  });
                })(o, a) &&
                  i.add(o)),
              (function (e, t = oJ(e, !0)) {
                return "fixed" === t.position || "sticky" === t.position;
              })(o, a))
            ) {
              let { scrollingElement: e } = o.ownerDocument;
              return (e && i.add(e), i);
            }
            return t(o.parentNode);
          })(e)
        : i;
    }
    function o2(e, t = window.frameElement) {
      let r = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
      if (!e) return r;
      let n = oD(e);
      for (; n && n !== t; ) {
        let e = ob(n),
          { x: t, y: i } = (function (e, t = ob(e)) {
            let r = Math.round(t.width),
              n = Math.round(t.height);
            if (oS(e)) return { x: r / e.offsetWidth, y: n / e.offsetHeight };
            let i = oJ(e, !0);
            return { x: (parseFloat(i.width) || r) / r, y: (parseFloat(i.height) || n) / n };
          })(n, e);
        ((r.x = r.x + e.left),
          (r.y = r.y + e.top),
          (r.scaleX = r.scaleX * t),
          (r.scaleY = r.scaleY * i),
          (n = oD(n)));
      }
      return r;
    }
    function o4(e) {
      if ("none" === e) return null;
      let [t, r, n = "0"] = e.split(" "),
        i = { x: parseFloat(t), y: parseFloat(r), z: parseInt(n, 10) };
      return isNaN(i.x) && isNaN(i.y)
        ? null
        : { x: isNaN(i.x) ? 0 : i.x, y: isNaN(i.y) ? 0 : i.y, z: isNaN(i.z) ? 0 : i.z };
    }
    function o5(e) {
      var t, r, n, i, o, a, s, l, u;
      let { scale: d, transform: c, translate: p } = e,
        h = (function (e) {
          if ("none" === e) return null;
          let t = e.split(" "),
            r = parseFloat(t[0]),
            n = parseFloat(t[1]);
          return isNaN(r) && isNaN(n) ? null : { x: isNaN(r) ? n : r, y: isNaN(n) ? r : n };
        })(d),
        f = o4(p),
        g = (function (e) {
          if (e.startsWith("matrix3d(")) {
            let t = e.slice(9, -1).split(/, /);
            return { x: +t[12], y: +t[13], scaleX: +t[0], scaleY: +t[5] };
          }
          if (e.startsWith("matrix(")) {
            let t = e.slice(7, -1).split(/, /);
            return { x: +t[4], y: +t[5], scaleX: +t[0], scaleY: +t[3] };
          }
          return null;
        })(c);
      if (!g && !h && !f) return null;
      let m = {
          x: null != (t = null == h ? void 0 : h.x) ? t : 1,
          y: null != (r = null == h ? void 0 : h.y) ? r : 1,
        },
        v = {
          x: null != (n = null == f ? void 0 : f.x) ? n : 0,
          y: null != (i = null == f ? void 0 : f.y) ? i : 0,
        },
        y = {
          x: null != (o = null == g ? void 0 : g.x) ? o : 0,
          y: null != (a = null == g ? void 0 : g.y) ? a : 0,
          scaleX: null != (s = null == g ? void 0 : g.scaleX) ? s : 1,
          scaleY: null != (l = null == g ? void 0 : g.scaleY) ? l : 1,
        };
      return {
        x: v.x + y.x,
        y: v.y + y.y,
        z: null != (u = null == f ? void 0 : f.z) ? u : 0,
        scaleX: m.x * y.scaleX,
        scaleY: m.y * y.scaleY,
      };
    }
    var o6 =
        (((v = o6 || {})[(v.Idle = 0)] = "Idle"),
        (v[(v.Forward = 1)] = "Forward"),
        (v[(v.Reverse = -1)] = "Reverse"),
        v),
      o3 = { x: 0.2, y: 0.2 },
      o8 = { x: 10, y: 10 };
    function o7(e, t = !1) {
      if ("scrollIntoViewIfNeeded" in e && "function" == typeof e.scrollIntoViewIfNeeded)
        return void e.scrollIntoViewIfNeeded(t);
      if (!oS(e)) return e.scrollIntoView();
      var r = (function (e) {
        let [t] = o1(e, { limit: 1 });
        return null != t ? t : null;
      })(e);
      if (!oS(r)) return;
      let n = oJ(r, !0),
        i = parseInt(n.getPropertyValue("border-top-width")),
        o = parseInt(n.getPropertyValue("border-left-width")),
        a = e.offsetTop - r.offsetTop < r.scrollTop,
        s = e.offsetTop - r.offsetTop + e.clientHeight - i > r.scrollTop + r.clientHeight,
        l = e.offsetLeft - r.offsetLeft < r.scrollLeft,
        u = e.offsetLeft - r.offsetLeft + e.clientWidth - o > r.scrollLeft + r.clientWidth;
      ((a || s) &&
        t &&
        (r.scrollTop = e.offsetTop - r.offsetTop - r.clientHeight / 2 - i + e.clientHeight / 2),
        (l || u) &&
          t &&
          (r.scrollLeft = e.offsetLeft - r.offsetLeft - r.clientWidth / 2 - o + e.clientWidth / 2),
        (a || s || l || u) && !t && e.scrollIntoView(a && !s));
    }
    function o9({ element: e, keyframes: t, options: r }) {
      return e.animate(t, r).finished;
    }
    function ae(e, t = oJ(e).translate, r = !0) {
      if (r) {
        let t = oy(e, (e) => "translate" in e);
        if (t) {
          let { translate: e = "" } = t[0];
          if ("string" == typeof e) {
            let t = o4(e);
            if (t) return t;
          }
        }
      }
      if (t) {
        let e = o4(t);
        if (e) return e;
      }
      return { x: 0, y: 0, z: 0 };
    }
    var at = new oq((e) => setTimeout(e, 0)),
      ar = new Map(),
      an = ar.clear.bind(ar),
      ai = class extends ig {
        constructor(e, t = {}) {
          var r, n, i, o;
          let a;
          const {
              frameTransform: s = o2(e),
              ignoreTransforms: l,
              getBoundingClientRect: u = ob,
            } = t,
            d = (function (e, t) {
              let r = (function (e) {
                let t = e.ownerDocument,
                  r = ar.get(t);
                if (r) return r;
                ((r = t.getAnimations()), ar.set(t, r), at.schedule(an));
                let n = r.filter((t) => ov(t.effect) && t.effect.target === e);
                return (ar.set(e, n), r);
              })(e)
                .filter((e) => {
                  var r, n;
                  if (ov(e.effect)) {
                    let { target: i } = e.effect;
                    if (
                      null == (n = i && (null == (r = t.isValidTarget) ? void 0 : r.call(t, i))) ||
                      n
                    )
                      return e.effect.getKeyframes().some((e) => {
                        for (let r of t.properties) if (e[r]) return !0;
                      });
                  }
                })
                .map((e) => {
                  let { effect: t, currentTime: r } = e,
                    n = null == t ? void 0 : t.getComputedTiming().duration;
                  if (
                    !e.pending &&
                    "finished" !== e.playState &&
                    "number" == typeof n &&
                    "number" == typeof r &&
                    r < n
                  )
                    return (
                      (e.currentTime = n),
                      () => {
                        e.currentTime = r;
                      }
                    );
                });
              if (r.length > 0) return () => r.forEach((e) => (null == e ? void 0 : e()));
            })(e, {
              properties: ["transform", "translate", "scale", "width", "height"],
              isValidTarget: (t) => (t !== e || oC()) && t.contains(e),
            }),
            c = u(e);
          let { top: p, left: h, width: f, height: g } = c;
          const m = oJ(e),
            v = o5(m),
            y = {
              x: null != (r = null == v ? void 0 : v.scaleX) ? r : 1,
              y: null != (n = null == v ? void 0 : v.scaleY) ? n : 1,
            },
            b = (function (e, t) {
              var r;
              let n = e.getAnimations(),
                i = null;
              if (!n.length) return null;
              for (let e of n) {
                if ("running" !== e.playState) continue;
                let n = ov(e.effect) ? e.effect.getKeyframes() : [],
                  o = n[n.length - 1];
                if (!o) continue;
                let { transform: a, translate: s, scale: l } = o;
                if (a || s || l) {
                  let e = o5({
                    transform: "string" == typeof a && a ? a : t.transform,
                    translate: "string" == typeof s && s ? s : t.translate,
                    scale: "string" == typeof l && l ? l : t.scale,
                  });
                  e &&
                    (i = i
                      ? {
                          x: i.x + e.x,
                          y: i.y + e.y,
                          z: null != (r = i.z) ? r : e.z,
                          scaleX: i.scaleX * e.scaleX,
                          scaleY: i.scaleY * e.scaleY,
                        }
                      : e);
                }
              }
              return i;
            })(e, m);
          (null == d || d(),
            v &&
              ((a = (function (e, t, r) {
                let { scaleX: n, scaleY: i, x: o, y: a } = t,
                  s = e.left - o - (1 - n) * parseFloat(r),
                  l = e.top - a - (1 - i) * parseFloat(r.slice(r.indexOf(" ") + 1)),
                  u = n ? e.width / n : e.width,
                  d = i ? e.height / i : e.height;
                return { width: u, height: d, top: l, right: s + u, bottom: l + d, left: s };
              })(c, v, m.transformOrigin)),
              (l || b) && ((p = a.top), (h = a.left), (f = a.width), (g = a.height))));
          const w = {
            width: null != (i = null == a ? void 0 : a.width) ? i : f,
            height: null != (o = null == a ? void 0 : a.height) ? o : g,
          };
          if (b && !l && a) {
            const e = (function (e, t, r) {
              let { scaleX: n, scaleY: i, x: o, y: a } = t,
                s = e.left + o + (1 - n) * parseFloat(r),
                l = e.top + a + (1 - i) * parseFloat(r.slice(r.indexOf(" ") + 1)),
                u = n ? e.width * n : e.width,
                d = i ? e.height * i : e.height;
              return { width: u, height: d, top: l, right: s + u, bottom: l + d, left: s };
            })(a, b, m.transformOrigin);
            ((p = e.top),
              (h = e.left),
              (f = e.width),
              (g = e.height),
              (y.x = b.scaleX),
              (y.y = b.scaleY));
          }
          (s &&
            (l || ((h *= s.scaleX), (f *= s.scaleX), (p *= s.scaleY), (g *= s.scaleY)),
            (h += s.x),
            (p += s.y)),
            super(h, p, f, g),
            (this.scale = y),
            (this.intrinsicWidth = w.width),
            (this.intrinsicHeight = w.height));
        }
      };
    function ao(e) {
      return (
        "style" in e &&
        "object" == typeof e.style &&
        null !== e.style &&
        "setProperty" in e.style &&
        "removeProperty" in e.style &&
        "function" == typeof e.style.setProperty &&
        "function" == typeof e.style.removeProperty
      );
    }
    var aa = class {
      constructor(e) {
        ((this.element = e), (this.initial = new Map()));
      }
      set(e, t = "") {
        let { element: r } = this;
        if (ao(r))
          for (let [n, i] of Object.entries(e)) {
            let e = `${t}${n}`;
            (this.initial.has(e) || this.initial.set(e, r.style.getPropertyValue(e)),
              r.style.setProperty(e, "string" == typeof i ? i : `${i}px`));
          }
      }
      remove(e, t = "") {
        let { element: r } = this;
        if (ao(r))
          for (let n of e) {
            let e = `${t}${n}`;
            r.style.removeProperty(e);
          }
      }
      reset() {
        let { element: e } = this;
        if (ao(e)) {
          for (let [t, r] of this.initial) e.style.setProperty(t, r);
          "" === e.getAttribute("style") && e.removeAttribute("style");
        }
      }
    };
    function as(e) {
      return !!e && (e instanceof oj(e).Element || (o_(e) && e.nodeType === Node.ELEMENT_NODE));
    }
    function al(e) {
      if (!e) return !1;
      let { KeyboardEvent: t } = oj(e.target);
      return e instanceof t;
    }
    var au = {};
    function ad(e) {
      let t = null == au[e] ? 0 : au[e] + 1;
      return ((au[e] = t), `${e}-${t}`);
    }
    var ac = (e) => {
        var t;
        return null !=
          (t = (({ dragOperation: e, droppable: t }) => {
            let r = e.position.current;
            if (!r) return null;
            let { id: n } = t;
            return t.shape && t.shape.containsPoint(r)
              ? {
                  id: n,
                  value: 1 / ih.distance(t.shape.center, r),
                  type: i7.PointerIntersection,
                  priority: i8.High,
                }
              : null;
          })(e))
          ? t
          : (({ dragOperation: e, droppable: t }) => {
              let { shape: r } = e;
              if (!t.shape || !(null == r ? void 0 : r.current)) return null;
              let n = r.current.intersectionArea(t.shape);
              if (n) {
                let { position: i } = e,
                  o = ih.distance(t.shape.center, i.current),
                  a = n / (r.current.area + t.shape.area - n);
                return { id: t.id, value: a / o, type: i7.ShapeIntersection, priority: i8.Normal };
              }
              return null;
            })(e);
      },
      ap = (e) => {
        let { dragOperation: t, droppable: r } = e,
          { shape: n, position: i } = t;
        if (!r.shape) return null;
        let o = n ? ig.from(n.current.boundingRectangle).corners : void 0,
          a = ig.from(r.shape.boundingRectangle).corners.reduce((e, t, r) => {
            var n;
            return (
              e + ih.distance(ih.from(t), null != (n = null == o ? void 0 : o[r]) ? n : i.current)
            );
          }, 0);
        return { id: r.id, value: 1 / (a / 4), type: i7.Collision, priority: i8.Normal };
      },
      ah = Object.create,
      af = Object.defineProperty,
      ag = Object.defineProperties,
      am = Object.getOwnPropertyDescriptor,
      av = Object.getOwnPropertyDescriptors,
      ay = Object.getOwnPropertySymbols,
      ab = Object.prototype.hasOwnProperty,
      ax = Object.prototype.propertyIsEnumerable,
      aw = (e, t) => ((t = Symbol[e]) ? t : Symbol.for("Symbol." + e)),
      a_ = (e) => {
        throw TypeError(e);
      },
      aj = (e, t, r) =>
        t in e
          ? af(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      ak = (e, t) => {
        for (var r in t || (t = {})) ab.call(t, r) && aj(e, r, t[r]);
        if (ay) for (var r of ay(t)) ax.call(t, r) && aj(e, r, t[r]);
        return e;
      },
      aS = (e, t) => af(e, "name", { value: t, configurable: !0 }),
      aI = (e, t) => {
        var r = {};
        for (var n in e) ab.call(e, n) && 0 > t.indexOf(n) && (r[n] = e[n]);
        if (null != e && ay)
          for (var n of ay(e)) 0 > t.indexOf(n) && ax.call(e, n) && (r[n] = e[n]);
        return r;
      },
      aE = (e) => {
        var t;
        return [, , , ah(null != (t = null == e ? void 0 : e[aw("metadata")]) ? t : null)];
      },
      aO = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      aC = (e) => (void 0 !== e && "function" != typeof e ? a_("Function expected") : e),
      aM = (e, t, r, n, i) => ({
        kind: aO[e],
        name: t,
        metadata: n,
        addInitializer: (e) => (r._ ? a_("Already initialized") : i.push(aC(e || null))),
      }),
      aP = (e, t) => aj(t, aw("metadata"), e[3]),
      aA = (e, t, r, n) => {
        for (var i = 0, o = e[t >> 1], a = o && o.length; i < a; i++)
          1 & t ? o[i].call(r) : (n = o[i].call(r, n));
        return n;
      },
      az = (e, t, r, n, i, o) => {
        var a,
          s,
          l,
          u,
          d,
          c = 7 & t,
          p = !!(8 & t),
          h = !!(16 & t),
          f = c > 3 ? e.length + 1 : c ? (p ? 1 : 2) : 0,
          g = aO[c + 5],
          m = c > 3 && (e[f - 1] = []),
          v = e[f] || (e[f] = []),
          y =
            c &&
            (h || p || (i = i.prototype),
            c < 5 &&
              (c > 3 || !h) &&
              am(
                c < 4
                  ? i
                  : {
                      get [r]() {
                        return aN(this, o);
                      },
                      set [r](x) {
                        return aB(this, o, x);
                      },
                    },
                r
              ));
        c ? h && c < 4 && aS(o, (c > 2 ? "set " : c > 1 ? "get " : "") + r) : aS(i, r);
        for (var b = n.length - 1; b >= 0; b--)
          ((u = aM(c, r, (l = {}), e[3], v)),
            c &&
              ((u.static = p),
              (u.private = h),
              (d = u.access = { has: h ? (e) => aL(i, e) : (e) => r in e }),
              3 ^ c &&
                (d.get = h ? (e) => (1 ^ c ? aN : aR)(e, i, 4 ^ c ? o : y.get) : (e) => e[r]),
              c > 2 &&
                (d.set = h ? (e, t) => aB(e, i, t, 4 ^ c ? o : y.set) : (e, t) => (e[r] = t))),
            (s = (0, n[b])(
              c ? (c < 4 ? (h ? o : y[g]) : c > 4 ? void 0 : { get: y.get, set: y.set }) : i,
              u
            )),
            (l._ = 1),
            4 ^ c || void 0 === s
              ? aC(s) && (c > 4 ? m.unshift(s) : c ? (h ? (o = s) : (y[g] = s)) : (i = s))
              : "object" != typeof s || null === s
                ? a_("Object expected")
                : (aC((a = s.get)) && (y.get = a),
                  aC((a = s.set)) && (y.set = a),
                  aC((a = s.init)) && m.unshift(a)));
        return (c || aP(e, i), y && af(i, r, y), h ? (4 ^ c ? o : y) : i);
      },
      aD = (e, t, r) => t.has(e) || a_("Cannot " + r),
      aL = (e, t) =>
        Object(t) !== t ? a_('Cannot use the "in" operator on this value') : e.has(t),
      aN = (e, t, r) => (aD(e, t, "read from private field"), r ? r.call(e) : t.get(e)),
      aT = (e, t, r) =>
        t.has(e)
          ? a_("Cannot add the same private member more than once")
          : t instanceof WeakSet
            ? t.add(e)
            : t.set(e, r),
      aB = (e, t, r, n) => (aD(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r),
      aR = (e, t, r) => (aD(e, t, "access private method"), r),
      a$ = {
        draggable:
          "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item in a given direction. Press space again to drop the item in its new position, or press escape to cancel.",
      },
      aF = {
        dragstart({ operation: { source: e } }) {
          if (e) return `Picked up draggable item ${e.id}.`;
        },
        dragover({ operation: { source: e, target: t } }) {
          if (e && e.id !== (null == t ? void 0 : t.id))
            return t
              ? `Draggable item ${e.id} was moved over droppable target ${t.id}.`
              : `Draggable item ${e.id} is no longer over a droppable target.`;
        },
        dragend({ operation: { source: e, target: t }, canceled: r }) {
          if (e)
            return r
              ? `Dragging was cancelled. Draggable item ${e.id} was dropped.`
              : t
                ? `Draggable item ${e.id} was dropped over droppable target ${t.id}`
                : `Draggable item ${e.id} was dropped.`;
        },
      },
      aW = ["dragover", "dragmove"],
      aH = class extends iG {
        constructor(e, t) {
          let r, n, i, o;
          super(e);
          const {
              id: a,
              idPrefix: {
                description: s = "dnd-kit-description",
                announcement: l = "dnd-kit-announcement",
              } = {},
              announcements: u = aF,
              screenReaderInstructions: d = a$,
              debounce: c = 500,
            } = null != t ? t : {},
            p = a ? `${s}-${a}` : ad(s),
            h = a ? `${l}-${a}` : ad(l),
            f = (e = o) => {
              i && e && (null == i ? void 0 : i.nodeValue) !== e && (i.nodeValue = e);
            },
            g = () => oY.schedule(f),
            m = (function (e, t) {
              let r,
                n = () => {
                  (clearTimeout(r), (r = setTimeout(e, t)));
                };
              return ((n.cancel = () => clearTimeout(r)), n);
            })(g, c),
            v = Object.entries(u).map(([e, t]) =>
              this.manager.monitor.addEventListener(e, (r, n) => {
                let a = i;
                if (!a) return;
                let s = null == t ? void 0 : t(r, n);
                s && a.nodeValue !== s && ((o = s), aW.includes(e) ? m() : (g(), m.cancel()));
              })
            ),
            y = () => {
              var e;
              let t = [];
              if (!(null == r ? void 0 : r.isConnected)) {
                let n;
                ((e = d.draggable),
                  ((n = document.createElement("div")).id = p),
                  n.style.setProperty("display", "none"),
                  (n.textContent = e),
                  (r = n),
                  t.push(r));
              }
              if (!(null == n ? void 0 : n.isConnected)) {
                let e;
                (((e = document.createElement("div")).id = h),
                  e.setAttribute("role", "status"),
                  e.setAttribute("aria-live", "polite"),
                  e.setAttribute("aria-atomic", "true"),
                  e.style.setProperty("position", "fixed"),
                  e.style.setProperty("width", "1px"),
                  e.style.setProperty("height", "1px"),
                  e.style.setProperty("margin", "-1px"),
                  e.style.setProperty("border", "0"),
                  e.style.setProperty("padding", "0"),
                  e.style.setProperty("overflow", "hidden"),
                  e.style.setProperty("clip", "rect(0 0 0 0)"),
                  e.style.setProperty("clip-path", "inset(100%)"),
                  e.style.setProperty("white-space", "nowrap"),
                  (n = e),
                  (i = document.createTextNode("")),
                  n.appendChild(i),
                  t.push(n));
              }
              t.length > 0 && document.body.append(...t);
            },
            b = new Set();
          function w() {
            for (let e of b) e();
          }
          (this.registerEffect(() => {
            var e;
            for (let t of (b.clear(), this.manager.registry.draggables.value)) {
              let i = null != (e = t.handle) ? e : t.element;
              if (i) {
                for (let e of ((r && n) || b.add(y),
                (!["input", "select", "textarea", "a", "button"].includes(
                  i.tagName.toLowerCase()
                ) ||
                  oC()) &&
                  !i.hasAttribute("tabindex") &&
                  b.add(() => i.setAttribute("tabindex", "0")),
                i.hasAttribute("role") ||
                  "button" === i.tagName.toLowerCase() ||
                  b.add(() => i.setAttribute("role", "button")),
                i.hasAttribute("aria-roledescription") ||
                  b.add(() => i.setAttribute("aria-roledescription", "draggable")),
                i.hasAttribute("aria-describedby") ||
                  b.add(() => i.setAttribute("aria-describedby", p)),
                ["aria-pressed", "aria-grabbed"])) {
                  let r = String(t.isDragging);
                  i.getAttribute(e) !== r && b.add(() => i.setAttribute(e, r));
                }
                let e = String(t.disabled);
                i.getAttribute("aria-disabled") !== e &&
                  b.add(() => i.setAttribute("aria-disabled", e));
              }
            }
            b.size > 0 && oY.schedule(w);
          }),
            (this.destroy = () => {
              (super.destroy(),
                null == r || r.remove(),
                null == n || n.remove(),
                v.forEach((e) => e()));
            }));
        }
      },
      aU = class extends iG {
        constructor(e, t) {
          (super(e, t), (this.manager = e));
          const r = nV(() => {
            var e;
            return oE(null == (e = this.manager.dragOperation.source) ? void 0 : e.element);
          });
          this.destroy = n_(() => {
            var e;
            let { dragOperation: t } = this.manager,
              { cursor: n = "grabbing", nonce: i } = null != (e = this.options) ? e : {};
            if (t.status.initialized) {
              let e = r.value,
                t = e.createElement("style");
              return (
                i && t.setAttribute("nonce", i),
                (t.textContent = `* { cursor: ${n} !important; }`),
                e.head.appendChild(t),
                () => t.remove()
              );
            }
          });
        }
      },
      aZ = "data-dnd-",
      aV = `${aZ}dropping`,
      aq = "--dnd-",
      aY = `${aZ}dragging`,
      aK = `${aZ}placeholder`,
      aX = [aY, aK, "popover", "aria-pressed", "aria-grabbing"],
      aG = ["view-transition-name"],
      aJ = `
  :root [${aY}] {
    position: fixed !important;
    pointer-events: none !important;
    touch-action: none;
    z-index: calc(infinity);
    will-change: translate;
    top: var(${aq}top, 0px) !important;
    left: var(${aq}left, 0px) !important;
    right: unset !important;
    bottom: unset !important;
    width: var(${aq}width, auto);
    max-width: var(${aq}width, auto);
    height: var(${aq}height, auto);
    max-height: var(${aq}height, auto);
    transition: var(${aq}transition) !important;
  }

  :root [${aK}] {
    transition: none;
  }

  :root [${aK}='hidden'] {
    visibility: hidden;
  }

  [${aY}] * {
    pointer-events: none !important;
  }

  [${aY}]:not([${aV}]) {
    translate: var(${aq}translate) !important;
  }

  [${aY}][style*='${aq}scale'] {
    scale: var(${aq}scale) !important;
    transform-origin: var(${aq}transform-origin) !important;
  }

  @layer {
    :where([${aY}][popover]) {
      overflow: visible;
      background: unset;
      border: unset;
      margin: unset;
      padding: unset;
      color: inherit;

      &:is(input, button) {
        border: revert;
        background: revert;
      }
    }
  }
  [${aY}]::backdrop, [${aZ}overlay]:not([${aY}]) {
    display: none;
    visibility: hidden;
  }
`
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    function aQ(e, t) {
      return e === t || oD(e) === oD(t);
    }
    function a0(e) {
      let { target: t } = e;
      "newState" in e &&
        "closed" === e.newState &&
        as(t) &&
        t.hasAttribute("popover") &&
        requestAnimationFrame(() => oU(t));
    }
    function a1(e) {
      return "TR" === e.tagName;
    }
    var a2 = new Map(),
      a4 = class extends ((tm = iG), (tg = [nY]), tm) {
        constructor(e, t) {
          (super(e, t),
            aT(this, tb),
            aT(this, ty, aA(tv, 8, this)),
            aA(tv, 11, this),
            (this.state = { initial: {}, current: {} }),
            this.registerEffect(aR(this, tb, tw)),
            this.registerEffect(aR(this, tb, tx)));
        }
        destroy() {
          for (let [e, t] of (super.destroy(), a2.entries()))
            t.instances.has(this) &&
              (t.instances.delete(this), 0 === t.instances.size && (t.cleanup(), a2.delete(e)));
        }
      };
    ((tv = aE(tm)),
      (ty = new WeakMap()),
      (tb = new WeakSet()),
      (tx = function () {
        var e, t, r;
        let n,
          i,
          { state: o, manager: a, options: s } = this,
          { dragOperation: l } = a,
          { position: u, source: d, status: c } = l;
        if (c.idle) {
          ((o.current = {}), (o.initial = {}));
          return;
        }
        if (!d) return;
        let { element: p, feedback: h } = d;
        if (!p || "none" === h || !c.initialized || c.initializing) return;
        let { initial: f } = o,
          g = null != (e = this.overlay) ? e : p,
          m = o2(g),
          v = o2(p),
          y = !aQ(p, g),
          b = new ai(p, { frameTransform: y ? v : null, ignoreTransforms: !y }),
          w = { x: v.scaleX / m.scaleX, y: v.scaleY / m.scaleY },
          { width: _, height: j, top: k, left: S } = b;
        y && ((_ /= w.x), (j /= w.y));
        let I = new aa(g),
          {
            transition: E,
            translate: O,
            boxSizing: C,
            paddingBlockStart: M,
            paddingBlockEnd: P,
            paddingInlineStart: A,
            paddingInlineEnd: z,
            borderInlineStartWidth: D,
            borderInlineEndWidth: L,
            borderBlockStartWidth: N,
            borderBlockEndWidth: T,
          } = oJ(p),
          B = "clone" === h,
          R = "content-box" === C,
          $ = R ? parseInt(A) + parseInt(z) + parseInt(D) + parseInt(L) : 0,
          F = R ? parseInt(M) + parseInt(P) + parseInt(N) + parseInt(T) : 0,
          W =
            "move" === h || this.overlay
              ? null
              : (function (e, t = "hidden") {
                  return nr(() => {
                    let r,
                      n,
                      i,
                      { element: o, manager: a } = e;
                    if (!o || !a) return;
                    let s = (function (e, t) {
                        let r = new Map();
                        for (let n of t)
                          if (n.element && (e === n.element || e.contains(n.element))) {
                            let e = `${aZ}${ad("dom-id")}`;
                            (n.element.setAttribute(e, ""), r.set(n, e));
                          }
                        return r;
                      })(o, a.registry.droppables),
                      l = [],
                      u =
                        ((r = "input, textarea, select, canvas, [contenteditable]"),
                        (n = o.cloneNode(!0)),
                        (i = Array.from(o.querySelectorAll(r))),
                        Array.from(n.querySelectorAll(r)).forEach((e, t) => {
                          let r = i[t];
                          if (
                            (oM(e) &&
                              oM(r) &&
                              ("file" !== e.type && (e.value = r.value),
                              "radio" === e.type && e.name && (e.name = `Cloned__${e.name}`)),
                            oP(e) && oP(r) && r.width > 0 && r.height > 0)
                          ) {
                            let t = e.getContext("2d");
                            null == t || t.drawImage(r, 0, 0);
                          }
                        }),
                        n),
                      { remove: d } = u;
                    return (
                      (function (e, t, r) {
                        for (let [n, i] of e) {
                          if (!n.element) continue;
                          let e = `[${i}]`,
                            o = t.matches(e) ? t : t.querySelector(e);
                          if ((n.element.removeAttribute(i), !o)) continue;
                          let a = n.element;
                          ((n.proxy = o),
                            o.removeAttribute(i),
                            oA.set(a, o),
                            r.push(() => {
                              (oA.delete(a), (n.proxy = void 0));
                            }));
                        }
                      })(s, u, l),
                      (function (e, t = "hidden") {
                        (e.setAttribute("inert", "true"),
                          e.setAttribute("tab-index", "-1"),
                          e.setAttribute("aria-hidden", "true"),
                          e.setAttribute(aK, t));
                      })(u, t),
                      (u.remove = () => {
                        (l.forEach((e) => e()), d.call(u));
                      }),
                      u
                    );
                  });
                })(d, B ? "clone" : "hidden"),
          H = nr(() => al(a.dragOperation.activatorEvent));
        if ("none" !== O) {
          let e = o4(O);
          e && !f.translate && (f.translate = e);
        }
        if (!f.transformOrigin) {
          let e = nr(() => u.current);
          f.transformOrigin = {
            x: (e.x - S * m.scaleX - m.x) / (_ * m.scaleX),
            y: (e.y - k * m.scaleY - m.y) / (j * m.scaleY),
          };
        }
        let { transformOrigin: U } = f,
          Z = k * m.scaleY + m.y,
          V = S * m.scaleX + m.x;
        if (!f.coordinates && ((f.coordinates = { x: V, y: Z }), 1 !== w.x || 1 !== w.y)) {
          let { scaleX: e, scaleY: t } = v,
            { x: r, y: n } = U;
          ((f.coordinates.x += (_ * e - _) * r), (f.coordinates.y += (j * t - j) * n));
        }
        (f.dimensions || (f.dimensions = { width: _, height: j }),
          f.frameTransform || (f.frameTransform = m));
        let q = { x: f.coordinates.x - V, y: f.coordinates.y - Z },
          Y = {
            width: (f.dimensions.width * f.frameTransform.scaleX - _ * m.scaleX) * U.x,
            height: (f.dimensions.height * f.frameTransform.scaleY - j * m.scaleY) * U.y,
          },
          K = { x: q.x / m.scaleX + Y.width, y: q.y / m.scaleY + Y.height },
          X = { left: S + K.x, top: k + K.y };
        g.setAttribute(aY, "true");
        let G = nr(() => l.transform),
          J = null != (t = f.translate) ? t : { x: 0, y: 0 },
          Q = G.x * m.scaleX + J.x,
          ee = G.y * m.scaleY + J.y,
          et = `${Q}px ${ee}px 0`,
          er = E ? `${E}, translate 0ms linear` : "";
        (I.set(
          {
            width: _ - $,
            height: j - F,
            top: X.top,
            left: X.left,
            translate: et,
            transition: er,
            scale: y ? `${w.x} ${w.y}` : "",
            "transform-origin": `${100 * U.x}% ${100 * U.y}%`,
          },
          aq
        ),
          W &&
            (p.insertAdjacentElement("afterend", W),
            (null == s ? void 0 : s.rootElement) &&
              ("function" == typeof s.rootElement ? s.rootElement(d) : s.rootElement).appendChild(
                p
              )),
          oH(g) &&
            (g.hasAttribute("popover") || g.setAttribute("popover", "manual"),
            oU(g),
            g.addEventListener("beforetoggle", a0)));
        let en = new ResizeObserver(() => {
            if (!W) return;
            let e = new ai(W, { frameTransform: m, ignoreTransforms: !0 }),
              t = null != U ? U : { x: 1, y: 1 },
              r = (_ - e.width) * t.x + K.x,
              i = (j - e.height) * t.y + K.y;
            if (
              (I.set({ width: e.width - $, height: e.height - F, top: k + i, left: S + r }, aq),
              null == n || n.takeRecords(),
              a1(p) && a1(W))
            ) {
              let e = Array.from(p.cells),
                t = Array.from(W.cells);
              for (let [r, n] of e.entries()) {
                let e = t[r];
                n.style.width = `${e.offsetWidth}px`;
              }
            }
            l.shape = new ai(g);
          }),
          ei = new ai(g);
        nr(() => (l.shape = ei));
        let eo = oj(g),
          ea = (e) => {
            this.manager.actions.stop({ event: e });
          };
        (H && eo.addEventListener("resize", ea),
          "idle" === nr(() => d.status) && requestAnimationFrame(() => (d.status = "dragging")),
          W &&
            (en.observe(W),
            (n = new MutationObserver((e) => {
              let t = !1;
              for (let r of e) {
                if (r.target !== p) {
                  t = !0;
                  continue;
                }
                if ("attributes" !== r.type) continue;
                let e = r.attributeName;
                if (e.startsWith("aria-") || aX.includes(e)) continue;
                let n = p.getAttribute(e);
                if ("style" === e) {
                  if (ao(p) && ao(W)) {
                    let e = p.style;
                    for (let t of Array.from(W.style))
                      "" === e.getPropertyValue(t) && W.style.removeProperty(t);
                    for (let t of Array.from(e)) {
                      if (aG.includes(t) || t.startsWith(aq)) continue;
                      let r = e.getPropertyValue(t);
                      W.style.setProperty(t, r);
                    }
                  }
                } else null !== n ? W.setAttribute(e, n) : W.removeAttribute(e);
              }
              t && B && (W.innerHTML = p.innerHTML);
            })).observe(p, { attributes: !0, subtree: !0, childList: !0 }),
            (i = new MutationObserver((e) => {
              for (let t of e)
                if (0 !== t.addedNodes.length)
                  for (let e of Array.from(t.addedNodes)) {
                    if (e.contains(p) && p.nextElementSibling !== W) {
                      (p.insertAdjacentElement("afterend", W), oU(g));
                      return;
                    }
                    if (e.contains(W) && W.previousElementSibling !== p) {
                      (W.insertAdjacentElement("beforebegin", p), oU(g));
                      return;
                    }
                  }
            })).observe(p.ownerDocument.body, { childList: !0, subtree: !0 })));
        let es = null == (r = a.dragOperation.source) ? void 0 : r.id,
          el = () => {
            var e;
            if (!H || null == es) return;
            let t = a.registry.draggables.get(es),
              r = null != (e = null == t ? void 0 : t.handle) ? e : null == t ? void 0 : t.element;
            oS(r) && r.focus();
          },
          eu = () => {
            (null == n || n.disconnect(),
              null == i || i.disconnect(),
              en.disconnect(),
              eo.removeEventListener("resize", ea),
              oH(g) && (g.removeEventListener("beforetoggle", a0), g.removeAttribute("popover")),
              g.removeAttribute(aY),
              I.reset(),
              (d.status = "idle"));
            let e = null != o.current.translate;
            (W && (e || W.parentElement !== g.parentElement) && g.isConnected && W.replaceWith(g),
              null == W || W.remove());
          },
          ed = nG(
            () => {
              var e;
              let { transform: t, status: r } = l;
              if ((t.x || t.y || o.current.translate) && r.dragging) {
                let r = null != (e = f.translate) ? e : { x: 0, y: 0 },
                  i = { x: t.x / m.scaleX + r.x, y: t.y / m.scaleY + r.y },
                  a = o.current.translate,
                  s = nr(() => l.modifiers),
                  u = nr(() => {
                    var e;
                    return null == (e = l.shape) ? void 0 : e.current;
                  });
                if (
                  (I.set(
                    {
                      transition: `${E}, translate ${H ? "250ms cubic-bezier(0.25, 1, 0.5, 1)" : "0ms linear"}`,
                      translate: `${i.x}px ${i.y}px 0`,
                    },
                    aq
                  ),
                  null == n || n.takeRecords(),
                  u && u !== ei && a && !s.length)
                ) {
                  let e = ih.delta(i, a);
                  l.shape = ig.from(u.boundingRectangle).translate(e.x * m.scaleX, e.y * m.scaleY);
                } else l.shape = new ai(g);
                o.current.translate = i;
              }
            },
            function () {
              if (l.status.dropped) {
                (this.dispose(), (d.status = "dropping"));
                let e = o.current.translate,
                  t = null != e;
                if ((e || p === g || (e = { x: 0, y: 0 }), !e)) return void eu();
                a.renderer.rendering.then(() => {
                  var r, i;
                  {
                    oU(g);
                    let [, o] = null != (r = oy(g, (e) => "translate" in e)) ? r : [];
                    null == o || o.pause();
                    let a = null != W ? W : p,
                      s = { frameTransform: aQ(g, a) ? null : void 0 },
                      l = new ai(g, s),
                      u = null != (i = o4(oJ(g).translate)) ? i : e,
                      c = new ai(a, s),
                      h = ig.delta(l, c, d.alignment),
                      f = { x: u.x - h.x, y: u.y - h.y },
                      m =
                        Math.round(l.intrinsicHeight) !== Math.round(c.intrinsicHeight)
                          ? {
                              minHeight: [`${l.intrinsicHeight}px`, `${c.intrinsicHeight}px`],
                              maxHeight: [`${l.intrinsicHeight}px`, `${c.intrinsicHeight}px`],
                            }
                          : {},
                      v =
                        Math.round(l.intrinsicWidth) !== Math.round(c.intrinsicWidth)
                          ? {
                              minWidth: [`${l.intrinsicWidth}px`, `${c.intrinsicWidth}px`],
                              maxWidth: [`${l.intrinsicWidth}px`, `${c.intrinsicWidth}px`],
                            }
                          : {};
                    (I.set({ transition: E }, aq),
                      g.setAttribute(aV, ""),
                      null == n || n.takeRecords(),
                      o9({
                        element: g,
                        keyframes: ag(
                          ak(ak({}, m), v),
                          av({ translate: [`${u.x}px ${u.y}px 0`, `${f.x}px ${f.y}px 0`] })
                        ),
                        options: { duration: t || g !== p ? 250 : 0, easing: "ease" },
                      }).then(() => {
                        (g.removeAttribute(aV),
                          null == o || o.finish(),
                          eu(),
                          requestAnimationFrame(el));
                      }));
                  }
                });
              }
            }
          );
        return () => {
          (eu(), ed());
        };
      }),
      (tw = function () {
        var e, t, r;
        let { status: n, source: i, target: o } = this.manager.dragOperation,
          { nonce: a } = null != (e = this.options) ? e : {};
        if (n.initializing)
          for (let e of new Set([
            oE(null != (t = null == i ? void 0 : i.element) ? t : null),
            oE(null != (r = null == o ? void 0 : o.element) ? r : null),
          ])) {
            let t = a2.get(e);
            if (!t) {
              let r = document.createElement("style");
              ((r.textContent = aJ), a && r.setAttribute("nonce", a), e.head.prepend(r));
              let n = new MutationObserver((t) => {
                for (let n of t)
                  if ("childList" === n.type) {
                    let t = Array.from(n.removedNodes);
                    t.length > 0 && t.includes(r) && e.head.prepend(r);
                  }
              });
              (n.observe(e.head, { childList: !0 }),
                (t = {
                  cleanup: () => {
                    (n.disconnect(), r.remove());
                  },
                  instances: new Set(),
                }),
                a2.set(e, t));
            }
            t.instances.add(this);
          }
      }),
      az(tv, 4, "overlay", tg, a4, ty),
      aP(tv, a4),
      (a4.configure = iK(a4)),
      (tk = [nY]),
      (tS = o6.Forward),
      (t_ = [nY]),
      (tj = o6.Reverse));
    var a5 = class {
      constructor() {
        (aT(this, tE, aA(tI, 8, this, !0)),
          aA(tI, 11, this),
          aT(this, tO, aA(tI, 12, this, !0)),
          aA(tI, 15, this));
      }
      isLocked(e) {
        return (
          e !== o6.Idle &&
          (null == e ? !0 === this[o6.Forward] && !0 === this[o6.Reverse] : !0 === this[e])
        );
      }
      unlock(e) {
        e !== o6.Idle && (this[e] = !1);
      }
    };
    ((tI = aE(null)),
      (tE = new WeakMap()),
      (tO = new WeakMap()),
      az(tI, 4, tS, tk, a5, tE),
      az(tI, 4, tj, t_, a5, tO),
      aP(tI, a5));
    var a6 = [o6.Forward, o6.Reverse],
      a3 = class {
        constructor() {
          ((this.x = new a5()), (this.y = new a5()));
        }
        isLocked() {
          return this.x.isLocked() && this.y.isLocked();
        }
      },
      a8 = class extends iG {
        constructor(e) {
          super(e);
          const t = nh(new a3());
          let r = null;
          ((this.signal = t),
            n_(() => {
              let { status: n } = e.dragOperation;
              if (!n.initialized) {
                ((r = null), (t.value = new a3()));
                return;
              }
              let { delta: i } = e.dragOperation.position;
              if (r) {
                let e = { x: a7(i.x, r.x), y: a7(i.y, r.y) },
                  n = t.peek();
                ne(() => {
                  for (let t of ib) for (let r of a6) e[t] === r && n[t].unlock(r);
                  t.value = n;
                });
              }
              r = i;
            }));
        }
        get current() {
          return this.signal.peek();
        }
      };
    function a7(e, t) {
      return Math.sign(e - t);
    }
    var a9 = class extends ((tM = iJ), (tC = [nY]), tM) {
      constructor(e) {
        (super(e),
          aT(this, tA, aA(tP, 8, this, !1)),
          aA(tP, 11, this),
          aT(this, tz),
          aT(this, tD, () => {
            if (!aN(this, tz)) return;
            let { element: e, by: t } = aN(this, tz);
            (t.y && (e.scrollTop += t.y), t.x && (e.scrollLeft += t.x));
          }),
          (this.scroll = (e) => {
            var t;
            if (this.disabled) return !1;
            let r = this.getScrollableElements();
            if (!r) return (aB(this, tz, void 0), !1);
            let { position: n } = this.manager.dragOperation,
              i = null == n ? void 0 : n.current;
            if (i) {
              let { by: n } = null != e ? e : {},
                o = n ? { x: se(n.x), y: se(n.y) } : void 0,
                a = o ? void 0 : this.scrollIntentTracker.current;
              if (null == a ? void 0 : a.isLocked()) return !1;
              for (let e of r) {
                let r = (function (e, t) {
                  let { isTop: r, isBottom: n, isLeft: i, isRight: o, position: a } = oV(e),
                    { x: s, y: l } = null != t ? t : { x: 0, y: 0 },
                    u = !r && a.current.y + l > 0,
                    d = !n && a.current.y + l < a.max.y,
                    c = !i && a.current.x + s > 0,
                    p = !o && a.current.x + s < a.max.x;
                  return { top: u, bottom: d, left: c, right: p, x: c || p, y: u || d };
                })(e, n);
                if (r.x || r.y) {
                  let { speed: r, direction: s } = (function (e, t, r, n = 25, i = o3, o = o8) {
                    let { x: a, y: s } = t,
                      { rect: l, isTop: u, isBottom: d, isLeft: c, isRight: p } = oV(e),
                      h = o2(e),
                      f = o5(oJ(e, !0)),
                      g = null !== f && (null == f ? void 0 : f.scaleX) < 0,
                      m = null !== f && (null == f ? void 0 : f.scaleY) < 0,
                      v = new ig(
                        l.left * h.scaleX + h.x,
                        l.top * h.scaleY + h.y,
                        l.width * h.scaleX,
                        l.height * h.scaleY
                      ),
                      y = { x: 0, y: 0 },
                      b = { x: 0, y: 0 },
                      w = { height: v.height * i.y, width: v.width * i.x };
                    return (
                      (!u || (m && !d)) &&
                      s <= v.top + w.height &&
                      (null == r ? void 0 : r.y) !== 1 &&
                      a >= v.left - o.x &&
                      a <= v.right + o.x
                        ? ((y.y = m ? 1 : -1),
                          (b.y = n * Math.abs((v.top + w.height - s) / w.height)))
                        : (!d || (m && !u)) &&
                          s >= v.bottom - w.height &&
                          (null == r ? void 0 : r.y) !== -1 &&
                          a >= v.left - o.x &&
                          a <= v.right + o.x &&
                          ((y.y = m ? -1 : 1),
                          (b.y = n * Math.abs((v.bottom - w.height - s) / w.height))),
                      (!p || (g && !c)) &&
                      a >= v.right - w.width &&
                      (null == r ? void 0 : r.x) !== -1 &&
                      s >= v.top - o.y &&
                      s <= v.bottom + o.y
                        ? ((y.x = g ? -1 : 1),
                          (b.x = n * Math.abs((v.right - w.width - a) / w.width)))
                        : (!c || (g && !p)) &&
                          a <= v.left + w.width &&
                          (null == r ? void 0 : r.x) !== 1 &&
                          s >= v.top - o.y &&
                          s <= v.bottom + o.y &&
                          ((y.x = g ? 1 : -1),
                          (b.x = n * Math.abs((v.left + w.width - a) / w.width))),
                      { direction: y, speed: b }
                    );
                  })(e, i, o);
                  if (a) for (let e of ib) a[e].isLocked(s[e]) && ((r[e] = 0), (s[e] = 0));
                  if (s.x || s.y) {
                    let { x: i, y: o } = null != n ? n : s,
                      a = i * r.x,
                      l = o * r.y;
                    if (a || l) {
                      let r = null == (t = aN(this, tz)) ? void 0 : t.by;
                      if (this.autoScrolling && r && ((r.x && !a) || (r.y && !l))) continue;
                      return (
                        aB(this, tz, { element: e, by: { x: a, y: l } }),
                        oY.schedule(aN(this, tD)),
                        !0
                      );
                    }
                  }
                }
              }
            }
            return (aB(this, tz, void 0), !1);
          }));
        let t = null,
          r = null;
        const n = nV(() => {
            let { position: r, source: n } = e.dragOperation;
            if (!r) return null;
            let i = (function e(t, { x: r, y: n }) {
              var i;
              let o = t.elementFromPoint(r, n);
              if ((null == (i = o) ? void 0 : i.tagName) === "IFRAME") {
                let { contentDocument: t } = o;
                if (t) {
                  let { left: i, top: a } = o.getBoundingClientRect();
                  return e(t, { x: r - i, y: n - a });
                }
              }
              return o;
            })(oE(null == n ? void 0 : n.element), r.current);
            return (i && (t = i), null != i ? i : t);
          }),
          i = nV(() => {
            let t = n.value,
              { documentElement: i } = oE(t);
            if (!t || t === i) {
              let { target: t } = e.dragOperation,
                n = null == t ? void 0 : t.element;
              if (n) {
                let e = o1(n, { excludeElement: !1 });
                return ((r = e), e);
              }
            }
            if (t) {
              let e = o1(t, { excludeElement: !1 });
              return this.autoScrolling && r && e.size < (null == r ? void 0 : r.size)
                ? r
                : ((r = e), e);
            }
            return ((r = null), null);
          }, nq);
        ((this.getScrollableElements = () => i.value),
          (this.scrollIntentTracker = new a8(e)),
          (this.destroy = e.monitor.addEventListener("dragmove", (t) => {
            !this.disabled &&
              !t.defaultPrevented &&
              al(e.dragOperation.activatorEvent) &&
              t.by &&
              this.scroll({ by: t.by }) &&
              t.preventDefault();
          })));
      }
    };
    function se(e) {
      return e > 0 ? o6.Forward : e < 0 ? o6.Reverse : o6.Idle;
    }
    ((tP = aE(tM)),
      (tA = new WeakMap()),
      (tz = new WeakMap()),
      (tD = new WeakMap()),
      az(tP, 4, "autoScrolling", tC, a9, tA),
      aP(tP, a9));
    var st = new (class {
        constructor(e) {
          ((this.scheduler = e),
            (this.pending = !1),
            (this.tasks = new Set()),
            (this.resolvers = new Set()),
            (this.flush = () => {
              let { tasks: e, resolvers: t } = this;
              for (let t of ((this.pending = !1),
              (this.tasks = new Set()),
              (this.resolvers = new Set()),
              e))
                t();
              for (let e of t) e();
            }));
        }
        schedule(e) {
          return (
            this.tasks.add(e),
            this.pending || ((this.pending = !0), this.scheduler(this.flush)),
            new Promise((e) => this.resolvers.add(e))
          );
        }
      })((e) => {
        "function" == typeof requestAnimationFrame ? requestAnimationFrame(e) : e();
      }),
      sr = class extends iG {
        constructor(e, t) {
          super(e);
          const r = e.registry.plugins.get(a9);
          if (!r) throw Error("AutoScroller plugin depends on Scroller plugin");
          this.destroy = n_(() => {
            if (this.disabled) return;
            let { position: t, status: n } = e.dragOperation;
            if (n.dragging) {
              if (r.scroll()) {
                r.autoScrolling = !0;
                let e = setInterval(() => st.schedule(r.scroll), 10);
                return () => {
                  clearInterval(e);
                };
              }
              r.autoScrolling = !1;
            }
          });
        }
      },
      sn = { capture: !0, passive: !0 },
      si = class extends iJ {
        constructor(e) {
          (super(e),
            aT(this, tL),
            (this.handleScroll = () => {
              null == aN(this, tL) &&
                aB(
                  this,
                  tL,
                  setTimeout(() => {
                    (this.manager.collisionObserver.forceUpdate(!1), aB(this, tL, void 0));
                  }, 50)
                );
            }));
          const { dragOperation: t } = this.manager;
          this.destroy = n_(() => {
            var e, r, n;
            if (t.status.dragging) {
              let i =
                null !=
                (n =
                  null == (r = null == (e = t.source) ? void 0 : e.element)
                    ? void 0
                    : r.ownerDocument)
                  ? n
                  : document;
              return (
                i.addEventListener("scroll", this.handleScroll, sn),
                () => {
                  i.removeEventListener("scroll", this.handleScroll, sn);
                }
              );
            }
          });
        }
      };
    tL = new WeakMap();
    var so = class extends iG {
      constructor(e, t) {
        (super(e, t),
          (this.manager = e),
          (this.destroy = n_(() => {
            var e;
            let { dragOperation: t } = this.manager,
              { nonce: r } = null != (e = this.options) ? e : {};
            if (t.status.initialized) {
              let e = document.createElement("style");
              return (
                r && e.setAttribute("nonce", r),
                (e.textContent =
                  "* { user-select: none !important; -webkit-user-select: none !important; }"),
                document.head.appendChild(e),
                sa(),
                document.addEventListener("selectionchange", sa, { capture: !0 }),
                () => {
                  (document.removeEventListener("selectionchange", sa, { capture: !0 }),
                    e.remove());
                }
              );
            }
          })));
      }
    };
    function sa() {
      var e;
      null == (e = document.getSelection()) || e.removeAllRanges();
    }
    var ss = Object.freeze({
        offset: 10,
        keyboardCodes: {
          start: ["Space", "Enter"],
          cancel: ["Escape"],
          end: ["Space", "Enter", "Tab"],
          up: ["ArrowUp"],
          down: ["ArrowDown"],
          left: ["ArrowLeft"],
          right: ["ArrowRight"],
        },
        shouldActivate(e) {
          var t;
          let { event: r, source: n } = e,
            i = null != (t = n.handle) ? t : n.element;
          return r.target === i;
        },
      }),
      sl = class extends oo {
        constructor(e, t) {
          (super(e),
            (this.manager = e),
            (this.options = t),
            aT(this, tN, []),
            (this.listeners = new oz()),
            (this.handleSourceKeyDown = (e, t, r) => {
              if (this.disabled || e.defaultPrevented || !as(e.target) || t.disabled) return;
              let { keyboardCodes: n = ss.keyboardCodes, shouldActivate: i = ss.shouldActivate } =
                null != r ? r : {};
              !n.start.includes(e.code) ||
                (this.manager.dragOperation.status.idle &&
                  i({ event: e, source: t, manager: this.manager }) &&
                  this.handleStart(e, t, r));
            }));
        }
        bind(e, t = this.options) {
          return n_(() => {
            var r;
            let n = null != (r = e.handle) ? r : e.element,
              i = (r) => {
                al(r) && this.handleSourceKeyDown(r, e, t);
              };
            if (n)
              return (
                n.addEventListener("keydown", i),
                () => {
                  n.removeEventListener("keydown", i);
                }
              );
          });
        }
        handleStart(e, t, r) {
          let { element: n } = t;
          if (!n) throw Error("Source draggable does not have an associated element");
          (e.preventDefault(), e.stopImmediatePropagation(), o7(n));
          let { center: i } = new ai(n);
          if (
            this.manager.actions.start({ event: e, coordinates: { x: i.x, y: i.y }, source: t })
              .signal.aborted
          )
            return this.cleanup();
          this.sideEffects();
          let o = oE(n),
            a = [
              this.listeners.bind(o, [
                {
                  type: "keydown",
                  listener: (e) => this.handleKeyDown(e, t, r),
                  options: { capture: !0 },
                },
              ]),
            ];
          aN(this, tN).push(...a);
        }
        handleKeyDown(e, t, r) {
          let { keyboardCodes: n = ss.keyboardCodes } = null != r ? r : {};
          if (su(e, [...n.end, ...n.cancel])) {
            e.preventDefault();
            let t = su(e, n.cancel);
            this.handleEnd(e, t);
            return;
          }
          (su(e, n.up) ? this.handleMove("up", e) : su(e, n.down) && this.handleMove("down", e),
            su(e, n.left)
              ? this.handleMove("left", e)
              : su(e, n.right) && this.handleMove("right", e));
        }
        handleEnd(e, t) {
          (this.manager.actions.stop({ event: e, canceled: t }), this.cleanup());
        }
        handleMove(e, t) {
          var r, n;
          let { shape: i } = this.manager.dragOperation,
            o = t.shiftKey ? 5 : 1,
            a = { x: 0, y: 0 },
            s = null != (n = null == (r = this.options) ? void 0 : r.offset) ? n : ss.offset;
          if (("number" == typeof s && (s = { x: s, y: s }), i)) {
            switch (e) {
              case "up":
                a = { x: 0, y: -s.y * o };
                break;
              case "down":
                a = { x: 0, y: s.y * o };
                break;
              case "left":
                a = { x: -s.x * o, y: 0 };
                break;
              case "right":
                a = { x: s.x * o, y: 0 };
            }
            (a.x || a.y) && (t.preventDefault(), this.manager.actions.move({ event: t, by: a }));
          }
        }
        sideEffects() {
          let e = this.manager.registry.plugins.get(sr);
          (null == e ? void 0 : e.disabled) === !1 &&
            (e.disable(),
            aN(this, tN).push(() => {
              e.enable();
            }));
        }
        cleanup() {
          (aN(this, tN).forEach((e) => e()), aB(this, tN, []));
        }
        destroy() {
          (this.cleanup(), this.listeners.clear());
        }
      };
    function su(e, t) {
      return t.includes(e.code);
    }
    ((tN = new WeakMap()), (sl.configure = iK(sl)), (sl.defaults = ss));
    var sd = Object.freeze({
        activationConstraints(e, t) {
          var r;
          let { pointerType: n, target: i } = e;
          if (
            !(
              "mouse" === n &&
              as(i) &&
              (t.handle === i || (null == (r = t.handle) ? void 0 : r.contains(i)))
            )
          )
            return "touch" === n
              ? { delay: { value: 250, tolerance: 5 } }
              : (function (e) {
                    var t;
                    if (!as(e)) return !1;
                    let { tagName: r } = e;
                    return (
                      "INPUT" === r ||
                      "TEXTAREA" === r ||
                      ((t = e).hasAttribute("contenteditable") &&
                        "false" !== t.getAttribute("contenteditable"))
                    );
                  })(i) && !e.defaultPrevented
                ? { delay: { value: 200, tolerance: 0 } }
                : { delay: { value: 200, tolerance: 10 }, distance: { value: 5 } };
        },
      }),
      sc = class extends oo {
        constructor(e, t) {
          (super(e),
            (this.manager = e),
            (this.options = t),
            aT(this, tT, new Set()),
            aT(this, tB),
            (this.listeners = new oz()),
            (this.latest = { event: void 0, coordinates: void 0 }),
            (this.handleMove = () => {
              let { event: e, coordinates: t } = this.latest;
              e && t && this.manager.actions.move({ event: e, to: t });
            }),
            (this.handleCancel = this.handleCancel.bind(this)),
            (this.handlePointerUp = this.handlePointerUp.bind(this)),
            (this.handleKeyDown = this.handleKeyDown.bind(this)));
        }
        activationConstraints(e, t) {
          var r;
          let { activationConstraints: n = sd.activationConstraints } =
            null != (r = this.options) ? r : {};
          return "function" == typeof n ? n(e, t) : n;
        }
        bind(e, t = this.options) {
          return n_(() => {
            var r, n;
            let i = new AbortController(),
              { signal: o } = i,
              a = (r) => {
                (function (e) {
                  if (!e) return !1;
                  let { PointerEvent: t } = oj(e.target);
                  return e instanceof t;
                })(r) && this.handlePointerDown(r, e, t);
              },
              s = [null != (r = e.handle) ? r : e.element];
            for (let r of ((null == t ? void 0 : t.activatorElements) &&
              (s = Array.isArray(t.activatorElements)
                ? t.activatorElements
                : t.activatorElements(e)),
            s)) {
              r &&
                (!(n = r.ownerDocument.defaultView) ||
                  sf.has(n) ||
                  (n.addEventListener("touchmove", sh, { capture: !1, passive: !1 }), sf.add(n)),
                r.addEventListener("pointerdown", a, { signal: o }));
            }
            return () => i.abort();
          });
        }
        handlePointerDown(e, t, r = {}) {
          if (
            this.disabled ||
            !e.isPrimary ||
            0 !== e.button ||
            !as(e.target) ||
            t.disabled ||
            "sensor" in e ||
            !this.manager.dragOperation.status.idle
          )
            return;
          let { target: n } = e,
            i = oS(n) && n.draggable && "true" === n.getAttribute("draggable"),
            o = o2(t.element);
          this.initialCoordinates = {
            x: e.clientX * o.scaleX + o.x,
            y: e.clientY * o.scaleY + o.y,
          };
          let a = this.activationConstraints(e, t);
          if (
            ((e.sensor = this), (null == a ? void 0 : a.delay) || (null == a ? void 0 : a.distance))
          ) {
            let { delay: r } = a;
            if (r) {
              let n = setTimeout(() => this.handleStart(t, e), r.value);
              aB(this, tB, () => {
                (clearTimeout(n), aB(this, tB, void 0));
              });
            }
          } else this.handleStart(t, e);
          let s = oE(e.target),
            l = this.listeners.bind(s, [
              { type: "pointermove", listener: (e) => this.handlePointerMove(e, t) },
              { type: "pointerup", listener: this.handlePointerUp, options: { capture: !0 } },
              { type: "dragstart", listener: i ? this.handleCancel : sp, options: { capture: !0 } },
            ]),
            u = () => {
              var e;
              (l(), null == (e = aN(this, tB)) || e.call(this), (this.initialCoordinates = void 0));
            };
          aN(this, tT).add(u);
        }
        handlePointerMove(e, t) {
          let r = { x: e.clientX, y: e.clientY },
            n = o2(t.element);
          if (
            ((r.x = r.x * n.scaleX + n.x),
            (r.y = r.y * n.scaleY + n.y),
            this.manager.dragOperation.status.dragging)
          ) {
            (e.preventDefault(),
              e.stopPropagation(),
              (this.latest.event = e),
              (this.latest.coordinates = r),
              oY.schedule(this.handleMove));
            return;
          }
          if (!this.initialCoordinates) return;
          let i = { x: r.x - this.initialCoordinates.x, y: r.y - this.initialCoordinates.y },
            o = this.activationConstraints(e, t),
            { distance: a, delay: s } = null != o ? o : {};
          if (a) {
            if (null != a.tolerance && iv(i, a.tolerance)) return this.handleCancel(e);
            if (iv(i, a.value)) return this.handleStart(t, e);
          }
          if (s && iv(i, s.tolerance)) return this.handleCancel(e);
        }
        handlePointerUp(e) {
          let { status: t } = this.manager.dragOperation;
          if (!t.idle) {
            (e.preventDefault(), e.stopPropagation());
            let r = !t.initialized;
            this.manager.actions.stop({ event: e, canceled: r });
          }
          this.cleanup();
        }
        handleKeyDown(e) {
          "Escape" === e.key && (e.preventDefault(), this.handleCancel(e));
        }
        handleStart(e, t) {
          var r;
          let { manager: n, initialCoordinates: i } = this;
          if (
            (null == (r = aN(this, tB)) || r.call(this),
            !i || !n.dragOperation.status.idle || t.defaultPrevented)
          )
            return;
          if (n.actions.start({ coordinates: i, event: t, source: e }).signal.aborted)
            return this.cleanup();
          t.preventDefault();
          let o = oE(t.target),
            a = o.body;
          a.setPointerCapture(t.pointerId);
          let s = this.listeners.bind(o, [
            { type: "touchmove", listener: sp, options: { passive: !1 } },
            { type: "click", listener: sp },
            { type: "contextmenu", listener: sp },
            { type: "keydown", listener: this.handleKeyDown },
            {
              type: "lostpointercapture",
              listener: (e) => {
                e.target === a && this.handlePointerUp(e);
              },
            },
          ]);
          aN(this, tT).add(s);
        }
        handleCancel(e) {
          let { dragOperation: t } = this.manager;
          (t.status.initialized && this.manager.actions.stop({ event: e, canceled: !0 }),
            this.cleanup());
        }
        cleanup() {
          ((this.latest = { event: void 0, coordinates: void 0 }),
            aN(this, tT).forEach((e) => e()),
            aN(this, tT).clear());
        }
        destroy() {
          (this.cleanup(), this.listeners.clear());
        }
      };
    function sp(e) {
      e.preventDefault();
    }
    function sh() {}
    ((tT = new WeakMap()), (tB = new WeakMap()), (sc.configure = iK(sc)), (sc.defaults = sd));
    var sf = new WeakSet(),
      sg = [],
      sm = [aH, sr, aU, a4, so],
      sv = [sc, sl],
      sy = class extends od {
        constructor(e = {}) {
          const { plugins: t = sm, sensors: r = sv, modifiers: n = [] } = e;
          super(
            ((e, t) => ag(e, av(t)))(ak({}, e), {
              plugins: [si, a9, ...t],
              sensors: r,
              modifiers: n,
            })
          );
        }
      },
      sb = class extends ((tW = on), (tF = [nY]), (t$ = [nY]), (tR = [nY]), tW) {
        constructor(e, t) {
          var { element: r, effects: n = () => [], handle: i, feedback: o = "default" } = e;
          (super(
            ak(
              {
                effects: () => [
                  ...n(),
                  () => {
                    var e, t;
                    let { manager: r } = this;
                    if (!r) return;
                    let n = (
                      null != (t = null == (e = this.sensors) ? void 0 : e.map(iX))
                        ? t
                        : [...r.sensors]
                    ).map((e) => {
                      let t = e instanceof oo ? e : r.registry.register(e.plugin),
                        n = e instanceof oo ? void 0 : e.options;
                      return t.bind(this, n);
                    });
                    return function () {
                      n.forEach((e) => e());
                    };
                  },
                ],
              },
              aI(e, ["element", "effects", "handle", "feedback"])
            ),
            t
          ),
            aT(this, tU, aA(tH, 8, this)),
            aA(tH, 11, this),
            aT(this, tZ, aA(tH, 12, this)),
            aA(tH, 15, this),
            aT(this, tV, aA(tH, 16, this)),
            aA(tH, 19, this),
            (this.element = r),
            (this.handle = i),
            (this.feedback = o));
        }
      };
    ((tH = aE(tW)),
      (tU = new WeakMap()),
      (tZ = new WeakMap()),
      (tV = new WeakMap()),
      az(tH, 4, "handle", tF, sb, tU),
      az(tH, 4, "element", t$, sb, tZ),
      az(tH, 4, "feedback", tR, sb, tV),
      aP(tH, sb));
    var sx = class extends ((tK = oi), (tY = [nY]), (tq = [nY]), tK) {
      constructor(e, t) {
        var { element: r, effects: n = () => [] } = e,
          i = aI(e, ["element", "effects"]);
        const { collisionDetector: o = ac } = i,
          a = (e) => {
            let { manager: t, element: r } = this;
            if (!r || null === e) {
              this.shape = void 0;
              return;
            }
            if (!t) return;
            let n = new ai(r),
              i = nr(() => this.shape);
            return n && (null == i ? void 0 : i.equals(n)) ? i : ((this.shape = n), n);
          },
          s = nh(!1);
        (super(
          ((e, t) => ag(e, av(t)))(ak({}, i), {
            collisionDetector: o,
            effects: () => [
              ...n(),
              () => {
                let { element: e, manager: t } = this;
                if (!t) return;
                let { dragOperation: r } = t,
                  { source: n } = r;
                s.value = !!(n && r.status.initialized && e && !this.disabled && this.accepts(n));
              },
              () => {
                let { element: e } = this;
                if (s.value && e) {
                  let t = new oW(e, a);
                  return () => {
                    (t.disconnect(), (this.shape = void 0));
                  };
                }
              },
              () => {
                var e;
                if (null == (e = this.manager) ? void 0 : e.dragOperation.status.initialized)
                  return () => {
                    this.shape = void 0;
                  };
              },
            ],
          }),
          t
        ),
          aT(this, t1),
          aT(this, tG, aA(tX, 8, this)),
          aA(tX, 11, this),
          aT(this, t2, aA(tX, 12, this)),
          aA(tX, 15, this),
          (this.element = r),
          (this.refreshShape = () => a()));
      }
      set element(e) {
        aB(this, t1, e, t0);
      }
      get element() {
        var e;
        return null != (e = this.proxy) ? e : aN(this, t1, tQ);
      }
    };
    ((tX = aE(tK)),
      (tG = new WeakMap()),
      (t1 = new WeakSet()),
      (t2 = new WeakMap()),
      (tQ = (tJ = az(tX, 20, "#element", tY, t1, tG)).get),
      (t0 = tJ.set),
      az(tX, 4, "proxy", tq, sx, t2),
      aP(tX, sx));
    var sw = e.i(74080);
    function s_(e) {
      var t;
      if (null != e)
        return null != e && "object" == typeof e && "current" in e
          ? null != (t = e.current)
            ? t
            : void 0
          : e;
    }
    var sj =
      "u" > typeof window && void 0 !== window.document && void 0 !== window.document.createElement
        ? rs.useLayoutEffect
        : rs.useEffect;
    function sk(e, t) {
      let r,
        n = (0, rs.useRef)(new Map()),
        i =
          ((r = (0, rs.useState)(0)[1]),
          (0, rs.useCallback)(() => {
            r((e) => e + 1);
          }, [r]));
      return (
        sj(
          () =>
            e
              ? n_(() => {
                  var r;
                  let o = !1,
                    a = !1;
                  for (let i of n.current) {
                    let [s] = i,
                      l = nr(() => i[1]),
                      u = e[s];
                    l !== u &&
                      ((o = !0),
                      n.current.set(s, u),
                      (a = null != (r = null == t ? void 0 : t(s, l, u)) && r));
                  }
                  o && (a ? (0, sw.flushSync)(i) : i());
                })
              : void n.current.clear(),
          [e]
        ),
        (0, rs.useMemo)(
          () =>
            e
              ? new Proxy(e, {
                  get(e, t) {
                    let r = e[t];
                    return (n.current.set(t, r), r);
                  },
                })
              : e,
          [e]
        )
      );
    }
    function sS(e, t) {
      e();
    }
    function sI(e) {
      let t = (0, rs.useRef)(e);
      return (
        sj(() => {
          t.current = e;
        }, [e]),
        t
      );
    }
    function sE(e, t, r = rs.useEffect, n = Object.is) {
      let i = (0, rs.useRef)(e);
      r(() => {
        let r = i.current;
        n(e, r) || ((i.current = e), t(e, r));
      }, [t, e]);
    }
    function sO(e, t) {
      let r = (0, rs.useRef)(s_(e));
      sj(() => {
        let n = s_(e);
        n !== r.current && ((r.current = n), t(n));
      });
    }
    var sC = Object.defineProperty,
      sM = Object.defineProperties,
      sP = Object.getOwnPropertyDescriptors,
      sA = Object.getOwnPropertySymbols,
      sz = Object.prototype.hasOwnProperty,
      sD = Object.prototype.propertyIsEnumerable,
      sL = (e, t, r) =>
        t in e
          ? sC(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      sN = (e, t) => {
        for (var r in t || (t = {})) sz.call(t, r) && sL(e, r, t[r]);
        if (sA) for (var r of sA(t)) sD.call(t, r) && sL(e, r, t[r]);
        return e;
      },
      sT = new sy(),
      sB = (0, rs.createContext)(sT),
      sR = (0, rs.memo)(
        (0, rs.forwardRef)(({ children: e }, t) => {
          let [r, n] = (0, rs.useState)(0),
            i = (0, rs.useRef)(null),
            o = (0, rs.useRef)(null),
            a = (0, rs.useMemo)(
              () => ({
                renderer: {
                  get rendering() {
                    var e;
                    return null != (e = i.current) ? e : Promise.resolve();
                  },
                },
                trackRendering(e) {
                  (i.current ||
                    (i.current = new Promise((e) => {
                      o.current = e;
                    })),
                    (0, rs.startTransition)(() => {
                      (e(), n((e) => e + 1));
                    }));
                },
              }),
              []
            );
          return (
            sj(() => {
              var e;
              (null == (e = o.current) || e.call(o), (i.current = null));
            }, [e, r]),
            (0, rs.useImperativeHandle)(t, () => a),
            null
          );
        })
      ),
      s$ = [void 0, nq];
    function sF(e) {
      var t,
        {
          children: r,
          onCollision: n,
          onBeforeDragStart: i,
          onDragStart: o,
          onDragMove: a,
          onDragOver: s,
          onDragEnd: l,
        } = e,
        u = ((e, t) => {
          var r = {};
          for (var n in e) sz.call(e, n) && 0 > t.indexOf(n) && (r[n] = e[n]);
          if (null != e && sA)
            for (var n of sA(e)) 0 > t.indexOf(n) && sD.call(e, n) && (r[n] = e[n]);
          return r;
        })(e, [
          "children",
          "onCollision",
          "onBeforeDragStart",
          "onDragStart",
          "onDragMove",
          "onDragOver",
          "onDragEnd",
        ]);
      let d = (0, rs.useRef)(null),
        [c, p] = (0, rs.useState)(null != (t = u.manager) ? t : null),
        { plugins: h, modifiers: f, sensors: g } = u,
        m = sI(i),
        v = sI(o),
        y = sI(s),
        b = sI(a),
        w = sI(l),
        _ = sI(n);
      return (
        (0, rs.useEffect)(() => {
          var e;
          if (!d.current) throw Error("Renderer not found");
          let { renderer: t, trackRendering: r } = d.current,
            n = null != (e = u.manager) ? e : new sy(u);
          return (
            (n.renderer = t),
            n.monitor.addEventListener("beforedragstart", (e) => {
              let t = m.current;
              t && r(() => t(e, n));
            }),
            n.monitor.addEventListener("dragstart", (e) => {
              var t;
              return null == (t = v.current) ? void 0 : t.call(v, e, n);
            }),
            n.monitor.addEventListener("dragover", (e) => {
              let t = y.current;
              t && r(() => t(e, n));
            }),
            n.monitor.addEventListener("dragmove", (e) => {
              let t = b.current;
              t && r(() => t(e, n));
            }),
            n.monitor.addEventListener("dragend", (e) => {
              let t = w.current;
              t && r(() => t(e, n));
            }),
            n.monitor.addEventListener("collision", (e) => {
              var t;
              return null == (t = _.current) ? void 0 : t.call(_, e, n);
            }),
            (0, rs.startTransition)(() => p(n)),
            n.destroy
          );
        }, [u.manager]),
        sE(h, () => c && (c.plugins = null != h ? h : sm), ...s$),
        sE(g, () => c && (c.sensors = null != g ? g : sv), ...s$),
        sE(f, () => c && (c.modifiers = null != f ? f : sg), ...s$),
        (0, ra.jsxs)(sB.Provider, {
          value: c,
          children: [(0, ra.jsx)(sR, { ref: d, children: r }), r],
        })
      );
    }
    function sW() {
      return (0, rs.useContext)(sB);
    }
    function sH(e) {
      var t;
      let r = null != (t = sW()) ? t : void 0,
        [n] = (0, rs.useState)(() => e(r));
      return (n.manager !== r && (n.manager = r), sj(n.register, [r, n]), n);
    }
    function sU(e, t, r) {
      return "isDragSource" === e && !r && !!t;
    }
    var sZ = Object.create,
      sV = Object.defineProperty,
      sq = Object.getOwnPropertyDescriptor,
      sY = (e, t) => ((t = Symbol[e]) ? t : Symbol.for("Symbol." + e)),
      sK = (e) => {
        throw TypeError(e);
      },
      sX = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      sG = (e) => (void 0 !== e && "function" != typeof e ? sK("Function expected") : e),
      sJ = (e, t, r, n, i) => ({
        kind: sX[e],
        name: t,
        metadata: n,
        addInitializer: (e) => (r._ ? sK("Already initialized") : i.push(sG(e || null))),
      }),
      sQ = (e, t, r, n, i, o) => {
        for (
          var a,
            s,
            l,
            u = 7 & t,
            d = sX[u + 5],
            c = e[2] || (e[2] = []),
            p = sq((i = i.prototype), r),
            h = n.length - 1;
          h >= 0;
          h--
        )
          (((l = sJ(u, r, (s = {}), e[3], c)).static = !1),
            (l.private = !1),
            ((l.access = { has: (e) => r in e }).get = (e) => e[r]),
            (a = (0, n[h])(p[d], l)),
            (s._ = 1),
            sG(a) && (p[d] = a));
        return (p && sV(i, r, p), i);
      },
      s0 = (e, t, r) => t.has(e) || sK("Cannot " + r),
      s1 = class e {
        constructor(e, t) {
          ((this.x = e), (this.y = t));
        }
        static delta(t, r) {
          return new e(t.x - r.x, t.y - r.y);
        }
        static distance(e, t) {
          return Math.hypot(e.x - t.x, e.y - t.y);
        }
        static equals(e, t) {
          return e.x === t.x && e.y === t.y;
        }
        static from({ x: t, y: r }) {
          return new e(t, r);
        }
      },
      s2 = class extends ((t6 = nJ), (t5 = [nK]), (t4 = [nK]), t6) {
        constructor(e) {
          (super(s1.from(e), (e, t) => s1.equals(e, t)),
            ((e, t, r, n) => {
              for (var i = 0, o = e[t >> 1], a = o && o.length; i < a; i++) o[i].call(r);
            })(t8, 5, this),
            ((e, t, r) =>
              t.has(e)
                ? sK("Cannot add the same private member more than once")
                : t instanceof WeakSet
                  ? t.add(e)
                  : t.set(e, r))(this, t3, 0),
            (this.velocity = { x: 0, y: 0 }));
        }
        get delta() {
          return s1.delta(this.current, this.initial);
        }
        get direction() {
          let { current: e, previous: t } = this;
          if (!t) return null;
          let r = { x: e.x - t.x, y: e.y - t.y };
          return r.x || r.y
            ? Math.abs(r.x) > Math.abs(r.y)
              ? r.x > 0
                ? "right"
                : "left"
              : r.y > 0
                ? "down"
                : "up"
            : null;
        }
        get current() {
          return super.current;
        }
        set current(e) {
          let t,
            { current: r } = this,
            n = s1.from(e),
            i = { x: n.x - r.x, y: n.y - r.y },
            o = Date.now(),
            a = o - (s0(this, (t = t3), "read from private field"), t.get(this)),
            s = (e) => Math.round((e / a) * 100);
          ne(() => {
            let e;
            (s0(this, (e = t3), "write to private field"),
              e.set(this, o),
              (this.velocity = { x: s(i.x), y: s(i.y) }),
              (super.current = n));
          });
        }
        reset(e = this.defaultValue) {
          (super.reset(s1.from(e)), (this.velocity = { x: 0, y: 0 }));
        }
      };
    ((t8 = [, , , sZ(null != (y = null == t6 ? void 0 : t6[sY("metadata")]) ? y : null)]),
      (t3 = new WeakMap()),
      sQ(t8, 2, "delta", t5, s2),
      sQ(t8, 2, "direction", t4, s2),
      (b = t8),
      (i = sY("metadata")),
      (o = b[3]),
      i in s2
        ? sV(s2, i, { enumerable: !0, configurable: !0, writable: !0, value: o })
        : (s2[i] = o));
    var s4 = (((w = s4 || {}).Horizontal = "x"), (w.Vertical = "y"), w);
    Object.values(s4);
    var s5 = (e) => {
      var t;
      return null !=
        (t = (({ dragOperation: e, droppable: t }) => {
          let r = e.position.current;
          if (!r) return null;
          let { id: n } = t;
          return t.shape && t.shape.containsPoint(r)
            ? {
                id: n,
                value: 1 / s1.distance(t.shape.center, r),
                type: i7.PointerIntersection,
                priority: i8.High,
              }
            : null;
        })(e))
        ? t
        : (({ dragOperation: e, droppable: t }) => {
            let { shape: r } = e;
            if (!t.shape || !(null == r ? void 0 : r.current)) return null;
            let n = r.current.intersectionArea(t.shape);
            if (n) {
              let { position: i } = e,
                o = s1.distance(t.shape.center, i.current),
                a = n / (r.current.area + t.shape.area - n);
              return { id: t.id, value: a / o, type: i7.ShapeIntersection, priority: i8.Normal };
            }
            return null;
          })(e);
    };
    function s6(e) {
      let { collisionDetector: t, data: r, disabled: n, element: i, id: o, accept: a, type: s } = e,
        l = sH((t) => new sx(sM(sN({}, e), sP({ register: !1, element: s_(i) })), t)),
        u = sk(l);
      return (
        sE(o, () => (l.id = o)),
        sO(i, (e) => (l.element = e)),
        sE(a, () => (l.accept = a), void 0, nq),
        sE(t, () => (l.collisionDetector = null != t ? t : s5)),
        sE(r, () => r && (l.data = r)),
        sE(n, () => (l.disabled = !0 === n)),
        sE(s, () => (l.type = s)),
        {
          droppable: u,
          get isDropTarget() {
            return u.isDropTarget;
          },
          ref: (0, rs.useCallback)(
            (e) => {
              var t, r;
              (e ||
                null == (t = l.element) ||
                !t.isConnected ||
                (null == (r = l.manager) ? void 0 : r.dragOperation.status.idle)) &&
                (l.element = null != e ? e : void 0);
            },
            [l]
          ),
        }
      );
    }
    var s3 = Object.create,
      s8 = Object.defineProperty,
      s7 = Object.defineProperties,
      s9 = Object.getOwnPropertyDescriptor,
      le = Object.getOwnPropertyDescriptors,
      lt = Object.getOwnPropertySymbols,
      lr = Object.prototype.hasOwnProperty,
      ln = Object.prototype.propertyIsEnumerable,
      li = (e) => {
        throw TypeError(e);
      },
      lo = (e, t, r) =>
        t in e
          ? s8(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      la = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      ls = (e) => (void 0 !== e && "function" != typeof e ? li("Function expected") : e),
      ll = (e, t, r, n, i) => ({
        kind: la[e],
        name: t,
        metadata: n,
        addInitializer: (e) => (r._ ? li("Already initialized") : i.push(ls(e || null))),
      }),
      lu = (e, t, r, n) => {
        for (var i = 0, o = e[t >> 1], a = o && o.length; i < a; i++)
          1 & t ? o[i].call(r) : (n = o[i].call(r, n));
        return n;
      },
      ld = (e, t, r, n, i, o) => {
        for (
          var a,
            s,
            l,
            u,
            d,
            c = 7 & t,
            p = e.length + 1,
            h = la[c + 5],
            f = (e[p - 1] = []),
            g = e[p] || (e[p] = []),
            m =
              ((i = i.prototype),
              s9(
                {
                  get [r]() {
                    return lp(this, o);
                  },
                  set [r](x) {
                    return lf(this, o, x);
                  },
                },
                r
              )),
            v = n.length - 1;
          v >= 0;
          v--
        )
          (((u = ll(c, r, (l = {}), e[3], g)).static = !1),
            (u.private = !1),
            ((d = u.access = { has: (e) => r in e }).get = (e) => e[r]),
            (d.set = (e, t) => (e[r] = t)),
            (s = (0, n[v])({ get: m.get, set: m.set }, u)),
            (l._ = 1),
            void 0 === s
              ? ls(s) && (m[h] = s)
              : "object" != typeof s || null === s
                ? li("Object expected")
                : (ls((a = s.get)) && (m.get = a),
                  ls((a = s.set)) && (m.set = a),
                  ls((a = s.init)) && f.unshift(a)));
        return (m && s8(i, r, m), i);
      },
      lc = (e, t, r) => t.has(e) || li("Cannot " + r),
      lp = (e, t, r) => (lc(e, t, "read from private field"), t.get(e)),
      lh = (e, t, r) =>
        t.has(e)
          ? li("Cannot add the same private member more than once")
          : t instanceof WeakSet
            ? t.add(e)
            : t.set(e, r),
      lf = (e, t, r, n) => (lc(e, t, "write to private field"), t.set(e, r), r);
    function lg(e) {
      return e instanceof lL || e instanceof lD;
    }
    var lm = class extends iG {
        constructor(e) {
          super(e);
          const t = n_(() => {
              let { dragOperation: t } = e;
              if (al(t.activatorEvent) && lg(t.source) && t.status.initialized) {
                let t = e.registry.plugins.get(a9);
                if (t) return (t.disable(), () => t.enable());
              }
            }),
            r = e.monitor.addEventListener("dragmove", (e, t) => {
              queueMicrotask(() => {
                if (this.disabled || e.defaultPrevented || !e.nativeEvent) return;
                let { dragOperation: r } = t;
                if (!al(e.nativeEvent) || !lg(r.source) || !r.shape) return;
                let { actions: n, collisionObserver: i, registry: o } = t,
                  { by: a } = e;
                if (!a) return;
                let s = (function (e) {
                    let { x: t, y: r } = e;
                    return t > 0
                      ? "right"
                      : t < 0
                        ? "left"
                        : r > 0
                          ? "down"
                          : r < 0
                            ? "up"
                            : void 0;
                  })(a),
                  { source: l, target: u } = r,
                  { center: d } = r.shape.current,
                  c = [],
                  p = [];
                (ne(() => {
                  for (let e of o.droppables) {
                    let { id: t } = e;
                    if (!e.accepts(l) || (t === (null == u ? void 0 : u.id) && lg(e)) || !e.element)
                      continue;
                    let r = e.shape,
                      n = new ai(e.element, { getBoundingClientRect: (e) => oO(e, void 0, 0.2) });
                    n.height &&
                      n.width &&
                      (("down" == s && d.y + 10 < n.center.y) ||
                        ("up" == s && d.y - 10 > n.center.y) ||
                        ("left" == s && d.x - 10 > n.center.x) ||
                        ("right" == s && d.x + 10 < n.center.x)) &&
                      (c.push(e), (e.shape = n), p.push(() => (e.shape = r)));
                  }
                }),
                  e.preventDefault(),
                  i.disable());
                let h = i.computeCollisions(c, ap);
                ne(() => p.forEach((e) => e()));
                let [f] = h;
                if (!f) return;
                let { id: g } = f,
                  { index: m, group: v } = l.sortable;
                n.setDropTarget(g).then(() => {
                  let { source: e, target: t, shape: o } = r;
                  if (!e || !lg(e) || !o) return;
                  let { index: a, group: s, target: l } = e.sortable,
                    u = m !== a || v !== s,
                    d = u ? l : null == t ? void 0 : t.element;
                  if (!d) return;
                  o7(d);
                  let c = new ai(d);
                  if (!c) return;
                  let p = ig.delta(c, ig.from(o.current.boundingRectangle), e.alignment);
                  (n.move({ by: p }),
                    u ? n.setDropTarget(e.id).then(() => i.enable()) : i.enable());
                });
              });
            });
          this.destroy = () => {
            (r(), t());
          };
        }
      },
      lv = Object.defineProperty,
      ly = Object.defineProperties,
      lb = Object.getOwnPropertyDescriptors,
      lx = Object.getOwnPropertySymbols,
      lw = Object.prototype.hasOwnProperty,
      l_ = Object.prototype.propertyIsEnumerable,
      lj = (e, t, r) =>
        t in e
          ? lv(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      lk = (e, t) => {
        for (var r in t || (t = {})) lw.call(t, r) && lj(e, r, t[r]);
        if (lx) for (var r of lx(t)) l_.call(t, r) && lj(e, r, t[r]);
        return e;
      };
    function lS(e, t, r) {
      if (t === r) return e;
      let n = e.slice();
      return (n.splice(r, 0, n.splice(t, 1)[0]), n);
    }
    var lI = "__default__";
    function lE(e, t, r, n) {
      r.insertAdjacentElement(n < t ? "afterend" : "beforebegin", e);
    }
    function lO(e, t) {
      return e.index - t.index;
    }
    function lC(e) {
      return Array.from(e).sort(lO);
    }
    var lM = [
        lm,
        class extends iG {
          constructor(e) {
            super(e);
            const t = () => {
                let t = new Map();
                for (let r of e.registry.droppables)
                  if (r instanceof lL) {
                    let { sortable: e } = r,
                      { group: n } = e,
                      i = t.get(n);
                    (i || ((i = new Set()), t.set(n, i)), i.add(e));
                  }
                for (let [e, r] of t) t.set(e, new Set(lC(r)));
                return t;
              },
              r = [
                e.monitor.addEventListener("dragover", (e, r) => {
                  if (this.disabled) return;
                  let { dragOperation: n } = r,
                    { source: i, target: o } = n;
                  if (!lg(i) || !lg(o) || i.sortable === o.sortable) return;
                  let a = t(),
                    s = i.sortable.group === o.sortable.group,
                    l = a.get(i.sortable.group),
                    u = s ? l : a.get(o.sortable.group);
                  l &&
                    u &&
                    queueMicrotask(() => {
                      e.defaultPrevented ||
                        r.renderer.rendering.then(() => {
                          var n, d, c;
                          let p = t();
                          for (let [e, t] of a.entries())
                            for (let [r, i] of Array.from(t).entries())
                              if (
                                i.index !== r ||
                                i.group !== e ||
                                !(null == (n = p.get(e)) ? void 0 : n.has(i))
                              )
                                return;
                          let h = i.sortable.element,
                            f = o.sortable.element;
                          if (!f || !h || (!s && o.id === i.sortable.group)) return;
                          let g = lC(l),
                            m = s ? g : lC(u),
                            v = null != (d = i.sortable.group) ? d : lI,
                            y = null != (c = o.sortable.group) ? c : lI,
                            b = { [v]: g, [y]: m },
                            w = (function (e, t, r) {
                              var n, i;
                              let o,
                                a,
                                { source: s, target: l, canceled: u } = t.operation;
                              if (!s || !l || u)
                                return ("preventDefault" in t && t.preventDefault(), e);
                              let d = (e, t) =>
                                e === t || ("object" == typeof e && "id" in e && e.id === t);
                              if (Array.isArray(e)) {
                                let t = e.findIndex((e) => d(e, s.id)),
                                  n = e.findIndex((e) => d(e, l.id));
                                if (-1 === t || -1 === n) return e;
                                if (!u && "index" in s && "number" == typeof s.index) {
                                  let n = s.index;
                                  if (n !== t) return r(e, t, n);
                                }
                                return r(e, t, n);
                              }
                              let c = Object.entries(e),
                                p = -1,
                                h = -1;
                              for (let [e, t] of c)
                                if (
                                  (-1 === p &&
                                    -1 !== (p = t.findIndex((e) => d(e, s.id))) &&
                                    (o = e),
                                  -1 === h &&
                                    -1 !== (h = t.findIndex((e) => d(e, l.id))) &&
                                    (a = e),
                                  -1 !== p && -1 !== h)
                                )
                                  break;
                              if (!s.manager) return e;
                              let { dragOperation: f } = s.manager,
                                g =
                                  null != (i = null == (n = f.shape) ? void 0 : n.current.center)
                                    ? i
                                    : f.position.current;
                              if (null == a && l.id in e) {
                                let t = l.shape && g.y > l.shape.center.y ? e[l.id].length : 0;
                                ((a = l.id), (h = t));
                              }
                              if (null == o || null == a || (o === a && p === h))
                                return ("preventDefault" in t && t.preventDefault(), e);
                              if (o === a) return ly(lk({}, e), lb({ [o]: r(e[o], p, h) }));
                              let m = +!!(
                                  l.shape && Math.round(g.y) > Math.round(l.shape.center.y)
                                ),
                                v = e[o][p];
                              return ly(
                                lk({}, e),
                                lb({
                                  [o]: [...e[o].slice(0, p), ...e[o].slice(p + 1)],
                                  [a]: [...e[a].slice(0, h + m), v, ...e[a].slice(h + m)],
                                })
                              );
                            })(b, e, lS);
                          if (b === w) return;
                          let _ = w[y].indexOf(i.sortable),
                            j = w[y].indexOf(o.sortable);
                          (r.collisionObserver.disable(),
                            lE(h, _, f, j),
                            ne(() => {
                              for (let [e, t] of w[v].entries()) t.index = e;
                              if (!s)
                                for (let [e, t] of w[y].entries())
                                  ((t.group = o.sortable.group), (t.index = e));
                            }),
                            r.actions.setDropTarget(i.id).then(() => r.collisionObserver.enable()));
                        });
                    });
                }),
                e.monitor.addEventListener("dragend", (e, r) => {
                  if (!e.canceled) return;
                  let { dragOperation: n } = r,
                    { source: i } = n;
                  lg(i) &&
                    (i.sortable.initialIndex !== i.sortable.index ||
                      i.sortable.initialGroup !== i.sortable.group) &&
                    queueMicrotask(() => {
                      let e = t(),
                        n = e.get(i.sortable.initialGroup);
                      n &&
                        r.renderer.rendering.then(() => {
                          for (let [t, r] of e.entries())
                            for (let [e, n] of Array.from(r).entries())
                              if (n.index !== e || n.group !== t) return;
                          let t = lC(n),
                            r = i.sortable.element,
                            o = t[i.sortable.initialIndex],
                            a = null == o ? void 0 : o.element;
                          o &&
                            a &&
                            r &&
                            (lE(r, o.index, a, i.index),
                            ne(() => {
                              for (let [t, r] of e.entries())
                                for (let e of Array.from(r).values())
                                  ((e.index = e.initialIndex), (e.group = e.initialGroup));
                            }));
                        });
                    });
                }),
              ];
            this.destroy = () => {
              for (let e of r) e();
            };
          }
        },
      ],
      lP = { duration: 250, easing: "cubic-bezier(0.25, 1, 0.5, 1)", idle: !1 },
      lA = new n0();
    ((t9 = [nY]), (t7 = [nY]));
    var lz = class {
      constructor(e, t) {
        (lh(this, rt, lu(re, 8, this)),
          lu(re, 11, this),
          lh(this, rr),
          lh(this, rn),
          lh(this, ri, lu(re, 12, this)),
          lu(re, 15, this),
          lh(this, ro),
          (this.register = () => (
            ne(() => {
              var e, t;
              (null == (e = this.manager) || e.registry.register(this.droppable),
                null == (t = this.manager) || t.registry.register(this.draggable));
            }),
            () => this.unregister()
          )),
          (this.unregister = () => {
            ne(() => {
              var e, t;
              (null == (e = this.manager) || e.registry.unregister(this.droppable),
                null == (t = this.manager) || t.registry.unregister(this.draggable));
            });
          }),
          (this.destroy = () => {
            ne(() => {
              (this.droppable.destroy(), this.draggable.destroy());
            });
          }));
        var {
            effects: r = () => [],
            group: n,
            index: i,
            sensors: o,
            type: a,
            transition: s = lP,
            plugins: l = lM,
          } = e,
          u = ((e, t) => {
            var r = {};
            for (var n in e) lr.call(e, n) && 0 > t.indexOf(n) && (r[n] = e[n]);
            if (null != e && lt)
              for (var n of lt(e)) 0 > t.indexOf(n) && ln.call(e, n) && (r[n] = e[n]);
            return r;
          })(e, ["effects", "group", "index", "sensors", "type", "transition", "plugins"]);
        ((this.droppable = new lL(u, t, this)),
          (this.draggable = new lD(
            ((e, t) => s7(e, le(t)))(
              ((e, t) => {
                for (var r in t || (t = {})) lr.call(t, r) && lo(e, r, t[r]);
                if (lt) for (var r of lt(t)) ln.call(t, r) && lo(e, r, t[r]);
                return e;
              })({}, u),
              {
                effects: () => [
                  () => {
                    var e, t, r;
                    let n = null == (e = this.manager) ? void 0 : e.dragOperation.status;
                    ((null == n ? void 0 : n.initializing) &&
                      this.id ===
                        (null == (r = null == (t = this.manager) ? void 0 : t.dragOperation.source)
                          ? void 0
                          : r.id) &&
                      lA.clear(this.manager),
                      (null == n ? void 0 : n.dragging) &&
                        lA.set(
                          this.manager,
                          this.id,
                          nr(() => ({ initialIndex: this.index, initialGroup: this.group }))
                        ));
                  },
                  () => {
                    let { index: e, group: t, manager: r } = this,
                      n = lp(this, rn),
                      i = lp(this, rr);
                    (e !== n || t !== i) && (lf(this, rn, e), lf(this, rr, t), this.animate());
                  },
                  () => {
                    let { target: e } = this,
                      { feedback: t, isDragSource: r } = this.draggable;
                    "move" == t && r && (this.droppable.disabled = !e);
                  },
                  () => {
                    let { manager: e } = this;
                    for (let t of l) null == e || e.registry.register(t);
                  },
                  ...r(),
                ],
                type: a,
                sensors: o,
              }
            ),
            t,
            this
          )),
          lf(this, ro, u.element),
          (this.manager = t),
          (this.index = i),
          lf(this, rn, i),
          (this.group = n),
          lf(this, rr, n),
          (this.type = a),
          (this.transition = s));
      }
      get initialIndex() {
        var e, t;
        return null != (t = null == (e = lA.get(this.manager, this.id)) ? void 0 : e.initialIndex)
          ? t
          : this.index;
      }
      get initialGroup() {
        var e, t;
        return null != (t = null == (e = lA.get(this.manager, this.id)) ? void 0 : e.initialGroup)
          ? t
          : this.group;
      }
      animate() {
        nr(() => {
          let { manager: e, transition: t } = this,
            { shape: r } = this.droppable;
          if (!e) return;
          let { idle: n } = e.dragOperation.status;
          r &&
            t &&
            (!n || t.idle) &&
            e.renderer.rendering.then(() => {
              let { element: n } = this;
              if (!n) return;
              let i = this.refreshShape();
              if (!i) return;
              let o = {
                  x: r.boundingRectangle.left - i.boundingRectangle.left,
                  y: r.boundingRectangle.top - i.boundingRectangle.top,
                },
                { translate: a } = oJ(n),
                s = ae(n, a, !1),
                l = ae(n, a);
              (o.x || o.y) &&
                o9({
                  element: n,
                  keyframes: {
                    translate: [`${s.x + o.x}px ${s.y + o.y}px ${s.z}`, `${l.x}px ${l.y}px ${l.z}`],
                  },
                  options: t,
                }).then(() => {
                  e.dragOperation.status.dragging || (this.droppable.shape = void 0);
                });
            });
        });
      }
      get manager() {
        return this.draggable.manager;
      }
      set manager(e) {
        ne(() => {
          ((this.draggable.manager = e), (this.droppable.manager = e));
        });
      }
      set element(e) {
        ne(() => {
          let t = lp(this, ro),
            r = this.droppable.element,
            n = this.draggable.element;
          ((r && r !== t) || (this.droppable.element = e),
            (n && n !== t) || (this.draggable.element = e),
            lf(this, ro, e));
        });
      }
      get element() {
        var e, t;
        let r = lp(this, ro);
        if (r) return null != (t = null != (e = oA.get(r)) ? e : r) ? t : this.droppable.element;
      }
      set target(e) {
        this.droppable.element = e;
      }
      get target() {
        return this.droppable.element;
      }
      set source(e) {
        this.draggable.element = e;
      }
      get source() {
        return this.draggable.element;
      }
      get disabled() {
        return this.draggable.disabled && this.droppable.disabled;
      }
      set feedback(e) {
        this.draggable.feedback = e;
      }
      set disabled(e) {
        ne(() => {
          ((this.droppable.disabled = e), (this.draggable.disabled = e));
        });
      }
      set data(e) {
        ne(() => {
          ((this.droppable.data = e), (this.draggable.data = e));
        });
      }
      set handle(e) {
        this.draggable.handle = e;
      }
      set id(e) {
        ne(() => {
          ((this.droppable.id = e), (this.draggable.id = e));
        });
      }
      get id() {
        return this.droppable.id;
      }
      set sensors(e) {
        this.draggable.sensors = e;
      }
      set modifiers(e) {
        this.draggable.modifiers = e;
      }
      set collisionPriority(e) {
        this.droppable.collisionPriority = e;
      }
      set collisionDetector(e) {
        this.droppable.collisionDetector = null != e ? e : ac;
      }
      set alignment(e) {
        this.draggable.alignment = e;
      }
      get alignment() {
        return this.draggable.alignment;
      }
      set type(e) {
        ne(() => {
          ((this.droppable.type = e), (this.draggable.type = e));
        });
      }
      get type() {
        return this.draggable.type;
      }
      set accept(e) {
        this.droppable.accept = e;
      }
      get accept() {
        return this.droppable.accept;
      }
      get isDropTarget() {
        return this.droppable.isDropTarget;
      }
      get isDragSource() {
        return this.draggable.isDragSource;
      }
      get isDragging() {
        return this.draggable.isDragging;
      }
      get isDropping() {
        return this.draggable.isDropping;
      }
      get status() {
        return this.draggable.status;
      }
      refreshShape() {
        return this.droppable.refreshShape();
      }
      accepts(e) {
        return this.droppable.accepts(e);
      }
    };
    ((re = [, , , s3(null)]),
      (rt = new WeakMap()),
      (rr = new WeakMap()),
      (rn = new WeakMap()),
      (ri = new WeakMap()),
      (ro = new WeakMap()),
      ld(re, 4, "index", t9, lz, rt),
      ld(re, 4, "group", t7, lz, ri),
      (_ = re),
      lo(lz, ((a = "metadata"), (s = Symbol[a]) ? s : Symbol.for("Symbol." + a)), _[3]));
    var lD = class extends sb {
        constructor(e, t, r) {
          (super(e, t), (this.sortable = r));
        }
        get index() {
          return this.sortable.index;
        }
      },
      lL = class extends sx {
        constructor(e, t, r) {
          (super(e, t), (this.sortable = r));
        }
      },
      lN = Object.defineProperty,
      lT = Object.defineProperties,
      lB = Object.getOwnPropertyDescriptors,
      lR = Object.getOwnPropertySymbols,
      l$ = Object.prototype.hasOwnProperty,
      lF = Object.prototype.propertyIsEnumerable,
      lW = (e, t, r) =>
        t in e
          ? lN(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
          : (e[t] = r),
      lH = (e, t) => {
        for (var r in t || (t = {})) l$.call(t, r) && lW(e, r, t[r]);
        if (lR) for (var r of lR(t)) lF.call(t, r) && lW(e, r, t[r]);
        return e;
      };
    function lU(e) {
      let {
          accept: t,
          collisionDetector: r,
          collisionPriority: n,
          id: i,
          data: o,
          element: a,
          handle: s,
          index: l,
          group: u,
          disabled: d,
          feedback: c,
          modifiers: p,
          sensors: h,
          target: f,
          type: g,
        } = e,
        m = lH(lH({}, lP), e.transition),
        v = sH(
          (t) =>
            new lz(
              lT(
                lH({}, e),
                lB({
                  transition: m,
                  register: !1,
                  handle: s_(s),
                  element: s_(a),
                  target: s_(f),
                  feedback: c,
                })
              ),
              t
            )
        ),
        y = sk(v, lZ);
      return (
        sE(i, () => (v.id = i)),
        sj(() => {
          ne(() => {
            ((v.group = u), (v.index = l));
          });
        }, [v, u, l]),
        sE(g, () => (v.type = g)),
        sE(t, () => (v.accept = t), void 0, nq),
        sE(o, () => o && (v.data = o)),
        sE(
          l,
          () => {
            var e;
            (null == (e = v.manager) ? void 0 : e.dragOperation.status.idle) &&
              (null == m ? void 0 : m.idle) &&
              v.refreshShape();
          },
          sS
        ),
        sO(s, (e) => (v.handle = e)),
        sO(a, (e) => (v.element = e)),
        sO(f, (e) => (v.target = e)),
        sE(d, () => (v.disabled = !0 === d)),
        sE(h, () => (v.sensors = h)),
        sE(r, () => (v.collisionDetector = r)),
        sE(n, () => (v.collisionPriority = n)),
        sE(c, () => (v.feedback = null != c ? c : "default")),
        sE(m, () => (v.transition = m), void 0, nq),
        sE(p, () => (v.modifiers = p), void 0, nq),
        sE(e.alignment, () => (v.alignment = e.alignment)),
        {
          sortable: y,
          get isDragging() {
            return y.isDragging;
          },
          get isDropping() {
            return y.isDropping;
          },
          get isDragSource() {
            return y.isDragSource;
          },
          get isDropTarget() {
            return y.isDropTarget;
          },
          handleRef: (0, rs.useCallback)(
            (e) => {
              v.handle = null != e ? e : void 0;
            },
            [v]
          ),
          ref: (0, rs.useCallback)(
            (e) => {
              var t, r;
              (e ||
                null == (t = v.element) ||
                !t.isConnected ||
                (null == (r = v.manager) ? void 0 : r.dragOperation.status.idle)) &&
                (v.element = null != e ? e : void 0);
            },
            [v]
          ),
          sourceRef: (0, rs.useCallback)(
            (e) => {
              var t, r;
              (e ||
                null == (t = v.source) ||
                !t.isConnected ||
                (null == (r = v.manager) ? void 0 : r.dragOperation.status.idle)) &&
                (v.source = null != e ? e : void 0);
            },
            [v]
          ),
          targetRef: (0, rs.useCallback)(
            (e) => {
              var t, r;
              (e ||
                null == (t = v.target) ||
                !t.isConnected ||
                (null == (r = v.manager) ? void 0 : r.dragOperation.status.idle)) &&
                (v.target = null != e ? e : void 0);
            },
            [v]
          ),
        }
      );
    }
    function lZ(e, t, r) {
      return "isDragSource" === e && !r && !!t;
    }
    let lV = (e, t) => {
      let r = e instanceof Map ? e : new Map(e.entries()),
        n = t instanceof Map ? t : new Map(t.entries());
      if (r.size !== n.size) return !1;
      for (let [e, t] of r) if (!n.has(e) || !Object.is(t, n.get(e))) return !1;
      return !0;
    };
    function lq(e) {
      let t = rs.default.useRef(void 0);
      return (r) => {
        let n = e(r);
        return !(function (e, t) {
          if (Object.is(e, t)) return !0;
          if (
            "object" != typeof e ||
            null === e ||
            "object" != typeof t ||
            null === t ||
            Object.getPrototypeOf(e) !== Object.getPrototypeOf(t)
          )
            return !1;
          if (Symbol.iterator in e && Symbol.iterator in t) {
            if ("entries" in e && "entries" in t) return lV(e, t);
            let r = e[Symbol.iterator](),
              n = t[Symbol.iterator](),
              i = r.next(),
              o = n.next();
            for (; !i.done && !o.done; ) {
              if (!Object.is(i.value, o.value)) return !1;
              ((i = r.next()), (o = n.next()));
            }
            return !!i.done && !!o.done;
          }
          return lV({ entries: () => Object.entries(e) }, { entries: () => Object.entries(t) });
        })(t.current, n)
          ? (t.current = n)
          : t.current;
      };
    }
    var lY = e.i(68971),
      lK =
        ((l = {
          "../../node_modules/classnames/index.js"(t, r) {
            rk();
            var n = {}.hasOwnProperty;
            function i() {
              for (var e = "", t = 0; t < arguments.length; t++) {
                var r = arguments[t];
                r &&
                  (e = o(
                    e,
                    (function (e) {
                      if ("string" == typeof e || "number" == typeof e) return e;
                      if ("object" != typeof e) return "";
                      if (Array.isArray(e)) return i.apply(null, e);
                      if (
                        e.toString !== Object.prototype.toString &&
                        !e.toString.toString().includes("[native code]")
                      )
                        return e.toString();
                      var t = "";
                      for (var r in e) n.call(e, r) && e[r] && (t = o(t, r));
                      return t;
                    })(r)
                  ));
              }
              return e;
            }
            function o(e, t) {
              return t ? (e ? e + " " + t : e + t) : e;
            }
            if (void 0 !== r && r.exports) ((i.default = i), (r.exports = i));
            else if ("function" == typeof define && "object" == typeof define.amd && define.amd)
              void 0 !== i && e.v(i);
            else window.classNames = i;
          },
        }),
        function () {
          return (u || (0, l[rg(l)[0]])((u = { exports: {} }).exports, u), u.exports);
        });
    (rk(), rk(), rk());
    var lX =
        ((p = null != (d = lK()) ? rd(rv(d)) : {}),
        ((e, t, r, n) => {
          if ((t && "object" == typeof t) || "function" == typeof t)
            for (let i of rg(t))
              ry.call(e, i) ||
                i === r ||
                rc(e, i, { get: () => t[i], enumerable: !(n = rh(t, i)) || n.enumerable });
          return e;
        })(!c && d && d.__esModule ? p : rc(p, "default", { value: d, enumerable: !0 }), d)),
      lG =
        (e, t, r = { baseClass: "" }) =>
        (n = {}) => {
          if ("string" == typeof n) return (t[`${e}-${n}`] && r.baseClass + t[`${e}-${n}`]) || "";
          if ("object" != typeof n) return r.baseClass + t[e] || "";
          {
            let i = {};
            for (let r in n) i[t[`${e}--${r}`]] = n[r];
            let o = t[e];
            return r.baseClass + (0, lX.default)(rw({ [o]: !!o }, i));
          }
        };
    rk();
    var lJ = lG("ActionBar", {
        ActionBar: "_ActionBar_rvadt_1",
        "ActionBar-label": "_ActionBar-label_rvadt_18",
        "ActionBar-action": "_ActionBar-action_rvadt_30",
        "ActionBar-group": "_ActionBar-group_rvadt_38",
      }),
      lQ = ({ label: e, children: t }) =>
        (0, rX.jsxs)("div", {
          className: lJ(),
          onClick: (e) => {
            e.stopPropagation();
          },
          children: [
            e &&
              (0, rX.jsx)(lQ.Group, {
                children: (0, rX.jsx)("div", { className: lJ("label"), children: e }),
              }),
            t,
          ],
        });
    ((lQ.Action = ({ children: e, label: t, onClick: r }) =>
      (0, rX.jsx)("button", {
        type: "button",
        className: lJ("action"),
        onClick: r,
        title: t,
        children: e,
      })),
      (lQ.Label = ({ label: e }) => (0, rX.jsx)("div", { className: lJ("label"), children: e })),
      (lQ.Group = ({ children: e }) => (0, rX.jsx)("div", { className: lJ("group"), children: e })),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk());
    var l0 = (e, t, r) => {
      let n = Array.from(e),
        [i] = n.splice(t, 1);
      return (n.splice(r, 0, i), n);
    };
    (rk(), rk(), rk(), rk(), rk(), rk(), rk());
    var l1 = (e, t, r) => {
      let n = Array.from(e || []);
      return (n.splice(t, 0, r), n);
    };
    rk();
    var l2 = (e) => (e ? `${e}-${r0()}` : r0());
    rk();
    var l4 = (e, t) => {
      let [r] = e.split(":"),
        n = t.indexes.nodes[r];
      return ((null == n ? void 0 : n.path) || []).map((e) => e.split(":")[0]);
    };
    rk();
    var l5 = (e, t, r = !1) => {
      let n,
        i,
        o = l2(e.type);
      return rP(
        ((n = rw({}, e)),
        (i = { props: r ? rp(rw({}, e.props), rf({ id: o })) : rw({}, e.props) }),
        rp(n, rf(i))),
        t,
        (e) =>
          e.map((e) => {
            let t,
              n,
              i = l2(e.type);
            return (
              (t = rw({}, e)),
              (n = { props: r ? rp(rw({}, e.props), rf({ id: i })) : rw({ id: i }, e.props) }),
              rp(t, rf(n))
            );
          })
      );
    };
    function l6(e, t, r) {
      let n = t.id || l2(t.componentType),
        i = l5(
          {
            type: t.componentType,
            props: rp(
              rw({}, r.config.components[t.componentType].defaultProps || {}),
              rf({ id: n })
            ),
          },
          r.config
        ),
        [o] = t.destinationZone.split(":"),
        a = l4(t.destinationZone, e);
      return rR(
        e,
        r.config,
        (e, r) => (r === t.destinationZone ? l1(e || [], t.destinationIndex, i) : e),
        (e, r) =>
          e.props.id === n ||
          e.props.id === o ||
          a.includes(e.props.id) ||
          r.includes(t.destinationZone)
            ? e
            : null
      );
    }
    function l3(e, t) {
      var r, n;
      let i = null == (r = t.indexes.zones) ? void 0 : r[e.zone || rN];
      return i ? (null == (n = t.indexes.nodes[i.contentIds[e.index]]) ? void 0 : n.data) : void 0;
    }
    (rk(), rk(), rk(), rk(), rk(), rk(), rk());
    var l8 = (e, t) => {
        let r = Array.from(e);
        return (r.splice(t, 1), r);
      },
      l7 = (e, t, r) => {
        if (t.sourceZone === t.destinationZone && t.sourceIndex === t.destinationIndex) return e;
        let n = l3({ zone: t.sourceZone, index: t.sourceIndex }, e);
        if (!n) return e;
        let i = l4(t.sourceZone, e),
          o = l4(t.destinationZone, e);
        return rR(
          e,
          r.config,
          (e, r) =>
            r === t.sourceZone && r === t.destinationZone
              ? l1(l8(e, t.sourceIndex), t.destinationIndex, n)
              : r === t.sourceZone
                ? l8(e, t.sourceIndex)
                : r === t.destinationZone
                  ? l1(e, t.destinationIndex, n)
                  : e,
          (e, r) => {
            let [a] = t.sourceZone.split(":"),
              [s] = t.destinationZone.split(":"),
              l = e.props.id;
            return a === l ||
              s === l ||
              n.props.id === l ||
              i.indexOf(l) > -1 ||
              o.indexOf(l) > -1 ||
              r.includes(t.destinationZone)
              ? e
              : null;
          }
        );
      };
    (rk(), rk());
    var l9 = {};
    (rk(), rk(), rk());
    var ue = (e) => {
      let { data: t, ui: r } = e;
      return { data: t, ui: r };
    };
    function ut({ record: e, onAction: t, appStore: r }) {
      var n;
      return (
        (n = (e, t) => {
          if ("set" === t.type) {
            if ("object" == typeof t.state) {
              let n = rw(rw({}, e), t.state);
              return t.state.indexes
                ? n
                : (console.warn(
                    "`set` is expensive and may cause unnecessary re-renders. Consider using a more atomic action instead."
                  ),
                  rR(n, r.config));
            }
            return rw(rw({}, e), t.state(e));
          }
          if ("insert" === t.type) return l6(e, t, r);
          if ("replace" === t.type)
            return ((e, t, r) => {
              let [n] = t.destinationZone.split(":"),
                i = l4(t.destinationZone, e),
                o = e.indexes.zones[t.destinationZone].contentIds[t.destinationIndex];
              if (o !== t.data.props.id)
                throw Error(
                  'Can\'t change the id during a replace action. Please us "remove" and "insert" to define a new node.'
                );
              let a = [],
                s = rP(
                  t.data,
                  r.config,
                  (e, t) => (
                    a.push(`${t.parentId}:${t.propName}`),
                    e.map((e) => {
                      let t = l2(e.type);
                      return rp(rw({}, e), rf({ props: rw({ id: t }, e.props) }));
                    })
                  )
                ),
                l = rw({}, e);
              return (
                Object.keys(e.indexes.zones).forEach((e) => {
                  e.split(":")[0] !== o || a.includes(e) || delete l.indexes.zones[e];
                }),
                rR(
                  l,
                  r.config,
                  (e, r) => {
                    let n = [...e];
                    return (r === t.destinationZone && (n[t.destinationIndex] = s), n);
                  },
                  (e, t) => {
                    let r = t.map((e) => e.split(":")[0]);
                    return e.props.id === s.props.id
                      ? s
                      : e.props.id === n
                        ? e
                        : i.indexOf(e.props.id) > -1
                          ? e
                          : r.indexOf(s.props.id) > -1
                            ? e
                            : null;
                  }
                )
              );
            })(e, t, r);
          if ("replaceRoot" === t.type)
            return rR(
              e,
              r.config,
              (e) => e,
              (e) =>
                "root" === e.props.id
                  ? rp(
                      rw({}, e),
                      rf({ props: rw(rw({}, e.props), t.root.props), readOnly: t.root.readOnly })
                    )
                  : e
            );
          if ("duplicate" === t.type) {
            var n, i, o;
            let a, s, l, u, d, c, p, h;
            return (
              (n = e),
              (i = t),
              (o = r),
              (d = l3({ index: i.sourceIndex, zone: i.sourceZone }, n)),
              (c = l4(i.sourceZone, n)),
              (p =
                ((a = rw({}, d)),
                (s = { props: rp(rw({}, d.props), rf({ id: l2(d.type) })) }),
                rp(a, rf(s)))),
              (h = rR(
                n,
                o.config,
                (e, t) => (t === i.sourceZone ? l1(e, i.sourceIndex + 1, d) : e),
                (e, t, r) => {
                  let n = t[t.length - 1];
                  if (t.map((e) => e.split(":")[0]).indexOf(p.props.id) > -1) {
                    let t, r;
                    return (
                      (t = rw({}, e)),
                      (r = { props: rp(rw({}, e.props), rf({ id: l2(e.type) })) }),
                      rp(t, rf(r))
                    );
                  }
                  if (n === i.sourceZone && r === i.sourceIndex + 1) return p;
                  let [o] = i.sourceZone.split(":");
                  return o === e.props.id || c.indexOf(e.props.id) > -1 ? e : null;
                }
              )),
              (l = rw({}, h)),
              (u = {
                ui: rp(
                  rw({}, h.ui),
                  rf({ itemSelector: { index: i.sourceIndex + 1, zone: i.sourceZone } })
                ),
              }),
              rp(l, rf(u))
            );
          }
          if ("reorder" === t.type)
            return l7(
              e,
              {
                type: "move",
                sourceIndex: t.sourceIndex,
                sourceZone: t.destinationZone,
                destinationIndex: t.destinationIndex,
                destinationZone: t.destinationZone,
              },
              r
            );
          if ("move" === t.type) return l7(e, t, r);
          if ("remove" === t.type) {
            let n, i, o;
            return (
              (n = l3({ index: t.index, zone: t.zone }, e)),
              (i = Object.entries(e.indexes.nodes).reduce(
                (e, [t, r]) =>
                  r.path.map((e) => e.split(":")[0]).includes(n.props.id) ? [...e, t] : e,
                [n.props.id]
              )),
              Object.keys(
                (o = rR(e, r.config, (e, r) => (r === t.zone ? l8(e, t.index) : e))).data.zones ||
                  {}
              ).forEach((e) => {
                let t = e.split(":")[0];
                i.includes(t) && o.data.zones && delete o.data.zones[e];
              }),
              Object.keys(o.indexes.zones).forEach((e) => {
                let t = e.split(":")[0];
                i.includes(t) && delete o.indexes.zones[e];
              }),
              i.forEach((e) => {
                delete o.indexes.nodes[e];
              }),
              o
            );
          }
          if ("registerZone" === t.type)
            return (function (e, t) {
              if (l9[t.zone]) {
                let r, n, i, o, a, s, l, u;
                return (
                  (l = rw({}, e)),
                  (u = {
                    data:
                      ((r = rw({}, e.data)),
                      (n = { zones: rp(rw({}, e.data.zones), rf({ [t.zone]: l9[t.zone] })) }),
                      rp(r, rf(n))),
                    indexes:
                      ((a = rw({}, e.indexes)),
                      (s = {
                        zones:
                          ((i = rw({}, e.indexes.zones)),
                          (o = {
                            [t.zone]: rp(
                              rw({}, e.indexes.zones[t.zone]),
                              rf({
                                contentIds: l9[t.zone].map((e) => e.props.id),
                                type: "dropzone",
                              })
                            ),
                          }),
                          rp(i, rf(o))),
                      }),
                      rp(a, rf(s))),
                  }),
                  rp(l, rf(u))
                );
              }
              return rp(rw({}, e), rf({ data: rH(e.data, t.zone) }));
            })(e, t);
          if ("unregisterZone" === t.type) {
            let r,
              n,
              i = rw({}, e.data.zones || {}),
              o = rw({}, e.indexes.zones || {});
            return (
              i[t.zone] && ((l9[t.zone] = i[t.zone]), delete i[t.zone]),
              delete o[t.zone],
              (r = rw({}, e)),
              (n = {
                data: rp(rw({}, e.data), rf({ zones: i })),
                indexes: rp(rw({}, e.indexes), rf({ zones: o })),
              }),
              rp(r, rf(n))
            );
          }
          if ("setData" === t.type) {
            if ("object" == typeof t.data)
              return (
                console.warn(
                  "`setData` is expensive and may cause unnecessary re-renders. Consider using a more atomic action instead."
                ),
                rR(rp(rw({}, e), rf({ data: rw(rw({}, e.data), t.data) })), r.config)
              );
            return rR(rp(rw({}, e), rf({ data: rw(rw({}, e.data), t.data(e.data)) })), r.config);
          }
          if ("setUi" === t.type) {
            if ("object" == typeof t.ui) return rp(rw({}, e), rf({ ui: rw(rw({}, e.ui), t.ui) }));
            return rp(rw({}, e), rf({ ui: rw(rw({}, e.ui), t.ui(e.ui)) }));
          }
          return e;
        }),
        (r, i) => {
          let o = n(r, i),
            a = !["registerZone", "unregisterZone", "setData", "setUi", "set"].includes(i.type);
          return (
            (void 0 !== i.recordHistory ? i.recordHistory : a) && e && e(o),
            null == t || t(i, ue(o), ue(r)),
            o
          );
        }
      );
    }
    (rk(), rk(), rk());
    var ur = {
        ControlLeft: "ctrl",
        ControlRight: "ctrl",
        MetaLeft: "meta",
        MetaRight: "meta",
        ShiftLeft: "shift",
        ShiftRight: "shift",
        KeyA: "a",
        KeyB: "b",
        KeyC: "c",
        KeyD: "d",
        KeyE: "e",
        KeyF: "f",
        KeyG: "g",
        KeyH: "h",
        KeyI: "i",
        KeyJ: "j",
        KeyK: "k",
        KeyL: "l",
        KeyM: "m",
        KeyN: "n",
        KeyO: "o",
        KeyP: "p",
        KeyQ: "q",
        KeyR: "r",
        KeyS: "s",
        KeyT: "t",
        KeyU: "u",
        KeyV: "v",
        KeyW: "w",
        KeyX: "x",
        KeyY: "y",
        KeyZ: "z",
      },
      un = r3()(
        r8((e) => ({
          held: {},
          hold: (t) => e((e) => (e.held[t] ? e : { held: rp(rw({}, e.held), rf({ [t]: !0 })) })),
          release: (t) => e((e) => (e.held[t] ? { held: rp(rw({}, e.held), rf({ [t]: !1 })) } : e)),
          reset: (t = {}) => e(() => ({ held: t })),
          triggers: {},
        }))
      ),
      ui = (e) => {
        let t = (e) => {
            let t = ur[e.code];
            if (t) {
              un.getState().hold(t);
              let { held: r, triggers: n } = un.getState();
              (Object.values(n).forEach(({ combo: t, cb: n }) => {
                Object.entries(t).every(([e, t]) => !!r[e] === t) &&
                  Object.entries(r).every(([e, r]) => !!t[e] === r) &&
                  (e.preventDefault(), n());
              }),
                "meta" !== t && "ctrl" !== t && "shift" !== t && un.getState().release(t));
            }
          },
          r = (e) => {
            let t = ur[e.code];
            t && ("meta" === t ? un.getState().reset() : un.getState().release(t));
          },
          n = (e) => {
            "hidden" === document.visibilityState && un.getState().reset();
          };
        return (
          e.addEventListener("keydown", t),
          e.addEventListener("keyup", r),
          e.addEventListener("visibilitychange", n),
          () => {
            (e.removeEventListener("keydown", t),
              e.removeEventListener("keyup", r),
              e.removeEventListener("visibilitychange", n));
          }
        );
      },
      uo = (e, t) => {
        (0, rs.useEffect)(
          () =>
            un.setState((r) => ({
              triggers: rp(
                rw({}, r.triggers),
                rf({ [`${Object.keys(e).join("+")}`]: { combo: e, cb: t } })
              ),
            })),
          []
        );
      },
      ua = (e) => {
        let t, r;
        return (
          (t = rw({}, e)),
          (r = { ui: rp(rw({}, e.ui), rf({ field: { focus: null } })) }),
          rp(t, rf(r))
        );
      };
    (rk(), rk(), rk());
    var us = (e, t) => {
      let r = [];
      return (
        rR(
          e,
          t,
          (e) => e,
          (e) => (r.push(e), null)
        ),
        r
      );
    };
    (rk(), rk());
    var ul = { title: { type: "text" } },
      uu = (e) =>
        r3()(
          r8((t, r) => {
            var n, i;
            let o, a, s;
            return (
              (a = rw(
                {
                  state: rz,
                  config: { components: {} },
                  componentState: {},
                  plugins: [],
                  overrides: {},
                  viewports: rA,
                  zoomConfig: { autoZoom: 1, rootHeight: 0, zoom: 1 },
                  status: "LOADING",
                  iframe: {},
                  metadata: {},
                  fieldTransforms: {},
                },
                e
              )),
              (s = {
                fields: { fields: {}, loading: !1, lastResolvedData: {}, id: void 0 },
                history: {
                  initialAppState: {},
                  index: 0,
                  histories: [],
                  hasPast: () => r().history.index > 0,
                  hasFuture: () => r().history.index < r().history.histories.length - 1,
                  prevHistory: () => {
                    let { history: e } = r();
                    return e.hasPast() ? e.histories[e.index - 1] : null;
                  },
                  nextHistory: () => {
                    let e = r().history;
                    return e.hasFuture() ? e.histories[e.index + 1] : null;
                  },
                  currentHistory: () => r().history.histories[r().history.index],
                  back: () => {
                    var e;
                    let { history: n, dispatch: i } = r();
                    n.hasPast() &&
                      (i({
                        type: "set",
                        state: ua(
                          (null == (e = n.prevHistory()) ? void 0 : e.state) || n.initialAppState
                        ),
                      }),
                      t({ history: rp(rw({}, n), rf({ index: n.index - 1 })) }));
                  },
                  forward: () => {
                    var e;
                    let { history: n, dispatch: i } = r();
                    if (n.hasFuture()) {
                      let r = null == (e = n.nextHistory()) ? void 0 : e.state;
                      (i({ type: "set", state: r ? ua(r) : {} }),
                        t({ history: rp(rw({}, n), rf({ index: n.index + 1 })) }));
                    }
                  },
                  setHistories: (e) => {
                    var n;
                    let { dispatch: i, history: o } = r();
                    (i({
                      type: "set",
                      state:
                        (null == (n = e[e.length - 1]) ? void 0 : n.state) || o.initialAppState,
                    }),
                      t({ history: rp(rw({}, o), rf({ histories: e, index: e.length - 1 })) }));
                  },
                  setHistoryIndex: (e) => {
                    var n;
                    let { dispatch: i, history: o } = r();
                    (i({
                      type: "set",
                      state: (null == (n = o.histories[e]) ? void 0 : n.state) || o.initialAppState,
                    }),
                      t({ history: rp(rw({}, o), rf({ index: e })) }));
                  },
                  record: (function (e, t = 300) {
                    let r;
                    return (...n) => {
                      (clearTimeout(r),
                        (r = setTimeout(() => {
                          e(...n);
                        }, t)));
                    };
                  })((e) => {
                    let { histories: n, index: i } = r().history,
                      o = { state: e, id: l2("history") },
                      a = [...n.slice(0, i + 1), o];
                    t({
                      history: rp(rw({}, r().history), rf({ histories: a, index: a.length - 1 })),
                    });
                  }, 250),
                },
                nodes: {
                  nodes: {},
                  registerNode: (e, n) => {
                    let i,
                      o,
                      a,
                      s,
                      l = r().nodes,
                      u = l.nodes[e];
                    t({
                      nodes:
                        ((a = rw({}, l)),
                        (s = {
                          nodes:
                            ((i = rw({}, l.nodes)),
                            (o = {
                              [e]: rp(
                                rw(
                                  rw(
                                    rw(
                                      {},
                                      {
                                        id: e,
                                        methods: {
                                          sync: () => null,
                                          hideOverlay: () => null,
                                          showOverlay: () => null,
                                        },
                                        element: null,
                                      }
                                    ),
                                    u
                                  ),
                                  n
                                ),
                                rf({ id: e })
                              ),
                            }),
                            rp(i, rf(o))),
                        }),
                        rp(a, rf(s))),
                    });
                  },
                  unregisterNode: (e) => {
                    let n = r().nodes;
                    if (n.nodes[e]) {
                      let r = rw({}, n.nodes);
                      (delete r[e], t({ nodes: rp(rw({}, n), rf({ nodes: r })) }));
                    }
                  },
                },
                permissions: {
                  cache: {},
                  globalPermissions: { drag: !0, edit: !0, delete: !0, duplicate: !0, insert: !0 },
                  resolvedPermissions: {},
                  getPermissions: ({ item: e, type: t, root: n } = {}) => {
                    let { config: i, permissions: o } = r(),
                      { globalPermissions: a, resolvedPermissions: s } = o;
                    if (e) {
                      let t = i.components[e.type],
                        r = rw(rw({}, a), null == t ? void 0 : t.permissions),
                        n = s[e.props.id];
                      return n ? rw(rw({}, a), n) : r;
                    }
                    if (t) {
                      let e = i.components[t];
                      return rw(rw({}, a), null == e ? void 0 : e.permissions);
                    }
                    if (n) {
                      let e = i.root,
                        t = rw(rw({}, a), null == e ? void 0 : e.permissions),
                        r = s.root;
                      return r ? rw(rw({}, a), r) : t;
                    }
                    return a;
                  },
                  resolvePermissions: (o = (...e) =>
                    rj(void 0, [...e], function* (e = {}, n) {
                      let { state: i, permissions: o, config: a } = r(),
                        { cache: s, globalPermissions: l } = o,
                        u = (e, n = !1) =>
                          rj(void 0, null, function* () {
                            var i, o, a;
                            let { config: u, state: d, setComponentLoading: c } = r(),
                              p = "root" === e.type ? u.root : u.components[e.type];
                            if (!p) return;
                            let h = rw(rw({}, l), p.permissions);
                            if (p.resolvePermissions) {
                              let l = r$(e, null == (i = s[e.props.id]) ? void 0 : i.lastData);
                              if (Object.values(l).some((e) => !0 === e) || n) {
                                let n,
                                  i,
                                  u = c(e.props.id, !0, 50),
                                  f = yield p.resolvePermissions(e, {
                                    changed: l,
                                    lastPermissions:
                                      (null == (o = s[e.props.id]) ? void 0 : o.lastPermissions) ||
                                      null,
                                    permissions: h,
                                    appState: ue(d),
                                    lastData:
                                      (null == (a = s[e.props.id]) ? void 0 : a.lastData) || null,
                                  }),
                                  g = r().permissions;
                                (t({
                                  permissions:
                                    ((n = rw({}, g)),
                                    (i = {
                                      cache: rp(
                                        rw({}, g.cache),
                                        rf({ [e.props.id]: { lastData: e, lastPermissions: f } })
                                      ),
                                      resolvedPermissions: rp(
                                        rw({}, g.resolvedPermissions),
                                        rf({ [e.props.id]: f })
                                      ),
                                    }),
                                    rp(n, rf(i))),
                                }),
                                  u());
                              }
                            }
                          }),
                        { item: d, type: c, root: p } = e;
                      d
                        ? yield u(d, n)
                        : c
                          ? us(i, a)
                              .filter((e) => e.type === c)
                              .map((e) =>
                                rj(void 0, null, function* () {
                                  yield u(e, n);
                                })
                              )
                          : p
                            ? ((e = !1) => {
                                let { state: t } = r();
                                u(
                                  {
                                    type: "root",
                                    props: rp(rw({}, t.data.root.props), rf({ id: "root" })),
                                  },
                                  e
                                );
                              })(n)
                            : us(i, a).map((e) =>
                                rj(void 0, null, function* () {
                                  yield u(e, n);
                                })
                              );
                    })),
                  refreshPermissions: (e) => o(e, !0),
                },
                getComponentConfig: (e) => {
                  var t;
                  let { config: n, selectedItem: i } = r(),
                    o = (null == (t = n.root) ? void 0 : t.fields) || ul;
                  return e && "root" !== e
                    ? n.components[e]
                    : i
                      ? n.components[i.type]
                      : rp(rw({}, n.root), rf({ fields: o }));
                },
                selectedItem: (
                  null == (n = null == e ? void 0 : e.state) ? void 0 : n.ui.itemSelector
                )
                  ? l3(
                      null == (i = null == e ? void 0 : e.state) ? void 0 : i.ui.itemSelector,
                      e.state
                    )
                  : null,
                dispatch: (e) =>
                  t((t) => {
                    var n, i;
                    let { record: o } = r().history,
                      a = ut({ record: o, appStore: t })(t.state, e),
                      s = a.ui.itemSelector ? l3(a.ui.itemSelector, a) : null;
                    return (
                      null == (i = (n = r()).onAction) || i.call(n, e, a, r().state),
                      rp(rw({}, t), rf({ state: a, selectedItem: s }))
                    );
                  }),
                setZoomConfig: (e) => t({ zoomConfig: e }),
                setStatus: (e) => t({ status: e }),
                setComponentState: (e) => t({ componentState: e }),
                pendingLoadTimeouts: {},
                setComponentLoading: (e, n = !0, i = 0) => {
                  let { setComponentState: o, pendingLoadTimeouts: a } = r(),
                    s = l2(),
                    l = () => {
                      var n;
                      let i,
                        l,
                        { componentState: d } = r();
                      (clearTimeout(u),
                        delete a[s],
                        t({ pendingLoadTimeouts: a }),
                        o(
                          ((i = rw({}, d)),
                          (l = {
                            [e]: rp(
                              rw({}, d[e]),
                              rf({
                                loadingCount: Math.max(
                                  ((null == (n = d[e]) ? void 0 : n.loadingCount) || 0) - 1,
                                  0
                                ),
                              })
                            ),
                          }),
                          rp(i, rf(l)))
                        ));
                    },
                    u = setTimeout(() => {
                      (n
                        ? (() => {
                            var t;
                            let n,
                              i,
                              { componentState: a } = r();
                            o(
                              ((n = rw({}, a)),
                              (i = {
                                [e]: rp(
                                  rw({}, a[e]),
                                  rf({
                                    loadingCount:
                                      ((null == (t = a[e]) ? void 0 : t.loadingCount) || 0) + 1,
                                  })
                                ),
                              }),
                              rp(n, rf(i)))
                            );
                          })()
                        : l(),
                        delete a[s],
                        t({ pendingLoadTimeouts: a }));
                    }, i);
                  return (t({ pendingLoadTimeouts: rp(rw({}, a), rf({ [e]: u })) }), l);
                },
                unsetComponentLoading: (e) => {
                  let { setComponentLoading: t } = r();
                  t(e, !1);
                },
                setUi: (e, r) =>
                  t((t) => {
                    let n = ut({ record: () => {}, appStore: t })(t.state, {
                        type: "setUi",
                        ui: e,
                        recordHistory: r,
                      }),
                      i = n.ui.itemSelector ? l3(n.ui.itemSelector, n) : null;
                    return rp(rw({}, t), rf({ state: n, selectedItem: i }));
                  }),
                resolveComponentData: (e, t) =>
                  rj(void 0, null, function* () {
                    let { config: n, metadata: i, setComponentLoading: o, permissions: a } = r(),
                      s = {};
                    return yield rW(
                      e,
                      n,
                      i,
                      (e) => {
                        let t = "id" in e.props ? e.props.id : "root";
                        s[t] = o(t, !0, 50);
                      },
                      (e) =>
                        rj(void 0, null, function* () {
                          let t = "id" in e.props ? e.props.id : "root";
                          ("type" in e
                            ? yield a.refreshPermissions({ item: e })
                            : yield a.refreshPermissions({ root: !0 }),
                            s[t]());
                        }),
                      t
                    );
                  }),
                resolveAndCommitData: () =>
                  rj(void 0, null, function* () {
                    let { config: e, state: t, dispatch: n, resolveComponentData: i } = r();
                    rR(
                      t,
                      e,
                      (e) => e,
                      (e) => (
                        i(e, "load").then((e) => {
                          let { state: t } = r(),
                            i = t.indexes.nodes[e.node.props.id];
                          if (i && e.didChange)
                            if ("root" === e.node.props.id)
                              n({
                                type: "replaceRoot",
                                root: ((e) => {
                                  if ("type" in e && "root" !== e.type)
                                    throw Error("Converting non-root item to root.");
                                  let { readOnly: t } = e;
                                  if (e.props) {
                                    if ("id" in e.props) {
                                      let r = e.props,
                                        { id: n } = r;
                                      return { props: r_(r, ["id"]), readOnly: t };
                                    }
                                    return { props: e.props, readOnly: t };
                                  }
                                  return { props: {}, readOnly: t };
                                })(e.node),
                              });
                            else {
                              let r = `${i.parentId}:${i.zone}`,
                                o = t.indexes.zones[r].contentIds.indexOf(e.node.props.id);
                              n({
                                type: "replace",
                                data: e.node,
                                destinationIndex: o,
                                destinationZone: r,
                              });
                            }
                        }),
                        e
                      )
                    );
                  }),
              }),
              rp(a, rf(s))
            );
          })
        ),
      ud = (0, rs.createContext)(uu());
    function uc(e) {
      return r5((0, rs.useContext)(ud), e);
    }
    function up() {
      return (0, rs.useContext)(ud);
    }
    (rk(), rk(), rk());
    var uh = function (e) {
        var t = e.top,
          r = e.right,
          n = e.bottom,
          i = e.left;
        return {
          top: t,
          right: r,
          bottom: n,
          left: i,
          width: r - i,
          height: n - t,
          x: i,
          y: t,
          center: { x: (r + i) / 2, y: (n + t) / 2 },
        };
      },
      uf = function (e, t) {
        return {
          top: e.top + t.top,
          left: e.left + t.left,
          bottom: e.bottom - t.bottom,
          right: e.right - t.right,
        };
      },
      ug = { top: 0, right: 0, bottom: 0, left: 0 },
      um = function (e) {
        var t = e.borderBox,
          r = e.margin,
          n = void 0 === r ? ug : r,
          i = e.border,
          o = void 0 === i ? ug : i,
          a = e.padding,
          s = void 0 === a ? ug : a,
          l = uh({
            top: t.top - n.top,
            left: t.left - n.left,
            bottom: t.bottom + n.bottom,
            right: t.right + n.right,
          }),
          u = uh(uf(t, o)),
          d = uh(uf(u, s));
        return {
          marginBox: l,
          borderBox: uh(t),
          paddingBox: u,
          contentBox: d,
          margin: n,
          border: o,
          padding: s,
        };
      },
      uv = function (e) {
        var t = e.slice(0, -2);
        if ("px" !== e.slice(-2)) return 0;
        var r = Number(t);
        return (
          isNaN(r) &&
            (function (e) {
              if (!e) throw Error("Invariant failed");
            })(!1),
          r
        );
      },
      uy = function (e, t) {
        var r = {
          top: uv(t.marginTop),
          right: uv(t.marginRight),
          bottom: uv(t.marginBottom),
          left: uv(t.marginLeft),
        };
        return um({
          borderBox: e,
          margin: r,
          padding: {
            top: uv(t.paddingTop),
            right: uv(t.paddingRight),
            bottom: uv(t.paddingBottom),
            left: uv(t.paddingLeft),
          },
          border: {
            top: uv(t.borderTopWidth),
            right: uv(t.borderRightWidth),
            bottom: uv(t.borderBottomWidth),
            left: uv(t.borderLeftWidth),
          },
        });
      },
      ub = function (e) {
        return uy(e.getBoundingClientRect(), window.getComputedStyle(e));
      },
      ux = (e) => {
        let t = up();
        return (r) => {
          let { state: n, zoomConfig: i, setZoomConfig: o } = t.getState(),
            { viewports: a } = n.ui,
            s = (null == r ? void 0 : r.viewports) || a;
          e.current &&
            o(
              ((e, t, r) => {
                let { width: n, height: i } = ub(t).contentBox,
                  o = "auto" === e.height ? i : e.height,
                  a = 0,
                  s = 1;
                if (e.width > n || o > i) {
                  let t = Math.min(n / e.width, 1),
                    l = Math.min(i / o, 1);
                  ((r = t), t < l ? (a = o / r) : ((a = o), (r = l)), (s = r));
                } else ((s = 1), (r = 1), (a = o));
                return { autoZoom: s, rootHeight: a, zoom: r };
              })(null == s ? void 0 : s.current, e.current, i.zoom)
            );
        };
      };
    rk();
    var uw = lG("Loader", {
        Loader: "_Loader_nacdm_13",
        "loader-animation": "_loader-animation_nacdm_1",
      }),
      u_ = (e) => {
        var { color: t, size: r = 16 } = e,
          n = r_(e, ["color", "size"]);
        return (0, rX.jsx)(
          "span",
          rw(
            { className: uw(), style: { width: r, height: r, color: t }, "aria-label": "loading" },
            n
          )
        );
      },
      uj = lG("IconButton", {
        IconButton: "_IconButton_swpni_1",
        "IconButton--disabled": "_IconButton--disabled_swpni_20",
        "IconButton-title": "_IconButton-title_swpni_33",
      }),
      uk = ({
        children: e,
        href: t,
        onClick: r,
        variant: n = "primary",
        type: i,
        disabled: o,
        tabIndex: a,
        newTab: s,
        fullWidth: l,
        title: u,
      }) => {
        let [d, c] = (0, rs.useState)(!1);
        return (0, rX.jsxs)(t ? "a" : "button", {
          className: uj({
            primary: "primary" === n,
            secondary: "secondary" === n,
            disabled: o,
            fullWidth: l,
          }),
          onClick: (e) => {
            r &&
              (c(!0),
              Promise.resolve(r(e)).then(() => {
                c(!1);
              }));
          },
          type: i,
          disabled: o || d,
          tabIndex: a,
          target: s ? "_blank" : void 0,
          rel: s ? "noreferrer" : void 0,
          href: t,
          title: u,
          children: [
            (0, rX.jsx)("span", { className: uj("title"), children: u }),
            e,
            d && (0, rX.jsxs)(rX.Fragment, { children: ["  ", (0, rX.jsx)(u_, { size: 14 })] }),
          ],
        });
      };
    (rk(), rk(), rk());
    var uS = /^(data-.*)$/,
      uI = lG("Button", {
        Button: "_Button_10byl_1",
        "Button--medium": "_Button--medium_10byl_29",
        "Button--large": "_Button--large_10byl_37",
        "Button-icon": "_Button-icon_10byl_44",
        "Button--primary": "_Button--primary_10byl_48",
        "Button--secondary": "_Button--secondary_10byl_67",
        "Button--flush": "_Button--flush_10byl_84",
        "Button--disabled": "_Button--disabled_10byl_88",
        "Button--fullWidth": "_Button--fullWidth_10byl_95",
        "Button-spinner": "_Button-spinner_10byl_100",
      }),
      uE = (e) => {
        let t;
        var {
            children: r,
            href: n,
            onClick: i,
            variant: o = "primary",
            type: a,
            disabled: s,
            tabIndex: l,
            newTab: u,
            fullWidth: d,
            icon: c,
            size: p = "medium",
            loading: h = !1,
          } = e,
          f = r_(e, [
            "children",
            "href",
            "onClick",
            "variant",
            "type",
            "disabled",
            "tabIndex",
            "newTab",
            "fullWidth",
            "icon",
            "size",
            "loading",
          ]);
        let [g, m] = (0, rs.useState)(h);
        (0, rs.useEffect)(() => m(h), [h]);
        let v = ((e) => {
          let t = {};
          for (let r in e)
            Object.prototype.hasOwnProperty.call(e, r) && uS.test(r) && (t[r] = e[r]);
          return t;
        })(f);
        return (0, rX.jsxs)(
          n ? "a" : a ? "button" : "span",
          ((t = rw(
            {
              className: uI({
                primary: "primary" === o,
                secondary: "secondary" === o,
                disabled: s,
                fullWidth: d,
                [p]: !0,
              }),
              onClick: (e) => {
                i &&
                  (m(!0),
                  Promise.resolve(i(e)).then(() => {
                    m(!1);
                  }));
              },
              type: a,
              disabled: s || g,
              tabIndex: l,
              target: u ? "_blank" : void 0,
              rel: u ? "noreferrer" : void 0,
              href: n,
            },
            v
          )),
          rp(
            t,
            rf({
              children: [
                c && (0, rX.jsx)("div", { className: uI("icon"), children: c }),
                r,
                g &&
                  (0, rX.jsx)("div", {
                    className: uI("spinner"),
                    children: (0, rX.jsx)(u_, { size: 14 }),
                  }),
              ],
            })
          ))
        );
      };
    (rk(), rk());
    var uO = {
      InputWrapper: "_InputWrapper_bsxfo_1",
      "Input-label": "_Input-label_bsxfo_5",
      "Input-labelIcon": "_Input-labelIcon_bsxfo_14",
      "Input-disabledIcon": "_Input-disabledIcon_bsxfo_21",
      "Input-input": "_Input-input_bsxfo_26",
      Input: "_Input_bsxfo_1",
      "Input--readOnly": "_Input--readOnly_bsxfo_82",
      "Input-radioGroupItems": "_Input-radioGroupItems_bsxfo_93",
      "Input-radio": "_Input-radio_bsxfo_93",
      "Input-radioInner": "_Input-radioInner_bsxfo_110",
      "Input-radioInput": "_Input-radioInput_bsxfo_155",
    };
    (rk(), rk(), rk());
    var uC = {
      ArrayField: "_ArrayField_14u8o_5",
      "ArrayField--isDraggingFrom": "_ArrayField--isDraggingFrom_14u8o_13",
      "ArrayField-addButton": "_ArrayField-addButton_14u8o_18",
      "ArrayField--hasItems": "_ArrayField--hasItems_14u8o_33",
      "ArrayField-inner": "_ArrayField-inner_14u8o_59",
      ArrayFieldItem: "_ArrayFieldItem_14u8o_67",
      "ArrayFieldItem--isDragging": "_ArrayFieldItem--isDragging_14u8o_78",
      "ArrayFieldItem--isExpanded": "_ArrayFieldItem--isExpanded_14u8o_82",
      "ArrayFieldItem-summary": "_ArrayFieldItem-summary_14u8o_97",
      "ArrayField--addDisabled": "_ArrayField--addDisabled_14u8o_127",
      "ArrayFieldItem-body": "_ArrayFieldItem-body_14u8o_166",
      "ArrayFieldItem-fieldset": "_ArrayFieldItem-fieldset_14u8o_175",
      "ArrayFieldItem-rhs": "_ArrayFieldItem-rhs_14u8o_183",
      "ArrayFieldItem-actions": "_ArrayFieldItem-actions_14u8o_189",
    };
    (rk(), rk(), rk());
    var uM = (...e) =>
      e
        .filter((e, t, r) => !!e && "" !== e.trim() && r.indexOf(e) === t)
        .join(" ")
        .trim();
    (rk(), rk());
    var uP = {
        xmlns: "http://www.w3.org/2000/svg",
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
      uA = (0, rs.forwardRef)((e, t) => {
        var {
            color: r = "currentColor",
            size: n = 24,
            strokeWidth: i = 2,
            absoluteStrokeWidth: o,
            className: a = "",
            children: s,
            iconNode: l,
          } = e,
          u = r_(e, [
            "color",
            "size",
            "strokeWidth",
            "absoluteStrokeWidth",
            "className",
            "children",
            "iconNode",
          ]);
        return (0, rs.createElement)(
          "svg",
          rw(
            rp(
              rw({ ref: t }, uP),
              rf({
                width: n,
                height: n,
                stroke: r,
                strokeWidth: o ? (24 * Number(i)) / Number(n) : i,
                className: uM("lucide", a),
              })
            ),
            u
          ),
          [...l.map(([e, t]) => (0, rs.createElement)(e, t)), ...(Array.isArray(s) ? s : [s])]
        );
      }),
      uz = (e, t) => {
        let r = (0, rs.forwardRef)((r, n) => {
          var { className: i } = r,
            o = r_(r, ["className"]);
          return (0, rs.createElement)(
            uA,
            rw(
              {
                ref: n,
                iconNode: t,
                className: uM(
                  `lucide-${e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`,
                  i
                ),
              },
              o
            )
          );
        });
        return ((r.displayName = `${e}`), r);
      };
    rk();
    var uD = uz("ChevronDown", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);
    rk();
    var uL = uz("ChevronRight", [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]);
    rk();
    var uN = uz("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
    rk();
    var uT = uz("CircleCheckBig", [
      ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
      ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
    ]);
    rk();
    var uB = uz("Copy", [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }],
    ]);
    rk();
    var uR = uz("CornerLeftUp", [
      ["polyline", { points: "14 9 9 4 4 9", key: "m9oyvo" }],
      ["path", { d: "M20 20h-7a4 4 0 0 1-4-4V4", key: "1blwi3" }],
    ]);
    rk();
    var u$ = uz("EllipsisVertical", [
      ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
      ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
      ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }],
    ]);
    rk();
    var uF = uz("Globe", [
      ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
      ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
      ["path", { d: "M2 12h20", key: "9i4pu4" }],
    ]);
    rk();
    var uW = uz("Hash", [
      ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
      ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
      ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
      ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }],
    ]);
    rk();
    var uH = uz("Layers", [
      [
        "path",
        {
          d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
          key: "zw3jo",
        },
      ],
      [
        "path",
        {
          d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
          key: "1wduqc",
        },
      ],
      [
        "path",
        {
          d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
          key: "kqbvx6",
        },
      ],
    ]);
    rk();
    var uU = uz("LayoutGrid", [
      ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
      ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
      ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
      ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }],
    ]);
    rk();
    var uZ = uz("Link", [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
      [
        "path",
        { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" },
      ],
    ]);
    rk();
    var uV = uz("List", [
      ["path", { d: "M3 12h.01", key: "nlz23k" }],
      ["path", { d: "M3 18h.01", key: "1tta3j" }],
      ["path", { d: "M3 6h.01", key: "1rqtza" }],
      ["path", { d: "M8 12h13", key: "1za7za" }],
      ["path", { d: "M8 18h13", key: "1lx6n3" }],
      ["path", { d: "M8 6h13", key: "ik3vkj" }],
    ]);
    rk();
    var uq = uz("LockOpen", [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }],
    ]);
    rk();
    var uY = uz("Lock", [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }],
    ]);
    rk();
    var uK = uz("Monitor", [
      ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
      ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
      ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }],
    ]);
    rk();
    var uX = uz("PanelLeft", [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
      ["path", { d: "M9 3v18", key: "fh3hqa" }],
    ]);
    rk();
    var uG = uz("PanelRight", [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
      ["path", { d: "M15 3v18", key: "14nvp0" }],
    ]);
    rk();
    var uJ = uz("Plus", [
      ["path", { d: "M5 12h14", key: "1ays0h" }],
      ["path", { d: "M12 5v14", key: "s699le" }],
    ]);
    rk();
    var uQ = uz("Redo2", [
      ["path", { d: "m15 14 5-5-5-5", key: "12vg1m" }],
      ["path", { d: "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13", key: "6uklza" }],
    ]);
    rk();
    var u0 = uz("Search", [
      ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }],
    ]);
    rk();
    var u1 = uz("SlidersHorizontal", [
      ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
      ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
      ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
      ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
      ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
      ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
      ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
      ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
      ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }],
    ]);
    rk();
    var u2 = uz("Smartphone", [
      ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
      ["path", { d: "M12 18h.01", key: "mhygvu" }],
    ]);
    rk();
    var u4 = uz("Tablet", [
      ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2", key: "76otgf" }],
      ["line", { x1: "12", x2: "12.01", y1: "18", y2: "18", key: "1dp563" }],
    ]);
    rk();
    var u5 = uz("Trash", [
      ["path", { d: "M3 6h18", key: "d0wm0j" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
    ]);
    rk();
    var u6 = uz("Type", [
      ["polyline", { points: "4 7 4 4 20 4 20 7", key: "1nosan" }],
      ["line", { x1: "9", x2: "15", y1: "20", y2: "20", key: "swin9y" }],
      ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }],
    ]);
    rk();
    var u3 = uz("Undo2", [
      ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
      ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }],
    ]);
    rk();
    var u8 = uz("ZoomIn", [
      ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
      ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
      ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }],
    ]);
    rk();
    var u7 = uz("ZoomOut", [
      ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
      ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }],
    ]);
    (rk(), rk(), rk());
    var u9 = lG("DragIcon", {
        DragIcon: "_DragIcon_17p8x_1",
        "DragIcon--disabled": "_DragIcon--disabled_17p8x_8",
      }),
      de = ({ isDragDisabled: e }) =>
        (0, rX.jsx)("div", {
          className: u9({ disabled: e }),
          children: (0, rX.jsx)("svg", {
            viewBox: "0 0 20 20",
            width: "12",
            fill: "currentColor",
            children: (0, rX.jsx)("path", {
              d: "M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z",
            }),
          }),
        });
    (rk(), rk());
    var dt = { delay: { value: 200, tolerance: 10 } },
      dr = { delay: { value: 200, tolerance: 10 }, distance: { value: 5 } },
      dn = ({ other: e = dr, mouse: t, touch: r = dt } = { touch: dt, other: dr }) => {
        let [n] = (0, rs.useState)(() => [
          sc.configure({
            activationConstraints(n, i) {
              var o;
              let { pointerType: a, target: s } = n;
              return "mouse" === a &&
                as(s) &&
                (i.handle === s || (null == (o = i.handle) ? void 0 : o.contains(s)))
                ? t
                : "touch" === a
                  ? r
                  : e;
            },
          }),
        ]);
        return n;
      };
    (rk(), rk(), rk());
    var di = (e, t, r, n, i) => {},
      da = "increasing";
    rk();
    var ds = (e, t) => {
      if ("dynamic" === e) {
        if (!(Math.abs(t.y) > Math.abs(t.x))) return 0 === t.x ? null : t.x > 0 ? "right" : "left";
      } else if ("x" === e) return 0 === t.x ? null : t.x > 0 ? "right" : "left";
      return 0 === t.y ? null : t.y > 0 ? "down" : "up";
    };
    (rk(), rk());
    var dl = {
      current: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      previous: { x: 0, y: 0 },
      direction: null,
    };
    rk();
    var du = ({ dragOperation: e, droppable: t }) => {
      let r = e.position.current;
      if (!r) return null;
      let { id: n } = t;
      return t.shape && t.shape.containsPoint(r)
        ? {
            id: n,
            value: 1 / ih.distance(t.shape.center, r),
            type: i7.PointerIntersection,
            priority: i8.High,
          }
        : null;
    };
    rk();
    var dd = r2(() => ({ fallbackEnabled: !1 })),
      dc = "",
      dp =
        (e, t = 0.05) =>
        (r) => {
          var n, i, o, a, s;
          let { dragOperation: l, droppable: u } = r,
            { position: d } = l,
            c = null == (n = l.shape) ? void 0 : n.current,
            { shape: p } = u;
          if (!c || !p) return null;
          let { center: h } = c,
            { fallbackEnabled: f } = dd.getState(),
            g = ((e, t = "dynamic") => (
              (dl.current = e),
              (dl.delta = { x: e.x - dl.previous.x, y: e.y - dl.previous.y }),
              (dl.direction = ds(t, dl.delta) || dl.direction),
              (Math.abs(dl.delta.x) > 10 || Math.abs(dl.delta.y) > 10) &&
                (dl.previous = ih.from(e)),
              dl
            ))(d.current, e),
            m = { direction: g.direction },
            { center: v } = p,
            y = ((e, t, r, n = 0) => {
              let i = e.boundingRectangle,
                o = t.center;
              if ("down" === r) {
                let e = n * t.boundingRectangle.height;
                return i.bottom >= o.y + e;
              }
              if ("up" === r) {
                let e = n * t.boundingRectangle.height;
                return i.top < o.y - e;
              }
              if ("left" === r) {
                let e = n * t.boundingRectangle.width;
                return o.x - e >= i.left;
              }
              let a = n * t.boundingRectangle.width;
              return i.right - a >= o.x;
            })(c, p, g.direction, t);
          if ((null == (i = l.source) ? void 0 : i.id) === u.id) {
            let e = ((e, t) => {
              var r;
              let { dragOperation: n, droppable: i } = e,
                { shape: o } = i,
                { position: a } = n,
                s = null == (r = n.shape) ? void 0 : r.current;
              if (!s || !o) return null;
              let l = o.center,
                u = Math.sqrt(Math.pow(l.x - t.x, 2) + Math.pow(l.y - t.y, 2)),
                d = Math.sqrt(Math.pow(l.x - a.current.x, 2) + Math.pow(l.y - a.current.y, 2));
              return ((da = d === u ? da : d < u ? "decreasing" : "increasing"),
              di(s.center, l, i.id.toString(), "rebeccapurple"),
              "decreasing" === da)
                ? { id: i.id, value: 1, type: i7.Collision }
                : null;
            })(r, g.previous);
            if ((di(h, v, u.id.toString(), "yellow"), e))
              return rp(rw({}, e), rf({ priority: i8.Highest, data: m }));
          }
          let b = c.intersectionArea(p),
            w = b / p.area;
          if (b && y) {
            di(h, v, u.id.toString(), "green", g.direction);
            let e = { id: u.id, value: w, priority: i8.High, type: i7.Collision },
              t = dc === u.id;
            return ((dc = ""), rp(rw({}, e), rf({ id: t ? "flush" : e.id, data: m })));
          }
          if (f && (null == (o = l.source) ? void 0 : o.id) !== u.id) {
            let t =
                p.boundingRectangle.right > c.boundingRectangle.left &&
                p.boundingRectangle.left < c.boundingRectangle.right,
              n =
                p.boundingRectangle.bottom > c.boundingRectangle.top &&
                p.boundingRectangle.top < c.boundingRectangle.bottom;
            if (("y" === e && t) || n) {
              let t = ((e) => {
                let { dragOperation: t, droppable: r } = e,
                  { shape: n, position: i } = t;
                if (!r.shape) return null;
                let o = n ? ig.from(n.current.boundingRectangle).corners : void 0,
                  a = ig.from(r.shape.boundingRectangle).corners.reduce((e, t, r) => {
                    var n;
                    return (
                      e +
                      ih.distance(
                        ih.from(t),
                        null != (n = null == o ? void 0 : o[r]) ? n : i.current
                      )
                    );
                  }, 0);
                return { id: r.id, value: 1 / (a / 4), type: i7.Collision, priority: i8.Normal };
              })(r);
              if (t) {
                let r = ds(e, {
                  x: c.center.x - ((null == (a = u.shape) ? void 0 : a.center.x) || 0),
                  y: c.center.y - ((null == (s = u.shape) ? void 0 : s.center.y) || 0),
                });
                if (((m.direction = r), b))
                  return (
                    di(h, v, u.id.toString(), "red", r || ""),
                    (dc = u.id),
                    rp(rw({}, t), rf({ priority: i8.Low, data: m }))
                  );
                return (
                  di(h, v, u.id.toString(), "orange", r || ""),
                  rp(rw({}, t), rf({ priority: i8.Lowest, data: m }))
                );
              }
            }
          }
          return (di(h, v, u.id.toString(), "hotpink"), null);
        },
      dh = ({ children: e, onDragStart: t, onDragEnd: r, onMove: n }) => {
        let i = dn({ mouse: { distance: { value: 5 } } });
        return (0, rX.jsx)(sF, {
          sensors: i,
          onDragStart: (e) => {
            var r, n;
            return t(
              null != (n = null == (r = e.operation.source) ? void 0 : r.id.toString()) ? n : ""
            );
          },
          onDragOver: (e, t) => {
            var r;
            e.preventDefault();
            let { operation: i } = e,
              { source: o, target: a } = i;
            if (!o || !a) return;
            let s = o.data.index,
              l = a.data.index,
              u = null == (r = t.collisionObserver.collisions[0]) ? void 0 : r.data;
            s !== l &&
              o.id !== a.id &&
              (l >= s && (l -= 1),
              "after" == ((null == u ? void 0 : u.direction) === "up" ? "before" : "after") &&
                (l += 1),
              n({ source: s, target: l }));
          },
          onDragEnd: () => {
            setTimeout(() => {
              r();
            }, 250);
          },
          children: e,
        });
      },
      df = ({ id: e, index: t, disabled: r, children: n, type: i = "item" }) => {
        let {
          ref: o,
          isDragging: a,
          isDropping: s,
          handleRef: l,
        } = lU({
          id: e,
          type: i,
          index: t,
          disabled: r,
          data: { index: t },
          collisionDetector: dp("y"),
        });
        return n({ isDragging: a, isDropping: s, ref: o, handleRef: l });
      };
    rk();
    var dg = (0, rs.createContext)({}),
      dm = () => {
        let e = (0, rs.useContext)(dg);
        return rp(rw({}, e), rf({ readOnlyFields: e.readOnlyFields || {} }));
      },
      dv = ({ children: e, name: t, subName: r, wildcardName: n = t, readOnlyFields: i }) => {
        let o = `${t}.${r}`,
          a = `${n}.${r}`,
          s = (0, rs.useMemo)(
            () =>
              Object.keys(i).reduce((e, r) => {
                if (r.indexOf(o) > -1 || r.indexOf(a) > -1) {
                  let o = new RegExp(
                      `^(${t}|${n}).`
                        .replace(/\[/g, "\\[")
                        .replace(/\]/g, "\\]")
                        .replace(/\./g, "\\.")
                        .replace(/\*/g, "\\*")
                    ),
                    a = r.replace(o, "");
                  return rp(rw({}, e), rf({ [a]: i[r] }));
                }
                return e;
              }, {}),
            [t, r, n, i]
          );
        return (0, rX.jsx)(dg.Provider, {
          value: { readOnlyFields: s, localName: r },
          children: e,
        });
      },
      dy = lG("ArrayField", uC),
      db = lG("ArrayFieldItem", uC);
    rk();
    var dx = lG("Input", uO),
      dw = ({
        field: e,
        onChange: t,
        readOnly: r,
        value: n,
        name: i,
        label: o,
        labelIcon: a,
        Label: s,
        id: l,
      }) =>
        (0, rX.jsx)(s, {
          label: o || i,
          icon:
            a ||
            (0, rX.jsxs)(rX.Fragment, {
              children: [
                "text" === e.type && (0, rX.jsx)(u6, { size: 16 }),
                "number" === e.type && (0, rX.jsx)(uW, { size: 16 }),
              ],
            }),
          readOnly: r,
          children: (0, rX.jsx)("input", {
            className: dx("input"),
            autoComplete: "off",
            type: e.type,
            title: o || i,
            name: i,
            value: (null == n ? void 0 : n.toString) ? n.toString() : "",
            onChange: (r) => {
              if ("number" === e.type) {
                let n = Number(r.currentTarget.value);
                (void 0 === e.min || !(n < e.min)) && ((void 0 !== e.max && n > e.max) || t(n));
              } else t(r.currentTarget.value);
            },
            readOnly: r,
            tabIndex: r ? -1 : void 0,
            id: l,
            min: "number" === e.type ? e.min : void 0,
            max: "number" === e.type ? e.max : void 0,
            placeholder: "text" === e.type || "number" === e.type ? e.placeholder : void 0,
            step: "number" === e.type ? e.step : void 0,
          }),
        });
    (rk(), rk(), rk());
    var d_ = {
      "ExternalInput-actions": "_ExternalInput-actions_91ls0_1",
      "ExternalInput-button": "_ExternalInput-button_91ls0_5",
      "ExternalInput--dataSelected": "_ExternalInput--dataSelected_91ls0_24",
      "ExternalInput--readOnly": "_ExternalInput--readOnly_91ls0_31",
      "ExternalInput-detachButton": "_ExternalInput-detachButton_91ls0_35",
      ExternalInput: "_ExternalInput_91ls0_1",
      ExternalInputModal: "_ExternalInputModal_91ls0_79",
      "ExternalInputModal-grid": "_ExternalInputModal-grid_91ls0_89",
      "ExternalInputModal--filtersToggled": "_ExternalInputModal--filtersToggled_91ls0_100",
      "ExternalInputModal-filters": "_ExternalInputModal-filters_91ls0_105",
      "ExternalInputModal-masthead": "_ExternalInputModal-masthead_91ls0_124",
      "ExternalInputModal-tableWrapper": "_ExternalInputModal-tableWrapper_91ls0_133",
      "ExternalInputModal-table": "_ExternalInputModal-table_91ls0_133",
      "ExternalInputModal-thead": "_ExternalInputModal-thead_91ls0_149",
      "ExternalInputModal-th": "_ExternalInputModal-th_91ls0_149",
      "ExternalInputModal-td": "_ExternalInputModal-td_91ls0_164",
      "ExternalInputModal-tr": "_ExternalInputModal-tr_91ls0_169",
      "ExternalInputModal-tbody": "_ExternalInputModal-tbody_91ls0_176",
      "ExternalInputModal--hasData": "_ExternalInputModal--hasData_91ls0_202",
      "ExternalInputModal-loadingBanner": "_ExternalInputModal-loadingBanner_91ls0_206",
      "ExternalInputModal--isLoading": "_ExternalInputModal--isLoading_91ls0_223",
      "ExternalInputModal-searchForm": "_ExternalInputModal-searchForm_91ls0_227",
      "ExternalInputModal-search": "_ExternalInputModal-search_91ls0_227",
      "ExternalInputModal-searchIcon": "_ExternalInputModal-searchIcon_91ls0_264",
      "ExternalInputModal-searchIconText": "_ExternalInputModal-searchIconText_91ls0_289",
      "ExternalInputModal-searchInput": "_ExternalInputModal-searchInput_91ls0_299",
      "ExternalInputModal-searchActions": "_ExternalInputModal-searchActions_91ls0_313",
      "ExternalInputModal-searchActionIcon": "_ExternalInputModal-searchActionIcon_91ls0_326",
      "ExternalInputModal-footerContainer": "_ExternalInputModal-footerContainer_91ls0_330",
      "ExternalInputModal-footer": "_ExternalInputModal-footer_91ls0_330",
      "ExternalInputModal-field": "_ExternalInputModal-field_91ls0_343",
    };
    (rk(), rk());
    var dj = lG("Modal", {
        Modal: "_Modal_ikbaj_1",
        "Modal--isOpen": "_Modal--isOpen_ikbaj_15",
        "Modal-inner": "_Modal-inner_ikbaj_19",
      }),
      dk = ({ children: e, onClose: t, isOpen: r }) => {
        let [n, i] = (0, rs.useState)(null);
        return ((0, rs.useEffect)(() => {
          i(document.getElementById("puck-portal-root"));
        }, []),
        n)
          ? (0, sw.createPortal)(
              (0, rX.jsx)("div", {
                className: dj({ isOpen: r }),
                onClick: t,
                children: (0, rX.jsx)("div", {
                  className: dj("inner"),
                  onClick: (e) => e.stopPropagation(),
                  children: e,
                }),
              }),
              n
            )
          : (0, rX.jsx)("div", {});
      };
    (rk(), rk());
    var dS = lG("Heading", {
        Heading: "_Heading_qxrry_1",
        "Heading--xxxxl": "_Heading--xxxxl_qxrry_12",
        "Heading--xxxl": "_Heading--xxxl_qxrry_18",
        "Heading--xxl": "_Heading--xxl_qxrry_22",
        "Heading--xl": "_Heading--xl_qxrry_26",
        "Heading--l": "_Heading--l_qxrry_30",
        "Heading--m": "_Heading--m_qxrry_34",
        "Heading--s": "_Heading--s_qxrry_38",
        "Heading--xs": "_Heading--xs_qxrry_42",
      }),
      dI = ({ children: e, rank: t, size: r = "m" }) => {
        let n = t ? `h${t}` : "span";
        return (0, rX.jsx)(n, { className: dS({ [r]: !0 }), children: e });
      };
    rk();
    var dE = lG("ExternalInput", d_),
      dO = lG("ExternalInputModal", d_),
      dC = {},
      dM = ({ field: e, onChange: t, value: r = null, name: n, id: i, readOnly: o }) => {
        let { mapProp: a = (e) => e, mapRow: s = (e) => e, filterFields: l } = e || {},
          [u, d] = (0, rs.useState)([]),
          [c, p] = (0, rs.useState)(!1),
          [h, f] = (0, rs.useState)(!0),
          g = !!l,
          [m, v] = (0, rs.useState)(e.initialFilters || {}),
          [y, b] = (0, rs.useState)(g),
          w = (0, rs.useMemo)(() => u.map(s), [u]),
          _ = (0, rs.useMemo)(() => {
            let e = new Set();
            for (let t of w)
              for (let r of Object.keys(t))
                ("string" == typeof t[r] ||
                  "number" == typeof t[r] ||
                  (0, rs.isValidElement)(t[r])) &&
                  e.add(r);
            return Array.from(e);
          }, [w]),
          [j, k] = (0, rs.useState)(e.initialQuery || ""),
          S = (0, rs.useCallback)(
            (t, r) =>
              rj(void 0, null, function* () {
                f(!0);
                let n = `${i}-${t}-${JSON.stringify(r)}`,
                  o = dC[n] || (yield e.fetchList({ query: t, filters: r }));
                o && (d(o), f(!1), (dC[n] = o));
              }),
            [i, e]
          ),
          I = (0, rs.useCallback)(
            (t) =>
              e.renderFooter
                ? e.renderFooter(t)
                : (0, rX.jsxs)("span", {
                    className: dO("footer"),
                    children: [t.items.length, " result", 1 === t.items.length ? "" : "s"],
                  }),
            [e.renderFooter]
          );
        return (
          (0, rs.useEffect)(() => {
            S(j, m);
          }, []),
          (0, rX.jsxs)("div", {
            className: dE({ dataSelected: !!r, modalVisible: c, readOnly: o }),
            id: i,
            children: [
              (0, rX.jsxs)("div", {
                className: dE("actions"),
                children: [
                  (0, rX.jsx)("button", {
                    type: "button",
                    onClick: () => p(!0),
                    className: dE("button"),
                    disabled: o,
                    children: r
                      ? e.getItemSummary
                        ? e.getItemSummary(r)
                        : "External item"
                      : (0, rX.jsxs)(rX.Fragment, {
                          children: [
                            (0, rX.jsx)(uZ, { size: "16" }),
                            (0, rX.jsx)("span", { children: e.placeholder }),
                          ],
                        }),
                  }),
                  r &&
                    (0, rX.jsx)("button", {
                      type: "button",
                      className: dE("detachButton"),
                      onClick: () => {
                        t(null);
                      },
                      disabled: o,
                      children: (0, rX.jsx)(uq, { size: 16 }),
                    }),
                ],
              }),
              (0, rX.jsx)(dk, {
                onClose: () => p(!1),
                isOpen: c,
                children: (0, rX.jsxs)("form", {
                  className: dO({
                    isLoading: h,
                    loaded: !h,
                    hasData: w.length > 0,
                    filtersToggled: y,
                  }),
                  onSubmit: (e) => {
                    (e.preventDefault(), S(j, m));
                  },
                  children: [
                    (0, rX.jsx)("div", {
                      className: dO("masthead"),
                      children: e.showSearch
                        ? (0, rX.jsxs)("div", {
                            className: dO("searchForm"),
                            children: [
                              (0, rX.jsxs)("label", {
                                className: dO("search"),
                                children: [
                                  (0, rX.jsx)("span", {
                                    className: dO("searchIconText"),
                                    children: "Search",
                                  }),
                                  (0, rX.jsx)("div", {
                                    className: dO("searchIcon"),
                                    children: (0, rX.jsx)(u0, { size: "18" }),
                                  }),
                                  (0, rX.jsx)("input", {
                                    className: dO("searchInput"),
                                    name: "q",
                                    type: "search",
                                    placeholder: e.placeholder,
                                    onChange: (e) => {
                                      k(e.currentTarget.value);
                                    },
                                    autoComplete: "off",
                                    value: j,
                                  }),
                                ],
                              }),
                              (0, rX.jsxs)("div", {
                                className: dO("searchActions"),
                                children: [
                                  (0, rX.jsx)(uE, {
                                    type: "submit",
                                    loading: h,
                                    fullWidth: !0,
                                    children: "Search",
                                  }),
                                  g &&
                                    (0, rX.jsx)("div", {
                                      className: dO("searchActionIcon"),
                                      children: (0, rX.jsx)(uk, {
                                        type: "button",
                                        title: "Toggle filters",
                                        onClick: (e) => {
                                          (e.preventDefault(), e.stopPropagation(), b(!y));
                                        },
                                        children: (0, rX.jsx)(u1, { size: 20 }),
                                      }),
                                    }),
                                ],
                              }),
                            ],
                          })
                        : (0, rX.jsx)(dI, {
                            rank: "2",
                            size: "xs",
                            children: e.placeholder || "Select data",
                          }),
                    }),
                    (0, rX.jsxs)("div", {
                      className: dO("grid"),
                      children: [
                        g &&
                          (0, rX.jsx)("div", {
                            className: dO("filters"),
                            children:
                              g &&
                              Object.keys(l).map((e) => {
                                let t = l[e];
                                return (0, rX.jsx)(
                                  "div",
                                  {
                                    className: dO("field"),
                                    children: (0, rX.jsx)(dW, {
                                      field: t,
                                      name: e,
                                      id: `external_field_${e}_filter`,
                                      label: t.label || e,
                                      value: m[e],
                                      onChange: (t) => {
                                        let r = rp(rw({}, m), rf({ [e]: t }));
                                        (v(r), S(j, r));
                                      },
                                    }),
                                  },
                                  e
                                );
                              }),
                          }),
                        (0, rX.jsxs)("div", {
                          className: dO("tableWrapper"),
                          children: [
                            (0, rX.jsxs)("table", {
                              className: dO("table"),
                              children: [
                                (0, rX.jsx)("thead", {
                                  className: dO("thead"),
                                  children: (0, rX.jsx)("tr", {
                                    className: dO("tr"),
                                    children: _.map((e) =>
                                      (0, rX.jsx)(
                                        "th",
                                        {
                                          className: dO("th"),
                                          style: { textAlign: "left" },
                                          children: e,
                                        },
                                        e
                                      )
                                    ),
                                  }),
                                }),
                                (0, rX.jsx)("tbody", {
                                  className: dO("tbody"),
                                  children: w.map((e, r) =>
                                    (0, rX.jsx)(
                                      "tr",
                                      {
                                        style: { whiteSpace: "nowrap" },
                                        className: dO("tr"),
                                        onClick: () => {
                                          (t(a(u[r])), p(!1));
                                        },
                                        children: _.map((t) =>
                                          (0, rX.jsx)(
                                            "td",
                                            { className: dO("td"), children: e[t] },
                                            t
                                          )
                                        ),
                                      },
                                      r
                                    )
                                  ),
                                }),
                              ],
                            }),
                            (0, rX.jsx)("div", {
                              className: dO("loadingBanner"),
                              children: (0, rX.jsx)(u_, { size: 24 }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, rX.jsx)("div", {
                      className: dO("footerContainer"),
                      children: (0, rX.jsx)(I, { items: w }),
                    }),
                  ],
                }),
              }),
            ],
          })
        );
      };
    rk();
    var dP = lG("Input", uO);
    rk();
    var dA = lG("Input", uO);
    rk();
    var dz = lG("Input", uO);
    (rk(), rk());
    var dD = lG("ObjectField", {
      ObjectField: "_ObjectField_1ua3y_5",
      "ObjectField-fieldset": "_ObjectField-fieldset_1ua3y_13",
    });
    rk();
    var dL = () => {
        if (void 0 !== rs.default.useId) return rs.default.useId();
        let [e] = (0, rs.useState)(l2());
        return e;
      },
      dN = lG("Input", uO),
      dT = lG("InputWrapper", uO),
      dB = ({ children: e, icon: t, label: r, el: n = "label", readOnly: i, className: o }) =>
        (0, rX.jsxs)(n, {
          className: o,
          children: [
            (0, rX.jsxs)("div", {
              className: dN("label"),
              children: [
                t
                  ? (0, rX.jsx)("div", { className: dN("labelIcon"), children: t })
                  : (0, rX.jsx)(rX.Fragment, {}),
                r,
                i &&
                  (0, rX.jsx)("div", {
                    className: dN("disabledIcon"),
                    title: "Read-only",
                    children: (0, rX.jsx)(uY, { size: "12" }),
                  }),
              ],
            }),
            e,
          ],
        }),
      dR = ({ children: e, icon: t, label: r, el: n = "label", readOnly: i }) => {
        let o = uc((e) => e.overrides),
          a = (0, rs.useMemo)(() => o.fieldLabel || dB, [o]);
        return r
          ? (0, rX.jsx)(a, {
              label: r,
              icon: t,
              className: dN({ readOnly: i }),
              readOnly: i,
              el: n,
              children: e,
            })
          : (0, rX.jsx)(rX.Fragment, { children: e });
      },
      d$ = {
        array: ({
          field: e,
          onChange: t,
          value: r,
          name: n,
          label: i,
          labelIcon: o,
          readOnly: a,
          id: s,
          Label: l = (e) => (0, rX.jsx)("div", rw({}, e)),
        }) => {
          let u = uc((e) => e.state.ui.arrayState[s]),
            d = uc((e) => e.setUi),
            { readOnlyFields: c, localName: p = n } = dm(),
            h = u || {
              items: Array.from(r || []).map((e, t) => ({
                _originalIndex: t,
                _arrayId: `${s}-${t}`,
              })),
              openId: "",
            },
            [f, g] = (0, rs.useState)({ arrayState: h, value: r });
          (0, rs.useEffect)(() => {
            var e;
            g({ arrayState: null != (e = m.getState().state.ui.arrayState[s]) ? e : h, value: r });
          }, [r]);
          let m = up(),
            v = (0, rs.useCallback)(
              (e) => ({
                arrayState: rp(
                  rw({}, m.getState().state.ui.arrayState),
                  rf({ [s]: rw(rw({}, h), e) })
                ),
              }),
              [h, m]
            ),
            y = (0, rs.useCallback)(
              () => h.items.reduce((e, t) => (t._originalIndex > e ? t._originalIndex : e), -1),
              [h]
            ),
            b = (0, rs.useCallback)(
              (e) => {
                let t = y(),
                  r = Array.from(e || []).map((e, r) => {
                    var n;
                    let i = h.items[r],
                      o = {
                        _originalIndex:
                          void 0 !== (null == i ? void 0 : i._originalIndex)
                            ? i._originalIndex
                            : t + 1,
                        _arrayId:
                          (null == (n = h.items[r]) ? void 0 : n._arrayId) || `${s}-${t + 1}`,
                      };
                    return (o._originalIndex > t && (t = o._originalIndex), o);
                  });
                return rp(rw({}, h), rf({ items: r }));
              },
              [h]
            );
          (0, rs.useEffect)(() => {
            h.items.length > 0 && d(v(h));
          }, []);
          let [w, _] = (0, rs.useState)(""),
            j = !!w,
            k = !uc((e) => e.permissions.getPermissions({ item: e.selectedItem }).edit),
            S = (0, rs.useRef)(r),
            I = (0, rs.useCallback)(
              (t) => {
                if ("array" !== e.type || !e.arrayFields) return;
                let r = m.getState().config;
                return rO({
                  value: t,
                  fields: e.arrayFields,
                  mappers: { slot: ({ value: e }) => e.map((e) => l5(e, r, !0)) },
                  config: r,
                });
              },
              [m, e]
            );
          if ("array" !== e.type || !e.arrayFields) return null;
          let E = (void 0 !== e.max && f.arrayState.items.length >= e.max) || a;
          return (0, rX.jsx)(l, {
            label: i || n,
            icon: o || (0, rX.jsx)(uV, { size: 16 }),
            el: "div",
            readOnly: a,
            children: (0, rX.jsx)(dh, {
              onDragStart: (e) => _(e),
              onDragEnd: () => {
                (_(""), t(S.current));
              },
              onMove: (e) => {
                let t, r;
                if (h.items[e.source]._arrayId !== w) return;
                let n = l0(f.value, e.source, e.target),
                  i = l0(h.items, e.source, e.target);
                (d(
                  {
                    arrayState:
                      ((t = rw({}, m.getState().state.ui.arrayState)),
                      (r = { [s]: rp(rw({}, h), rf({ items: i })) }),
                      rp(t, rf(r))),
                  },
                  !1
                ),
                  g({ value: n, arrayState: rp(rw({}, h), rf({ items: i })) }),
                  (S.current = n));
              },
              children: (0, rX.jsxs)("div", {
                className: dy({ hasItems: Array.isArray(r) && r.length > 0, addDisabled: E }),
                children: [
                  f.arrayState.items.length > 0 &&
                    (0, rX.jsx)("div", {
                      className: dy("inner"),
                      "data-dnd-container": !0,
                      children: f.arrayState.items.map((i, o) => {
                        let { _arrayId: l = `${s}-${o}`, _originalIndex: u = o } = i,
                          g = Array.from(f.value || [])[o] || {};
                        return (0, rX.jsx)(
                          df,
                          {
                            id: l,
                            index: o,
                            disabled: a,
                            children: ({ isDragging: i, ref: s, handleRef: m }) =>
                              (0, rX.jsxs)("div", {
                                ref: s,
                                className: db({
                                  isExpanded: h.openId === l,
                                  isDragging: i,
                                  readOnly: a,
                                }),
                                children: [
                                  (0, rX.jsxs)("div", {
                                    ref: m,
                                    onClick: (e) => {
                                      i ||
                                        (e.preventDefault(),
                                        e.stopPropagation(),
                                        h.openId === l
                                          ? d(v({ openId: "" }))
                                          : d(v({ openId: l })));
                                    },
                                    className: db("summary"),
                                    children: [
                                      e.getItemSummary ? e.getItemSummary(g, o) : `Item #${u}`,
                                      (0, rX.jsxs)("div", {
                                        className: db("rhs"),
                                        children: [
                                          !a &&
                                            (0, rX.jsxs)("div", {
                                              className: db("actions"),
                                              children: [
                                                (0, rX.jsx)("div", {
                                                  className: db("action"),
                                                  children: (0, rX.jsx)(uk, {
                                                    type: "button",
                                                    disabled: !!E,
                                                    onClick: (e) => {
                                                      e.stopPropagation();
                                                      let n = [...(r || [])],
                                                        i = I(n[o]);
                                                      (n.splice(o, 0, i), d(v(b(n)), !1), t(n));
                                                    },
                                                    title: "Duplicate",
                                                    children: (0, rX.jsx)(uB, { size: 16 }),
                                                  }),
                                                }),
                                                (0, rX.jsx)("div", {
                                                  className: db("action"),
                                                  children: (0, rX.jsx)(uk, {
                                                    type: "button",
                                                    disabled:
                                                      void 0 !== e.min &&
                                                      e.min >= f.arrayState.items.length,
                                                    onClick: (e) => {
                                                      e.stopPropagation();
                                                      let n = [...(r || [])],
                                                        i = [...(h.items || [])];
                                                      (n.splice(o, 1),
                                                        i.splice(o, 1),
                                                        d(v({ items: i }), !1),
                                                        t(n));
                                                    },
                                                    title: "Delete",
                                                    children: (0, rX.jsx)(u5, { size: 16 }),
                                                  }),
                                                }),
                                              ],
                                            }),
                                          (0, rX.jsx)("div", { children: (0, rX.jsx)(de, {}) }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, rX.jsx)("div", {
                                    className: db("body"),
                                    children:
                                      h.openId === l &&
                                      (0, rX.jsx)("fieldset", {
                                        className: db("fieldset"),
                                        children: Object.keys(e.arrayFields).map((i) => {
                                          let a = e.arrayFields[i],
                                            s = `${n}[${o}]`,
                                            u = `${s}.${i}`,
                                            d = `${p}[${o}]`,
                                            h = `${p}[*]`,
                                            f = `${d}.${i}`,
                                            m = `${h}.${i}`,
                                            v = k || (void 0 !== c[u] ? c[f] : c[m]),
                                            y = a.label || i;
                                          return (0, rX.jsx)(
                                            dv,
                                            {
                                              name: d,
                                              wildcardName: h,
                                              subName: i,
                                              readOnlyFields: c,
                                              children: (0, rX.jsx)(dW, {
                                                name: u,
                                                label: y,
                                                id: `${l}_${i}`,
                                                readOnly: v,
                                                field: rp(rw({}, a), rf({ label: y })),
                                                value: g[i],
                                                onChange: (e, n) => {
                                                  var a;
                                                  let s;
                                                  t(
                                                    ((a = rp(rw({}, g), rf({ [i]: e }))),
                                                    (s = Array.from(r)).splice(o, 1),
                                                    s.splice(o, 0, a),
                                                    s),
                                                    n
                                                  );
                                                },
                                              }),
                                            },
                                            u
                                          );
                                        }),
                                      }),
                                  }),
                                ],
                              }),
                          },
                          l
                        );
                      }),
                    }),
                  !E &&
                    (0, rX.jsx)("button", {
                      type: "button",
                      className: dy("addButton"),
                      onClick: () => {
                        var n;
                        if (j) return;
                        let i = [
                          ...(r || []),
                          rS(I(null != (n = e.defaultItemProps) ? n : {}), e.arrayFields),
                        ];
                        (d(v(b(i)), !1), t(i));
                      },
                      children: (0, rX.jsx)(uJ, { size: 21 }),
                    }),
                ],
              }),
            }),
          });
        },
        external: ({
          field: e,
          onChange: t,
          value: r,
          name: n,
          label: i,
          labelIcon: o,
          Label: a,
          id: s,
          readOnly: l,
        }) => {
          var u, d, c;
          return ((0, rs.useEffect)(() => {
            e.adaptor &&
              console.error(
                "Warning: The `adaptor` API is deprecated. Please use updated APIs on the `external` field instead. This will be a breaking change in a future release."
              );
          }, []),
          "external" !== e.type)
            ? null
            : (0, rX.jsx)(a, {
                label: i || n,
                icon: o || (0, rX.jsx)(uZ, { size: 16 }),
                el: "div",
                children: (0, rX.jsx)(dM, {
                  name: n,
                  field: rp(
                    rw({}, e),
                    rf({
                      placeholder: (null == (u = e.adaptor) ? void 0 : u.name)
                        ? `Select from ${e.adaptor.name}`
                        : e.placeholder || "Select data",
                      mapProp: (null == (d = e.adaptor) ? void 0 : d.mapProp) || e.mapProp,
                      mapRow: e.mapRow,
                      fetchList: (null == (c = e.adaptor) ? void 0 : c.fetchList)
                        ? () =>
                            rj(void 0, null, function* () {
                              return yield e.adaptor.fetchList(e.adaptorParams);
                            })
                        : e.fetchList,
                    })
                  ),
                  onChange: t,
                  value: r,
                  id: s,
                  readOnly: l,
                }),
              });
        },
        object: ({
          field: e,
          onChange: t,
          value: r,
          name: n,
          label: i,
          labelIcon: o,
          Label: a,
          readOnly: s,
          id: l,
        }) => {
          let { readOnlyFields: u, localName: d = n } = dm();
          if ("object" !== e.type || !e.objectFields) return null;
          let c = r || {};
          return (0, rX.jsx)(a, {
            label: i || n,
            icon: o || (0, rX.jsx)(u$, { size: 16 }),
            el: "div",
            readOnly: s,
            children: (0, rX.jsx)("div", {
              className: dD(),
              children: (0, rX.jsx)("fieldset", {
                className: dD("fieldset"),
                children: Object.keys(e.objectFields).map((r) => {
                  let n = e.objectFields[r],
                    i = `${d}.${r}`,
                    o = s || u[i],
                    a = n.label || r;
                  return (0, rX.jsx)(
                    dv,
                    {
                      name: d || l,
                      subName: r,
                      readOnlyFields: u,
                      children: (0, rX.jsx)(dW, {
                        name: i,
                        label: i,
                        id: `${l}_${r}`,
                        readOnly: o,
                        field: rp(rw({}, n), rf({ label: a })),
                        value: c[r],
                        onChange: (e, n) => {
                          t(rp(rw({}, c), rf({ [r]: e })), n);
                        },
                      }),
                    },
                    i
                  );
                }),
              }),
            }),
          });
        },
        select: ({
          field: e,
          onChange: t,
          label: r,
          labelIcon: n,
          Label: i,
          value: o,
          name: a,
          readOnly: s,
          id: l,
        }) =>
          "select" === e.type && e.options
            ? (0, rX.jsx)(i, {
                label: r || a,
                icon: n || (0, rX.jsx)(uD, { size: 16 }),
                readOnly: s,
                children: (0, rX.jsx)("select", {
                  id: l,
                  title: r || a,
                  className: dA("input"),
                  disabled: s,
                  onChange: (e) => {
                    t(JSON.parse(e.target.value).value);
                  },
                  value: JSON.stringify({ value: o }),
                  children: e.options.map((e) =>
                    (0, rX.jsx)(
                      "option",
                      { label: e.label, value: JSON.stringify({ value: e.value }) },
                      e.label + JSON.stringify(e.value)
                    )
                  ),
                }),
              })
            : null,
        textarea: ({
          field: e,
          onChange: t,
          readOnly: r,
          value: n,
          name: i,
          label: o,
          labelIcon: a,
          Label: s,
          id: l,
        }) =>
          (0, rX.jsx)(s, {
            label: o || i,
            icon: a || (0, rX.jsx)(u6, { size: 16 }),
            readOnly: r,
            children: (0, rX.jsx)("textarea", {
              id: l,
              className: dz("input"),
              autoComplete: "off",
              name: i,
              value: void 0 === n ? "" : n,
              onChange: (e) => t(e.currentTarget.value),
              readOnly: r,
              tabIndex: r ? -1 : void 0,
              rows: 5,
              placeholder: "textarea" === e.type ? e.placeholder : void 0,
            }),
          }),
        radio: ({
          field: e,
          onChange: t,
          readOnly: r,
          value: n,
          name: i,
          id: o,
          label: a,
          labelIcon: s,
          Label: l,
        }) =>
          "radio" === e.type && e.options
            ? (0, rX.jsx)(l, {
                icon: s || (0, rX.jsx)(uT, { size: 16 }),
                label: a || i,
                readOnly: r,
                el: "div",
                children: (0, rX.jsx)("div", {
                  className: dP("radioGroupItems"),
                  id: o,
                  children: e.options.map((e) => {
                    var o;
                    return (0, rX.jsxs)(
                      "label",
                      {
                        className: dP("radio"),
                        children: [
                          (0, rX.jsx)("input", {
                            type: "radio",
                            className: dP("radioInput"),
                            value: JSON.stringify({ value: e.value }),
                            name: i,
                            onChange: (e) => {
                              t(JSON.parse(e.target.value).value);
                            },
                            disabled: r,
                            checked: n === e.value,
                          }),
                          (0, rX.jsx)("div", {
                            className: dP("radioInner"),
                            children: e.label || (null == (o = e.value) ? void 0 : o.toString()),
                          }),
                        ],
                      },
                      e.label + e.value
                    );
                  }),
                }),
              })
            : null,
        text: dw,
        number: dw,
      };
    function dF(e) {
      var t;
      let r = uc((e) => e.dispatch),
        n = uc((e) => e.overrides),
        i = uc((e) => {
          var t;
          return null == (t = e.selectedItem) ? void 0 : t.readOnly;
        }),
        o = (0, rs.useContext)(dg),
        { id: a, Label: s = dR } = e,
        l = e.field,
        u = l.label,
        d = l.labelIcon,
        c = dL(),
        p = a || c,
        h = (0, rs.useMemo)(() => {
          var e, t, r, i, o, a, s, l;
          return rp(
            rw({}, n.fieldTypes),
            rf({
              array: (null == (e = n.fieldTypes) ? void 0 : e.array) || d$.array,
              external: (null == (t = n.fieldTypes) ? void 0 : t.external) || d$.external,
              object: (null == (r = n.fieldTypes) ? void 0 : r.object) || d$.object,
              select: (null == (i = n.fieldTypes) ? void 0 : i.select) || d$.select,
              textarea: (null == (o = n.fieldTypes) ? void 0 : o.textarea) || d$.textarea,
              radio: (null == (a = n.fieldTypes) ? void 0 : a.radio) || d$.radio,
              text: (null == (s = n.fieldTypes) ? void 0 : s.text) || d$.text,
              number: (null == (l = n.fieldTypes) ? void 0 : l.number) || d$.number,
            })
          );
        }, [n]),
        f = (0, rs.useMemo)(
          () => rp(rw({}, e), rf({ field: l, label: u, labelIcon: d, Label: s, id: p })),
          [e, l, u, d, s, p]
        ),
        g = (0, rs.useCallback)(
          (e) => {
            f.name &&
              ("INPUT" === e.target.nodeName || "TEXTAREA" === e.target.nodeName) &&
              (e.stopPropagation(), r({ type: "setUi", ui: { field: { focus: f.name } } }));
          },
          [f.name]
        ),
        m = (0, rs.useCallback)((e) => {
          "name" in e.target && r({ type: "setUi", ui: { field: { focus: null } } });
        }, []),
        v = (0, rs.useMemo)(
          () => ("custom" !== l.type && "slot" !== l.type ? d$[l.type] : (e) => null),
          [l.type]
        ),
        y = (0, rs.useMemo)(
          () =>
            "custom" === l.type
              ? l.render
                ? l.render
                : null
              : "slot" !== l.type
                ? h[l.type]
                : void 0,
          [l.type, h]
        ),
        { visible: b = !0 } = e.field;
      if (!b || "slot" === l.type) return null;
      if (!y) throw Error(`Field type for ${l.type} did not exist.`);
      return (0, rX.jsx)(dg.Provider, {
        value: {
          readOnlyFields: o.readOnlyFields || i || {},
          localName: null != (t = o.localName) ? t : f.name,
        },
        children: (0, rX.jsx)("div", {
          className: dT(),
          onFocus: g,
          onBlur: m,
          onClick: (e) => {
            e.stopPropagation();
          },
          children: (0, rX.jsx)(y, rp(rw({}, f), rf({ children: (0, rX.jsx)(v, rw({}, f)) }))),
        }),
      });
    }
    function dW(e) {
      let t = uc((t) => t.state.ui.field.focus === e.name),
        { value: r, onChange: n } = e,
        [i, o] = (0, rs.useState)(r),
        a = (0, rs.useCallback)(
          (e, t) => {
            (o(e), n(e, t));
          },
          [n]
        );
      return (
        (0, rs.useEffect)(() => {
          t || o(r);
        }, [r]),
        (0, rs.useEffect)(() => {
          t || r === i || o(r);
        }, [t, r, i]),
        (0, rX.jsx)(dF, rw(rw({}, e), { value: i, onChange: a }))
      );
    }
    function dH(e) {
      let t = { x: 0, y: 0 },
        r = e;
      for (; r && r !== document.documentElement; ) {
        let e = r.parentElement;
        (e && ((t.x += e.scrollLeft), (t.y += e.scrollTop)), (r = e));
      }
      return t;
    }
    (rk(), rk(), rk(), rk(), rk(), rk());
    var dU = (0, rs.createContext)(null),
      dZ = (0, rs.createContext)(
        r2(() => ({
          zoneDepthIndex: {},
          nextZoneDepthIndex: {},
          areaDepthIndex: {},
          nextAreaDepthIndex: {},
          draggedItem: null,
          previewIndex: {},
          enabledIndex: {},
          hoveringComponent: null,
        }))
      ),
      dV = ({ children: e, store: t }) => (0, rX.jsx)(dZ.Provider, { value: t, children: e }),
      dq = ({ children: e, value: t }) => {
        let r = uc((e) => e.dispatch),
          n = (0, rs.useCallback)(
            (e) => {
              r({ type: "registerZone", zone: e });
            },
            [r]
          ),
          i = (0, rs.useMemo)(() => rw({ registerZone: n }, t), [t]);
        return (0, rX.jsx)(rX.Fragment, {
          children: i && (0, rX.jsx)(dU.Provider, { value: i, children: e }),
        });
      };
    function dY(e, t) {
      let r = (0, rs.useContext)(e);
      if (!r) throw Error("useContextStore must be used inside context");
      return r5(r, lq(t));
    }
    (rk(), rk(), rk());
    var dK = (e, t = []) => {
        let r = up();
        return (0, rs.useCallback)(() => {
          let t = () => {},
            n = (r) => {
              r
                ? e(!1)
                : (setTimeout(() => {
                    e(!0);
                  }, 0),
                  t && t());
            },
            i = r.getState().state.ui.isDragging;
          return (
            n(i),
            i &&
              (t = r.subscribe(
                (e) => e.state.ui.isDragging,
                (e) => {
                  n(e);
                }
              )),
            t
          );
        }, [r, ...t]);
      },
      dX = lG("DraggableComponent", {
        DraggableComponent: "_DraggableComponent_1vaqy_1",
        "DraggableComponent-overlayWrapper": "_DraggableComponent-overlayWrapper_1vaqy_12",
        "DraggableComponent-overlay": "_DraggableComponent-overlay_1vaqy_12",
        "DraggableComponent-loadingOverlay": "_DraggableComponent-loadingOverlay_1vaqy_34",
        "DraggableComponent--hover": "_DraggableComponent--hover_1vaqy_50",
        "DraggableComponent--isSelected": "_DraggableComponent--isSelected_1vaqy_57",
        "DraggableComponent-actionsOverlay": "_DraggableComponent-actionsOverlay_1vaqy_71",
        "DraggableComponent-actions": "_DraggableComponent-actions_1vaqy_71",
      }),
      dG = ({ label: e, children: t, parentAction: r }) =>
        (0, rX.jsxs)(lQ, {
          children: [
            (0, rX.jsxs)(lQ.Group, { children: [r, e && (0, rX.jsx)(lQ.Label, { label: e })] }),
            (0, rX.jsx)(lQ.Group, { children: t }),
          ],
        }),
      dJ = ({ children: e }) => (0, rX.jsx)(rX.Fragment, { children: e }),
      dQ = ({
        children: e,
        depth: t,
        componentType: r,
        id: n,
        index: i,
        zoneCompound: o,
        isLoading: a = !1,
        isSelected: s = !1,
        debug: l,
        label: u,
        autoDragAxis: d,
        userDragAxis: c,
        inDroppableZone: p = !0,
      }) => {
        let h = uc((e) => {
            var t;
            return (null == (t = e.selectedItem) ? void 0 : t.props.id) === n
              ? e.zoomConfig.zoom
              : 1;
          }),
          f = uc((e) => e.overrides),
          g = uc((e) => e.dispatch),
          m = uc((e) => e.iframe),
          v = (0, rs.useContext)(dU),
          [y, b] = (0, rs.useState)({}),
          w = (0, rs.useCallback)(
            (e, t) => {
              var r;
              (null == (r = null == v ? void 0 : v.registerLocalZone) || r.call(v, e, t),
                b((r) => rp(rw({}, r), rf({ [e]: t }))));
            },
            [b]
          ),
          _ = (0, rs.useCallback)(
            (e) => {
              var t;
              (null == (t = null == v ? void 0 : v.unregisterLocalZone) || t.call(v, e),
                b((t) => {
                  let r = rw({}, t);
                  return (delete r[e], r);
                }));
            },
            [b]
          ),
          j = Object.values(y).filter(Boolean).length > 0,
          k = uc(
            lq((e) => {
              var t;
              return null == (t = e.state.indexes.nodes[n]) ? void 0 : t.path;
            })
          ),
          S = uc(
            lq((e) => {
              let t = l3({ index: i, zone: o }, e.state);
              return e.permissions.getPermissions({ item: t });
            })
          ),
          I = (0, rs.useContext)(dZ),
          [E, O] = (0, rs.useState)(c || d),
          C = (0, rs.useMemo)(() => dp(E), [E]),
          {
            ref: M,
            isDragging: P,
            sortable: A,
          } = lU({
            id: n,
            index: i,
            group: o,
            type: "component",
            data: {
              areaId: null == v ? void 0 : v.areaId,
              zone: o,
              index: i,
              componentType: r,
              containsActiveZone: j,
              depth: t,
              path: k || [],
              inDroppableZone: p,
            },
            collisionPriority: t,
            collisionDetector: C,
            transition: { duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" },
            feedback: "clone",
          });
        (0, rs.useEffect)(() => {
          let e = I.getState().enabledIndex[o];
          ((A.droppable.disabled = !e), (A.draggable.disabled = !S.drag));
          let t = I.subscribe((e) => {
            A.droppable.disabled = !e.enabledIndex[o];
          });
          return z.current && !S.drag
            ? (z.current.setAttribute("data-puck-disabled", ""),
              () => {
                var e;
                (null == (e = z.current) || e.removeAttribute("data-puck-disabled"), t());
              })
            : t;
        }, [S.drag, o]);
        let z = (0, rs.useRef)(null),
          D = (0, rs.useCallback)(
            (e) => {
              (M(e), e && (z.current = e));
            },
            [M]
          ),
          [L, N] = (0, rs.useState)();
        (0, rs.useEffect)(() => {
          var e, t, r;
          N(
            m.enabled
              ? null == (e = z.current)
                ? void 0
                : e.ownerDocument.body
              : null != (r = null == (t = z.current) ? void 0 : t.closest("[data-puck-preview]"))
                ? r
                : document.body
          );
        }, [m.enabled, z.current]);
        let T = (0, rs.useCallback)(() => {
            var e, t, r;
            if (!z.current) return;
            let n = z.current.getBoundingClientRect(),
              i = dH(z.current),
              o = m.enabled
                ? null
                : null == (e = z.current)
                  ? void 0
                  : e.closest("[data-puck-preview]"),
              a = null == o ? void 0 : o.getBoundingClientRect(),
              s = o ? dH(o) : { x: 0, y: 0 },
              l = {
                x: i.x - s.x - (null != (t = null == a ? void 0 : a.left) ? t : 0),
                y: i.y - s.y - (null != (r = null == a ? void 0 : a.top) ? r : 0),
              },
              u = { height: z.current.offsetHeight, width: z.current.offsetWidth },
              d = (function (e) {
                let t = new DOMMatrixReadOnly(),
                  r = e.parentElement;
                for (; r && r !== document.documentElement; ) {
                  let e = getComputedStyle(r).transform;
                  (e && "none" !== e && (t = new DOMMatrixReadOnly(e).multiply(t)),
                    (r = r.parentElement));
                }
                return { scaleX: t.a, scaleY: t.d };
              })(z.current);
            return {
              left: `${(n.left + l.x) / d.scaleX}px`,
              top: `${(n.top + l.y) / d.scaleY}px`,
              height: `${u.height}px`,
              width: `${u.width}px`,
            };
          }, [z.current]),
          [B, R] = (0, rs.useState)(),
          $ = (0, rs.useCallback)(() => {
            R(T());
          }, [z.current, m]);
        (0, rs.useEffect)(() => {
          if (z.current) {
            let e = new ResizeObserver($);
            return (
              e.observe(z.current),
              () => {
                e.disconnect();
              }
            );
          }
        }, [z.current]);
        let F = uc((e) => e.nodes.registerNode),
          W = (0, rs.useCallback)(() => {
            et(!1);
          }, []),
          H = (0, rs.useCallback)(() => {
            et(!0);
          }, []);
        (0, rs.useEffect)(() => {
          var e;
          return (
            F(n, {
              methods: { sync: $, showOverlay: H, hideOverlay: W },
              element: null != (e = z.current) ? e : null,
            }),
            () => {
              F(n, {
                methods: { sync: () => null, hideOverlay: () => null, showOverlay: () => null },
                element: null,
              });
            }
          );
        }, [n, o, i, r, $]);
        let U = (0, rs.useMemo)(() => f.actionBar || dG, [f.actionBar]),
          Z = (0, rs.useMemo)(() => f.componentOverlay || dJ, [f.componentOverlay]),
          V = (0, rs.useCallback)(
            (e) => {
              (e.target.closest("[data-puck-overlay-portal]") || e.stopPropagation(),
                g({ type: "setUi", ui: { itemSelector: { index: i, zone: o } } }));
            },
            [i, o, n]
          ),
          q = up(),
          Y = (0, rs.useCallback)(() => {
            let { nodes: e, zones: t } = q.getState().state.indexes,
              r = e[n],
              i = (null == r ? void 0 : r.parentId) ? e[null == r ? void 0 : r.parentId] : null;
            if (!i || !r.parentId) return;
            let o = `${i.parentId}:${i.zone}`,
              a = t[o].contentIds.indexOf(r.parentId);
            g({ type: "setUi", ui: { itemSelector: { zone: o, index: a } } });
          }, [v, k]),
          K = (0, rs.useCallback)(() => {
            g({ type: "duplicate", sourceIndex: i, sourceZone: o });
          }, [i, o]),
          X = (0, rs.useCallback)(() => {
            g({ type: "remove", index: i, zone: o });
          }, [i, o]),
          [G, J] = (0, rs.useState)(!1),
          Q = dY(dZ, (e) => e.hoveringComponent === n);
        (0, rs.useEffect)(() => {
          if (!z.current) return;
          let e = z.current,
            t = (e) => {
              (I.getState().draggedItem ? (P ? J(!0) : J(!1)) : J(!0), e.stopPropagation());
            },
            r = (e) => {
              (e.stopPropagation(), J(!1));
            };
          return (
            e.setAttribute("data-puck-component", n),
            e.setAttribute("data-puck-dnd", n),
            (e.style.position = "relative"),
            e.addEventListener("click", V),
            e.addEventListener("mouseover", t),
            e.addEventListener("mouseout", r),
            () => {
              (e.removeAttribute("data-puck-component"),
                e.removeAttribute("data-puck-dnd"),
                e.removeEventListener("click", V),
                e.removeEventListener("mouseover", t),
                e.removeEventListener("mouseout", r));
            }
          );
        }, [z.current, V, j, o, n, P, p]);
        let [ee, et] = (0, rs.useState)(!1),
          [er, en] = (0, rs.useState)(!0),
          [ei, eo] = (0, rs.useTransition)();
        (0, rs.useEffect)(() => {
          eo(() => {
            G || Q || s ? ($(), et(!0), es(!1)) : et(!1);
          });
        }, [G, Q, s, m]);
        let [ea, es] = (0, rs.useState)(!1),
          el = dK((e) => {
            e
              ? eo(() => {
                  ($(), en(!0));
                })
              : en(!1);
          });
        ((0, rs.useEffect)(() => {
          P && es(!0);
        }, [P]),
          (0, rs.useEffect)(() => {
            if (ea) return el();
          }, [ea, el]));
        let eu = (0, rs.useCallback)(
          (e) => {
            if (e && e.ownerDocument.defaultView) {
              let t = e.getBoundingClientRect(),
                r = t.x < 0,
                n = t.y;
              (r && ((e.style.transformOrigin = "left top"), (e.style.left = "0px")),
                n < 0 && ((e.style.top = "12px"), r || (e.style.transformOrigin = "right top")));
            }
          },
          [h]
        );
        (0, rs.useEffect)(() => {
          if (c) return void O(c);
          if (z.current) {
            let e = window.getComputedStyle(z.current);
            if ("inline" === e.display || "inline-block" === e.display) return void O("x");
          }
          O(d);
        }, [z, c, d]);
        let ed = (0, rs.useMemo)(
            () =>
              (null == v ? void 0 : v.areaId) &&
              (null == v ? void 0 : v.areaId) !== "root" &&
              (0, rX.jsx)(lQ.Action, {
                onClick: Y,
                label: "Select parent",
                children: (0, rX.jsx)(uR, { size: 16 }),
              }),
            [null == v ? void 0 : v.areaId]
          ),
          ec = (0, rs.useMemo)(
            () =>
              rp(
                rw({}, v),
                rf({
                  areaId: n,
                  zoneCompound: o,
                  index: i,
                  depth: t + 1,
                  registerLocalZone: w,
                  unregisterLocalZone: _,
                })
              ),
            [v, n, o, i, t, w, _]
          );
        return (0, rX.jsxs)(dq, {
          value: ec,
          children: [
            er &&
              ee &&
              (0, sw.createPortal)(
                (0, rX.jsxs)("div", {
                  className: dX({ isSelected: s, isDragging: P, hover: G || Q }),
                  style: rw({}, B),
                  "data-puck-overlay": !0,
                  children: [
                    l,
                    a &&
                      (0, rX.jsx)("div", {
                        className: dX("loadingOverlay"),
                        children: (0, rX.jsx)(u_, {}),
                      }),
                    (0, rX.jsx)("div", {
                      className: dX("actionsOverlay"),
                      style: { top: 52 / h },
                      children: (0, rX.jsx)("div", {
                        className: dX("actions"),
                        style: {
                          transform: `scale(${1 / h}`,
                          top: -44 / h,
                          right: 0,
                          paddingLeft: 8,
                          paddingRight: 8,
                        },
                        ref: eu,
                        children: (0, rX.jsxs)(U, {
                          parentAction: ed,
                          label: u,
                          children: [
                            S.duplicate &&
                              (0, rX.jsx)(lQ.Action, {
                                onClick: K,
                                label: "Duplicate",
                                children: (0, rX.jsx)(uB, { size: 16 }),
                              }),
                            S.delete &&
                              (0, rX.jsx)(lQ.Action, {
                                onClick: X,
                                label: "Delete",
                                children: (0, rX.jsx)(u5, { size: 16 }),
                              }),
                          ],
                        }),
                      }),
                    }),
                    (0, rX.jsx)("div", {
                      className: dX("overlayWrapper"),
                      children: (0, rX.jsx)(Z, {
                        componentId: n,
                        componentType: r,
                        hover: G,
                        isSelected: s,
                        children: (0, rX.jsx)("div", { className: dX("overlay") }),
                      }),
                    }),
                  ],
                }),
                L || document.body
              ),
            e(D),
          ],
        });
      };
    (rk(), rk(), rk());
    var d0 = {
      Drawer: "_Drawer_pl7z0_1",
      "Drawer-draggable": "_Drawer-draggable_pl7z0_8",
      "Drawer-draggableBg": "_Drawer-draggableBg_pl7z0_12",
      "DrawerItem-draggable": "_DrawerItem-draggable_pl7z0_22",
      "DrawerItem--disabled": "_DrawerItem--disabled_pl7z0_35",
      DrawerItem: "_DrawerItem_pl7z0_22",
      "Drawer--isDraggingFrom": "_Drawer--isDraggingFrom_pl7z0_45",
      "DrawerItem-name": "_DrawerItem-name_pl7z0_63",
    };
    (rk(), rk(), rk(), rk());
    var d1 = () => {
      if ("u" < typeof window) return;
      let e = document.querySelector("#preview-frame");
      return (null == e ? void 0 : e.tagName) === "IFRAME"
        ? e.contentDocument || document
        : (null == e ? void 0 : e.ownerDocument) || document;
    };
    rk();
    var d2 = class {
      constructor(e, t) {
        var r;
        ((this.scaleFactor = 1),
          (this.frameEl = null),
          (this.frameRect = null),
          (this.target = e),
          (this.original = t),
          (this.frameEl = document.querySelector("iframe#preview-frame")),
          this.frameEl &&
            ((this.frameRect = this.frameEl.getBoundingClientRect()),
            (this.scaleFactor =
              this.frameRect.width /
              ((null == (r = this.frameEl.contentWindow) ? void 0 : r.innerWidth) || 1))));
      }
      get x() {
        return this.original.x;
      }
      get y() {
        return this.original.y;
      }
      get global() {
        return document !== this.target.ownerDocument && this.frameRect
          ? {
              x: this.x * this.scaleFactor + this.frameRect.left,
              y: this.y * this.scaleFactor + this.frameRect.top,
            }
          : this.original;
      }
      get frame() {
        return document === this.target.ownerDocument && this.frameRect
          ? {
              x: (this.x - this.frameRect.left) / this.scaleFactor,
              y: (this.y - this.frameRect.top) / this.scaleFactor,
            }
          : this.original;
      }
    };
    rk();
    var d4 = "u" > typeof PointerEvent ? PointerEvent : Event,
      d5 = class extends d4 {
        constructor(e, t) {
          (super(e, t), (this._originalTarget = null), (this.originalTarget = t.originalTarget));
        }
        set originalTarget(e) {
          this._originalTarget = e;
        }
        get originalTarget() {
          return this._originalTarget;
        }
      };
    (rk(), rk());
    var d6 = (0, rs.createContext)({ dragListeners: {} }),
      d3 = ({ children: e, disableAutoScroll: t }) => {
        let r,
          n = uc((e) => e.dispatch),
          i = up(),
          o = dL(),
          a = (0, rs.useRef)(null),
          s =
            ((r = (0, rs.useRef)(null)),
            (0, rs.useCallback)((e) => {
              dd.setState({ fallbackEnabled: !1 });
              let t = l2();
              ((r.current = t),
                setTimeout(() => {
                  r.current === t &&
                    (dd.setState({ fallbackEnabled: !0 }), e.collisionObserver.forceUpdate(!0));
                }, 100));
            }, [])),
          [l] = (0, rs.useState)(() =>
            r2(() => ({
              zoneDepthIndex: {},
              nextZoneDepthIndex: {},
              areaDepthIndex: {},
              nextAreaDepthIndex: {},
              draggedItem: null,
              previewIndex: {},
              enabledIndex: {},
              hoveringComponent: null,
            }))
          ),
          u = (0, rs.useCallback)(
            (e, t) => {
              let { zoneDepthIndex: r = {}, areaDepthIndex: n = {} } = l.getState() || {},
                i = Object.keys(r).length > 0,
                o = Object.keys(n).length > 0,
                a = !1,
                s = !1;
              return (
                e.zone && !r[e.zone] ? (a = !0) : !e.zone && i && (a = !0),
                e.area && !n[e.area] ? (s = !0) : !e.area && o && (s = !0),
                { zoneChanged: a, areaChanged: s }
              );
            },
            [l]
          ),
          d = (0, rs.useCallback)(
            (e, t) => {
              let { zoneChanged: r, areaChanged: n } = u(e, o);
              (r || n) &&
                (l.setState({
                  zoneDepthIndex: e.zone ? { [e.zone]: !0 } : {},
                  areaDepthIndex: e.area ? { [e.area]: !0 } : {},
                }),
                s(t),
                setTimeout(() => {
                  t.collisionObserver.forceUpdate(!0);
                }, 50),
                (a.current = null));
            },
            [l]
          ),
          c = (function (e, t, r) {
            var n = this,
              i = (0, rs.useRef)(null),
              o = (0, rs.useRef)(0),
              a = (0, rs.useRef)(null),
              s = (0, rs.useRef)([]),
              l = (0, rs.useRef)(),
              u = (0, rs.useRef)(),
              d = (0, rs.useRef)(e),
              c = (0, rs.useRef)(!0);
            (0, rs.useEffect)(
              function () {
                d.current = e;
              },
              [e]
            );
            var p = !t && 0 !== t && "u" > typeof window;
            if ("function" != typeof e) throw TypeError("Expected a function");
            t = +t || 0;
            var h = !!(r = r || {}).leading,
              f = !("trailing" in r) || !!r.trailing,
              g = "maxWait" in r,
              m = g ? Math.max(+r.maxWait || 0, t) : null;
            return (
              (0, rs.useEffect)(function () {
                return (
                  (c.current = !0),
                  function () {
                    c.current = !1;
                  }
                );
              }, []),
              (0, rs.useMemo)(
                function () {
                  var e = function (e) {
                      var t = s.current,
                        r = l.current;
                      return (
                        (s.current = l.current = null),
                        (o.current = e),
                        (u.current = d.current.apply(r, t))
                      );
                    },
                    r = function (e, t) {
                      (p && cancelAnimationFrame(a.current),
                        (a.current = p ? requestAnimationFrame(e) : setTimeout(e, t)));
                    },
                    v = function (e) {
                      if (!c.current) return !1;
                      var r = e - i.current;
                      return !i.current || r >= t || r < 0 || (g && e - o.current >= m);
                    },
                    y = function (t) {
                      return (
                        (a.current = null),
                        f && s.current ? e(t) : ((s.current = l.current = null), u.current)
                      );
                    },
                    b = function e() {
                      var n = Date.now();
                      if (v(n)) return y(n);
                      if (c.current) {
                        var a = t - (n - i.current);
                        r(e, g ? Math.min(a, m - (n - o.current)) : a);
                      }
                    },
                    w = function () {
                      var d = Date.now(),
                        p = v(d);
                      if (
                        ((s.current = [].slice.call(arguments)),
                        (l.current = n),
                        (i.current = d),
                        p)
                      ) {
                        if (!a.current && c.current)
                          return ((o.current = i.current), r(b, t), h ? e(i.current) : u.current);
                        if (g) return (r(b, t), e(i.current));
                      }
                      return (a.current || r(b, t), u.current);
                    };
                  return (
                    (w.cancel = function () {
                      (a.current && (p ? cancelAnimationFrame(a.current) : clearTimeout(a.current)),
                        (o.current = 0),
                        (s.current = i.current = l.current = a.current = null));
                    }),
                    (w.isPending = function () {
                      return !!a.current;
                    }),
                    (w.flush = function () {
                      return a.current ? y(Date.now()) : u.current;
                    }),
                    w
                  );
                },
                [h, g, t, m, f, p]
              )
            );
          })(d, 100),
          p = () => {
            (c.cancel(), (a.current = null));
          };
        (0, rs.useEffect)(() => {}, []);
        let [h] = (0, rs.useState)(() => [
            ...(t ? sm.filter((e) => e !== sr) : sm),
            (({ onChange: e }, t) =>
              class extends iG {
                constructor(r, n) {
                  if ((super(r), "u" < typeof window)) return;
                  this.registerEffect(() => {
                    var n;
                    let i,
                      o,
                      a =
                        ((n = (n) => {
                          let i = new d2((n instanceof d5 && n.originalTarget) || n.target, {
                            x: n.clientX,
                            y: n.clientY,
                          });
                          document
                            .elementsFromPoint(i.global.x, i.global.y)
                            .some((e) => e.id === t) &&
                            e(
                              ((e, t) => {
                                var r;
                                let n = ((e, t) => {
                                  let r = [],
                                    n = e.target.ownerDocument.elementsFromPoint(e.x, e.y),
                                    i = n.find((e) => e.getAttribute("data-puck-preview")),
                                    o = n.find((e) => e.getAttribute("data-puck-drawer"));
                                  if ((o && (n = [o]), i)) {
                                    let t = d1();
                                    t && (n = t.elementsFromPoint(e.frame.x, e.frame.y));
                                  }
                                  if (n)
                                    for (let i = 0; i < n.length; i++) {
                                      let o = n[i],
                                        a = o.getAttribute("data-puck-dropzone"),
                                        s = o.getAttribute("data-puck-dnd"),
                                        l = o.hasAttribute("data-puck-dnd-void");
                                      if ((a || s) && !l) {
                                        let t = o.getBoundingClientRect(),
                                          r = {
                                            left: t.left + 6,
                                            right: t.right - 6,
                                            top: t.top + 6,
                                            bottom: t.bottom - 6,
                                          };
                                        if (
                                          e.frame.x < r.left ||
                                          e.frame.x > r.right ||
                                          e.frame.y > r.bottom ||
                                          e.frame.y < r.top
                                        )
                                          continue;
                                      }
                                      if (a) {
                                        let e = t.registry.droppables.get(a);
                                        e && r.push(e);
                                      }
                                      if (s) {
                                        let e = t.registry.droppables.get(s);
                                        e && r.push(e);
                                      }
                                    }
                                  return r;
                                })(e, t);
                                if (n.length > 0) {
                                  let e = n.sort((e, t) => {
                                      let r = e.data,
                                        n = t.data;
                                      return r.depth > n.depth ? 1 : n.depth > r.depth ? -1 : 0;
                                    }),
                                    i = t.dragOperation.source,
                                    o = e.findIndex((e) => e.id === (null == i ? void 0 : i.id)),
                                    a = null == i ? void 0 : i.id,
                                    s = [...e];
                                  (a && o > -1 && s.splice(o, 1),
                                    (s = s.filter((e) => {
                                      let t = e.data;
                                      if (a && o > -1 && t.path.indexOf(a) > -1) return !1;
                                      if ("dropzone" === e.type) {
                                        let t = e.data;
                                        if (!t.isDroppableTarget || t.areaId === a) return !1;
                                      } else if ("component" === e.type && !e.data.inDroppableZone)
                                        return !1;
                                      return !0;
                                    })).reverse());
                                  let l = s[0];
                                  if (!l) return { zone: null, area: null };
                                  let u = l.data,
                                    d = "containsActiveZone" in u;
                                  return {
                                    zone: ((e) => {
                                      let t = null == e ? void 0 : e.id;
                                      if (!e) return null;
                                      if ("component" === e.type) {
                                        let r = e.data;
                                        t = r.containsActiveZone ? null : r.zone;
                                      } else if ("void" === e.type) return "void";
                                      return t;
                                    })(l),
                                    area:
                                      d && u.containsActiveZone
                                        ? s[0].id
                                        : null == (r = s[0])
                                          ? void 0
                                          : r.data.areaId,
                                  };
                                }
                                return { zone: rN, area: rD };
                              })(i, r),
                              r
                            );
                        }),
                        (o = 0),
                        function (...e) {
                          let t = performance.now(),
                            r = this;
                          if (t - o >= 50) (n.apply(r, e), (o = t));
                          else {
                            let a;
                            (null == i || i(),
                              (a = setTimeout(
                                () => {
                                  (n.apply(r, e), (o = performance.now()));
                                },
                                50 - (t - o)
                              )),
                              (i = () => clearTimeout(a)));
                          }
                        }),
                      s = (e) => {
                        a(e);
                      };
                    return (
                      document.body.addEventListener("pointermove", s, { capture: !0 }),
                      () => {
                        document.body.removeEventListener("pointermove", s, { capture: !0 });
                      }
                    );
                  });
                }
              })(
              {
                onChange: (e, t) => {
                  let r = l.getState(),
                    { zoneChanged: n, areaChanged: i } = u(e, o),
                    s = t.dragOperation.status.dragging;
                  if (i || n) {
                    let t = {},
                      r = {};
                    (e.zone && (t = { [e.zone]: !0 }),
                      e.area && (r = { [e.area]: !0 }),
                      l.setState({ nextZoneDepthIndex: t, nextAreaDepthIndex: r }));
                  }
                  if ("void" !== e.zone && (null == r ? void 0 : r.zoneDepthIndex.void))
                    return void d(e, t);
                  if (i) {
                    if (s) {
                      let r = a.current;
                      (r && r.area === e.area && r.zone === e.zone) ||
                        (p(), c(e, t), (a.current = e));
                    } else (p(), d(e, t));
                    return;
                  }
                  (n && d(e, t), p());
                },
              },
              o
            ),
          ]),
          f = dn(),
          [g, m] = (0, rs.useState)({}),
          v = (0, rs.useRef)(null),
          y = (0, rs.useRef)(void 0),
          b = (0, rs.useMemo)(() => ({ mode: "edit", areaId: "root", depth: 0 }), []);
        return (0, rX.jsx)("div", {
          id: o,
          children: (0, rX.jsx)(d6.Provider, {
            value: { dragListeners: g, setDragListeners: m },
            children: (0, rX.jsx)(sF, {
              plugins: h,
              sensors: f,
              onDragEnd: (e, t) => {
                var r, o;
                let a,
                  s = null == (r = d1()) ? void 0 : r.querySelector("[data-puck-entry]");
                null == s || s.removeAttribute("data-puck-dragging");
                let { source: u, target: d } = e.operation;
                if (!u) return void l.setState({ draggedItem: null });
                let { zone: c, index: p } = u.data,
                  { previewIndex: h = {} } = l.getState() || {},
                  f = (null == (o = h[c]) ? void 0 : o.props.id) === u.id ? h[c] : null;
                a = n_(() => {
                  "idle" === u.status &&
                    ((() => {
                      var r, o;
                      if (
                        (l.setState({ draggedItem: null }),
                        e.canceled || (null == d ? void 0 : d.type) === "void")
                      ) {
                        (l.setState({ previewIndex: {} }),
                          null == (r = g.dragend) ||
                            r.forEach((r) => {
                              r(e, t);
                            }),
                          n({ type: "setUi", ui: { itemSelector: null, isDragging: !1 } }));
                        return;
                      }
                      if (f)
                        if ((l.setState({ previewIndex: {} }), "insert" === f.type)) {
                          let e, t, r, n;
                          ((e = f.componentType),
                            (t = f.zone),
                            (r = f.index),
                            (n = i.getState()),
                            rj(void 0, null, function* () {
                              let i = l2(e),
                                o = {
                                  type: "insert",
                                  componentType: e,
                                  destinationIndex: r,
                                  destinationZone: t,
                                  id: i,
                                },
                                { state: a, dispatch: s, resolveComponentData: l } = n,
                                u = l6(a, o, n);
                              s(rp(rw({}, o), rf({ recordHistory: !0 })));
                              let d = { index: r, zone: t };
                              s({ type: "setUi", ui: { itemSelector: d } });
                              let c = l3(d, u);
                              if (c) {
                                let e = yield l(c, "insert");
                                e.didChange &&
                                  s({
                                    type: "replace",
                                    destinationZone: d.zone,
                                    destinationIndex: d.index,
                                    data: e.node,
                                  });
                              }
                            }));
                        } else
                          y.current &&
                            n({
                              type: "move",
                              sourceIndex: y.current.index,
                              sourceZone: y.current.zone,
                              destinationIndex: f.index,
                              destinationZone: f.zone,
                              recordHistory: !1,
                            });
                      (n({
                        type: "setUi",
                        ui: { itemSelector: { index: p, zone: c }, isDragging: !1 },
                        recordHistory: !0,
                      }),
                        null == (o = g.dragend) ||
                          o.forEach((r) => {
                            r(e, t);
                          }));
                    })(),
                    null == a || a());
                });
              },
              onDragOver: (e, t) => {
                var r, n, o, a, s;
                if ((e.preventDefault(), !(null == (r = l.getState()) ? void 0 : r.draggedItem)))
                  return;
                p();
                let { source: u, target: d } = e.operation;
                if (!d || !u || "void" === d.type) return;
                let [c] = u.id.split(":"),
                  [h] = d.id.split(":"),
                  f = u.data,
                  m = f.zone,
                  b = f.index,
                  w = "",
                  _ = 0;
                if ("component" === d.type) {
                  let e = d.data;
                  ((w = e.zone), (_ = e.index));
                  let r = null == (n = t.collisionObserver.collisions[0]) ? void 0 : n.data,
                    i = (s = d.element)
                      ? (function e(t) {
                          return t ? t.getAttribute("dir") || e(t.parentElement) : "ltr";
                        })(s)
                      : "ltr";
                  (_ >= b && m === w && (_ -= 1),
                    "after" ==
                      ((null == r ? void 0 : r.direction) === "up" ||
                      ("ltr" === i && (null == r ? void 0 : r.direction) === "left") ||
                      ("rtl" === i && (null == r ? void 0 : r.direction) === "right")
                        ? "before"
                        : "after") && (_ += 1));
                } else ((w = d.id.toString()), (_ = 0));
                let j =
                  (null == (o = i.getState().state.indexes.nodes[d.id]) ? void 0 : o.path) || [];
                if (
                  !(
                    h === c ||
                    j.find((e) => {
                      let [t] = e.split(":");
                      return t === c;
                    })
                  )
                ) {
                  if ("new" === v.current)
                    l.setState({
                      previewIndex: {
                        [w]: {
                          componentType: f.componentType,
                          type: "insert",
                          index: _,
                          zone: w,
                          element: u.element,
                          props: { id: u.id.toString() },
                        },
                      },
                    });
                  else {
                    y.current || (y.current = { zone: f.zone, index: f.index });
                    let e = l3(y.current, i.getState().state);
                    e &&
                      l.setState({
                        previewIndex: {
                          [w]: {
                            componentType: f.componentType,
                            type: "move",
                            index: _,
                            zone: w,
                            props: e.props,
                            element: u.element,
                          },
                        },
                      });
                  }
                  null == (a = g.dragover) ||
                    a.forEach((r) => {
                      r(e, t);
                    });
                }
              },
              onDragStart: (e, t) => {
                var r;
                let { source: n } = e.operation;
                if (n && "void" !== n.type) {
                  let e = n.data,
                    t = l3({ zone: e.zone, index: e.index }, i.getState().state);
                  t &&
                    l.setState({
                      previewIndex: {
                        [e.zone]: {
                          componentType: e.componentType,
                          type: "move",
                          index: e.index,
                          zone: e.zone,
                          props: t.props,
                          element: n.element,
                        },
                      },
                    });
                }
                null == (r = g.dragstart) ||
                  r.forEach((r) => {
                    r(e, t);
                  });
              },
              onBeforeDragStart: (e) => {
                var t, r, o, a;
                ((v.current =
                  (null == (t = e.operation.source) ? void 0 : t.type) === "drawer"
                    ? "new"
                    : "existing"),
                  (y.current = void 0),
                  l.setState({ draggedItem: e.operation.source }),
                  (null == (r = i.getState().selectedItem) ? void 0 : r.props.id) !==
                  (null == (o = e.operation.source) ? void 0 : o.id)
                    ? n({
                        type: "setUi",
                        ui: { itemSelector: null, isDragging: !0 },
                        recordHistory: !1,
                      })
                    : n({ type: "setUi", ui: { isDragging: !0 }, recordHistory: !1 }));
                let s = null == (a = d1()) ? void 0 : a.querySelector("[data-puck-entry]");
                null == s || s.setAttribute("data-puck-dragging", "true");
              },
              children: (0, rX.jsx)(dV, {
                store: l,
                children: (0, rX.jsx)(dq, { value: b, children: e }),
              }),
            }),
          }),
        });
      },
      d8 = ({ children: e, disableAutoScroll: t }) =>
        "LOADING" === uc((e) => e.status)
          ? e
          : (0, rX.jsx)(d3, { disableAutoScroll: t, children: e }),
      d7 = lG("Drawer", d0),
      d9 = lG("DrawerItem", d0),
      ce = ({ children: e, name: t, label: r, dragRef: n, isDragDisabled: i }) => {
        let o = (0, rs.useMemo)(
          () =>
            e ||
            (({ children: e }) => (0, rX.jsx)("div", { className: d9("default"), children: e })),
          [e]
        );
        return (0, rX.jsx)("div", {
          className: d9({ disabled: i }),
          ref: n,
          onMouseDown: (e) => e.preventDefault(),
          "data-testid": n ? `drawer-item:${t}` : "",
          "data-puck-drawer-item": !0,
          children: (0, rX.jsx)(o, {
            name: t,
            children: (0, rX.jsx)("div", {
              className: d9("draggableWrapper"),
              children: (0, rX.jsxs)("div", {
                className: d9("draggable"),
                children: [
                  (0, rX.jsx)("div", { className: d9("name"), children: null != r ? r : t }),
                  (0, rX.jsx)("div", { className: d9("icon"), children: (0, rX.jsx)(de, {}) }),
                ],
              }),
            }),
          }),
        });
      },
      ct = ({ children: e, name: t, label: r, id: n, isDragDisabled: i }) => {
        let { ref: o } = (function (e) {
          let { disabled: t, data: r, element: n, handle: i, id: o, modifiers: a, sensors: s } = e,
            l = sH(
              (t) => new sb(sM(sN({}, e), sP({ register: !1, handle: s_(i), element: s_(n) })), t)
            ),
            u = sk(l, sU);
          return (
            sE(o, () => (l.id = o)),
            sO(i, (e) => (l.handle = e)),
            sO(n, (e) => (l.element = e)),
            sE(r, () => r && (l.data = r)),
            sE(t, () => (l.disabled = !0 === t)),
            sE(s, () => (l.sensors = s)),
            sE(a, () => (l.modifiers = a), void 0, nq),
            sE(e.feedback, () => {
              var t;
              return (l.feedback = null != (t = e.feedback) ? t : "default");
            }),
            sE(e.alignment, () => (l.alignment = e.alignment)),
            {
              draggable: u,
              get isDragging() {
                return u.isDragging;
              },
              get isDropping() {
                return u.isDropping;
              },
              get isDragSource() {
                return u.isDragSource;
              },
              handleRef: (0, rs.useCallback)(
                (e) => {
                  l.handle = null != e ? e : void 0;
                },
                [l]
              ),
              ref: (0, rs.useCallback)(
                (e) => {
                  var t, r;
                  (e ||
                    null == (t = l.element) ||
                    !t.isConnected ||
                    (null == (r = l.manager) ? void 0 : r.dragOperation.status.idle)) &&
                    (l.element = null != e ? e : void 0);
                },
                [l]
              ),
            }
          );
        })({ id: n, data: { componentType: t }, disabled: i, type: "drawer" });
        return (0, rX.jsxs)("div", {
          className: d7("draggable"),
          children: [
            (0, rX.jsx)("div", {
              className: d7("draggableBg"),
              children: (0, rX.jsx)(ce, { name: t, label: r, children: e }),
            }),
            (0, rX.jsx)("div", {
              className: d7("draggableFg"),
              children: (0, rX.jsx)(ce, {
                name: t,
                label: r,
                dragRef: o,
                isDragDisabled: i,
                children: e,
              }),
            }),
          ],
        });
      },
      cr = ({ children: e, droppableId: t, direction: r }) => {
        (t &&
          console.error(
            "Warning: The `droppableId` prop on Drawer is deprecated and no longer required."
          ),
          r &&
            console.error(
              "Warning: The `direction` prop on Drawer is deprecated and no longer required to achieve multi-directional dragging."
            ));
        let n = dL(),
          { ref: i } = s6({ id: n, type: "void", collisionPriority: 0 });
        return (0, rX.jsx)("div", {
          className: d7(),
          ref: i,
          "data-puck-dnd": n,
          "data-puck-drawer": !0,
          "data-puck-dnd-void": !0,
          children: e,
        });
      };
    ((cr.Item = ({ name: e, children: t, id: r, label: n, index: i, isDragDisabled: o }) => {
      let a = r || e,
        [s, l] = (0, rs.useState)(l2(a));
      return (
        void 0 !== i &&
          console.error(
            "Warning: The `index` prop on Drawer.Item is deprecated and no longer required."
          ),
        !(function (e, t, r = []) {
          let { setDragListeners: n } = (0, rs.useContext)(d6);
          (0, rs.useEffect)(() => {
            n && n((r) => rp(rw({}, r), rf({ [e]: [...(r[e] || []), t] })));
          }, r);
        })(
          "dragend",
          () => {
            l(l2(a));
          },
          [a]
        ),
        (0, rX.jsx)(
          "div",
          {
            children: (0, rX.jsx)(ct, { name: e, label: n, id: s, isDragDisabled: o, children: t }),
          },
          s
        )
      );
    }),
      rk());
    var cn = (e, t) => e.getState().state.indexes.zones[t].contentIds.length;
    (rk(), rk(), rk(), rk(), rk());
    var ci = ({ componentId: e, zone: t }) => {
      let r = uc((e) => e.config),
        n = uc((e) => e.metadata),
        i = uc(
          lq((r) => {
            var n, i;
            let o = r.state.indexes;
            return (
              null != (i = null == (n = o.zones[`${e}:${t}`]) ? void 0 : n.contentIds) ? i : []
            ).map((e) => o.nodes[e].flatData);
          })
        );
      return (0, rX.jsx)(rq, { content: i, zone: t, config: r, metadata: n });
    };
    (rk(), rk(), rk(), rk(), rk(), rk());
    var co = (e, t) => {
        let r = e.indexes.nodes[t];
        if (!r) return;
        let n = `${r.parentId}:${r.zone}`,
          i = e.indexes.zones[n].contentIds.indexOf(t);
        return { zone: n, index: i };
      },
      ca = lG("InlineTextField", { InlineTextField: "_InlineTextField_1xph6_1" }),
      cs = (0, rs.memo)(
        ({ propPath: e, componentId: t, value: r, isReadOnly: n, opts: i = {} }) => {
          var o;
          let a = (0, rs.useRef)(null),
            s = up(),
            l = null != (o = i.disableLineBreaks) && o;
          (0, rs.useEffect)(() => {
            let n = s.getState(),
              i = n.state.indexes.nodes[t].data;
            if (!n.getComponentConfig(i.type))
              throw Error(`InlineTextField Error: No config defined for ${i.type}`);
            if (a.current) {
              r !== a.current.innerText && a.current.replaceChildren(r);
              let n = ((e, t = {}) => {
                  if (!e) return;
                  let { disableDrag: r = !1, disableDragOnFocus: n = !0 } = t,
                    i = (e) => {
                      e.stopPropagation();
                    };
                  e.addEventListener("mouseover", i, { capture: !0 });
                  let o = () => {
                    setTimeout(() => {
                      e.addEventListener("pointerdown", i, { capture: !0 });
                    }, 200);
                  };
                  return (
                    n
                      ? (e.addEventListener("focus", o, { capture: !0 }),
                        e.addEventListener(
                          "blur",
                          () => {
                            e.removeEventListener("pointerdown", i, { capture: !0 });
                          },
                          { capture: !0 }
                        ))
                      : r && e.addEventListener("pointerdown", i, { capture: !0 }),
                    e.setAttribute("data-puck-overlay-portal", "true"),
                    () => {
                      (e.removeEventListener("mouseover", i, { capture: !0 }),
                        n
                          ? (e.removeEventListener("focus", o, { capture: !0 }),
                            e.removeEventListener("blur", o, { capture: !0 }))
                          : r && e.removeEventListener("pointerdown", i, { capture: !0 }),
                        e.removeAttribute("data-puck-overlay-portal"));
                    }
                  );
                })(a.current),
                i = (r) =>
                  rj(void 0, null, function* () {
                    var n;
                    let i = s.getState(),
                      o = i.state.indexes.nodes[t],
                      a = `${o.parentId}:${o.zone}`,
                      u = null == (n = i.state.indexes.zones[a]) ? void 0 : n.contentIds.indexOf(t),
                      d = r.target.innerText;
                    l && (d = d.replaceAll(/\n/gm, ""));
                    let c = (function (e, t, r) {
                        let n = t.split("."),
                          i = rw({}, e),
                          o = i;
                        for (let e = 0; e < n.length; e++) {
                          let [t, i] = n[e].replace("]", "").split("["),
                            a = e === n.length - 1;
                          if (void 0 !== i) {
                            Array.isArray(o[t]) || (o[t] = []);
                            let e = Number(i);
                            if (a) {
                              o[t][e] = r;
                              continue;
                            }
                            (void 0 === o[t][e] && (o[t][e] = {}), (o = o[t][e]));
                            continue;
                          }
                          if (a) {
                            o[t] = r;
                            continue;
                          }
                          (void 0 === o[t] && (o[t] = {}), (o = o[t]));
                        }
                        return rw(rw({}, e), i);
                      })(o.data.props, e, d),
                      p = yield i.resolveComponentData(
                        rp(rw({}, o.data), rf({ props: c })),
                        "replace"
                      );
                    i.dispatch({
                      type: "replace",
                      data: p.node,
                      destinationIndex: u,
                      destinationZone: a,
                    });
                  });
              return (
                a.current.addEventListener("input", i),
                () => {
                  var e;
                  (null == (e = a.current) || e.removeEventListener("input", i), null == n || n());
                }
              );
            }
          }, [s, a.current, r, l]);
          let [u, d] = (0, rs.useState)(!1),
            [c, p] = (0, rs.useState)(!1);
          return (0, rX.jsx)("span", {
            className: ca(),
            ref: a,
            contentEditable: u || c ? "plaintext-only" : "false",
            onClick: (e) => {
              (e.preventDefault(), e.stopPropagation());
            },
            onClickCapture: (e) => {
              (e.preventDefault(), e.stopPropagation());
              let r = co(s.getState().state, t);
              s.getState().setUi({ itemSelector: r });
            },
            onKeyDown: (e) => {
              (e.stopPropagation(), ((l && "Enter" === e.key) || n) && e.preventDefault());
            },
            onKeyUp: (e) => {
              (e.stopPropagation(), e.preventDefault());
            },
            onMouseOverCapture: () => d(!0),
            onMouseOutCapture: () => d(!1),
            onFocus: () => p(!0),
            onBlur: () => p(!1),
          });
        }
      ),
      cl = lG("DropZone", {
        DropZone: "_DropZone_1i2sv_1",
        "DropZone--hasChildren": "_DropZone--hasChildren_1i2sv_11",
        "DropZone--isAreaSelected": "_DropZone--isAreaSelected_1i2sv_24",
        "DropZone--hoveringOverArea": "_DropZone--hoveringOverArea_1i2sv_25",
        "DropZone--isRootZone": "_DropZone--isRootZone_1i2sv_25",
        "DropZone--isDestination": "_DropZone--isDestination_1i2sv_35",
        "DropZone-item": "_DropZone-item_1i2sv_47",
        "DropZone-hitbox": "_DropZone-hitbox_1i2sv_51",
        "DropZone--isEnabled": "_DropZone--isEnabled_1i2sv_59",
        "DropZone--isAnimating": "_DropZone--isAnimating_1i2sv_68",
      }),
      cu = (e) => (0, rX.jsx)(cc, rw({}, e)),
      cd = (0, rs.memo)(
        ({
          zoneCompound: e,
          componentId: t,
          index: r,
          dragAxis: n,
          collisionAxis: i,
          inDroppableZone: o,
        }) => {
          var a, s;
          let l = uc((e) => e.metadata),
            u = (0, rs.useContext)(dU),
            { depth: d = 1 } = null != u ? u : {},
            c = (0, rs.useContext)(dZ),
            p = uc(
              lq((e) => {
                var r;
                return null == (r = e.state.indexes.nodes[t]) ? void 0 : r.flatData.props;
              })
            ),
            h = uc((e) => {
              var r;
              return null == (r = e.state.indexes.nodes[t]) ? void 0 : r.data.type;
            }),
            f = uc(
              lq((e) => {
                var r;
                return null == (r = e.state.indexes.nodes[t]) ? void 0 : r.data.readOnly;
              })
            ),
            g = up(),
            m = (0, rs.useMemo)(() => {
              if (p) {
                var r;
                let e;
                return (
                  (e = rB((r = { type: h, props: p }).props)),
                  rp(rw({}, r), rf({ props: e }))
                );
              }
              let n = c.getState().previewIndex[e];
              return t === (null == n ? void 0 : n.props.id)
                ? { type: n.componentType, props: n.props, previewType: n.type, element: n.element }
                : null;
            }, [g, t, e, h, p]),
            v = uc((e) => ((null == m ? void 0 : m.type) ? e.config.components[m.type] : null)),
            y = (0, rs.useMemo)(
              () => ({
                renderDropZone: cu,
                isEditing: !0,
                dragRef: null,
                metadata: rw(rw({}, l), null == v ? void 0 : v.metadata),
              }),
              [l, null == v ? void 0 : v.metadata]
            ),
            b = uc((e) => e.overrides),
            w = uc((e) => {
              var r;
              return (null == (r = e.componentState[t]) ? void 0 : r.loadingCount) > 0;
            }),
            _ = uc((e) => {
              var r;
              return (null == (r = e.selectedItem) ? void 0 : r.props.id) === t;
            }),
            j =
              null !=
              (s =
                null != (a = null == v ? void 0 : v.label)
                  ? a
                  : null == m
                    ? void 0
                    : m.type.toString())
                ? s
                : "Component",
            k = (0, rs.useMemo)(
              () =>
                function () {
                  var e;
                  return m && "element" in m && m.element
                    ? (0, rX.jsx)("div", {
                        dangerouslySetInnerHTML: { __html: m.element.outerHTML },
                      })
                    : (0, rX.jsx)(ce, {
                        name: j,
                        children: null != (e = b.componentItem) ? e : b.drawerItem,
                      });
                },
              [t, j, b]
            ),
            S = (0, rs.useMemo)(
              () =>
                rp(
                  rw(rw({}, null == v ? void 0 : v.defaultProps), null == m ? void 0 : m.props),
                  rf({ puck: y, editMode: !0 })
                ),
              [null == v ? void 0 : v.defaultProps, null == m ? void 0 : m.props, y]
            ),
            I = (0, rs.useMemo)(() => {
              var e;
              return { type: null != (e = null == m ? void 0 : m.type) ? e : h, props: S };
            }, [null == m ? void 0 : m.type, h, S]),
            E = uc((e) => e.config),
            O = uc((e) => e.plugins),
            C = uc((e) => e.fieldTransforms),
            M = rU(
              E,
              I,
              (0, rs.useMemo)(
                () =>
                  rw(
                    rw(
                      rw(
                        rw(
                          {},
                          rZ(cu, (e) => (0, rX.jsx)(ci, { componentId: t, zone: e.zone }))
                        ),
                        {
                          text: ({
                            value: e,
                            componentId: t,
                            field: r,
                            propPath: n,
                            isReadOnly: i,
                          }) =>
                            r.contentEditable
                              ? (0, rX.jsx)(cs, {
                                  propPath: n,
                                  componentId: t,
                                  value: e,
                                  opts: { disableLineBreaks: !0 },
                                  isReadOnly: i,
                                })
                              : e,
                          textarea: ({
                            value: e,
                            componentId: t,
                            field: r,
                            propPath: n,
                            isReadOnly: i,
                          }) =>
                            r.contentEditable
                              ? (0, rX.jsx)(cs, {
                                  propPath: n,
                                  componentId: t,
                                  value: e,
                                  isReadOnly: i,
                                })
                              : e,
                          custom: ({
                            value: e,
                            componentId: t,
                            field: r,
                            propPath: n,
                            isReadOnly: i,
                          }) =>
                            r.contentEditable && "string" == typeof e
                              ? (0, rX.jsx)(cs, {
                                  propPath: n,
                                  componentId: t,
                                  value: e,
                                  isReadOnly: i,
                                })
                              : e,
                        }
                      ),
                      O.reduce((e, t) => rw(rw({}, e), t.fieldTransforms), {})
                    ),
                    C
                  ),
                [O, C]
              ),
              f,
              w
            );
          if (!m) return;
          let P = v
              ? v.render
              : () =>
                  (0, rX.jsxs)("div", {
                    style: { padding: 48, textAlign: "center" },
                    children: ["No configuration for ", m.type],
                  }),
            A = m.type,
            z = "previewType" in m && "insert" === m.previewType;
          return (
            z && (P = k),
            (0, rX.jsx)(dQ, {
              id: t,
              componentType: A,
              zoneCompound: e,
              depth: d + 1,
              index: r,
              isLoading: w,
              isSelected: _,
              label: j,
              autoDragAxis: n,
              userDragAxis: i,
              inDroppableZone: o,
              children: (e) => {
                let t, r;
                return (null == v ? void 0 : v.inline) && !z
                  ? (0, rX.jsx)(rX.Fragment, {
                      children: (0, rX.jsx)(
                        P,
                        ((t = rw({}, M)),
                        (r = { puck: rp(rw({}, M.puck), rf({ dragRef: e })) }),
                        rp(t, rf(r)))
                      ),
                    })
                  : (0, rX.jsx)("div", { ref: e, children: (0, rX.jsx)(P, rw({}, M)) });
              },
            })
          );
        }
      ),
      cc = (0, rs.forwardRef)(function (
        {
          zone: e,
          allow: t,
          disallow: r,
          style: n,
          className: i,
          minEmptyHeight: o = 128,
          collisionAxis: a,
        },
        s
      ) {
        let l = (0, rs.useContext)(dU),
          u = up(),
          {
            areaId: d,
            depth: c = 0,
            registerLocalZone: p,
            unregisterLocalZone: h,
          } = null != l ? l : {},
          f = uc(
            lq((e) => {
              var t;
              return d ? (null == (t = e.state.indexes.nodes[d]) ? void 0 : t.path) : null;
            })
          ),
          g = rN;
        d && e !== rN && (g = `${d}:${e}`);
        let m = g === rN || e === rN || "root" === d,
          v = dY(dZ, (e) => e.nextAreaDepthIndex[d || ""]),
          y = uc(
            lq((e) => {
              var t;
              return null == (t = e.state.indexes.zones[g]) ? void 0 : t.contentIds;
            })
          ),
          b = uc(
            lq((e) => {
              var t;
              return null == (t = e.state.indexes.zones[g]) ? void 0 : t.type;
            })
          );
        ((0, rs.useEffect)(() => {
          (!b || "dropzone" === b) &&
            (null == l ? void 0 : l.registerZone) &&
            (null == l || l.registerZone(g));
        }, [b, u]),
          (0, rs.useEffect)(() => {
            "dropzone" === b &&
              g !== rN &&
              console.warn(
                "DropZones have been deprecated in favor of slot fields and will be removed in a future version of Puck. Please see the migration guide: https://www.puckeditor.com/docs/guides/migrations/dropzones-to-slots"
              );
          }, [b]));
        let w = (0, rs.useMemo)(() => y || [], [y]),
          _ = (0, rs.useRef)(null),
          j = (0, rs.useCallback)(
            (e) => {
              if (!e) return !0;
              if (r) {
                let n = t || [];
                if (-1 !== (r || []).filter((e) => -1 === n.indexOf(e)).indexOf(e)) return !1;
              } else if (t && -1 === t.indexOf(e)) return !1;
              return !0;
            },
            [t, r]
          ),
          k = dY(dZ, (e) => {
            var t;
            return j(null == (t = e.draggedItem) ? void 0 : t.data.componentType);
          }),
          S = v || m,
          I = dY(dZ, (e) => {
            var t;
            let r = !0;
            return ((r = null != (t = e.zoneDepthIndex[g]) && t) && (r = k), r);
          });
        (0, rs.useEffect)(
          () => (
            p && p(g, k || I),
            () => {
              h && h(g);
            }
          ),
          [k, I, g]
        );
        let [E, O] = ((e, t) => {
            let r = (0, rs.useContext)(dZ),
              n = dY(dZ, (e) => e.previewIndex[t]),
              i = uc((e) => e.state.ui.isDragging),
              [o, a] = (0, rs.useState)(e),
              [s, l] = (0, rs.useState)(n),
              u = (function (e, t) {
                let r = sW();
                return (0, rs.useCallback)(
                  (...t) =>
                    rj(this, null, function* () {
                      return (yield null == r ? void 0 : r.renderer.rendering, e(...t));
                    }),
                  [...t, r]
                );
              })((e, t, r, n, i) => {
                (!r || i) &&
                  (t
                    ? "insert" === t.type
                      ? a(
                          l1(
                            e.filter((e) => e !== t.props.id),
                            t.index,
                            t.props.id
                          )
                        )
                      : a(
                          l1(
                            e.filter((e) => e !== t.props.id),
                            t.index,
                            t.props.id
                          )
                        )
                    : a(i ? e.filter((e) => e !== n) : e),
                  l(t));
              }, []);
            return (
              (0, rs.useEffect)(() => {
                var t;
                let o = r.getState();
                u(
                  e,
                  n,
                  i,
                  null == (t = o.draggedItem) ? void 0 : t.id,
                  Object.keys(o.previewIndex || {}).length > 0
                );
              }, [e, n, i]),
              [o, s]
            );
          })(w, g),
          C = I && (O ? 1 === E.length : 0 === E.length),
          M = (0, rs.useContext)(dZ);
        (0, rs.useEffect)(() => {
          let { enabledIndex: e } = M.getState();
          M.setState({ enabledIndex: rp(rw({}, e), rf({ [g]: I })) });
        }, [I, M, g]);
        let { ref: P } = s6({
            id: g,
            collisionPriority: I ? c : 0,
            disabled: !C,
            collisionDetector: du,
            type: "dropzone",
            data: { areaId: d, depth: c, isDroppableTarget: k, path: f || [] },
          }),
          A = uc(
            (e) =>
              (null == e ? void 0 : e.selectedItem) &&
              d === (null == e ? void 0 : e.selectedItem.props.id)
          ),
          [z] = ((e, t) => {
            let r = uc((e) => e.status),
              [n, i] = (0, rs.useState)(t || "y"),
              o = (0, rs.useCallback)(() => {
                if (e.current) {
                  let t = window.getComputedStyle(e.current);
                  "grid" === t.display
                    ? i("dynamic")
                    : "flex" === t.display && "row" === t.flexDirection
                      ? i("x")
                      : i("y");
                }
              }, [e.current]);
            return (
              (0, rs.useEffect)(() => {
                let e = () => {
                  o();
                };
                return (
                  window.addEventListener("viewportchange", e),
                  () => {
                    window.removeEventListener("viewportchange", e);
                  }
                );
              }, []),
              (0, rs.useEffect)(o, [r, t]),
              [n, o]
            );
          })(_, a),
          [D, L] = (({ zoneCompound: e, userMinEmptyHeight: t, ref: r }) => {
            let n = up(),
              [i, o] = (0, rs.useState)(0),
              [a, s] = (0, rs.useState)(!1),
              { draggedItem: l, isZone: u } = dY(dZ, (t) => {
                var r, n;
                return {
                  draggedItem:
                    (null == (r = t.draggedItem) ? void 0 : r.data.zone) === e
                      ? t.draggedItem
                      : null,
                  isZone: (null == (n = t.draggedItem) ? void 0 : n.data.zone) === e,
                };
              }),
              d = (0, rs.useRef)(0),
              c = dK(
                (t) => {
                  var r;
                  if (t) {
                    let t = cn(n, e);
                    if ((o(0), t || 0 === d.current)) return void s(!1);
                    let i = n.getState().selectedItem,
                      a = n.getState().state.indexes.zones,
                      l = n.getState().nodes;
                    (null == (r = l.nodes[null == i ? void 0 : i.props.id]) ||
                      r.methods.hideOverlay(),
                      setTimeout(() => {
                        var t;
                        (((null == (t = a[e]) ? void 0 : t.contentIds) || []).forEach((e) => {
                          let t = l.nodes[e];
                          null == t || t.methods.sync();
                        }),
                          i &&
                            setTimeout(() => {
                              var e, t;
                              (null == (e = l.nodes[i.props.id]) || e.methods.sync(),
                                null == (t = l.nodes[i.props.id]) || t.methods.showOverlay());
                            }, 200),
                          s(!1));
                      }, 100));
                  }
                },
                [n, i, e]
              );
            return (
              (0, rs.useEffect)(() => {
                if (l && r.current && u) {
                  let t = r.current.getBoundingClientRect();
                  return ((d.current = cn(n, e)), o(t.height), s(!0), c());
                }
              }, [r.current, l, c]),
              [i || t, a]
            );
          })({ zoneCompound: g, userMinEmptyHeight: o, ref: _ });
        return (0, rX.jsx)("div", {
          className: `${cl({ isRootZone: m, hoveringOverArea: S, isEnabled: I, isAreaSelected: A, hasChildren: w.length > 0, isAnimating: L })}${i ? ` ${i}` : ""}`,
          ref: (e) => {
            [_, P, s].forEach((t) => {
              "function" == typeof t
                ? t(e)
                : t && "object" == typeof t && "current" in t && (t.current = e);
            });
          },
          "data-testid": `dropzone:${g}`,
          "data-puck-dropzone": g,
          style: rp(
            rw({}, n),
            rf({
              "--min-empty-height": `${D}px`,
              backgroundColor: null == n ? void 0 : n.backgroundColor,
            })
          ),
          children: E.map((e, t) =>
            (0, rX.jsx)(
              cd,
              {
                zoneCompound: g,
                componentId: e,
                dragAxis: z,
                index: t,
                collisionAxis: a,
                inDroppableZone: k,
              },
              e
            )
          ),
        });
      }),
      cp = ({ config: e, item: t, metadata: r }) => {
        let n,
          i,
          o = e.components[t.type],
          a = rV(e, t, (t) => (0, rX.jsx)(rq, rp(rw({}, t), rf({ config: e, metadata: r })))),
          s = (0, rs.useMemo)(() => ({ areaId: a.id, depth: 1 }), [a]);
        return (0, rX.jsx)(
          dq,
          {
            value: s,
            children: (0, rX.jsx)(
              o.render,
              ((n = rw({}, a)),
              (i = {
                puck: rp(
                  rw({}, a.puck),
                  rf({ renderDropZone: ch, metadata: rw(rw({}, r), o.metadata) })
                ),
              }),
              rp(n, rf(i)))
            ),
          },
          a.id
        );
      },
      ch = (e) => (0, rX.jsx)(cf, rw({}, e)),
      cf = (0, rs.forwardRef)(function ({ className: e, style: t, zone: r }, n) {
        let i = (0, rs.useContext)(dU),
          { areaId: o = "root" } = i || {},
          { config: a, data: s, metadata: l } = (0, rs.useContext)(cv),
          u = `${o}:${r}`,
          d = (null == s ? void 0 : s.content) || [];
        return ((0, rs.useEffect)(() => {
          !d && (null == i ? void 0 : i.registerZone) && (null == i || i.registerZone(u));
        }, [d]),
        s && a)
          ? (u !== rN && (d = rH(s, u).zones[u]),
            (0, rX.jsx)("div", {
              className: e,
              style: t,
              ref: n,
              children: d.map((e) =>
                a.components[e.type]
                  ? (0, rX.jsx)(cp, { config: a, item: e, metadata: l }, e.props.id)
                  : null
              ),
            }))
          : null;
      }),
      cg = (e) => (0, rX.jsx)(cm, rw({}, e)),
      cm = (0, rs.forwardRef)(function (e, t) {
        let r = (0, rs.useContext)(dU);
        if ((null == r ? void 0 : r.mode) === "edit")
          return (0, rX.jsx)(rX.Fragment, {
            children: (0, rX.jsx)(cc, rp(rw({}, e), rf({ ref: t }))),
          });
        return (0, rX.jsx)(rX.Fragment, {
          children: (0, rX.jsx)(cf, rp(rw({}, e), rf({ ref: t }))),
        });
      }),
      cv = rs.default.createContext({
        config: { components: {} },
        data: { root: {}, content: [] },
        metadata: {},
      });
    function cy({ config: e, data: t, metadata: r = {} }) {
      var n;
      let i = rp(rw({}, t), rf({ root: t.root || {}, content: t.content || [] })),
        o = "props" in i.root ? i.root.props : i.root,
        a = (null == o ? void 0 : o.title) || "",
        s = rV(
          e,
          {
            type: "root",
            props: rp(
              rw({}, o),
              rf({
                puck: { renderDropZone: cg, isEditing: !1, dragRef: null, metadata: r },
                title: a,
                editMode: !1,
                id: "puck-root",
              })
            ),
          },
          (t) => (0, rX.jsx)(rK, rp(rw({}, t), rf({ config: e, metadata: r })))
        ),
        l = (0, rs.useMemo)(() => ({ mode: "render", depth: 0 }), []);
      if (null == (n = e.root) ? void 0 : n.render)
        return (0, rX.jsx)(cv.Provider, {
          value: { config: e, data: i, metadata: r },
          children: (0, rX.jsx)(dq, {
            value: l,
            children: (0, rX.jsx)(
              e.root.render,
              rp(rw({}, s), rf({ children: (0, rX.jsx)(ch, { zone: rL }) }))
            ),
          }),
        });
      return (0, rX.jsx)(cv.Provider, {
        value: { config: e, data: i, metadata: r },
        children: (0, rX.jsx)(dq, { value: l, children: (0, rX.jsx)(ch, { zone: rL }) }),
      });
    }
    rk();
    var cb = (e) => {
        let t = {
          back: e.history.back,
          forward: e.history.forward,
          setHistories: e.history.setHistories,
          setHistoryIndex: e.history.setHistoryIndex,
          hasPast: e.history.hasPast(),
          hasFuture: e.history.hasFuture(),
          histories: e.history.histories,
          index: e.history.index,
        };
        return {
          appState: ue(e.state),
          config: e.config,
          dispatch: e.dispatch,
          getPermissions: e.permissions.getPermissions,
          refreshPermissions: e.permissions.refreshPermissions,
          history: t,
          selectedItem: e.selectedItem || null,
          getItemBySelector: (t) => l3(t, e.state),
          getItemById: (t) => e.state.indexes.nodes[t].data,
          getSelectorForId: (t) => co(e.state, t),
        };
      },
      cx = (0, rs.createContext)(null),
      cw = (e) => ({
        state: e.state,
        config: e.config,
        dispatch: e.dispatch,
        permissions: e.permissions,
        history: e.history,
        selectedItem: e.selectedItem,
      });
    (rk(), rk(), rk(), rk());
    var c_ = lG("SidebarSection", {
        SidebarSection: "_SidebarSection_8boj8_1",
        "SidebarSection-title": "_SidebarSection-title_8boj8_12",
        "SidebarSection--noBorderTop": "_SidebarSection--noBorderTop_8boj8_20",
        "SidebarSection-content": "_SidebarSection-content_8boj8_24",
        "SidebarSection--noPadding": "_SidebarSection--noPadding_8boj8_28",
        "SidebarSection-breadcrumbLabel": "_SidebarSection-breadcrumbLabel_8boj8_41",
        "SidebarSection-breadcrumbs": "_SidebarSection-breadcrumbs_8boj8_70",
        "SidebarSection-breadcrumb": "_SidebarSection-breadcrumb_8boj8_41",
        "SidebarSection-heading": "_SidebarSection-heading_8boj8_82",
        "SidebarSection-loadingOverlay": "_SidebarSection-loadingOverlay_8boj8_86",
      }),
      cj = ({
        children: e,
        title: t,
        background: r,
        showBreadcrumbs: n,
        noBorderTop: i,
        noPadding: o,
        isLoading: a,
      }) => {
        let s,
          l,
          u,
          d,
          c = uc((e) => e.setUi),
          p =
            ((s = uc((e) => {
              var t;
              return null == (t = e.selectedItem) ? void 0 : t.props.id;
            })),
            (l = uc((e) => e.config)),
            (u = uc((e) => {
              var t;
              return null == (t = e.state.indexes.nodes[s]) ? void 0 : t.path;
            })),
            (d = up()),
            (0, rs.useMemo)(() => {
              let e =
                (null == u
                  ? void 0
                  : u.map((e) => {
                      var t, r, n;
                      let [i] = e.split(":");
                      if ("root" === i) return { label: "Page", selector: null };
                      let o = d.getState().state.indexes.nodes[i],
                        a = o.path[o.path.length - 1],
                        s = (
                          (null == (t = d.getState().state.indexes.zones[a])
                            ? void 0
                            : t.contentIds) || []
                        ).indexOf(i);
                      return {
                        label: o
                          ? null != (n = null == (r = l.components[o.data.type]) ? void 0 : r.label)
                            ? n
                            : o.data.type
                          : "Component",
                        selector: o ? { index: s, zone: o.path[o.path.length - 1] } : null,
                      };
                    })) || [];
              return e.slice(e.length - 1);
            }, [u, 1]));
        return (0, rX.jsxs)("div", {
          className: c_({ noBorderTop: i, noPadding: o }),
          style: { background: r },
          children: [
            (0, rX.jsx)("div", {
              className: c_("title"),
              children: (0, rX.jsxs)("div", {
                className: c_("breadcrumbs"),
                children: [
                  n
                    ? p.map((e, t) =>
                        (0, rX.jsxs)(
                          "div",
                          {
                            className: c_("breadcrumb"),
                            children: [
                              (0, rX.jsx)("button", {
                                type: "button",
                                className: c_("breadcrumbLabel"),
                                onClick: () => c({ itemSelector: e.selector }),
                                children: e.label,
                              }),
                              (0, rX.jsx)(uL, { size: 16 }),
                            ],
                          },
                          t
                        )
                      )
                    : null,
                  (0, rX.jsx)("div", {
                    className: c_("heading"),
                    children: (0, rX.jsx)(dI, { rank: "2", size: "xs", children: t }),
                  }),
                ],
              }),
            }),
            (0, rX.jsx)("div", { className: c_("content"), children: e }),
            a &&
              (0, rX.jsx)("div", {
                className: c_("loadingOverlay"),
                children: (0, rX.jsx)(u_, { size: 32 }),
              }),
          ],
        });
      };
    rk();
    var ck = {
      Puck: "_Puck_1yxlw_19",
      "Puck-portal": "_Puck-portal_1yxlw_31",
      "PuckLayout-inner": "_PuckLayout-inner_1yxlw_38",
      "PuckLayout--mounted": "_PuckLayout--mounted_1yxlw_59",
      "PuckLayout--leftSideBarVisible": "_PuckLayout--leftSideBarVisible_1yxlw_63",
      "PuckLayout--rightSideBarVisible": "_PuckLayout--rightSideBarVisible_1yxlw_69",
      "PuckLayout-mounted": "_PuckLayout-mounted_1yxlw_83",
      PuckLayout: "_PuckLayout_1yxlw_38",
    };
    (rk(), rk());
    var cS = lG("PuckFields", {
        PuckFields: "_PuckFields_10bh7_1",
        "PuckFields--isLoading": "_PuckFields--isLoading_10bh7_6",
        "PuckFields-loadingOverlay": "_PuckFields-loadingOverlay_10bh7_10",
        "PuckFields-loadingOverlayInner": "_PuckFields-loadingOverlayInner_10bh7_25",
        "PuckFields-field": "_PuckFields-field_10bh7_32",
        "PuckFields--wrapFields": "_PuckFields--wrapFields_10bh7_36",
      }),
      cI = ({ children: e }) => (0, rX.jsx)(rX.Fragment, { children: e }),
      cE = (0, rs.memo)(({ fieldName: e }) => {
        let t = uc((t) => t.fields.fields[e]),
          r = uc(
            (t) =>
              ((t.selectedItem ? t.selectedItem.readOnly : t.state.data.root.readOnly) || {})[e]
          ),
          n = uc((t) => {
            let r = t.state.data.root.props || t.state.data.root;
            return t.selectedItem ? t.selectedItem.props[e] : r[e];
          }),
          i = uc((r) =>
            t
              ? r.selectedItem
                ? `${r.selectedItem.props.id}_${t.type}_${e}`
                : `root_${t.type}_${e}`
              : null
          ),
          o = uc(
            lq((e) => {
              let { selectedItem: t, permissions: r } = e;
              return t ? r.getPermissions({ item: t }) : r.getPermissions({ root: !0 });
            })
          ),
          a = up(),
          s = (0, rs.useCallback)(
            (t, r) =>
              rj(void 0, null, function* () {
                let {
                    dispatch: n,
                    state: i,
                    selectedItem: o,
                    resolveComponentData: s,
                  } = a.getState(),
                  { data: l, ui: u } = i,
                  { itemSelector: d } = u,
                  c = l.root.props || l.root,
                  p = rp(rw({}, o ? o.props : c), rf({ [e]: t }));
                n(
                  o && d
                    ? {
                        type: "replace",
                        destinationIndex: d.index,
                        destinationZone: d.zone || rN,
                        data: (yield s(rp(rw({}, o), rf({ props: p })), "replace")).node,
                        ui: r,
                      }
                    : l.root.props
                      ? {
                          type: "replaceRoot",
                          root: (yield s(rp(rw({}, l.root), rf({ props: p })), "replace")).node,
                          ui: rw(rw({}, u), r),
                          recordHistory: !0,
                        }
                      : { type: "setData", data: { root: p } }
                );
              }),
            [e]
          ),
          { visible: l = !0 } = null != t ? t : {};
        return t && i && l && "slot" !== t.type
          ? (0, rX.jsx)(
              "div",
              {
                className: cS("field"),
                children: (0, rX.jsx)(dW, {
                  field: t,
                  name: e,
                  id: i,
                  readOnly: !o.edit || r,
                  value: n,
                  onChange: s,
                }),
              },
              i
            )
          : null;
      }),
      cO = (0, rs.memo)(({ wrapFields: e = !0 }) => {
        var t;
        let r,
          n = uc((e) => e.overrides),
          i = uc((e) => {
            var t, r;
            let n = e.selectedItem
              ? null == (t = e.componentState[e.selectedItem.props.id])
                ? void 0
                : t.loadingCount
              : null == (r = e.componentState.root)
                ? void 0
                : r.loadingCount;
            return (null != n ? n : 0) > 0;
          }),
          o = uc(lq((e) => e.state.ui.itemSelector)),
          a = uc((e) => {
            var t;
            return null == (t = e.selectedItem) ? void 0 : t.props.id;
          });
        ((t = up()),
          (r = (0, rs.useCallback)(
            (e) =>
              rj(void 0, null, function* () {
                var r, n;
                let { fields: i, lastResolvedData: o } = t.getState().fields,
                  s = t.getState().state.indexes.nodes,
                  l = s[a || "root"],
                  u = null == l ? void 0 : l.data,
                  d = (null == l ? void 0 : l.parentId) ? s[l.parentId] : null,
                  c = (null == d ? void 0 : d.data) || null,
                  { getComponentConfig: p, state: h } = t.getState(),
                  f = p(null == u ? void 0 : u.type);
                if (!u || !f) return;
                let g = f.fields || {},
                  m = f.resolveFields,
                  v = i;
                if (
                  (e &&
                    (t.setState((e) => ({
                      fields: rp(rw({}, e.fields), rf({ fields: g, id: a })),
                    })),
                    (v = g)),
                  m)
                ) {
                  let e = setTimeout(() => {
                      t.setState((e) => ({ fields: rp(rw({}, e.fields), rf({ loading: !0 })) }));
                    }, 50),
                    i = (null == (r = o.props) ? void 0 : r.id) === a ? o : null,
                    s = r$(u, i),
                    l = yield m(u, {
                      changed: s,
                      fields: g,
                      lastFields: v,
                      lastData: i,
                      appState: ue(h),
                      parent: c,
                    });
                  if (
                    (clearTimeout(e),
                    (null == (n = t.getState().selectedItem) ? void 0 : n.props.id) !== a)
                  )
                    return;
                  t.setState({ fields: { fields: l, loading: !1, lastResolvedData: u, id: a } });
                } else
                  t.setState((e) => ({ fields: rp(rw({}, e.fields), rf({ fields: g, id: a })) }));
              }),
            [a]
          )),
          (0, rs.useEffect)(
            () => (
              r(!0),
              t.subscribe(
                (e) => e.state.indexes.nodes[a || "root"],
                () => r()
              )
            ),
            [a]
          ));
        let s = uc((e) => e.fields.loading),
          l = uc(lq((e) => (e.fields.id === a ? Object.keys(e.fields.fields) : []))),
          u = s || i,
          d = (0, rs.useMemo)(() => n.fields || cI, [n]);
        return (0, rX.jsxs)("form", {
          className: cS({ wrapFields: e }),
          onSubmit: (e) => {
            e.preventDefault();
          },
          children: [
            (0, rX.jsx)(d, {
              isLoading: u,
              itemSelector: o,
              children: l.map((e) => (0, rX.jsx)(cE, { fieldName: e }, e)),
            }),
            u &&
              (0, rX.jsx)("div", {
                className: cS("loadingOverlay"),
                children: (0, rX.jsx)("div", {
                  className: cS("loadingOverlayInner"),
                  children: (0, rX.jsx)(u_, { size: 16 }),
                }),
              }),
          ],
        });
      });
    (rk(), rk(), rk(), rk());
    var cC = lG("ComponentList", {
        ComponentList: "_ComponentList_1rrlt_1",
        "ComponentList--isExpanded": "_ComponentList--isExpanded_1rrlt_5",
        "ComponentList-content": "_ComponentList-content_1rrlt_9",
        "ComponentList-title": "_ComponentList-title_1rrlt_17",
        "ComponentList-titleIcon": "_ComponentList-titleIcon_1rrlt_53",
      }),
      cM = ({ name: e, label: t }) => {
        var r;
        let n = uc((e) => e.overrides),
          i = uc((t) => t.permissions.getPermissions({ type: e }).insert);
        return (
          (0, rs.useEffect)(() => {
            n.componentItem &&
              console.warn(
                "The `componentItem` override has been deprecated and renamed to `drawerItem`"
              );
          }, [n]),
          (0, rX.jsx)(cr.Item, {
            label: t,
            name: e,
            isDragDisabled: !i,
            children: null != (r = n.componentItem) ? r : n.drawerItem,
          })
        );
      },
      cP = ({ children: e, title: t, id: r }) => {
        let n = uc((e) => e.config),
          i = uc((e) => e.setUi),
          o = uc((e) => e.state.ui.componentList),
          { expanded: a = !0 } = o[r] || {};
        return (0, rX.jsxs)("div", {
          className: cC({ isExpanded: a }),
          children: [
            t &&
              (0, rX.jsxs)("button", {
                type: "button",
                className: cC("title"),
                onClick: () => {
                  let e, t;
                  return i({
                    componentList:
                      ((e = rw({}, o)),
                      (t = { [r]: rp(rw({}, o[r]), rf({ expanded: !a })) }),
                      rp(e, rf(t))),
                  });
                },
                title: a ? `Collapse${t ? ` ${t}` : ""}` : `Expand${t ? ` ${t}` : ""}`,
                children: [
                  (0, rX.jsx)("div", { children: t }),
                  (0, rX.jsx)("div", {
                    className: cC("titleIcon"),
                    children: a ? (0, rX.jsx)(uN, { size: 12 }) : (0, rX.jsx)(uD, { size: 12 }),
                  }),
                ],
              }),
            (0, rX.jsx)("div", {
              className: cC("content"),
              children: (0, rX.jsx)(cr, {
                children:
                  e ||
                  Object.keys(n.components).map((e) => {
                    var t;
                    return (0, rX.jsx)(
                      cM,
                      { label: null != (t = n.components[e].label) ? t : e, name: e },
                      e
                    );
                  }),
              }),
            }),
          ],
        });
      };
    cP.Item = cM;
    var cA = () => {
      let e = uc((e) => e.overrides),
        t = (() => {
          let [e, t] = (0, rs.useState)(),
            r = uc((e) => e.config),
            n = uc((e) => e.state.ui.componentList);
          return (
            (0, rs.useEffect)(() => {
              var e, i, o;
              if (Object.keys(n).length > 0) {
                let a,
                  s = [];
                a = Object.entries(n).map(([e, t]) =>
                  t.components
                    ? (t.components.forEach((e) => {
                        s.push(e);
                      }),
                      !1 === t.visible)
                      ? null
                      : (0, rX.jsx)(
                          cP,
                          {
                            id: e,
                            title: t.title || e,
                            children: t.components.map((e, t) => {
                              var n;
                              let i = r.components[e] || {};
                              return (0, rX.jsx)(
                                cP.Item,
                                { label: null != (n = i.label) ? n : e, name: e, index: t },
                                e
                              );
                            }),
                          },
                          e
                        )
                    : null
                );
                let l = Object.keys(r.components).filter((e) => -1 === s.indexOf(e));
                (!(l.length > 0) ||
                  (null == (e = n.other) ? void 0 : e.components) ||
                  (null == (i = n.other) ? void 0 : i.visible) === !1 ||
                  a.push(
                    (0, rX.jsx)(
                      cP,
                      {
                        id: "other",
                        title: (null == (o = n.other) ? void 0 : o.title) || "Other",
                        children: l.map((e, t) => {
                          var n;
                          let i = r.components[e] || {};
                          return (0, rX.jsx)(
                            cP.Item,
                            { name: e, label: null != (n = i.label) ? n : e, index: t },
                            e
                          );
                        }),
                      },
                      "other"
                    )
                  ),
                  t(a));
              }
            }, [r.categories, r.components, n]),
            e
          );
        })(),
        r = (0, rs.useMemo)(
          () => (
            e.components &&
              console.warn("The `components` override has been deprecated and renamed to `drawer`"),
            e.components || e.drawer || "div"
          ),
          [e]
        );
      return (0, rX.jsx)(r, { children: t || (0, rX.jsx)(cP, { id: "all" }) });
    };
    (rk(), rk());
    var cz = 'style, link[rel="stylesheet"]',
      cD = (e) => Array.from(document.styleSheets).find((t) => t.ownerNode.href === e.href),
      cL = (e, t) => {
        let r = e.attributes;
        (null == r ? void 0 : r.length) > 0 &&
          Array.from(r).forEach((e) => {
            t.setAttribute(e.name, e.value);
          });
      },
      cN = ({ children: e, debug: t = !1, onStylesLoaded: r = () => null }) => {
        let { document: n, window: i } = cB();
        return (
          (0, rs.useEffect)(() => {
            let e;
            if (!i || !n) return () => {};
            let o = [],
              a = {},
              s = (e) => o.findIndex((t) => t.original === e),
              l = (e, r = !1) =>
                rj(void 0, null, function* () {
                  let n;
                  if ("LINK" === e.nodeName && r) {
                    (n = document.createElement("style")).type = "text/css";
                    let r = cD(e);
                    r ||
                      (yield new Promise((t) => {
                        let r = () => {
                          (t(), e.removeEventListener("load", r));
                        };
                        e.addEventListener("load", r);
                      }),
                      (r = cD(e)));
                    let i = ((e) => {
                      if (e)
                        try {
                          return [...Array.from(e.cssRules)].map((e) => e.cssText).join("");
                        } catch (t) {
                          console.warn("Access to stylesheet %s is denied. Ignoring…", e.href);
                        }
                      return "";
                    })(r);
                    if (!i) {
                      t &&
                        console.warn(
                          "Tried to load styles for link element, but couldn't find them. Skipping..."
                        );
                      return;
                    }
                    ((n.innerHTML = i), n.setAttribute("data-href", e.getAttribute("href")));
                  } else n = e.cloneNode(!0);
                  return n;
                }),
              u = new MutationObserver((e) => {
                e.forEach((e) => {
                  "childList" === e.type &&
                    (e.addedNodes.forEach((e) => {
                      if (e.nodeType === Node.TEXT_NODE || e.nodeType === Node.ELEMENT_NODE) {
                        let r = e.nodeType === Node.TEXT_NODE ? e.parentElement : e;
                        r &&
                          r.matches(cz) &&
                          setTimeout(
                            () =>
                              rj(void 0, null, function* () {
                                let e = s(r);
                                if (e > -1) {
                                  (t &&
                                    console.log(
                                      "Tried to add an element that was already mirrored. Updating instead..."
                                    ),
                                    (o[e].mirror.innerText = r.innerText));
                                  return;
                                }
                                let i = yield l(r);
                                if (!i) return;
                                let u = (0, lY.default)(i.outerHTML);
                                if (a[u]) {
                                  t &&
                                    console.log(
                                      "iframe already contains element that is being mirrored. Skipping..."
                                    );
                                  return;
                                }
                                ((a[u] = !0),
                                  n.head.append(i),
                                  o.push({ original: r, mirror: i }),
                                  t && console.log(`Added style node ${r.outerHTML}`));
                              }),
                            0
                          );
                      }
                    }),
                    e.removedNodes.forEach((e) => {
                      if (e.nodeType === Node.TEXT_NODE || e.nodeType === Node.ELEMENT_NODE) {
                        let r = e.nodeType === Node.TEXT_NODE ? e.parentElement : e;
                        r &&
                          r.matches(cz) &&
                          setTimeout(
                            () =>
                              ((e) => {
                                var r, n;
                                let i = s(e);
                                if (-1 === i) {
                                  t &&
                                    console.log(
                                      "Tried to remove an element that did not exist. Skipping..."
                                    );
                                  return;
                                }
                                let l = (0, lY.default)(e.outerHTML);
                                (null == (n = null == (r = o[i]) ? void 0 : r.mirror) || n.remove(),
                                  delete a[l],
                                  t && console.log(`Removed style node ${e.outerHTML}`));
                              })(r),
                            0
                          );
                      }
                    }));
                });
              }),
              d = i.parent.document,
              c =
                ((e = []),
                d.querySelectorAll(cz).forEach((t) => {
                  "STYLE" === t.tagName ? t.innerHTML.trim() && e.push(t) : e.push(t);
                }),
                e),
              p = [],
              h = 0;
            return (
              cL(d.getElementsByTagName("html")[0], n.documentElement),
              cL(d.getElementsByTagName("body")[0], n.body),
              Promise.all(
                c.map((e, t) =>
                  rj(void 0, null, function* () {
                    if ("LINK" === e.nodeName) {
                      let t = e.href;
                      if (p.indexOf(t) > -1) return;
                      p.push(t);
                    }
                    let t = yield l(e);
                    if (t) return (o.push({ original: e, mirror: t }), t);
                  })
                )
              ).then((e) => {
                let t = e.filter((e) => void 0 !== e);
                (t.forEach((e) => {
                  ((e.onload = () => {
                    (h += 1) >= o.length && r();
                  }),
                    (e.onerror = () => {
                      (console.warn("AutoFrame couldn't load a stylesheet"),
                        (h += 1) >= o.length && r());
                    }));
                }),
                  (n.head.innerHTML = ""),
                  n.head.append(...t),
                  u.observe(d.head, { childList: !0, subtree: !0 }),
                  t.forEach((e) => {
                    a[(0, lY.default)(e.outerHTML)] = !0;
                  }));
              }),
              () => {
                u.disconnect();
              }
            );
          }, []),
          (0, rX.jsx)(rX.Fragment, { children: e })
        );
      },
      cT = (0, rs.createContext)({}),
      cB = () => (0, rs.useContext)(cT);
    function cR(e) {
      var {
          children: t,
          className: r,
          debug: n,
          id: i,
          onReady: o = () => {},
          onNotReady: a = () => {},
          frameRef: s,
        } = e,
        l = r_(e, ["children", "className", "debug", "id", "onReady", "onNotReady", "frameRef"]);
      let [u, d] = (0, rs.useState)(!1),
        [c, p] = (0, rs.useState)({}),
        [h, f] = (0, rs.useState)(),
        [g, m] = (0, rs.useState)(!1);
      return (
        (0, rs.useEffect)(() => {
          var e;
          if (s.current) {
            let t = s.current.contentDocument,
              r = s.current.contentWindow;
            (p({ document: t || void 0, window: r || void 0 }),
              f(null == (e = s.current.contentDocument) ? void 0 : e.getElementById("frame-root")),
              t && r && g ? o() : a());
          }
        }, [s, u, g]),
        (0, rX.jsx)(
          "iframe",
          rp(
            rw({}, l),
            rf({
              className: r,
              id: i,
              srcDoc:
                '<!DOCTYPE html><html><head></head><body><div id="frame-root" data-puck-entry></div></body></html>',
              ref: s,
              onLoad: () => {
                d(!0);
              },
              children: (0, rX.jsx)(cT.Provider, {
                value: c,
                children:
                  u &&
                  h &&
                  (0, rX.jsx)(cN, {
                    debug: n,
                    onStylesLoaded: () => m(!0),
                    children: (0, sw.createPortal)(t, h),
                  }),
              }),
            })
          )
        )
      );
    }
    ((cR.displayName = "AutoFrame"), rk());
    var c$ = lG("PuckPreview", {
        PuckPreview: "_PuckPreview_z2rgu_1",
        "PuckPreview-frame": "_PuckPreview-frame_z2rgu_6",
      }),
      cF = ({ id: e = "puck-preview" }) => {
        let t,
          r = uc((e) => e.dispatch),
          n = uc((e) => e.state.data.root),
          i = uc((e) => e.config),
          o = uc((e) => e.setStatus),
          a = uc((e) => e.iframe),
          s = uc((e) => e.overrides),
          l = uc((e) => e.metadata),
          u = uc((e) => ("edit" === e.state.ui.previewMode ? null : e.state.data)),
          d = (0, rs.useCallback)(
            (e) => {
              var t, r;
              let n = rV(i, { type: "root", props: e }, cu);
              return (null == (t = i.root) ? void 0 : t.render)
                ? null == (r = i.root)
                  ? void 0
                  : r.render(rw({ id: "puck-root" }, n))
                : (0, rX.jsx)(rX.Fragment, { children: n.children });
            },
            [i]
          ),
          c = (0, rs.useMemo)(() => s.iframe, [s]),
          p = n.props || n,
          h = (0, rs.useRef)(null);
        ((t = uc((e) => e.status)),
          (0, rs.useEffect)(() => {
            if (h.current && "READY" === t) {
              var e;
              let t = h.current,
                r = (e) => {
                  let r = new d5(
                    "pointermove",
                    rp(
                      rw({}, e),
                      rf({
                        bubbles: !0,
                        cancelable: !1,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        originalTarget: e.target,
                      })
                    )
                  );
                  t.dispatchEvent(r);
                },
                n = () => {
                  var e;
                  null == (e = t.contentDocument) || e.removeEventListener("pointermove", r);
                };
              return (
                n(),
                null == (e = t.contentDocument) ||
                  e.addEventListener("pointermove", r, { capture: !0 }),
                () => {
                  n();
                }
              );
            }
          }, [t]));
        let f = u
          ? (0, rX.jsx)(cy, { data: u, config: i, metadata: l })
          : (0, rX.jsx)(
              d,
              rp(
                rw({}, p),
                rf({
                  puck: { renderDropZone: cg, isEditing: !0, dragRef: null, metadata: l },
                  editMode: !0,
                  children: (0, rX.jsx)(cg, { zone: rN }),
                })
              )
            );
        return (
          (0, rs.useEffect)(() => {
            a.enabled || o("READY");
          }, [a.enabled]),
          (0, rX.jsx)("div", {
            className: c$(),
            id: e,
            "data-puck-preview": !0,
            onClick: (e) => {
              let t = e.target;
              t.hasAttribute("data-puck-component") ||
                t.hasAttribute("data-puck-dropzone") ||
                r({ type: "setUi", ui: { itemSelector: null } });
            },
            children: a.enabled
              ? (0, rX.jsx)(cR, {
                  id: "preview-frame",
                  className: c$("frame"),
                  "data-rfd-iframe": !0,
                  onReady: () => {
                    o("READY");
                  },
                  onNotReady: () => {
                    o("MOUNTED");
                  },
                  frameRef: h,
                  children: (0, rX.jsx)(cT.Consumer, {
                    children: ({ document: e }) =>
                      c ? (0, rX.jsx)(c, { document: e, children: f }) : f,
                  }),
                })
              : (0, rX.jsx)("div", {
                  id: "preview-frame",
                  className: c$("frame"),
                  ref: h,
                  "data-puck-entry": !0,
                  children: f,
                }),
          })
        );
      };
    (rk(), rk(), rk());
    var cW = {
      LayerTree: "_LayerTree_7rx04_1",
      "LayerTree-zoneTitle": "_LayerTree-zoneTitle_7rx04_11",
      "LayerTree-helper": "_LayerTree-helper_7rx04_17",
      Layer: "_Layer_7rx04_1",
      "Layer-inner": "_Layer-inner_7rx04_29",
      "Layer--containsZone": "_Layer--containsZone_7rx04_35",
      "Layer-clickable": "_Layer-clickable_7rx04_39",
      "Layer--isSelected": "_Layer--isSelected_7rx04_61",
      "Layer-chevron": "_Layer-chevron_7rx04_77",
      "Layer--childIsSelected": "_Layer--childIsSelected_7rx04_78",
      "Layer-zones": "_Layer-zones_7rx04_82",
      "Layer-title": "_Layer-title_7rx04_96",
      "Layer-name": "_Layer-name_7rx04_105",
      "Layer-icon": "_Layer-icon_7rx04_111",
      "Layer-zoneIcon": "_Layer-zoneIcon_7rx04_116",
    };
    (rk(), rk());
    var cH = lG("LayerTree", cW),
      cU = lG("Layer", cW),
      cZ = ({ index: e, itemId: t, zoneCompound: r }) => {
        var n;
        let i = uc((e) => e.config),
          o = uc((e) => e.state.ui.itemSelector),
          a = uc((e) => e.dispatch),
          s = (0, rs.useCallback)(
            (e) => {
              a({ type: "setUi", ui: { itemSelector: e } });
            },
            [a]
          ),
          l =
            uc((e) => {
              var t;
              return null == (t = e.selectedItem) ? void 0 : t.props.id;
            }) === t ||
            (o && o.zone === rN && !r),
          u = uc((e) => e.state.indexes.nodes[t]),
          d = uc(
            lq((e) => Object.keys(e.state.indexes.zones).filter((e) => e.split(":")[0] === t))
          ),
          c = d.length > 0,
          p = (0, rs.useContext)(dZ),
          h = dY(dZ, (e) => e.hoveringComponent === t),
          f = uc((e) => {
            var r, n;
            let i = e.state.indexes.nodes[null == (r = e.selectedItem) ? void 0 : r.props.id];
            return (
              null !=
                (n =
                  null == i
                    ? void 0
                    : i.path.some((e) => {
                        let [r] = e.split(":");
                        return r === t;
                      })) && n
            );
          }),
          g = i.components[u.data.type],
          m = null != (n = null == g ? void 0 : g.label) ? n : u.data.type.toString();
        return (0, rX.jsxs)("li", {
          className: cU({ isSelected: l, isHovering: h, containsZone: c, childIsSelected: f }),
          children: [
            (0, rX.jsx)("div", {
              className: cU("inner"),
              children: (0, rX.jsxs)("button", {
                type: "button",
                className: cU("clickable"),
                onClick: () => {
                  var n;
                  let i, o, a;
                  if (l) return void s(null);
                  let u = d1(),
                    d = null == u ? void 0 : u.querySelector(`[data-puck-component="${t}"]`);
                  d
                    ? ((i = rw({}, d.style)),
                      (d.style.scrollMargin = "256px"),
                      d &&
                        (null == d || d.scrollIntoView({ behavior: "smooth" }),
                        (d.style.scrollMargin = i.scrollMargin || "")),
                      (n = () => {
                        s({ index: e, zone: r });
                      }),
                      (a = function () {
                        (clearTimeout(o),
                          (o = setTimeout(function () {
                            (n(), null == u || u.removeEventListener("scroll", a));
                          }, 50)));
                      }),
                      null == u || u.addEventListener("scroll", a),
                      setTimeout(() => {
                        o || n();
                      }, 50))
                    : s({ index: e, zone: r });
                },
                onMouseEnter: (e) => {
                  (e.stopPropagation(), p.setState({ hoveringComponent: t }));
                },
                onMouseLeave: (e) => {
                  (e.stopPropagation(), p.setState({ hoveringComponent: null }));
                },
                children: [
                  c &&
                    (0, rX.jsx)("div", {
                      className: cU("chevron"),
                      title: l ? "Collapse" : "Expand",
                      children: (0, rX.jsx)(uD, { size: "12" }),
                    }),
                  (0, rX.jsxs)("div", {
                    className: cU("title"),
                    children: [
                      (0, rX.jsx)("div", {
                        className: cU("icon"),
                        children:
                          "Text" === u.data.type || "Heading" === u.data.type
                            ? (0, rX.jsx)(u6, { size: "16" })
                            : (0, rX.jsx)(uU, { size: "16" }),
                      }),
                      (0, rX.jsx)("div", { className: cU("name"), children: m }),
                    ],
                  }),
                ],
              }),
            }),
            c &&
              d.map((e) =>
                (0, rX.jsx)(
                  "div",
                  { className: cU("zones"), children: (0, rX.jsx)(cV, { zoneCompound: e }) },
                  e
                )
              ),
          ],
        });
      },
      cV = ({ label: e, zoneCompound: t }) => {
        let r = uc((r) => {
            var n, i, o, a;
            if (e) return e;
            if (t === rN) return;
            let [s, l] = t.split(":"),
              u = null == (n = r.state.indexes.nodes[s]) ? void 0 : n.data.type,
              d = u && u !== rD ? r.config.components[u] : r.config.root;
            return null !=
              (a =
                null == (o = null == (i = null == d ? void 0 : d.fields) ? void 0 : i[l])
                  ? void 0
                  : o.label)
              ? a
              : l;
          }),
          n = uc(
            lq((e) => {
              var r, n;
              return t &&
                null != (n = null == (r = e.state.indexes.zones[t]) ? void 0 : r.contentIds)
                ? n
                : [];
            })
          );
        return (0, rX.jsxs)(rX.Fragment, {
          children: [
            r &&
              (0, rX.jsxs)("div", {
                className: cH("zoneTitle"),
                children: [
                  (0, rX.jsx)("div", {
                    className: cH("zoneIcon"),
                    children: (0, rX.jsx)(uH, { size: "16" }),
                  }),
                  r,
                ],
              }),
            (0, rX.jsxs)("ul", {
              className: cH(),
              children: [
                0 === n.length &&
                  (0, rX.jsx)("div", { className: cH("helper"), children: "No items" }),
                n.map((e, r) => (0, rX.jsx)(cZ, { index: r, itemId: e, zoneCompound: t }, e)),
              ],
            }),
          ],
        });
      };
    rk();
    var cq = () => {
      let e = uc((e) => e.overrides.outline),
        t = uc(
          lq((e) => Object.keys(e.state.indexes.zones).filter((e) => "root" === e.split(":")[0]))
        ),
        r = (0, rs.useMemo)(() => e || "div", [e]);
      return (0, rX.jsx)(r, {
        children: t.map((e) =>
          (0, rX.jsx)(cV, { label: 1 === t.length ? "" : e.split(":")[1], zoneCompound: e }, e)
        ),
      });
    };
    (rk(), rk(), rk());
    var cY = {
        ViewportControls: "_ViewportControls_gejzr_1",
        "ViewportControls-divider": "_ViewportControls-divider_gejzr_15",
        "ViewportControls-zoomSelect": "_ViewportControls-zoomSelect_gejzr_21",
        "ViewportButton--isActive": "_ViewportButton--isActive_gejzr_38",
        "ViewportButton-inner": "_ViewportButton-inner_gejzr_38",
      },
      cK = {
        Smartphone: (0, rX.jsx)(u2, { size: 16 }),
        Tablet: (0, rX.jsx)(u4, { size: 16 }),
        Monitor: (0, rX.jsx)(uK, { size: 16 }),
      },
      cX = lG("ViewportControls", cY),
      cG = lG("ViewportButton", cY),
      cJ = ({ children: e, height: t = "auto", title: r, width: n, onClick: i }) => {
        let o = uc((e) => e.state.ui.viewports),
          [a, s] = (0, rs.useState)(!1);
        return (
          (0, rs.useEffect)(() => {
            s(n === o.current.width);
          }, [n, o.current.width]),
          (0, rX.jsx)("span", {
            className: cG({ isActive: a }),
            children: (0, rX.jsx)(uk, {
              type: "button",
              title: r,
              disabled: a,
              onClick: (e) => {
                (e.stopPropagation(), i({ width: n, height: t }));
              },
              children: (0, rX.jsx)("span", { className: cG("inner"), children: e }),
            }),
          })
        );
      },
      cQ = [
        { label: "25%", value: 0.25 },
        { label: "50%", value: 0.5 },
        { label: "75%", value: 0.75 },
        { label: "100%", value: 1 },
        { label: "125%", value: 1.25 },
        { label: "150%", value: 1.5 },
        { label: "200%", value: 2 },
      ],
      c0 = ({ autoZoom: e, zoom: t, onViewportChange: r, onZoom: n }) => {
        var i, o;
        let a = uc((e) => e.viewports),
          s = cQ.find((t) => t.value === e),
          l = (0, rs.useMemo)(
            () =>
              [...cQ, ...(s ? [] : [{ value: e, label: `${(100 * e).toFixed(0)}% (Auto)` }])]
                .filter((t) => t.value <= e)
                .sort((e, t) => (e.value > t.value ? 1 : -1)),
            [e]
          );
        return (0, rX.jsxs)("div", {
          className: cX(),
          children: [
            a.map((e, t) =>
              (0, rX.jsx)(
                cJ,
                {
                  height: e.height,
                  width: e.width,
                  title: e.label ? `Switch to ${e.label} viewport` : "Switch viewport",
                  onClick: r,
                  children:
                    "string" == typeof e.icon ? cK[e.icon] || e.icon : e.icon || cK.Smartphone,
                },
                t
              )
            ),
            (0, rX.jsx)("div", { className: cX("divider") }),
            (0, rX.jsx)(uk, {
              type: "button",
              title: "Zoom viewport out",
              disabled: t <= (null == (i = l[0]) ? void 0 : i.value),
              onClick: (e) => {
                (e.stopPropagation(),
                  n(l[Math.max(l.findIndex((e) => e.value === t) - 1, 0)].value));
              },
              children: (0, rX.jsx)(u7, { size: 16 }),
            }),
            (0, rX.jsx)(uk, {
              type: "button",
              title: "Zoom viewport in",
              disabled: t >= (null == (o = l[l.length - 1]) ? void 0 : o.value),
              onClick: (e) => {
                (e.stopPropagation(),
                  n(l[Math.min(l.findIndex((e) => e.value === t) + 1, l.length - 1)].value));
              },
              children: (0, rX.jsx)(u8, { size: 16 }),
            }),
            (0, rX.jsx)("div", { className: cX("divider") }),
            (0, rX.jsx)("select", {
              className: cX("zoomSelect"),
              value: t.toString(),
              onClick: (e) => {
                e.stopPropagation();
              },
              onChange: (e) => {
                n(parseFloat(e.currentTarget.value));
              },
              children: l.map((e) =>
                (0, rX.jsx)("option", { value: e.value, label: e.label }, e.label)
              ),
            }),
          ],
        });
      };
    (rk(), rk());
    var c1 = (0, rs.createContext)(null),
      c2 = ({ children: e }) => {
        let t = (0, rs.useRef)(null),
          r = (0, rs.useMemo)(() => ({ frameRef: t }), []);
        return (0, rX.jsx)(c1.Provider, { value: r, children: e });
      },
      c4 = () => {
        let e = (0, rs.useContext)(c1);
        if (null === e) throw Error("useCanvasFrame must be used within a FrameProvider");
        return e;
      },
      c5 = lG("PuckCanvas", {
        PuckCanvas: "_PuckCanvas_18jay_1",
        "PuckCanvas-controls": "_PuckCanvas-controls_18jay_16",
        "PuckCanvas-inner": "_PuckCanvas-inner_18jay_21",
        "PuckCanvas-root": "_PuckCanvas-root_18jay_30",
        "PuckCanvas--ready": "_PuckCanvas--ready_18jay_55",
        "PuckCanvas-loader": "_PuckCanvas-loader_18jay_60",
        "PuckCanvas--showLoader": "_PuckCanvas--showLoader_18jay_70",
      }),
      c6 = () => {
        let { frameRef: e } = c4(),
          t = ux(e),
          {
            dispatch: r,
            overrides: n,
            setUi: i,
            zoomConfig: o,
            setZoomConfig: a,
            status: s,
            iframe: l,
          } = uc(
            lq((e) => ({
              dispatch: e.dispatch,
              overrides: e.overrides,
              setUi: e.setUi,
              zoomConfig: e.zoomConfig,
              setZoomConfig: e.setZoomConfig,
              status: e.status,
              iframe: e.iframe,
            }))
          ),
          {
            leftSideBarVisible: u,
            rightSideBarVisible: d,
            leftSideBarWidth: c,
            rightSideBarWidth: p,
            viewports: h,
          } = uc(
            lq((e) => ({
              leftSideBarVisible: e.state.ui.leftSideBarVisible,
              rightSideBarVisible: e.state.ui.rightSideBarVisible,
              leftSideBarWidth: e.state.ui.leftSideBarWidth,
              rightSideBarWidth: e.state.ui.rightSideBarWidth,
              viewports: e.state.ui.viewports,
            }))
          ),
          [f, g] = (0, rs.useState)(!1),
          m = (0, rs.useRef)(!1),
          v = (0, rs.useMemo)(
            () =>
              ({ children: e }) =>
                (0, rX.jsx)(rX.Fragment, { children: e }),
            []
          ),
          y = (0, rs.useMemo)(() => n.preview || v, [n]),
          b = (0, rs.useCallback)(() => {
            if (e.current) {
              let t = ub(e.current);
              return { width: t.contentBox.width, height: t.contentBox.height };
            }
            return { width: 0, height: 0 };
          }, [e]);
        ((0, rs.useEffect)(() => {
          t();
        }, [e, u, d, c, p, h]),
          (0, rs.useEffect)(() => {
            let { height: e } = b();
            "auto" === h.current.height && a(rp(rw({}, o), rf({ rootHeight: e / o.zoom })));
          }, [o.zoom, b, a]),
          (0, rs.useEffect)(() => {
            t();
          }, [h.current.width, h]),
          (0, rs.useEffect)(() => {
            if (!e.current) return;
            let r = new ResizeObserver(() => {
              m.current || t();
            });
            return (
              r.observe(e.current),
              () => {
                r.disconnect();
              }
            );
          }, [e.current]));
        let [w, _] = (0, rs.useState)(!1);
        return (
          (0, rs.useEffect)(() => {
            setTimeout(() => {
              _(!0);
            }, 500);
          }, []),
          (0, rX.jsxs)("div", {
            className: c5({
              ready: "READY" === s || !l.enabled || !l.waitForStyles,
              showLoader: w,
            }),
            onClick: (e) => {
              let t = e.target;
              t.hasAttribute("data-puck-component") ||
                t.hasAttribute("data-puck-dropzone") ||
                r({ type: "setUi", ui: { itemSelector: null }, recordHistory: !0 });
            },
            children: [
              h.controlsVisible &&
                l.enabled &&
                (0, rX.jsx)("div", {
                  className: c5("controls"),
                  children: (0, rX.jsx)(c0, {
                    autoZoom: o.autoZoom,
                    zoom: o.zoom,
                    onViewportChange: (e) => {
                      (g(!0), (m.current = !0));
                      let r = rp(rw({}, e), rf({ height: e.height || "auto", zoom: o.zoom }));
                      (i({ viewports: rp(rw({}, h), rf({ current: r })) }),
                        t({ viewports: rp(rw({}, h), rf({ current: r })) }));
                    },
                    onZoom: (e) => {
                      (g(!0), (m.current = !0), a(rp(rw({}, o), rf({ zoom: e }))));
                    },
                  }),
                }),
              (0, rX.jsxs)("div", {
                className: c5("inner"),
                ref: e,
                children: [
                  (0, rX.jsx)("div", {
                    className: c5("root"),
                    style: {
                      width: l.enabled ? h.current.width : "100%",
                      height: o.rootHeight,
                      transform: l.enabled ? `scale(${o.zoom})` : void 0,
                      transition: f
                        ? "width 150ms ease-out, height 150ms ease-out, transform 150ms ease-out"
                        : "",
                      overflow: l.enabled ? void 0 : "auto",
                    },
                    suppressHydrationWarning: !0,
                    id: "puck-canvas-root",
                    onTransitionEnd: () => {
                      (g(!1), (m.current = !1));
                    },
                    children: (0, rX.jsx)(y, { children: (0, rX.jsx)(cF, {}) }),
                  }),
                  (0, rX.jsx)("div", {
                    className: c5("loader"),
                    children: (0, rX.jsx)(u_, { size: 24 }),
                  }),
                ],
              }),
            ],
          })
        );
      };
    (rk(), rk(), rk());
    var c3 = ({ children: e }) => (0, rX.jsx)(rX.Fragment, { children: e });
    (rk(), rk(), rk(), rk(), rk());
    var c8 = lG("MenuBar", {
      MenuBar: "_MenuBar_8pf8c_1",
      "MenuBar--menuOpen": "_MenuBar--menuOpen_8pf8c_14",
      "MenuBar-inner": "_MenuBar-inner_8pf8c_29",
      "MenuBar-history": "_MenuBar-history_8pf8c_45",
    });
    function c7({ menuOpen: e = !1, renderHeaderActions: t, setMenuOpen: r }) {
      let n = uc((e) => e.history.back),
        i = uc((e) => e.history.forward),
        o = uc((e) => e.history.hasFuture()),
        a = uc((e) => e.history.hasPast());
      return (0, rX.jsx)("div", {
        className: c8({ menuOpen: e }),
        onClick: (e) => {
          var t;
          let n = e.target;
          !window.matchMedia("(min-width: 638px)").matches &&
            "A" === n.tagName &&
            (null == (t = n.getAttribute("href")) ? void 0 : t.startsWith("#")) &&
            r(!1);
        },
        children: (0, rX.jsxs)("div", {
          className: c8("inner"),
          children: [
            (0, rX.jsxs)("div", {
              className: c8("history"),
              children: [
                (0, rX.jsx)(uk, {
                  type: "button",
                  title: "undo",
                  disabled: !a,
                  onClick: n,
                  children: (0, rX.jsx)(u3, { size: 21 }),
                }),
                (0, rX.jsx)(uk, {
                  type: "button",
                  title: "redo",
                  disabled: !o,
                  onClick: i,
                  children: (0, rX.jsx)(uQ, { size: 21 }),
                }),
              ],
            }),
            (0, rX.jsx)(rX.Fragment, { children: t && t() }),
          ],
        }),
      });
    }
    rk();
    var c9 = lG("PuckHeader", {
        PuckHeader: "_PuckHeader_15xnq_1",
        "PuckHeader-inner": "_PuckHeader-inner_15xnq_10",
        "PuckHeader-toggle": "_PuckHeader-toggle_15xnq_20",
        "PuckHeader--rightSideBarVisible": "_PuckHeader--rightSideBarVisible_15xnq_27",
        "PuckHeader-rightSideBarToggle": "_PuckHeader-rightSideBarToggle_15xnq_27",
        "PuckHeader--leftSideBarVisible": "_PuckHeader--leftSideBarVisible_15xnq_28",
        "PuckHeader-leftSideBarToggle": "_PuckHeader-leftSideBarToggle_15xnq_28",
        "PuckHeader-title": "_PuckHeader-title_15xnq_32",
        "PuckHeader-path": "_PuckHeader-path_15xnq_36",
        "PuckHeader-tools": "_PuckHeader-tools_15xnq_43",
        "PuckHeader-menuButton": "_PuckHeader-menuButton_15xnq_49",
        "PuckHeader--menuOpen": "_PuckHeader--menuOpen_15xnq_54",
      }),
      pe = (0, rs.memo)(() => {
        let {
            onPublish: e,
            renderHeader: t,
            renderHeaderActions: r,
            headerTitle: n,
            headerPath: i,
            iframe: o,
          } = pc(),
          a = uc((e) => e.dispatch),
          s = up(),
          l = (0, rs.useMemo)(
            () =>
              t
                ? (console.warn(
                    "`renderHeader` is deprecated. Please use `overrides.header` and the `usePuck` hook instead"
                  ),
                  (e) => {
                    var { actions: r } = e,
                      n = r_(e, ["actions"]);
                    let i = uc((e) => e.state);
                    return (0, rX.jsx)(
                      t,
                      rp(rw({}, n), rf({ dispatch: a, state: i, children: r }))
                    );
                  })
                : c3,
            [t]
          ),
          u = (0, rs.useMemo)(
            () =>
              r
                ? (console.warn(
                    "`renderHeaderActions` is deprecated. Please use `overrides.headerActions` and the `usePuck` hook instead."
                  ),
                  (e) => {
                    let t = uc((e) => e.state);
                    return (0, rX.jsx)(r, rp(rw({}, e), rf({ dispatch: a, state: t })));
                  })
                : c3,
            [r]
          ),
          d = uc((e) => e.overrides.header || l),
          c = uc((e) => e.overrides.headerActions || u),
          [p, h] = (0, rs.useState)(!1),
          f = uc((e) => {
            var t, r;
            return null !=
              (r = (null == (t = e.state.indexes.nodes.root) ? void 0 : t.data).props.title)
              ? r
              : "";
          }),
          g = uc((e) => e.state.ui.leftSideBarVisible),
          m = uc((e) => e.state.ui.rightSideBarVisible),
          v = (0, rs.useCallback)(
            (e) => {
              let t = window.matchMedia("(min-width: 638px)").matches,
                r = "left" === e ? g : m;
              a({
                type: "setUi",
                ui: rw(
                  { [`${e}SideBarVisible`]: !r },
                  t ? {} : { ["left" === e ? "rightSideBarVisible" : "leftSideBarVisible"]: !1 }
                ),
              });
            },
            [a, g, m]
          );
        return (0, rX.jsx)(d, {
          actions: (0, rX.jsx)(rX.Fragment, {
            children: (0, rX.jsx)(c, {
              children: (0, rX.jsx)(uE, {
                onClick: () => {
                  let t = s.getState().state.data;
                  e && e(t);
                },
                icon: (0, rX.jsx)(uF, { size: "14px" }),
                children: "Publish",
              }),
            }),
          }),
          children: (0, rX.jsx)("header", {
            className: c9({ leftSideBarVisible: g, rightSideBarVisible: m }),
            children: (0, rX.jsxs)("div", {
              className: c9("inner"),
              children: [
                (0, rX.jsxs)("div", {
                  className: c9("toggle"),
                  children: [
                    (0, rX.jsx)("div", {
                      className: c9("leftSideBarToggle"),
                      children: (0, rX.jsx)(uk, {
                        type: "button",
                        onClick: () => {
                          v("left");
                        },
                        title: "Toggle left sidebar",
                        children: (0, rX.jsx)(uX, { focusable: "false" }),
                      }),
                    }),
                    (0, rX.jsx)("div", {
                      className: c9("rightSideBarToggle"),
                      children: (0, rX.jsx)(uk, {
                        type: "button",
                        onClick: () => {
                          v("right");
                        },
                        title: "Toggle right sidebar",
                        children: (0, rX.jsx)(uG, { focusable: "false" }),
                      }),
                    }),
                  ],
                }),
                (0, rX.jsx)("div", {
                  className: c9("title"),
                  children: (0, rX.jsxs)(dI, {
                    rank: "2",
                    size: "xs",
                    children: [
                      n || f || "Page",
                      i &&
                        (0, rX.jsxs)(rX.Fragment, {
                          children: [
                            " ",
                            (0, rX.jsx)("code", { className: c9("path"), children: i }),
                          ],
                        }),
                    ],
                  }),
                }),
                (0, rX.jsxs)("div", {
                  className: c9("tools"),
                  children: [
                    (0, rX.jsx)("div", {
                      className: c9("menuButton"),
                      children: (0, rX.jsx)(uk, {
                        type: "button",
                        onClick: () => h(!p),
                        title: "Toggle menu bar",
                        children: p
                          ? (0, rX.jsx)(uN, { focusable: "false" })
                          : (0, rX.jsx)(uD, { focusable: "false" }),
                      }),
                    }),
                    (0, rX.jsx)(c7, {
                      dispatch: a,
                      onPublish: e,
                      menuOpen: p,
                      renderHeaderActions: () =>
                        (0, rX.jsx)(c, {
                          children: (0, rX.jsx)(uE, {
                            onClick: () => {
                              let t = s.getState().state.data;
                              e && e(t);
                            },
                            icon: (0, rX.jsx)(uF, { size: "14px" }),
                            children: "Publish",
                          }),
                        }),
                      setMenuOpen: h,
                    }),
                  ],
                }),
              ],
            }),
          }),
        });
      });
    (rk(), rk(), rk());
    var pt = lG("ResizeHandle", {
        ResizeHandle: "_ResizeHandle_144bf_2",
        "ResizeHandle--left": "_ResizeHandle--left_144bf_16",
        "ResizeHandle--right": "_ResizeHandle--right_144bf_20",
      }),
      pr = ({ position: e, sidebarRef: t, onResize: r, onResizeEnd: n }) => {
        let { frameRef: i } = c4(),
          o = ux(i),
          a = (0, rs.useRef)(null),
          s = (0, rs.useRef)(!1),
          l = (0, rs.useRef)(0),
          u = (0, rs.useRef)(0),
          d = (0, rs.useCallback)(
            (t) => {
              if (!s.current) return;
              let n = t.clientX - l.current;
              (r(Math.max(192, "left" === e ? u.current + n : u.current - n)), t.preventDefault());
            },
            [r, e]
          ),
          c = (0, rs.useCallback)(() => {
            var e;
            if (!s.current) return;
            ((s.current = !1),
              (document.body.style.cursor = ""),
              (document.body.style.userSelect = ""));
            let r = document.getElementById("resize-overlay");
            (r && document.body.removeChild(r),
              document.removeEventListener("mousemove", d),
              document.removeEventListener("mouseup", c),
              n((null == (e = t.current) ? void 0 : e.getBoundingClientRect().width) || 0),
              o());
          }, [n]),
          p = (0, rs.useCallback)(
            (e) => {
              var r;
              ((s.current = !0),
                (l.current = e.clientX),
                (u.current =
                  (null == (r = t.current) ? void 0 : r.getBoundingClientRect().width) || 0),
                (document.body.style.cursor = "col-resize"),
                (document.body.style.userSelect = "none"));
              let n = document.createElement("div");
              ((n.id = "resize-overlay"),
                n.setAttribute("data-resize-overlay", ""),
                document.body.appendChild(n),
                document.addEventListener("mousemove", d),
                document.addEventListener("mouseup", c),
                e.preventDefault());
            },
            [e, d, c]
          );
        return (0, rX.jsx)("div", { ref: a, className: pt({ [e]: !0 }), onMouseDown: p });
      };
    rk();
    var pn = lG("Sidebar", {
        Sidebar: "_Sidebar_1xksb_1",
        "Sidebar--left": "_Sidebar--left_1xksb_8",
        "Sidebar--right": "_Sidebar--right_1xksb_14",
        "Sidebar-resizeHandle": "_Sidebar-resizeHandle_1xksb_20",
      }),
      pi = ({
        position: e,
        sidebarRef: t,
        isVisible: r,
        onResize: n,
        onResizeEnd: i,
        children: o,
      }) =>
        r
          ? (0, rX.jsxs)(rX.Fragment, {
              children: [
                (0, rX.jsx)("div", { ref: t, className: pn({ [e]: !0 }), children: o }),
                (0, rX.jsx)("div", {
                  className: `${pn("resizeHandle")}`,
                  children: (0, rX.jsx)(pr, {
                    position: e,
                    sidebarRef: t,
                    onResize: n,
                    onResizeEnd: i,
                  }),
                }),
              ],
            })
          : null;
    function po(e, t) {
      let [r, n] = (0, rs.useState)(null),
        i = (0, rs.useRef)(null),
        o = uc((t) => ("left" === e ? t.state.ui.leftSideBarWidth : t.state.ui.rightSideBarWidth));
      return (
        (0, rs.useEffect)(() => {
          if ("u" > typeof window && !o)
            try {
              let r = localStorage.getItem("puck-sidebar-widths");
              if (r) {
                let n = JSON.parse(r)[e],
                  i = "left" === e ? "leftSideBarWidth" : "rightSideBarWidth";
                n && t({ type: "setUi", ui: { [i]: n } });
              }
            } catch (t) {
              console.error(`Failed to load ${e} sidebar width from localStorage`, t);
            }
        }, [t, e, o]),
        (0, rs.useEffect)(() => {
          void 0 !== o && n(o);
        }, [o]),
        {
          width: r,
          setWidth: n,
          sidebarRef: i,
          handleResizeEnd: (0, rs.useCallback)(
            (r) => {
              t({
                type: "setUi",
                ui: { ["left" === e ? "leftSideBarWidth" : "rightSideBarWidth"]: r },
              });
              let n = {};
              try {
                let e = localStorage.getItem("puck-sidebar-widths");
                n = e ? JSON.parse(e) : {};
              } catch (t) {
                console.error(`Failed to save ${e} sidebar width to localStorage`, t);
              } finally {
                localStorage.setItem(
                  "puck-sidebar-widths",
                  JSON.stringify(rp(rw({}, n), rf({ [e]: r })))
                );
              }
              window.dispatchEvent(
                new CustomEvent("viewportchange", { bubbles: !0, cancelable: !1 })
              );
            },
            [t, e]
          ),
        }
      );
    }
    rk();
    var pa = lG("Puck", ck),
      ps = lG("PuckLayout", ck),
      pl = () => {
        let e = uc((e) => {
          var t, r;
          return e.selectedItem
            ? null !=
              (r = null == (t = e.config.components[e.selectedItem.type]) ? void 0 : t.label)
              ? r
              : e.selectedItem.type.toString()
            : "Page";
        });
        return (0, rX.jsx)(cj, {
          noPadding: !0,
          noBorderTop: !0,
          showBreadcrumbs: !0,
          title: e,
          children: (0, rX.jsx)(cO, {}),
        });
      },
      pu = (0, rs.createContext)({});
    function pd(e) {
      return (0, rX.jsx)(pu.Provider, { value: e, children: e.children });
    }
    var pc = () => (0, rs.useContext)(pu);
    function pp({ children: e }) {
      let {
          config: t,
          data: r,
          ui: n,
          onChange: i,
          permissions: o = {},
          plugins: a,
          overrides: s,
          viewports: l = rA,
          iframe: u,
          initialHistory: d,
          metadata: c,
          onAction: p,
          fieldTransforms: h,
        } = pc(),
        f = (0, rs.useMemo)(() => rw({ enabled: !0, waitForStyles: !0 }, u), [u]),
        [g] = (0, rs.useState)(() => {
          var e, i, o, a, s, u, d, c, p;
          let h,
            g,
            m,
            v,
            y,
            b,
            w = rw(rw({}, rz.ui), n),
            _ = {};
          if ("u" > typeof window) {
            let t, r, d, c;
            window.matchMedia("(max-width: 638px)").matches &&
              (_ = rp(rw({}, _), rf({ leftSideBarVisible: !1, rightSideBarVisible: !1 })));
            let p = window.innerWidth,
              h = Object.entries(l)
                .map(([e, t]) => ({ key: e, diff: Math.abs(p - t.width) }))
                .sort((e, t) => (e.diff > t.diff ? 1 : -1))[0].key;
            f.enabled &&
              ((d = rw({}, _)),
              (c = {
                viewports:
                  ((t = rw({}, w.viewports)),
                  (r = {
                    current: rp(
                      rw({}, w.viewports.current),
                      rf({
                        height:
                          (null ==
                          (i = null == (e = null == n ? void 0 : n.viewports) ? void 0 : e.current)
                            ? void 0
                            : i.height) ||
                          (null == (o = l[h]) ? void 0 : o.height) ||
                          "auto",
                        width:
                          (null ==
                          (s = null == (a = null == n ? void 0 : n.viewports) ? void 0 : a.current)
                            ? void 0
                            : s.width) || (null == (u = l[h]) ? void 0 : u.width),
                      })
                    ),
                  }),
                  rp(t, rf(r))),
              }),
              (_ = rp(d, rf(c))));
          }
          !(Object.keys((null == r ? void 0 : r.root) || {}).length > 0) ||
            (null == (d = null == r ? void 0 : r.root) ? void 0 : d.props) ||
            console.warn(
              "Warning: Defining props on `root` is deprecated. Please use `root.props`, or republish this page to migrate automatically."
            );
          let j =
              (null == (c = null == r ? void 0 : r.root) ? void 0 : c.props) ||
              (null == r ? void 0 : r.root) ||
              {},
            k = rw(rw({}, null == (p = t.root) ? void 0 : p.defaultProps), j);
          return rR(
            ((y = rw({}, rz)),
            (b = {
              data:
                ((h = rw({}, r)),
                (g = {
                  root: rp(rw({}, null == r ? void 0 : r.root), rf({ props: k })),
                  content: r.content || [],
                }),
                rp(h, rf(g))),
              ui:
                ((m = rw(rw({}, w), _)),
                (v = {
                  componentList: t.categories
                    ? Object.entries(t.categories).reduce(
                        (e, [t, r]) =>
                          rp(
                            rw({}, e),
                            rf({
                              [t]: {
                                title: r.title,
                                components: r.components,
                                expanded: r.defaultExpanded,
                                visible: r.visible,
                              },
                            })
                          ),
                        {}
                      )
                    : {},
                }),
                rp(m, rf(v))),
            }),
            rp(y, rf(b))),
            t
          );
        }),
        { appendData: m = !0 } = d || {},
        [v] = (0, rs.useState)(
          [...((null == d ? void 0 : d.histories) || []), ...(m ? [{ state: g }] : [])].map((e) => {
            let r = rw(rw({}, g), e.state);
            return (e.state.indexes || (r = rR(r, t)), rp(rw({}, e), rf({ state: r })));
          })
        ),
        y = (null == d ? void 0 : d.index) || v.length - 1,
        b = v[y].state,
        w = (({ overrides: e, plugins: t }) =>
          (0, rs.useMemo)(
            () =>
              (({ overrides: e, plugins: t }) => {
                let r = rw({}, e);
                return (
                  null == t ||
                    t.forEach((e) => {
                      e.overrides &&
                        Object.keys(e.overrides).forEach((t) => {
                          var n;
                          if (!(null == (n = e.overrides) ? void 0 : n[t])) return;
                          if ("fieldTypes" === t) {
                            let t = e.overrides.fieldTypes;
                            Object.keys(t).forEach((e) => {
                              r.fieldTypes = r.fieldTypes || {};
                              let n = r.fieldTypes[e];
                              r.fieldTypes[e] = (r) =>
                                t[e](rp(rw({}, r), rf({ children: n ? n(r) : r.children })));
                            });
                            return;
                          }
                          let i = r[t];
                          r[t] = (r) =>
                            e.overrides[t](rp(rw({}, r), rf({ children: i ? i(r) : r.children })));
                        });
                    }),
                  r
                );
              })({ overrides: e, plugins: t }),
            [t, e]
          ))({ overrides: s, plugins: a }),
        _ = (0, rs.useMemo)(() => {
          let e = (a || []).reduce((e, t) => rw(rw({}, e), t.fieldTransforms), {});
          return rw(rw({}, e), h);
        }, [h, a]),
        j = (0, rs.useCallback)(
          (e) => ({
            state: e,
            config: t,
            plugins: a || [],
            overrides: w,
            viewports: l,
            iframe: f,
            onAction: p,
            metadata: c,
            fieldTransforms: _,
          }),
          [b, t, a, w, l, f, p, c, _]
        ),
        [k] = (0, rs.useState)(() => uu(j(b)));
      ((0, rs.useEffect)(() => {}, [k]),
        (0, rs.useEffect)(() => {
          let e = k.getState().state;
          k.setState(rw({}, j(e)));
        }, [t, a, w, l, f, p, c]),
        (function (e, { histories: t, index: r, initialAppState: n }) {
          (0, rs.useEffect)(
            () =>
              e.setState({
                history: rp(
                  rw({}, e.getState().history),
                  rf({ histories: t, index: r, initialAppState: n })
                ),
              }),
            [t, r, n]
          );
          let i = () => {
              e.getState().history.back();
            },
            o = () => {
              e.getState().history.forward();
            };
          (uo({ meta: !0, z: !0 }, i),
            uo({ meta: !0, shift: !0, z: !0 }, o),
            uo({ meta: !0, y: !0 }, o),
            uo({ ctrl: !0, z: !0 }, i),
            uo({ ctrl: !0, shift: !0, z: !0 }, o),
            uo({ ctrl: !0, y: !0 }, o));
        })(k, { histories: v, index: y, initialAppState: b }));
      let S = (0, rs.useRef)(null);
      ((0, rs.useEffect)(() => {
        k.subscribe(
          (e) => e.state.data,
          (e) => {
            i && ((0, ru.default)(e, S.current) || (i(e), (S.current = e)));
          }
        );
      }, []),
        (0, rs.useEffect)(() => {
          let { permissions: e } = k.getState(),
            { globalPermissions: t } = e;
          (k.setState({ permissions: rp(rw({}, e), rf({ globalPermissions: rw(rw({}, t), o) })) }),
            e.resolvePermissions());
        }, [o]),
        (0, rs.useEffect)(
          () =>
            k.subscribe(
              (e) => e.state.data,
              () => {
                k.getState().permissions.resolvePermissions();
              }
            ),
          []
        ),
        (0, rs.useEffect)(
          () =>
            k.subscribe(
              (e) => e.config,
              () => {
                k.getState().permissions.resolvePermissions();
              }
            ),
          []
        ));
      let I = ((e) => {
        let [t] = (0, rs.useState)(() => r2(() => cb(cw(e.getState()))));
        return (
          (0, rs.useEffect)(
            () =>
              e.subscribe(
                (e) => cw(e),
                (e) => {
                  t.setState(cb(e));
                }
              ),
            []
          ),
          t
        );
      })(k);
      return (
        (0, rs.useEffect)(() => {
          let { resolveAndCommitData: e } = k.getState();
          e();
        }, []),
        (0, rX.jsx)(ud.Provider, {
          value: k,
          children: (0, rX.jsx)(cx.Provider, { value: I, children: e }),
        })
      );
    }
    function ph({ children: e }) {
      let t,
        r,
        { iframe: n, dnd: i, initialHistory: o } = pc(),
        a = (0, rs.useMemo)(() => rw({ enabled: !0, waitForStyles: !0 }, n), [n]);
      ((e, t) => {
        let [r, n] = (0, rs.useState)();
        return (
          (0, rs.useEffect)(() => {
            n(document.createElement("style"));
          }, []),
          (0, rs.useEffect)(() => {
            var n;
            if (r && "u" > typeof window) {
              if (((r.innerHTML = e), t)) {
                let e = d1();
                null == (n = null == e ? void 0 : e.head) || n.appendChild(r);
              }
              document.head.appendChild(r);
            }
          }, [t, r])
        );
      })("", a.enabled);
      let s = uc((e) => e.dispatch),
        l = uc((e) => e.state.ui.leftSideBarVisible),
        u = uc((e) => e.state.ui.rightSideBarVisible),
        { width: d, setWidth: c, sidebarRef: p, handleResizeEnd: h } = po("left", s),
        { width: f, setWidth: g, sidebarRef: m, handleResizeEnd: v } = po("right", s);
      (0, rs.useEffect)(() => {
        window.matchMedia("(min-width: 638px)").matches ||
          s({ type: "setUi", ui: { leftSideBarVisible: !1, rightSideBarVisible: !1 } });
        let e = () => {
          window.matchMedia("(min-width: 638px)").matches ||
            s({
              type: "setUi",
              ui: (e) => rw(rw({}, e), e.rightSideBarVisible ? { leftSideBarVisible: !1 } : {}),
            });
        };
        return (
          window.addEventListener("resize", e),
          () => {
            window.removeEventListener("resize", e);
          }
        );
      }, []);
      let y = uc((e) => e.overrides),
        b = (0, rs.useMemo)(() => y.puck || c3, [y]),
        [w, _] = (0, rs.useState)(!1);
      (0, rs.useEffect)(() => {
        _(!0);
      }, []);
      let j = uc((e) => "READY" === e.status);
      ((0, rs.useEffect)(() => ui(document), []),
        (0, rs.useEffect)(() => {
          if (j && a.enabled) {
            let e = d1();
            if (e) return ui(e);
          }
        }, [j, a.enabled]),
        (t = up()),
        uo(
          { meta: !0, i: !0 },
          (r = (0, rs.useCallback)(() => {
            (0, t.getState().dispatch)({
              type: "setUi",
              ui: (e) => ({ previewMode: "edit" === e.previewMode ? "interactive" : "edit" }),
            });
          }, [t]))
        ),
        uo({ ctrl: !0, i: !0 }, r));
      let k = {};
      return (
        d && (k["--puck-user-left-side-bar-width"] = `${d}px`),
        f && (k["--puck-user-right-side-bar-width"] = `${f}px`),
        (0, rX.jsxs)("div", {
          className: `Puck ${pa()}`,
          children: [
            (0, rX.jsx)(d8, {
              disableAutoScroll: null == i ? void 0 : i.disableAutoScroll,
              children: (0, rX.jsx)(b, {
                children:
                  e ||
                  (0, rX.jsx)(c2, {
                    children: (0, rX.jsx)("div", {
                      className: ps({ leftSideBarVisible: l, mounted: w, rightSideBarVisible: u }),
                      children: (0, rX.jsxs)("div", {
                        className: ps("inner"),
                        style: k,
                        children: [
                          (0, rX.jsx)(pe, {}),
                          (0, rX.jsxs)(pi, {
                            position: "left",
                            sidebarRef: p,
                            isVisible: l,
                            onResize: c,
                            onResizeEnd: h,
                            children: [
                              (0, rX.jsx)(cj, {
                                title: "Components",
                                noBorderTop: !0,
                                children: (0, rX.jsx)(cA, {}),
                              }),
                              (0, rX.jsx)(cj, { title: "Outline", children: (0, rX.jsx)(cq, {}) }),
                            ],
                          }),
                          (0, rX.jsx)(c6, {}),
                          (0, rX.jsx)(pi, {
                            position: "right",
                            sidebarRef: m,
                            isVisible: u,
                            onResize: g,
                            onResizeEnd: v,
                            children: (0, rX.jsx)(pl, {}),
                          }),
                        ],
                      }),
                    }),
                  }),
              }),
            }),
            (0, rX.jsx)("div", { id: "puck-portal-root", className: pa("portal") }),
          ],
        })
      );
    }
    function pf(e) {
      let t, r;
      return (0, rX.jsx)(
        pd,
        ((t = rw({}, e)),
        (r = {
          children: (0, rX.jsx)(pp, rp(rw({}, e), rf({ children: (0, rX.jsx)(ph, rw({}, e)) }))),
        }),
        rp(t, rf(r)))
      );
    }
    ((pf.Components = cA),
      (pf.Fields = cO),
      (pf.Outline = cq),
      (pf.Preview = cF),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk(),
      rk());
    let pg = {
      root: { props: {} },
      content: [
        {
          type: "Hero",
          props: {
            title: "Launch your next campaign in minutes.",
            subtitle: "Use this editor to rapidly prototype and publish marketing sections.",
            ctaLabel: "Open dashboard",
            ctaUrl: "https://app.boopy.dev/login",
          },
        },
      ],
    };
    e.s(
      [
        "default",
        0,
        function () {
          let [e, t] = (0, rs.useState)("edit"),
            [r, n] = (0, rs.useState)(pg),
            i = (0, rs.useMemo)(
              () => ({
                components: {
                  Hero: {
                    fields: {
                      title: { type: "text" },
                      subtitle: { type: "textarea" },
                      ctaLabel: { type: "text" },
                      ctaUrl: { type: "text" },
                    },
                    defaultProps: {
                      title: "Launch your next campaign in minutes.",
                      subtitle:
                        "Use this editor to rapidly prototype and publish marketing sections.",
                      ctaLabel: "Open dashboard",
                      ctaUrl: "https://app.boopy.dev/login",
                    },
                    render: (e) =>
                      (0, ra.jsxs)("section", {
                        className: "card",
                        style: { margin: "1rem 0" },
                        children: [
                          (0, ra.jsx)("h2", {
                            style: { marginTop: 0 },
                            children: e.title ?? "Landing section",
                          }),
                          (0, ra.jsx)("p", {
                            style: { color: "#4d4d4d", lineHeight: 1.6 },
                            children: e.subtitle ?? "",
                          }),
                          (0, ra.jsx)("a", {
                            className: "btn btn-primary",
                            href: e.ctaUrl ?? "#",
                            children: e.ctaLabel ?? "Learn more",
                          }),
                        ],
                      }),
                  },
                },
              }),
              []
            );
          return (0, ra.jsx)("main", {
            className: "editor-page",
            children: (0, ra.jsxs)("div", {
              className: "editor-shell",
              children: [
                (0, ra.jsxs)("div", {
                  style: { display: "flex", gap: "0.6rem", marginBottom: "0.8rem" },
                  children: [
                    (0, ra.jsx)("button", {
                      className: "btn btn-outline",
                      onClick: () => t("edit"),
                      type: "button",
                      children: "Edit",
                    }),
                    (0, ra.jsx)("button", {
                      className: "btn btn-outline",
                      onClick: () => t("preview"),
                      type: "button",
                      children: "Preview",
                    }),
                    (0, ra.jsx)("button", {
                      className: "btn btn-outline",
                      onClick: () => navigator.clipboard.writeText(JSON.stringify(r, null, 2)),
                      type: "button",
                      children: "Copy JSON",
                    }),
                  ],
                }),
                "edit" === e
                  ? (0, ra.jsx)(pf, { config: i, data: r, onPublish: (e) => n(e) })
                  : (0, ra.jsx)(cy, { config: i, data: r }),
              ],
            }),
          });
        },
      ],
      34451
    );
  },
]);
