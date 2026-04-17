module.exports = [
  71563,
  (a, b, c) => {
    function d(a) {
      return (
        a &&
        a.constructor &&
        "function" == typeof a.constructor.isBuffer &&
        a.constructor.isBuffer(a)
      );
    }
    function e(a) {
      return a;
    }
    function f(a, b) {
      let c = (b = b || {}).delimiter || ".",
        f = b.maxDepth,
        g = b.transformKey || e,
        h = {};
      return (
        !(function a(e, i, j) {
          ((j = j || 1),
            Object.keys(e).forEach(function (k) {
              let l = e[k],
                m = b.safe && Array.isArray(l),
                n = Object.prototype.toString.call(l),
                o = d(l),
                p = i ? i + c + g(k) : g(k);
              if (
                !m &&
                !o &&
                ("[object Object]" === n || "[object Array]" === n) &&
                Object.keys(l).length &&
                (!b.maxDepth || j < f)
              )
                return a(l, p, j + 1);
              h[p] = l;
            }));
        })(a),
        h
      );
    }
    ((b.exports = f),
      (f.flatten = f),
      (f.unflatten = function a(b, c) {
        let g = (c = c || {}).delimiter || ".",
          h = c.overwrite || !1,
          i = c.transformKey || e,
          j = {};
        if (d(b) || "[object Object]" !== Object.prototype.toString.call(b)) return b;
        function k(a) {
          let b = Number(a);
          return isNaN(b) || -1 !== a.indexOf(".") || c.object ? a : b;
        }
        return (
          Object.keys(
            (b = Object.keys(b).reduce(function (a, d) {
              var e, h;
              let i,
                j = Object.prototype.toString.call(b[d]);
              return ("[object Object]" === j || "[object Array]" === j) &&
                ((h = b[d]),
                (i = Object.prototype.toString.call(h)),
                h &&
                  ("[object Array]" === i
                    ? h.length
                    : "[object Object]" === i
                      ? Object.keys(h).length
                      : !void 0))
                ? Object.keys((e = f(b[d], c))).reduce(function (a, b) {
                    return ((a[d + g + b] = e[b]), a);
                  }, a)
                : ((a[d] = b[d]), a);
            }, {}))
          ).forEach(function (d) {
            let e = d.split(g).map(i),
              f = k(e.shift()),
              l = k(e[0]),
              m = j;
            for (; void 0 !== l; ) {
              if ("__proto__" === f) return;
              let a = Object.prototype.toString.call(m[f]),
                b = "[object Object]" === a || "[object Array]" === a;
              if (!h && !b && void 0 !== m[f]) return;
              (((!h || b) && (h || null != m[f])) ||
                (m[f] = "number" != typeof l || c.object ? {} : []),
                (m = m[f]),
                e.length > 0 && ((f = k(e.shift())), (l = k(e[0]))));
            }
            m[f] = a(b[d], c);
          }),
          j
        );
      }));
  },
  94939,
  (a, b, c) => {
    "use strict";
    b.exports = function a(b, c) {
      if (b === c) return !0;
      if (b && c && "object" == typeof b && "object" == typeof c) {
        if (b.constructor !== c.constructor) return !1;
        if (Array.isArray(b)) {
          if ((d = b.length) != c.length) return !1;
          for (e = d; 0 != e--; ) if (!a(b[e], c[e])) return !1;
          return !0;
        }
        if (b.constructor === RegExp) return b.source === c.source && b.flags === c.flags;
        if (b.valueOf !== Object.prototype.valueOf) return b.valueOf() === c.valueOf();
        if (b.toString !== Object.prototype.toString) return b.toString() === c.toString();
        if ((d = (f = Object.keys(b)).length) !== Object.keys(c).length) return !1;
        for (e = d; 0 != e--; ) if (!Object.prototype.hasOwnProperty.call(c, f[e])) return !1;
        for (e = d; 0 != e--; ) {
          var d,
            e,
            f,
            g = f[e];
          if (!a(b[g], c[g])) return !1;
        }
        return !0;
      }
      return b != b && c != c;
    };
  },
  54799,
  (a, b, c) => {
    b.exports = a.x("crypto", () => require("crypto"));
  },
  91023,
  (a, b, c) => {
    "use strict";
    var d = a.r(54799);
    function e(a, b) {
      return (
        (b = h(a, b)),
        (function (a, b) {
          if (
            (void 0 ===
              (c = "passthrough" !== b.algorithm ? d.createHash(b.algorithm) : new k()).write &&
              ((c.write = c.update), (c.end = c.update)),
            j(b, c).dispatch(a),
            c.update || c.end(""),
            c.digest)
          )
            return c.digest("buffer" === b.encoding ? void 0 : b.encoding);
          var c,
            e = c.read();
          return "buffer" === b.encoding ? e : e.toString(b.encoding);
        })(a, b)
      );
    }
    (((c = b.exports = e).sha1 = function (a) {
      return e(a);
    }),
      (c.keys = function (a) {
        return e(a, { excludeValues: !0, algorithm: "sha1", encoding: "hex" });
      }),
      (c.MD5 = function (a) {
        return e(a, { algorithm: "md5", encoding: "hex" });
      }),
      (c.keysMD5 = function (a) {
        return e(a, { algorithm: "md5", encoding: "hex", excludeValues: !0 });
      }));
    var f = d.getHashes ? d.getHashes().slice() : ["sha1", "md5"];
    f.push("passthrough");
    var g = ["buffer", "hex", "binary", "base64"];
    function h(a, b) {
      var c = {};
      if (
        ((c.algorithm = (b = b || {}).algorithm || "sha1"),
        (c.encoding = b.encoding || "hex"),
        (c.excludeValues = !!b.excludeValues),
        (c.algorithm = c.algorithm.toLowerCase()),
        (c.encoding = c.encoding.toLowerCase()),
        (c.ignoreUnknown = !0 === b.ignoreUnknown),
        (c.respectType = !1 !== b.respectType),
        (c.respectFunctionNames = !1 !== b.respectFunctionNames),
        (c.respectFunctionProperties = !1 !== b.respectFunctionProperties),
        (c.unorderedArrays = !0 === b.unorderedArrays),
        (c.unorderedSets = !1 !== b.unorderedSets),
        (c.unorderedObjects = !1 !== b.unorderedObjects),
        (c.replacer = b.replacer || void 0),
        (c.excludeKeys = b.excludeKeys || void 0),
        void 0 === a)
      )
        throw Error("Object argument required.");
      for (var d = 0; d < f.length; ++d)
        f[d].toLowerCase() === c.algorithm.toLowerCase() && (c.algorithm = f[d]);
      if (-1 === f.indexOf(c.algorithm))
        throw Error(
          'Algorithm "' + c.algorithm + '"  not supported. supported values: ' + f.join(", ")
        );
      if (-1 === g.indexOf(c.encoding) && "passthrough" !== c.algorithm)
        throw Error(
          'Encoding "' + c.encoding + '"  not supported. supported values: ' + g.join(", ")
        );
      return c;
    }
    function i(a) {
      return (
        "function" == typeof a &&
        null !=
          /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(
            Function.prototype.toString.call(a)
          )
      );
    }
    function j(a, b, c) {
      c = c || [];
      var d = function (a) {
        return b.update ? b.update(a, "utf8") : b.write(a, "utf8");
      };
      return {
        dispatch: function (b) {
          a.replacer && (b = a.replacer(b));
          var c = typeof b;
          return (null === b && (c = "null"), this["_" + c](b));
        },
        _object: function (b) {
          var e = Object.prototype.toString.call(b),
            f = /\[object (.*)\]/i.exec(e);
          f = (f = f ? f[1] : "unknown:[" + e + "]").toLowerCase();
          var g = null;
          if ((g = c.indexOf(b)) >= 0) return this.dispatch("[CIRCULAR:" + g + "]");
          if ((c.push(b), "u" > typeof Buffer && Buffer.isBuffer && Buffer.isBuffer(b)))
            return (d("buffer:"), d(b));
          if ("object" !== f && "function" !== f && "asyncfunction" !== f)
            if (this["_" + f]) this["_" + f](b);
            else if (a.ignoreUnknown) return d("[" + f + "]");
            else throw Error('Unknown object type "' + f + '"');
          else {
            var h = Object.keys(b);
            (a.unorderedObjects && (h = h.sort()),
              !1 === a.respectType ||
                i(b) ||
                h.splice(0, 0, "prototype", "__proto__", "constructor"),
              a.excludeKeys &&
                (h = h.filter(function (b) {
                  return !a.excludeKeys(b);
                })),
              d("object:" + h.length + ":"));
            var j = this;
            return h.forEach(function (c) {
              (j.dispatch(c), d(":"), a.excludeValues || j.dispatch(b[c]), d(","));
            });
          }
        },
        _array: function (b, e) {
          e = void 0 !== e ? e : !1 !== a.unorderedArrays;
          var f = this;
          if ((d("array:" + b.length + ":"), !e || b.length <= 1))
            return b.forEach(function (a) {
              return f.dispatch(a);
            });
          var g = [],
            h = b.map(function (b) {
              var d = new k(),
                e = c.slice();
              return (
                j(a, d, e).dispatch(b),
                (g = g.concat(e.slice(c.length))),
                d.read().toString()
              );
            });
          return ((c = c.concat(g)), h.sort(), this._array(h, !1));
        },
        _date: function (a) {
          return d("date:" + a.toJSON());
        },
        _symbol: function (a) {
          return d("symbol:" + a.toString());
        },
        _error: function (a) {
          return d("error:" + a.toString());
        },
        _boolean: function (a) {
          return d("bool:" + a.toString());
        },
        _string: function (a) {
          (d("string:" + a.length + ":"), d(a.toString()));
        },
        _function: function (b) {
          (d("fn:"),
            i(b) ? this.dispatch("[native]") : this.dispatch(b.toString()),
            !1 !== a.respectFunctionNames && this.dispatch("function-name:" + String(b.name)),
            a.respectFunctionProperties && this._object(b));
        },
        _number: function (a) {
          return d("number:" + a.toString());
        },
        _xml: function (a) {
          return d("xml:" + a.toString());
        },
        _null: function () {
          return d("Null");
        },
        _undefined: function () {
          return d("Undefined");
        },
        _regexp: function (a) {
          return d("regex:" + a.toString());
        },
        _uint8array: function (a) {
          return (d("uint8array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _uint8clampedarray: function (a) {
          return (d("uint8clampedarray:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _int8array: function (a) {
          return (d("int8array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _uint16array: function (a) {
          return (d("uint16array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _int16array: function (a) {
          return (d("int16array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _uint32array: function (a) {
          return (d("uint32array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _int32array: function (a) {
          return (d("int32array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _float32array: function (a) {
          return (d("float32array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _float64array: function (a) {
          return (d("float64array:"), this.dispatch(Array.prototype.slice.call(a)));
        },
        _arraybuffer: function (a) {
          return (d("arraybuffer:"), this.dispatch(new Uint8Array(a)));
        },
        _url: function (a) {
          return d("url:" + a.toString(), "utf8");
        },
        _map: function (b) {
          d("map:");
          var c = Array.from(b);
          return this._array(c, !1 !== a.unorderedSets);
        },
        _set: function (b) {
          d("set:");
          var c = Array.from(b);
          return this._array(c, !1 !== a.unorderedSets);
        },
        _file: function (a) {
          return (d("file:"), this.dispatch([a.name, a.size, a.type, a.lastModfied]));
        },
        _blob: function () {
          if (a.ignoreUnknown) return d("[blob]");
          throw Error(
            'Hashing Blob objects is currently not supported\n(see https://github.com/puleos/object-hash/issues/26)\nUse "options.replacer" or "options.ignoreUnknown"\n'
          );
        },
        _domwindow: function () {
          return d("domwindow");
        },
        _bigint: function (a) {
          return d("bigint:" + a.toString());
        },
        _process: function () {
          return d("process");
        },
        _timer: function () {
          return d("timer");
        },
        _pipe: function () {
          return d("pipe");
        },
        _tcp: function () {
          return d("tcp");
        },
        _udp: function () {
          return d("udp");
        },
        _tty: function () {
          return d("tty");
        },
        _statwatcher: function () {
          return d("statwatcher");
        },
        _securecontext: function () {
          return d("securecontext");
        },
        _connection: function () {
          return d("connection");
        },
        _zlib: function () {
          return d("zlib");
        },
        _context: function () {
          return d("context");
        },
        _nodescript: function () {
          return d("nodescript");
        },
        _httpparser: function () {
          return d("httpparser");
        },
        _dataview: function () {
          return d("dataview");
        },
        _signal: function () {
          return d("signal");
        },
        _fsevent: function () {
          return d("fsevent");
        },
        _tlswrap: function () {
          return d("tlswrap");
        },
      };
    }
    function k() {
      return {
        buf: "",
        write: function (a) {
          this.buf += a;
        },
        end: function (a) {
          this.buf += a;
        },
        read: function () {
          return this.buf;
        },
      };
    }
    c.writeToStream = function (a, b, c) {
      return (void 0 === c && ((c = b), (b = {})), j((b = h(a, b)), c).dispatch(a));
    };
  },
  53587,
  (a) => {
    "use strict";
    let b, c, d, e, f, g, h, i, j, k, l, m, n;
    var o,
      p,
      q,
      r,
      s,
      t,
      u,
      v,
      w,
      y,
      z,
      A,
      B,
      C,
      D,
      E,
      F,
      G,
      H,
      I,
      J,
      K,
      L,
      M,
      N,
      O,
      P,
      Q,
      R,
      S,
      T,
      U,
      V,
      W,
      X,
      Y,
      Z,
      $,
      _,
      aa,
      ab,
      ac,
      ad,
      ae,
      af,
      ag,
      ah,
      ai,
      aj,
      ak,
      al,
      am,
      an,
      ao,
      ap,
      aq,
      ar,
      as,
      at,
      au,
      av,
      aw,
      ax,
      ay,
      az,
      aA,
      aB,
      aC,
      aD,
      aE,
      aF,
      aG,
      aH,
      aI,
      aJ,
      aK,
      aL,
      aM,
      aN,
      aO,
      aP,
      aQ,
      aR,
      aS,
      aT,
      aU,
      aV,
      aW,
      aX,
      aY,
      aZ,
      a$,
      a_,
      a0,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      ba,
      bb,
      bc,
      bd,
      be,
      bf,
      bg,
      bh,
      bi,
      bj,
      bk,
      bl,
      bm,
      bn,
      bo,
      bp,
      bq,
      br,
      bs,
      bt,
      bu,
      bv,
      bw,
      bx,
      by,
      bz,
      bA,
      bB,
      bC,
      bD,
      bE,
      bF,
      bG,
      bH,
      bI,
      bJ,
      bK,
      bL,
      bM,
      bN,
      bO,
      bP,
      bQ,
      bR,
      bS,
      bT,
      bU,
      bV,
      bW,
      bX,
      bY,
      bZ,
      b$,
      b_,
      b0,
      b1,
      b2,
      b3,
      b4,
      b5,
      b6,
      b7,
      b8,
      b9,
      ca,
      cb,
      cc,
      cd,
      ce,
      cf,
      cg,
      ch = a.i(87924),
      ci = a.i(72131),
      cj = a.i(71563),
      ck = a.i(94939),
      cl = Object.create,
      cm = Object.defineProperty,
      cn = Object.defineProperties,
      co = Object.getOwnPropertyDescriptor,
      cp = Object.getOwnPropertyDescriptors,
      cq = Object.getOwnPropertyNames,
      cr = Object.getOwnPropertySymbols,
      cs = Object.getPrototypeOf,
      ct = Object.prototype.hasOwnProperty,
      cu = Object.prototype.propertyIsEnumerable,
      cv = (a, b, c) =>
        b in a
          ? cm(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      cw = (a, b) => {
        for (var c in b || (b = {})) ct.call(b, c) && cv(a, c, b[c]);
        if (cr) for (var c of cr(b)) cu.call(b, c) && cv(a, c, b[c]);
        return a;
      },
      cx = (a, b) => {
        var c = {};
        for (var d in a) ct.call(a, d) && 0 > b.indexOf(d) && (c[d] = a[d]);
        if (null != a && cr)
          for (var d of cr(a)) 0 > b.indexOf(d) && cu.call(a, d) && (c[d] = a[d]);
        return c;
      },
      cy = (a, b, c) =>
        new Promise((d, e) => {
          var f = (a) => {
              try {
                h(c.next(a));
              } catch (a) {
                e(a);
              }
            },
            g = (a) => {
              try {
                h(c.throw(a));
              } catch (a) {
                e(a);
              }
            },
            h = (a) => (a.done ? d(a.value) : Promise.resolve(a.value).then(f, g));
          h((c = c.apply(a, b)).next());
        }),
      cz =
        ((d = { "../tsup-config/react-import.js"() {} }),
        function () {
          return (d && (e = (0, d[cq(d)[0]])((d = 0))), e);
        });
    (cz(), cz(), cz());
    var cA = (a, b) =>
        Object.keys(b).reduce((a, c) => ("slot" === b[c].type ? cw({ [c]: [] }, a) : a), a),
      cB = (a) => !!a && "function" == typeof a.then,
      cC = (a) => a.reduce((a, b) => cw(cw({}, a), b), {}),
      cD = ({
        value: a,
        fields: b,
        mappers: c,
        propKey: d = "",
        propPath: e = "",
        id: f = "",
        config: g,
        recurseSlots: h = !1,
      }) => {
        var i, j, k;
        let l = null == (i = b[d]) ? void 0 : i.type,
          m = c[l];
        if (m && "slot" === l) {
          let i = a || [],
            j = h
              ? i.map((a) => {
                  var b;
                  let d = g.components[a.type];
                  if (!d) throw Error(`Could not find component config for ${a.type}`);
                  let e = null != (b = d.fields) ? b : {};
                  return cD({
                    value: cn(cw({}, a), cp({ props: cA(a.props, e) })),
                    fields: e,
                    mappers: c,
                    id: a.props.id,
                    config: g,
                    recurseSlots: h,
                  });
                })
              : i;
          return j.some(cB)
            ? Promise.all(j)
            : m({ value: j, parentId: f, propName: e, field: b[d], propPath: e });
        }
        if (m && b[d]) return m({ value: a, parentId: f, propName: d, field: b[d], propPath: e });
        if (a && "object" == typeof a)
          if (!Array.isArray(a))
            return "$$typeof" in a
              ? a
              : cE({
                  value: a,
                  fields:
                    (null == (k = b[d]) ? void 0 : k.type) === "object" ? b[d].objectFields : b,
                  mappers: c,
                  id: f,
                  getPropPath: (a) => `${e}.${a}`,
                  config: g,
                  recurseSlots: h,
                });
          else {
            let i = (null == (j = b[d]) ? void 0 : j.type) === "array" ? b[d].arrayFields : null;
            if (!i) return a;
            let k = a.map((a, b) =>
              cD({
                value: a,
                fields: i,
                mappers: c,
                propKey: d,
                propPath: `${e}[${b}]`,
                id: f,
                config: g,
                recurseSlots: h,
              })
            );
            return k.some(cB) ? Promise.all(k) : k;
          }
        return a;
      },
      cE = ({
        value: a,
        fields: b,
        mappers: c,
        id: d,
        getPropPath: e,
        config: f,
        recurseSlots: g,
      }) => {
        let h = Object.entries(a).map(([a, h]) => {
          let i = cD({
            value: h,
            fields: b,
            mappers: c,
            propKey: a,
            propPath: e(a),
            id: d,
            config: f,
            recurseSlots: g,
          });
          return cB(i) ? i.then((b) => ({ [a]: b })) : { [a]: i };
        }, {});
        return h.some(cB) ? Promise.all(h).then(cC) : cC(h);
      };
    function cF(a, b, c, d = !1) {
      var e, f, g, h, i;
      let j = "type" in a ? a.type : "root",
        k = "root" === j ? c.root : null == (e = c.components) ? void 0 : e[j],
        l = cE({
          value: cA(
            null != (f = a.props) ? f : {},
            null != (g = null == k ? void 0 : k.fields) ? g : {}
          ),
          fields: null != (h = null == k ? void 0 : k.fields) ? h : {},
          mappers: b,
          id: a.props && null != (i = a.props.id) ? i : "root",
          getPropPath: (a) => a,
          config: c,
          recurseSlots: d,
        });
      return cB(l)
        ? l.then((b) => cn(cw({}, a), cp({ props: b })))
        : cn(cw({}, a), cp({ props: l }));
    }
    function cG(a, b, c) {
      var d, e;
      let f = (a) =>
        cF(
          a,
          {
            slot: ({ value: a, parentId: b, propName: d }) => {
              var e;
              return null != (e = c(a, { parentId: b, propName: d })) ? e : a;
            },
          },
          b,
          !0
        );
      if ("props" in a) return f(a);
      let g = null != (d = a.zones) ? d : {},
        h = a.content.map(f);
      return {
        root: f(a.root),
        content: null != (e = c(h, { parentId: "root", propName: "default-zone" })) ? e : h,
        zones: Object.keys(g).reduce((a, b) => cn(cw({}, a), cp({ [b]: g[b].map(f) })), {}),
      };
    }
    (cz(), cz(), cz());
    var cH = [
        { width: 360, height: "auto", icon: "Smartphone", label: "Small" },
        { width: 768, height: "auto", icon: "Tablet", label: "Medium" },
        { width: 1280, height: "auto", icon: "Monitor", label: "Large" },
      ],
      cI = {
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
            current: { width: cH[0].width, height: cH[0].height || "auto" },
            options: [],
            controlsVisible: !0,
          },
          field: { focus: null },
        },
        indexes: { nodes: {}, zones: {} },
      };
    (cz(), cz(), cz(), cz());
    var cJ = "root",
      cK = "default-zone",
      cL = `${cJ}:${cK}`;
    (cz(), cz());
    var { flatten: cM, unflatten: cN } = cj.default;
    function cO(a, b, c = (a) => a, d = (a) => a) {
      var e;
      let f = {},
        g = {},
        h = {},
        i = (a, b, d, e, f) => {
          var h;
          let [i] = b.split(":"),
            k = (null != (h = c(d, b, e)) ? h : d) || [],
            [l, m] = b.split(":"),
            n = `${f || i}:${m}`,
            o = k.map((b, c) => j(b, [...a, n], c));
          return ((g[n] = { contentIds: o.map((a) => a.props.id), type: e }), [n, o]);
        },
        j = (c, e, g) => {
          var j, k;
          let l = d(c, e, g);
          if (!l) return c;
          let m = l.props.id,
            n = cn(
              cw(
                {},
                cF(
                  l,
                  {
                    slot: ({ value: a, parentId: b, propPath: c }) => {
                      let [d, f] = i(e, `${b}:${c}`, a, "slot", b);
                      return f;
                    },
                  },
                  b
                ).props
              ),
              cp({ id: m })
            );
          (function (a, b, c, d = []) {
            Object.entries(b.zones || {}).forEach(([b, e]) => {
              let [f] = b ? (b && b.indexOf(":") > -1 ? b.split(":") : [cL, b]) : [];
              f === a.props.id && c(d, b, e);
            });
          })(
            c,
            a.data,
            (a, b, c) => {
              let [d, e] = i(a, b, c, "dropzone", m);
              f[d] = e;
            },
            e
          );
          let o = cn(cw({}, c), cp({ props: n })),
            p = e[e.length - 1],
            [q, r] = p ? p.split(":") : [null, ""];
          h[m] = {
            data: o,
            flatData:
              ((j = o),
              (k = b),
              cn(cw({}, j), cp({ props: cM(cF(j, { slot: () => null }, k).props) }))),
            path: e,
            parentId: q,
            zone: r,
          };
          let s = cn(cw({}, o), cp({ props: cw({}, o.props) }));
          return ("root" === n.id && (delete s.type, delete s.props.id), s);
        },
        k = a.data.zones || {},
        [l, m] = i([], cL, a.data.content, "root"),
        n = Object.keys(f);
      Object.keys(k || {}).forEach((a) => {
        let [b] = a.split(":");
        if (n.includes(a)) return;
        let [c, d] = i([cL], a, k[a], "dropzone", b);
        f[a] = d;
      }, f);
      let o = j(
          {
            type: "root",
            props: cn(
              cw({}, null != (e = a.data.root.props) ? e : a.data.root),
              cp({ id: "root" })
            ),
          },
          [],
          -1
        ),
        p = cn(cw({}, a.data.root), cp({ props: o.props }));
      return cn(
        cw({}, a),
        cp({
          data: { root: p, content: m, zones: cw(cw({}, a.data.zones), f) },
          indexes: { nodes: cw(cw({}, a.indexes.nodes), h), zones: cw(cw({}, a.indexes.zones), g) },
        })
      );
    }
    (cz(), cz(), cz(), cz(), cz());
    var cP = (a, b) =>
        a
          ? Object.keys(a.props || {}).reduce((c, d) => {
              let e = (null == a ? void 0 : a.props) || {},
                f = (null == b ? void 0 : b.props) || {};
              return cn(cw({}, c), cp({ [d]: !(0, ck.default)(f[d], e[d]) }));
            }, {})
          : {},
      cQ = {},
      cR = (a, b, ...c) =>
        cy(void 0, [a, b, ...c], function* (a, b, c = {}, d, e, f = "replace") {
          let g = "type" in a && "root" !== a.type ? b.components[a.type] : b.root,
            h = cw({}, a),
            i = (null == g ? void 0 : g.resolveData) && a.props,
            j = "id" in a.props ? a.props.id : "root";
          if (i) {
            let { item: b = null, resolved: e = {} } = cQ[j] || {};
            if ("force" !== f && a && (0, ck.default)(a, b)) return { node: e, didChange: !1 };
            let i = cP(a, b);
            d && d(a);
            let { props: k, readOnly: l = {} } = yield g.resolveData(a, {
              changed: i,
              lastData: b,
              metadata: cw(cw({}, c), g.metadata),
              trigger: f,
            });
            ((h.props = cw(cw({}, a.props), k)), Object.keys(l).length && (h.readOnly = l));
          }
          let k = yield cF(
            h,
            {
              slot: (a) =>
                cy(void 0, [a], function* ({ value: a }) {
                  return yield Promise.all(
                    a.map((a) =>
                      cy(void 0, null, function* () {
                        return (yield cR(a, b, c, d, e, f)).node;
                      })
                    )
                  );
                }),
            },
            b
          );
          return (
            i && e && e(h),
            (cQ[j] = { item: a, resolved: k }),
            { node: k, didChange: !(0, ck.default)(a, k) }
          );
        });
    (cz(), cz());
    var cS = (a, b) => {
      if (b === cL) return a;
      let c = cn(cw({}, a), cp({ zones: a.zones ? cw({}, a.zones) : {} }));
      return ((c.zones[b] = c.zones[b] || []), c);
    };
    function cT(a, b, c, d, e) {
      let f = (0, ci.useMemo)(
          () =>
            Object.keys(c).reduce((a, b) => {
              let f, g;
              return (
                (f = cw({}, a)),
                (g = {
                  [b]: (a) => {
                    var { parentId: f } = a,
                      g = cx(a, ["parentId"]);
                    let h = g.propPath.replace(/\[\d+\]/g, "[*]"),
                      i =
                        (null == d ? void 0 : d[g.propPath]) ||
                        (null == d ? void 0 : d[h]) ||
                        e ||
                        !1,
                      j = c[b];
                    return null == j
                      ? void 0
                      : j(cn(cw({}, g), cp({ isReadOnly: i, componentId: f })));
                  },
                }),
                cn(f, cp(g))
              );
            }, {}),
          [c, d, e]
        ),
        g = (0, ci.useMemo)(() => cF(b, f, a).props, [a, b, f]);
      return (0, ci.useMemo)(() => cw(cw({}, b.props), g), [b.props, g]);
    }
    (cz(), cz());
    var cU = (a, b = a) => ({
      slot: ({ value: c, propName: d, field: e, isReadOnly: f }) => {
        let g = f ? b : a;
        return (a) =>
          g(
            cn(
              cw(
                {
                  allow: (null == e ? void 0 : e.type) === "slot" ? e.allow : [],
                  disallow: (null == e ? void 0 : e.type) === "slot" ? e.disallow : [],
                },
                a
              ),
              cp({ zone: d, content: c })
            )
          );
      },
    });
    function cV(a, b, c, d = c, e, f) {
      return cT(a, b, cU(c, d), e, f);
    }
    (cz(), cz());
    var cW = (a) => (0, ch.jsx)(cY, cw({}, a)),
      cX = ({ config: a, item: b, metadata: c }) => {
        let d,
          e,
          f = a.components[b.type],
          g = cV(a, b, (b) => (0, ch.jsx)(cW, cn(cw({}, b), cp({ config: a, metadata: c }))));
        return (0, ch.jsx)(
          f.render,
          ((d = cw({}, g)),
          (e = { puck: cn(cw({}, g.puck), cp({ metadata: c || {} })) }),
          cn(d, cp(e)))
        );
      },
      cY = (0, ci.forwardRef)(function (
        { className: a, style: b, content: c, config: d, metadata: e },
        f
      ) {
        return (0, ch.jsx)("div", {
          className: a,
          style: b,
          ref: f,
          children: c.map((a) =>
            d.components[a.type]
              ? (0, ch.jsx)(cX, { config: d, item: a, metadata: e }, a.props.id)
              : null
          ),
        });
      }),
      cZ = ch,
      c$ = a.i(54799);
    let c_ = { randomUUID: c$.default.randomUUID },
      c0 = new Uint8Array(256),
      c1 = c0.length,
      c2 = [];
    for (let a = 0; a < 256; ++a) c2.push((a + 256).toString(16).slice(1));
    let c3 = function (a, b, c) {
        if (c_.randomUUID && !b && !a) return c_.randomUUID();
        let d =
          (a = a || {}).random ||
          (
            a.rng ||
            function () {
              return (
                c1 > c0.length - 16 && (c$.default.randomFillSync(c0), (c1 = 0)),
                c0.slice(c1, (c1 += 16))
              );
            }
          )();
        if (((d[6] = (15 & d[6]) | 64), (d[8] = (63 & d[8]) | 128), b)) {
          c = c || 0;
          for (let a = 0; a < 16; ++a) b[c + a] = d[a];
          return b;
        }
        return (function (a, b = 0) {
          return (
            c2[a[b + 0]] +
            c2[a[b + 1]] +
            c2[a[b + 2]] +
            c2[a[b + 3]] +
            "-" +
            c2[a[b + 4]] +
            c2[a[b + 5]] +
            "-" +
            c2[a[b + 6]] +
            c2[a[b + 7]] +
            "-" +
            c2[a[b + 8]] +
            c2[a[b + 9]] +
            "-" +
            c2[a[b + 10]] +
            c2[a[b + 11]] +
            c2[a[b + 12]] +
            c2[a[b + 13]] +
            c2[a[b + 14]] +
            c2[a[b + 15]]
          );
        })(d);
      },
      c4 = (a) => {
        let b,
          c = new Set(),
          d = (a, d) => {
            let e = "function" == typeof a ? a(b) : a;
            if (!Object.is(e, b)) {
              let a = b;
              ((b = (null != d ? d : "object" != typeof e || null === e)
                ? e
                : Object.assign({}, b, e)),
                c.forEach((c) => c(b, a)));
            }
          },
          e = () => b,
          f = {
            setState: d,
            getState: e,
            getInitialState: () => g,
            subscribe: (a) => (c.add(a), () => c.delete(a)),
          },
          g = (b = a(d, e, f));
        return f;
      },
      c5 = (a) => (a ? c4(a) : c4),
      c6 = (a) => a;
    function c7(a, b = c6) {
      let c = ci.default.useSyncExternalStore(
        a.subscribe,
        ci.default.useCallback(() => b(a.getState()), [a, b]),
        ci.default.useCallback(() => b(a.getInitialState()), [a, b])
      );
      return (ci.default.useDebugValue(c), c);
    }
    let c8 = (a) => {
        let b = c5(a),
          c = (a) => c7(b, a);
        return (Object.assign(c, b), c);
      },
      c9 = (a) => (a ? c8(a) : c8),
      da = (a) => (b, c, d) => {
        let e = d.subscribe;
        return (
          (d.subscribe = (a, b, c) => {
            let f = a;
            if (b) {
              let e = (null == c ? void 0 : c.equalityFn) || Object.is,
                g = a(d.getState());
              ((f = (c) => {
                let d = a(c);
                if (!e(g, d)) {
                  let a = g;
                  b((g = d), a);
                }
              }),
                (null == c ? void 0 : c.fireImmediately) && b(g, g));
            }
            return e(f);
          }),
          a(b, c, d)
        );
      },
      db = Symbol.for("preact-signals");
    function dc() {
      if (dh > 1) return void dh--;
      let a,
        b = !1,
        d = df;
      for (df = void 0; void 0 !== d; ) (d.S.v === d.v && (d.S.i = d.i), (d = d.o));
      for (; void 0 !== c; ) {
        let d = c;
        for (c = void 0, di++; void 0 !== d; ) {
          let c = d.u;
          if (((d.u = void 0), (d.f &= -3), !(8 & d.f) && dq(d)))
            try {
              d.c();
            } catch (c) {
              b || ((a = c), (b = !0));
            }
          d = c;
        }
      }
      if (((di = 0), dh--, b)) throw a;
    }
    function dd(a) {
      if (dh > 0) return a();
      ((dk = ++dj), dh++);
      try {
        return a();
      } finally {
        dc();
      }
    }
    function de(a) {
      let c = b;
      b = void 0;
      try {
        return a();
      } finally {
        b = c;
      }
    }
    let df,
      dg,
      dh = 0,
      di = 0,
      dj = 0,
      dk = 0,
      dl = 0;
    function dm(a) {
      if (void 0 === b) return;
      let c = a.n;
      return void 0 === c || c.t !== b
        ? ((c = { i: 0, S: a, p: b.s, n: void 0, t: b, e: void 0, x: void 0, r: c }),
          void 0 !== b.s && (b.s.n = c),
          (b.s = c),
          (a.n = c),
          32 & b.f && a.S(c),
          c)
        : -1 === c.i
          ? ((c.i = 0),
            void 0 !== c.n &&
              ((c.n.p = c.p),
              void 0 !== c.p && (c.p.n = c.n),
              (c.p = b.s),
              (c.n = void 0),
              (b.s.n = c),
              (b.s = c)),
            c)
          : void 0;
    }
    function dn(a, b) {
      ((this.v = a),
        (this.i = 0),
        (this.n = void 0),
        (this.t = void 0),
        (this.l = 0),
        (this.W = null == b ? void 0 : b.watched),
        (this.Z = null == b ? void 0 : b.unwatched),
        (this.name = null == b ? void 0 : b.name));
    }
    function dp(a, b) {
      return new dn(a, b);
    }
    function dq(a) {
      for (let b = a.s; void 0 !== b; b = b.n)
        if (b.S.i !== b.i || !b.S.h() || b.S.i !== b.i) return !0;
      return !1;
    }
    function dr(a) {
      for (let b = a.s; void 0 !== b; b = b.n) {
        let c = b.S.n;
        if ((void 0 !== c && (b.r = c), (b.S.n = b), (b.i = -1), void 0 === b.n)) {
          a.s = b;
          break;
        }
      }
    }
    function ds(a) {
      let b,
        c = a.s;
      for (; void 0 !== c; ) {
        let a = c.p;
        (-1 === c.i
          ? (c.S.U(c), void 0 !== a && (a.n = c.n), void 0 !== c.n && (c.n.p = a))
          : (b = c),
          (c.S.n = c.r),
          void 0 !== c.r && (c.r = void 0),
          (c = a));
      }
      a.s = b;
    }
    function dt(a, b) {
      (dn.call(this, void 0),
        (this.x = a),
        (this.s = void 0),
        (this.g = dl - 1),
        (this.f = 4),
        (this.W = null == b ? void 0 : b.watched),
        (this.Z = null == b ? void 0 : b.unwatched),
        (this.name = null == b ? void 0 : b.name));
    }
    function du(a) {
      let c = a.m;
      if (((a.m = void 0), "function" == typeof c)) {
        dh++;
        let d = b;
        b = void 0;
        try {
          c();
        } catch (b) {
          throw ((a.f &= -2), (a.f |= 8), dv(a), b);
        } finally {
          ((b = d), dc());
        }
      }
    }
    function dv(a) {
      for (let b = a.s; void 0 !== b; b = b.n) b.S.U(b);
      ((a.x = void 0), (a.s = void 0), du(a));
    }
    function dw(a) {
      if (b !== this) throw Error("Out-of-order effect");
      (ds(this), (b = a), (this.f &= -2), 8 & this.f && dv(this), dc());
    }
    function dx(a, b) {
      ((this.x = a),
        (this.m = void 0),
        (this.s = void 0),
        (this.u = void 0),
        (this.f = 32),
        (this.name = null == b ? void 0 : b.name),
        dg && dg.push(this));
    }
    function dy(a, b) {
      let c = new dx(a, b);
      try {
        c.c();
      } catch (a) {
        throw (c.d(), a);
      }
      let d = c.d.bind(c);
      return ((d[Symbol.dispose] = d), d);
    }
    ((dn.prototype.brand = db),
      (dn.prototype.h = function () {
        return !0;
      }),
      (dn.prototype.S = function (a) {
        let b = this.t;
        b !== a &&
          void 0 === a.e &&
          ((a.x = b),
          (this.t = a),
          void 0 !== b
            ? (b.e = a)
            : de(() => {
                var a;
                null == (a = this.W) || a.call(this);
              }));
      }),
      (dn.prototype.U = function (a) {
        if (void 0 !== this.t) {
          let b = a.e,
            c = a.x;
          (void 0 !== b && ((b.x = c), (a.e = void 0)),
            void 0 !== c && ((c.e = b), (a.x = void 0)),
            a === this.t &&
              ((this.t = c),
              void 0 === c &&
                de(() => {
                  var a;
                  null == (a = this.Z) || a.call(this);
                })));
        }
      }),
      (dn.prototype.subscribe = function (a) {
        return dy(
          () => {
            let c = this.value,
              d = b;
            b = void 0;
            try {
              a(c);
            } finally {
              b = d;
            }
          },
          { name: "sub" }
        );
      }),
      (dn.prototype.valueOf = function () {
        return this.value;
      }),
      (dn.prototype.toString = function () {
        return this.value + "";
      }),
      (dn.prototype.toJSON = function () {
        return this.value;
      }),
      (dn.prototype.peek = function () {
        let a = b;
        b = void 0;
        try {
          return this.value;
        } finally {
          b = a;
        }
      }),
      Object.defineProperty(dn.prototype, "value", {
        get() {
          let a = dm(this);
          return (void 0 !== a && (a.i = this.i), this.v);
        },
        set(a) {
          if (a !== this.v) {
            if (di > 100) throw Error("Cycle detected");
            (0 !== dh &&
              0 === di &&
              this.l !== dk &&
              ((this.l = dk), (df = { S: this, v: this.v, i: this.i, o: df })),
              (this.v = a),
              this.i++,
              dl++,
              dh++);
            try {
              for (let a = this.t; void 0 !== a; a = a.x) a.t.N();
            } finally {
              dc();
            }
          }
        },
      }),
      (dt.prototype = new dn()),
      (dt.prototype.h = function () {
        if (((this.f &= -3), 1 & this.f)) return !1;
        if (32 == (36 & this.f) || ((this.f &= -5), this.g === dl)) return !0;
        if (((this.g = dl), (this.f |= 1), this.i > 0 && !dq(this))) return ((this.f &= -2), !0);
        let a = b;
        try {
          (dr(this), (b = this));
          let a = this.x();
          (16 & this.f || this.v !== a || 0 === this.i) &&
            ((this.v = a), (this.f &= -17), this.i++);
        } catch (a) {
          ((this.v = a), (this.f |= 16), this.i++);
        }
        return ((b = a), ds(this), (this.f &= -2), !0);
      }),
      (dt.prototype.S = function (a) {
        if (void 0 === this.t) {
          this.f |= 36;
          for (let a = this.s; void 0 !== a; a = a.n) a.S.S(a);
        }
        dn.prototype.S.call(this, a);
      }),
      (dt.prototype.U = function (a) {
        if (void 0 !== this.t && (dn.prototype.U.call(this, a), void 0 === this.t)) {
          this.f &= -33;
          for (let a = this.s; void 0 !== a; a = a.n) a.S.U(a);
        }
      }),
      (dt.prototype.N = function () {
        if (!(2 & this.f)) {
          this.f |= 6;
          for (let a = this.t; void 0 !== a; a = a.x) a.t.N();
        }
      }),
      Object.defineProperty(dt.prototype, "value", {
        get() {
          if (1 & this.f) throw Error("Cycle detected");
          let a = dm(this);
          if ((this.h(), void 0 !== a && (a.i = this.i), 16 & this.f)) throw this.v;
          return this.v;
        },
      }),
      (dx.prototype.c = function () {
        let a = this.S();
        try {
          if (8 & this.f || void 0 === this.x) return;
          let a = this.x();
          "function" == typeof a && (this.m = a);
        } finally {
          a();
        }
      }),
      (dx.prototype.S = function () {
        if (1 & this.f) throw Error("Cycle detected");
        ((this.f |= 1), (this.f &= -9), du(this), dr(this), dh++);
        let a = b;
        return ((b = this), dw.bind(this, a));
      }),
      (dx.prototype.N = function () {
        2 & this.f || ((this.f |= 2), (this.u = c), (c = this));
      }),
      (dx.prototype.d = function () {
        ((this.f |= 8), 1 & this.f || dv(this));
      }),
      (dx.prototype.dispose = function () {
        this.d();
      }));
    var dz = Object.create,
      dA = Object.defineProperty,
      dB = Object.defineProperties,
      dC = Object.getOwnPropertyDescriptor,
      dD = Object.getOwnPropertyDescriptors,
      dE = Object.getOwnPropertySymbols,
      dF = Object.prototype.hasOwnProperty,
      dG = Object.prototype.propertyIsEnumerable,
      dH = (a) => {
        throw TypeError(a);
      },
      dI = (a, b, c) =>
        b in a
          ? dA(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      dJ = (a, b) => dA(a, "name", { value: b, configurable: !0 }),
      dK = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      dL = (a) => (void 0 !== a && "function" != typeof a ? dH("Function expected") : a),
      dM = (a, b, c, d, e) => ({
        kind: dK[a],
        name: b,
        metadata: d,
        addInitializer: (a) => (c._ ? dH("Already initialized") : e.push(dL(a || null))),
      }),
      dN = (a, b) => {
        let c, d;
        return dI(b, ((c = "metadata"), (d = Symbol[c]) ? d : Symbol.for("Symbol." + c)), a[3]);
      },
      dO = (a, b, c, d) => {
        for (var e = 0, f = a[b >> 1], g = f && f.length; e < g; e++)
          1 & b ? f[e].call(c) : (d = f[e].call(c, d));
        return d;
      },
      dP = (a, b, c, d, e, f) => {
        var g,
          h,
          i,
          j,
          k,
          l = 7 & b,
          m = !!(8 & b),
          n = !!(16 & b),
          o = l > 3 ? a.length + 1 : l ? (m ? 1 : 2) : 0,
          p = dK[l + 5],
          q = l > 3 && (a[o - 1] = []),
          r = a[o] || (a[o] = []),
          s =
            l &&
            (n || m || (e = e.prototype),
            l < 5 &&
              (l > 3 || !n) &&
              dC(
                l < 4
                  ? e
                  : {
                      get [c]() {
                        return dS(this, f);
                      },
                      set [c](x) {
                        return dU(this, f, x);
                      },
                    },
                c
              ));
        l ? n && l < 4 && dJ(f, (l > 2 ? "set " : l > 1 ? "get " : "") + c) : dJ(e, c);
        for (var t = d.length - 1; t >= 0; t--)
          ((j = dM(l, c, (i = {}), a[3], r)),
            l &&
              ((j.static = m),
              (j.private = n),
              (k = j.access = { has: n ? (a) => dR(e, a) : (a) => c in a }),
              3 ^ l &&
                (k.get = n ? (a) => (1 ^ l ? dS : dV)(a, e, 4 ^ l ? f : s.get) : (a) => a[c]),
              l > 2 &&
                (k.set = n ? (a, b) => dU(a, e, b, 4 ^ l ? f : s.set) : (a, b) => (a[c] = b))),
            (h = (0, d[t])(
              l ? (l < 4 ? (n ? f : s[p]) : l > 4 ? void 0 : { get: s.get, set: s.set }) : e,
              j
            )),
            (i._ = 1),
            4 ^ l || void 0 === h
              ? dL(h) && (l > 4 ? q.unshift(h) : l ? (n ? (f = h) : (s[p] = h)) : (e = h))
              : "object" != typeof h || null === h
                ? dH("Object expected")
                : (dL((g = h.get)) && (s.get = g),
                  dL((g = h.set)) && (s.set = g),
                  dL((g = h.init)) && q.unshift(g)));
        return (l || dN(a, e), s && dA(e, c, s), n ? (4 ^ l ? f : s) : e);
      },
      dQ = (a, b, c) => b.has(a) || dH("Cannot " + c),
      dR = (a, b) =>
        Object(b) !== b ? dH('Cannot use the "in" operator on this value') : a.has(b),
      dS = (a, b, c) => (dQ(a, b, "read from private field"), c ? c.call(a) : b.get(a)),
      dT = (a, b, c) =>
        b.has(a)
          ? dH("Cannot add the same private member more than once")
          : b instanceof WeakSet
            ? b.add(a)
            : b.set(a, c),
      dU = (a, b, c, d) => (dQ(a, b, "write to private field"), d ? d.call(a, c) : b.set(a, c), c),
      dV = (a, b, c) => (dQ(a, b, "access private method"), c);
    function dW(a, b) {
      if (b) {
        let c;
        return new dt(
          () => {
            let d = a();
            return d && c && b(c, d) ? c : ((c = d), d);
          },
          void 0
        );
      }
      return new dt(a, void 0);
    }
    function dX(a, b) {
      if (Object.is(a, b)) return !0;
      if (null === a || null === b) return !1;
      if ("function" == typeof a && "function" == typeof b) return a === b;
      if (a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) return !1;
        for (let c of a) if (!b.has(c)) return !1;
        return !0;
      }
      if (Array.isArray(a))
        return !!Array.isArray(b) && a.length === b.length && !a.some((a, c) => !dX(a, b[c]));
      if ("object" == typeof a && "object" == typeof b) {
        let c = Object.keys(a),
          d = Object.keys(b);
        return c.length === d.length && !c.some((c) => !dX(a[c], b[c]));
      }
      return !1;
    }
    function dY({ get: a }, b) {
      return {
        init: (a) => dp(a),
        get() {
          return a.call(this).value;
        },
        set(b) {
          let c = a.call(this);
          c.peek() !== b && (c.value = b);
        },
      };
    }
    function dZ(a, b) {
      let c = new WeakMap();
      return function () {
        let b = c.get(this);
        return (b || ((b = dW(a.bind(this))), c.set(this, b)), b.value);
      };
    }
    function d$(a = !0) {
      return function (b, c) {
        c.addInitializer(function () {
          let b = "field" === c.kind || c.static ? this : Object.getPrototypeOf(this),
            d = Object.getOwnPropertyDescriptor(b, c.name);
          d &&
            Object.defineProperty(
              b,
              c.name,
              dB(
                ((a, b) => {
                  for (var c in b || (b = {})) dF.call(b, c) && dI(a, c, b[c]);
                  if (dE) for (var c of dE(b)) dG.call(b, c) && dI(a, c, b[c]);
                  return a;
                })({}, d),
                dD({ enumerable: a })
              )
            );
        });
      };
    }
    function d_(...a) {
      let b = a.map(dy);
      return () => b.forEach((a) => a());
    }
    ((D = [dY]), (C = [dY]), (B = [dY]), (A = [d$()]), (z = [d$()]), (y = [d$()]));
    var d0 = class {
      constructor(a, b = Object.is) {
        ((this.defaultValue = a),
          (this.equals = b),
          dO(E, 5, this),
          dT(this, J),
          dT(this, F, dO(E, 8, this)),
          dO(E, 11, this),
          dT(this, K, dO(E, 12, this)),
          dO(E, 15, this),
          dT(this, O, dO(E, 16, this)),
          dO(E, 19, this),
          (this.reset = this.reset.bind(this)),
          this.reset());
      }
      get current() {
        return dS(this, J, Q);
      }
      get initial() {
        return dS(this, J, H);
      }
      get previous() {
        return dS(this, J, M);
      }
      set current(a) {
        let b = de(() => dS(this, J, Q));
        (a && b && this.equals(b, a)) ||
          dd(() => {
            (dS(this, J, H) || dU(this, J, a, I), dU(this, J, b, N), dU(this, J, a, R));
          });
      }
      reset(a = this.defaultValue) {
        dd(() => {
          (dU(this, J, void 0, N), dU(this, J, a, I), dU(this, J, a, R));
        });
      }
    };
    function d1(a) {
      return de(() => {
        let b = {};
        for (let c in a) b[c] = a[c];
        return b;
      });
    }
    ((E = [, , , dz(null)]),
      (F = new WeakMap()),
      (J = new WeakSet()),
      (K = new WeakMap()),
      (O = new WeakMap()),
      (H = (G = dP(E, 20, "#initial", D, J, F)).get),
      (I = G.set),
      (M = (L = dP(E, 20, "#previous", C, J, K)).get),
      (N = L.set),
      (Q = (P = dP(E, 20, "#current", B, J, O)).get),
      (R = P.set),
      dP(E, 2, "current", A, d0),
      dP(E, 2, "initial", z, d0),
      dP(E, 2, "previous", y, d0),
      dN(E, d0));
    var d2 = class {
      constructor() {
        dT(this, S, new WeakMap());
      }
      get(a, b) {
        var c;
        return a ? (null == (c = dS(this, S).get(a)) ? void 0 : c.get(b)) : void 0;
      }
      set(a, b, c) {
        var d;
        if (a)
          return (
            dS(this, S).has(a) || dS(this, S).set(a, new Map()),
            null == (d = dS(this, S).get(a)) ? void 0 : d.set(b, c)
          );
      }
      clear(a) {
        var b;
        return a ? (null == (b = dS(this, S).get(a)) ? void 0 : b.clear()) : void 0;
      }
    };
    S = new WeakMap();
    var d3 = Object.create,
      d4 = Object.defineProperty,
      d5 = Object.getOwnPropertyDescriptor,
      d6 = Object.getOwnPropertySymbols,
      d7 = Object.prototype.hasOwnProperty,
      d8 = Object.prototype.propertyIsEnumerable,
      d9 = (a, b) => ((b = Symbol[a]) ? b : Symbol.for("Symbol." + a)),
      ea = (a) => {
        throw TypeError(a);
      },
      eb = Math.pow,
      ec = (a, b, c) =>
        b in a
          ? d4(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      ed = (a, b) => d4(a, "name", { value: b, configurable: !0 }),
      ee = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      ef = (a) => (void 0 !== a && "function" != typeof a ? ea("Function expected") : a),
      eg = (a, b, c, d, e) => ({
        kind: ee[a],
        name: b,
        metadata: d,
        addInitializer: (a) => (c._ ? ea("Already initialized") : e.push(ef(a || null))),
      }),
      eh = (a, b) => ec(b, d9("metadata"), a[3]),
      ei = (a, b, c, d, e, f) => {
        var g,
          h,
          i,
          j,
          k,
          l = 7 & b,
          m = !!(8 & b),
          n = !!(16 & b),
          o = l > 3 ? a.length + 1 : l ? (m ? 1 : 2) : 0,
          p = ee[l + 5],
          q = l > 3 && (a[o - 1] = []),
          r = a[o] || (a[o] = []),
          s =
            l &&
            (n || m || (e = e.prototype),
            l < 5 &&
              (l > 3 || !n) &&
              d5(
                l < 4
                  ? e
                  : {
                      get [c]() {
                        return el(this, f);
                      },
                      set [c](x) {
                        return em(this, f, x);
                      },
                    },
                c
              ));
        l ? n && l < 4 && ed(f, (l > 2 ? "set " : l > 1 ? "get " : "") + c) : ed(e, c);
        for (var t = d.length - 1; t >= 0; t--)
          ((j = eg(l, c, (i = {}), a[3], r)),
            l &&
              ((j.static = m),
              (j.private = n),
              (k = j.access = { has: n ? (a) => ek(e, a) : (a) => c in a }),
              3 ^ l &&
                (k.get = n ? (a) => (1 ^ l ? el : en)(a, e, 4 ^ l ? f : s.get) : (a) => a[c]),
              l > 2 &&
                (k.set = n ? (a, b) => em(a, e, b, 4 ^ l ? f : s.set) : (a, b) => (a[c] = b))),
            (h = (0, d[t])(
              l ? (l < 4 ? (n ? f : s[p]) : l > 4 ? void 0 : { get: s.get, set: s.set }) : e,
              j
            )),
            (i._ = 1),
            4 ^ l || void 0 === h
              ? ef(h) && (l > 4 ? q.unshift(h) : l ? (n ? (f = h) : (s[p] = h)) : (e = h))
              : "object" != typeof h || null === h
                ? ea("Object expected")
                : (ef((g = h.get)) && (s.get = g),
                  ef((g = h.set)) && (s.set = g),
                  ef((g = h.init)) && q.unshift(g)));
        return (l || eh(a, e), s && d4(e, c, s), n ? (4 ^ l ? f : s) : e);
      },
      ej = (a, b, c) => b.has(a) || ea("Cannot " + c),
      ek = (a, b) =>
        Object(b) !== b ? ea('Cannot use the "in" operator on this value') : a.has(b),
      el = (a, b, c) => (ej(a, b, "read from private field"), c ? c.call(a) : b.get(a)),
      em = (a, b, c, d) => (ej(a, b, "write to private field"), d ? d.call(a, c) : b.set(a, c), c),
      en = (a, b, c) => (ej(a, b, "access private method"), c),
      eo = class a {
        constructor(a, b) {
          ((this.x = a), (this.y = b));
        }
        static delta(b, c) {
          return new a(b.x - c.x, b.y - c.y);
        }
        static distance(a, b) {
          return Math.hypot(a.x - b.x, a.y - b.y);
        }
        static equals(a, b) {
          return a.x === b.x && a.y === b.y;
        }
        static from({ x: b, y: c }) {
          return new a(b, c);
        }
      },
      ep = class a {
        constructor(a, b, c, d) {
          ((this.left = a),
            (this.top = b),
            (this.width = c),
            (this.height = d),
            (this.scale = { x: 1, y: 1 }));
        }
        get inverseScale() {
          return { x: 1 / this.scale.x, y: 1 / this.scale.y };
        }
        translate(b, c) {
          let { top: d, left: e, width: f, height: g, scale: h } = this,
            i = new a(e + b, d + c, f, g);
          return (
            (i.scale = ((a, b) => {
              for (var c in b || (b = {})) d7.call(b, c) && ec(a, c, b[c]);
              if (d6) for (var c of d6(b)) d8.call(b, c) && ec(a, c, b[c]);
              return a;
            })({}, h)),
            i
          );
        }
        get boundingRectangle() {
          let { width: a, height: b, left: c, top: d, right: e, bottom: f } = this;
          return { width: a, height: b, left: c, top: d, right: e, bottom: f };
        }
        get center() {
          let { left: a, top: b, right: c, bottom: d } = this;
          return new eo((a + c) / 2, (b + d) / 2);
        }
        get area() {
          let { width: a, height: b } = this;
          return a * b;
        }
        equals(b) {
          if (!(b instanceof a)) return !1;
          let { left: c, top: d, width: e, height: f } = this;
          return c === b.left && d === b.top && e === b.width && f === b.height;
        }
        containsPoint(a) {
          let { top: b, left: c, bottom: d, right: e } = this;
          return b <= a.y && a.y <= d && c <= a.x && a.x <= e;
        }
        intersectionArea(b) {
          var c, d;
          let e, f, g, h;
          return b instanceof a
            ? ((c = this),
              (e = Math.max((d = b).top, c.top)),
              (f = Math.max(d.left, c.left)),
              (g = Math.min(d.left + d.width, c.left + c.width)),
              (h = Math.min(d.top + d.height, c.top + c.height)),
              f < g && e < h ? (g - f) * (h - e) : 0)
            : 0;
        }
        intersectionRatio(a) {
          let { area: b } = this,
            c = this.intersectionArea(a);
          return c / (a.area + b - c);
        }
        get bottom() {
          let { top: a, height: b } = this;
          return a + b;
        }
        get right() {
          let { left: a, width: b } = this;
          return a + b;
        }
        get aspectRatio() {
          let { width: a, height: b } = this;
          return a / b;
        }
        get corners() {
          return [
            { x: this.left, y: this.top },
            { x: this.right, y: this.top },
            { x: this.left, y: this.bottom },
            { x: this.right, y: this.bottom },
          ];
        }
        static from({ top: b, left: c, width: d, height: e }) {
          return new a(c, b, d, e);
        }
        static delta(a, b, c = { x: "center", y: "center" }) {
          let d = (a, b) => {
            let d = c[b],
              e = "x" === b ? a.left : a.top,
              f = "x" === b ? a.width : a.height;
            return "start" == d ? e : "end" == d ? e + f : e + f / 2;
          };
          return eo.delta({ x: d(a, "x"), y: d(a, "y") }, { x: d(b, "x"), y: d(b, "y") });
        }
        static intersectionRatio(b, c) {
          return a.from(b).intersectionRatio(a.from(c));
        }
      },
      eq = class extends ((V = d0), (U = [dZ]), (T = [dZ]), V) {
        constructor(a) {
          (super(eo.from(a), (a, b) => eo.equals(a, b)),
            ((a, b, c, d) => {
              for (var e = 0, f = a[b >> 1], g = f && f.length; e < g; e++)
                1 & b ? f[e].call(c) : (d = f[e].call(c, d));
            })(X, 5, this),
            ((a, b, c) =>
              b.has(a)
                ? ea("Cannot add the same private member more than once")
                : b instanceof WeakSet
                  ? b.add(a)
                  : b.set(a, c))(this, W, 0),
            (this.velocity = { x: 0, y: 0 }));
        }
        get delta() {
          return eo.delta(this.current, this.initial);
        }
        get direction() {
          let { current: a, previous: b } = this;
          if (!b) return null;
          let c = { x: a.x - b.x, y: a.y - b.y };
          return c.x || c.y
            ? Math.abs(c.x) > Math.abs(c.y)
              ? c.x > 0
                ? "right"
                : "left"
              : c.y > 0
                ? "down"
                : "up"
            : null;
        }
        get current() {
          return super.current;
        }
        set current(a) {
          let { current: b } = this,
            c = eo.from(a),
            d = { x: c.x - b.x, y: c.y - b.y },
            e = Date.now(),
            f = e - el(this, W),
            g = (a) => Math.round((a / f) * 100);
          dd(() => {
            (em(this, W, e), (this.velocity = { x: g(d.x), y: g(d.y) }), (super.current = c));
          });
        }
        reset(a = this.defaultValue) {
          (super.reset(eo.from(a)), (this.velocity = { x: 0, y: 0 }));
        }
      };
    function er({ x: a, y: b }, c) {
      let d = Math.abs(a),
        e = Math.abs(b);
      return "number" == typeof c
        ? Math.sqrt(eb(d, 2) + eb(e, 2)) > c
        : "x" in c && "y" in c
          ? d > c.x && e > c.y
          : "x" in c
            ? d > c.x
            : "y" in c && e > c.y;
    }
    ((X = [, , , d3(null != (o = null == V ? void 0 : V[d9("metadata")]) ? o : null)]),
      (W = new WeakMap()),
      ei(X, 2, "delta", U, eq),
      ei(X, 2, "direction", T, eq),
      eh(X, eq));
    var es = (((p = es || {}).Horizontal = "x"), (p.Vertical = "y"), p),
      et = Object.values(es),
      eu = Object.create,
      ev = Object.defineProperty,
      ew = Object.defineProperties,
      ex = Object.getOwnPropertyDescriptor,
      ey = Object.getOwnPropertyDescriptors,
      ez = Object.getOwnPropertySymbols,
      eA = Object.prototype.hasOwnProperty,
      eB = Object.prototype.propertyIsEnumerable,
      eC = (a, b) => ((b = Symbol[a]) ? b : Symbol.for("Symbol." + a)),
      eD = (a) => {
        throw TypeError(a);
      },
      eE = (a, b, c) =>
        b in a
          ? ev(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      eF = (a, b) => {
        for (var c in b || (b = {})) eA.call(b, c) && eE(a, c, b[c]);
        if (ez) for (var c of ez(b)) eB.call(b, c) && eE(a, c, b[c]);
        return a;
      },
      eG = (a, b) => ew(a, ey(b)),
      eH = (a, b) => ev(a, "name", { value: b, configurable: !0 }),
      eI = (a, b) => {
        var c = {};
        for (var d in a) eA.call(a, d) && 0 > b.indexOf(d) && (c[d] = a[d]);
        if (null != a && ez)
          for (var d of ez(a)) 0 > b.indexOf(d) && eB.call(a, d) && (c[d] = a[d]);
        return c;
      },
      eJ = (a) => {
        var b;
        return [, , , eu(null != (b = null == a ? void 0 : a[eC("metadata")]) ? b : null)];
      },
      eK = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      eL = (a) => (void 0 !== a && "function" != typeof a ? eD("Function expected") : a),
      eM = (a, b, c, d, e) => ({
        kind: eK[a],
        name: b,
        metadata: d,
        addInitializer: (a) => (c._ ? eD("Already initialized") : e.push(eL(a || null))),
      }),
      eN = (a, b) => eE(b, eC("metadata"), a[3]),
      eO = (a, b, c, d) => {
        for (var e = 0, f = a[b >> 1], g = f && f.length; e < g; e++)
          1 & b ? f[e].call(c) : (d = f[e].call(c, d));
        return d;
      },
      eP = (a, b, c, d, e, f) => {
        var g,
          h,
          i,
          j,
          k,
          l = 7 & b,
          m = !!(8 & b),
          n = !!(16 & b),
          o = l > 3 ? a.length + 1 : l ? (m ? 1 : 2) : 0,
          p = eK[l + 5],
          q = l > 3 && (a[o - 1] = []),
          r = a[o] || (a[o] = []),
          s =
            l &&
            (n || m || (e = e.prototype),
            l < 5 &&
              (l > 3 || !n) &&
              ex(
                l < 4
                  ? e
                  : {
                      get [c]() {
                        return eS(this, f);
                      },
                      set [c](x) {
                        return eU(this, f, x);
                      },
                    },
                c
              ));
        l ? n && l < 4 && eH(f, (l > 2 ? "set " : l > 1 ? "get " : "") + c) : eH(e, c);
        for (var t = d.length - 1; t >= 0; t--)
          ((j = eM(l, c, (i = {}), a[3], r)),
            l &&
              ((j.static = m),
              (j.private = n),
              (k = j.access = { has: n ? (a) => eR(e, a) : (a) => c in a }),
              3 ^ l &&
                (k.get = n ? (a) => (1 ^ l ? eS : eV)(a, e, 4 ^ l ? f : s.get) : (a) => a[c]),
              l > 2 &&
                (k.set = n ? (a, b) => eU(a, e, b, 4 ^ l ? f : s.set) : (a, b) => (a[c] = b))),
            (h = (0, d[t])(
              l ? (l < 4 ? (n ? f : s[p]) : l > 4 ? void 0 : { get: s.get, set: s.set }) : e,
              j
            )),
            (i._ = 1),
            4 ^ l || void 0 === h
              ? eL(h) && (l > 4 ? q.unshift(h) : l ? (n ? (f = h) : (s[p] = h)) : (e = h))
              : "object" != typeof h || null === h
                ? eD("Object expected")
                : (eL((g = h.get)) && (s.get = g),
                  eL((g = h.set)) && (s.set = g),
                  eL((g = h.init)) && q.unshift(g)));
        return (l || eN(a, e), s && ev(e, c, s), n ? (4 ^ l ? f : s) : e);
      },
      eQ = (a, b, c) => b.has(a) || eD("Cannot " + c),
      eR = (a, b) =>
        Object(b) !== b ? eD('Cannot use the "in" operator on this value') : a.has(b),
      eS = (a, b, c) => (eQ(a, b, "read from private field"), c ? c.call(a) : b.get(a)),
      eT = (a, b, c) =>
        b.has(a)
          ? eD("Cannot add the same private member more than once")
          : b instanceof WeakSet
            ? b.add(a)
            : b.set(a, c),
      eU = (a, b, c, d) => (eQ(a, b, "write to private field"), d ? d.call(a, c) : b.set(a, c), c),
      eV = (a, b, c) => (eQ(a, b, "access private method"), c);
    function eW(a, b) {
      return { plugin: a, options: b };
    }
    function eX(a) {
      return (b) => eW(a, b);
    }
    function eY(a) {
      return "function" == typeof a ? { plugin: a, options: void 0 } : a;
    }
    Y = [dY];
    var eZ = class {
      constructor(a, b) {
        ((this.manager = a),
          (this.options = b),
          eT(this, $, eO(Z, 8, this, !1)),
          eO(Z, 11, this),
          eT(this, _, new Set()));
      }
      enable() {
        this.disabled = !1;
      }
      disable() {
        this.disabled = !0;
      }
      isDisabled() {
        return de(() => this.disabled);
      }
      configure(a) {
        this.options = a;
      }
      registerEffect(a) {
        let b = dy(a.bind(this));
        return (eS(this, _).add(b), b);
      }
      destroy() {
        eS(this, _).forEach((a) => a());
      }
      static configure(a) {
        return eW(this, a);
      }
    };
    ((Z = eJ(null)),
      ($ = new WeakMap()),
      (_ = new WeakMap()),
      eP(Z, 4, "disabled", Y, eZ, $),
      eN(Z, eZ));
    var e$ = class extends eZ {},
      e_ = class {
        constructor(a) {
          ((this.manager = a), (this.instances = new Map()), eT(this, aa, []));
        }
        get values() {
          return Array.from(this.instances.values());
        }
        set values(a) {
          let b = a
              .map(eY)
              .reduceRight(
                (a, b) => (a.some(({ plugin: a }) => a === b.plugin) ? a : [b, ...a]),
                []
              ),
            c = b.map(({ plugin: a }) => a);
          for (let a of eS(this, aa))
            if (!c.includes(a)) {
              if (a.prototype instanceof e$) continue;
              this.unregister(a);
            }
          for (let { plugin: a, options: c } of b) this.register(a, c);
          eU(this, aa, c);
        }
        get(a) {
          return this.instances.get(a);
        }
        register(a, b) {
          let c = this.instances.get(a);
          if (c) return (c.options !== b && (c.options = b), c);
          let d = new a(this.manager, b);
          return (this.instances.set(a, d), d);
        }
        unregister(a) {
          let b = this.instances.get(a);
          b && (b.destroy(), this.instances.delete(a));
        }
        destroy() {
          for (let a of this.instances.values()) a.destroy();
          this.instances.clear();
        }
      };
    function e0(a, b) {
      return a.priority === b.priority
        ? a.type === b.type
          ? b.value - a.value
          : b.type - a.type
        : b.priority - a.priority;
    }
    aa = new WeakMap();
    var e1 = [],
      e2 = class extends eZ {
        constructor(a) {
          (super(a),
            eT(this, ab),
            eT(this, ac),
            (this.computeCollisions = this.computeCollisions.bind(this)),
            eU(this, ac, dp(e1)),
            (this.destroy = d_(
              () => {
                let a = this.computeCollisions(),
                  b = de(() => this.manager.dragOperation.position.current);
                if (a !== e1) {
                  let a = eS(this, ab);
                  if ((eU(this, ab, b), a && b.x == a.x && b.y == a.y)) return;
                } else eU(this, ab, void 0);
                eS(this, ac).value = a;
              },
              () => {
                let { dragOperation: a } = this.manager;
                a.status.initialized && this.forceUpdate();
              }
            )));
        }
        forceUpdate(a = !0) {
          de(() => {
            a ? (eS(this, ac).value = this.computeCollisions()) : eU(this, ab, void 0);
          });
        }
        computeCollisions(a, b) {
          let { registry: c, dragOperation: d } = this.manager,
            { source: e, shape: f, status: g } = d;
          if (!g.initialized || !f) return e1;
          let h = [],
            i = [];
          for (let f of null != a ? a : c.droppables) {
            if (f.disabled || (e && !f.accepts(e))) continue;
            let a = null != b ? b : f.collisionDetector;
            if (!a) continue;
            (i.push(f), f.shape);
            let c = de(() => a({ droppable: f, dragOperation: d }));
            c && (null != f.collisionPriority && (c.priority = f.collisionPriority), h.push(c));
          }
          return 0 === i.length ? e1 : (h.sort(e0), h);
        }
        get collisions() {
          return eS(this, ac).value;
        }
      };
    ((ab = new WeakMap()), (ac = new WeakMap()));
    var e3 = class {
        constructor() {
          this.registry = new Map();
        }
        addEventListener(a, b) {
          let { registry: c } = this,
            d = new Set(c.get(a));
          return (d.add(b), c.set(a, d), () => this.removeEventListener(a, b));
        }
        removeEventListener(a, b) {
          let { registry: c } = this,
            d = new Set(c.get(a));
          (d.delete(b), c.set(a, d));
        }
        dispatch(a, ...b) {
          let { registry: c } = this,
            d = c.get(a);
          if (d) for (let a of d) a(...b);
        }
      },
      e4 = class extends e3 {
        constructor(a) {
          (super(), (this.manager = a));
        }
        dispatch(a, b) {
          let c = [b, this.manager];
          super.dispatch(a, ...c);
        }
      };
    function e5(a, b = !0) {
      let c = !1;
      return eG(eF({}, a), {
        cancelable: b,
        get defaultPrevented() {
          return c;
        },
        preventDefault() {
          b && (c = !0);
        },
      });
    }
    var e6 = class extends e$ {
        constructor(a) {
          super(a);
          let b = [];
          this.destroy = d_(
            () => {
              let { dragOperation: c, collisionObserver: d } = a;
              c.status.initializing && ((b = []), d.enable());
            },
            () => {
              let c,
                { collisionObserver: d, monitor: e } = a,
                { collisions: f } = d;
              if (d.isDisabled()) return;
              let g = e5({ collisions: f });
              if (
                (e.dispatch("collision", g),
                g.defaultPrevented ||
                  ((c = b), f.map(({ id: a }) => a).join("") === c.map(({ id: a }) => a).join("")))
              )
                return;
              b = f;
              let [h] = f;
              de(() => {
                var b;
                (null == h ? void 0 : h.id) !==
                  (null == (b = a.dragOperation.target) ? void 0 : b.id) &&
                  (d.disable(),
                  a.actions.setDropTarget(null == h ? void 0 : h.id).then(() => {
                    d.enable();
                  }));
              });
            }
          );
        }
      },
      e7 =
        (((q = e7 || {})[(q.Lowest = 0)] = "Lowest"),
        (q[(q.Low = 1)] = "Low"),
        (q[(q.Normal = 2)] = "Normal"),
        (q[(q.High = 3)] = "High"),
        (q[(q.Highest = 4)] = "Highest"),
        q),
      e8 =
        (((r = e8 || {})[(r.Collision = 0)] = "Collision"),
        (r[(r.ShapeIntersection = 1)] = "ShapeIntersection"),
        (r[(r.PointerIntersection = 2)] = "PointerIntersection"),
        r);
    ((aj = [dY]), (ai = [dZ]), (ah = [dZ]), (ag = [dZ]), (af = [dZ]), (ae = [dZ]), (ad = [dZ]));
    var e9 = class {
      constructor() {
        (eO(ak, 5, this), eT(this, al, eO(ak, 8, this, "idle")), eO(ak, 11, this));
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
        let { value: a } = this;
        return "idle" !== a && "initialization-pending" !== a;
      }
      get dragging() {
        return "dragging" === this.value;
      }
      get dropped() {
        return "dropped" === this.value;
      }
      set(a) {
        this.value = a;
      }
    };
    ((ak = eJ(null)),
      (al = new WeakMap()),
      eP(ak, 4, "value", aj, e9, al),
      eP(ak, 2, "current", ai, e9),
      eP(ak, 2, "idle", ah, e9),
      eP(ak, 2, "initializing", ag, e9),
      eP(ak, 2, "initialized", af, e9),
      eP(ak, 2, "dragging", ae, e9),
      eP(ak, 2, "dropped", ad, e9),
      eN(ak, e9));
    var fa = class {
      constructor(a) {
        this.manager = a;
      }
      setDragSource(a) {
        let { dragOperation: b } = this.manager;
        b.sourceIdentifier = "string" == typeof a || "number" == typeof a ? a : a.id;
      }
      setDropTarget(a) {
        return de(() => {
          let { dragOperation: b } = this.manager,
            c = null != a ? a : null;
          if (b.targetIdentifier === c) return Promise.resolve(!1);
          b.targetIdentifier = c;
          let d = e5({ operation: b.snapshot() });
          return (
            b.status.dragging && this.manager.monitor.dispatch("dragover", d),
            this.manager.renderer.rendering.then(() => d.defaultPrevented)
          );
        });
      }
      start(a) {
        return de(() => {
          let { dragOperation: b } = this.manager;
          if ((null != a.source && this.setDragSource(a.source), !b.source))
            throw Error("Cannot start a drag operation without a drag source");
          if (!b.status.idle) throw Error("Cannot start a drag operation while another is active");
          let c = new AbortController(),
            { event: d, coordinates: e } = a;
          dd(() => {
            (b.status.set("initialization-pending"),
              (b.shape = null),
              (b.canceled = !1),
              (b.activatorEvent = null != d ? d : null),
              b.position.reset(e));
          });
          let f = e5({ operation: b.snapshot() });
          return (
            (this.manager.monitor.dispatch("beforedragstart", f), f.defaultPrevented)
              ? (b.reset(), c.abort())
              : (b.status.set("initializing"),
                (b.controller = c),
                this.manager.renderer.rendering.then(() => {
                  if (c.signal.aborted) return;
                  let { status: a } = b;
                  "initializing" === a.current &&
                    (b.status.set("dragging"),
                    this.manager.monitor.dispatch("dragstart", {
                      nativeEvent: d,
                      operation: b.snapshot(),
                      cancelable: !1,
                    }));
                })),
            c
          );
        });
      }
      move(a) {
        return de(() => {
          var b, c;
          let { dragOperation: d } = this.manager,
            { status: e, controller: f } = d;
          if (!e.dragging || !f || f.signal.aborted) return;
          let g = e5(
            { nativeEvent: a.event, operation: d.snapshot(), by: a.by, to: a.to },
            null == (b = a.cancelable) || b
          );
          ((null == (c = a.propagate) || c) && this.manager.monitor.dispatch("dragmove", g),
            queueMicrotask(() => {
              var b, c, e, f, h;
              if (g.defaultPrevented) return;
              let i =
                null != (h = a.to)
                  ? h
                  : {
                      x:
                        d.position.current.x +
                        (null != (c = null == (b = a.by) ? void 0 : b.x) ? c : 0),
                      y:
                        d.position.current.y +
                        (null != (f = null == (e = a.by) ? void 0 : e.y) ? f : 0),
                    };
              d.position.current = i;
            }));
        });
      }
      stop(a = {}) {
        return de(() => {
          var b, c;
          let d,
            { dragOperation: e } = this.manager,
            { controller: f } = e;
          if (!f || f.signal.aborted) return;
          f.abort();
          let g = () => {
            this.manager.renderer.rendering.then(() => {
              e.status.set("dropped");
              let a = de(() => {
                  var a;
                  return (null == (a = e.source) ? void 0 : a.status) === "dropping";
                }),
                b = () => {
                  (e.controller === f && (e.controller = void 0), e.reset());
                };
              if (a) {
                let { source: a } = e,
                  c = dy(() => {
                    (null == a ? void 0 : a.status) === "idle" && (c(), b());
                  });
              } else this.manager.renderer.rendering.then(b);
            });
          };
          ((e.canceled = null != (b = a.canceled) && b),
            this.manager.monitor.dispatch("dragend", {
              nativeEvent: a.event,
              operation: e.snapshot(),
              canceled: null != (c = a.canceled) && c,
              suspend: () => {
                let a = { resume: () => {}, abort: () => {} };
                return (
                  (d = new Promise((b, c) => {
                    ((a.resume = b), (a.abort = c));
                  })),
                  a
                );
              },
            }),
            d ? d.then(g).catch(() => e.reset()) : g());
        });
      }
    };
    ((ap = [dY]), (ao = [dY]), (an = [dY]), (am = [dY]));
    var fb = class {
      constructor(a, b) {
        (eT(this, ar, eO(aq, 8, this)),
          eO(aq, 11, this),
          eT(this, as, eO(aq, 12, this)),
          eO(aq, 15, this),
          eT(this, at, eO(aq, 16, this)),
          eO(aq, 19, this),
          eT(this, au, eO(aq, 20, this)),
          eO(aq, 23, this));
        const { effects: c, id: d, data: e = {}, disabled: f = !1, register: g = !0 } = a;
        ((this.manager = b),
          (this.id = d),
          (this.data = e),
          (this.disabled = f),
          (this.effects = () => {
            var a;
            return [
              () => {
                let { id: a, manager: b } = this;
                if (a !== d)
                  return (
                    null == b || b.registry.register(this),
                    () => (null == b ? void 0 : b.registry.unregister(this))
                  );
              },
              ...(null != (a = null == c ? void 0 : c()) ? a : []),
            ];
          }),
          (this.register = this.register.bind(this)),
          (this.unregister = this.unregister.bind(this)),
          (this.destroy = this.destroy.bind(this)),
          b && g && queueMicrotask(this.register));
      }
      register() {
        var a;
        return null == (a = this.manager) ? void 0 : a.registry.register(this);
      }
      unregister() {
        var a;
        null == (a = this.manager) || a.registry.unregister(this);
      }
      destroy() {
        var a;
        null == (a = this.manager) || a.registry.unregister(this);
      }
    };
    ((aq = eJ(null)),
      (ar = new WeakMap()),
      (as = new WeakMap()),
      (at = new WeakMap()),
      (au = new WeakMap()),
      eP(aq, 4, "manager", ap, fb, ar),
      eP(aq, 4, "id", ao, fb, as),
      eP(aq, 4, "data", an, fb, at),
      eP(aq, 4, "disabled", am, fb, au),
      eN(aq, fb));
    var fc = class {
        constructor() {
          ((this.map = dp(new Map())),
            (this.cleanupFunctions = new WeakMap()),
            (this.register = (a, b) => {
              let c = this.map.peek(),
                d = c.get(a),
                e = () => this.unregister(a, b);
              if (d === b) return e;
              if (d) {
                let a = this.cleanupFunctions.get(d);
                (null == a || a(), this.cleanupFunctions.delete(d));
              }
              let f = new Map(c);
              (f.set(a, b), (this.map.value = f));
              let g = d_(...b.effects());
              return (this.cleanupFunctions.set(b, g), e);
            }),
            (this.unregister = (a, b) => {
              let c = this.map.peek();
              if (c.get(a) !== b) return;
              let d = this.cleanupFunctions.get(b);
              (null == d || d(), this.cleanupFunctions.delete(b));
              let e = new Map(c);
              (e.delete(a), (this.map.value = e));
            }));
        }
        [Symbol.iterator]() {
          return this.map.peek().values();
        }
        get value() {
          return this.map.value.values();
        }
        has(a) {
          return this.map.value.has(a);
        }
        get(a) {
          return this.map.value.get(a);
        }
        destroy() {
          for (let a of this) {
            let b = this.cleanupFunctions.get(a);
            (null == b || b(), a.destroy());
          }
          this.map.value = new Map();
        }
      },
      fd = class extends ((aB = fb),
      (aA = [dY]),
      (az = [dY]),
      (ay = [dY]),
      (ax = [dZ]),
      (aw = [dZ]),
      (av = [dZ]),
      aB) {
        constructor(a, b) {
          var { modifiers: c, type: d, sensors: e } = a,
            f = eI(a, ["modifiers", "type", "sensors"]);
          (super(f, b),
            eO(aC, 5, this),
            eT(this, aD, eO(aC, 8, this)),
            eO(aC, 11, this),
            eT(this, aE, eO(aC, 12, this)),
            eO(aC, 15, this),
            eT(this, aF, eO(aC, 16, this, this.isDragSource ? "dragging" : "idle")),
            eO(aC, 19, this),
            (this.type = d),
            (this.sensors = e),
            (this.modifiers = c),
            (this.alignment = f.alignment));
        }
        get isDropping() {
          return "dropping" === this.status && this.isDragSource;
        }
        get isDragging() {
          return "dragging" === this.status && this.isDragSource;
        }
        get isDragSource() {
          var a, b;
          return (
            (null == (b = null == (a = this.manager) ? void 0 : a.dragOperation.source)
              ? void 0
              : b.id) === this.id
          );
        }
      };
    ((aC = eJ(aB)),
      (aD = new WeakMap()),
      (aE = new WeakMap()),
      (aF = new WeakMap()),
      eP(aC, 4, "type", aA, fd, aD),
      eP(aC, 4, "modifiers", az, fd, aE),
      eP(aC, 4, "status", ay, fd, aF),
      eP(aC, 2, "isDropping", ax, fd),
      eP(aC, 2, "isDragging", aw, fd),
      eP(aC, 2, "isDragSource", av, fd),
      eN(aC, fd));
    var fe = class extends ((aM = fb),
    (aL = [dY]),
    (aK = [dY]),
    (aJ = [dY]),
    (aI = [dY]),
    (aH = [dY]),
    (aG = [dZ]),
    aM) {
      constructor(a, b) {
        var { accept: c, collisionDetector: d, collisionPriority: e, type: f } = a;
        (super(eI(a, ["accept", "collisionDetector", "collisionPriority", "type"]), b),
          eO(aN, 5, this),
          eT(this, aO, eO(aN, 8, this)),
          eO(aN, 11, this),
          eT(this, aP, eO(aN, 12, this)),
          eO(aN, 15, this),
          eT(this, aQ, eO(aN, 16, this)),
          eO(aN, 19, this),
          eT(this, aR, eO(aN, 20, this)),
          eO(aN, 23, this),
          eT(this, aS, eO(aN, 24, this)),
          eO(aN, 27, this),
          (this.accept = c),
          (this.collisionDetector = d),
          (this.collisionPriority = e),
          (this.type = f));
      }
      accepts(a) {
        let { accept: b } = this;
        return (
          !b ||
          ("function" == typeof b
            ? b(a)
            : !!a.type && (Array.isArray(b) ? b.includes(a.type) : a.type === b))
        );
      }
      get isDropTarget() {
        var a, b;
        return (
          (null == (b = null == (a = this.manager) ? void 0 : a.dragOperation.target)
            ? void 0
            : b.id) === this.id
        );
      }
    };
    ((aN = eJ(aM)),
      (aO = new WeakMap()),
      (aP = new WeakMap()),
      (aQ = new WeakMap()),
      (aR = new WeakMap()),
      (aS = new WeakMap()),
      eP(aN, 4, "accept", aL, fe, aO),
      eP(aN, 4, "type", aK, fe, aP),
      eP(aN, 4, "collisionDetector", aJ, fe, aQ),
      eP(aN, 4, "collisionPriority", aI, fe, aR),
      eP(aN, 4, "shape", aH, fe, aS),
      eP(aN, 2, "isDropTarget", aG, fe),
      eN(aN, fe));
    var ff = class extends eZ {
        constructor(a, b) {
          (super(a, b), (this.manager = a), (this.options = b));
        }
      },
      fg = class extends eZ {
        constructor(a, b) {
          (super(a, b), (this.manager = a), (this.options = b));
        }
        apply(a) {
          return a.transform;
        }
      },
      fh = class {
        constructor(a) {
          ((this.draggables = new fc()),
            (this.droppables = new fc()),
            (this.plugins = new e_(a)),
            (this.sensors = new e_(a)),
            (this.modifiers = new e_(a)));
        }
        register(a, b) {
          if (a instanceof fd) return this.draggables.register(a.id, a);
          if (a instanceof fe) return this.droppables.register(a.id, a);
          if (a.prototype instanceof fg) return this.modifiers.register(a, b);
          if (a.prototype instanceof ff) return this.sensors.register(a, b);
          if (a.prototype instanceof eZ) return this.plugins.register(a, b);
          throw Error("Invalid instance type");
        }
        unregister(a) {
          if (a instanceof fb)
            return a instanceof fd
              ? this.draggables.unregister(a.id, a)
              : a instanceof fe
                ? this.droppables.unregister(a.id, a)
                : () => {};
          if (a.prototype instanceof fg) return this.modifiers.unregister(a);
          if (a.prototype instanceof ff) return this.sensors.unregister(a);
          if (a.prototype instanceof eZ) return this.plugins.unregister(a);
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
    ((a_ = [dZ]),
      (a$ = [dY]),
      (aZ = [dY]),
      (aY = [dY]),
      (aX = [dY]),
      (aW = [dY]),
      (aV = [dZ]),
      (aU = [dZ]),
      (aT = [dZ]));
    var fi = class {
      constructor(a) {
        (eO(a3, 5, this),
          eT(this, a0),
          eT(this, a1),
          eT(this, a2, new d0(void 0, (a, b) => (a && b ? a.equals(b) : a === b))),
          (this.status = new e9()),
          eT(this, a4, eO(a3, 8, this, !1)),
          eO(a3, 11, this),
          eT(this, a5, eO(a3, 12, this, null)),
          eO(a3, 15, this),
          eT(this, a6, eO(a3, 16, this, null)),
          eO(a3, 19, this),
          eT(this, a7, eO(a3, 20, this, null)),
          eO(a3, 23, this),
          eT(this, a8, eO(a3, 24, this, [])),
          eO(a3, 27, this),
          (this.position = new eq({ x: 0, y: 0 })),
          eT(this, a9, { x: 0, y: 0 }),
          eU(this, a0, a));
      }
      get shape() {
        let { current: a, initial: b, previous: c } = eS(this, a2);
        return a && b ? { current: a, initial: b, previous: c } : null;
      }
      set shape(a) {
        a ? (eS(this, a2).current = a) : eS(this, a2).reset();
      }
      get source() {
        var a;
        let b = this.sourceIdentifier;
        if (null == b) return null;
        let c = eS(this, a0).registry.draggables.get(b);
        return (c && eU(this, a1, c), null != (a = null != c ? c : eS(this, a1)) ? a : null);
      }
      get target() {
        var a;
        let b = this.targetIdentifier;
        return null != b && null != (a = eS(this, a0).registry.droppables.get(b)) ? a : null;
      }
      get transform() {
        let { x: a, y: b } = this.position.delta,
          c = { x: a, y: b };
        for (let a of this.modifiers) c = a.apply(eG(eF({}, this.snapshot()), { transform: c }));
        return (eU(this, a9, c), c);
      }
      snapshot() {
        return de(() => ({
          source: this.source,
          target: this.target,
          activatorEvent: this.activatorEvent,
          transform: eS(this, a9),
          shape: this.shape ? d1(this.shape) : null,
          position: d1(this.position),
          status: d1(this.status),
          canceled: this.canceled,
        }));
      }
      reset() {
        dd(() => {
          (this.status.set("idle"),
            (this.sourceIdentifier = null),
            (this.targetIdentifier = null),
            eS(this, a2).reset(),
            this.position.reset({ x: 0, y: 0 }),
            eU(this, a9, { x: 0, y: 0 }),
            (this.modifiers = []));
        });
      }
    };
    ((a3 = eJ(null)),
      (a0 = new WeakMap()),
      (a1 = new WeakMap()),
      (a2 = new WeakMap()),
      (a4 = new WeakMap()),
      (a5 = new WeakMap()),
      (a6 = new WeakMap()),
      (a7 = new WeakMap()),
      (a8 = new WeakMap()),
      (a9 = new WeakMap()),
      eP(a3, 2, "shape", a_, fi),
      eP(a3, 4, "canceled", a$, fi, a4),
      eP(a3, 4, "activatorEvent", aZ, fi, a5),
      eP(a3, 4, "sourceIdentifier", aY, fi, a6),
      eP(a3, 4, "targetIdentifier", aX, fi, a7),
      eP(a3, 4, "modifiers", aW, fi, a8),
      eP(a3, 2, "source", aV, fi),
      eP(a3, 2, "target", aU, fi),
      eP(a3, 2, "transform", aT, fi),
      eN(a3, fi));
    var fj = {
        get rendering() {
          return Promise.resolve();
        },
      },
      fk = class {
        constructor(a) {
          this.destroy = () => {
            (this.dragOperation.status.idle || this.actions.stop({ canceled: !0 }),
              this.dragOperation.modifiers.forEach((a) => a.destroy()),
              this.registry.destroy(),
              this.collisionObserver.destroy());
          };
          const {
              plugins: b = [],
              sensors: c = [],
              modifiers: d = [],
              renderer: e = fj,
            } = null != a ? a : {},
            f = new e4(this),
            g = new fh(this);
          ((this.registry = g),
            (this.monitor = f),
            (this.renderer = e),
            (this.actions = new fa(this)),
            (this.dragOperation = new fi(this)),
            (this.collisionObserver = new e2(this)),
            (this.plugins = [e6, ...b]),
            (this.modifiers = d),
            (this.sensors = c));
          const { destroy: h } = this,
            i = d_(() => {
              var a, b, c;
              let d = de(() => this.dragOperation.modifiers),
                e = this.modifiers;
              (d !== e && d.forEach((a) => a.destroy()),
                (this.dragOperation.modifiers =
                  null !=
                  (c =
                    null == (b = null == (a = this.dragOperation.source) ? void 0 : a.modifiers)
                      ? void 0
                      : b.map((a) => {
                          let { plugin: b, options: c } = eY(a);
                          return new b(this, c);
                        }))
                    ? c
                    : e));
            });
          this.destroy = () => {
            (i(), h());
          };
        }
        get plugins() {
          return this.registry.plugins.values;
        }
        set plugins(a) {
          this.registry.plugins.values = a;
        }
        get modifiers() {
          return this.registry.modifiers.values;
        }
        set modifiers(a) {
          this.registry.modifiers.values = a;
        }
        get sensors() {
          return this.registry.sensors.values;
        }
        set sensors(a) {
          this.registry.sensors.values = a;
        }
      },
      fl = (a) => {
        throw TypeError(a);
      },
      fm = (a, b, c) => b.has(a) || fl("Cannot " + c),
      fn = (a, b, c) => (fm(a, b, "read from private field"), b.get(a)),
      fo = (a, b, c) =>
        b.has(a)
          ? fl("Cannot add the same private member more than once")
          : b instanceof WeakSet
            ? b.add(a)
            : b.set(a, c),
      fp = (a, b, c, d) => (fm(a, b, "write to private field"), b.set(a, c), c),
      fq = (a, b, c) => (fm(a, b, "access private method"), c);
    function fr(a) {
      return (
        !!a &&
        (a instanceof KeyframeEffect ||
          ("getKeyframes" in a && "function" == typeof a.getKeyframes))
      );
    }
    function fs(a, b) {
      let c = a.getAnimations();
      if (c.length > 0)
        for (let a of c) {
          if ("running" !== a.playState) continue;
          let { effect: c } = a,
            d = (fr(c) ? c.getKeyframes() : []).filter(b);
          if (d.length > 0) return [d[d.length - 1], a];
        }
      return null;
    }
    function ft(a) {
      let { width: b, height: c, top: d, left: e, bottom: f, right: g } = a.getBoundingClientRect();
      return { width: b, height: c, top: d, left: e, bottom: f, right: g };
    }
    function fu(a) {
      let b = Object.prototype.toString.call(a);
      return "[object Window]" === b || "[object global]" === b;
    }
    function fv(a) {
      return "nodeType" in a;
    }
    function fw(a) {
      var b, c, d;
      return a
        ? fu(a)
          ? a
          : fv(a)
            ? "defaultView" in a
              ? null != (b = a.defaultView)
                ? b
                : window
              : null != (d = null == (c = a.ownerDocument) ? void 0 : c.defaultView)
                ? d
                : window
            : window
        : window;
    }
    function fx(a) {
      let { Document: b } = fw(a);
      return a instanceof b || ("nodeType" in a && a.nodeType === Node.DOCUMENT_NODE);
    }
    function fy(a) {
      return (
        !(!a || fu(a)) &&
        (a instanceof fw(a).HTMLElement ||
          ("namespaceURI" in a &&
            "string" == typeof a.namespaceURI &&
            a.namespaceURI.endsWith("html")))
      );
    }
    function fz(a) {
      return (
        a instanceof fw(a).SVGElement ||
        ("namespaceURI" in a && "string" == typeof a.namespaceURI && a.namespaceURI.endsWith("svg"))
      );
    }
    function fA(a) {
      return a
        ? fu(a)
          ? a.document
          : fv(a)
            ? fx(a)
              ? a
              : fy(a) || fz(a)
                ? a.ownerDocument
                : document
            : document
        : document;
    }
    function fB(a, b = a.getBoundingClientRect(), c = 0) {
      var d;
      let e = b,
        { ownerDocument: f } = a,
        g = null != (d = f.defaultView) ? d : window,
        h = a.parentElement;
      for (; h && h !== f.documentElement; ) {
        if (
          !(function (a) {
            if ("DETAILS" === a.tagName && !1 === a.open) return !1;
            let { overflow: b, overflowX: c, overflowY: d } = getComputedStyle(a);
            return "visible" === b && "visible" === c && "visible" === d;
          })(h)
        ) {
          let a = h.getBoundingClientRect(),
            b = c * (a.bottom - a.top),
            d = c * (a.right - a.left),
            f = c * (a.bottom - a.top),
            g = c * (a.right - a.left);
          (((e = {
            top: Math.max(e.top, a.top - b),
            right: Math.min(e.right, a.right + d),
            bottom: Math.min(e.bottom, a.bottom + f),
            left: Math.max(e.left, a.left - g),
            width: 0,
            height: 0,
          }).width = e.right - e.left),
            (e.height = e.bottom - e.top));
        }
        h = h.parentElement;
      }
      let i = g.innerWidth,
        j = g.innerHeight,
        k = c * j,
        l = c * i;
      return (
        ((e = {
          top: Math.max(e.top, 0 - k),
          right: Math.min(e.right, i + l),
          bottom: Math.min(e.bottom, j + k),
          left: Math.max(e.left, 0 - l),
          width: 0,
          height: 0,
        }).width = e.right - e.left),
        (e.height = e.bottom - e.top),
        e.width < 0 && (e.width = 0),
        e.height < 0 && (e.height = 0),
        e
      );
    }
    function fC() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    function fD(a) {
      return "value" in a;
    }
    function fE(a) {
      return "CANVAS" === a.tagName;
    }
    var fF = new WeakMap(),
      fG = class {
        constructor() {
          ((this.entries = new Set()),
            (this.clear = () => {
              for (let a of this.entries) {
                let [b, { type: c, listener: d, options: e }] = a;
                b.removeEventListener(c, d, e);
              }
              this.entries.clear();
            }));
        }
        bind(a, b) {
          let c = Array.isArray(b) ? b : [b],
            d = [];
          for (let b of c) {
            let { type: c, listener: e, options: f } = b,
              g = [a, b];
            (a.addEventListener(c, e, f), this.entries.add(g), d.push(g));
          }
          return function () {
            for (let [a, { type: b, listener: c, options: e }] of d) a.removeEventListener(b, c, e);
          };
        }
      };
    function fH(a) {
      let b = null == a ? void 0 : a.ownerDocument.defaultView;
      if (b && b.self !== b.parent) return b.frameElement;
    }
    function fI(a, b) {
      let c, d;
      return function (...e) {
        let f = this;
        if (d) {
          let g;
          (null == c || c(),
            (g = setTimeout(
              () => {
                (a.apply(f, e), (d = performance.now()));
              },
              b - (performance.now() - d)
            )),
            (c = () => clearTimeout(g)));
        } else (a.apply(f, e), (d = performance.now()));
      };
    }
    var fJ = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
      fK = class extends fJ {
        constructor(a) {
          (super((b) => {
            fn(this, ba) ? a(b, this) : fp(this, ba, !0);
          }),
            fo(this, ba, !1));
        }
      };
    ba = new WeakMap();
    var fL = Array.from({ length: 100 }, (a, b) => b / 100),
      fM = class {
        constructor(a, b, c = { debug: !1, skipInitial: !1 }) {
          ((this.element = a),
            (this.callback = b),
            fo(this, bj),
            (this.disconnect = () => {
              var a, b, c;
              (fp(this, bh, !0),
                null == (a = fn(this, bd)) || a.disconnect(),
                null == (b = fn(this, be)) || b.disconnect(),
                fn(this, bf).disconnect(),
                null == (c = fn(this, bg)) || c.remove());
            }),
            fo(this, bb, !0),
            fo(this, bc),
            fo(this, bd),
            fo(this, be),
            fo(this, bf),
            fo(this, bg),
            fo(this, bh, !1),
            fo(
              this,
              bi,
              fI(() => {
                var a, b, c;
                let { element: d } = this;
                if (
                  (null == (a = fn(this, be)) || a.disconnect(),
                  fn(this, bh) || !fn(this, bb) || !d.isConnected)
                )
                  return;
                let e = null != (b = d.ownerDocument) ? b : document,
                  { innerHeight: f, innerWidth: g } = null != (c = e.defaultView) ? c : window,
                  h = d.getBoundingClientRect(),
                  { top: i, left: j, bottom: k, right: l } = fB(d, h),
                  m = -Math.floor(i),
                  n = -Math.floor(j),
                  o = -Math.floor(g - l),
                  p = -Math.floor(f - k),
                  q = `${m}px ${o}px ${p}px ${n}px`;
                ((this.boundingClientRect = h),
                  fp(
                    this,
                    be,
                    new IntersectionObserver(
                      (a) => {
                        let [b] = a,
                          { intersectionRect: c } = b;
                        1 !==
                          (1 !== b.intersectionRatio
                            ? b.intersectionRatio
                            : ep.intersectionRatio(c, fB(d))) && fn(this, bi).call(this);
                      },
                      { threshold: fL, rootMargin: q, root: e }
                    )
                  ),
                  fn(this, be).observe(d),
                  fq(this, bj, bk).call(this));
              }, 75)
            ),
            (this.boundingClientRect = a.getBoundingClientRect()),
            fp(
              this,
              bb,
              (function (a, b = a.getBoundingClientRect()) {
                let { width: c, height: d } = fB(a, b);
                return c > 0 && d > 0;
              })(a, this.boundingClientRect)
            ));
          let d = !0;
          this.callback = (a) => {
            (d && ((d = !1), c.skipInitial)) || b(a);
          };
          const e = a.ownerDocument;
          ((null == c ? void 0 : c.debug) &&
            (fp(this, bg, document.createElement("div")),
            (fn(this, bg).style.background = "rgba(0,0,0,0.15)"),
            (fn(this, bg).style.position = "fixed"),
            (fn(this, bg).style.pointerEvents = "none"),
            e.body.appendChild(fn(this, bg))),
            fp(
              this,
              bf,
              new IntersectionObserver(
                (b) => {
                  var c, d;
                  let { boundingClientRect: e, isIntersecting: f } = b[b.length - 1],
                    { width: g, height: h } = e,
                    i = fn(this, bb);
                  (fp(this, bb, f),
                    (g || h) &&
                      (i && !f
                        ? (null == (c = fn(this, be)) || c.disconnect(),
                          this.callback(null),
                          null == (d = fn(this, bd)) || d.disconnect(),
                          fp(this, bd, void 0),
                          fn(this, bg) && (fn(this, bg).style.visibility = "hidden"))
                        : fn(this, bi).call(this),
                      f &&
                        !fn(this, bd) &&
                        (fp(this, bd, new fK(fn(this, bi))), fn(this, bd).observe(a))));
                },
                { threshold: fL, root: e }
              )
            ),
            fn(this, bb) && !c.skipInitial && this.callback(this.boundingClientRect),
            fn(this, bf).observe(a));
        }
      };
    ((bb = new WeakMap()),
      (bc = new WeakMap()),
      (bd = new WeakMap()),
      (be = new WeakMap()),
      (bf = new WeakMap()),
      (bg = new WeakMap()),
      (bh = new WeakMap()),
      (bi = new WeakMap()),
      (bj = new WeakSet()),
      (bk = function () {
        var a, b;
        !fn(this, bh) &&
          (fq(this, bj, bl).call(this),
          (a = this.boundingClientRect) === (b = fn(this, bc)) ||
            (a &&
              b &&
              a.top == b.top &&
              a.left == b.left &&
              a.right == b.right &&
              a.bottom == b.bottom) ||
            (this.callback(this.boundingClientRect), fp(this, bc, this.boundingClientRect)));
      }),
      (bl = function () {
        if (fn(this, bg)) {
          let { top: a, left: b, width: c, height: d } = fB(this.element);
          ((fn(this, bg).style.overflow = "hidden"),
            (fn(this, bg).style.visibility = "visible"),
            (fn(this, bg).style.top = `${Math.floor(a)}px`),
            (fn(this, bg).style.left = `${Math.floor(b)}px`),
            (fn(this, bg).style.width = `${Math.floor(c)}px`),
            (fn(this, bg).style.height = `${Math.floor(d)}px`));
        }
      }));
    var fN = new WeakMap(),
      fO = new WeakMap(),
      fP = class {
        constructor(a, b, c) {
          ((this.callback = b),
            fo(this, bm),
            fo(this, bn, !1),
            fo(this, bo),
            fo(
              this,
              bp,
              fI((a) => {
                if (
                  !fn(this, bn) &&
                  a.target &&
                  "contains" in a.target &&
                  "function" == typeof a.target.contains
                ) {
                  for (let b of fn(this, bo))
                    if (a.target.contains(b)) {
                      this.callback(fn(this, bm).boundingClientRect);
                      break;
                    }
                }
              }, 75)
            ));
          const d = (function (a) {
              let b = new Set(),
                c = fH(a);
              for (; c; ) (b.add(c), (c = fH(c)));
              return b;
            })(a),
            e = (function (a, b) {
              let c = new Set();
              for (let d of a) {
                let a = (function (a, b) {
                  let c = fN.get(a);
                  return (
                    c ||
                      (c = {
                        disconnect: new fM(
                          a,
                          (b) => {
                            let c = fN.get(a);
                            c && c.callbacks.forEach((a) => a(b));
                          },
                          { skipInitial: !0 }
                        ).disconnect,
                        callbacks: new Set(),
                      }),
                    c.callbacks.add(b),
                    fN.set(a, c),
                    () => {
                      (c.callbacks.delete(b),
                        0 === c.callbacks.size && (fN.delete(a), c.disconnect()));
                    }
                  );
                })(d, b);
                c.add(a);
              }
              return () => c.forEach((a) => a());
            })(d, b),
            f = (function (a, b) {
              var c;
              let d = a.ownerDocument;
              if (!fO.has(d)) {
                let a = new AbortController(),
                  b = new Set();
                (document.addEventListener("scroll", (a) => b.forEach((b) => b(a)), {
                  capture: !0,
                  passive: !0,
                  signal: a.signal,
                }),
                  fO.set(d, { disconnect: () => a.abort(), listeners: b }));
              }
              let { listeners: e, disconnect: f } = null != (c = fO.get(d)) ? c : {};
              return e && f
                ? (e.add(b),
                  () => {
                    (e.delete(b), 0 === e.size && (f(), fO.delete(d)));
                  })
                : () => {};
            })(a, fn(this, bp));
          (fp(this, bo, d),
            fp(this, bm, new fM(a, b, c)),
            (this.disconnect = () => {
              fn(this, bn) || (fp(this, bn, !0), e(), f(), fn(this, bm).disconnect());
            }));
        }
      };
    function fQ(a) {
      return (
        "showPopover" in a &&
        "hidePopover" in a &&
        "function" == typeof a.showPopover &&
        "function" == typeof a.hidePopover
      );
    }
    function fR(a) {
      try {
        fQ(a) &&
          a.isConnected &&
          a.hasAttribute("popover") &&
          !a.matches(":popover-open") &&
          a.showPopover();
      } catch (a) {}
    }
    function fS(a) {
      fw(a);
      let b = ft(a),
        c = { height: a.clientHeight, width: a.clientWidth },
        d = {
          current: { x: a.scrollLeft, y: a.scrollTop },
          max: { x: a.scrollWidth - c.width, y: a.scrollHeight - c.height },
        },
        e = d.current.y <= 0,
        f = d.current.x <= 0,
        g = d.current.y >= d.max.y,
        h = d.current.x >= d.max.x;
      return { rect: b, position: d, isTop: e, isLeft: f, isBottom: g, isRight: h };
    }
    ((bm = new WeakMap()), (bn = new WeakMap()), (bo = new WeakMap()), (bp = new WeakMap()));
    var fT = class {
        constructor(a) {
          ((this.scheduler = a),
            (this.pending = !1),
            (this.tasks = new Set()),
            (this.resolvers = new Set()),
            (this.flush = () => {
              let { tasks: a, resolvers: b } = this;
              for (let b of ((this.pending = !1),
              (this.tasks = new Set()),
              (this.resolvers = new Set()),
              a))
                b();
              for (let a of b) a();
            }));
        }
        schedule(a) {
          return (
            this.tasks.add(a),
            this.pending || ((this.pending = !0), this.scheduler(this.flush)),
            new Promise((a) => this.resolvers.add(a))
          );
        }
      },
      fU = new fT((a) => {
        "function" == typeof requestAnimationFrame ? requestAnimationFrame(a) : a();
      }),
      fV = new fT((a) => setTimeout(a, 50)),
      fW = new Map(),
      fX = fW.clear.bind(fW);
    function fY(a, b = !1) {
      if (!b) return fZ(a);
      let c = fW.get(a);
      return (c || ((c = fZ(a)), fW.set(a, c), fV.schedule(fX)), c);
    }
    function fZ(a) {
      return fw(a).getComputedStyle(a);
    }
    var f$ = { excludeElement: !0 };
    function f_(a, b = f$) {
      let { limit: c, excludeElement: d } = b,
        e = new Set();
      return a
        ? (function b(f) {
            if ((null != c && e.size >= c) || !f) return e;
            if (fx(f) && null != f.scrollingElement && !e.has(f.scrollingElement))
              return (e.add(f.scrollingElement), e);
            if (!fy(f)) return fz(f) ? b(f.parentElement) : e;
            if (e.has(f)) return e;
            let g = fY(f, !0);
            if (
              ((d && f === a) ||
                ((function (a, b = fY(a, !0)) {
                  let c = /(auto|scroll|overlay)/;
                  return ["overflow", "overflowX", "overflowY"].some((a) => {
                    let d = b[a];
                    return "string" == typeof d && c.test(d);
                  });
                })(f, g) &&
                  e.add(f)),
              (function (a, b = fY(a, !0)) {
                return "fixed" === b.position || "sticky" === b.position;
              })(f, g))
            ) {
              let { scrollingElement: a } = f.ownerDocument;
              return (a && e.add(a), e);
            }
            return b(f.parentNode);
          })(a)
        : e;
    }
    function f0(a, b = window.frameElement) {
      let c = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
      if (!a) return c;
      let d = fH(a);
      for (; d && d !== b; ) {
        let a = ft(d),
          { x: b, y: e } = (function (a, b = ft(a)) {
            let c = Math.round(b.width),
              d = Math.round(b.height);
            if (fy(a)) return { x: c / a.offsetWidth, y: d / a.offsetHeight };
            let e = fY(a, !0);
            return { x: (parseFloat(e.width) || c) / c, y: (parseFloat(e.height) || d) / d };
          })(d, a);
        ((c.x = c.x + a.left),
          (c.y = c.y + a.top),
          (c.scaleX = c.scaleX * b),
          (c.scaleY = c.scaleY * e),
          (d = fH(d)));
      }
      return c;
    }
    function f1(a) {
      if ("none" === a) return null;
      let [b, c, d = "0"] = a.split(" "),
        e = { x: parseFloat(b), y: parseFloat(c), z: parseInt(d, 10) };
      return isNaN(e.x) && isNaN(e.y)
        ? null
        : { x: isNaN(e.x) ? 0 : e.x, y: isNaN(e.y) ? 0 : e.y, z: isNaN(e.z) ? 0 : e.z };
    }
    function f2(a) {
      var b, c, d, e, f, g, h, i, j;
      let { scale: k, transform: l, translate: m } = a,
        n = (function (a) {
          if ("none" === a) return null;
          let b = a.split(" "),
            c = parseFloat(b[0]),
            d = parseFloat(b[1]);
          return isNaN(c) && isNaN(d) ? null : { x: isNaN(c) ? d : c, y: isNaN(d) ? c : d };
        })(k),
        o = f1(m),
        p = (function (a) {
          if (a.startsWith("matrix3d(")) {
            let b = a.slice(9, -1).split(/, /);
            return { x: +b[12], y: +b[13], scaleX: +b[0], scaleY: +b[5] };
          }
          if (a.startsWith("matrix(")) {
            let b = a.slice(7, -1).split(/, /);
            return { x: +b[4], y: +b[5], scaleX: +b[0], scaleY: +b[3] };
          }
          return null;
        })(l);
      if (!p && !n && !o) return null;
      let q = {
          x: null != (b = null == n ? void 0 : n.x) ? b : 1,
          y: null != (c = null == n ? void 0 : n.y) ? c : 1,
        },
        r = {
          x: null != (d = null == o ? void 0 : o.x) ? d : 0,
          y: null != (e = null == o ? void 0 : o.y) ? e : 0,
        },
        s = {
          x: null != (f = null == p ? void 0 : p.x) ? f : 0,
          y: null != (g = null == p ? void 0 : p.y) ? g : 0,
          scaleX: null != (h = null == p ? void 0 : p.scaleX) ? h : 1,
          scaleY: null != (i = null == p ? void 0 : p.scaleY) ? i : 1,
        };
      return {
        x: r.x + s.x,
        y: r.y + s.y,
        z: null != (j = null == o ? void 0 : o.z) ? j : 0,
        scaleX: q.x * s.scaleX,
        scaleY: q.y * s.scaleY,
      };
    }
    var f3 =
        (((s = f3 || {})[(s.Idle = 0)] = "Idle"),
        (s[(s.Forward = 1)] = "Forward"),
        (s[(s.Reverse = -1)] = "Reverse"),
        s),
      f4 = { x: 0.2, y: 0.2 },
      f5 = { x: 10, y: 10 };
    function f6(a, b = !1) {
      if ("scrollIntoViewIfNeeded" in a && "function" == typeof a.scrollIntoViewIfNeeded)
        return void a.scrollIntoViewIfNeeded(b);
      if (!fy(a)) return a.scrollIntoView();
      var c = (function (a) {
        let [b] = f_(a, { limit: 1 });
        return null != b ? b : null;
      })(a);
      if (!fy(c)) return;
      let d = fY(c, !0),
        e = parseInt(d.getPropertyValue("border-top-width")),
        f = parseInt(d.getPropertyValue("border-left-width")),
        g = a.offsetTop - c.offsetTop < c.scrollTop,
        h = a.offsetTop - c.offsetTop + a.clientHeight - e > c.scrollTop + c.clientHeight,
        i = a.offsetLeft - c.offsetLeft < c.scrollLeft,
        j = a.offsetLeft - c.offsetLeft + a.clientWidth - f > c.scrollLeft + c.clientWidth;
      ((g || h) &&
        b &&
        (c.scrollTop = a.offsetTop - c.offsetTop - c.clientHeight / 2 - e + a.clientHeight / 2),
        (i || j) &&
          b &&
          (c.scrollLeft = a.offsetLeft - c.offsetLeft - c.clientWidth / 2 - f + a.clientWidth / 2),
        (g || h || i || j) && !b && a.scrollIntoView(g && !h));
    }
    function f7({ element: a, keyframes: b, options: c }) {
      return a.animate(b, c).finished;
    }
    function f8(a, b = fY(a).translate, c = !0) {
      if (c) {
        let b = fs(a, (a) => "translate" in a);
        if (b) {
          let { translate: a = "" } = b[0];
          if ("string" == typeof a) {
            let b = f1(a);
            if (b) return b;
          }
        }
      }
      if (b) {
        let a = f1(b);
        if (a) return a;
      }
      return { x: 0, y: 0, z: 0 };
    }
    var f9 = new fT((a) => setTimeout(a, 0)),
      ga = new Map(),
      gb = ga.clear.bind(ga),
      gc = class extends ep {
        constructor(a, b = {}) {
          var c, d, e, f;
          let g;
          const {
              frameTransform: h = f0(a),
              ignoreTransforms: i,
              getBoundingClientRect: j = ft,
            } = b,
            k = (function (a, b) {
              let c = (function (a) {
                let b = a.ownerDocument,
                  c = ga.get(b);
                if (c) return c;
                ((c = b.getAnimations()), ga.set(b, c), f9.schedule(gb));
                let d = c.filter((b) => fr(b.effect) && b.effect.target === a);
                return (ga.set(a, d), c);
              })(a)
                .filter((a) => {
                  var c, d;
                  if (fr(a.effect)) {
                    let { target: e } = a.effect;
                    if (
                      null == (d = e && (null == (c = b.isValidTarget) ? void 0 : c.call(b, e))) ||
                      d
                    )
                      return a.effect.getKeyframes().some((a) => {
                        for (let c of b.properties) if (a[c]) return !0;
                      });
                  }
                })
                .map((a) => {
                  let { effect: b, currentTime: c } = a,
                    d = null == b ? void 0 : b.getComputedTiming().duration;
                  if (
                    !a.pending &&
                    "finished" !== a.playState &&
                    "number" == typeof d &&
                    "number" == typeof c &&
                    c < d
                  )
                    return (
                      (a.currentTime = d),
                      () => {
                        a.currentTime = c;
                      }
                    );
                });
              if (c.length > 0) return () => c.forEach((a) => (null == a ? void 0 : a()));
            })(a, {
              properties: ["transform", "translate", "scale", "width", "height"],
              isValidTarget: (b) => (b !== a || fC()) && b.contains(a),
            }),
            l = j(a);
          let { top: m, left: n, width: o, height: p } = l;
          const q = fY(a),
            r = f2(q),
            s = {
              x: null != (c = null == r ? void 0 : r.scaleX) ? c : 1,
              y: null != (d = null == r ? void 0 : r.scaleY) ? d : 1,
            },
            t = (function (a, b) {
              var c;
              let d = a.getAnimations(),
                e = null;
              if (!d.length) return null;
              for (let a of d) {
                if ("running" !== a.playState) continue;
                let d = fr(a.effect) ? a.effect.getKeyframes() : [],
                  f = d[d.length - 1];
                if (!f) continue;
                let { transform: g, translate: h, scale: i } = f;
                if (g || h || i) {
                  let a = f2({
                    transform: "string" == typeof g && g ? g : b.transform,
                    translate: "string" == typeof h && h ? h : b.translate,
                    scale: "string" == typeof i && i ? i : b.scale,
                  });
                  a &&
                    (e = e
                      ? {
                          x: e.x + a.x,
                          y: e.y + a.y,
                          z: null != (c = e.z) ? c : a.z,
                          scaleX: e.scaleX * a.scaleX,
                          scaleY: e.scaleY * a.scaleY,
                        }
                      : a);
                }
              }
              return e;
            })(a, q);
          (null == k || k(),
            r &&
              ((g = (function (a, b, c) {
                let { scaleX: d, scaleY: e, x: f, y: g } = b,
                  h = a.left - f - (1 - d) * parseFloat(c),
                  i = a.top - g - (1 - e) * parseFloat(c.slice(c.indexOf(" ") + 1)),
                  j = d ? a.width / d : a.width,
                  k = e ? a.height / e : a.height;
                return { width: j, height: k, top: i, right: h + j, bottom: i + k, left: h };
              })(l, r, q.transformOrigin)),
              (i || t) && ((m = g.top), (n = g.left), (o = g.width), (p = g.height))));
          const u = {
            width: null != (e = null == g ? void 0 : g.width) ? e : o,
            height: null != (f = null == g ? void 0 : g.height) ? f : p,
          };
          if (t && !i && g) {
            const a = (function (a, b, c) {
              let { scaleX: d, scaleY: e, x: f, y: g } = b,
                h = a.left + f + (1 - d) * parseFloat(c),
                i = a.top + g + (1 - e) * parseFloat(c.slice(c.indexOf(" ") + 1)),
                j = d ? a.width * d : a.width,
                k = e ? a.height * e : a.height;
              return { width: j, height: k, top: i, right: h + j, bottom: i + k, left: h };
            })(g, t, q.transformOrigin);
            ((m = a.top),
              (n = a.left),
              (o = a.width),
              (p = a.height),
              (s.x = t.scaleX),
              (s.y = t.scaleY));
          }
          (h &&
            (i || ((n *= h.scaleX), (o *= h.scaleX), (m *= h.scaleY), (p *= h.scaleY)),
            (n += h.x),
            (m += h.y)),
            super(n, m, o, p),
            (this.scale = s),
            (this.intrinsicWidth = u.width),
            (this.intrinsicHeight = u.height));
        }
      };
    function gd(a) {
      return (
        "style" in a &&
        "object" == typeof a.style &&
        null !== a.style &&
        "setProperty" in a.style &&
        "removeProperty" in a.style &&
        "function" == typeof a.style.setProperty &&
        "function" == typeof a.style.removeProperty
      );
    }
    var ge = class {
      constructor(a) {
        ((this.element = a), (this.initial = new Map()));
      }
      set(a, b = "") {
        let { element: c } = this;
        if (gd(c))
          for (let [d, e] of Object.entries(a)) {
            let a = `${b}${d}`;
            (this.initial.has(a) || this.initial.set(a, c.style.getPropertyValue(a)),
              c.style.setProperty(a, "string" == typeof e ? e : `${e}px`));
          }
      }
      remove(a, b = "") {
        let { element: c } = this;
        if (gd(c))
          for (let d of a) {
            let a = `${b}${d}`;
            c.style.removeProperty(a);
          }
      }
      reset() {
        let { element: a } = this;
        if (gd(a)) {
          for (let [b, c] of this.initial) a.style.setProperty(b, c);
          "" === a.getAttribute("style") && a.removeAttribute("style");
        }
      }
    };
    function gf(a) {
      return !!a && (a instanceof fw(a).Element || (fv(a) && a.nodeType === Node.ELEMENT_NODE));
    }
    function gg(a) {
      if (!a) return !1;
      let { KeyboardEvent: b } = fw(a.target);
      return a instanceof b;
    }
    var gh = {};
    function gi(a) {
      let b = null == gh[a] ? 0 : gh[a] + 1;
      return ((gh[a] = b), `${a}-${b}`);
    }
    var gj = (a) => {
        var b;
        return null !=
          (b = (({ dragOperation: a, droppable: b }) => {
            let c = a.position.current;
            if (!c) return null;
            let { id: d } = b;
            return b.shape && b.shape.containsPoint(c)
              ? {
                  id: d,
                  value: 1 / eo.distance(b.shape.center, c),
                  type: e8.PointerIntersection,
                  priority: e7.High,
                }
              : null;
          })(a))
          ? b
          : (({ dragOperation: a, droppable: b }) => {
              let { shape: c } = a;
              if (!b.shape || !(null == c ? void 0 : c.current)) return null;
              let d = c.current.intersectionArea(b.shape);
              if (d) {
                let { position: e } = a,
                  f = eo.distance(b.shape.center, e.current),
                  g = d / (c.current.area + b.shape.area - d);
                return { id: b.id, value: g / f, type: e8.ShapeIntersection, priority: e7.Normal };
              }
              return null;
            })(a);
      },
      gk = (a) => {
        let { dragOperation: b, droppable: c } = a,
          { shape: d, position: e } = b;
        if (!c.shape) return null;
        let f = d ? ep.from(d.current.boundingRectangle).corners : void 0,
          g = ep.from(c.shape.boundingRectangle).corners.reduce((a, b, c) => {
            var d;
            return (
              a + eo.distance(eo.from(b), null != (d = null == f ? void 0 : f[c]) ? d : e.current)
            );
          }, 0);
        return { id: c.id, value: 1 / (g / 4), type: e8.Collision, priority: e7.Normal };
      },
      gl = Object.create,
      gm = Object.defineProperty,
      gn = Object.defineProperties,
      go = Object.getOwnPropertyDescriptor,
      gp = Object.getOwnPropertyDescriptors,
      gq = Object.getOwnPropertySymbols,
      gr = Object.prototype.hasOwnProperty,
      gs = Object.prototype.propertyIsEnumerable,
      gt = (a, b) => ((b = Symbol[a]) ? b : Symbol.for("Symbol." + a)),
      gu = (a) => {
        throw TypeError(a);
      },
      gv = (a, b, c) =>
        b in a
          ? gm(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      gw = (a, b) => {
        for (var c in b || (b = {})) gr.call(b, c) && gv(a, c, b[c]);
        if (gq) for (var c of gq(b)) gs.call(b, c) && gv(a, c, b[c]);
        return a;
      },
      gx = (a, b) => gm(a, "name", { value: b, configurable: !0 }),
      gy = (a, b) => {
        var c = {};
        for (var d in a) gr.call(a, d) && 0 > b.indexOf(d) && (c[d] = a[d]);
        if (null != a && gq)
          for (var d of gq(a)) 0 > b.indexOf(d) && gs.call(a, d) && (c[d] = a[d]);
        return c;
      },
      gz = (a) => {
        var b;
        return [, , , gl(null != (b = null == a ? void 0 : a[gt("metadata")]) ? b : null)];
      },
      gA = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      gB = (a) => (void 0 !== a && "function" != typeof a ? gu("Function expected") : a),
      gC = (a, b, c, d, e) => ({
        kind: gA[a],
        name: b,
        metadata: d,
        addInitializer: (a) => (c._ ? gu("Already initialized") : e.push(gB(a || null))),
      }),
      gD = (a, b) => gv(b, gt("metadata"), a[3]),
      gE = (a, b, c, d) => {
        for (var e = 0, f = a[b >> 1], g = f && f.length; e < g; e++)
          1 & b ? f[e].call(c) : (d = f[e].call(c, d));
        return d;
      },
      gF = (a, b, c, d, e, f) => {
        var g,
          h,
          i,
          j,
          k,
          l = 7 & b,
          m = !!(8 & b),
          n = !!(16 & b),
          o = l > 3 ? a.length + 1 : l ? (m ? 1 : 2) : 0,
          p = gA[l + 5],
          q = l > 3 && (a[o - 1] = []),
          r = a[o] || (a[o] = []),
          s =
            l &&
            (n || m || (e = e.prototype),
            l < 5 &&
              (l > 3 || !n) &&
              go(
                l < 4
                  ? e
                  : {
                      get [c]() {
                        return gI(this, f);
                      },
                      set [c](x) {
                        return gK(this, f, x);
                      },
                    },
                c
              ));
        l ? n && l < 4 && gx(f, (l > 2 ? "set " : l > 1 ? "get " : "") + c) : gx(e, c);
        for (var t = d.length - 1; t >= 0; t--)
          ((j = gC(l, c, (i = {}), a[3], r)),
            l &&
              ((j.static = m),
              (j.private = n),
              (k = j.access = { has: n ? (a) => gH(e, a) : (a) => c in a }),
              3 ^ l &&
                (k.get = n ? (a) => (1 ^ l ? gI : gL)(a, e, 4 ^ l ? f : s.get) : (a) => a[c]),
              l > 2 &&
                (k.set = n ? (a, b) => gK(a, e, b, 4 ^ l ? f : s.set) : (a, b) => (a[c] = b))),
            (h = (0, d[t])(
              l ? (l < 4 ? (n ? f : s[p]) : l > 4 ? void 0 : { get: s.get, set: s.set }) : e,
              j
            )),
            (i._ = 1),
            4 ^ l || void 0 === h
              ? gB(h) && (l > 4 ? q.unshift(h) : l ? (n ? (f = h) : (s[p] = h)) : (e = h))
              : "object" != typeof h || null === h
                ? gu("Object expected")
                : (gB((g = h.get)) && (s.get = g),
                  gB((g = h.set)) && (s.set = g),
                  gB((g = h.init)) && q.unshift(g)));
        return (l || gD(a, e), s && gm(e, c, s), n ? (4 ^ l ? f : s) : e);
      },
      gG = (a, b, c) => b.has(a) || gu("Cannot " + c),
      gH = (a, b) =>
        Object(b) !== b ? gu('Cannot use the "in" operator on this value') : a.has(b),
      gI = (a, b, c) => (gG(a, b, "read from private field"), c ? c.call(a) : b.get(a)),
      gJ = (a, b, c) =>
        b.has(a)
          ? gu("Cannot add the same private member more than once")
          : b instanceof WeakSet
            ? b.add(a)
            : b.set(a, c),
      gK = (a, b, c, d) => (gG(a, b, "write to private field"), d ? d.call(a, c) : b.set(a, c), c),
      gL = (a, b, c) => (gG(a, b, "access private method"), c),
      gM = {
        draggable:
          "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item in a given direction. Press space again to drop the item in its new position, or press escape to cancel.",
      },
      gN = {
        dragstart({ operation: { source: a } }) {
          if (a) return `Picked up draggable item ${a.id}.`;
        },
        dragover({ operation: { source: a, target: b } }) {
          if (a && a.id !== (null == b ? void 0 : b.id))
            return b
              ? `Draggable item ${a.id} was moved over droppable target ${b.id}.`
              : `Draggable item ${a.id} is no longer over a droppable target.`;
        },
        dragend({ operation: { source: a, target: b }, canceled: c }) {
          if (a)
            return c
              ? `Dragging was cancelled. Draggable item ${a.id} was dropped.`
              : b
                ? `Draggable item ${a.id} was dropped over droppable target ${b.id}`
                : `Draggable item ${a.id} was dropped.`;
        },
      },
      gO = ["dragover", "dragmove"],
      gP = class extends eZ {
        constructor(a, b) {
          let c, d, e, f;
          super(a);
          const {
              id: g,
              idPrefix: {
                description: h = "dnd-kit-description",
                announcement: i = "dnd-kit-announcement",
              } = {},
              announcements: j = gN,
              screenReaderInstructions: k = gM,
              debounce: l = 500,
            } = null != b ? b : {},
            m = g ? `${h}-${g}` : gi(h),
            n = g ? `${i}-${g}` : gi(i),
            o = (a = f) => {
              e && a && (null == e ? void 0 : e.nodeValue) !== a && (e.nodeValue = a);
            },
            p = () => fU.schedule(o),
            q = (function (a, b) {
              let c,
                d = () => {
                  (clearTimeout(c), (c = setTimeout(a, b)));
                };
              return ((d.cancel = () => clearTimeout(c)), d);
            })(p, l),
            r = Object.entries(j).map(([a, b]) =>
              this.manager.monitor.addEventListener(a, (c, d) => {
                let g = e;
                if (!g) return;
                let h = null == b ? void 0 : b(c, d);
                h && g.nodeValue !== h && ((f = h), gO.includes(a) ? q() : (p(), q.cancel()));
              })
            ),
            s = () => {
              var a;
              let b = [];
              if (!(null == c ? void 0 : c.isConnected)) {
                let d;
                ((a = k.draggable),
                  ((d = document.createElement("div")).id = m),
                  d.style.setProperty("display", "none"),
                  (d.textContent = a),
                  (c = d),
                  b.push(c));
              }
              if (!(null == d ? void 0 : d.isConnected)) {
                let a;
                (((a = document.createElement("div")).id = n),
                  a.setAttribute("role", "status"),
                  a.setAttribute("aria-live", "polite"),
                  a.setAttribute("aria-atomic", "true"),
                  a.style.setProperty("position", "fixed"),
                  a.style.setProperty("width", "1px"),
                  a.style.setProperty("height", "1px"),
                  a.style.setProperty("margin", "-1px"),
                  a.style.setProperty("border", "0"),
                  a.style.setProperty("padding", "0"),
                  a.style.setProperty("overflow", "hidden"),
                  a.style.setProperty("clip", "rect(0 0 0 0)"),
                  a.style.setProperty("clip-path", "inset(100%)"),
                  a.style.setProperty("white-space", "nowrap"),
                  (d = a),
                  (e = document.createTextNode("")),
                  d.appendChild(e),
                  b.push(d));
              }
              b.length > 0 && document.body.append(...b);
            },
            t = new Set();
          function u() {
            for (let a of t) a();
          }
          (this.registerEffect(() => {
            var a;
            for (let b of (t.clear(), this.manager.registry.draggables.value)) {
              let e = null != (a = b.handle) ? a : b.element;
              if (e) {
                for (let a of ((c && d) || t.add(s),
                (!["input", "select", "textarea", "a", "button"].includes(
                  e.tagName.toLowerCase()
                ) ||
                  fC()) &&
                  !e.hasAttribute("tabindex") &&
                  t.add(() => e.setAttribute("tabindex", "0")),
                e.hasAttribute("role") ||
                  "button" === e.tagName.toLowerCase() ||
                  t.add(() => e.setAttribute("role", "button")),
                e.hasAttribute("aria-roledescription") ||
                  t.add(() => e.setAttribute("aria-roledescription", "draggable")),
                e.hasAttribute("aria-describedby") ||
                  t.add(() => e.setAttribute("aria-describedby", m)),
                ["aria-pressed", "aria-grabbed"])) {
                  let c = String(b.isDragging);
                  e.getAttribute(a) !== c && t.add(() => e.setAttribute(a, c));
                }
                let a = String(b.disabled);
                e.getAttribute("aria-disabled") !== a &&
                  t.add(() => e.setAttribute("aria-disabled", a));
              }
            }
            t.size > 0 && fU.schedule(u);
          }),
            (this.destroy = () => {
              (super.destroy(),
                null == c || c.remove(),
                null == d || d.remove(),
                r.forEach((a) => a()));
            }));
        }
      },
      gQ = class extends eZ {
        constructor(a, b) {
          (super(a, b), (this.manager = a));
          const c = dW(() => {
            var a;
            return fA(null == (a = this.manager.dragOperation.source) ? void 0 : a.element);
          });
          this.destroy = dy(() => {
            var a;
            let { dragOperation: b } = this.manager,
              { cursor: d = "grabbing", nonce: e } = null != (a = this.options) ? a : {};
            if (b.status.initialized) {
              let a = c.value,
                b = a.createElement("style");
              return (
                e && b.setAttribute("nonce", e),
                (b.textContent = `* { cursor: ${d} !important; }`),
                a.head.appendChild(b),
                () => b.remove()
              );
            }
          });
        }
      },
      gR = "data-dnd-",
      gS = `${gR}dropping`,
      gT = "--dnd-",
      gU = `${gR}dragging`,
      gV = `${gR}placeholder`,
      gW = [gU, gV, "popover", "aria-pressed", "aria-grabbing"],
      gX = ["view-transition-name"],
      gY = `
  :root [${gU}] {
    position: fixed !important;
    pointer-events: none !important;
    touch-action: none;
    z-index: calc(infinity);
    will-change: translate;
    top: var(${gT}top, 0px) !important;
    left: var(${gT}left, 0px) !important;
    right: unset !important;
    bottom: unset !important;
    width: var(${gT}width, auto);
    max-width: var(${gT}width, auto);
    height: var(${gT}height, auto);
    max-height: var(${gT}height, auto);
    transition: var(${gT}transition) !important;
  }

  :root [${gV}] {
    transition: none;
  }

  :root [${gV}='hidden'] {
    visibility: hidden;
  }

  [${gU}] * {
    pointer-events: none !important;
  }

  [${gU}]:not([${gS}]) {
    translate: var(${gT}translate) !important;
  }

  [${gU}][style*='${gT}scale'] {
    scale: var(${gT}scale) !important;
    transform-origin: var(${gT}transform-origin) !important;
  }

  @layer {
    :where([${gU}][popover]) {
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
  [${gU}]::backdrop, [${gR}overlay]:not([${gU}]) {
    display: none;
    visibility: hidden;
  }
`
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    function gZ(a, b) {
      return a === b || fH(a) === fH(b);
    }
    function g$(a) {
      let { target: b } = a;
      "newState" in a &&
        "closed" === a.newState &&
        gf(b) &&
        b.hasAttribute("popover") &&
        requestAnimationFrame(() => fR(b));
    }
    function g_(a) {
      return "TR" === a.tagName;
    }
    var g0 = new Map(),
      g1 = class extends ((br = eZ), (bq = [dY]), br) {
        constructor(a, b) {
          (super(a, b),
            gJ(this, bu),
            gJ(this, bt, gE(bs, 8, this)),
            gE(bs, 11, this),
            (this.state = { initial: {}, current: {} }),
            this.registerEffect(gL(this, bu, bw)),
            this.registerEffect(gL(this, bu, bv)));
        }
        destroy() {
          for (let [a, b] of (super.destroy(), g0.entries()))
            b.instances.has(this) &&
              (b.instances.delete(this), 0 === b.instances.size && (b.cleanup(), g0.delete(a)));
        }
      };
    ((bs = gz(br)),
      (bt = new WeakMap()),
      (bu = new WeakSet()),
      (bv = function () {
        var a, b, c;
        let d,
          e,
          { state: f, manager: g, options: h } = this,
          { dragOperation: i } = g,
          { position: j, source: k, status: l } = i;
        if (l.idle) {
          ((f.current = {}), (f.initial = {}));
          return;
        }
        if (!k) return;
        let { element: m, feedback: n } = k;
        if (!m || "none" === n || !l.initialized || l.initializing) return;
        let { initial: o } = f,
          p = null != (a = this.overlay) ? a : m,
          q = f0(p),
          r = f0(m),
          s = !gZ(m, p),
          t = new gc(m, { frameTransform: s ? r : null, ignoreTransforms: !s }),
          u = { x: r.scaleX / q.scaleX, y: r.scaleY / q.scaleY },
          { width: v, height: w, top: y, left: z } = t;
        s && ((v /= u.x), (w /= u.y));
        let A = new ge(p),
          {
            transition: B,
            translate: C,
            boxSizing: D,
            paddingBlockStart: E,
            paddingBlockEnd: F,
            paddingInlineStart: G,
            paddingInlineEnd: H,
            borderInlineStartWidth: I,
            borderInlineEndWidth: J,
            borderBlockStartWidth: K,
            borderBlockEndWidth: L,
          } = fY(m),
          M = "clone" === n,
          N = "content-box" === D,
          O = N ? parseInt(G) + parseInt(H) + parseInt(I) + parseInt(J) : 0,
          P = N ? parseInt(E) + parseInt(F) + parseInt(K) + parseInt(L) : 0,
          Q =
            "move" === n || this.overlay
              ? null
              : (function (a, b = "hidden") {
                  return de(() => {
                    let c,
                      d,
                      e,
                      { element: f, manager: g } = a;
                    if (!f || !g) return;
                    let h = (function (a, b) {
                        let c = new Map();
                        for (let d of b)
                          if (d.element && (a === d.element || a.contains(d.element))) {
                            let a = `${gR}${gi("dom-id")}`;
                            (d.element.setAttribute(a, ""), c.set(d, a));
                          }
                        return c;
                      })(f, g.registry.droppables),
                      i = [],
                      j =
                        ((c = "input, textarea, select, canvas, [contenteditable]"),
                        (d = f.cloneNode(!0)),
                        (e = Array.from(f.querySelectorAll(c))),
                        Array.from(d.querySelectorAll(c)).forEach((a, b) => {
                          let c = e[b];
                          if (
                            (fD(a) &&
                              fD(c) &&
                              ("file" !== a.type && (a.value = c.value),
                              "radio" === a.type && a.name && (a.name = `Cloned__${a.name}`)),
                            fE(a) && fE(c) && c.width > 0 && c.height > 0)
                          ) {
                            let b = a.getContext("2d");
                            null == b || b.drawImage(c, 0, 0);
                          }
                        }),
                        d),
                      { remove: k } = j;
                    return (
                      (function (a, b, c) {
                        for (let [d, e] of a) {
                          if (!d.element) continue;
                          let a = `[${e}]`,
                            f = b.matches(a) ? b : b.querySelector(a);
                          if ((d.element.removeAttribute(e), !f)) continue;
                          let g = d.element;
                          ((d.proxy = f),
                            f.removeAttribute(e),
                            fF.set(g, f),
                            c.push(() => {
                              (fF.delete(g), (d.proxy = void 0));
                            }));
                        }
                      })(h, j, i),
                      (function (a, b = "hidden") {
                        (a.setAttribute("inert", "true"),
                          a.setAttribute("tab-index", "-1"),
                          a.setAttribute("aria-hidden", "true"),
                          a.setAttribute(gV, b));
                      })(j, b),
                      (j.remove = () => {
                        (i.forEach((a) => a()), k.call(j));
                      }),
                      j
                    );
                  });
                })(k, M ? "clone" : "hidden"),
          R = de(() => gg(g.dragOperation.activatorEvent));
        if ("none" !== C) {
          let a = f1(C);
          a && !o.translate && (o.translate = a);
        }
        if (!o.transformOrigin) {
          let a = de(() => j.current);
          o.transformOrigin = {
            x: (a.x - z * q.scaleX - q.x) / (v * q.scaleX),
            y: (a.y - y * q.scaleY - q.y) / (w * q.scaleY),
          };
        }
        let { transformOrigin: S } = o,
          T = y * q.scaleY + q.y,
          U = z * q.scaleX + q.x;
        if (!o.coordinates && ((o.coordinates = { x: U, y: T }), 1 !== u.x || 1 !== u.y)) {
          let { scaleX: a, scaleY: b } = r,
            { x: c, y: d } = S;
          ((o.coordinates.x += (v * a - v) * c), (o.coordinates.y += (w * b - w) * d));
        }
        (o.dimensions || (o.dimensions = { width: v, height: w }),
          o.frameTransform || (o.frameTransform = q));
        let V = { x: o.coordinates.x - U, y: o.coordinates.y - T },
          W = {
            width: (o.dimensions.width * o.frameTransform.scaleX - v * q.scaleX) * S.x,
            height: (o.dimensions.height * o.frameTransform.scaleY - w * q.scaleY) * S.y,
          },
          X = { x: V.x / q.scaleX + W.width, y: V.y / q.scaleY + W.height },
          Y = { left: z + X.x, top: y + X.y };
        p.setAttribute(gU, "true");
        let Z = de(() => i.transform),
          $ = null != (b = o.translate) ? b : { x: 0, y: 0 },
          _ = Z.x * q.scaleX + $.x,
          aa = Z.y * q.scaleY + $.y,
          ab = `${_}px ${aa}px 0`,
          ac = B ? `${B}, translate 0ms linear` : "";
        (A.set(
          {
            width: v - O,
            height: w - P,
            top: Y.top,
            left: Y.left,
            translate: ab,
            transition: ac,
            scale: s ? `${u.x} ${u.y}` : "",
            "transform-origin": `${100 * S.x}% ${100 * S.y}%`,
          },
          gT
        ),
          Q &&
            (m.insertAdjacentElement("afterend", Q),
            (null == h ? void 0 : h.rootElement) &&
              ("function" == typeof h.rootElement ? h.rootElement(k) : h.rootElement).appendChild(
                m
              )),
          fQ(p) &&
            (p.hasAttribute("popover") || p.setAttribute("popover", "manual"),
            fR(p),
            p.addEventListener("beforetoggle", g$)));
        let ad = new ResizeObserver(() => {
            if (!Q) return;
            let a = new gc(Q, { frameTransform: q, ignoreTransforms: !0 }),
              b = null != S ? S : { x: 1, y: 1 },
              c = (v - a.width) * b.x + X.x,
              e = (w - a.height) * b.y + X.y;
            if (
              (A.set({ width: a.width - O, height: a.height - P, top: y + e, left: z + c }, gT),
              null == d || d.takeRecords(),
              g_(m) && g_(Q))
            ) {
              let a = Array.from(m.cells),
                b = Array.from(Q.cells);
              for (let [c, d] of a.entries()) {
                let a = b[c];
                d.style.width = `${a.offsetWidth}px`;
              }
            }
            i.shape = new gc(p);
          }),
          ae = new gc(p);
        de(() => (i.shape = ae));
        let af = fw(p),
          ag = (a) => {
            this.manager.actions.stop({ event: a });
          };
        (R && af.addEventListener("resize", ag),
          "idle" === de(() => k.status) && requestAnimationFrame(() => (k.status = "dragging")),
          Q &&
            (ad.observe(Q),
            (d = new MutationObserver((a) => {
              let b = !1;
              for (let c of a) {
                if (c.target !== m) {
                  b = !0;
                  continue;
                }
                if ("attributes" !== c.type) continue;
                let a = c.attributeName;
                if (a.startsWith("aria-") || gW.includes(a)) continue;
                let d = m.getAttribute(a);
                if ("style" === a) {
                  if (gd(m) && gd(Q)) {
                    let a = m.style;
                    for (let b of Array.from(Q.style))
                      "" === a.getPropertyValue(b) && Q.style.removeProperty(b);
                    for (let b of Array.from(a)) {
                      if (gX.includes(b) || b.startsWith(gT)) continue;
                      let c = a.getPropertyValue(b);
                      Q.style.setProperty(b, c);
                    }
                  }
                } else null !== d ? Q.setAttribute(a, d) : Q.removeAttribute(a);
              }
              b && M && (Q.innerHTML = m.innerHTML);
            })).observe(m, { attributes: !0, subtree: !0, childList: !0 }),
            (e = new MutationObserver((a) => {
              for (let b of a)
                if (0 !== b.addedNodes.length)
                  for (let a of Array.from(b.addedNodes)) {
                    if (a.contains(m) && m.nextElementSibling !== Q) {
                      (m.insertAdjacentElement("afterend", Q), fR(p));
                      return;
                    }
                    if (a.contains(Q) && Q.previousElementSibling !== m) {
                      (Q.insertAdjacentElement("beforebegin", m), fR(p));
                      return;
                    }
                  }
            })).observe(m.ownerDocument.body, { childList: !0, subtree: !0 })));
        let ah = null == (c = g.dragOperation.source) ? void 0 : c.id,
          ai = () => {
            var a;
            if (!R || null == ah) return;
            let b = g.registry.draggables.get(ah),
              c = null != (a = null == b ? void 0 : b.handle) ? a : null == b ? void 0 : b.element;
            fy(c) && c.focus();
          },
          aj = () => {
            (null == d || d.disconnect(),
              null == e || e.disconnect(),
              ad.disconnect(),
              af.removeEventListener("resize", ag),
              fQ(p) && (p.removeEventListener("beforetoggle", g$), p.removeAttribute("popover")),
              p.removeAttribute(gU),
              A.reset(),
              (k.status = "idle"));
            let a = null != f.current.translate;
            (Q && (a || Q.parentElement !== p.parentElement) && p.isConnected && Q.replaceWith(p),
              null == Q || Q.remove());
          },
          ak = d_(
            () => {
              var a;
              let { transform: b, status: c } = i;
              if ((b.x || b.y || f.current.translate) && c.dragging) {
                let c = null != (a = o.translate) ? a : { x: 0, y: 0 },
                  e = { x: b.x / q.scaleX + c.x, y: b.y / q.scaleY + c.y },
                  g = f.current.translate,
                  h = de(() => i.modifiers),
                  j = de(() => {
                    var a;
                    return null == (a = i.shape) ? void 0 : a.current;
                  });
                if (
                  (A.set(
                    {
                      transition: `${B}, translate ${R ? "250ms cubic-bezier(0.25, 1, 0.5, 1)" : "0ms linear"}`,
                      translate: `${e.x}px ${e.y}px 0`,
                    },
                    gT
                  ),
                  null == d || d.takeRecords(),
                  j && j !== ae && g && !h.length)
                ) {
                  let a = eo.delta(e, g);
                  i.shape = ep.from(j.boundingRectangle).translate(a.x * q.scaleX, a.y * q.scaleY);
                } else i.shape = new gc(p);
                f.current.translate = e;
              }
            },
            function () {
              if (i.status.dropped) {
                (this.dispose(), (k.status = "dropping"));
                let a = f.current.translate,
                  b = null != a;
                if ((a || m === p || (a = { x: 0, y: 0 }), !a)) return void aj();
                g.renderer.rendering.then(() => {
                  var c, e;
                  {
                    fR(p);
                    let [, f] = null != (c = fs(p, (a) => "translate" in a)) ? c : [];
                    null == f || f.pause();
                    let g = null != Q ? Q : m,
                      h = { frameTransform: gZ(p, g) ? null : void 0 },
                      i = new gc(p, h),
                      j = null != (e = f1(fY(p).translate)) ? e : a,
                      l = new gc(g, h),
                      n = ep.delta(i, l, k.alignment),
                      o = { x: j.x - n.x, y: j.y - n.y },
                      q =
                        Math.round(i.intrinsicHeight) !== Math.round(l.intrinsicHeight)
                          ? {
                              minHeight: [`${i.intrinsicHeight}px`, `${l.intrinsicHeight}px`],
                              maxHeight: [`${i.intrinsicHeight}px`, `${l.intrinsicHeight}px`],
                            }
                          : {},
                      r =
                        Math.round(i.intrinsicWidth) !== Math.round(l.intrinsicWidth)
                          ? {
                              minWidth: [`${i.intrinsicWidth}px`, `${l.intrinsicWidth}px`],
                              maxWidth: [`${i.intrinsicWidth}px`, `${l.intrinsicWidth}px`],
                            }
                          : {};
                    (A.set({ transition: B }, gT),
                      p.setAttribute(gS, ""),
                      null == d || d.takeRecords(),
                      f7({
                        element: p,
                        keyframes: gn(
                          gw(gw({}, q), r),
                          gp({ translate: [`${j.x}px ${j.y}px 0`, `${o.x}px ${o.y}px 0`] })
                        ),
                        options: { duration: b || p !== m ? 250 : 0, easing: "ease" },
                      }).then(() => {
                        (p.removeAttribute(gS),
                          null == f || f.finish(),
                          aj(),
                          requestAnimationFrame(ai));
                      }));
                  }
                });
              }
            }
          );
        return () => {
          (aj(), ak());
        };
      }),
      (bw = function () {
        var a, b, c;
        let { status: d, source: e, target: f } = this.manager.dragOperation,
          { nonce: g } = null != (a = this.options) ? a : {};
        if (d.initializing)
          for (let a of new Set([
            fA(null != (b = null == e ? void 0 : e.element) ? b : null),
            fA(null != (c = null == f ? void 0 : f.element) ? c : null),
          ])) {
            let b = g0.get(a);
            if (!b) {
              let c = document.createElement("style");
              ((c.textContent = gY), g && c.setAttribute("nonce", g), a.head.prepend(c));
              let d = new MutationObserver((b) => {
                for (let d of b)
                  if ("childList" === d.type) {
                    let b = Array.from(d.removedNodes);
                    b.length > 0 && b.includes(c) && a.head.prepend(c);
                  }
              });
              (d.observe(a.head, { childList: !0 }),
                (b = {
                  cleanup: () => {
                    (d.disconnect(), c.remove());
                  },
                  instances: new Set(),
                }),
                g0.set(a, b));
            }
            b.instances.add(this);
          }
      }),
      gF(bs, 4, "overlay", bq, g1, bt),
      gD(bs, g1),
      (g1.configure = eX(g1)),
      (bz = [dY]),
      (bA = f3.Forward),
      (bx = [dY]),
      (by = f3.Reverse));
    var g2 = class {
      constructor() {
        (gJ(this, bC, gE(bB, 8, this, !0)),
          gE(bB, 11, this),
          gJ(this, bD, gE(bB, 12, this, !0)),
          gE(bB, 15, this));
      }
      isLocked(a) {
        return (
          a !== f3.Idle &&
          (null == a ? !0 === this[f3.Forward] && !0 === this[f3.Reverse] : !0 === this[a])
        );
      }
      unlock(a) {
        a !== f3.Idle && (this[a] = !1);
      }
    };
    ((bB = gz(null)),
      (bC = new WeakMap()),
      (bD = new WeakMap()),
      gF(bB, 4, bA, bz, g2, bC),
      gF(bB, 4, by, bx, g2, bD),
      gD(bB, g2));
    var g3 = [f3.Forward, f3.Reverse],
      g4 = class {
        constructor() {
          ((this.x = new g2()), (this.y = new g2()));
        }
        isLocked() {
          return this.x.isLocked() && this.y.isLocked();
        }
      },
      g5 = class extends eZ {
        constructor(a) {
          super(a);
          const b = dp(new g4());
          let c = null;
          ((this.signal = b),
            dy(() => {
              let { status: d } = a.dragOperation;
              if (!d.initialized) {
                ((c = null), (b.value = new g4()));
                return;
              }
              let { delta: e } = a.dragOperation.position;
              if (c) {
                let a = { x: g6(e.x, c.x), y: g6(e.y, c.y) },
                  d = b.peek();
                dd(() => {
                  for (let b of et) for (let c of g3) a[b] === c && d[b].unlock(c);
                  b.value = d;
                });
              }
              c = e;
            }));
        }
        get current() {
          return this.signal.peek();
        }
      };
    function g6(a, b) {
      return Math.sign(a - b);
    }
    var g7 = class extends ((bF = e$), (bE = [dY]), bF) {
      constructor(a) {
        (super(a),
          gJ(this, bH, gE(bG, 8, this, !1)),
          gE(bG, 11, this),
          gJ(this, bI),
          gJ(this, bJ, () => {
            if (!gI(this, bI)) return;
            let { element: a, by: b } = gI(this, bI);
            (b.y && (a.scrollTop += b.y), b.x && (a.scrollLeft += b.x));
          }),
          (this.scroll = (a) => {
            var b;
            if (this.disabled) return !1;
            let c = this.getScrollableElements();
            if (!c) return (gK(this, bI, void 0), !1);
            let { position: d } = this.manager.dragOperation,
              e = null == d ? void 0 : d.current;
            if (e) {
              let { by: d } = null != a ? a : {},
                f = d ? { x: g8(d.x), y: g8(d.y) } : void 0,
                g = f ? void 0 : this.scrollIntentTracker.current;
              if (null == g ? void 0 : g.isLocked()) return !1;
              for (let a of c) {
                let c = (function (a, b) {
                  let { isTop: c, isBottom: d, isLeft: e, isRight: f, position: g } = fS(a),
                    { x: h, y: i } = null != b ? b : { x: 0, y: 0 },
                    j = !c && g.current.y + i > 0,
                    k = !d && g.current.y + i < g.max.y,
                    l = !e && g.current.x + h > 0,
                    m = !f && g.current.x + h < g.max.x;
                  return { top: j, bottom: k, left: l, right: m, x: l || m, y: j || k };
                })(a, d);
                if (c.x || c.y) {
                  let { speed: c, direction: h } = (function (a, b, c, d = 25, e = f4, f = f5) {
                    let { x: g, y: h } = b,
                      { rect: i, isTop: j, isBottom: k, isLeft: l, isRight: m } = fS(a),
                      n = f0(a),
                      o = f2(fY(a, !0)),
                      p = null !== o && (null == o ? void 0 : o.scaleX) < 0,
                      q = null !== o && (null == o ? void 0 : o.scaleY) < 0,
                      r = new ep(
                        i.left * n.scaleX + n.x,
                        i.top * n.scaleY + n.y,
                        i.width * n.scaleX,
                        i.height * n.scaleY
                      ),
                      s = { x: 0, y: 0 },
                      t = { x: 0, y: 0 },
                      u = { height: r.height * e.y, width: r.width * e.x };
                    return (
                      (!j || (q && !k)) &&
                      h <= r.top + u.height &&
                      (null == c ? void 0 : c.y) !== 1 &&
                      g >= r.left - f.x &&
                      g <= r.right + f.x
                        ? ((s.y = q ? 1 : -1),
                          (t.y = d * Math.abs((r.top + u.height - h) / u.height)))
                        : (!k || (q && !j)) &&
                          h >= r.bottom - u.height &&
                          (null == c ? void 0 : c.y) !== -1 &&
                          g >= r.left - f.x &&
                          g <= r.right + f.x &&
                          ((s.y = q ? -1 : 1),
                          (t.y = d * Math.abs((r.bottom - u.height - h) / u.height))),
                      (!m || (p && !l)) &&
                      g >= r.right - u.width &&
                      (null == c ? void 0 : c.x) !== -1 &&
                      h >= r.top - f.y &&
                      h <= r.bottom + f.y
                        ? ((s.x = p ? -1 : 1),
                          (t.x = d * Math.abs((r.right - u.width - g) / u.width)))
                        : (!l || (p && !m)) &&
                          g <= r.left + u.width &&
                          (null == c ? void 0 : c.x) !== 1 &&
                          h >= r.top - f.y &&
                          h <= r.bottom + f.y &&
                          ((s.x = p ? 1 : -1),
                          (t.x = d * Math.abs((r.left + u.width - g) / u.width))),
                      { direction: s, speed: t }
                    );
                  })(a, e, f);
                  if (g) for (let a of et) g[a].isLocked(h[a]) && ((c[a] = 0), (h[a] = 0));
                  if (h.x || h.y) {
                    let { x: e, y: f } = null != d ? d : h,
                      g = e * c.x,
                      i = f * c.y;
                    if (g || i) {
                      let c = null == (b = gI(this, bI)) ? void 0 : b.by;
                      if (this.autoScrolling && c && ((c.x && !g) || (c.y && !i))) continue;
                      return (
                        gK(this, bI, { element: a, by: { x: g, y: i } }),
                        fU.schedule(gI(this, bJ)),
                        !0
                      );
                    }
                  }
                }
              }
            }
            return (gK(this, bI, void 0), !1);
          }));
        let b = null,
          c = null;
        const d = dW(() => {
            let { position: c, source: d } = a.dragOperation;
            if (!c) return null;
            let e = (function a(b, { x: c, y: d }) {
              var e;
              let f = b.elementFromPoint(c, d);
              if ((null == (e = f) ? void 0 : e.tagName) === "IFRAME") {
                let { contentDocument: b } = f;
                if (b) {
                  let { left: e, top: g } = f.getBoundingClientRect();
                  return a(b, { x: c - e, y: d - g });
                }
              }
              return f;
            })(fA(null == d ? void 0 : d.element), c.current);
            return (e && (b = e), null != e ? e : b);
          }),
          e = dW(() => {
            let b = d.value,
              { documentElement: e } = fA(b);
            if (!b || b === e) {
              let { target: b } = a.dragOperation,
                d = null == b ? void 0 : b.element;
              if (d) {
                let a = f_(d, { excludeElement: !1 });
                return ((c = a), a);
              }
            }
            if (b) {
              let a = f_(b, { excludeElement: !1 });
              return this.autoScrolling && c && a.size < (null == c ? void 0 : c.size)
                ? c
                : ((c = a), a);
            }
            return ((c = null), null);
          }, dX);
        ((this.getScrollableElements = () => e.value),
          (this.scrollIntentTracker = new g5(a)),
          (this.destroy = a.monitor.addEventListener("dragmove", (b) => {
            !this.disabled &&
              !b.defaultPrevented &&
              gg(a.dragOperation.activatorEvent) &&
              b.by &&
              this.scroll({ by: b.by }) &&
              b.preventDefault();
          })));
      }
    };
    function g8(a) {
      return a > 0 ? f3.Forward : a < 0 ? f3.Reverse : f3.Idle;
    }
    ((bG = gz(bF)),
      (bH = new WeakMap()),
      (bI = new WeakMap()),
      (bJ = new WeakMap()),
      gF(bG, 4, "autoScrolling", bE, g7, bH),
      gD(bG, g7));
    var g9 = new (class {
        constructor(a) {
          ((this.scheduler = a),
            (this.pending = !1),
            (this.tasks = new Set()),
            (this.resolvers = new Set()),
            (this.flush = () => {
              let { tasks: a, resolvers: b } = this;
              for (let b of ((this.pending = !1),
              (this.tasks = new Set()),
              (this.resolvers = new Set()),
              a))
                b();
              for (let a of b) a();
            }));
        }
        schedule(a) {
          return (
            this.tasks.add(a),
            this.pending || ((this.pending = !0), this.scheduler(this.flush)),
            new Promise((a) => this.resolvers.add(a))
          );
        }
      })((a) => {
        "function" == typeof requestAnimationFrame ? requestAnimationFrame(a) : a();
      }),
      ha = class extends eZ {
        constructor(a, b) {
          super(a);
          const c = a.registry.plugins.get(g7);
          if (!c) throw Error("AutoScroller plugin depends on Scroller plugin");
          this.destroy = dy(() => {
            if (this.disabled) return;
            let { position: b, status: d } = a.dragOperation;
            if (d.dragging) {
              if (c.scroll()) {
                c.autoScrolling = !0;
                let a = setInterval(() => g9.schedule(c.scroll), 10);
                return () => {
                  clearInterval(a);
                };
              }
              c.autoScrolling = !1;
            }
          });
        }
      },
      hb = { capture: !0, passive: !0 },
      hc = class extends e$ {
        constructor(a) {
          (super(a),
            gJ(this, bK),
            (this.handleScroll = () => {
              null == gI(this, bK) &&
                gK(
                  this,
                  bK,
                  setTimeout(() => {
                    (this.manager.collisionObserver.forceUpdate(!1), gK(this, bK, void 0));
                  }, 50)
                );
            }));
          const { dragOperation: b } = this.manager;
          this.destroy = dy(() => {
            var a, c, d;
            if (b.status.dragging) {
              let e =
                null !=
                (d =
                  null == (c = null == (a = b.source) ? void 0 : a.element)
                    ? void 0
                    : c.ownerDocument)
                  ? d
                  : document;
              return (
                e.addEventListener("scroll", this.handleScroll, hb),
                () => {
                  e.removeEventListener("scroll", this.handleScroll, hb);
                }
              );
            }
          });
        }
      };
    bK = new WeakMap();
    var hd = class extends eZ {
      constructor(a, b) {
        (super(a, b),
          (this.manager = a),
          (this.destroy = dy(() => {
            var a;
            let { dragOperation: b } = this.manager,
              { nonce: c } = null != (a = this.options) ? a : {};
            if (b.status.initialized) {
              let a = document.createElement("style");
              return (
                c && a.setAttribute("nonce", c),
                (a.textContent =
                  "* { user-select: none !important; -webkit-user-select: none !important; }"),
                document.head.appendChild(a),
                he(),
                document.addEventListener("selectionchange", he, { capture: !0 }),
                () => {
                  (document.removeEventListener("selectionchange", he, { capture: !0 }),
                    a.remove());
                }
              );
            }
          })));
      }
    };
    function he() {
      var a;
      null == (a = document.getSelection()) || a.removeAllRanges();
    }
    var hf = Object.freeze({
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
        shouldActivate(a) {
          var b;
          let { event: c, source: d } = a,
            e = null != (b = d.handle) ? b : d.element;
          return c.target === e;
        },
      }),
      hg = class extends ff {
        constructor(a, b) {
          (super(a),
            (this.manager = a),
            (this.options = b),
            gJ(this, bL, []),
            (this.listeners = new fG()),
            (this.handleSourceKeyDown = (a, b, c) => {
              if (this.disabled || a.defaultPrevented || !gf(a.target) || b.disabled) return;
              let { keyboardCodes: d = hf.keyboardCodes, shouldActivate: e = hf.shouldActivate } =
                null != c ? c : {};
              !d.start.includes(a.code) ||
                (this.manager.dragOperation.status.idle &&
                  e({ event: a, source: b, manager: this.manager }) &&
                  this.handleStart(a, b, c));
            }));
        }
        bind(a, b = this.options) {
          return dy(() => {
            var c;
            let d = null != (c = a.handle) ? c : a.element,
              e = (c) => {
                gg(c) && this.handleSourceKeyDown(c, a, b);
              };
            if (d)
              return (
                d.addEventListener("keydown", e),
                () => {
                  d.removeEventListener("keydown", e);
                }
              );
          });
        }
        handleStart(a, b, c) {
          let { element: d } = b;
          if (!d) throw Error("Source draggable does not have an associated element");
          (a.preventDefault(), a.stopImmediatePropagation(), f6(d));
          let { center: e } = new gc(d);
          if (
            this.manager.actions.start({ event: a, coordinates: { x: e.x, y: e.y }, source: b })
              .signal.aborted
          )
            return this.cleanup();
          this.sideEffects();
          let f = fA(d),
            g = [
              this.listeners.bind(f, [
                {
                  type: "keydown",
                  listener: (a) => this.handleKeyDown(a, b, c),
                  options: { capture: !0 },
                },
              ]),
            ];
          gI(this, bL).push(...g);
        }
        handleKeyDown(a, b, c) {
          let { keyboardCodes: d = hf.keyboardCodes } = null != c ? c : {};
          if (hh(a, [...d.end, ...d.cancel])) {
            a.preventDefault();
            let b = hh(a, d.cancel);
            this.handleEnd(a, b);
            return;
          }
          (hh(a, d.up) ? this.handleMove("up", a) : hh(a, d.down) && this.handleMove("down", a),
            hh(a, d.left)
              ? this.handleMove("left", a)
              : hh(a, d.right) && this.handleMove("right", a));
        }
        handleEnd(a, b) {
          (this.manager.actions.stop({ event: a, canceled: b }), this.cleanup());
        }
        handleMove(a, b) {
          var c, d;
          let { shape: e } = this.manager.dragOperation,
            f = b.shiftKey ? 5 : 1,
            g = { x: 0, y: 0 },
            h = null != (d = null == (c = this.options) ? void 0 : c.offset) ? d : hf.offset;
          if (("number" == typeof h && (h = { x: h, y: h }), e)) {
            switch (a) {
              case "up":
                g = { x: 0, y: -h.y * f };
                break;
              case "down":
                g = { x: 0, y: h.y * f };
                break;
              case "left":
                g = { x: -h.x * f, y: 0 };
                break;
              case "right":
                g = { x: h.x * f, y: 0 };
            }
            (g.x || g.y) && (b.preventDefault(), this.manager.actions.move({ event: b, by: g }));
          }
        }
        sideEffects() {
          let a = this.manager.registry.plugins.get(ha);
          (null == a ? void 0 : a.disabled) === !1 &&
            (a.disable(),
            gI(this, bL).push(() => {
              a.enable();
            }));
        }
        cleanup() {
          (gI(this, bL).forEach((a) => a()), gK(this, bL, []));
        }
        destroy() {
          (this.cleanup(), this.listeners.clear());
        }
      };
    function hh(a, b) {
      return b.includes(a.code);
    }
    ((bL = new WeakMap()), (hg.configure = eX(hg)), (hg.defaults = hf));
    var hi = Object.freeze({
        activationConstraints(a, b) {
          var c;
          let { pointerType: d, target: e } = a;
          if (
            !(
              "mouse" === d &&
              gf(e) &&
              (b.handle === e || (null == (c = b.handle) ? void 0 : c.contains(e)))
            )
          )
            return "touch" === d
              ? { delay: { value: 250, tolerance: 5 } }
              : (function (a) {
                    var b;
                    if (!gf(a)) return !1;
                    let { tagName: c } = a;
                    return (
                      "INPUT" === c ||
                      "TEXTAREA" === c ||
                      ((b = a).hasAttribute("contenteditable") &&
                        "false" !== b.getAttribute("contenteditable"))
                    );
                  })(e) && !a.defaultPrevented
                ? { delay: { value: 200, tolerance: 0 } }
                : { delay: { value: 200, tolerance: 10 }, distance: { value: 5 } };
        },
      }),
      hj = class extends ff {
        constructor(a, b) {
          (super(a),
            (this.manager = a),
            (this.options = b),
            gJ(this, bM, new Set()),
            gJ(this, bN),
            (this.listeners = new fG()),
            (this.latest = { event: void 0, coordinates: void 0 }),
            (this.handleMove = () => {
              let { event: a, coordinates: b } = this.latest;
              a && b && this.manager.actions.move({ event: a, to: b });
            }),
            (this.handleCancel = this.handleCancel.bind(this)),
            (this.handlePointerUp = this.handlePointerUp.bind(this)),
            (this.handleKeyDown = this.handleKeyDown.bind(this)));
        }
        activationConstraints(a, b) {
          var c;
          let { activationConstraints: d = hi.activationConstraints } =
            null != (c = this.options) ? c : {};
          return "function" == typeof d ? d(a, b) : d;
        }
        bind(a, b = this.options) {
          return dy(() => {
            var c, d;
            let e = new AbortController(),
              { signal: f } = e,
              g = (c) => {
                (function (a) {
                  if (!a) return !1;
                  let { PointerEvent: b } = fw(a.target);
                  return a instanceof b;
                })(c) && this.handlePointerDown(c, a, b);
              },
              h = [null != (c = a.handle) ? c : a.element];
            for (let c of ((null == b ? void 0 : b.activatorElements) &&
              (h = Array.isArray(b.activatorElements)
                ? b.activatorElements
                : b.activatorElements(a)),
            h)) {
              c &&
                (!(d = c.ownerDocument.defaultView) ||
                  hm.has(d) ||
                  (d.addEventListener("touchmove", hl, { capture: !1, passive: !1 }), hm.add(d)),
                c.addEventListener("pointerdown", g, { signal: f }));
            }
            return () => e.abort();
          });
        }
        handlePointerDown(a, b, c = {}) {
          if (
            this.disabled ||
            !a.isPrimary ||
            0 !== a.button ||
            !gf(a.target) ||
            b.disabled ||
            "sensor" in a ||
            !this.manager.dragOperation.status.idle
          )
            return;
          let { target: d } = a,
            e = fy(d) && d.draggable && "true" === d.getAttribute("draggable"),
            f = f0(b.element);
          this.initialCoordinates = {
            x: a.clientX * f.scaleX + f.x,
            y: a.clientY * f.scaleY + f.y,
          };
          let g = this.activationConstraints(a, b);
          if (
            ((a.sensor = this), (null == g ? void 0 : g.delay) || (null == g ? void 0 : g.distance))
          ) {
            let { delay: c } = g;
            if (c) {
              let d = setTimeout(() => this.handleStart(b, a), c.value);
              gK(this, bN, () => {
                (clearTimeout(d), gK(this, bN, void 0));
              });
            }
          } else this.handleStart(b, a);
          let h = fA(a.target),
            i = this.listeners.bind(h, [
              { type: "pointermove", listener: (a) => this.handlePointerMove(a, b) },
              { type: "pointerup", listener: this.handlePointerUp, options: { capture: !0 } },
              { type: "dragstart", listener: e ? this.handleCancel : hk, options: { capture: !0 } },
            ]),
            j = () => {
              var a;
              (i(), null == (a = gI(this, bN)) || a.call(this), (this.initialCoordinates = void 0));
            };
          gI(this, bM).add(j);
        }
        handlePointerMove(a, b) {
          let c = { x: a.clientX, y: a.clientY },
            d = f0(b.element);
          if (
            ((c.x = c.x * d.scaleX + d.x),
            (c.y = c.y * d.scaleY + d.y),
            this.manager.dragOperation.status.dragging)
          ) {
            (a.preventDefault(),
              a.stopPropagation(),
              (this.latest.event = a),
              (this.latest.coordinates = c),
              fU.schedule(this.handleMove));
            return;
          }
          if (!this.initialCoordinates) return;
          let e = { x: c.x - this.initialCoordinates.x, y: c.y - this.initialCoordinates.y },
            f = this.activationConstraints(a, b),
            { distance: g, delay: h } = null != f ? f : {};
          if (g) {
            if (null != g.tolerance && er(e, g.tolerance)) return this.handleCancel(a);
            if (er(e, g.value)) return this.handleStart(b, a);
          }
          if (h && er(e, h.tolerance)) return this.handleCancel(a);
        }
        handlePointerUp(a) {
          let { status: b } = this.manager.dragOperation;
          if (!b.idle) {
            (a.preventDefault(), a.stopPropagation());
            let c = !b.initialized;
            this.manager.actions.stop({ event: a, canceled: c });
          }
          this.cleanup();
        }
        handleKeyDown(a) {
          "Escape" === a.key && (a.preventDefault(), this.handleCancel(a));
        }
        handleStart(a, b) {
          var c;
          let { manager: d, initialCoordinates: e } = this;
          if (
            (null == (c = gI(this, bN)) || c.call(this),
            !e || !d.dragOperation.status.idle || b.defaultPrevented)
          )
            return;
          if (d.actions.start({ coordinates: e, event: b, source: a }).signal.aborted)
            return this.cleanup();
          b.preventDefault();
          let f = fA(b.target),
            g = f.body;
          g.setPointerCapture(b.pointerId);
          let h = this.listeners.bind(f, [
            { type: "touchmove", listener: hk, options: { passive: !1 } },
            { type: "click", listener: hk },
            { type: "contextmenu", listener: hk },
            { type: "keydown", listener: this.handleKeyDown },
            {
              type: "lostpointercapture",
              listener: (a) => {
                a.target === g && this.handlePointerUp(a);
              },
            },
          ]);
          gI(this, bM).add(h);
        }
        handleCancel(a) {
          let { dragOperation: b } = this.manager;
          (b.status.initialized && this.manager.actions.stop({ event: a, canceled: !0 }),
            this.cleanup());
        }
        cleanup() {
          ((this.latest = { event: void 0, coordinates: void 0 }),
            gI(this, bM).forEach((a) => a()),
            gI(this, bM).clear());
        }
        destroy() {
          (this.cleanup(), this.listeners.clear());
        }
      };
    function hk(a) {
      a.preventDefault();
    }
    function hl() {}
    ((bM = new WeakMap()), (bN = new WeakMap()), (hj.configure = eX(hj)), (hj.defaults = hi));
    var hm = new WeakSet(),
      hn = [],
      ho = [gP, ha, gQ, g1, hd],
      hp = [hj, hg],
      hq = class extends fk {
        constructor(a = {}) {
          const { plugins: b = ho, sensors: c = hp, modifiers: d = [] } = a;
          super(
            ((a, b) => gn(a, gp(b)))(gw({}, a), {
              plugins: [hc, g7, ...b],
              sensors: c,
              modifiers: d,
            })
          );
        }
      },
      hr = class extends ((bR = fd), (bQ = [dY]), (bP = [dY]), (bO = [dY]), bR) {
        constructor(a, b) {
          var { element: c, effects: d = () => [], handle: e, feedback: f = "default" } = a;
          (super(
            gw(
              {
                effects: () => [
                  ...d(),
                  () => {
                    var a, b;
                    let { manager: c } = this;
                    if (!c) return;
                    let d = (
                      null != (b = null == (a = this.sensors) ? void 0 : a.map(eY))
                        ? b
                        : [...c.sensors]
                    ).map((a) => {
                      let b = a instanceof ff ? a : c.registry.register(a.plugin),
                        d = a instanceof ff ? void 0 : a.options;
                      return b.bind(this, d);
                    });
                    return function () {
                      d.forEach((a) => a());
                    };
                  },
                ],
              },
              gy(a, ["element", "effects", "handle", "feedback"])
            ),
            b
          ),
            gJ(this, bT, gE(bS, 8, this)),
            gE(bS, 11, this),
            gJ(this, bU, gE(bS, 12, this)),
            gE(bS, 15, this),
            gJ(this, bV, gE(bS, 16, this)),
            gE(bS, 19, this),
            (this.element = c),
            (this.handle = e),
            (this.feedback = f));
        }
      };
    ((bS = gz(bR)),
      (bT = new WeakMap()),
      (bU = new WeakMap()),
      (bV = new WeakMap()),
      gF(bS, 4, "handle", bQ, hr, bT),
      gF(bS, 4, "element", bP, hr, bU),
      gF(bS, 4, "feedback", bO, hr, bV),
      gD(bS, hr));
    var hs = class extends ((bY = fe), (bX = [dY]), (bW = [dY]), bY) {
      constructor(a, b) {
        var { element: c, effects: d = () => [] } = a,
          e = gy(a, ["element", "effects"]);
        const { collisionDetector: f = gj } = e,
          g = (a) => {
            let { manager: b, element: c } = this;
            if (!c || null === a) {
              this.shape = void 0;
              return;
            }
            if (!b) return;
            let d = new gc(c),
              e = de(() => this.shape);
            return d && (null == e ? void 0 : e.equals(d)) ? e : ((this.shape = d), d);
          },
          h = dp(!1);
        (super(
          ((a, b) => gn(a, gp(b)))(gw({}, e), {
            collisionDetector: f,
            effects: () => [
              ...d(),
              () => {
                let { element: a, manager: b } = this;
                if (!b) return;
                let { dragOperation: c } = b,
                  { source: d } = c;
                h.value = !!(d && c.status.initialized && a && !this.disabled && this.accepts(d));
              },
              () => {
                let { element: a } = this;
                if (h.value && a) {
                  let b = new fP(a, g);
                  return () => {
                    (b.disconnect(), (this.shape = void 0));
                  };
                }
              },
              () => {
                var a;
                if (null == (a = this.manager) ? void 0 : a.dragOperation.status.initialized)
                  return () => {
                    this.shape = void 0;
                  };
              },
            ],
          }),
          b
        ),
          gJ(this, b2),
          gJ(this, b$, gE(bZ, 8, this)),
          gE(bZ, 11, this),
          gJ(this, b3, gE(bZ, 12, this)),
          gE(bZ, 15, this),
          (this.element = c),
          (this.refreshShape = () => g()));
      }
      set element(a) {
        gK(this, b2, a, b1);
      }
      get element() {
        var a;
        return null != (a = this.proxy) ? a : gI(this, b2, b0);
      }
    };
    ((bZ = gz(bY)),
      (b$ = new WeakMap()),
      (b2 = new WeakSet()),
      (b3 = new WeakMap()),
      (b0 = (b_ = gF(bZ, 20, "#element", bX, b2, b$)).get),
      (b1 = b_.set),
      gF(bZ, 4, "proxy", bW, hs, b3),
      gD(bZ, hs));
    var ht = a.i(35112);
    function hu(a) {
      var b;
      if (null != a)
        return null != a && "object" == typeof a && "current" in a
          ? null != (b = a.current)
            ? b
            : void 0
          : a;
    }
    var hv = ci.useEffect;
    function hw(a, b) {
      let c,
        d = (0, ci.useRef)(new Map()),
        e =
          ((c = (0, ci.useState)(0)[1]),
          (0, ci.useCallback)(() => {
            c((a) => a + 1);
          }, [c]));
      return (
        hv(
          () =>
            a
              ? dy(() => {
                  var c;
                  let f = !1,
                    g = !1;
                  for (let e of d.current) {
                    let [h] = e,
                      i = de(() => e[1]),
                      j = a[h];
                    i !== j &&
                      ((f = !0),
                      d.current.set(h, j),
                      (g = null != (c = null == b ? void 0 : b(h, i, j)) && c));
                  }
                  f && (g ? (0, ht.flushSync)(e) : e());
                })
              : void d.current.clear(),
          [a]
        ),
        (0, ci.useMemo)(
          () =>
            a
              ? new Proxy(a, {
                  get(a, b) {
                    let c = a[b];
                    return (d.current.set(b, c), c);
                  },
                })
              : a,
          [a]
        )
      );
    }
    function hx(a, b) {
      a();
    }
    function hy(a) {
      let b = (0, ci.useRef)(a);
      return (
        hv(() => {
          b.current = a;
        }, [a]),
        b
      );
    }
    function hz(a, b, c = ci.useEffect, d = Object.is) {
      let e = (0, ci.useRef)(a);
      c(() => {
        let c = e.current;
        d(a, c) || ((e.current = a), b(a, c));
      }, [b, a]);
    }
    function hA(a, b) {
      let c = (0, ci.useRef)(hu(a));
      hv(() => {
        let d = hu(a);
        d !== c.current && ((c.current = d), b(d));
      });
    }
    var hB = Object.defineProperty,
      hC = Object.defineProperties,
      hD = Object.getOwnPropertyDescriptors,
      hE = Object.getOwnPropertySymbols,
      hF = Object.prototype.hasOwnProperty,
      hG = Object.prototype.propertyIsEnumerable,
      hH = (a, b, c) =>
        b in a
          ? hB(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      hI = (a, b) => {
        for (var c in b || (b = {})) hF.call(b, c) && hH(a, c, b[c]);
        if (hE) for (var c of hE(b)) hG.call(b, c) && hH(a, c, b[c]);
        return a;
      },
      hJ = new hq(),
      hK = (0, ci.createContext)(hJ),
      hL = (0, ci.memo)(
        (0, ci.forwardRef)(({ children: a }, b) => {
          let [c, d] = (0, ci.useState)(0),
            e = (0, ci.useRef)(null),
            f = (0, ci.useRef)(null),
            g = (0, ci.useMemo)(
              () => ({
                renderer: {
                  get rendering() {
                    var a;
                    return null != (a = e.current) ? a : Promise.resolve();
                  },
                },
                trackRendering(a) {
                  (e.current ||
                    (e.current = new Promise((a) => {
                      f.current = a;
                    })),
                    (0, ci.startTransition)(() => {
                      (a(), d((a) => a + 1));
                    }));
                },
              }),
              []
            );
          return (
            hv(() => {
              var a;
              (null == (a = f.current) || a.call(f), (e.current = null));
            }, [a, c]),
            (0, ci.useImperativeHandle)(b, () => g),
            null
          );
        })
      ),
      hM = [void 0, dX];
    function hN(a) {
      var b,
        {
          children: c,
          onCollision: d,
          onBeforeDragStart: e,
          onDragStart: f,
          onDragMove: g,
          onDragOver: h,
          onDragEnd: i,
        } = a,
        j = ((a, b) => {
          var c = {};
          for (var d in a) hF.call(a, d) && 0 > b.indexOf(d) && (c[d] = a[d]);
          if (null != a && hE)
            for (var d of hE(a)) 0 > b.indexOf(d) && hG.call(a, d) && (c[d] = a[d]);
          return c;
        })(a, [
          "children",
          "onCollision",
          "onBeforeDragStart",
          "onDragStart",
          "onDragMove",
          "onDragOver",
          "onDragEnd",
        ]);
      let k = (0, ci.useRef)(null),
        [l, m] = (0, ci.useState)(null != (b = j.manager) ? b : null),
        { plugins: n, modifiers: o, sensors: p } = j,
        q = hy(e),
        r = hy(f),
        s = hy(h),
        t = hy(g),
        u = hy(i),
        v = hy(d);
      return (
        (0, ci.useEffect)(() => {
          var a;
          if (!k.current) throw Error("Renderer not found");
          let { renderer: b, trackRendering: c } = k.current,
            d = null != (a = j.manager) ? a : new hq(j);
          return (
            (d.renderer = b),
            d.monitor.addEventListener("beforedragstart", (a) => {
              let b = q.current;
              b && c(() => b(a, d));
            }),
            d.monitor.addEventListener("dragstart", (a) => {
              var b;
              return null == (b = r.current) ? void 0 : b.call(r, a, d);
            }),
            d.monitor.addEventListener("dragover", (a) => {
              let b = s.current;
              b && c(() => b(a, d));
            }),
            d.monitor.addEventListener("dragmove", (a) => {
              let b = t.current;
              b && c(() => b(a, d));
            }),
            d.monitor.addEventListener("dragend", (a) => {
              let b = u.current;
              b && c(() => b(a, d));
            }),
            d.monitor.addEventListener("collision", (a) => {
              var b;
              return null == (b = v.current) ? void 0 : b.call(v, a, d);
            }),
            (0, ci.startTransition)(() => m(d)),
            d.destroy
          );
        }, [j.manager]),
        hz(n, () => l && (l.plugins = null != n ? n : ho), ...hM),
        hz(p, () => l && (l.sensors = null != p ? p : hp), ...hM),
        hz(o, () => l && (l.modifiers = null != o ? o : hn), ...hM),
        (0, ch.jsxs)(hK.Provider, {
          value: l,
          children: [(0, ch.jsx)(hL, { ref: k, children: c }), c],
        })
      );
    }
    function hO() {
      return (0, ci.useContext)(hK);
    }
    function hP(a) {
      var b;
      let c = null != (b = hO()) ? b : void 0,
        [d] = (0, ci.useState)(() => a(c));
      return (d.manager !== c && (d.manager = c), hv(d.register, [c, d]), d);
    }
    function hQ(a, b, c) {
      return "isDragSource" === a && !c && !!b;
    }
    var hR = Object.create,
      hS = Object.defineProperty,
      hT = Object.getOwnPropertyDescriptor,
      hU = (a, b) => ((b = Symbol[a]) ? b : Symbol.for("Symbol." + a)),
      hV = (a) => {
        throw TypeError(a);
      },
      hW = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      hX = (a) => (void 0 !== a && "function" != typeof a ? hV("Function expected") : a),
      hY = (a, b, c, d, e) => ({
        kind: hW[a],
        name: b,
        metadata: d,
        addInitializer: (a) => (c._ ? hV("Already initialized") : e.push(hX(a || null))),
      }),
      hZ = (a, b, c, d, e, f) => {
        for (
          var g,
            h,
            i,
            j = 7 & b,
            k = hW[j + 5],
            l = a[2] || (a[2] = []),
            m = hT((e = e.prototype), c),
            n = d.length - 1;
          n >= 0;
          n--
        )
          (((i = hY(j, c, (h = {}), a[3], l)).static = !1),
            (i.private = !1),
            ((i.access = { has: (a) => c in a }).get = (a) => a[c]),
            (g = (0, d[n])(m[k], i)),
            (h._ = 1),
            hX(g) && (m[k] = g));
        return (m && hS(e, c, m), e);
      },
      h$ = (a, b, c) => b.has(a) || hV("Cannot " + c),
      h_ = class a {
        constructor(a, b) {
          ((this.x = a), (this.y = b));
        }
        static delta(b, c) {
          return new a(b.x - c.x, b.y - c.y);
        }
        static distance(a, b) {
          return Math.hypot(a.x - b.x, a.y - b.y);
        }
        static equals(a, b) {
          return a.x === b.x && a.y === b.y;
        }
        static from({ x: b, y: c }) {
          return new a(b, c);
        }
      },
      h0 = class extends ((b6 = d0), (b5 = [dZ]), (b4 = [dZ]), b6) {
        constructor(a) {
          (super(h_.from(a), (a, b) => h_.equals(a, b)),
            ((a, b, c, d) => {
              for (var e = 0, f = a[b >> 1], g = f && f.length; e < g; e++) f[e].call(c);
            })(b8, 5, this),
            ((a, b, c) =>
              b.has(a)
                ? hV("Cannot add the same private member more than once")
                : b instanceof WeakSet
                  ? b.add(a)
                  : b.set(a, c))(this, b7, 0),
            (this.velocity = { x: 0, y: 0 }));
        }
        get delta() {
          return h_.delta(this.current, this.initial);
        }
        get direction() {
          let { current: a, previous: b } = this;
          if (!b) return null;
          let c = { x: a.x - b.x, y: a.y - b.y };
          return c.x || c.y
            ? Math.abs(c.x) > Math.abs(c.y)
              ? c.x > 0
                ? "right"
                : "left"
              : c.y > 0
                ? "down"
                : "up"
            : null;
        }
        get current() {
          return super.current;
        }
        set current(a) {
          let b,
            { current: c } = this,
            d = h_.from(a),
            e = { x: d.x - c.x, y: d.y - c.y },
            f = Date.now(),
            g = f - (h$(this, (b = b7), "read from private field"), b.get(this)),
            h = (a) => Math.round((a / g) * 100);
          dd(() => {
            let a;
            (h$(this, (a = b7), "write to private field"),
              a.set(this, f),
              (this.velocity = { x: h(e.x), y: h(e.y) }),
              (super.current = d));
          });
        }
        reset(a = this.defaultValue) {
          (super.reset(h_.from(a)), (this.velocity = { x: 0, y: 0 }));
        }
      };
    ((b8 = [, , , hR(null != (t = null == b6 ? void 0 : b6[hU("metadata")]) ? t : null)]),
      (b7 = new WeakMap()),
      hZ(b8, 2, "delta", b5, h0),
      hZ(b8, 2, "direction", b4, h0),
      (u = b8),
      (f = hU("metadata")),
      (g = u[3]),
      f in h0
        ? hS(h0, f, { enumerable: !0, configurable: !0, writable: !0, value: g })
        : (h0[f] = g));
    var h1 = (((v = h1 || {}).Horizontal = "x"), (v.Vertical = "y"), v);
    Object.values(h1);
    var h2 = (a) => {
      var b;
      return null !=
        (b = (({ dragOperation: a, droppable: b }) => {
          let c = a.position.current;
          if (!c) return null;
          let { id: d } = b;
          return b.shape && b.shape.containsPoint(c)
            ? {
                id: d,
                value: 1 / h_.distance(b.shape.center, c),
                type: e8.PointerIntersection,
                priority: e7.High,
              }
            : null;
        })(a))
        ? b
        : (({ dragOperation: a, droppable: b }) => {
            let { shape: c } = a;
            if (!b.shape || !(null == c ? void 0 : c.current)) return null;
            let d = c.current.intersectionArea(b.shape);
            if (d) {
              let { position: e } = a,
                f = h_.distance(b.shape.center, e.current),
                g = d / (c.current.area + b.shape.area - d);
              return { id: b.id, value: g / f, type: e8.ShapeIntersection, priority: e7.Normal };
            }
            return null;
          })(a);
    };
    function h3(a) {
      let { collisionDetector: b, data: c, disabled: d, element: e, id: f, accept: g, type: h } = a,
        i = hP((b) => new hs(hC(hI({}, a), hD({ register: !1, element: hu(e) })), b)),
        j = hw(i);
      return (
        hz(f, () => (i.id = f)),
        hA(e, (a) => (i.element = a)),
        hz(g, () => (i.accept = g), void 0, dX),
        hz(b, () => (i.collisionDetector = null != b ? b : h2)),
        hz(c, () => c && (i.data = c)),
        hz(d, () => (i.disabled = !0 === d)),
        hz(h, () => (i.type = h)),
        {
          droppable: j,
          get isDropTarget() {
            return j.isDropTarget;
          },
          ref: (0, ci.useCallback)(
            (a) => {
              var b, c;
              (a ||
                null == (b = i.element) ||
                !b.isConnected ||
                (null == (c = i.manager) ? void 0 : c.dragOperation.status.idle)) &&
                (i.element = null != a ? a : void 0);
            },
            [i]
          ),
        }
      );
    }
    var h4 = Object.create,
      h5 = Object.defineProperty,
      h6 = Object.defineProperties,
      h7 = Object.getOwnPropertyDescriptor,
      h8 = Object.getOwnPropertyDescriptors,
      h9 = Object.getOwnPropertySymbols,
      ia = Object.prototype.hasOwnProperty,
      ib = Object.prototype.propertyIsEnumerable,
      ic = (a) => {
        throw TypeError(a);
      },
      id = (a, b, c) =>
        b in a
          ? h5(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      ie = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"],
      ig = (a) => (void 0 !== a && "function" != typeof a ? ic("Function expected") : a),
      ih = (a, b, c, d, e) => ({
        kind: ie[a],
        name: b,
        metadata: d,
        addInitializer: (a) => (c._ ? ic("Already initialized") : e.push(ig(a || null))),
      }),
      ii = (a, b, c, d) => {
        for (var e = 0, f = a[b >> 1], g = f && f.length; e < g; e++)
          1 & b ? f[e].call(c) : (d = f[e].call(c, d));
        return d;
      },
      ij = (a, b, c, d, e, f) => {
        for (
          var g,
            h,
            i,
            j,
            k,
            l = 7 & b,
            m = a.length + 1,
            n = ie[l + 5],
            o = (a[m - 1] = []),
            p = a[m] || (a[m] = []),
            q =
              ((e = e.prototype),
              h7(
                {
                  get [c]() {
                    return il(this, f);
                  },
                  set [c](x) {
                    return io(this, f, x);
                  },
                },
                c
              )),
            r = d.length - 1;
          r >= 0;
          r--
        )
          (((j = ih(l, c, (i = {}), a[3], p)).static = !1),
            (j.private = !1),
            ((k = j.access = { has: (a) => c in a }).get = (a) => a[c]),
            (k.set = (a, b) => (a[c] = b)),
            (h = (0, d[r])({ get: q.get, set: q.set }, j)),
            (i._ = 1),
            void 0 === h
              ? ig(h) && (q[n] = h)
              : "object" != typeof h || null === h
                ? ic("Object expected")
                : (ig((g = h.get)) && (q.get = g),
                  ig((g = h.set)) && (q.set = g),
                  ig((g = h.init)) && o.unshift(g)));
        return (q && h5(e, c, q), e);
      },
      ik = (a, b, c) => b.has(a) || ic("Cannot " + c),
      il = (a, b, c) => (ik(a, b, "read from private field"), b.get(a)),
      im = (a, b, c) =>
        b.has(a)
          ? ic("Cannot add the same private member more than once")
          : b instanceof WeakSet
            ? b.add(a)
            : b.set(a, c),
      io = (a, b, c, d) => (ik(a, b, "write to private field"), b.set(a, c), c);
    function ip(a) {
      return a instanceof iJ || a instanceof iI;
    }
    var iq = class extends eZ {
        constructor(a) {
          super(a);
          const b = dy(() => {
              let { dragOperation: b } = a;
              if (gg(b.activatorEvent) && ip(b.source) && b.status.initialized) {
                let b = a.registry.plugins.get(g7);
                if (b) return (b.disable(), () => b.enable());
              }
            }),
            c = a.monitor.addEventListener("dragmove", (a, b) => {
              queueMicrotask(() => {
                if (this.disabled || a.defaultPrevented || !a.nativeEvent) return;
                let { dragOperation: c } = b;
                if (!gg(a.nativeEvent) || !ip(c.source) || !c.shape) return;
                let { actions: d, collisionObserver: e, registry: f } = b,
                  { by: g } = a;
                if (!g) return;
                let h = (function (a) {
                    let { x: b, y: c } = a;
                    return b > 0
                      ? "right"
                      : b < 0
                        ? "left"
                        : c > 0
                          ? "down"
                          : c < 0
                            ? "up"
                            : void 0;
                  })(g),
                  { source: i, target: j } = c,
                  { center: k } = c.shape.current,
                  l = [],
                  m = [];
                (dd(() => {
                  for (let a of f.droppables) {
                    let { id: b } = a;
                    if (!a.accepts(i) || (b === (null == j ? void 0 : j.id) && ip(a)) || !a.element)
                      continue;
                    let c = a.shape,
                      d = new gc(a.element, { getBoundingClientRect: (a) => fB(a, void 0, 0.2) });
                    d.height &&
                      d.width &&
                      (("down" == h && k.y + 10 < d.center.y) ||
                        ("up" == h && k.y - 10 > d.center.y) ||
                        ("left" == h && k.x - 10 > d.center.x) ||
                        ("right" == h && k.x + 10 < d.center.x)) &&
                      (l.push(a), (a.shape = d), m.push(() => (a.shape = c)));
                  }
                }),
                  a.preventDefault(),
                  e.disable());
                let n = e.computeCollisions(l, gk);
                dd(() => m.forEach((a) => a()));
                let [o] = n;
                if (!o) return;
                let { id: p } = o,
                  { index: q, group: r } = i.sortable;
                d.setDropTarget(p).then(() => {
                  let { source: a, target: b, shape: f } = c;
                  if (!a || !ip(a) || !f) return;
                  let { index: g, group: h, target: i } = a.sortable,
                    j = q !== g || r !== h,
                    k = j ? i : null == b ? void 0 : b.element;
                  if (!k) return;
                  f6(k);
                  let l = new gc(k);
                  if (!l) return;
                  let m = ep.delta(l, ep.from(f.current.boundingRectangle), a.alignment);
                  (d.move({ by: m }),
                    j ? d.setDropTarget(a.id).then(() => e.enable()) : e.enable());
                });
              });
            });
          this.destroy = () => {
            (c(), b());
          };
        }
      },
      ir = Object.defineProperty,
      is = Object.defineProperties,
      it = Object.getOwnPropertyDescriptors,
      iu = Object.getOwnPropertySymbols,
      iv = Object.prototype.hasOwnProperty,
      iw = Object.prototype.propertyIsEnumerable,
      ix = (a, b, c) =>
        b in a
          ? ir(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      iy = (a, b) => {
        for (var c in b || (b = {})) iv.call(b, c) && ix(a, c, b[c]);
        if (iu) for (var c of iu(b)) iw.call(b, c) && ix(a, c, b[c]);
        return a;
      };
    function iz(a, b, c) {
      if (b === c) return a;
      let d = a.slice();
      return (d.splice(c, 0, d.splice(b, 1)[0]), d);
    }
    var iA = "__default__";
    function iB(a, b, c, d) {
      c.insertAdjacentElement(d < b ? "afterend" : "beforebegin", a);
    }
    function iC(a, b) {
      return a.index - b.index;
    }
    function iD(a) {
      return Array.from(a).sort(iC);
    }
    var iE = [
        iq,
        class extends eZ {
          constructor(a) {
            super(a);
            const b = () => {
                let b = new Map();
                for (let c of a.registry.droppables)
                  if (c instanceof iJ) {
                    let { sortable: a } = c,
                      { group: d } = a,
                      e = b.get(d);
                    (e || ((e = new Set()), b.set(d, e)), e.add(a));
                  }
                for (let [a, c] of b) b.set(a, new Set(iD(c)));
                return b;
              },
              c = [
                a.monitor.addEventListener("dragover", (a, c) => {
                  if (this.disabled) return;
                  let { dragOperation: d } = c,
                    { source: e, target: f } = d;
                  if (!ip(e) || !ip(f) || e.sortable === f.sortable) return;
                  let g = b(),
                    h = e.sortable.group === f.sortable.group,
                    i = g.get(e.sortable.group),
                    j = h ? i : g.get(f.sortable.group);
                  i &&
                    j &&
                    queueMicrotask(() => {
                      a.defaultPrevented ||
                        c.renderer.rendering.then(() => {
                          var d, k, l;
                          let m = b();
                          for (let [a, b] of g.entries())
                            for (let [c, e] of Array.from(b).entries())
                              if (
                                e.index !== c ||
                                e.group !== a ||
                                !(null == (d = m.get(a)) ? void 0 : d.has(e))
                              )
                                return;
                          let n = e.sortable.element,
                            o = f.sortable.element;
                          if (!o || !n || (!h && f.id === e.sortable.group)) return;
                          let p = iD(i),
                            q = h ? p : iD(j),
                            r = null != (k = e.sortable.group) ? k : iA,
                            s = null != (l = f.sortable.group) ? l : iA,
                            t = { [r]: p, [s]: q },
                            u = (function (a, b, c) {
                              var d, e;
                              let f,
                                g,
                                { source: h, target: i, canceled: j } = b.operation;
                              if (!h || !i || j)
                                return ("preventDefault" in b && b.preventDefault(), a);
                              let k = (a, b) =>
                                a === b || ("object" == typeof a && "id" in a && a.id === b);
                              if (Array.isArray(a)) {
                                let b = a.findIndex((a) => k(a, h.id)),
                                  d = a.findIndex((a) => k(a, i.id));
                                if (-1 === b || -1 === d) return a;
                                if (!j && "index" in h && "number" == typeof h.index) {
                                  let d = h.index;
                                  if (d !== b) return c(a, b, d);
                                }
                                return c(a, b, d);
                              }
                              let l = Object.entries(a),
                                m = -1,
                                n = -1;
                              for (let [a, b] of l)
                                if (
                                  (-1 === m &&
                                    -1 !== (m = b.findIndex((a) => k(a, h.id))) &&
                                    (f = a),
                                  -1 === n &&
                                    -1 !== (n = b.findIndex((a) => k(a, i.id))) &&
                                    (g = a),
                                  -1 !== m && -1 !== n)
                                )
                                  break;
                              if (!h.manager) return a;
                              let { dragOperation: o } = h.manager,
                                p =
                                  null != (e = null == (d = o.shape) ? void 0 : d.current.center)
                                    ? e
                                    : o.position.current;
                              if (null == g && i.id in a) {
                                let b = i.shape && p.y > i.shape.center.y ? a[i.id].length : 0;
                                ((g = i.id), (n = b));
                              }
                              if (null == f || null == g || (f === g && m === n))
                                return ("preventDefault" in b && b.preventDefault(), a);
                              if (f === g) return is(iy({}, a), it({ [f]: c(a[f], m, n) }));
                              let q = +!!(
                                  i.shape && Math.round(p.y) > Math.round(i.shape.center.y)
                                ),
                                r = a[f][m];
                              return is(
                                iy({}, a),
                                it({
                                  [f]: [...a[f].slice(0, m), ...a[f].slice(m + 1)],
                                  [g]: [...a[g].slice(0, n + q), r, ...a[g].slice(n + q)],
                                })
                              );
                            })(t, a, iz);
                          if (t === u) return;
                          let v = u[s].indexOf(e.sortable),
                            w = u[s].indexOf(f.sortable);
                          (c.collisionObserver.disable(),
                            iB(n, v, o, w),
                            dd(() => {
                              for (let [a, b] of u[r].entries()) b.index = a;
                              if (!h)
                                for (let [a, b] of u[s].entries())
                                  ((b.group = f.sortable.group), (b.index = a));
                            }),
                            c.actions.setDropTarget(e.id).then(() => c.collisionObserver.enable()));
                        });
                    });
                }),
                a.monitor.addEventListener("dragend", (a, c) => {
                  if (!a.canceled) return;
                  let { dragOperation: d } = c,
                    { source: e } = d;
                  ip(e) &&
                    (e.sortable.initialIndex !== e.sortable.index ||
                      e.sortable.initialGroup !== e.sortable.group) &&
                    queueMicrotask(() => {
                      let a = b(),
                        d = a.get(e.sortable.initialGroup);
                      d &&
                        c.renderer.rendering.then(() => {
                          for (let [b, c] of a.entries())
                            for (let [a, d] of Array.from(c).entries())
                              if (d.index !== a || d.group !== b) return;
                          let b = iD(d),
                            c = e.sortable.element,
                            f = b[e.sortable.initialIndex],
                            g = null == f ? void 0 : f.element;
                          f &&
                            g &&
                            c &&
                            (iB(c, f.index, g, e.index),
                            dd(() => {
                              for (let [b, c] of a.entries())
                                for (let a of Array.from(c).values())
                                  ((a.index = a.initialIndex), (a.group = a.initialGroup));
                            }));
                        });
                    });
                }),
              ];
            this.destroy = () => {
              for (let a of c) a();
            };
          }
        },
      ],
      iF = { duration: 250, easing: "cubic-bezier(0.25, 1, 0.5, 1)", idle: !1 },
      iG = new d2();
    ((ca = [dY]), (b9 = [dY]));
    var iH = class {
      constructor(a, b) {
        (im(this, cc, ii(cb, 8, this)),
          ii(cb, 11, this),
          im(this, cd),
          im(this, ce),
          im(this, cf, ii(cb, 12, this)),
          ii(cb, 15, this),
          im(this, cg),
          (this.register = () => (
            dd(() => {
              var a, b;
              (null == (a = this.manager) || a.registry.register(this.droppable),
                null == (b = this.manager) || b.registry.register(this.draggable));
            }),
            () => this.unregister()
          )),
          (this.unregister = () => {
            dd(() => {
              var a, b;
              (null == (a = this.manager) || a.registry.unregister(this.droppable),
                null == (b = this.manager) || b.registry.unregister(this.draggable));
            });
          }),
          (this.destroy = () => {
            dd(() => {
              (this.droppable.destroy(), this.draggable.destroy());
            });
          }));
        var {
            effects: c = () => [],
            group: d,
            index: e,
            sensors: f,
            type: g,
            transition: h = iF,
            plugins: i = iE,
          } = a,
          j = ((a, b) => {
            var c = {};
            for (var d in a) ia.call(a, d) && 0 > b.indexOf(d) && (c[d] = a[d]);
            if (null != a && h9)
              for (var d of h9(a)) 0 > b.indexOf(d) && ib.call(a, d) && (c[d] = a[d]);
            return c;
          })(a, ["effects", "group", "index", "sensors", "type", "transition", "plugins"]);
        ((this.droppable = new iJ(j, b, this)),
          (this.draggable = new iI(
            ((a, b) => h6(a, h8(b)))(
              ((a, b) => {
                for (var c in b || (b = {})) ia.call(b, c) && id(a, c, b[c]);
                if (h9) for (var c of h9(b)) ib.call(b, c) && id(a, c, b[c]);
                return a;
              })({}, j),
              {
                effects: () => [
                  () => {
                    var a, b, c;
                    let d = null == (a = this.manager) ? void 0 : a.dragOperation.status;
                    ((null == d ? void 0 : d.initializing) &&
                      this.id ===
                        (null == (c = null == (b = this.manager) ? void 0 : b.dragOperation.source)
                          ? void 0
                          : c.id) &&
                      iG.clear(this.manager),
                      (null == d ? void 0 : d.dragging) &&
                        iG.set(
                          this.manager,
                          this.id,
                          de(() => ({ initialIndex: this.index, initialGroup: this.group }))
                        ));
                  },
                  () => {
                    let { index: a, group: b, manager: c } = this,
                      d = il(this, ce),
                      e = il(this, cd);
                    (a !== d || b !== e) && (io(this, ce, a), io(this, cd, b), this.animate());
                  },
                  () => {
                    let { target: a } = this,
                      { feedback: b, isDragSource: c } = this.draggable;
                    "move" == b && c && (this.droppable.disabled = !a);
                  },
                  () => {
                    let { manager: a } = this;
                    for (let b of i) null == a || a.registry.register(b);
                  },
                  ...c(),
                ],
                type: g,
                sensors: f,
              }
            ),
            b,
            this
          )),
          io(this, cg, j.element),
          (this.manager = b),
          (this.index = e),
          io(this, ce, e),
          (this.group = d),
          io(this, cd, d),
          (this.type = g),
          (this.transition = h));
      }
      get initialIndex() {
        var a, b;
        return null != (b = null == (a = iG.get(this.manager, this.id)) ? void 0 : a.initialIndex)
          ? b
          : this.index;
      }
      get initialGroup() {
        var a, b;
        return null != (b = null == (a = iG.get(this.manager, this.id)) ? void 0 : a.initialGroup)
          ? b
          : this.group;
      }
      animate() {
        de(() => {
          let { manager: a, transition: b } = this,
            { shape: c } = this.droppable;
          if (!a) return;
          let { idle: d } = a.dragOperation.status;
          c &&
            b &&
            (!d || b.idle) &&
            a.renderer.rendering.then(() => {
              let { element: d } = this;
              if (!d) return;
              let e = this.refreshShape();
              if (!e) return;
              let f = {
                  x: c.boundingRectangle.left - e.boundingRectangle.left,
                  y: c.boundingRectangle.top - e.boundingRectangle.top,
                },
                { translate: g } = fY(d),
                h = f8(d, g, !1),
                i = f8(d, g);
              (f.x || f.y) &&
                f7({
                  element: d,
                  keyframes: {
                    translate: [`${h.x + f.x}px ${h.y + f.y}px ${h.z}`, `${i.x}px ${i.y}px ${i.z}`],
                  },
                  options: b,
                }).then(() => {
                  a.dragOperation.status.dragging || (this.droppable.shape = void 0);
                });
            });
        });
      }
      get manager() {
        return this.draggable.manager;
      }
      set manager(a) {
        dd(() => {
          ((this.draggable.manager = a), (this.droppable.manager = a));
        });
      }
      set element(a) {
        dd(() => {
          let b = il(this, cg),
            c = this.droppable.element,
            d = this.draggable.element;
          ((c && c !== b) || (this.droppable.element = a),
            (d && d !== b) || (this.draggable.element = a),
            io(this, cg, a));
        });
      }
      get element() {
        var a, b;
        let c = il(this, cg);
        if (c) return null != (b = null != (a = fF.get(c)) ? a : c) ? b : this.droppable.element;
      }
      set target(a) {
        this.droppable.element = a;
      }
      get target() {
        return this.droppable.element;
      }
      set source(a) {
        this.draggable.element = a;
      }
      get source() {
        return this.draggable.element;
      }
      get disabled() {
        return this.draggable.disabled && this.droppable.disabled;
      }
      set feedback(a) {
        this.draggable.feedback = a;
      }
      set disabled(a) {
        dd(() => {
          ((this.droppable.disabled = a), (this.draggable.disabled = a));
        });
      }
      set data(a) {
        dd(() => {
          ((this.droppable.data = a), (this.draggable.data = a));
        });
      }
      set handle(a) {
        this.draggable.handle = a;
      }
      set id(a) {
        dd(() => {
          ((this.droppable.id = a), (this.draggable.id = a));
        });
      }
      get id() {
        return this.droppable.id;
      }
      set sensors(a) {
        this.draggable.sensors = a;
      }
      set modifiers(a) {
        this.draggable.modifiers = a;
      }
      set collisionPriority(a) {
        this.droppable.collisionPriority = a;
      }
      set collisionDetector(a) {
        this.droppable.collisionDetector = null != a ? a : gj;
      }
      set alignment(a) {
        this.draggable.alignment = a;
      }
      get alignment() {
        return this.draggable.alignment;
      }
      set type(a) {
        dd(() => {
          ((this.droppable.type = a), (this.draggable.type = a));
        });
      }
      get type() {
        return this.draggable.type;
      }
      set accept(a) {
        this.droppable.accept = a;
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
      accepts(a) {
        return this.droppable.accepts(a);
      }
    };
    ((cb = [, , , h4(null)]),
      (cc = new WeakMap()),
      (cd = new WeakMap()),
      (ce = new WeakMap()),
      (cf = new WeakMap()),
      (cg = new WeakMap()),
      ij(cb, 4, "index", ca, iH, cc),
      ij(cb, 4, "group", b9, iH, cf),
      (w = cb),
      id(iH, ((h = "metadata"), (i = Symbol[h]) ? i : Symbol.for("Symbol." + h)), w[3]));
    var iI = class extends hr {
        constructor(a, b, c) {
          (super(a, b), (this.sortable = c));
        }
        get index() {
          return this.sortable.index;
        }
      },
      iJ = class extends hs {
        constructor(a, b, c) {
          (super(a, b), (this.sortable = c));
        }
      },
      iK = Object.defineProperty,
      iL = Object.defineProperties,
      iM = Object.getOwnPropertyDescriptors,
      iN = Object.getOwnPropertySymbols,
      iO = Object.prototype.hasOwnProperty,
      iP = Object.prototype.propertyIsEnumerable,
      iQ = (a, b, c) =>
        b in a
          ? iK(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c })
          : (a[b] = c),
      iR = (a, b) => {
        for (var c in b || (b = {})) iO.call(b, c) && iQ(a, c, b[c]);
        if (iN) for (var c of iN(b)) iP.call(b, c) && iQ(a, c, b[c]);
        return a;
      };
    function iS(a) {
      let {
          accept: b,
          collisionDetector: c,
          collisionPriority: d,
          id: e,
          data: f,
          element: g,
          handle: h,
          index: i,
          group: j,
          disabled: k,
          feedback: l,
          modifiers: m,
          sensors: n,
          target: o,
          type: p,
        } = a,
        q = iR(iR({}, iF), a.transition),
        r = hP(
          (b) =>
            new iH(
              iL(
                iR({}, a),
                iM({
                  transition: q,
                  register: !1,
                  handle: hu(h),
                  element: hu(g),
                  target: hu(o),
                  feedback: l,
                })
              ),
              b
            )
        ),
        s = hw(r, iT);
      return (
        hz(e, () => (r.id = e)),
        hv(() => {
          dd(() => {
            ((r.group = j), (r.index = i));
          });
        }, [r, j, i]),
        hz(p, () => (r.type = p)),
        hz(b, () => (r.accept = b), void 0, dX),
        hz(f, () => f && (r.data = f)),
        hz(
          i,
          () => {
            var a;
            (null == (a = r.manager) ? void 0 : a.dragOperation.status.idle) &&
              (null == q ? void 0 : q.idle) &&
              r.refreshShape();
          },
          hx
        ),
        hA(h, (a) => (r.handle = a)),
        hA(g, (a) => (r.element = a)),
        hA(o, (a) => (r.target = a)),
        hz(k, () => (r.disabled = !0 === k)),
        hz(n, () => (r.sensors = n)),
        hz(c, () => (r.collisionDetector = c)),
        hz(d, () => (r.collisionPriority = d)),
        hz(l, () => (r.feedback = null != l ? l : "default")),
        hz(q, () => (r.transition = q), void 0, dX),
        hz(m, () => (r.modifiers = m), void 0, dX),
        hz(a.alignment, () => (r.alignment = a.alignment)),
        {
          sortable: s,
          get isDragging() {
            return s.isDragging;
          },
          get isDropping() {
            return s.isDropping;
          },
          get isDragSource() {
            return s.isDragSource;
          },
          get isDropTarget() {
            return s.isDropTarget;
          },
          handleRef: (0, ci.useCallback)(
            (a) => {
              r.handle = null != a ? a : void 0;
            },
            [r]
          ),
          ref: (0, ci.useCallback)(
            (a) => {
              var b, c;
              (a ||
                null == (b = r.element) ||
                !b.isConnected ||
                (null == (c = r.manager) ? void 0 : c.dragOperation.status.idle)) &&
                (r.element = null != a ? a : void 0);
            },
            [r]
          ),
          sourceRef: (0, ci.useCallback)(
            (a) => {
              var b, c;
              (a ||
                null == (b = r.source) ||
                !b.isConnected ||
                (null == (c = r.manager) ? void 0 : c.dragOperation.status.idle)) &&
                (r.source = null != a ? a : void 0);
            },
            [r]
          ),
          targetRef: (0, ci.useCallback)(
            (a) => {
              var b, c;
              (a ||
                null == (b = r.target) ||
                !b.isConnected ||
                (null == (c = r.manager) ? void 0 : c.dragOperation.status.idle)) &&
                (r.target = null != a ? a : void 0);
            },
            [r]
          ),
        }
      );
    }
    function iT(a, b, c) {
      return "isDragSource" === a && !c && !!b;
    }
    let iU = (a, b) => {
      let c = a instanceof Map ? a : new Map(a.entries()),
        d = b instanceof Map ? b : new Map(b.entries());
      if (c.size !== d.size) return !1;
      for (let [a, b] of c) if (!d.has(a) || !Object.is(b, d.get(a))) return !1;
      return !0;
    };
    function iV(a) {
      let b = ci.default.useRef(void 0);
      return (c) => {
        let d = a(c);
        return !(function (a, b) {
          if (Object.is(a, b)) return !0;
          if (
            "object" != typeof a ||
            null === a ||
            "object" != typeof b ||
            null === b ||
            Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)
          )
            return !1;
          if (Symbol.iterator in a && Symbol.iterator in b) {
            if ("entries" in a && "entries" in b) return iU(a, b);
            let c = a[Symbol.iterator](),
              d = b[Symbol.iterator](),
              e = c.next(),
              f = d.next();
            for (; !e.done && !f.done; ) {
              if (!Object.is(e.value, f.value)) return !1;
              ((e = c.next()), (f = d.next()));
            }
            return !!e.done && !!f.done;
          }
          return iU({ entries: () => Object.entries(a) }, { entries: () => Object.entries(b) });
        })(b.current, d)
          ? (b.current = d)
          : b.current;
      };
    }
    var iW = a.i(91023),
      iX =
        ((j = {
          "../../node_modules/classnames/index.js"(b, c) {
            cz();
            var d = {}.hasOwnProperty;
            function e() {
              for (var a = "", b = 0; b < arguments.length; b++) {
                var c = arguments[b];
                c &&
                  (a = f(
                    a,
                    (function (a) {
                      if ("string" == typeof a || "number" == typeof a) return a;
                      if ("object" != typeof a) return "";
                      if (Array.isArray(a)) return e.apply(null, a);
                      if (
                        a.toString !== Object.prototype.toString &&
                        !a.toString.toString().includes("[native code]")
                      )
                        return a.toString();
                      var b = "";
                      for (var c in a) d.call(a, c) && a[c] && (b = f(b, c));
                      return b;
                    })(c)
                  ));
              }
              return a;
            }
            function f(a, b) {
              return b ? (a ? a + " " + b : a + b) : a;
            }
            if (void 0 !== c && c.exports) ((e.default = e), (c.exports = e));
            else if ("function" == typeof define && "object" == typeof define.amd && define.amd)
              void 0 !== e && a.v(e);
            else window.classNames = e;
          },
        }),
        function () {
          return (k || (0, j[cq(j)[0]])((k = { exports: {} }).exports, k), k.exports);
        });
    (cz(), cz(), cz());
    var iY =
        ((n = null != (l = iX()) ? cl(cs(l)) : {}),
        ((a, b, c, d) => {
          if ((b && "object" == typeof b) || "function" == typeof b)
            for (let e of cq(b))
              ct.call(a, e) ||
                e === c ||
                cm(a, e, { get: () => b[e], enumerable: !(d = co(b, e)) || d.enumerable });
          return a;
        })(!m && l && l.__esModule ? n : cm(n, "default", { value: l, enumerable: !0 }), l)),
      iZ =
        (a, b, c = { baseClass: "" }) =>
        (d = {}) => {
          if ("string" == typeof d) return (b[`${a}-${d}`] && c.baseClass + b[`${a}-${d}`]) || "";
          if ("object" != typeof d) return c.baseClass + b[a] || "";
          {
            let e = {};
            for (let c in d) e[b[`${a}--${c}`]] = d[c];
            let f = b[a];
            return c.baseClass + (0, iY.default)(cw({ [f]: !!f }, e));
          }
        };
    cz();
    var i$ = iZ("ActionBar", {
        ActionBar: "_ActionBar_rvadt_1",
        "ActionBar-label": "_ActionBar-label_rvadt_18",
        "ActionBar-action": "_ActionBar-action_rvadt_30",
        "ActionBar-group": "_ActionBar-group_rvadt_38",
      }),
      i_ = ({ label: a, children: b }) =>
        (0, cZ.jsxs)("div", {
          className: i$(),
          onClick: (a) => {
            a.stopPropagation();
          },
          children: [
            a &&
              (0, cZ.jsx)(i_.Group, {
                children: (0, cZ.jsx)("div", { className: i$("label"), children: a }),
              }),
            b,
          ],
        });
    ((i_.Action = ({ children: a, label: b, onClick: c }) =>
      (0, cZ.jsx)("button", {
        type: "button",
        className: i$("action"),
        onClick: c,
        title: b,
        children: a,
      })),
      (i_.Label = ({ label: a }) => (0, cZ.jsx)("div", { className: i$("label"), children: a })),
      (i_.Group = ({ children: a }) => (0, cZ.jsx)("div", { className: i$("group"), children: a })),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz());
    var i0 = (a, b, c) => {
      let d = Array.from(a),
        [e] = d.splice(b, 1);
      return (d.splice(c, 0, e), d);
    };
    (cz(), cz(), cz(), cz(), cz(), cz(), cz());
    var i1 = (a, b, c) => {
      let d = Array.from(a || []);
      return (d.splice(b, 0, c), d);
    };
    cz();
    var i2 = (a) => (a ? `${a}-${c3()}` : c3());
    cz();
    var i3 = (a, b) => {
      let [c] = a.split(":"),
        d = b.indexes.nodes[c];
      return ((null == d ? void 0 : d.path) || []).map((a) => a.split(":")[0]);
    };
    cz();
    var i4 = (a, b, c = !1) => {
      let d,
        e,
        f = i2(a.type);
      return cG(
        ((d = cw({}, a)),
        (e = { props: c ? cn(cw({}, a.props), cp({ id: f })) : cw({}, a.props) }),
        cn(d, cp(e))),
        b,
        (a) =>
          a.map((a) => {
            let b,
              d,
              e = i2(a.type);
            return (
              (b = cw({}, a)),
              (d = { props: c ? cn(cw({}, a.props), cp({ id: e })) : cw({ id: e }, a.props) }),
              cn(b, cp(d))
            );
          })
      );
    };
    function i5(a, b, c) {
      let d = b.id || i2(b.componentType),
        e = i4(
          {
            type: b.componentType,
            props: cn(
              cw({}, c.config.components[b.componentType].defaultProps || {}),
              cp({ id: d })
            ),
          },
          c.config
        ),
        [f] = b.destinationZone.split(":"),
        g = i3(b.destinationZone, a);
      return cO(
        a,
        c.config,
        (a, c) => (c === b.destinationZone ? i1(a || [], b.destinationIndex, e) : a),
        (a, c) =>
          a.props.id === d ||
          a.props.id === f ||
          g.includes(a.props.id) ||
          c.includes(b.destinationZone)
            ? a
            : null
      );
    }
    function i6(a, b) {
      var c, d;
      let e = null == (c = b.indexes.zones) ? void 0 : c[a.zone || cL];
      return e ? (null == (d = b.indexes.nodes[e.contentIds[a.index]]) ? void 0 : d.data) : void 0;
    }
    (cz(), cz(), cz(), cz(), cz(), cz(), cz());
    var i7 = (a, b) => {
        let c = Array.from(a);
        return (c.splice(b, 1), c);
      },
      i8 = (a, b, c) => {
        if (b.sourceZone === b.destinationZone && b.sourceIndex === b.destinationIndex) return a;
        let d = i6({ zone: b.sourceZone, index: b.sourceIndex }, a);
        if (!d) return a;
        let e = i3(b.sourceZone, a),
          f = i3(b.destinationZone, a);
        return cO(
          a,
          c.config,
          (a, c) =>
            c === b.sourceZone && c === b.destinationZone
              ? i1(i7(a, b.sourceIndex), b.destinationIndex, d)
              : c === b.sourceZone
                ? i7(a, b.sourceIndex)
                : c === b.destinationZone
                  ? i1(a, b.destinationIndex, d)
                  : a,
          (a, c) => {
            let [g] = b.sourceZone.split(":"),
              [h] = b.destinationZone.split(":"),
              i = a.props.id;
            return g === i ||
              h === i ||
              d.props.id === i ||
              e.indexOf(i) > -1 ||
              f.indexOf(i) > -1 ||
              c.includes(b.destinationZone)
              ? a
              : null;
          }
        );
      };
    (cz(), cz());
    var i9 = {};
    (cz(), cz(), cz());
    var ja = (a) => {
      let { data: b, ui: c } = a;
      return { data: b, ui: c };
    };
    function jb({ record: a, onAction: b, appStore: c }) {
      var d;
      return (
        (d = (a, b) => {
          if ("set" === b.type) {
            if ("object" == typeof b.state) {
              let d = cw(cw({}, a), b.state);
              return b.state.indexes
                ? d
                : (console.warn(
                    "`set` is expensive and may cause unnecessary re-renders. Consider using a more atomic action instead."
                  ),
                  cO(d, c.config));
            }
            return cw(cw({}, a), b.state(a));
          }
          if ("insert" === b.type) return i5(a, b, c);
          if ("replace" === b.type)
            return ((a, b, c) => {
              let [d] = b.destinationZone.split(":"),
                e = i3(b.destinationZone, a),
                f = a.indexes.zones[b.destinationZone].contentIds[b.destinationIndex];
              if (f !== b.data.props.id)
                throw Error(
                  'Can\'t change the id during a replace action. Please us "remove" and "insert" to define a new node.'
                );
              let g = [],
                h = cG(
                  b.data,
                  c.config,
                  (a, b) => (
                    g.push(`${b.parentId}:${b.propName}`),
                    a.map((a) => {
                      let b = i2(a.type);
                      return cn(cw({}, a), cp({ props: cw({ id: b }, a.props) }));
                    })
                  )
                ),
                i = cw({}, a);
              return (
                Object.keys(a.indexes.zones).forEach((a) => {
                  a.split(":")[0] !== f || g.includes(a) || delete i.indexes.zones[a];
                }),
                cO(
                  i,
                  c.config,
                  (a, c) => {
                    let d = [...a];
                    return (c === b.destinationZone && (d[b.destinationIndex] = h), d);
                  },
                  (a, b) => {
                    let c = b.map((a) => a.split(":")[0]);
                    return a.props.id === h.props.id
                      ? h
                      : a.props.id === d
                        ? a
                        : e.indexOf(a.props.id) > -1
                          ? a
                          : c.indexOf(h.props.id) > -1
                            ? a
                            : null;
                  }
                )
              );
            })(a, b, c);
          if ("replaceRoot" === b.type)
            return cO(
              a,
              c.config,
              (a) => a,
              (a) =>
                "root" === a.props.id
                  ? cn(
                      cw({}, a),
                      cp({ props: cw(cw({}, a.props), b.root.props), readOnly: b.root.readOnly })
                    )
                  : a
            );
          if ("duplicate" === b.type) {
            var d, e, f;
            let g, h, i, j, k, l, m, n;
            return (
              (d = a),
              (e = b),
              (f = c),
              (k = i6({ index: e.sourceIndex, zone: e.sourceZone }, d)),
              (l = i3(e.sourceZone, d)),
              (m =
                ((g = cw({}, k)),
                (h = { props: cn(cw({}, k.props), cp({ id: i2(k.type) })) }),
                cn(g, cp(h)))),
              (n = cO(
                d,
                f.config,
                (a, b) => (b === e.sourceZone ? i1(a, e.sourceIndex + 1, k) : a),
                (a, b, c) => {
                  let d = b[b.length - 1];
                  if (b.map((a) => a.split(":")[0]).indexOf(m.props.id) > -1) {
                    let b, c;
                    return (
                      (b = cw({}, a)),
                      (c = { props: cn(cw({}, a.props), cp({ id: i2(a.type) })) }),
                      cn(b, cp(c))
                    );
                  }
                  if (d === e.sourceZone && c === e.sourceIndex + 1) return m;
                  let [f] = e.sourceZone.split(":");
                  return f === a.props.id || l.indexOf(a.props.id) > -1 ? a : null;
                }
              )),
              (i = cw({}, n)),
              (j = {
                ui: cn(
                  cw({}, n.ui),
                  cp({ itemSelector: { index: e.sourceIndex + 1, zone: e.sourceZone } })
                ),
              }),
              cn(i, cp(j))
            );
          }
          if ("reorder" === b.type)
            return i8(
              a,
              {
                type: "move",
                sourceIndex: b.sourceIndex,
                sourceZone: b.destinationZone,
                destinationIndex: b.destinationIndex,
                destinationZone: b.destinationZone,
              },
              c
            );
          if ("move" === b.type) return i8(a, b, c);
          if ("remove" === b.type) {
            let d, e, f;
            return (
              (d = i6({ index: b.index, zone: b.zone }, a)),
              (e = Object.entries(a.indexes.nodes).reduce(
                (a, [b, c]) =>
                  c.path.map((a) => a.split(":")[0]).includes(d.props.id) ? [...a, b] : a,
                [d.props.id]
              )),
              Object.keys(
                (f = cO(a, c.config, (a, c) => (c === b.zone ? i7(a, b.index) : a))).data.zones ||
                  {}
              ).forEach((a) => {
                let b = a.split(":")[0];
                e.includes(b) && f.data.zones && delete f.data.zones[a];
              }),
              Object.keys(f.indexes.zones).forEach((a) => {
                let b = a.split(":")[0];
                e.includes(b) && delete f.indexes.zones[a];
              }),
              e.forEach((a) => {
                delete f.indexes.nodes[a];
              }),
              f
            );
          }
          if ("registerZone" === b.type)
            return (function (a, b) {
              if (i9[b.zone]) {
                let c, d, e, f, g, h, i, j;
                return (
                  (i = cw({}, a)),
                  (j = {
                    data:
                      ((c = cw({}, a.data)),
                      (d = { zones: cn(cw({}, a.data.zones), cp({ [b.zone]: i9[b.zone] })) }),
                      cn(c, cp(d))),
                    indexes:
                      ((g = cw({}, a.indexes)),
                      (h = {
                        zones:
                          ((e = cw({}, a.indexes.zones)),
                          (f = {
                            [b.zone]: cn(
                              cw({}, a.indexes.zones[b.zone]),
                              cp({
                                contentIds: i9[b.zone].map((a) => a.props.id),
                                type: "dropzone",
                              })
                            ),
                          }),
                          cn(e, cp(f))),
                      }),
                      cn(g, cp(h))),
                  }),
                  cn(i, cp(j))
                );
              }
              return cn(cw({}, a), cp({ data: cS(a.data, b.zone) }));
            })(a, b);
          if ("unregisterZone" === b.type) {
            let c,
              d,
              e = cw({}, a.data.zones || {}),
              f = cw({}, a.indexes.zones || {});
            return (
              e[b.zone] && ((i9[b.zone] = e[b.zone]), delete e[b.zone]),
              delete f[b.zone],
              (c = cw({}, a)),
              (d = {
                data: cn(cw({}, a.data), cp({ zones: e })),
                indexes: cn(cw({}, a.indexes), cp({ zones: f })),
              }),
              cn(c, cp(d))
            );
          }
          if ("setData" === b.type) {
            if ("object" == typeof b.data)
              return (
                console.warn(
                  "`setData` is expensive and may cause unnecessary re-renders. Consider using a more atomic action instead."
                ),
                cO(cn(cw({}, a), cp({ data: cw(cw({}, a.data), b.data) })), c.config)
              );
            return cO(cn(cw({}, a), cp({ data: cw(cw({}, a.data), b.data(a.data)) })), c.config);
          }
          if ("setUi" === b.type) {
            if ("object" == typeof b.ui) return cn(cw({}, a), cp({ ui: cw(cw({}, a.ui), b.ui) }));
            return cn(cw({}, a), cp({ ui: cw(cw({}, a.ui), b.ui(a.ui)) }));
          }
          return a;
        }),
        (c, e) => {
          let f = d(c, e),
            g = !["registerZone", "unregisterZone", "setData", "setUi", "set"].includes(e.type);
          return (
            (void 0 !== e.recordHistory ? e.recordHistory : g) && a && a(f),
            null == b || b(e, ja(f), ja(c)),
            f
          );
        }
      );
    }
    (cz(), cz(), cz());
    var jc = {
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
      jd = c9()(
        da((a) => ({
          held: {},
          hold: (b) => a((a) => (a.held[b] ? a : { held: cn(cw({}, a.held), cp({ [b]: !0 })) })),
          release: (b) => a((a) => (a.held[b] ? { held: cn(cw({}, a.held), cp({ [b]: !1 })) } : a)),
          reset: (b = {}) => a(() => ({ held: b })),
          triggers: {},
        }))
      ),
      je = (a) => {
        let b = (a) => {
            let b = jc[a.code];
            if (b) {
              jd.getState().hold(b);
              let { held: c, triggers: d } = jd.getState();
              (Object.values(d).forEach(({ combo: b, cb: d }) => {
                Object.entries(b).every(([a, b]) => !!c[a] === b) &&
                  Object.entries(c).every(([a, c]) => !!b[a] === c) &&
                  (a.preventDefault(), d());
              }),
                "meta" !== b && "ctrl" !== b && "shift" !== b && jd.getState().release(b));
            }
          },
          c = (a) => {
            let b = jc[a.code];
            b && ("meta" === b ? jd.getState().reset() : jd.getState().release(b));
          },
          d = (a) => {
            "hidden" === document.visibilityState && jd.getState().reset();
          };
        return (
          a.addEventListener("keydown", b),
          a.addEventListener("keyup", c),
          a.addEventListener("visibilitychange", d),
          () => {
            (a.removeEventListener("keydown", b),
              a.removeEventListener("keyup", c),
              a.removeEventListener("visibilitychange", d));
          }
        );
      },
      jf = (a, b) => {
        (0, ci.useEffect)(
          () =>
            jd.setState((c) => ({
              triggers: cn(
                cw({}, c.triggers),
                cp({ [`${Object.keys(a).join("+")}`]: { combo: a, cb: b } })
              ),
            })),
          []
        );
      },
      jg = (a) => {
        let b, c;
        return (
          (b = cw({}, a)),
          (c = { ui: cn(cw({}, a.ui), cp({ field: { focus: null } })) }),
          cn(b, cp(c))
        );
      };
    (cz(), cz(), cz());
    var jh = (a, b) => {
      let c = [];
      return (
        cO(
          a,
          b,
          (a) => a,
          (a) => (c.push(a), null)
        ),
        c
      );
    };
    (cz(), cz());
    var ji = { title: { type: "text" } },
      jj = (a) =>
        c9()(
          da((b, c) => {
            var d, e;
            let f, g, h;
            return (
              (g = cw(
                {
                  state: cI,
                  config: { components: {} },
                  componentState: {},
                  plugins: [],
                  overrides: {},
                  viewports: cH,
                  zoomConfig: { autoZoom: 1, rootHeight: 0, zoom: 1 },
                  status: "LOADING",
                  iframe: {},
                  metadata: {},
                  fieldTransforms: {},
                },
                a
              )),
              (h = {
                fields: { fields: {}, loading: !1, lastResolvedData: {}, id: void 0 },
                history: {
                  initialAppState: {},
                  index: 0,
                  histories: [],
                  hasPast: () => c().history.index > 0,
                  hasFuture: () => c().history.index < c().history.histories.length - 1,
                  prevHistory: () => {
                    let { history: a } = c();
                    return a.hasPast() ? a.histories[a.index - 1] : null;
                  },
                  nextHistory: () => {
                    let a = c().history;
                    return a.hasFuture() ? a.histories[a.index + 1] : null;
                  },
                  currentHistory: () => c().history.histories[c().history.index],
                  back: () => {
                    var a;
                    let { history: d, dispatch: e } = c();
                    d.hasPast() &&
                      (e({
                        type: "set",
                        state: jg(
                          (null == (a = d.prevHistory()) ? void 0 : a.state) || d.initialAppState
                        ),
                      }),
                      b({ history: cn(cw({}, d), cp({ index: d.index - 1 })) }));
                  },
                  forward: () => {
                    var a;
                    let { history: d, dispatch: e } = c();
                    if (d.hasFuture()) {
                      let c = null == (a = d.nextHistory()) ? void 0 : a.state;
                      (e({ type: "set", state: c ? jg(c) : {} }),
                        b({ history: cn(cw({}, d), cp({ index: d.index + 1 })) }));
                    }
                  },
                  setHistories: (a) => {
                    var d;
                    let { dispatch: e, history: f } = c();
                    (e({
                      type: "set",
                      state:
                        (null == (d = a[a.length - 1]) ? void 0 : d.state) || f.initialAppState,
                    }),
                      b({ history: cn(cw({}, f), cp({ histories: a, index: a.length - 1 })) }));
                  },
                  setHistoryIndex: (a) => {
                    var d;
                    let { dispatch: e, history: f } = c();
                    (e({
                      type: "set",
                      state: (null == (d = f.histories[a]) ? void 0 : d.state) || f.initialAppState,
                    }),
                      b({ history: cn(cw({}, f), cp({ index: a })) }));
                  },
                  record: (function (a, b = 300) {
                    let c;
                    return (...d) => {
                      (clearTimeout(c),
                        (c = setTimeout(() => {
                          a(...d);
                        }, b)));
                    };
                  })((a) => {
                    let { histories: d, index: e } = c().history,
                      f = { state: a, id: i2("history") },
                      g = [...d.slice(0, e + 1), f];
                    b({
                      history: cn(cw({}, c().history), cp({ histories: g, index: g.length - 1 })),
                    });
                  }, 250),
                },
                nodes: {
                  nodes: {},
                  registerNode: (a, d) => {
                    let e,
                      f,
                      g,
                      h,
                      i = c().nodes,
                      j = i.nodes[a];
                    b({
                      nodes:
                        ((g = cw({}, i)),
                        (h = {
                          nodes:
                            ((e = cw({}, i.nodes)),
                            (f = {
                              [a]: cn(
                                cw(
                                  cw(
                                    cw(
                                      {},
                                      {
                                        id: a,
                                        methods: {
                                          sync: () => null,
                                          hideOverlay: () => null,
                                          showOverlay: () => null,
                                        },
                                        element: null,
                                      }
                                    ),
                                    j
                                  ),
                                  d
                                ),
                                cp({ id: a })
                              ),
                            }),
                            cn(e, cp(f))),
                        }),
                        cn(g, cp(h))),
                    });
                  },
                  unregisterNode: (a) => {
                    let d = c().nodes;
                    if (d.nodes[a]) {
                      let c = cw({}, d.nodes);
                      (delete c[a], b({ nodes: cn(cw({}, d), cp({ nodes: c })) }));
                    }
                  },
                },
                permissions: {
                  cache: {},
                  globalPermissions: { drag: !0, edit: !0, delete: !0, duplicate: !0, insert: !0 },
                  resolvedPermissions: {},
                  getPermissions: ({ item: a, type: b, root: d } = {}) => {
                    let { config: e, permissions: f } = c(),
                      { globalPermissions: g, resolvedPermissions: h } = f;
                    if (a) {
                      let b = e.components[a.type],
                        c = cw(cw({}, g), null == b ? void 0 : b.permissions),
                        d = h[a.props.id];
                      return d ? cw(cw({}, g), d) : c;
                    }
                    if (b) {
                      let a = e.components[b];
                      return cw(cw({}, g), null == a ? void 0 : a.permissions);
                    }
                    if (d) {
                      let a = e.root,
                        b = cw(cw({}, g), null == a ? void 0 : a.permissions),
                        c = h.root;
                      return c ? cw(cw({}, g), c) : b;
                    }
                    return g;
                  },
                  resolvePermissions: (f = (...a) =>
                    cy(void 0, [...a], function* (a = {}, d) {
                      let { state: e, permissions: f, config: g } = c(),
                        { cache: h, globalPermissions: i } = f,
                        j = (a, d = !1) =>
                          cy(void 0, null, function* () {
                            var e, f, g;
                            let { config: j, state: k, setComponentLoading: l } = c(),
                              m = "root" === a.type ? j.root : j.components[a.type];
                            if (!m) return;
                            let n = cw(cw({}, i), m.permissions);
                            if (m.resolvePermissions) {
                              let i = cP(a, null == (e = h[a.props.id]) ? void 0 : e.lastData);
                              if (Object.values(i).some((a) => !0 === a) || d) {
                                let d,
                                  e,
                                  j = l(a.props.id, !0, 50),
                                  o = yield m.resolvePermissions(a, {
                                    changed: i,
                                    lastPermissions:
                                      (null == (f = h[a.props.id]) ? void 0 : f.lastPermissions) ||
                                      null,
                                    permissions: n,
                                    appState: ja(k),
                                    lastData:
                                      (null == (g = h[a.props.id]) ? void 0 : g.lastData) || null,
                                  }),
                                  p = c().permissions;
                                (b({
                                  permissions:
                                    ((d = cw({}, p)),
                                    (e = {
                                      cache: cn(
                                        cw({}, p.cache),
                                        cp({ [a.props.id]: { lastData: a, lastPermissions: o } })
                                      ),
                                      resolvedPermissions: cn(
                                        cw({}, p.resolvedPermissions),
                                        cp({ [a.props.id]: o })
                                      ),
                                    }),
                                    cn(d, cp(e))),
                                }),
                                  j());
                              }
                            }
                          }),
                        { item: k, type: l, root: m } = a;
                      k
                        ? yield j(k, d)
                        : l
                          ? jh(e, g)
                              .filter((a) => a.type === l)
                              .map((a) =>
                                cy(void 0, null, function* () {
                                  yield j(a, d);
                                })
                              )
                          : m
                            ? ((a = !1) => {
                                let { state: b } = c();
                                j(
                                  {
                                    type: "root",
                                    props: cn(cw({}, b.data.root.props), cp({ id: "root" })),
                                  },
                                  a
                                );
                              })(d)
                            : jh(e, g).map((a) =>
                                cy(void 0, null, function* () {
                                  yield j(a, d);
                                })
                              );
                    })),
                  refreshPermissions: (a) => f(a, !0),
                },
                getComponentConfig: (a) => {
                  var b;
                  let { config: d, selectedItem: e } = c(),
                    f = (null == (b = d.root) ? void 0 : b.fields) || ji;
                  return a && "root" !== a
                    ? d.components[a]
                    : e
                      ? d.components[e.type]
                      : cn(cw({}, d.root), cp({ fields: f }));
                },
                selectedItem: (
                  null == (d = null == a ? void 0 : a.state) ? void 0 : d.ui.itemSelector
                )
                  ? i6(
                      null == (e = null == a ? void 0 : a.state) ? void 0 : e.ui.itemSelector,
                      a.state
                    )
                  : null,
                dispatch: (a) =>
                  b((b) => {
                    var d, e;
                    let { record: f } = c().history,
                      g = jb({ record: f, appStore: b })(b.state, a),
                      h = g.ui.itemSelector ? i6(g.ui.itemSelector, g) : null;
                    return (
                      null == (e = (d = c()).onAction) || e.call(d, a, g, c().state),
                      cn(cw({}, b), cp({ state: g, selectedItem: h }))
                    );
                  }),
                setZoomConfig: (a) => b({ zoomConfig: a }),
                setStatus: (a) => b({ status: a }),
                setComponentState: (a) => b({ componentState: a }),
                pendingLoadTimeouts: {},
                setComponentLoading: (a, d = !0, e = 0) => {
                  let { setComponentState: f, pendingLoadTimeouts: g } = c(),
                    h = i2(),
                    i = () => {
                      var d;
                      let e,
                        i,
                        { componentState: k } = c();
                      (clearTimeout(j),
                        delete g[h],
                        b({ pendingLoadTimeouts: g }),
                        f(
                          ((e = cw({}, k)),
                          (i = {
                            [a]: cn(
                              cw({}, k[a]),
                              cp({
                                loadingCount: Math.max(
                                  ((null == (d = k[a]) ? void 0 : d.loadingCount) || 0) - 1,
                                  0
                                ),
                              })
                            ),
                          }),
                          cn(e, cp(i)))
                        ));
                    },
                    j = setTimeout(() => {
                      (d
                        ? (() => {
                            var b;
                            let d,
                              e,
                              { componentState: g } = c();
                            f(
                              ((d = cw({}, g)),
                              (e = {
                                [a]: cn(
                                  cw({}, g[a]),
                                  cp({
                                    loadingCount:
                                      ((null == (b = g[a]) ? void 0 : b.loadingCount) || 0) + 1,
                                  })
                                ),
                              }),
                              cn(d, cp(e)))
                            );
                          })()
                        : i(),
                        delete g[h],
                        b({ pendingLoadTimeouts: g }));
                    }, e);
                  return (b({ pendingLoadTimeouts: cn(cw({}, g), cp({ [a]: j })) }), i);
                },
                unsetComponentLoading: (a) => {
                  let { setComponentLoading: b } = c();
                  b(a, !1);
                },
                setUi: (a, c) =>
                  b((b) => {
                    let d = jb({ record: () => {}, appStore: b })(b.state, {
                        type: "setUi",
                        ui: a,
                        recordHistory: c,
                      }),
                      e = d.ui.itemSelector ? i6(d.ui.itemSelector, d) : null;
                    return cn(cw({}, b), cp({ state: d, selectedItem: e }));
                  }),
                resolveComponentData: (a, b) =>
                  cy(void 0, null, function* () {
                    let { config: d, metadata: e, setComponentLoading: f, permissions: g } = c(),
                      h = {};
                    return yield cR(
                      a,
                      d,
                      e,
                      (a) => {
                        let b = "id" in a.props ? a.props.id : "root";
                        h[b] = f(b, !0, 50);
                      },
                      (a) =>
                        cy(void 0, null, function* () {
                          let b = "id" in a.props ? a.props.id : "root";
                          ("type" in a
                            ? yield g.refreshPermissions({ item: a })
                            : yield g.refreshPermissions({ root: !0 }),
                            h[b]());
                        }),
                      b
                    );
                  }),
                resolveAndCommitData: () =>
                  cy(void 0, null, function* () {
                    let { config: a, state: b, dispatch: d, resolveComponentData: e } = c();
                    cO(
                      b,
                      a,
                      (a) => a,
                      (a) => (
                        e(a, "load").then((a) => {
                          let { state: b } = c(),
                            e = b.indexes.nodes[a.node.props.id];
                          if (e && a.didChange)
                            if ("root" === a.node.props.id)
                              d({
                                type: "replaceRoot",
                                root: ((a) => {
                                  if ("type" in a && "root" !== a.type)
                                    throw Error("Converting non-root item to root.");
                                  let { readOnly: b } = a;
                                  if (a.props) {
                                    if ("id" in a.props) {
                                      let c = a.props,
                                        { id: d } = c;
                                      return { props: cx(c, ["id"]), readOnly: b };
                                    }
                                    return { props: a.props, readOnly: b };
                                  }
                                  return { props: {}, readOnly: b };
                                })(a.node),
                              });
                            else {
                              let c = `${e.parentId}:${e.zone}`,
                                f = b.indexes.zones[c].contentIds.indexOf(a.node.props.id);
                              d({
                                type: "replace",
                                data: a.node,
                                destinationIndex: f,
                                destinationZone: c,
                              });
                            }
                        }),
                        a
                      )
                    );
                  }),
              }),
              cn(g, cp(h))
            );
          })
        ),
      jk = (0, ci.createContext)(jj());
    function jl(a) {
      return c7((0, ci.useContext)(jk), a);
    }
    function jm() {
      return (0, ci.useContext)(jk);
    }
    (cz(), cz(), cz());
    var jn = function (a) {
        var b = a.top,
          c = a.right,
          d = a.bottom,
          e = a.left;
        return {
          top: b,
          right: c,
          bottom: d,
          left: e,
          width: c - e,
          height: d - b,
          x: e,
          y: b,
          center: { x: (c + e) / 2, y: (d + b) / 2 },
        };
      },
      jo = function (a, b) {
        return {
          top: a.top + b.top,
          left: a.left + b.left,
          bottom: a.bottom - b.bottom,
          right: a.right - b.right,
        };
      },
      jp = { top: 0, right: 0, bottom: 0, left: 0 },
      jq = function (a) {
        var b = a.borderBox,
          c = a.margin,
          d = void 0 === c ? jp : c,
          e = a.border,
          f = void 0 === e ? jp : e,
          g = a.padding,
          h = void 0 === g ? jp : g,
          i = jn({
            top: b.top - d.top,
            left: b.left - d.left,
            bottom: b.bottom + d.bottom,
            right: b.right + d.right,
          }),
          j = jn(jo(b, f)),
          k = jn(jo(j, h));
        return {
          marginBox: i,
          borderBox: jn(b),
          paddingBox: j,
          contentBox: k,
          margin: d,
          border: f,
          padding: h,
        };
      },
      jr = function (a) {
        var b = a.slice(0, -2);
        if ("px" !== a.slice(-2)) return 0;
        var c = Number(b);
        return (
          isNaN(c) &&
            (function (a) {
              if (!a) throw Error("Invariant failed");
            })(!1),
          c
        );
      },
      js = function (a, b) {
        var c = {
          top: jr(b.marginTop),
          right: jr(b.marginRight),
          bottom: jr(b.marginBottom),
          left: jr(b.marginLeft),
        };
        return jq({
          borderBox: a,
          margin: c,
          padding: {
            top: jr(b.paddingTop),
            right: jr(b.paddingRight),
            bottom: jr(b.paddingBottom),
            left: jr(b.paddingLeft),
          },
          border: {
            top: jr(b.borderTopWidth),
            right: jr(b.borderRightWidth),
            bottom: jr(b.borderBottomWidth),
            left: jr(b.borderLeftWidth),
          },
        });
      },
      jt = function (a) {
        return js(a.getBoundingClientRect(), window.getComputedStyle(a));
      },
      ju = (a) => {
        let b = jm();
        return (c) => {
          let { state: d, zoomConfig: e, setZoomConfig: f } = b.getState(),
            { viewports: g } = d.ui,
            h = (null == c ? void 0 : c.viewports) || g;
          a.current &&
            f(
              ((a, b, c) => {
                let { width: d, height: e } = jt(b).contentBox,
                  f = "auto" === a.height ? e : a.height,
                  g = 0,
                  h = 1;
                if (a.width > d || f > e) {
                  let b = Math.min(d / a.width, 1),
                    i = Math.min(e / f, 1);
                  ((c = b), b < i ? (g = f / c) : ((g = f), (c = i)), (h = c));
                } else ((h = 1), (c = 1), (g = f));
                return { autoZoom: h, rootHeight: g, zoom: c };
              })(null == h ? void 0 : h.current, a.current, e.zoom)
            );
        };
      };
    cz();
    var jv = iZ("Loader", {
        Loader: "_Loader_nacdm_13",
        "loader-animation": "_loader-animation_nacdm_1",
      }),
      jw = (a) => {
        var { color: b, size: c = 16 } = a,
          d = cx(a, ["color", "size"]);
        return (0, cZ.jsx)(
          "span",
          cw(
            { className: jv(), style: { width: c, height: c, color: b }, "aria-label": "loading" },
            d
          )
        );
      },
      jx = iZ("IconButton", {
        IconButton: "_IconButton_swpni_1",
        "IconButton--disabled": "_IconButton--disabled_swpni_20",
        "IconButton-title": "_IconButton-title_swpni_33",
      }),
      jy = ({
        children: a,
        href: b,
        onClick: c,
        variant: d = "primary",
        type: e,
        disabled: f,
        tabIndex: g,
        newTab: h,
        fullWidth: i,
        title: j,
      }) => {
        let [k, l] = (0, ci.useState)(!1);
        return (0, cZ.jsxs)(b ? "a" : "button", {
          className: jx({
            primary: "primary" === d,
            secondary: "secondary" === d,
            disabled: f,
            fullWidth: i,
          }),
          onClick: (a) => {
            c &&
              (l(!0),
              Promise.resolve(c(a)).then(() => {
                l(!1);
              }));
          },
          type: e,
          disabled: f || k,
          tabIndex: g,
          target: h ? "_blank" : void 0,
          rel: h ? "noreferrer" : void 0,
          href: b,
          title: j,
          children: [
            (0, cZ.jsx)("span", { className: jx("title"), children: j }),
            a,
            k && (0, cZ.jsxs)(cZ.Fragment, { children: ["  ", (0, cZ.jsx)(jw, { size: 14 })] }),
          ],
        });
      };
    (cz(), cz(), cz());
    var jz = /^(data-.*)$/,
      jA = iZ("Button", {
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
      jB = (a) => {
        let b;
        var {
            children: c,
            href: d,
            onClick: e,
            variant: f = "primary",
            type: g,
            disabled: h,
            tabIndex: i,
            newTab: j,
            fullWidth: k,
            icon: l,
            size: m = "medium",
            loading: n = !1,
          } = a,
          o = cx(a, [
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
        let [p, q] = (0, ci.useState)(n);
        (0, ci.useEffect)(() => q(n), [n]);
        let r = ((a) => {
          let b = {};
          for (let c in a)
            Object.prototype.hasOwnProperty.call(a, c) && jz.test(c) && (b[c] = a[c]);
          return b;
        })(o);
        return (0, cZ.jsxs)(
          d ? "a" : g ? "button" : "span",
          ((b = cw(
            {
              className: jA({
                primary: "primary" === f,
                secondary: "secondary" === f,
                disabled: h,
                fullWidth: k,
                [m]: !0,
              }),
              onClick: (a) => {
                e &&
                  (q(!0),
                  Promise.resolve(e(a)).then(() => {
                    q(!1);
                  }));
              },
              type: g,
              disabled: h || p,
              tabIndex: i,
              target: j ? "_blank" : void 0,
              rel: j ? "noreferrer" : void 0,
              href: d,
            },
            r
          )),
          cn(
            b,
            cp({
              children: [
                l && (0, cZ.jsx)("div", { className: jA("icon"), children: l }),
                c,
                p &&
                  (0, cZ.jsx)("div", {
                    className: jA("spinner"),
                    children: (0, cZ.jsx)(jw, { size: 14 }),
                  }),
              ],
            })
          ))
        );
      };
    (cz(), cz());
    var jC = {
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
    (cz(), cz(), cz());
    var jD = {
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
    (cz(), cz(), cz());
    var jE = (...a) =>
      a
        .filter((a, b, c) => !!a && "" !== a.trim() && c.indexOf(a) === b)
        .join(" ")
        .trim();
    (cz(), cz());
    var jF = {
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
      jG = (0, ci.forwardRef)((a, b) => {
        var {
            color: c = "currentColor",
            size: d = 24,
            strokeWidth: e = 2,
            absoluteStrokeWidth: f,
            className: g = "",
            children: h,
            iconNode: i,
          } = a,
          j = cx(a, [
            "color",
            "size",
            "strokeWidth",
            "absoluteStrokeWidth",
            "className",
            "children",
            "iconNode",
          ]);
        return (0, ci.createElement)(
          "svg",
          cw(
            cn(
              cw({ ref: b }, jF),
              cp({
                width: d,
                height: d,
                stroke: c,
                strokeWidth: f ? (24 * Number(e)) / Number(d) : e,
                className: jE("lucide", g),
              })
            ),
            j
          ),
          [...i.map(([a, b]) => (0, ci.createElement)(a, b)), ...(Array.isArray(h) ? h : [h])]
        );
      }),
      jH = (a, b) => {
        let c = (0, ci.forwardRef)((c, d) => {
          var { className: e } = c,
            f = cx(c, ["className"]);
          return (0, ci.createElement)(
            jG,
            cw(
              {
                ref: d,
                iconNode: b,
                className: jE(
                  `lucide-${a.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`,
                  e
                ),
              },
              f
            )
          );
        });
        return ((c.displayName = `${a}`), c);
      };
    cz();
    var jI = jH("ChevronDown", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);
    cz();
    var jJ = jH("ChevronRight", [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]);
    cz();
    var jK = jH("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
    cz();
    var jL = jH("CircleCheckBig", [
      ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
      ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
    ]);
    cz();
    var jM = jH("Copy", [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }],
    ]);
    cz();
    var jN = jH("CornerLeftUp", [
      ["polyline", { points: "14 9 9 4 4 9", key: "m9oyvo" }],
      ["path", { d: "M20 20h-7a4 4 0 0 1-4-4V4", key: "1blwi3" }],
    ]);
    cz();
    var jO = jH("EllipsisVertical", [
      ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
      ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
      ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }],
    ]);
    cz();
    var jP = jH("Globe", [
      ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
      ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
      ["path", { d: "M2 12h20", key: "9i4pu4" }],
    ]);
    cz();
    var jQ = jH("Hash", [
      ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
      ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
      ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
      ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }],
    ]);
    cz();
    var jR = jH("Layers", [
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
    cz();
    var jS = jH("LayoutGrid", [
      ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
      ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
      ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
      ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }],
    ]);
    cz();
    var jT = jH("Link", [
      ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
      [
        "path",
        { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" },
      ],
    ]);
    cz();
    var jU = jH("List", [
      ["path", { d: "M3 12h.01", key: "nlz23k" }],
      ["path", { d: "M3 18h.01", key: "1tta3j" }],
      ["path", { d: "M3 6h.01", key: "1rqtza" }],
      ["path", { d: "M8 12h13", key: "1za7za" }],
      ["path", { d: "M8 18h13", key: "1lx6n3" }],
      ["path", { d: "M8 6h13", key: "ik3vkj" }],
    ]);
    cz();
    var jV = jH("LockOpen", [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }],
    ]);
    cz();
    var jW = jH("Lock", [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }],
    ]);
    cz();
    var jX = jH("Monitor", [
      ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
      ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
      ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }],
    ]);
    cz();
    var jY = jH("PanelLeft", [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
      ["path", { d: "M9 3v18", key: "fh3hqa" }],
    ]);
    cz();
    var jZ = jH("PanelRight", [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
      ["path", { d: "M15 3v18", key: "14nvp0" }],
    ]);
    cz();
    var j$ = jH("Plus", [
      ["path", { d: "M5 12h14", key: "1ays0h" }],
      ["path", { d: "M12 5v14", key: "s699le" }],
    ]);
    cz();
    var j_ = jH("Redo2", [
      ["path", { d: "m15 14 5-5-5-5", key: "12vg1m" }],
      ["path", { d: "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13", key: "6uklza" }],
    ]);
    cz();
    var j0 = jH("Search", [
      ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }],
    ]);
    cz();
    var j1 = jH("SlidersHorizontal", [
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
    cz();
    var j2 = jH("Smartphone", [
      ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
      ["path", { d: "M12 18h.01", key: "mhygvu" }],
    ]);
    cz();
    var j3 = jH("Tablet", [
      ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2", key: "76otgf" }],
      ["line", { x1: "12", x2: "12.01", y1: "18", y2: "18", key: "1dp563" }],
    ]);
    cz();
    var j4 = jH("Trash", [
      ["path", { d: "M3 6h18", key: "d0wm0j" }],
      ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
      ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
    ]);
    cz();
    var j5 = jH("Type", [
      ["polyline", { points: "4 7 4 4 20 4 20 7", key: "1nosan" }],
      ["line", { x1: "9", x2: "15", y1: "20", y2: "20", key: "swin9y" }],
      ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }],
    ]);
    cz();
    var j6 = jH("Undo2", [
      ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
      ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }],
    ]);
    cz();
    var j7 = jH("ZoomIn", [
      ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
      ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
      ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }],
    ]);
    cz();
    var j8 = jH("ZoomOut", [
      ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
      ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }],
    ]);
    (cz(), cz(), cz());
    var j9 = iZ("DragIcon", {
        DragIcon: "_DragIcon_17p8x_1",
        "DragIcon--disabled": "_DragIcon--disabled_17p8x_8",
      }),
      ka = ({ isDragDisabled: a }) =>
        (0, cZ.jsx)("div", {
          className: j9({ disabled: a }),
          children: (0, cZ.jsx)("svg", {
            viewBox: "0 0 20 20",
            width: "12",
            fill: "currentColor",
            children: (0, cZ.jsx)("path", {
              d: "M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z",
            }),
          }),
        });
    (cz(), cz());
    var kb = { delay: { value: 200, tolerance: 10 } },
      kc = { delay: { value: 200, tolerance: 10 }, distance: { value: 5 } },
      kd = ({ other: a = kc, mouse: b, touch: c = kb } = { touch: kb, other: kc }) => {
        let [d] = (0, ci.useState)(() => [
          hj.configure({
            activationConstraints(d, e) {
              var f;
              let { pointerType: g, target: h } = d;
              return "mouse" === g &&
                gf(h) &&
                (e.handle === h || (null == (f = e.handle) ? void 0 : f.contains(h)))
                ? b
                : "touch" === g
                  ? c
                  : a;
            },
          }),
        ]);
        return d;
      };
    (cz(), cz(), cz());
    var ke = (a, b, c, d, e) => {},
      kf = "increasing";
    cz();
    var kg = (a, b) => {
      if ("dynamic" === a) {
        if (!(Math.abs(b.y) > Math.abs(b.x))) return 0 === b.x ? null : b.x > 0 ? "right" : "left";
      } else if ("x" === a) return 0 === b.x ? null : b.x > 0 ? "right" : "left";
      return 0 === b.y ? null : b.y > 0 ? "down" : "up";
    };
    (cz(), cz());
    var kh = {
      current: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      previous: { x: 0, y: 0 },
      direction: null,
    };
    cz();
    var ki = ({ dragOperation: a, droppable: b }) => {
      let c = a.position.current;
      if (!c) return null;
      let { id: d } = b;
      return b.shape && b.shape.containsPoint(c)
        ? {
            id: d,
            value: 1 / eo.distance(b.shape.center, c),
            type: e8.PointerIntersection,
            priority: e7.High,
          }
        : null;
    };
    cz();
    var kj = c5(() => ({ fallbackEnabled: !1 })),
      kk = "",
      kl =
        (a, b = 0.05) =>
        (c) => {
          var d, e, f, g, h;
          let { dragOperation: i, droppable: j } = c,
            { position: k } = i,
            l = null == (d = i.shape) ? void 0 : d.current,
            { shape: m } = j;
          if (!l || !m) return null;
          let { center: n } = l,
            { fallbackEnabled: o } = kj.getState(),
            p = ((a, b = "dynamic") => (
              (kh.current = a),
              (kh.delta = { x: a.x - kh.previous.x, y: a.y - kh.previous.y }),
              (kh.direction = kg(b, kh.delta) || kh.direction),
              (Math.abs(kh.delta.x) > 10 || Math.abs(kh.delta.y) > 10) &&
                (kh.previous = eo.from(a)),
              kh
            ))(k.current, a),
            q = { direction: p.direction },
            { center: r } = m,
            s = ((a, b, c, d = 0) => {
              let e = a.boundingRectangle,
                f = b.center;
              if ("down" === c) {
                let a = d * b.boundingRectangle.height;
                return e.bottom >= f.y + a;
              }
              if ("up" === c) {
                let a = d * b.boundingRectangle.height;
                return e.top < f.y - a;
              }
              if ("left" === c) {
                let a = d * b.boundingRectangle.width;
                return f.x - a >= e.left;
              }
              let g = d * b.boundingRectangle.width;
              return e.right - g >= f.x;
            })(l, m, p.direction, b);
          if ((null == (e = i.source) ? void 0 : e.id) === j.id) {
            let a = ((a, b) => {
              var c;
              let { dragOperation: d, droppable: e } = a,
                { shape: f } = e,
                { position: g } = d,
                h = null == (c = d.shape) ? void 0 : c.current;
              if (!h || !f) return null;
              let i = f.center,
                j = Math.sqrt(Math.pow(i.x - b.x, 2) + Math.pow(i.y - b.y, 2)),
                k = Math.sqrt(Math.pow(i.x - g.current.x, 2) + Math.pow(i.y - g.current.y, 2));
              return ((kf = k === j ? kf : k < j ? "decreasing" : "increasing"),
              ke(h.center, i, e.id.toString(), "rebeccapurple"),
              "decreasing" === kf)
                ? { id: e.id, value: 1, type: e8.Collision }
                : null;
            })(c, p.previous);
            if ((ke(n, r, j.id.toString(), "yellow"), a))
              return cn(cw({}, a), cp({ priority: e7.Highest, data: q }));
          }
          let t = l.intersectionArea(m),
            u = t / m.area;
          if (t && s) {
            ke(n, r, j.id.toString(), "green", p.direction);
            let a = { id: j.id, value: u, priority: e7.High, type: e8.Collision },
              b = kk === j.id;
            return ((kk = ""), cn(cw({}, a), cp({ id: b ? "flush" : a.id, data: q })));
          }
          if (o && (null == (f = i.source) ? void 0 : f.id) !== j.id) {
            let b =
                m.boundingRectangle.right > l.boundingRectangle.left &&
                m.boundingRectangle.left < l.boundingRectangle.right,
              d =
                m.boundingRectangle.bottom > l.boundingRectangle.top &&
                m.boundingRectangle.top < l.boundingRectangle.bottom;
            if (("y" === a && b) || d) {
              let b = ((a) => {
                let { dragOperation: b, droppable: c } = a,
                  { shape: d, position: e } = b;
                if (!c.shape) return null;
                let f = d ? ep.from(d.current.boundingRectangle).corners : void 0,
                  g = ep.from(c.shape.boundingRectangle).corners.reduce((a, b, c) => {
                    var d;
                    return (
                      a +
                      eo.distance(
                        eo.from(b),
                        null != (d = null == f ? void 0 : f[c]) ? d : e.current
                      )
                    );
                  }, 0);
                return { id: c.id, value: 1 / (g / 4), type: e8.Collision, priority: e7.Normal };
              })(c);
              if (b) {
                let c = kg(a, {
                  x: l.center.x - ((null == (g = j.shape) ? void 0 : g.center.x) || 0),
                  y: l.center.y - ((null == (h = j.shape) ? void 0 : h.center.y) || 0),
                });
                if (((q.direction = c), t))
                  return (
                    ke(n, r, j.id.toString(), "red", c || ""),
                    (kk = j.id),
                    cn(cw({}, b), cp({ priority: e7.Low, data: q }))
                  );
                return (
                  ke(n, r, j.id.toString(), "orange", c || ""),
                  cn(cw({}, b), cp({ priority: e7.Lowest, data: q }))
                );
              }
            }
          }
          return (ke(n, r, j.id.toString(), "hotpink"), null);
        },
      km = ({ children: a, onDragStart: b, onDragEnd: c, onMove: d }) => {
        let e = kd({ mouse: { distance: { value: 5 } } });
        return (0, cZ.jsx)(hN, {
          sensors: e,
          onDragStart: (a) => {
            var c, d;
            return b(
              null != (d = null == (c = a.operation.source) ? void 0 : c.id.toString()) ? d : ""
            );
          },
          onDragOver: (a, b) => {
            var c;
            a.preventDefault();
            let { operation: e } = a,
              { source: f, target: g } = e;
            if (!f || !g) return;
            let h = f.data.index,
              i = g.data.index,
              j = null == (c = b.collisionObserver.collisions[0]) ? void 0 : c.data;
            h !== i &&
              f.id !== g.id &&
              (i >= h && (i -= 1),
              "after" == ((null == j ? void 0 : j.direction) === "up" ? "before" : "after") &&
                (i += 1),
              d({ source: h, target: i }));
          },
          onDragEnd: () => {
            setTimeout(() => {
              c();
            }, 250);
          },
          children: a,
        });
      },
      kn = ({ id: a, index: b, disabled: c, children: d, type: e = "item" }) => {
        let {
          ref: f,
          isDragging: g,
          isDropping: h,
          handleRef: i,
        } = iS({
          id: a,
          type: e,
          index: b,
          disabled: c,
          data: { index: b },
          collisionDetector: kl("y"),
        });
        return d({ isDragging: g, isDropping: h, ref: f, handleRef: i });
      };
    cz();
    var ko = (0, ci.createContext)({}),
      kp = () => {
        let a = (0, ci.useContext)(ko);
        return cn(cw({}, a), cp({ readOnlyFields: a.readOnlyFields || {} }));
      },
      kq = ({ children: a, name: b, subName: c, wildcardName: d = b, readOnlyFields: e }) => {
        let f = `${b}.${c}`,
          g = `${d}.${c}`,
          h = (0, ci.useMemo)(
            () =>
              Object.keys(e).reduce((a, c) => {
                if (c.indexOf(f) > -1 || c.indexOf(g) > -1) {
                  let f = new RegExp(
                      `^(${b}|${d}).`
                        .replace(/\[/g, "\\[")
                        .replace(/\]/g, "\\]")
                        .replace(/\./g, "\\.")
                        .replace(/\*/g, "\\*")
                    ),
                    g = c.replace(f, "");
                  return cn(cw({}, a), cp({ [g]: e[c] }));
                }
                return a;
              }, {}),
            [b, c, d, e]
          );
        return (0, cZ.jsx)(ko.Provider, {
          value: { readOnlyFields: h, localName: c },
          children: a,
        });
      },
      kr = iZ("ArrayField", jD),
      ks = iZ("ArrayFieldItem", jD);
    cz();
    var kt = iZ("Input", jC),
      ku = ({
        field: a,
        onChange: b,
        readOnly: c,
        value: d,
        name: e,
        label: f,
        labelIcon: g,
        Label: h,
        id: i,
      }) =>
        (0, cZ.jsx)(h, {
          label: f || e,
          icon:
            g ||
            (0, cZ.jsxs)(cZ.Fragment, {
              children: [
                "text" === a.type && (0, cZ.jsx)(j5, { size: 16 }),
                "number" === a.type && (0, cZ.jsx)(jQ, { size: 16 }),
              ],
            }),
          readOnly: c,
          children: (0, cZ.jsx)("input", {
            className: kt("input"),
            autoComplete: "off",
            type: a.type,
            title: f || e,
            name: e,
            value: (null == d ? void 0 : d.toString) ? d.toString() : "",
            onChange: (c) => {
              if ("number" === a.type) {
                let d = Number(c.currentTarget.value);
                (void 0 === a.min || !(d < a.min)) && ((void 0 !== a.max && d > a.max) || b(d));
              } else b(c.currentTarget.value);
            },
            readOnly: c,
            tabIndex: c ? -1 : void 0,
            id: i,
            min: "number" === a.type ? a.min : void 0,
            max: "number" === a.type ? a.max : void 0,
            placeholder: "text" === a.type || "number" === a.type ? a.placeholder : void 0,
            step: "number" === a.type ? a.step : void 0,
          }),
        });
    (cz(), cz(), cz());
    var kv = {
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
    (cz(), cz());
    var kw = iZ("Modal", {
        Modal: "_Modal_ikbaj_1",
        "Modal--isOpen": "_Modal--isOpen_ikbaj_15",
        "Modal-inner": "_Modal-inner_ikbaj_19",
      }),
      kx = ({ children: a, onClose: b, isOpen: c }) => {
        let [d, e] = (0, ci.useState)(null);
        return ((0, ci.useEffect)(() => {
          e(document.getElementById("puck-portal-root"));
        }, []),
        d)
          ? (0, ht.createPortal)(
              (0, cZ.jsx)("div", {
                className: kw({ isOpen: c }),
                onClick: b,
                children: (0, cZ.jsx)("div", {
                  className: kw("inner"),
                  onClick: (a) => a.stopPropagation(),
                  children: a,
                }),
              }),
              d
            )
          : (0, cZ.jsx)("div", {});
      };
    (cz(), cz());
    var ky = iZ("Heading", {
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
      kz = ({ children: a, rank: b, size: c = "m" }) => {
        let d = b ? `h${b}` : "span";
        return (0, cZ.jsx)(d, { className: ky({ [c]: !0 }), children: a });
      };
    cz();
    var kA = iZ("ExternalInput", kv),
      kB = iZ("ExternalInputModal", kv),
      kC = {},
      kD = ({ field: a, onChange: b, value: c = null, name: d, id: e, readOnly: f }) => {
        let { mapProp: g = (a) => a, mapRow: h = (a) => a, filterFields: i } = a || {},
          [j, k] = (0, ci.useState)([]),
          [l, m] = (0, ci.useState)(!1),
          [n, o] = (0, ci.useState)(!0),
          p = !!i,
          [q, r] = (0, ci.useState)(a.initialFilters || {}),
          [s, t] = (0, ci.useState)(p),
          u = (0, ci.useMemo)(() => j.map(h), [j]),
          v = (0, ci.useMemo)(() => {
            let a = new Set();
            for (let b of u)
              for (let c of Object.keys(b))
                ("string" == typeof b[c] ||
                  "number" == typeof b[c] ||
                  (0, ci.isValidElement)(b[c])) &&
                  a.add(c);
            return Array.from(a);
          }, [u]),
          [w, y] = (0, ci.useState)(a.initialQuery || ""),
          z = (0, ci.useCallback)(
            (b, c) =>
              cy(void 0, null, function* () {
                o(!0);
                let d = `${e}-${b}-${JSON.stringify(c)}`,
                  f = kC[d] || (yield a.fetchList({ query: b, filters: c }));
                f && (k(f), o(!1), (kC[d] = f));
              }),
            [e, a]
          ),
          A = (0, ci.useCallback)(
            (b) =>
              a.renderFooter
                ? a.renderFooter(b)
                : (0, cZ.jsxs)("span", {
                    className: kB("footer"),
                    children: [b.items.length, " result", 1 === b.items.length ? "" : "s"],
                  }),
            [a.renderFooter]
          );
        return (
          (0, ci.useEffect)(() => {
            z(w, q);
          }, []),
          (0, cZ.jsxs)("div", {
            className: kA({ dataSelected: !!c, modalVisible: l, readOnly: f }),
            id: e,
            children: [
              (0, cZ.jsxs)("div", {
                className: kA("actions"),
                children: [
                  (0, cZ.jsx)("button", {
                    type: "button",
                    onClick: () => m(!0),
                    className: kA("button"),
                    disabled: f,
                    children: c
                      ? a.getItemSummary
                        ? a.getItemSummary(c)
                        : "External item"
                      : (0, cZ.jsxs)(cZ.Fragment, {
                          children: [
                            (0, cZ.jsx)(jT, { size: "16" }),
                            (0, cZ.jsx)("span", { children: a.placeholder }),
                          ],
                        }),
                  }),
                  c &&
                    (0, cZ.jsx)("button", {
                      type: "button",
                      className: kA("detachButton"),
                      onClick: () => {
                        b(null);
                      },
                      disabled: f,
                      children: (0, cZ.jsx)(jV, { size: 16 }),
                    }),
                ],
              }),
              (0, cZ.jsx)(kx, {
                onClose: () => m(!1),
                isOpen: l,
                children: (0, cZ.jsxs)("form", {
                  className: kB({
                    isLoading: n,
                    loaded: !n,
                    hasData: u.length > 0,
                    filtersToggled: s,
                  }),
                  onSubmit: (a) => {
                    (a.preventDefault(), z(w, q));
                  },
                  children: [
                    (0, cZ.jsx)("div", {
                      className: kB("masthead"),
                      children: a.showSearch
                        ? (0, cZ.jsxs)("div", {
                            className: kB("searchForm"),
                            children: [
                              (0, cZ.jsxs)("label", {
                                className: kB("search"),
                                children: [
                                  (0, cZ.jsx)("span", {
                                    className: kB("searchIconText"),
                                    children: "Search",
                                  }),
                                  (0, cZ.jsx)("div", {
                                    className: kB("searchIcon"),
                                    children: (0, cZ.jsx)(j0, { size: "18" }),
                                  }),
                                  (0, cZ.jsx)("input", {
                                    className: kB("searchInput"),
                                    name: "q",
                                    type: "search",
                                    placeholder: a.placeholder,
                                    onChange: (a) => {
                                      y(a.currentTarget.value);
                                    },
                                    autoComplete: "off",
                                    value: w,
                                  }),
                                ],
                              }),
                              (0, cZ.jsxs)("div", {
                                className: kB("searchActions"),
                                children: [
                                  (0, cZ.jsx)(jB, {
                                    type: "submit",
                                    loading: n,
                                    fullWidth: !0,
                                    children: "Search",
                                  }),
                                  p &&
                                    (0, cZ.jsx)("div", {
                                      className: kB("searchActionIcon"),
                                      children: (0, cZ.jsx)(jy, {
                                        type: "button",
                                        title: "Toggle filters",
                                        onClick: (a) => {
                                          (a.preventDefault(), a.stopPropagation(), t(!s));
                                        },
                                        children: (0, cZ.jsx)(j1, { size: 20 }),
                                      }),
                                    }),
                                ],
                              }),
                            ],
                          })
                        : (0, cZ.jsx)(kz, {
                            rank: "2",
                            size: "xs",
                            children: a.placeholder || "Select data",
                          }),
                    }),
                    (0, cZ.jsxs)("div", {
                      className: kB("grid"),
                      children: [
                        p &&
                          (0, cZ.jsx)("div", {
                            className: kB("filters"),
                            children:
                              p &&
                              Object.keys(i).map((a) => {
                                let b = i[a];
                                return (0, cZ.jsx)(
                                  "div",
                                  {
                                    className: kB("field"),
                                    children: (0, cZ.jsx)(kP, {
                                      field: b,
                                      name: a,
                                      id: `external_field_${a}_filter`,
                                      label: b.label || a,
                                      value: q[a],
                                      onChange: (b) => {
                                        let c = cn(cw({}, q), cp({ [a]: b }));
                                        (r(c), z(w, c));
                                      },
                                    }),
                                  },
                                  a
                                );
                              }),
                          }),
                        (0, cZ.jsxs)("div", {
                          className: kB("tableWrapper"),
                          children: [
                            (0, cZ.jsxs)("table", {
                              className: kB("table"),
                              children: [
                                (0, cZ.jsx)("thead", {
                                  className: kB("thead"),
                                  children: (0, cZ.jsx)("tr", {
                                    className: kB("tr"),
                                    children: v.map((a) =>
                                      (0, cZ.jsx)(
                                        "th",
                                        {
                                          className: kB("th"),
                                          style: { textAlign: "left" },
                                          children: a,
                                        },
                                        a
                                      )
                                    ),
                                  }),
                                }),
                                (0, cZ.jsx)("tbody", {
                                  className: kB("tbody"),
                                  children: u.map((a, c) =>
                                    (0, cZ.jsx)(
                                      "tr",
                                      {
                                        style: { whiteSpace: "nowrap" },
                                        className: kB("tr"),
                                        onClick: () => {
                                          (b(g(j[c])), m(!1));
                                        },
                                        children: v.map((b) =>
                                          (0, cZ.jsx)(
                                            "td",
                                            { className: kB("td"), children: a[b] },
                                            b
                                          )
                                        ),
                                      },
                                      c
                                    )
                                  ),
                                }),
                              ],
                            }),
                            (0, cZ.jsx)("div", {
                              className: kB("loadingBanner"),
                              children: (0, cZ.jsx)(jw, { size: 24 }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, cZ.jsx)("div", {
                      className: kB("footerContainer"),
                      children: (0, cZ.jsx)(A, { items: u }),
                    }),
                  ],
                }),
              }),
            ],
          })
        );
      };
    cz();
    var kE = iZ("Input", jC);
    cz();
    var kF = iZ("Input", jC);
    cz();
    var kG = iZ("Input", jC);
    (cz(), cz());
    var kH = iZ("ObjectField", {
      ObjectField: "_ObjectField_1ua3y_5",
      "ObjectField-fieldset": "_ObjectField-fieldset_1ua3y_13",
    });
    cz();
    var kI = () => {
        if (void 0 !== ci.default.useId) return ci.default.useId();
        let [a] = (0, ci.useState)(i2());
        return a;
      },
      kJ = iZ("Input", jC),
      kK = iZ("InputWrapper", jC),
      kL = ({ children: a, icon: b, label: c, el: d = "label", readOnly: e, className: f }) =>
        (0, cZ.jsxs)(d, {
          className: f,
          children: [
            (0, cZ.jsxs)("div", {
              className: kJ("label"),
              children: [
                b
                  ? (0, cZ.jsx)("div", { className: kJ("labelIcon"), children: b })
                  : (0, cZ.jsx)(cZ.Fragment, {}),
                c,
                e &&
                  (0, cZ.jsx)("div", {
                    className: kJ("disabledIcon"),
                    title: "Read-only",
                    children: (0, cZ.jsx)(jW, { size: "12" }),
                  }),
              ],
            }),
            a,
          ],
        }),
      kM = ({ children: a, icon: b, label: c, el: d = "label", readOnly: e }) => {
        let f = jl((a) => a.overrides),
          g = (0, ci.useMemo)(() => f.fieldLabel || kL, [f]);
        return c
          ? (0, cZ.jsx)(g, {
              label: c,
              icon: b,
              className: kJ({ readOnly: e }),
              readOnly: e,
              el: d,
              children: a,
            })
          : (0, cZ.jsx)(cZ.Fragment, { children: a });
      },
      kN = {
        array: ({
          field: a,
          onChange: b,
          value: c,
          name: d,
          label: e,
          labelIcon: f,
          readOnly: g,
          id: h,
          Label: i = (a) => (0, cZ.jsx)("div", cw({}, a)),
        }) => {
          let j = jl((a) => a.state.ui.arrayState[h]),
            k = jl((a) => a.setUi),
            { readOnlyFields: l, localName: m = d } = kp(),
            n = j || {
              items: Array.from(c || []).map((a, b) => ({
                _originalIndex: b,
                _arrayId: `${h}-${b}`,
              })),
              openId: "",
            },
            [o, p] = (0, ci.useState)({ arrayState: n, value: c });
          (0, ci.useEffect)(() => {
            var a;
            p({ arrayState: null != (a = q.getState().state.ui.arrayState[h]) ? a : n, value: c });
          }, [c]);
          let q = jm(),
            r = (0, ci.useCallback)(
              (a) => ({
                arrayState: cn(
                  cw({}, q.getState().state.ui.arrayState),
                  cp({ [h]: cw(cw({}, n), a) })
                ),
              }),
              [n, q]
            ),
            s = (0, ci.useCallback)(
              () => n.items.reduce((a, b) => (b._originalIndex > a ? b._originalIndex : a), -1),
              [n]
            ),
            t = (0, ci.useCallback)(
              (a) => {
                let b = s(),
                  c = Array.from(a || []).map((a, c) => {
                    var d;
                    let e = n.items[c],
                      f = {
                        _originalIndex:
                          void 0 !== (null == e ? void 0 : e._originalIndex)
                            ? e._originalIndex
                            : b + 1,
                        _arrayId:
                          (null == (d = n.items[c]) ? void 0 : d._arrayId) || `${h}-${b + 1}`,
                      };
                    return (f._originalIndex > b && (b = f._originalIndex), f);
                  });
                return cn(cw({}, n), cp({ items: c }));
              },
              [n]
            );
          (0, ci.useEffect)(() => {
            n.items.length > 0 && k(r(n));
          }, []);
          let [u, v] = (0, ci.useState)(""),
            w = !!u,
            y = !jl((a) => a.permissions.getPermissions({ item: a.selectedItem }).edit),
            z = (0, ci.useRef)(c),
            A = (0, ci.useCallback)(
              (b) => {
                if ("array" !== a.type || !a.arrayFields) return;
                let c = q.getState().config;
                return cD({
                  value: b,
                  fields: a.arrayFields,
                  mappers: { slot: ({ value: a }) => a.map((a) => i4(a, c, !0)) },
                  config: c,
                });
              },
              [q, a]
            );
          if ("array" !== a.type || !a.arrayFields) return null;
          let B = (void 0 !== a.max && o.arrayState.items.length >= a.max) || g;
          return (0, cZ.jsx)(i, {
            label: e || d,
            icon: f || (0, cZ.jsx)(jU, { size: 16 }),
            el: "div",
            readOnly: g,
            children: (0, cZ.jsx)(km, {
              onDragStart: (a) => v(a),
              onDragEnd: () => {
                (v(""), b(z.current));
              },
              onMove: (a) => {
                let b, c;
                if (n.items[a.source]._arrayId !== u) return;
                let d = i0(o.value, a.source, a.target),
                  e = i0(n.items, a.source, a.target);
                (k(
                  {
                    arrayState:
                      ((b = cw({}, q.getState().state.ui.arrayState)),
                      (c = { [h]: cn(cw({}, n), cp({ items: e })) }),
                      cn(b, cp(c))),
                  },
                  !1
                ),
                  p({ value: d, arrayState: cn(cw({}, n), cp({ items: e })) }),
                  (z.current = d));
              },
              children: (0, cZ.jsxs)("div", {
                className: kr({ hasItems: Array.isArray(c) && c.length > 0, addDisabled: B }),
                children: [
                  o.arrayState.items.length > 0 &&
                    (0, cZ.jsx)("div", {
                      className: kr("inner"),
                      "data-dnd-container": !0,
                      children: o.arrayState.items.map((e, f) => {
                        let { _arrayId: i = `${h}-${f}`, _originalIndex: j = f } = e,
                          p = Array.from(o.value || [])[f] || {};
                        return (0, cZ.jsx)(
                          kn,
                          {
                            id: i,
                            index: f,
                            disabled: g,
                            children: ({ isDragging: e, ref: h, handleRef: q }) =>
                              (0, cZ.jsxs)("div", {
                                ref: h,
                                className: ks({
                                  isExpanded: n.openId === i,
                                  isDragging: e,
                                  readOnly: g,
                                }),
                                children: [
                                  (0, cZ.jsxs)("div", {
                                    ref: q,
                                    onClick: (a) => {
                                      e ||
                                        (a.preventDefault(),
                                        a.stopPropagation(),
                                        n.openId === i
                                          ? k(r({ openId: "" }))
                                          : k(r({ openId: i })));
                                    },
                                    className: ks("summary"),
                                    children: [
                                      a.getItemSummary ? a.getItemSummary(p, f) : `Item #${j}`,
                                      (0, cZ.jsxs)("div", {
                                        className: ks("rhs"),
                                        children: [
                                          !g &&
                                            (0, cZ.jsxs)("div", {
                                              className: ks("actions"),
                                              children: [
                                                (0, cZ.jsx)("div", {
                                                  className: ks("action"),
                                                  children: (0, cZ.jsx)(jy, {
                                                    type: "button",
                                                    disabled: !!B,
                                                    onClick: (a) => {
                                                      a.stopPropagation();
                                                      let d = [...(c || [])],
                                                        e = A(d[f]);
                                                      (d.splice(f, 0, e), k(r(t(d)), !1), b(d));
                                                    },
                                                    title: "Duplicate",
                                                    children: (0, cZ.jsx)(jM, { size: 16 }),
                                                  }),
                                                }),
                                                (0, cZ.jsx)("div", {
                                                  className: ks("action"),
                                                  children: (0, cZ.jsx)(jy, {
                                                    type: "button",
                                                    disabled:
                                                      void 0 !== a.min &&
                                                      a.min >= o.arrayState.items.length,
                                                    onClick: (a) => {
                                                      a.stopPropagation();
                                                      let d = [...(c || [])],
                                                        e = [...(n.items || [])];
                                                      (d.splice(f, 1),
                                                        e.splice(f, 1),
                                                        k(r({ items: e }), !1),
                                                        b(d));
                                                    },
                                                    title: "Delete",
                                                    children: (0, cZ.jsx)(j4, { size: 16 }),
                                                  }),
                                                }),
                                              ],
                                            }),
                                          (0, cZ.jsx)("div", { children: (0, cZ.jsx)(ka, {}) }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, cZ.jsx)("div", {
                                    className: ks("body"),
                                    children:
                                      n.openId === i &&
                                      (0, cZ.jsx)("fieldset", {
                                        className: ks("fieldset"),
                                        children: Object.keys(a.arrayFields).map((e) => {
                                          let g = a.arrayFields[e],
                                            h = `${d}[${f}]`,
                                            j = `${h}.${e}`,
                                            k = `${m}[${f}]`,
                                            n = `${m}[*]`,
                                            o = `${k}.${e}`,
                                            q = `${n}.${e}`,
                                            r = y || (void 0 !== l[j] ? l[o] : l[q]),
                                            s = g.label || e;
                                          return (0, cZ.jsx)(
                                            kq,
                                            {
                                              name: k,
                                              wildcardName: n,
                                              subName: e,
                                              readOnlyFields: l,
                                              children: (0, cZ.jsx)(kP, {
                                                name: j,
                                                label: s,
                                                id: `${i}_${e}`,
                                                readOnly: r,
                                                field: cn(cw({}, g), cp({ label: s })),
                                                value: p[e],
                                                onChange: (a, d) => {
                                                  var g;
                                                  let h;
                                                  b(
                                                    ((g = cn(cw({}, p), cp({ [e]: a }))),
                                                    (h = Array.from(c)).splice(f, 1),
                                                    h.splice(f, 0, g),
                                                    h),
                                                    d
                                                  );
                                                },
                                              }),
                                            },
                                            j
                                          );
                                        }),
                                      }),
                                  }),
                                ],
                              }),
                          },
                          i
                        );
                      }),
                    }),
                  !B &&
                    (0, cZ.jsx)("button", {
                      type: "button",
                      className: kr("addButton"),
                      onClick: () => {
                        var d;
                        if (w) return;
                        let e = [
                          ...(c || []),
                          cA(A(null != (d = a.defaultItemProps) ? d : {}), a.arrayFields),
                        ];
                        (k(r(t(e)), !1), b(e));
                      },
                      children: (0, cZ.jsx)(j$, { size: 21 }),
                    }),
                ],
              }),
            }),
          });
        },
        external: ({
          field: a,
          onChange: b,
          value: c,
          name: d,
          label: e,
          labelIcon: f,
          Label: g,
          id: h,
          readOnly: i,
        }) => {
          var j, k, l;
          return ((0, ci.useEffect)(() => {
            a.adaptor &&
              console.error(
                "Warning: The `adaptor` API is deprecated. Please use updated APIs on the `external` field instead. This will be a breaking change in a future release."
              );
          }, []),
          "external" !== a.type)
            ? null
            : (0, cZ.jsx)(g, {
                label: e || d,
                icon: f || (0, cZ.jsx)(jT, { size: 16 }),
                el: "div",
                children: (0, cZ.jsx)(kD, {
                  name: d,
                  field: cn(
                    cw({}, a),
                    cp({
                      placeholder: (null == (j = a.adaptor) ? void 0 : j.name)
                        ? `Select from ${a.adaptor.name}`
                        : a.placeholder || "Select data",
                      mapProp: (null == (k = a.adaptor) ? void 0 : k.mapProp) || a.mapProp,
                      mapRow: a.mapRow,
                      fetchList: (null == (l = a.adaptor) ? void 0 : l.fetchList)
                        ? () =>
                            cy(void 0, null, function* () {
                              return yield a.adaptor.fetchList(a.adaptorParams);
                            })
                        : a.fetchList,
                    })
                  ),
                  onChange: b,
                  value: c,
                  id: h,
                  readOnly: i,
                }),
              });
        },
        object: ({
          field: a,
          onChange: b,
          value: c,
          name: d,
          label: e,
          labelIcon: f,
          Label: g,
          readOnly: h,
          id: i,
        }) => {
          let { readOnlyFields: j, localName: k = d } = kp();
          if ("object" !== a.type || !a.objectFields) return null;
          let l = c || {};
          return (0, cZ.jsx)(g, {
            label: e || d,
            icon: f || (0, cZ.jsx)(jO, { size: 16 }),
            el: "div",
            readOnly: h,
            children: (0, cZ.jsx)("div", {
              className: kH(),
              children: (0, cZ.jsx)("fieldset", {
                className: kH("fieldset"),
                children: Object.keys(a.objectFields).map((c) => {
                  let d = a.objectFields[c],
                    e = `${k}.${c}`,
                    f = h || j[e],
                    g = d.label || c;
                  return (0, cZ.jsx)(
                    kq,
                    {
                      name: k || i,
                      subName: c,
                      readOnlyFields: j,
                      children: (0, cZ.jsx)(kP, {
                        name: e,
                        label: e,
                        id: `${i}_${c}`,
                        readOnly: f,
                        field: cn(cw({}, d), cp({ label: g })),
                        value: l[c],
                        onChange: (a, d) => {
                          b(cn(cw({}, l), cp({ [c]: a })), d);
                        },
                      }),
                    },
                    e
                  );
                }),
              }),
            }),
          });
        },
        select: ({
          field: a,
          onChange: b,
          label: c,
          labelIcon: d,
          Label: e,
          value: f,
          name: g,
          readOnly: h,
          id: i,
        }) =>
          "select" === a.type && a.options
            ? (0, cZ.jsx)(e, {
                label: c || g,
                icon: d || (0, cZ.jsx)(jI, { size: 16 }),
                readOnly: h,
                children: (0, cZ.jsx)("select", {
                  id: i,
                  title: c || g,
                  className: kF("input"),
                  disabled: h,
                  onChange: (a) => {
                    b(JSON.parse(a.target.value).value);
                  },
                  value: JSON.stringify({ value: f }),
                  children: a.options.map((a) =>
                    (0, cZ.jsx)(
                      "option",
                      { label: a.label, value: JSON.stringify({ value: a.value }) },
                      a.label + JSON.stringify(a.value)
                    )
                  ),
                }),
              })
            : null,
        textarea: ({
          field: a,
          onChange: b,
          readOnly: c,
          value: d,
          name: e,
          label: f,
          labelIcon: g,
          Label: h,
          id: i,
        }) =>
          (0, cZ.jsx)(h, {
            label: f || e,
            icon: g || (0, cZ.jsx)(j5, { size: 16 }),
            readOnly: c,
            children: (0, cZ.jsx)("textarea", {
              id: i,
              className: kG("input"),
              autoComplete: "off",
              name: e,
              value: void 0 === d ? "" : d,
              onChange: (a) => b(a.currentTarget.value),
              readOnly: c,
              tabIndex: c ? -1 : void 0,
              rows: 5,
              placeholder: "textarea" === a.type ? a.placeholder : void 0,
            }),
          }),
        radio: ({
          field: a,
          onChange: b,
          readOnly: c,
          value: d,
          name: e,
          id: f,
          label: g,
          labelIcon: h,
          Label: i,
        }) =>
          "radio" === a.type && a.options
            ? (0, cZ.jsx)(i, {
                icon: h || (0, cZ.jsx)(jL, { size: 16 }),
                label: g || e,
                readOnly: c,
                el: "div",
                children: (0, cZ.jsx)("div", {
                  className: kE("radioGroupItems"),
                  id: f,
                  children: a.options.map((a) => {
                    var f;
                    return (0, cZ.jsxs)(
                      "label",
                      {
                        className: kE("radio"),
                        children: [
                          (0, cZ.jsx)("input", {
                            type: "radio",
                            className: kE("radioInput"),
                            value: JSON.stringify({ value: a.value }),
                            name: e,
                            onChange: (a) => {
                              b(JSON.parse(a.target.value).value);
                            },
                            disabled: c,
                            checked: d === a.value,
                          }),
                          (0, cZ.jsx)("div", {
                            className: kE("radioInner"),
                            children: a.label || (null == (f = a.value) ? void 0 : f.toString()),
                          }),
                        ],
                      },
                      a.label + a.value
                    );
                  }),
                }),
              })
            : null,
        text: ku,
        number: ku,
      };
    function kO(a) {
      var b;
      let c = jl((a) => a.dispatch),
        d = jl((a) => a.overrides),
        e = jl((a) => {
          var b;
          return null == (b = a.selectedItem) ? void 0 : b.readOnly;
        }),
        f = (0, ci.useContext)(ko),
        { id: g, Label: h = kM } = a,
        i = a.field,
        j = i.label,
        k = i.labelIcon,
        l = kI(),
        m = g || l,
        n = (0, ci.useMemo)(() => {
          var a, b, c, e, f, g, h, i;
          return cn(
            cw({}, d.fieldTypes),
            cp({
              array: (null == (a = d.fieldTypes) ? void 0 : a.array) || kN.array,
              external: (null == (b = d.fieldTypes) ? void 0 : b.external) || kN.external,
              object: (null == (c = d.fieldTypes) ? void 0 : c.object) || kN.object,
              select: (null == (e = d.fieldTypes) ? void 0 : e.select) || kN.select,
              textarea: (null == (f = d.fieldTypes) ? void 0 : f.textarea) || kN.textarea,
              radio: (null == (g = d.fieldTypes) ? void 0 : g.radio) || kN.radio,
              text: (null == (h = d.fieldTypes) ? void 0 : h.text) || kN.text,
              number: (null == (i = d.fieldTypes) ? void 0 : i.number) || kN.number,
            })
          );
        }, [d]),
        o = (0, ci.useMemo)(
          () => cn(cw({}, a), cp({ field: i, label: j, labelIcon: k, Label: h, id: m })),
          [a, i, j, k, h, m]
        ),
        p = (0, ci.useCallback)(
          (a) => {
            o.name &&
              ("INPUT" === a.target.nodeName || "TEXTAREA" === a.target.nodeName) &&
              (a.stopPropagation(), c({ type: "setUi", ui: { field: { focus: o.name } } }));
          },
          [o.name]
        ),
        q = (0, ci.useCallback)((a) => {
          "name" in a.target && c({ type: "setUi", ui: { field: { focus: null } } });
        }, []),
        r = (0, ci.useMemo)(
          () => ("custom" !== i.type && "slot" !== i.type ? kN[i.type] : (a) => null),
          [i.type]
        ),
        s = (0, ci.useMemo)(
          () =>
            "custom" === i.type
              ? i.render
                ? i.render
                : null
              : "slot" !== i.type
                ? n[i.type]
                : void 0,
          [i.type, n]
        ),
        { visible: t = !0 } = a.field;
      if (!t || "slot" === i.type) return null;
      if (!s) throw Error(`Field type for ${i.type} did not exist.`);
      return (0, cZ.jsx)(ko.Provider, {
        value: {
          readOnlyFields: f.readOnlyFields || e || {},
          localName: null != (b = f.localName) ? b : o.name,
        },
        children: (0, cZ.jsx)("div", {
          className: kK(),
          onFocus: p,
          onBlur: q,
          onClick: (a) => {
            a.stopPropagation();
          },
          children: (0, cZ.jsx)(s, cn(cw({}, o), cp({ children: (0, cZ.jsx)(r, cw({}, o)) }))),
        }),
      });
    }
    function kP(a) {
      let b = jl((b) => b.state.ui.field.focus === a.name),
        { value: c, onChange: d } = a,
        [e, f] = (0, ci.useState)(c),
        g = (0, ci.useCallback)(
          (a, b) => {
            (f(a), d(a, b));
          },
          [d]
        );
      return (
        (0, ci.useEffect)(() => {
          b || f(c);
        }, [c]),
        (0, ci.useEffect)(() => {
          b || c === e || f(c);
        }, [b, c, e]),
        (0, cZ.jsx)(kO, cw(cw({}, a), { value: e, onChange: g }))
      );
    }
    function kQ(a) {
      let b = { x: 0, y: 0 },
        c = a;
      for (; c && c !== document.documentElement; ) {
        let a = c.parentElement;
        (a && ((b.x += a.scrollLeft), (b.y += a.scrollTop)), (c = a));
      }
      return b;
    }
    (cz(), cz(), cz(), cz(), cz(), cz());
    var kR = (0, ci.createContext)(null),
      kS = (0, ci.createContext)(
        c5(() => ({
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
      kT = ({ children: a, store: b }) => (0, cZ.jsx)(kS.Provider, { value: b, children: a }),
      kU = ({ children: a, value: b }) => {
        let c = jl((a) => a.dispatch),
          d = (0, ci.useCallback)(
            (a) => {
              c({ type: "registerZone", zone: a });
            },
            [c]
          ),
          e = (0, ci.useMemo)(() => cw({ registerZone: d }, b), [b]);
        return (0, cZ.jsx)(cZ.Fragment, {
          children: e && (0, cZ.jsx)(kR.Provider, { value: e, children: a }),
        });
      };
    function kV(a, b) {
      let c = (0, ci.useContext)(a);
      if (!c) throw Error("useContextStore must be used inside context");
      return c7(c, iV(b));
    }
    (cz(), cz(), cz());
    var kW = (a, b = []) => {
        let c = jm();
        return (0, ci.useCallback)(() => {
          let b = () => {},
            d = (c) => {
              c
                ? a(!1)
                : (setTimeout(() => {
                    a(!0);
                  }, 0),
                  b && b());
            },
            e = c.getState().state.ui.isDragging;
          return (
            d(e),
            e &&
              (b = c.subscribe(
                (a) => a.state.ui.isDragging,
                (a) => {
                  d(a);
                }
              )),
            b
          );
        }, [c, ...b]);
      },
      kX = iZ("DraggableComponent", {
        DraggableComponent: "_DraggableComponent_1vaqy_1",
        "DraggableComponent-overlayWrapper": "_DraggableComponent-overlayWrapper_1vaqy_12",
        "DraggableComponent-overlay": "_DraggableComponent-overlay_1vaqy_12",
        "DraggableComponent-loadingOverlay": "_DraggableComponent-loadingOverlay_1vaqy_34",
        "DraggableComponent--hover": "_DraggableComponent--hover_1vaqy_50",
        "DraggableComponent--isSelected": "_DraggableComponent--isSelected_1vaqy_57",
        "DraggableComponent-actionsOverlay": "_DraggableComponent-actionsOverlay_1vaqy_71",
        "DraggableComponent-actions": "_DraggableComponent-actions_1vaqy_71",
      }),
      kY = ({ label: a, children: b, parentAction: c }) =>
        (0, cZ.jsxs)(i_, {
          children: [
            (0, cZ.jsxs)(i_.Group, { children: [c, a && (0, cZ.jsx)(i_.Label, { label: a })] }),
            (0, cZ.jsx)(i_.Group, { children: b }),
          ],
        }),
      kZ = ({ children: a }) => (0, cZ.jsx)(cZ.Fragment, { children: a }),
      k$ = ({
        children: a,
        depth: b,
        componentType: c,
        id: d,
        index: e,
        zoneCompound: f,
        isLoading: g = !1,
        isSelected: h = !1,
        debug: i,
        label: j,
        autoDragAxis: k,
        userDragAxis: l,
        inDroppableZone: m = !0,
      }) => {
        let n = jl((a) => {
            var b;
            return (null == (b = a.selectedItem) ? void 0 : b.props.id) === d
              ? a.zoomConfig.zoom
              : 1;
          }),
          o = jl((a) => a.overrides),
          p = jl((a) => a.dispatch),
          q = jl((a) => a.iframe),
          r = (0, ci.useContext)(kR),
          [s, t] = (0, ci.useState)({}),
          u = (0, ci.useCallback)(
            (a, b) => {
              var c;
              (null == (c = null == r ? void 0 : r.registerLocalZone) || c.call(r, a, b),
                t((c) => cn(cw({}, c), cp({ [a]: b }))));
            },
            [t]
          ),
          v = (0, ci.useCallback)(
            (a) => {
              var b;
              (null == (b = null == r ? void 0 : r.unregisterLocalZone) || b.call(r, a),
                t((b) => {
                  let c = cw({}, b);
                  return (delete c[a], c);
                }));
            },
            [t]
          ),
          w = Object.values(s).filter(Boolean).length > 0,
          y = jl(
            iV((a) => {
              var b;
              return null == (b = a.state.indexes.nodes[d]) ? void 0 : b.path;
            })
          ),
          z = jl(
            iV((a) => {
              let b = i6({ index: e, zone: f }, a.state);
              return a.permissions.getPermissions({ item: b });
            })
          ),
          A = (0, ci.useContext)(kS),
          [B, C] = (0, ci.useState)(l || k),
          D = (0, ci.useMemo)(() => kl(B), [B]),
          {
            ref: E,
            isDragging: F,
            sortable: G,
          } = iS({
            id: d,
            index: e,
            group: f,
            type: "component",
            data: {
              areaId: null == r ? void 0 : r.areaId,
              zone: f,
              index: e,
              componentType: c,
              containsActiveZone: w,
              depth: b,
              path: y || [],
              inDroppableZone: m,
            },
            collisionPriority: b,
            collisionDetector: D,
            transition: { duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" },
            feedback: "clone",
          });
        (0, ci.useEffect)(() => {
          let a = A.getState().enabledIndex[f];
          ((G.droppable.disabled = !a), (G.draggable.disabled = !z.drag));
          let b = A.subscribe((a) => {
            G.droppable.disabled = !a.enabledIndex[f];
          });
          return H.current && !z.drag
            ? (H.current.setAttribute("data-puck-disabled", ""),
              () => {
                var a;
                (null == (a = H.current) || a.removeAttribute("data-puck-disabled"), b());
              })
            : b;
        }, [z.drag, f]);
        let H = (0, ci.useRef)(null),
          I = (0, ci.useCallback)(
            (a) => {
              (E(a), a && (H.current = a));
            },
            [E]
          ),
          [J, K] = (0, ci.useState)();
        (0, ci.useEffect)(() => {
          var a, b, c;
          K(
            q.enabled
              ? null == (a = H.current)
                ? void 0
                : a.ownerDocument.body
              : null != (c = null == (b = H.current) ? void 0 : b.closest("[data-puck-preview]"))
                ? c
                : document.body
          );
        }, [q.enabled, H.current]);
        let L = (0, ci.useCallback)(() => {
            var a, b, c;
            if (!H.current) return;
            let d = H.current.getBoundingClientRect(),
              e = kQ(H.current),
              f = q.enabled
                ? null
                : null == (a = H.current)
                  ? void 0
                  : a.closest("[data-puck-preview]"),
              g = null == f ? void 0 : f.getBoundingClientRect(),
              h = f ? kQ(f) : { x: 0, y: 0 },
              i = {
                x: e.x - h.x - (null != (b = null == g ? void 0 : g.left) ? b : 0),
                y: e.y - h.y - (null != (c = null == g ? void 0 : g.top) ? c : 0),
              },
              j = { height: H.current.offsetHeight, width: H.current.offsetWidth },
              k = (function (a) {
                let b = new DOMMatrixReadOnly(),
                  c = a.parentElement;
                for (; c && c !== document.documentElement; ) {
                  let a = getComputedStyle(c).transform;
                  (a && "none" !== a && (b = new DOMMatrixReadOnly(a).multiply(b)),
                    (c = c.parentElement));
                }
                return { scaleX: b.a, scaleY: b.d };
              })(H.current);
            return {
              left: `${(d.left + i.x) / k.scaleX}px`,
              top: `${(d.top + i.y) / k.scaleY}px`,
              height: `${j.height}px`,
              width: `${j.width}px`,
            };
          }, [H.current]),
          [M, N] = (0, ci.useState)(),
          O = (0, ci.useCallback)(() => {
            N(L());
          }, [H.current, q]);
        (0, ci.useEffect)(() => {
          if (H.current) {
            let a = new ResizeObserver(O);
            return (
              a.observe(H.current),
              () => {
                a.disconnect();
              }
            );
          }
        }, [H.current]);
        let P = jl((a) => a.nodes.registerNode),
          Q = (0, ci.useCallback)(() => {
            ab(!1);
          }, []),
          R = (0, ci.useCallback)(() => {
            ab(!0);
          }, []);
        (0, ci.useEffect)(() => {
          var a;
          return (
            P(d, {
              methods: { sync: O, showOverlay: R, hideOverlay: Q },
              element: null != (a = H.current) ? a : null,
            }),
            () => {
              P(d, {
                methods: { sync: () => null, hideOverlay: () => null, showOverlay: () => null },
                element: null,
              });
            }
          );
        }, [d, f, e, c, O]);
        let S = (0, ci.useMemo)(() => o.actionBar || kY, [o.actionBar]),
          T = (0, ci.useMemo)(() => o.componentOverlay || kZ, [o.componentOverlay]),
          U = (0, ci.useCallback)(
            (a) => {
              (a.target.closest("[data-puck-overlay-portal]") || a.stopPropagation(),
                p({ type: "setUi", ui: { itemSelector: { index: e, zone: f } } }));
            },
            [e, f, d]
          ),
          V = jm(),
          W = (0, ci.useCallback)(() => {
            let { nodes: a, zones: b } = V.getState().state.indexes,
              c = a[d],
              e = (null == c ? void 0 : c.parentId) ? a[null == c ? void 0 : c.parentId] : null;
            if (!e || !c.parentId) return;
            let f = `${e.parentId}:${e.zone}`,
              g = b[f].contentIds.indexOf(c.parentId);
            p({ type: "setUi", ui: { itemSelector: { zone: f, index: g } } });
          }, [r, y]),
          X = (0, ci.useCallback)(() => {
            p({ type: "duplicate", sourceIndex: e, sourceZone: f });
          }, [e, f]),
          Y = (0, ci.useCallback)(() => {
            p({ type: "remove", index: e, zone: f });
          }, [e, f]),
          [Z, $] = (0, ci.useState)(!1),
          _ = kV(kS, (a) => a.hoveringComponent === d);
        (0, ci.useEffect)(() => {
          if (!H.current) return;
          let a = H.current,
            b = (a) => {
              (A.getState().draggedItem ? (F ? $(!0) : $(!1)) : $(!0), a.stopPropagation());
            },
            c = (a) => {
              (a.stopPropagation(), $(!1));
            };
          return (
            a.setAttribute("data-puck-component", d),
            a.setAttribute("data-puck-dnd", d),
            (a.style.position = "relative"),
            a.addEventListener("click", U),
            a.addEventListener("mouseover", b),
            a.addEventListener("mouseout", c),
            () => {
              (a.removeAttribute("data-puck-component"),
                a.removeAttribute("data-puck-dnd"),
                a.removeEventListener("click", U),
                a.removeEventListener("mouseover", b),
                a.removeEventListener("mouseout", c));
            }
          );
        }, [H.current, U, w, f, d, F, m]);
        let [aa, ab] = (0, ci.useState)(!1),
          [ac, ad] = (0, ci.useState)(!0),
          [ae, af] = (0, ci.useTransition)();
        (0, ci.useEffect)(() => {
          af(() => {
            Z || _ || h ? (O(), ab(!0), ah(!1)) : ab(!1);
          });
        }, [Z, _, h, q]);
        let [ag, ah] = (0, ci.useState)(!1),
          ai = kW((a) => {
            a
              ? af(() => {
                  (O(), ad(!0));
                })
              : ad(!1);
          });
        ((0, ci.useEffect)(() => {
          F && ah(!0);
        }, [F]),
          (0, ci.useEffect)(() => {
            if (ag) return ai();
          }, [ag, ai]));
        let aj = (0, ci.useCallback)(
          (a) => {
            if (a && a.ownerDocument.defaultView) {
              let b = a.getBoundingClientRect(),
                c = b.x < 0,
                d = b.y;
              (c && ((a.style.transformOrigin = "left top"), (a.style.left = "0px")),
                d < 0 && ((a.style.top = "12px"), c || (a.style.transformOrigin = "right top")));
            }
          },
          [n]
        );
        (0, ci.useEffect)(() => {
          if (l) return void C(l);
          if (H.current) {
            let a = window.getComputedStyle(H.current);
            if ("inline" === a.display || "inline-block" === a.display) return void C("x");
          }
          C(k);
        }, [H, l, k]);
        let ak = (0, ci.useMemo)(
            () =>
              (null == r ? void 0 : r.areaId) &&
              (null == r ? void 0 : r.areaId) !== "root" &&
              (0, cZ.jsx)(i_.Action, {
                onClick: W,
                label: "Select parent",
                children: (0, cZ.jsx)(jN, { size: 16 }),
              }),
            [null == r ? void 0 : r.areaId]
          ),
          al = (0, ci.useMemo)(
            () =>
              cn(
                cw({}, r),
                cp({
                  areaId: d,
                  zoneCompound: f,
                  index: e,
                  depth: b + 1,
                  registerLocalZone: u,
                  unregisterLocalZone: v,
                })
              ),
            [r, d, f, e, b, u, v]
          );
        return (0, cZ.jsxs)(kU, {
          value: al,
          children: [
            ac &&
              aa &&
              (0, ht.createPortal)(
                (0, cZ.jsxs)("div", {
                  className: kX({ isSelected: h, isDragging: F, hover: Z || _ }),
                  style: cw({}, M),
                  "data-puck-overlay": !0,
                  children: [
                    i,
                    g &&
                      (0, cZ.jsx)("div", {
                        className: kX("loadingOverlay"),
                        children: (0, cZ.jsx)(jw, {}),
                      }),
                    (0, cZ.jsx)("div", {
                      className: kX("actionsOverlay"),
                      style: { top: 52 / n },
                      children: (0, cZ.jsx)("div", {
                        className: kX("actions"),
                        style: {
                          transform: `scale(${1 / n}`,
                          top: -44 / n,
                          right: 0,
                          paddingLeft: 8,
                          paddingRight: 8,
                        },
                        ref: aj,
                        children: (0, cZ.jsxs)(S, {
                          parentAction: ak,
                          label: j,
                          children: [
                            z.duplicate &&
                              (0, cZ.jsx)(i_.Action, {
                                onClick: X,
                                label: "Duplicate",
                                children: (0, cZ.jsx)(jM, { size: 16 }),
                              }),
                            z.delete &&
                              (0, cZ.jsx)(i_.Action, {
                                onClick: Y,
                                label: "Delete",
                                children: (0, cZ.jsx)(j4, { size: 16 }),
                              }),
                          ],
                        }),
                      }),
                    }),
                    (0, cZ.jsx)("div", {
                      className: kX("overlayWrapper"),
                      children: (0, cZ.jsx)(T, {
                        componentId: d,
                        componentType: c,
                        hover: Z,
                        isSelected: h,
                        children: (0, cZ.jsx)("div", { className: kX("overlay") }),
                      }),
                    }),
                  ],
                }),
                J || document.body
              ),
            a(I),
          ],
        });
      };
    (cz(), cz(), cz());
    var k_ = {
      Drawer: "_Drawer_pl7z0_1",
      "Drawer-draggable": "_Drawer-draggable_pl7z0_8",
      "Drawer-draggableBg": "_Drawer-draggableBg_pl7z0_12",
      "DrawerItem-draggable": "_DrawerItem-draggable_pl7z0_22",
      "DrawerItem--disabled": "_DrawerItem--disabled_pl7z0_35",
      DrawerItem: "_DrawerItem_pl7z0_22",
      "Drawer--isDraggingFrom": "_Drawer--isDraggingFrom_pl7z0_45",
      "DrawerItem-name": "_DrawerItem-name_pl7z0_63",
    };
    (cz(), cz(), cz(), cz());
    var k0 = () => {};
    (cz(), cz());
    var k1 = "u" > typeof PointerEvent ? PointerEvent : Event,
      k2 = class extends k1 {
        constructor(a, b) {
          (super(a, b), (this._originalTarget = null), (this.originalTarget = b.originalTarget));
        }
        set originalTarget(a) {
          this._originalTarget = a;
        }
        get originalTarget() {
          return this._originalTarget;
        }
      };
    (cz(), cz());
    var k3 = (0, ci.createContext)({ dragListeners: {} }),
      k4 = ({ children: a, disableAutoScroll: b }) => {
        let c,
          d = jl((a) => a.dispatch),
          e = jm(),
          f = kI(),
          g = (0, ci.useRef)(null),
          h =
            ((c = (0, ci.useRef)(null)),
            (0, ci.useCallback)((a) => {
              kj.setState({ fallbackEnabled: !1 });
              let b = i2();
              ((c.current = b),
                setTimeout(() => {
                  c.current === b &&
                    (kj.setState({ fallbackEnabled: !0 }), a.collisionObserver.forceUpdate(!0));
                }, 100));
            }, [])),
          [i] = (0, ci.useState)(() =>
            c5(() => ({
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
          j = (0, ci.useCallback)(
            (a, b) => {
              let { zoneDepthIndex: c = {}, areaDepthIndex: d = {} } = i.getState() || {},
                e = Object.keys(c).length > 0,
                f = Object.keys(d).length > 0,
                g = !1,
                h = !1;
              return (
                a.zone && !c[a.zone] ? (g = !0) : !a.zone && e && (g = !0),
                a.area && !d[a.area] ? (h = !0) : !a.area && f && (h = !0),
                { zoneChanged: g, areaChanged: h }
              );
            },
            [i]
          ),
          k = (0, ci.useCallback)(
            (a, b) => {
              let { zoneChanged: c, areaChanged: d } = j(a, f);
              (c || d) &&
                (i.setState({
                  zoneDepthIndex: a.zone ? { [a.zone]: !0 } : {},
                  areaDepthIndex: a.area ? { [a.area]: !0 } : {},
                }),
                h(b),
                setTimeout(() => {
                  b.collisionObserver.forceUpdate(!0);
                }, 50),
                (g.current = null));
            },
            [i]
          ),
          l = (function (a, b, c) {
            var d = this,
              e = (0, ci.useRef)(null),
              f = (0, ci.useRef)(0),
              g = (0, ci.useRef)(null),
              h = (0, ci.useRef)([]),
              i = (0, ci.useRef)(),
              j = (0, ci.useRef)(),
              k = (0, ci.useRef)(a),
              l = (0, ci.useRef)(!0);
            (0, ci.useEffect)(
              function () {
                k.current = a;
              },
              [a]
            );
            var m = !b && 0 !== b && !1;
            if ("function" != typeof a) throw TypeError("Expected a function");
            b = +b || 0;
            var n = !!(c = c || {}).leading,
              o = !("trailing" in c) || !!c.trailing,
              p = "maxWait" in c,
              q = p ? Math.max(+c.maxWait || 0, b) : null;
            return (
              (0, ci.useEffect)(function () {
                return (
                  (l.current = !0),
                  function () {
                    l.current = !1;
                  }
                );
              }, []),
              (0, ci.useMemo)(
                function () {
                  var a = function (a) {
                      var b = h.current,
                        c = i.current;
                      return (
                        (h.current = i.current = null),
                        (f.current = a),
                        (j.current = k.current.apply(c, b))
                      );
                    },
                    c = function (a, b) {
                      (m && cancelAnimationFrame(g.current), (g.current = setTimeout(a, b)));
                    },
                    r = function (a) {
                      if (!l.current) return !1;
                      var c = a - e.current;
                      return !e.current || c >= b || c < 0 || (p && a - f.current >= q);
                    },
                    s = function (b) {
                      return (
                        (g.current = null),
                        o && h.current ? a(b) : ((h.current = i.current = null), j.current)
                      );
                    },
                    t = function a() {
                      var d = Date.now();
                      if (r(d)) return s(d);
                      if (l.current) {
                        var g = b - (d - e.current);
                        c(a, p ? Math.min(g, q - (d - f.current)) : g);
                      }
                    },
                    u = function () {
                      var k = Date.now(),
                        m = r(k);
                      if (
                        ((h.current = [].slice.call(arguments)),
                        (i.current = d),
                        (e.current = k),
                        m)
                      ) {
                        if (!g.current && l.current)
                          return ((f.current = e.current), c(t, b), n ? a(e.current) : j.current);
                        if (p) return (c(t, b), a(e.current));
                      }
                      return (g.current || c(t, b), j.current);
                    };
                  return (
                    (u.cancel = function () {
                      (g.current && clearTimeout(g.current),
                        (f.current = 0),
                        (h.current = e.current = i.current = g.current = null));
                    }),
                    (u.isPending = function () {
                      return !!g.current;
                    }),
                    (u.flush = function () {
                      return g.current ? s(Date.now()) : j.current;
                    }),
                    u
                  );
                },
                [n, p, b, q, o, m]
              )
            );
          })(k, 100),
          m = () => {
            (l.cancel(), (g.current = null));
          };
        (0, ci.useEffect)(() => {}, []);
        let [n] = (0, ci.useState)(() => [
            ...(b ? ho.filter((a) => a !== ha) : ho),
            (({ onChange: a }, b) =>
              class extends eZ {
                constructor(a, b) {
                  super(a);
                  return;
                }
              })(
              {
                onChange: (a, b) => {
                  let c = i.getState(),
                    { zoneChanged: d, areaChanged: e } = j(a, f),
                    h = b.dragOperation.status.dragging;
                  if (e || d) {
                    let b = {},
                      c = {};
                    (a.zone && (b = { [a.zone]: !0 }),
                      a.area && (c = { [a.area]: !0 }),
                      i.setState({ nextZoneDepthIndex: b, nextAreaDepthIndex: c }));
                  }
                  if ("void" !== a.zone && (null == c ? void 0 : c.zoneDepthIndex.void))
                    return void k(a, b);
                  if (e) {
                    if (h) {
                      let c = g.current;
                      (c && c.area === a.area && c.zone === a.zone) ||
                        (m(), l(a, b), (g.current = a));
                    } else (m(), k(a, b));
                    return;
                  }
                  (d && k(a, b), m());
                },
              },
              0
            ),
          ]),
          o = kd(),
          [p, q] = (0, ci.useState)({}),
          r = (0, ci.useRef)(null),
          s = (0, ci.useRef)(void 0),
          t = (0, ci.useMemo)(() => ({ mode: "edit", areaId: "root", depth: 0 }), []);
        return (0, cZ.jsx)("div", {
          id: f,
          children: (0, cZ.jsx)(k3.Provider, {
            value: { dragListeners: p, setDragListeners: q },
            children: (0, cZ.jsx)(hN, {
              plugins: n,
              sensors: o,
              onDragEnd: (a, b) => {
                var c, f;
                let g,
                  h = null == (c = k0()) ? void 0 : c.querySelector("[data-puck-entry]");
                null == h || h.removeAttribute("data-puck-dragging");
                let { source: j, target: k } = a.operation;
                if (!j) return void i.setState({ draggedItem: null });
                let { zone: l, index: m } = j.data,
                  { previewIndex: n = {} } = i.getState() || {},
                  o = (null == (f = n[l]) ? void 0 : f.props.id) === j.id ? n[l] : null;
                g = dy(() => {
                  "idle" === j.status &&
                    ((() => {
                      var c, f;
                      if (
                        (i.setState({ draggedItem: null }),
                        a.canceled || (null == k ? void 0 : k.type) === "void")
                      ) {
                        (i.setState({ previewIndex: {} }),
                          null == (c = p.dragend) ||
                            c.forEach((c) => {
                              c(a, b);
                            }),
                          d({ type: "setUi", ui: { itemSelector: null, isDragging: !1 } }));
                        return;
                      }
                      if (o)
                        if ((i.setState({ previewIndex: {} }), "insert" === o.type)) {
                          let a, b, c, d;
                          ((a = o.componentType),
                            (b = o.zone),
                            (c = o.index),
                            (d = e.getState()),
                            cy(void 0, null, function* () {
                              let e = i2(a),
                                f = {
                                  type: "insert",
                                  componentType: a,
                                  destinationIndex: c,
                                  destinationZone: b,
                                  id: e,
                                },
                                { state: g, dispatch: h, resolveComponentData: i } = d,
                                j = i5(g, f, d);
                              h(cn(cw({}, f), cp({ recordHistory: !0 })));
                              let k = { index: c, zone: b };
                              h({ type: "setUi", ui: { itemSelector: k } });
                              let l = i6(k, j);
                              if (l) {
                                let a = yield i(l, "insert");
                                a.didChange &&
                                  h({
                                    type: "replace",
                                    destinationZone: k.zone,
                                    destinationIndex: k.index,
                                    data: a.node,
                                  });
                              }
                            }));
                        } else
                          s.current &&
                            d({
                              type: "move",
                              sourceIndex: s.current.index,
                              sourceZone: s.current.zone,
                              destinationIndex: o.index,
                              destinationZone: o.zone,
                              recordHistory: !1,
                            });
                      (d({
                        type: "setUi",
                        ui: { itemSelector: { index: m, zone: l }, isDragging: !1 },
                        recordHistory: !0,
                      }),
                        null == (f = p.dragend) ||
                          f.forEach((c) => {
                            c(a, b);
                          }));
                    })(),
                    null == g || g());
                });
              },
              onDragOver: (a, b) => {
                var c, d, f, g, h;
                if ((a.preventDefault(), !(null == (c = i.getState()) ? void 0 : c.draggedItem)))
                  return;
                m();
                let { source: j, target: k } = a.operation;
                if (!k || !j || "void" === k.type) return;
                let [l] = j.id.split(":"),
                  [n] = k.id.split(":"),
                  o = j.data,
                  q = o.zone,
                  t = o.index,
                  u = "",
                  v = 0;
                if ("component" === k.type) {
                  let a = k.data;
                  ((u = a.zone), (v = a.index));
                  let c = null == (d = b.collisionObserver.collisions[0]) ? void 0 : d.data,
                    e = (h = k.element)
                      ? (function a(b) {
                          return b ? b.getAttribute("dir") || a(b.parentElement) : "ltr";
                        })(h)
                      : "ltr";
                  (v >= t && q === u && (v -= 1),
                    "after" ==
                      ((null == c ? void 0 : c.direction) === "up" ||
                      ("ltr" === e && (null == c ? void 0 : c.direction) === "left") ||
                      ("rtl" === e && (null == c ? void 0 : c.direction) === "right")
                        ? "before"
                        : "after") && (v += 1));
                } else ((u = k.id.toString()), (v = 0));
                let w =
                  (null == (f = e.getState().state.indexes.nodes[k.id]) ? void 0 : f.path) || [];
                if (
                  !(
                    n === l ||
                    w.find((a) => {
                      let [b] = a.split(":");
                      return b === l;
                    })
                  )
                ) {
                  if ("new" === r.current)
                    i.setState({
                      previewIndex: {
                        [u]: {
                          componentType: o.componentType,
                          type: "insert",
                          index: v,
                          zone: u,
                          element: j.element,
                          props: { id: j.id.toString() },
                        },
                      },
                    });
                  else {
                    s.current || (s.current = { zone: o.zone, index: o.index });
                    let a = i6(s.current, e.getState().state);
                    a &&
                      i.setState({
                        previewIndex: {
                          [u]: {
                            componentType: o.componentType,
                            type: "move",
                            index: v,
                            zone: u,
                            props: a.props,
                            element: j.element,
                          },
                        },
                      });
                  }
                  null == (g = p.dragover) ||
                    g.forEach((c) => {
                      c(a, b);
                    });
                }
              },
              onDragStart: (a, b) => {
                var c;
                let { source: d } = a.operation;
                if (d && "void" !== d.type) {
                  let a = d.data,
                    b = i6({ zone: a.zone, index: a.index }, e.getState().state);
                  b &&
                    i.setState({
                      previewIndex: {
                        [a.zone]: {
                          componentType: a.componentType,
                          type: "move",
                          index: a.index,
                          zone: a.zone,
                          props: b.props,
                          element: d.element,
                        },
                      },
                    });
                }
                null == (c = p.dragstart) ||
                  c.forEach((c) => {
                    c(a, b);
                  });
              },
              onBeforeDragStart: (a) => {
                var b, c, f, g;
                ((r.current =
                  (null == (b = a.operation.source) ? void 0 : b.type) === "drawer"
                    ? "new"
                    : "existing"),
                  (s.current = void 0),
                  i.setState({ draggedItem: a.operation.source }),
                  (null == (c = e.getState().selectedItem) ? void 0 : c.props.id) !==
                  (null == (f = a.operation.source) ? void 0 : f.id)
                    ? d({
                        type: "setUi",
                        ui: { itemSelector: null, isDragging: !0 },
                        recordHistory: !1,
                      })
                    : d({ type: "setUi", ui: { isDragging: !0 }, recordHistory: !1 }));
                let h = null == (g = k0()) ? void 0 : g.querySelector("[data-puck-entry]");
                null == h || h.setAttribute("data-puck-dragging", "true");
              },
              children: (0, cZ.jsx)(kT, {
                store: i,
                children: (0, cZ.jsx)(kU, { value: t, children: a }),
              }),
            }),
          }),
        });
      },
      k5 = ({ children: a, disableAutoScroll: b }) =>
        "LOADING" === jl((a) => a.status)
          ? a
          : (0, cZ.jsx)(k4, { disableAutoScroll: b, children: a }),
      k6 = iZ("Drawer", k_),
      k7 = iZ("DrawerItem", k_),
      k8 = ({ children: a, name: b, label: c, dragRef: d, isDragDisabled: e }) => {
        let f = (0, ci.useMemo)(
          () =>
            a ||
            (({ children: a }) => (0, cZ.jsx)("div", { className: k7("default"), children: a })),
          [a]
        );
        return (0, cZ.jsx)("div", {
          className: k7({ disabled: e }),
          ref: d,
          onMouseDown: (a) => a.preventDefault(),
          "data-testid": d ? `drawer-item:${b}` : "",
          "data-puck-drawer-item": !0,
          children: (0, cZ.jsx)(f, {
            name: b,
            children: (0, cZ.jsx)("div", {
              className: k7("draggableWrapper"),
              children: (0, cZ.jsxs)("div", {
                className: k7("draggable"),
                children: [
                  (0, cZ.jsx)("div", { className: k7("name"), children: null != c ? c : b }),
                  (0, cZ.jsx)("div", { className: k7("icon"), children: (0, cZ.jsx)(ka, {}) }),
                ],
              }),
            }),
          }),
        });
      },
      k9 = ({ children: a, name: b, label: c, id: d, isDragDisabled: e }) => {
        let { ref: f } = (function (a) {
          let { disabled: b, data: c, element: d, handle: e, id: f, modifiers: g, sensors: h } = a,
            i = hP(
              (b) => new hr(hC(hI({}, a), hD({ register: !1, handle: hu(e), element: hu(d) })), b)
            ),
            j = hw(i, hQ);
          return (
            hz(f, () => (i.id = f)),
            hA(e, (a) => (i.handle = a)),
            hA(d, (a) => (i.element = a)),
            hz(c, () => c && (i.data = c)),
            hz(b, () => (i.disabled = !0 === b)),
            hz(h, () => (i.sensors = h)),
            hz(g, () => (i.modifiers = g), void 0, dX),
            hz(a.feedback, () => {
              var b;
              return (i.feedback = null != (b = a.feedback) ? b : "default");
            }),
            hz(a.alignment, () => (i.alignment = a.alignment)),
            {
              draggable: j,
              get isDragging() {
                return j.isDragging;
              },
              get isDropping() {
                return j.isDropping;
              },
              get isDragSource() {
                return j.isDragSource;
              },
              handleRef: (0, ci.useCallback)(
                (a) => {
                  i.handle = null != a ? a : void 0;
                },
                [i]
              ),
              ref: (0, ci.useCallback)(
                (a) => {
                  var b, c;
                  (a ||
                    null == (b = i.element) ||
                    !b.isConnected ||
                    (null == (c = i.manager) ? void 0 : c.dragOperation.status.idle)) &&
                    (i.element = null != a ? a : void 0);
                },
                [i]
              ),
            }
          );
        })({ id: d, data: { componentType: b }, disabled: e, type: "drawer" });
        return (0, cZ.jsxs)("div", {
          className: k6("draggable"),
          children: [
            (0, cZ.jsx)("div", {
              className: k6("draggableBg"),
              children: (0, cZ.jsx)(k8, { name: b, label: c, children: a }),
            }),
            (0, cZ.jsx)("div", {
              className: k6("draggableFg"),
              children: (0, cZ.jsx)(k8, {
                name: b,
                label: c,
                dragRef: f,
                isDragDisabled: e,
                children: a,
              }),
            }),
          ],
        });
      },
      la = ({ children: a, droppableId: b, direction: c }) => {
        (b &&
          console.error(
            "Warning: The `droppableId` prop on Drawer is deprecated and no longer required."
          ),
          c &&
            console.error(
              "Warning: The `direction` prop on Drawer is deprecated and no longer required to achieve multi-directional dragging."
            ));
        let d = kI(),
          { ref: e } = h3({ id: d, type: "void", collisionPriority: 0 });
        return (0, cZ.jsx)("div", {
          className: k6(),
          ref: e,
          "data-puck-dnd": d,
          "data-puck-drawer": !0,
          "data-puck-dnd-void": !0,
          children: a,
        });
      };
    ((la.Item = ({ name: a, children: b, id: c, label: d, index: e, isDragDisabled: f }) => {
      let g = c || a,
        [h, i] = (0, ci.useState)(i2(g));
      return (
        void 0 !== e &&
          console.error(
            "Warning: The `index` prop on Drawer.Item is deprecated and no longer required."
          ),
        !(function (a, b, c = []) {
          let { setDragListeners: d } = (0, ci.useContext)(k3);
          (0, ci.useEffect)(() => {
            d && d((c) => cn(cw({}, c), cp({ [a]: [...(c[a] || []), b] })));
          }, c);
        })(
          "dragend",
          () => {
            i(i2(g));
          },
          [g]
        ),
        (0, cZ.jsx)(
          "div",
          {
            children: (0, cZ.jsx)(k9, { name: a, label: d, id: h, isDragDisabled: f, children: b }),
          },
          h
        )
      );
    }),
      cz());
    var lb = (a, b) => a.getState().state.indexes.zones[b].contentIds.length;
    (cz(), cz(), cz(), cz(), cz());
    var lc = ({ componentId: a, zone: b }) => {
      let c = jl((a) => a.config),
        d = jl((a) => a.metadata),
        e = jl(
          iV((c) => {
            var d, e;
            let f = c.state.indexes;
            return (
              null != (e = null == (d = f.zones[`${a}:${b}`]) ? void 0 : d.contentIds) ? e : []
            ).map((a) => f.nodes[a].flatData);
          })
        );
      return (0, cZ.jsx)(cW, { content: e, zone: b, config: c, metadata: d });
    };
    (cz(), cz(), cz(), cz(), cz(), cz());
    var ld = (a, b) => {
        let c = a.indexes.nodes[b];
        if (!c) return;
        let d = `${c.parentId}:${c.zone}`,
          e = a.indexes.zones[d].contentIds.indexOf(b);
        return { zone: d, index: e };
      },
      le = iZ("InlineTextField", { InlineTextField: "_InlineTextField_1xph6_1" }),
      lf = (0, ci.memo)(
        ({ propPath: a, componentId: b, value: c, isReadOnly: d, opts: e = {} }) => {
          var f;
          let g = (0, ci.useRef)(null),
            h = jm(),
            i = null != (f = e.disableLineBreaks) && f;
          (0, ci.useEffect)(() => {
            let d = h.getState(),
              e = d.state.indexes.nodes[b].data;
            if (!d.getComponentConfig(e.type))
              throw Error(`InlineTextField Error: No config defined for ${e.type}`);
            if (g.current) {
              c !== g.current.innerText && g.current.replaceChildren(c);
              let d = ((a, b = {}) => {
                  if (!a) return;
                  let { disableDrag: c = !1, disableDragOnFocus: d = !0 } = b,
                    e = (a) => {
                      a.stopPropagation();
                    };
                  a.addEventListener("mouseover", e, { capture: !0 });
                  let f = () => {
                    setTimeout(() => {
                      a.addEventListener("pointerdown", e, { capture: !0 });
                    }, 200);
                  };
                  return (
                    d
                      ? (a.addEventListener("focus", f, { capture: !0 }),
                        a.addEventListener(
                          "blur",
                          () => {
                            a.removeEventListener("pointerdown", e, { capture: !0 });
                          },
                          { capture: !0 }
                        ))
                      : c && a.addEventListener("pointerdown", e, { capture: !0 }),
                    a.setAttribute("data-puck-overlay-portal", "true"),
                    () => {
                      (a.removeEventListener("mouseover", e, { capture: !0 }),
                        d
                          ? (a.removeEventListener("focus", f, { capture: !0 }),
                            a.removeEventListener("blur", f, { capture: !0 }))
                          : c && a.removeEventListener("pointerdown", e, { capture: !0 }),
                        a.removeAttribute("data-puck-overlay-portal"));
                    }
                  );
                })(g.current),
                e = (c) =>
                  cy(void 0, null, function* () {
                    var d;
                    let e = h.getState(),
                      f = e.state.indexes.nodes[b],
                      g = `${f.parentId}:${f.zone}`,
                      j = null == (d = e.state.indexes.zones[g]) ? void 0 : d.contentIds.indexOf(b),
                      k = c.target.innerText;
                    i && (k = k.replaceAll(/\n/gm, ""));
                    let l = (function (a, b, c) {
                        let d = b.split("."),
                          e = cw({}, a),
                          f = e;
                        for (let a = 0; a < d.length; a++) {
                          let [b, e] = d[a].replace("]", "").split("["),
                            g = a === d.length - 1;
                          if (void 0 !== e) {
                            Array.isArray(f[b]) || (f[b] = []);
                            let a = Number(e);
                            if (g) {
                              f[b][a] = c;
                              continue;
                            }
                            (void 0 === f[b][a] && (f[b][a] = {}), (f = f[b][a]));
                            continue;
                          }
                          if (g) {
                            f[b] = c;
                            continue;
                          }
                          (void 0 === f[b] && (f[b] = {}), (f = f[b]));
                        }
                        return cw(cw({}, a), e);
                      })(f.data.props, a, k),
                      m = yield e.resolveComponentData(
                        cn(cw({}, f.data), cp({ props: l })),
                        "replace"
                      );
                    e.dispatch({
                      type: "replace",
                      data: m.node,
                      destinationIndex: j,
                      destinationZone: g,
                    });
                  });
              return (
                g.current.addEventListener("input", e),
                () => {
                  var a;
                  (null == (a = g.current) || a.removeEventListener("input", e), null == d || d());
                }
              );
            }
          }, [h, g.current, c, i]);
          let [j, k] = (0, ci.useState)(!1),
            [l, m] = (0, ci.useState)(!1);
          return (0, cZ.jsx)("span", {
            className: le(),
            ref: g,
            contentEditable: j || l ? "plaintext-only" : "false",
            onClick: (a) => {
              (a.preventDefault(), a.stopPropagation());
            },
            onClickCapture: (a) => {
              (a.preventDefault(), a.stopPropagation());
              let c = ld(h.getState().state, b);
              h.getState().setUi({ itemSelector: c });
            },
            onKeyDown: (a) => {
              (a.stopPropagation(), ((i && "Enter" === a.key) || d) && a.preventDefault());
            },
            onKeyUp: (a) => {
              (a.stopPropagation(), a.preventDefault());
            },
            onMouseOverCapture: () => k(!0),
            onMouseOutCapture: () => k(!1),
            onFocus: () => m(!0),
            onBlur: () => m(!1),
          });
        }
      ),
      lg = iZ("DropZone", {
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
      lh = (a) => (0, cZ.jsx)(lj, cw({}, a)),
      li = (0, ci.memo)(
        ({
          zoneCompound: a,
          componentId: b,
          index: c,
          dragAxis: d,
          collisionAxis: e,
          inDroppableZone: f,
        }) => {
          var g, h;
          let i = jl((a) => a.metadata),
            j = (0, ci.useContext)(kR),
            { depth: k = 1 } = null != j ? j : {},
            l = (0, ci.useContext)(kS),
            m = jl(
              iV((a) => {
                var c;
                return null == (c = a.state.indexes.nodes[b]) ? void 0 : c.flatData.props;
              })
            ),
            n = jl((a) => {
              var c;
              return null == (c = a.state.indexes.nodes[b]) ? void 0 : c.data.type;
            }),
            o = jl(
              iV((a) => {
                var c;
                return null == (c = a.state.indexes.nodes[b]) ? void 0 : c.data.readOnly;
              })
            ),
            p = jm(),
            q = (0, ci.useMemo)(() => {
              if (m) {
                var c;
                let a;
                return (
                  (a = cN((c = { type: n, props: m }).props)),
                  cn(cw({}, c), cp({ props: a }))
                );
              }
              let d = l.getState().previewIndex[a];
              return b === (null == d ? void 0 : d.props.id)
                ? { type: d.componentType, props: d.props, previewType: d.type, element: d.element }
                : null;
            }, [p, b, a, n, m]),
            r = jl((a) => ((null == q ? void 0 : q.type) ? a.config.components[q.type] : null)),
            s = (0, ci.useMemo)(
              () => ({
                renderDropZone: lh,
                isEditing: !0,
                dragRef: null,
                metadata: cw(cw({}, i), null == r ? void 0 : r.metadata),
              }),
              [i, null == r ? void 0 : r.metadata]
            ),
            t = jl((a) => a.overrides),
            u = jl((a) => {
              var c;
              return (null == (c = a.componentState[b]) ? void 0 : c.loadingCount) > 0;
            }),
            v = jl((a) => {
              var c;
              return (null == (c = a.selectedItem) ? void 0 : c.props.id) === b;
            }),
            w =
              null !=
              (h =
                null != (g = null == r ? void 0 : r.label)
                  ? g
                  : null == q
                    ? void 0
                    : q.type.toString())
                ? h
                : "Component",
            y = (0, ci.useMemo)(
              () =>
                function () {
                  var a;
                  return q && "element" in q && q.element
                    ? (0, cZ.jsx)("div", {
                        dangerouslySetInnerHTML: { __html: q.element.outerHTML },
                      })
                    : (0, cZ.jsx)(k8, {
                        name: w,
                        children: null != (a = t.componentItem) ? a : t.drawerItem,
                      });
                },
              [b, w, t]
            ),
            z = (0, ci.useMemo)(
              () =>
                cn(
                  cw(cw({}, null == r ? void 0 : r.defaultProps), null == q ? void 0 : q.props),
                  cp({ puck: s, editMode: !0 })
                ),
              [null == r ? void 0 : r.defaultProps, null == q ? void 0 : q.props, s]
            ),
            A = (0, ci.useMemo)(() => {
              var a;
              return { type: null != (a = null == q ? void 0 : q.type) ? a : n, props: z };
            }, [null == q ? void 0 : q.type, n, z]),
            B = jl((a) => a.config),
            C = jl((a) => a.plugins),
            D = jl((a) => a.fieldTransforms),
            E = cT(
              B,
              A,
              (0, ci.useMemo)(
                () =>
                  cw(
                    cw(
                      cw(
                        cw(
                          {},
                          cU(lh, (a) => (0, cZ.jsx)(lc, { componentId: b, zone: a.zone }))
                        ),
                        {
                          text: ({
                            value: a,
                            componentId: b,
                            field: c,
                            propPath: d,
                            isReadOnly: e,
                          }) =>
                            c.contentEditable
                              ? (0, cZ.jsx)(lf, {
                                  propPath: d,
                                  componentId: b,
                                  value: a,
                                  opts: { disableLineBreaks: !0 },
                                  isReadOnly: e,
                                })
                              : a,
                          textarea: ({
                            value: a,
                            componentId: b,
                            field: c,
                            propPath: d,
                            isReadOnly: e,
                          }) =>
                            c.contentEditable
                              ? (0, cZ.jsx)(lf, {
                                  propPath: d,
                                  componentId: b,
                                  value: a,
                                  isReadOnly: e,
                                })
                              : a,
                          custom: ({
                            value: a,
                            componentId: b,
                            field: c,
                            propPath: d,
                            isReadOnly: e,
                          }) =>
                            c.contentEditable && "string" == typeof a
                              ? (0, cZ.jsx)(lf, {
                                  propPath: d,
                                  componentId: b,
                                  value: a,
                                  isReadOnly: e,
                                })
                              : a,
                        }
                      ),
                      C.reduce((a, b) => cw(cw({}, a), b.fieldTransforms), {})
                    ),
                    D
                  ),
                [C, D]
              ),
              o,
              u
            );
          if (!q) return;
          let F = r
              ? r.render
              : () =>
                  (0, cZ.jsxs)("div", {
                    style: { padding: 48, textAlign: "center" },
                    children: ["No configuration for ", q.type],
                  }),
            G = q.type,
            H = "previewType" in q && "insert" === q.previewType;
          return (
            H && (F = y),
            (0, cZ.jsx)(k$, {
              id: b,
              componentType: G,
              zoneCompound: a,
              depth: k + 1,
              index: c,
              isLoading: u,
              isSelected: v,
              label: w,
              autoDragAxis: d,
              userDragAxis: e,
              inDroppableZone: f,
              children: (a) => {
                let b, c;
                return (null == r ? void 0 : r.inline) && !H
                  ? (0, cZ.jsx)(cZ.Fragment, {
                      children: (0, cZ.jsx)(
                        F,
                        ((b = cw({}, E)),
                        (c = { puck: cn(cw({}, E.puck), cp({ dragRef: a })) }),
                        cn(b, cp(c)))
                      ),
                    })
                  : (0, cZ.jsx)("div", { ref: a, children: (0, cZ.jsx)(F, cw({}, E)) });
              },
            })
          );
        }
      ),
      lj = (0, ci.forwardRef)(function (
        {
          zone: a,
          allow: b,
          disallow: c,
          style: d,
          className: e,
          minEmptyHeight: f = 128,
          collisionAxis: g,
        },
        h
      ) {
        let i = (0, ci.useContext)(kR),
          j = jm(),
          {
            areaId: k,
            depth: l = 0,
            registerLocalZone: m,
            unregisterLocalZone: n,
          } = null != i ? i : {},
          o = jl(
            iV((a) => {
              var b;
              return k ? (null == (b = a.state.indexes.nodes[k]) ? void 0 : b.path) : null;
            })
          ),
          p = cL;
        k && a !== cL && (p = `${k}:${a}`);
        let q = p === cL || a === cL || "root" === k,
          r = kV(kS, (a) => a.nextAreaDepthIndex[k || ""]),
          s = jl(
            iV((a) => {
              var b;
              return null == (b = a.state.indexes.zones[p]) ? void 0 : b.contentIds;
            })
          ),
          t = jl(
            iV((a) => {
              var b;
              return null == (b = a.state.indexes.zones[p]) ? void 0 : b.type;
            })
          );
        ((0, ci.useEffect)(() => {
          (!t || "dropzone" === t) &&
            (null == i ? void 0 : i.registerZone) &&
            (null == i || i.registerZone(p));
        }, [t, j]),
          (0, ci.useEffect)(() => {
            "dropzone" === t &&
              p !== cL &&
              console.warn(
                "DropZones have been deprecated in favor of slot fields and will be removed in a future version of Puck. Please see the migration guide: https://www.puckeditor.com/docs/guides/migrations/dropzones-to-slots"
              );
          }, [t]));
        let u = (0, ci.useMemo)(() => s || [], [s]),
          v = (0, ci.useRef)(null),
          w = (0, ci.useCallback)(
            (a) => {
              if (!a) return !0;
              if (c) {
                let d = b || [];
                if (-1 !== (c || []).filter((a) => -1 === d.indexOf(a)).indexOf(a)) return !1;
              } else if (b && -1 === b.indexOf(a)) return !1;
              return !0;
            },
            [b, c]
          ),
          y = kV(kS, (a) => {
            var b;
            return w(null == (b = a.draggedItem) ? void 0 : b.data.componentType);
          }),
          z = r || q,
          A = kV(kS, (a) => {
            var b;
            let c = !0;
            return ((c = null != (b = a.zoneDepthIndex[p]) && b) && (c = y), c);
          });
        (0, ci.useEffect)(
          () => (
            m && m(p, y || A),
            () => {
              n && n(p);
            }
          ),
          [y, A, p]
        );
        let [B, C] = ((a, b) => {
            let c = (0, ci.useContext)(kS),
              d = kV(kS, (a) => a.previewIndex[b]),
              e = jl((a) => a.state.ui.isDragging),
              [f, g] = (0, ci.useState)(a),
              [h, i] = (0, ci.useState)(d),
              j = (function (a, b) {
                let c = hO();
                return (0, ci.useCallback)(
                  (...b) =>
                    cy(this, null, function* () {
                      return (yield null == c ? void 0 : c.renderer.rendering, a(...b));
                    }),
                  [...b, c]
                );
              })((a, b, c, d, e) => {
                (!c || e) &&
                  (b
                    ? "insert" === b.type
                      ? g(
                          i1(
                            a.filter((a) => a !== b.props.id),
                            b.index,
                            b.props.id
                          )
                        )
                      : g(
                          i1(
                            a.filter((a) => a !== b.props.id),
                            b.index,
                            b.props.id
                          )
                        )
                    : g(e ? a.filter((a) => a !== d) : a),
                  i(b));
              }, []);
            return (
              (0, ci.useEffect)(() => {
                var b;
                let f = c.getState();
                j(
                  a,
                  d,
                  e,
                  null == (b = f.draggedItem) ? void 0 : b.id,
                  Object.keys(f.previewIndex || {}).length > 0
                );
              }, [a, d, e]),
              [f, h]
            );
          })(u, p),
          D = A && (C ? 1 === B.length : 0 === B.length),
          E = (0, ci.useContext)(kS);
        (0, ci.useEffect)(() => {
          let { enabledIndex: a } = E.getState();
          E.setState({ enabledIndex: cn(cw({}, a), cp({ [p]: A })) });
        }, [A, E, p]);
        let { ref: F } = h3({
            id: p,
            collisionPriority: A ? l : 0,
            disabled: !D,
            collisionDetector: ki,
            type: "dropzone",
            data: { areaId: k, depth: l, isDroppableTarget: y, path: o || [] },
          }),
          G = jl(
            (a) =>
              (null == a ? void 0 : a.selectedItem) &&
              k === (null == a ? void 0 : a.selectedItem.props.id)
          ),
          [H] = ((a, b) => {
            let c = jl((a) => a.status),
              [d, e] = (0, ci.useState)(b || "y"),
              f = (0, ci.useCallback)(() => {
                if (a.current) {
                  let b = window.getComputedStyle(a.current);
                  "grid" === b.display
                    ? e("dynamic")
                    : "flex" === b.display && "row" === b.flexDirection
                      ? e("x")
                      : e("y");
                }
              }, [a.current]);
            return (
              (0, ci.useEffect)(() => {
                let a = () => {
                  f();
                };
                return (
                  window.addEventListener("viewportchange", a),
                  () => {
                    window.removeEventListener("viewportchange", a);
                  }
                );
              }, []),
              (0, ci.useEffect)(f, [c, b]),
              [d, f]
            );
          })(v, g),
          [I, J] = (({ zoneCompound: a, userMinEmptyHeight: b, ref: c }) => {
            let d = jm(),
              [e, f] = (0, ci.useState)(0),
              [g, h] = (0, ci.useState)(!1),
              { draggedItem: i, isZone: j } = kV(kS, (b) => {
                var c, d;
                return {
                  draggedItem:
                    (null == (c = b.draggedItem) ? void 0 : c.data.zone) === a
                      ? b.draggedItem
                      : null,
                  isZone: (null == (d = b.draggedItem) ? void 0 : d.data.zone) === a,
                };
              }),
              k = (0, ci.useRef)(0),
              l = kW(
                (b) => {
                  var c;
                  if (b) {
                    let b = lb(d, a);
                    if ((f(0), b || 0 === k.current)) return void h(!1);
                    let e = d.getState().selectedItem,
                      g = d.getState().state.indexes.zones,
                      i = d.getState().nodes;
                    (null == (c = i.nodes[null == e ? void 0 : e.props.id]) ||
                      c.methods.hideOverlay(),
                      setTimeout(() => {
                        var b;
                        (((null == (b = g[a]) ? void 0 : b.contentIds) || []).forEach((a) => {
                          let b = i.nodes[a];
                          null == b || b.methods.sync();
                        }),
                          e &&
                            setTimeout(() => {
                              var a, b;
                              (null == (a = i.nodes[e.props.id]) || a.methods.sync(),
                                null == (b = i.nodes[e.props.id]) || b.methods.showOverlay());
                            }, 200),
                          h(!1));
                      }, 100));
                  }
                },
                [d, e, a]
              );
            return (
              (0, ci.useEffect)(() => {
                if (i && c.current && j) {
                  let b = c.current.getBoundingClientRect();
                  return ((k.current = lb(d, a)), f(b.height), h(!0), l());
                }
              }, [c.current, i, l]),
              [e || b, g]
            );
          })({ zoneCompound: p, userMinEmptyHeight: f, ref: v });
        return (0, cZ.jsx)("div", {
          className: `${lg({ isRootZone: q, hoveringOverArea: z, isEnabled: A, isAreaSelected: G, hasChildren: u.length > 0, isAnimating: J })}${e ? ` ${e}` : ""}`,
          ref: (a) => {
            [v, F, h].forEach((b) => {
              "function" == typeof b
                ? b(a)
                : b && "object" == typeof b && "current" in b && (b.current = a);
            });
          },
          "data-testid": `dropzone:${p}`,
          "data-puck-dropzone": p,
          style: cn(
            cw({}, d),
            cp({
              "--min-empty-height": `${I}px`,
              backgroundColor: null == d ? void 0 : d.backgroundColor,
            })
          ),
          children: B.map((a, b) =>
            (0, cZ.jsx)(
              li,
              {
                zoneCompound: p,
                componentId: a,
                dragAxis: H,
                index: b,
                collisionAxis: g,
                inDroppableZone: y,
              },
              a
            )
          ),
        });
      }),
      lk = ({ config: a, item: b, metadata: c }) => {
        let d,
          e,
          f = a.components[b.type],
          g = cV(a, b, (b) => (0, cZ.jsx)(cW, cn(cw({}, b), cp({ config: a, metadata: c })))),
          h = (0, ci.useMemo)(() => ({ areaId: g.id, depth: 1 }), [g]);
        return (0, cZ.jsx)(
          kU,
          {
            value: h,
            children: (0, cZ.jsx)(
              f.render,
              ((d = cw({}, g)),
              (e = {
                puck: cn(
                  cw({}, g.puck),
                  cp({ renderDropZone: ll, metadata: cw(cw({}, c), f.metadata) })
                ),
              }),
              cn(d, cp(e)))
            ),
          },
          g.id
        );
      },
      ll = (a) => (0, cZ.jsx)(lm, cw({}, a)),
      lm = (0, ci.forwardRef)(function ({ className: a, style: b, zone: c }, d) {
        let e = (0, ci.useContext)(kR),
          { areaId: f = "root" } = e || {},
          { config: g, data: h, metadata: i } = (0, ci.useContext)(lp),
          j = `${f}:${c}`,
          k = (null == h ? void 0 : h.content) || [];
        return ((0, ci.useEffect)(() => {
          !k && (null == e ? void 0 : e.registerZone) && (null == e || e.registerZone(j));
        }, [k]),
        h && g)
          ? (j !== cL && (k = cS(h, j).zones[j]),
            (0, cZ.jsx)("div", {
              className: a,
              style: b,
              ref: d,
              children: k.map((a) =>
                g.components[a.type]
                  ? (0, cZ.jsx)(lk, { config: g, item: a, metadata: i }, a.props.id)
                  : null
              ),
            }))
          : null;
      }),
      ln = (a) => (0, cZ.jsx)(lo, cw({}, a)),
      lo = (0, ci.forwardRef)(function (a, b) {
        let c = (0, ci.useContext)(kR);
        if ((null == c ? void 0 : c.mode) === "edit")
          return (0, cZ.jsx)(cZ.Fragment, {
            children: (0, cZ.jsx)(lj, cn(cw({}, a), cp({ ref: b }))),
          });
        return (0, cZ.jsx)(cZ.Fragment, {
          children: (0, cZ.jsx)(lm, cn(cw({}, a), cp({ ref: b }))),
        });
      }),
      lp = ci.default.createContext({
        config: { components: {} },
        data: { root: {}, content: [] },
        metadata: {},
      });
    function lq({ config: a, data: b, metadata: c = {} }) {
      var d;
      let e = cn(cw({}, b), cp({ root: b.root || {}, content: b.content || [] })),
        f = "props" in e.root ? e.root.props : e.root,
        g = (null == f ? void 0 : f.title) || "",
        h = cV(
          a,
          {
            type: "root",
            props: cn(
              cw({}, f),
              cp({
                puck: { renderDropZone: ln, isEditing: !1, dragRef: null, metadata: c },
                title: g,
                editMode: !1,
                id: "puck-root",
              })
            ),
          },
          (b) => (0, cZ.jsx)(cY, cn(cw({}, b), cp({ config: a, metadata: c })))
        ),
        i = (0, ci.useMemo)(() => ({ mode: "render", depth: 0 }), []);
      if (null == (d = a.root) ? void 0 : d.render)
        return (0, cZ.jsx)(lp.Provider, {
          value: { config: a, data: e, metadata: c },
          children: (0, cZ.jsx)(kU, {
            value: i,
            children: (0, cZ.jsx)(
              a.root.render,
              cn(cw({}, h), cp({ children: (0, cZ.jsx)(ll, { zone: cK }) }))
            ),
          }),
        });
      return (0, cZ.jsx)(lp.Provider, {
        value: { config: a, data: e, metadata: c },
        children: (0, cZ.jsx)(kU, { value: i, children: (0, cZ.jsx)(ll, { zone: cK }) }),
      });
    }
    cz();
    var lr = (a) => {
        let b = {
          back: a.history.back,
          forward: a.history.forward,
          setHistories: a.history.setHistories,
          setHistoryIndex: a.history.setHistoryIndex,
          hasPast: a.history.hasPast(),
          hasFuture: a.history.hasFuture(),
          histories: a.history.histories,
          index: a.history.index,
        };
        return {
          appState: ja(a.state),
          config: a.config,
          dispatch: a.dispatch,
          getPermissions: a.permissions.getPermissions,
          refreshPermissions: a.permissions.refreshPermissions,
          history: b,
          selectedItem: a.selectedItem || null,
          getItemBySelector: (b) => i6(b, a.state),
          getItemById: (b) => a.state.indexes.nodes[b].data,
          getSelectorForId: (b) => ld(a.state, b),
        };
      },
      ls = (0, ci.createContext)(null),
      lt = (a) => ({
        state: a.state,
        config: a.config,
        dispatch: a.dispatch,
        permissions: a.permissions,
        history: a.history,
        selectedItem: a.selectedItem,
      });
    (cz(), cz(), cz(), cz());
    var lu = iZ("SidebarSection", {
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
      lv = ({
        children: a,
        title: b,
        background: c,
        showBreadcrumbs: d,
        noBorderTop: e,
        noPadding: f,
        isLoading: g,
      }) => {
        let h,
          i,
          j,
          k,
          l = jl((a) => a.setUi),
          m =
            ((h = jl((a) => {
              var b;
              return null == (b = a.selectedItem) ? void 0 : b.props.id;
            })),
            (i = jl((a) => a.config)),
            (j = jl((a) => {
              var b;
              return null == (b = a.state.indexes.nodes[h]) ? void 0 : b.path;
            })),
            (k = jm()),
            (0, ci.useMemo)(() => {
              let a =
                (null == j
                  ? void 0
                  : j.map((a) => {
                      var b, c, d;
                      let [e] = a.split(":");
                      if ("root" === e) return { label: "Page", selector: null };
                      let f = k.getState().state.indexes.nodes[e],
                        g = f.path[f.path.length - 1],
                        h = (
                          (null == (b = k.getState().state.indexes.zones[g])
                            ? void 0
                            : b.contentIds) || []
                        ).indexOf(e);
                      return {
                        label: f
                          ? null != (d = null == (c = i.components[f.data.type]) ? void 0 : c.label)
                            ? d
                            : f.data.type
                          : "Component",
                        selector: f ? { index: h, zone: f.path[f.path.length - 1] } : null,
                      };
                    })) || [];
              return a.slice(a.length - 1);
            }, [j, 1]));
        return (0, cZ.jsxs)("div", {
          className: lu({ noBorderTop: e, noPadding: f }),
          style: { background: c },
          children: [
            (0, cZ.jsx)("div", {
              className: lu("title"),
              children: (0, cZ.jsxs)("div", {
                className: lu("breadcrumbs"),
                children: [
                  d
                    ? m.map((a, b) =>
                        (0, cZ.jsxs)(
                          "div",
                          {
                            className: lu("breadcrumb"),
                            children: [
                              (0, cZ.jsx)("button", {
                                type: "button",
                                className: lu("breadcrumbLabel"),
                                onClick: () => l({ itemSelector: a.selector }),
                                children: a.label,
                              }),
                              (0, cZ.jsx)(jJ, { size: 16 }),
                            ],
                          },
                          b
                        )
                      )
                    : null,
                  (0, cZ.jsx)("div", {
                    className: lu("heading"),
                    children: (0, cZ.jsx)(kz, { rank: "2", size: "xs", children: b }),
                  }),
                ],
              }),
            }),
            (0, cZ.jsx)("div", { className: lu("content"), children: a }),
            g &&
              (0, cZ.jsx)("div", {
                className: lu("loadingOverlay"),
                children: (0, cZ.jsx)(jw, { size: 32 }),
              }),
          ],
        });
      };
    cz();
    var lw = {
      Puck: "_Puck_1yxlw_19",
      "Puck-portal": "_Puck-portal_1yxlw_31",
      "PuckLayout-inner": "_PuckLayout-inner_1yxlw_38",
      "PuckLayout--mounted": "_PuckLayout--mounted_1yxlw_59",
      "PuckLayout--leftSideBarVisible": "_PuckLayout--leftSideBarVisible_1yxlw_63",
      "PuckLayout--rightSideBarVisible": "_PuckLayout--rightSideBarVisible_1yxlw_69",
      "PuckLayout-mounted": "_PuckLayout-mounted_1yxlw_83",
      PuckLayout: "_PuckLayout_1yxlw_38",
    };
    (cz(), cz());
    var lx = iZ("PuckFields", {
        PuckFields: "_PuckFields_10bh7_1",
        "PuckFields--isLoading": "_PuckFields--isLoading_10bh7_6",
        "PuckFields-loadingOverlay": "_PuckFields-loadingOverlay_10bh7_10",
        "PuckFields-loadingOverlayInner": "_PuckFields-loadingOverlayInner_10bh7_25",
        "PuckFields-field": "_PuckFields-field_10bh7_32",
        "PuckFields--wrapFields": "_PuckFields--wrapFields_10bh7_36",
      }),
      ly = ({ children: a }) => (0, cZ.jsx)(cZ.Fragment, { children: a }),
      lz = (0, ci.memo)(({ fieldName: a }) => {
        let b = jl((b) => b.fields.fields[a]),
          c = jl(
            (b) =>
              ((b.selectedItem ? b.selectedItem.readOnly : b.state.data.root.readOnly) || {})[a]
          ),
          d = jl((b) => {
            let c = b.state.data.root.props || b.state.data.root;
            return b.selectedItem ? b.selectedItem.props[a] : c[a];
          }),
          e = jl((c) =>
            b
              ? c.selectedItem
                ? `${c.selectedItem.props.id}_${b.type}_${a}`
                : `root_${b.type}_${a}`
              : null
          ),
          f = jl(
            iV((a) => {
              let { selectedItem: b, permissions: c } = a;
              return b ? c.getPermissions({ item: b }) : c.getPermissions({ root: !0 });
            })
          ),
          g = jm(),
          h = (0, ci.useCallback)(
            (b, c) =>
              cy(void 0, null, function* () {
                let {
                    dispatch: d,
                    state: e,
                    selectedItem: f,
                    resolveComponentData: h,
                  } = g.getState(),
                  { data: i, ui: j } = e,
                  { itemSelector: k } = j,
                  l = i.root.props || i.root,
                  m = cn(cw({}, f ? f.props : l), cp({ [a]: b }));
                d(
                  f && k
                    ? {
                        type: "replace",
                        destinationIndex: k.index,
                        destinationZone: k.zone || cL,
                        data: (yield h(cn(cw({}, f), cp({ props: m })), "replace")).node,
                        ui: c,
                      }
                    : i.root.props
                      ? {
                          type: "replaceRoot",
                          root: (yield h(cn(cw({}, i.root), cp({ props: m })), "replace")).node,
                          ui: cw(cw({}, j), c),
                          recordHistory: !0,
                        }
                      : { type: "setData", data: { root: m } }
                );
              }),
            [a]
          ),
          { visible: i = !0 } = null != b ? b : {};
        return b && e && i && "slot" !== b.type
          ? (0, cZ.jsx)(
              "div",
              {
                className: lx("field"),
                children: (0, cZ.jsx)(kP, {
                  field: b,
                  name: a,
                  id: e,
                  readOnly: !f.edit || c,
                  value: d,
                  onChange: h,
                }),
              },
              e
            )
          : null;
      }),
      lA = (0, ci.memo)(({ wrapFields: a = !0 }) => {
        var b;
        let c,
          d = jl((a) => a.overrides),
          e = jl((a) => {
            var b, c;
            let d = a.selectedItem
              ? null == (b = a.componentState[a.selectedItem.props.id])
                ? void 0
                : b.loadingCount
              : null == (c = a.componentState.root)
                ? void 0
                : c.loadingCount;
            return (null != d ? d : 0) > 0;
          }),
          f = jl(iV((a) => a.state.ui.itemSelector)),
          g = jl((a) => {
            var b;
            return null == (b = a.selectedItem) ? void 0 : b.props.id;
          });
        ((b = jm()),
          (c = (0, ci.useCallback)(
            (a) =>
              cy(void 0, null, function* () {
                var c, d;
                let { fields: e, lastResolvedData: f } = b.getState().fields,
                  h = b.getState().state.indexes.nodes,
                  i = h[g || "root"],
                  j = null == i ? void 0 : i.data,
                  k = (null == i ? void 0 : i.parentId) ? h[i.parentId] : null,
                  l = (null == k ? void 0 : k.data) || null,
                  { getComponentConfig: m, state: n } = b.getState(),
                  o = m(null == j ? void 0 : j.type);
                if (!j || !o) return;
                let p = o.fields || {},
                  q = o.resolveFields,
                  r = e;
                if (
                  (a &&
                    (b.setState((a) => ({
                      fields: cn(cw({}, a.fields), cp({ fields: p, id: g })),
                    })),
                    (r = p)),
                  q)
                ) {
                  let a = setTimeout(() => {
                      b.setState((a) => ({ fields: cn(cw({}, a.fields), cp({ loading: !0 })) }));
                    }, 50),
                    e = (null == (c = f.props) ? void 0 : c.id) === g ? f : null,
                    h = cP(j, e),
                    i = yield q(j, {
                      changed: h,
                      fields: p,
                      lastFields: r,
                      lastData: e,
                      appState: ja(n),
                      parent: l,
                    });
                  if (
                    (clearTimeout(a),
                    (null == (d = b.getState().selectedItem) ? void 0 : d.props.id) !== g)
                  )
                    return;
                  b.setState({ fields: { fields: i, loading: !1, lastResolvedData: j, id: g } });
                } else
                  b.setState((a) => ({ fields: cn(cw({}, a.fields), cp({ fields: p, id: g })) }));
              }),
            [g]
          )),
          (0, ci.useEffect)(
            () => (
              c(!0),
              b.subscribe(
                (a) => a.state.indexes.nodes[g || "root"],
                () => c()
              )
            ),
            [g]
          ));
        let h = jl((a) => a.fields.loading),
          i = jl(iV((a) => (a.fields.id === g ? Object.keys(a.fields.fields) : []))),
          j = h || e,
          k = (0, ci.useMemo)(() => d.fields || ly, [d]);
        return (0, cZ.jsxs)("form", {
          className: lx({ wrapFields: a }),
          onSubmit: (a) => {
            a.preventDefault();
          },
          children: [
            (0, cZ.jsx)(k, {
              isLoading: j,
              itemSelector: f,
              children: i.map((a) => (0, cZ.jsx)(lz, { fieldName: a }, a)),
            }),
            j &&
              (0, cZ.jsx)("div", {
                className: lx("loadingOverlay"),
                children: (0, cZ.jsx)("div", {
                  className: lx("loadingOverlayInner"),
                  children: (0, cZ.jsx)(jw, { size: 16 }),
                }),
              }),
          ],
        });
      });
    (cz(), cz(), cz(), cz());
    var lB = iZ("ComponentList", {
        ComponentList: "_ComponentList_1rrlt_1",
        "ComponentList--isExpanded": "_ComponentList--isExpanded_1rrlt_5",
        "ComponentList-content": "_ComponentList-content_1rrlt_9",
        "ComponentList-title": "_ComponentList-title_1rrlt_17",
        "ComponentList-titleIcon": "_ComponentList-titleIcon_1rrlt_53",
      }),
      lC = ({ name: a, label: b }) => {
        var c;
        let d = jl((a) => a.overrides),
          e = jl((b) => b.permissions.getPermissions({ type: a }).insert);
        return (
          (0, ci.useEffect)(() => {
            d.componentItem &&
              console.warn(
                "The `componentItem` override has been deprecated and renamed to `drawerItem`"
              );
          }, [d]),
          (0, cZ.jsx)(la.Item, {
            label: b,
            name: a,
            isDragDisabled: !e,
            children: null != (c = d.componentItem) ? c : d.drawerItem,
          })
        );
      },
      lD = ({ children: a, title: b, id: c }) => {
        let d = jl((a) => a.config),
          e = jl((a) => a.setUi),
          f = jl((a) => a.state.ui.componentList),
          { expanded: g = !0 } = f[c] || {};
        return (0, cZ.jsxs)("div", {
          className: lB({ isExpanded: g }),
          children: [
            b &&
              (0, cZ.jsxs)("button", {
                type: "button",
                className: lB("title"),
                onClick: () => {
                  let a, b;
                  return e({
                    componentList:
                      ((a = cw({}, f)),
                      (b = { [c]: cn(cw({}, f[c]), cp({ expanded: !g })) }),
                      cn(a, cp(b))),
                  });
                },
                title: g ? `Collapse${b ? ` ${b}` : ""}` : `Expand${b ? ` ${b}` : ""}`,
                children: [
                  (0, cZ.jsx)("div", { children: b }),
                  (0, cZ.jsx)("div", {
                    className: lB("titleIcon"),
                    children: g ? (0, cZ.jsx)(jK, { size: 12 }) : (0, cZ.jsx)(jI, { size: 12 }),
                  }),
                ],
              }),
            (0, cZ.jsx)("div", {
              className: lB("content"),
              children: (0, cZ.jsx)(la, {
                children:
                  a ||
                  Object.keys(d.components).map((a) => {
                    var b;
                    return (0, cZ.jsx)(
                      lC,
                      { label: null != (b = d.components[a].label) ? b : a, name: a },
                      a
                    );
                  }),
              }),
            }),
          ],
        });
      };
    lD.Item = lC;
    var lE = () => {
      let a = jl((a) => a.overrides),
        b = (() => {
          let [a, b] = (0, ci.useState)(),
            c = jl((a) => a.config),
            d = jl((a) => a.state.ui.componentList);
          return (
            (0, ci.useEffect)(() => {
              var a, e, f;
              if (Object.keys(d).length > 0) {
                let g,
                  h = [];
                g = Object.entries(d).map(([a, b]) =>
                  b.components
                    ? (b.components.forEach((a) => {
                        h.push(a);
                      }),
                      !1 === b.visible)
                      ? null
                      : (0, cZ.jsx)(
                          lD,
                          {
                            id: a,
                            title: b.title || a,
                            children: b.components.map((a, b) => {
                              var d;
                              let e = c.components[a] || {};
                              return (0, cZ.jsx)(
                                lD.Item,
                                { label: null != (d = e.label) ? d : a, name: a, index: b },
                                a
                              );
                            }),
                          },
                          a
                        )
                    : null
                );
                let i = Object.keys(c.components).filter((a) => -1 === h.indexOf(a));
                (!(i.length > 0) ||
                  (null == (a = d.other) ? void 0 : a.components) ||
                  (null == (e = d.other) ? void 0 : e.visible) === !1 ||
                  g.push(
                    (0, cZ.jsx)(
                      lD,
                      {
                        id: "other",
                        title: (null == (f = d.other) ? void 0 : f.title) || "Other",
                        children: i.map((a, b) => {
                          var d;
                          let e = c.components[a] || {};
                          return (0, cZ.jsx)(
                            lD.Item,
                            { name: a, label: null != (d = e.label) ? d : a, index: b },
                            a
                          );
                        }),
                      },
                      "other"
                    )
                  ),
                  b(g));
              }
            }, [c.categories, c.components, d]),
            a
          );
        })(),
        c = (0, ci.useMemo)(
          () => (
            a.components &&
              console.warn("The `components` override has been deprecated and renamed to `drawer`"),
            a.components || a.drawer || "div"
          ),
          [a]
        );
      return (0, cZ.jsx)(c, { children: b || (0, cZ.jsx)(lD, { id: "all" }) });
    };
    (cz(), cz());
    var lF = 'style, link[rel="stylesheet"]',
      lG = (a) => Array.from(document.styleSheets).find((b) => b.ownerNode.href === a.href),
      lH = (a, b) => {
        let c = a.attributes;
        (null == c ? void 0 : c.length) > 0 &&
          Array.from(c).forEach((a) => {
            b.setAttribute(a.name, a.value);
          });
      },
      lI = ({ children: a, debug: b = !1, onStylesLoaded: c = () => null }) => {
        let { document: d, window: e } = lK();
        return (
          (0, ci.useEffect)(() => {
            let a;
            if (!e || !d) return () => {};
            let f = [],
              g = {},
              h = (a) => f.findIndex((b) => b.original === a),
              i = (a, c = !1) =>
                cy(void 0, null, function* () {
                  let d;
                  if ("LINK" === a.nodeName && c) {
                    (d = document.createElement("style")).type = "text/css";
                    let c = lG(a);
                    c ||
                      (yield new Promise((b) => {
                        let c = () => {
                          (b(), a.removeEventListener("load", c));
                        };
                        a.addEventListener("load", c);
                      }),
                      (c = lG(a)));
                    let e = ((a) => {
                      if (a)
                        try {
                          return [...Array.from(a.cssRules)].map((a) => a.cssText).join("");
                        } catch (b) {
                          console.warn("Access to stylesheet %s is denied. Ignoring…", a.href);
                        }
                      return "";
                    })(c);
                    if (!e) {
                      b &&
                        console.warn(
                          "Tried to load styles for link element, but couldn't find them. Skipping..."
                        );
                      return;
                    }
                    ((d.innerHTML = e), d.setAttribute("data-href", a.getAttribute("href")));
                  } else d = a.cloneNode(!0);
                  return d;
                }),
              j = new MutationObserver((a) => {
                a.forEach((a) => {
                  "childList" === a.type &&
                    (a.addedNodes.forEach((a) => {
                      if (a.nodeType === Node.TEXT_NODE || a.nodeType === Node.ELEMENT_NODE) {
                        let c = a.nodeType === Node.TEXT_NODE ? a.parentElement : a;
                        c &&
                          c.matches(lF) &&
                          setTimeout(
                            () =>
                              cy(void 0, null, function* () {
                                let a = h(c);
                                if (a > -1) {
                                  (b &&
                                    console.log(
                                      "Tried to add an element that was already mirrored. Updating instead..."
                                    ),
                                    (f[a].mirror.innerText = c.innerText));
                                  return;
                                }
                                let e = yield i(c);
                                if (!e) return;
                                let j = (0, iW.default)(e.outerHTML);
                                if (g[j]) {
                                  b &&
                                    console.log(
                                      "iframe already contains element that is being mirrored. Skipping..."
                                    );
                                  return;
                                }
                                ((g[j] = !0),
                                  d.head.append(e),
                                  f.push({ original: c, mirror: e }),
                                  b && console.log(`Added style node ${c.outerHTML}`));
                              }),
                            0
                          );
                      }
                    }),
                    a.removedNodes.forEach((a) => {
                      if (a.nodeType === Node.TEXT_NODE || a.nodeType === Node.ELEMENT_NODE) {
                        let c = a.nodeType === Node.TEXT_NODE ? a.parentElement : a;
                        c &&
                          c.matches(lF) &&
                          setTimeout(
                            () =>
                              ((a) => {
                                var c, d;
                                let e = h(a);
                                if (-1 === e) {
                                  b &&
                                    console.log(
                                      "Tried to remove an element that did not exist. Skipping..."
                                    );
                                  return;
                                }
                                let i = (0, iW.default)(a.outerHTML);
                                (null == (d = null == (c = f[e]) ? void 0 : c.mirror) || d.remove(),
                                  delete g[i],
                                  b && console.log(`Removed style node ${a.outerHTML}`));
                              })(c),
                            0
                          );
                      }
                    }));
                });
              }),
              k = e.parent.document,
              l =
                ((a = []),
                k.querySelectorAll(lF).forEach((b) => {
                  "STYLE" === b.tagName ? b.innerHTML.trim() && a.push(b) : a.push(b);
                }),
                a),
              m = [],
              n = 0;
            return (
              lH(k.getElementsByTagName("html")[0], d.documentElement),
              lH(k.getElementsByTagName("body")[0], d.body),
              Promise.all(
                l.map((a, b) =>
                  cy(void 0, null, function* () {
                    if ("LINK" === a.nodeName) {
                      let b = a.href;
                      if (m.indexOf(b) > -1) return;
                      m.push(b);
                    }
                    let b = yield i(a);
                    if (b) return (f.push({ original: a, mirror: b }), b);
                  })
                )
              ).then((a) => {
                let b = a.filter((a) => void 0 !== a);
                (b.forEach((a) => {
                  ((a.onload = () => {
                    (n += 1) >= f.length && c();
                  }),
                    (a.onerror = () => {
                      (console.warn("AutoFrame couldn't load a stylesheet"),
                        (n += 1) >= f.length && c());
                    }));
                }),
                  (d.head.innerHTML = ""),
                  d.head.append(...b),
                  j.observe(k.head, { childList: !0, subtree: !0 }),
                  b.forEach((a) => {
                    g[(0, iW.default)(a.outerHTML)] = !0;
                  }));
              }),
              () => {
                j.disconnect();
              }
            );
          }, []),
          (0, cZ.jsx)(cZ.Fragment, { children: a })
        );
      },
      lJ = (0, ci.createContext)({}),
      lK = () => (0, ci.useContext)(lJ);
    function lL(a) {
      var {
          children: b,
          className: c,
          debug: d,
          id: e,
          onReady: f = () => {},
          onNotReady: g = () => {},
          frameRef: h,
        } = a,
        i = cx(a, ["children", "className", "debug", "id", "onReady", "onNotReady", "frameRef"]);
      let [j, k] = (0, ci.useState)(!1),
        [l, m] = (0, ci.useState)({}),
        [n, o] = (0, ci.useState)(),
        [p, q] = (0, ci.useState)(!1);
      return (
        (0, ci.useEffect)(() => {
          var a;
          if (h.current) {
            let b = h.current.contentDocument,
              c = h.current.contentWindow;
            (m({ document: b || void 0, window: c || void 0 }),
              o(null == (a = h.current.contentDocument) ? void 0 : a.getElementById("frame-root")),
              b && c && p ? f() : g());
          }
        }, [h, j, p]),
        (0, cZ.jsx)(
          "iframe",
          cn(
            cw({}, i),
            cp({
              className: c,
              id: e,
              srcDoc:
                '<!DOCTYPE html><html><head></head><body><div id="frame-root" data-puck-entry></div></body></html>',
              ref: h,
              onLoad: () => {
                k(!0);
              },
              children: (0, cZ.jsx)(lJ.Provider, {
                value: l,
                children:
                  j &&
                  n &&
                  (0, cZ.jsx)(lI, {
                    debug: d,
                    onStylesLoaded: () => q(!0),
                    children: (0, ht.createPortal)(b, n),
                  }),
              }),
            })
          )
        )
      );
    }
    ((lL.displayName = "AutoFrame"), cz());
    var lM = iZ("PuckPreview", {
        PuckPreview: "_PuckPreview_z2rgu_1",
        "PuckPreview-frame": "_PuckPreview-frame_z2rgu_6",
      }),
      lN = ({ id: a = "puck-preview" }) => {
        let b,
          c = jl((a) => a.dispatch),
          d = jl((a) => a.state.data.root),
          e = jl((a) => a.config),
          f = jl((a) => a.setStatus),
          g = jl((a) => a.iframe),
          h = jl((a) => a.overrides),
          i = jl((a) => a.metadata),
          j = jl((a) => ("edit" === a.state.ui.previewMode ? null : a.state.data)),
          k = (0, ci.useCallback)(
            (a) => {
              var b, c;
              let d = cV(e, { type: "root", props: a }, lh);
              return (null == (b = e.root) ? void 0 : b.render)
                ? null == (c = e.root)
                  ? void 0
                  : c.render(cw({ id: "puck-root" }, d))
                : (0, cZ.jsx)(cZ.Fragment, { children: d.children });
            },
            [e]
          ),
          l = (0, ci.useMemo)(() => h.iframe, [h]),
          m = d.props || d,
          n = (0, ci.useRef)(null);
        ((b = jl((a) => a.status)),
          (0, ci.useEffect)(() => {
            if (n.current && "READY" === b) {
              var a;
              let b = n.current,
                c = (a) => {
                  let c = new k2(
                    "pointermove",
                    cn(
                      cw({}, a),
                      cp({
                        bubbles: !0,
                        cancelable: !1,
                        clientX: a.clientX,
                        clientY: a.clientY,
                        originalTarget: a.target,
                      })
                    )
                  );
                  b.dispatchEvent(c);
                },
                d = () => {
                  var a;
                  null == (a = b.contentDocument) || a.removeEventListener("pointermove", c);
                };
              return (
                d(),
                null == (a = b.contentDocument) ||
                  a.addEventListener("pointermove", c, { capture: !0 }),
                () => {
                  d();
                }
              );
            }
          }, [b]));
        let o = j
          ? (0, cZ.jsx)(lq, { data: j, config: e, metadata: i })
          : (0, cZ.jsx)(
              k,
              cn(
                cw({}, m),
                cp({
                  puck: { renderDropZone: ln, isEditing: !0, dragRef: null, metadata: i },
                  editMode: !0,
                  children: (0, cZ.jsx)(ln, { zone: cL }),
                })
              )
            );
        return (
          (0, ci.useEffect)(() => {
            g.enabled || f("READY");
          }, [g.enabled]),
          (0, cZ.jsx)("div", {
            className: lM(),
            id: a,
            "data-puck-preview": !0,
            onClick: (a) => {
              let b = a.target;
              b.hasAttribute("data-puck-component") ||
                b.hasAttribute("data-puck-dropzone") ||
                c({ type: "setUi", ui: { itemSelector: null } });
            },
            children: g.enabled
              ? (0, cZ.jsx)(lL, {
                  id: "preview-frame",
                  className: lM("frame"),
                  "data-rfd-iframe": !0,
                  onReady: () => {
                    f("READY");
                  },
                  onNotReady: () => {
                    f("MOUNTED");
                  },
                  frameRef: n,
                  children: (0, cZ.jsx)(lJ.Consumer, {
                    children: ({ document: a }) =>
                      l ? (0, cZ.jsx)(l, { document: a, children: o }) : o,
                  }),
                })
              : (0, cZ.jsx)("div", {
                  id: "preview-frame",
                  className: lM("frame"),
                  ref: n,
                  "data-puck-entry": !0,
                  children: o,
                }),
          })
        );
      };
    (cz(), cz(), cz());
    var lO = {
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
    (cz(), cz());
    var lP = iZ("LayerTree", lO),
      lQ = iZ("Layer", lO),
      lR = ({ index: a, itemId: b, zoneCompound: c }) => {
        var d;
        let e = jl((a) => a.config),
          f = jl((a) => a.state.ui.itemSelector),
          g = jl((a) => a.dispatch),
          h = (0, ci.useCallback)(
            (a) => {
              g({ type: "setUi", ui: { itemSelector: a } });
            },
            [g]
          ),
          i =
            jl((a) => {
              var b;
              return null == (b = a.selectedItem) ? void 0 : b.props.id;
            }) === b ||
            (f && f.zone === cL && !c),
          j = jl((a) => a.state.indexes.nodes[b]),
          k = jl(
            iV((a) => Object.keys(a.state.indexes.zones).filter((a) => a.split(":")[0] === b))
          ),
          l = k.length > 0,
          m = (0, ci.useContext)(kS),
          n = kV(kS, (a) => a.hoveringComponent === b),
          o = jl((a) => {
            var c, d;
            let e = a.state.indexes.nodes[null == (c = a.selectedItem) ? void 0 : c.props.id];
            return (
              null !=
                (d =
                  null == e
                    ? void 0
                    : e.path.some((a) => {
                        let [c] = a.split(":");
                        return c === b;
                      })) && d
            );
          }),
          p = e.components[j.data.type],
          q = null != (d = null == p ? void 0 : p.label) ? d : j.data.type.toString();
        return (0, cZ.jsxs)("li", {
          className: lQ({ isSelected: i, isHovering: n, containsZone: l, childIsSelected: o }),
          children: [
            (0, cZ.jsx)("div", {
              className: lQ("inner"),
              children: (0, cZ.jsxs)("button", {
                type: "button",
                className: lQ("clickable"),
                onClick: () => {
                  var d;
                  let e, f, g;
                  if (i) return void h(null);
                  let j = k0(),
                    k = null == j ? void 0 : j.querySelector(`[data-puck-component="${b}"]`);
                  k
                    ? ((e = cw({}, k.style)),
                      (k.style.scrollMargin = "256px"),
                      k &&
                        (null == k || k.scrollIntoView({ behavior: "smooth" }),
                        (k.style.scrollMargin = e.scrollMargin || "")),
                      (d = () => {
                        h({ index: a, zone: c });
                      }),
                      (g = function () {
                        (clearTimeout(f),
                          (f = setTimeout(function () {
                            (d(), null == j || j.removeEventListener("scroll", g));
                          }, 50)));
                      }),
                      null == j || j.addEventListener("scroll", g),
                      setTimeout(() => {
                        f || d();
                      }, 50))
                    : h({ index: a, zone: c });
                },
                onMouseEnter: (a) => {
                  (a.stopPropagation(), m.setState({ hoveringComponent: b }));
                },
                onMouseLeave: (a) => {
                  (a.stopPropagation(), m.setState({ hoveringComponent: null }));
                },
                children: [
                  l &&
                    (0, cZ.jsx)("div", {
                      className: lQ("chevron"),
                      title: i ? "Collapse" : "Expand",
                      children: (0, cZ.jsx)(jI, { size: "12" }),
                    }),
                  (0, cZ.jsxs)("div", {
                    className: lQ("title"),
                    children: [
                      (0, cZ.jsx)("div", {
                        className: lQ("icon"),
                        children:
                          "Text" === j.data.type || "Heading" === j.data.type
                            ? (0, cZ.jsx)(j5, { size: "16" })
                            : (0, cZ.jsx)(jS, { size: "16" }),
                      }),
                      (0, cZ.jsx)("div", { className: lQ("name"), children: q }),
                    ],
                  }),
                ],
              }),
            }),
            l &&
              k.map((a) =>
                (0, cZ.jsx)(
                  "div",
                  { className: lQ("zones"), children: (0, cZ.jsx)(lS, { zoneCompound: a }) },
                  a
                )
              ),
          ],
        });
      },
      lS = ({ label: a, zoneCompound: b }) => {
        let c = jl((c) => {
            var d, e, f, g;
            if (a) return a;
            if (b === cL) return;
            let [h, i] = b.split(":"),
              j = null == (d = c.state.indexes.nodes[h]) ? void 0 : d.data.type,
              k = j && j !== cJ ? c.config.components[j] : c.config.root;
            return null !=
              (g =
                null == (f = null == (e = null == k ? void 0 : k.fields) ? void 0 : e[i])
                  ? void 0
                  : f.label)
              ? g
              : i;
          }),
          d = jl(
            iV((a) => {
              var c, d;
              return b &&
                null != (d = null == (c = a.state.indexes.zones[b]) ? void 0 : c.contentIds)
                ? d
                : [];
            })
          );
        return (0, cZ.jsxs)(cZ.Fragment, {
          children: [
            c &&
              (0, cZ.jsxs)("div", {
                className: lP("zoneTitle"),
                children: [
                  (0, cZ.jsx)("div", {
                    className: lP("zoneIcon"),
                    children: (0, cZ.jsx)(jR, { size: "16" }),
                  }),
                  c,
                ],
              }),
            (0, cZ.jsxs)("ul", {
              className: lP(),
              children: [
                0 === d.length &&
                  (0, cZ.jsx)("div", { className: lP("helper"), children: "No items" }),
                d.map((a, c) => (0, cZ.jsx)(lR, { index: c, itemId: a, zoneCompound: b }, a)),
              ],
            }),
          ],
        });
      };
    cz();
    var lT = () => {
      let a = jl((a) => a.overrides.outline),
        b = jl(
          iV((a) => Object.keys(a.state.indexes.zones).filter((a) => "root" === a.split(":")[0]))
        ),
        c = (0, ci.useMemo)(() => a || "div", [a]);
      return (0, cZ.jsx)(c, {
        children: b.map((a) =>
          (0, cZ.jsx)(lS, { label: 1 === b.length ? "" : a.split(":")[1], zoneCompound: a }, a)
        ),
      });
    };
    (cz(), cz(), cz());
    var lU = {
        ViewportControls: "_ViewportControls_gejzr_1",
        "ViewportControls-divider": "_ViewportControls-divider_gejzr_15",
        "ViewportControls-zoomSelect": "_ViewportControls-zoomSelect_gejzr_21",
        "ViewportButton--isActive": "_ViewportButton--isActive_gejzr_38",
        "ViewportButton-inner": "_ViewportButton-inner_gejzr_38",
      },
      lV = {
        Smartphone: (0, cZ.jsx)(j2, { size: 16 }),
        Tablet: (0, cZ.jsx)(j3, { size: 16 }),
        Monitor: (0, cZ.jsx)(jX, { size: 16 }),
      },
      lW = iZ("ViewportControls", lU),
      lX = iZ("ViewportButton", lU),
      lY = ({ children: a, height: b = "auto", title: c, width: d, onClick: e }) => {
        let f = jl((a) => a.state.ui.viewports),
          [g, h] = (0, ci.useState)(!1);
        return (
          (0, ci.useEffect)(() => {
            h(d === f.current.width);
          }, [d, f.current.width]),
          (0, cZ.jsx)("span", {
            className: lX({ isActive: g }),
            children: (0, cZ.jsx)(jy, {
              type: "button",
              title: c,
              disabled: g,
              onClick: (a) => {
                (a.stopPropagation(), e({ width: d, height: b }));
              },
              children: (0, cZ.jsx)("span", { className: lX("inner"), children: a }),
            }),
          })
        );
      },
      lZ = [
        { label: "25%", value: 0.25 },
        { label: "50%", value: 0.5 },
        { label: "75%", value: 0.75 },
        { label: "100%", value: 1 },
        { label: "125%", value: 1.25 },
        { label: "150%", value: 1.5 },
        { label: "200%", value: 2 },
      ],
      l$ = ({ autoZoom: a, zoom: b, onViewportChange: c, onZoom: d }) => {
        var e, f;
        let g = jl((a) => a.viewports),
          h = lZ.find((b) => b.value === a),
          i = (0, ci.useMemo)(
            () =>
              [...lZ, ...(h ? [] : [{ value: a, label: `${(100 * a).toFixed(0)}% (Auto)` }])]
                .filter((b) => b.value <= a)
                .sort((a, b) => (a.value > b.value ? 1 : -1)),
            [a]
          );
        return (0, cZ.jsxs)("div", {
          className: lW(),
          children: [
            g.map((a, b) =>
              (0, cZ.jsx)(
                lY,
                {
                  height: a.height,
                  width: a.width,
                  title: a.label ? `Switch to ${a.label} viewport` : "Switch viewport",
                  onClick: c,
                  children:
                    "string" == typeof a.icon ? lV[a.icon] || a.icon : a.icon || lV.Smartphone,
                },
                b
              )
            ),
            (0, cZ.jsx)("div", { className: lW("divider") }),
            (0, cZ.jsx)(jy, {
              type: "button",
              title: "Zoom viewport out",
              disabled: b <= (null == (e = i[0]) ? void 0 : e.value),
              onClick: (a) => {
                (a.stopPropagation(),
                  d(i[Math.max(i.findIndex((a) => a.value === b) - 1, 0)].value));
              },
              children: (0, cZ.jsx)(j8, { size: 16 }),
            }),
            (0, cZ.jsx)(jy, {
              type: "button",
              title: "Zoom viewport in",
              disabled: b >= (null == (f = i[i.length - 1]) ? void 0 : f.value),
              onClick: (a) => {
                (a.stopPropagation(),
                  d(i[Math.min(i.findIndex((a) => a.value === b) + 1, i.length - 1)].value));
              },
              children: (0, cZ.jsx)(j7, { size: 16 }),
            }),
            (0, cZ.jsx)("div", { className: lW("divider") }),
            (0, cZ.jsx)("select", {
              className: lW("zoomSelect"),
              value: b.toString(),
              onClick: (a) => {
                a.stopPropagation();
              },
              onChange: (a) => {
                d(parseFloat(a.currentTarget.value));
              },
              children: i.map((a) =>
                (0, cZ.jsx)("option", { value: a.value, label: a.label }, a.label)
              ),
            }),
          ],
        });
      };
    (cz(), cz());
    var l_ = (0, ci.createContext)(null),
      l0 = ({ children: a }) => {
        let b = (0, ci.useRef)(null),
          c = (0, ci.useMemo)(() => ({ frameRef: b }), []);
        return (0, cZ.jsx)(l_.Provider, { value: c, children: a });
      },
      l1 = () => {
        let a = (0, ci.useContext)(l_);
        if (null === a) throw Error("useCanvasFrame must be used within a FrameProvider");
        return a;
      },
      l2 = iZ("PuckCanvas", {
        PuckCanvas: "_PuckCanvas_18jay_1",
        "PuckCanvas-controls": "_PuckCanvas-controls_18jay_16",
        "PuckCanvas-inner": "_PuckCanvas-inner_18jay_21",
        "PuckCanvas-root": "_PuckCanvas-root_18jay_30",
        "PuckCanvas--ready": "_PuckCanvas--ready_18jay_55",
        "PuckCanvas-loader": "_PuckCanvas-loader_18jay_60",
        "PuckCanvas--showLoader": "_PuckCanvas--showLoader_18jay_70",
      }),
      l3 = () => {
        let { frameRef: a } = l1(),
          b = ju(a),
          {
            dispatch: c,
            overrides: d,
            setUi: e,
            zoomConfig: f,
            setZoomConfig: g,
            status: h,
            iframe: i,
          } = jl(
            iV((a) => ({
              dispatch: a.dispatch,
              overrides: a.overrides,
              setUi: a.setUi,
              zoomConfig: a.zoomConfig,
              setZoomConfig: a.setZoomConfig,
              status: a.status,
              iframe: a.iframe,
            }))
          ),
          {
            leftSideBarVisible: j,
            rightSideBarVisible: k,
            leftSideBarWidth: l,
            rightSideBarWidth: m,
            viewports: n,
          } = jl(
            iV((a) => ({
              leftSideBarVisible: a.state.ui.leftSideBarVisible,
              rightSideBarVisible: a.state.ui.rightSideBarVisible,
              leftSideBarWidth: a.state.ui.leftSideBarWidth,
              rightSideBarWidth: a.state.ui.rightSideBarWidth,
              viewports: a.state.ui.viewports,
            }))
          ),
          [o, p] = (0, ci.useState)(!1),
          q = (0, ci.useRef)(!1),
          r = (0, ci.useMemo)(
            () =>
              ({ children: a }) =>
                (0, cZ.jsx)(cZ.Fragment, { children: a }),
            []
          ),
          s = (0, ci.useMemo)(() => d.preview || r, [d]),
          t = (0, ci.useCallback)(() => {
            if (a.current) {
              let b = jt(a.current);
              return { width: b.contentBox.width, height: b.contentBox.height };
            }
            return { width: 0, height: 0 };
          }, [a]);
        ((0, ci.useEffect)(() => {
          b();
        }, [a, j, k, l, m, n]),
          (0, ci.useEffect)(() => {
            let { height: a } = t();
            "auto" === n.current.height && g(cn(cw({}, f), cp({ rootHeight: a / f.zoom })));
          }, [f.zoom, t, g]),
          (0, ci.useEffect)(() => {
            b();
          }, [n.current.width, n]),
          (0, ci.useEffect)(() => {
            if (!a.current) return;
            let c = new ResizeObserver(() => {
              q.current || b();
            });
            return (
              c.observe(a.current),
              () => {
                c.disconnect();
              }
            );
          }, [a.current]));
        let [u, v] = (0, ci.useState)(!1);
        return (
          (0, ci.useEffect)(() => {
            setTimeout(() => {
              v(!0);
            }, 500);
          }, []),
          (0, cZ.jsxs)("div", {
            className: l2({
              ready: "READY" === h || !i.enabled || !i.waitForStyles,
              showLoader: u,
            }),
            onClick: (a) => {
              let b = a.target;
              b.hasAttribute("data-puck-component") ||
                b.hasAttribute("data-puck-dropzone") ||
                c({ type: "setUi", ui: { itemSelector: null }, recordHistory: !0 });
            },
            children: [
              n.controlsVisible &&
                i.enabled &&
                (0, cZ.jsx)("div", {
                  className: l2("controls"),
                  children: (0, cZ.jsx)(l$, {
                    autoZoom: f.autoZoom,
                    zoom: f.zoom,
                    onViewportChange: (a) => {
                      (p(!0), (q.current = !0));
                      let c = cn(cw({}, a), cp({ height: a.height || "auto", zoom: f.zoom }));
                      (e({ viewports: cn(cw({}, n), cp({ current: c })) }),
                        b({ viewports: cn(cw({}, n), cp({ current: c })) }));
                    },
                    onZoom: (a) => {
                      (p(!0), (q.current = !0), g(cn(cw({}, f), cp({ zoom: a }))));
                    },
                  }),
                }),
              (0, cZ.jsxs)("div", {
                className: l2("inner"),
                ref: a,
                children: [
                  (0, cZ.jsx)("div", {
                    className: l2("root"),
                    style: {
                      width: i.enabled ? n.current.width : "100%",
                      height: f.rootHeight,
                      transform: i.enabled ? `scale(${f.zoom})` : void 0,
                      transition: o
                        ? "width 150ms ease-out, height 150ms ease-out, transform 150ms ease-out"
                        : "",
                      overflow: i.enabled ? void 0 : "auto",
                    },
                    suppressHydrationWarning: !0,
                    id: "puck-canvas-root",
                    onTransitionEnd: () => {
                      (p(!1), (q.current = !1));
                    },
                    children: (0, cZ.jsx)(s, { children: (0, cZ.jsx)(lN, {}) }),
                  }),
                  (0, cZ.jsx)("div", {
                    className: l2("loader"),
                    children: (0, cZ.jsx)(jw, { size: 24 }),
                  }),
                ],
              }),
            ],
          })
        );
      };
    (cz(), cz(), cz());
    var l4 = ({ children: a }) => (0, cZ.jsx)(cZ.Fragment, { children: a });
    (cz(), cz(), cz(), cz(), cz());
    var l5 = iZ("MenuBar", {
      MenuBar: "_MenuBar_8pf8c_1",
      "MenuBar--menuOpen": "_MenuBar--menuOpen_8pf8c_14",
      "MenuBar-inner": "_MenuBar-inner_8pf8c_29",
      "MenuBar-history": "_MenuBar-history_8pf8c_45",
    });
    function l6({ menuOpen: a = !1, renderHeaderActions: b, setMenuOpen: c }) {
      let d = jl((a) => a.history.back),
        e = jl((a) => a.history.forward),
        f = jl((a) => a.history.hasFuture()),
        g = jl((a) => a.history.hasPast());
      return (0, cZ.jsx)("div", {
        className: l5({ menuOpen: a }),
        onClick: (a) => {
          var b;
          let d = a.target;
          !window.matchMedia("(min-width: 638px)").matches &&
            "A" === d.tagName &&
            (null == (b = d.getAttribute("href")) ? void 0 : b.startsWith("#")) &&
            c(!1);
        },
        children: (0, cZ.jsxs)("div", {
          className: l5("inner"),
          children: [
            (0, cZ.jsxs)("div", {
              className: l5("history"),
              children: [
                (0, cZ.jsx)(jy, {
                  type: "button",
                  title: "undo",
                  disabled: !g,
                  onClick: d,
                  children: (0, cZ.jsx)(j6, { size: 21 }),
                }),
                (0, cZ.jsx)(jy, {
                  type: "button",
                  title: "redo",
                  disabled: !f,
                  onClick: e,
                  children: (0, cZ.jsx)(j_, { size: 21 }),
                }),
              ],
            }),
            (0, cZ.jsx)(cZ.Fragment, { children: b && b() }),
          ],
        }),
      });
    }
    cz();
    var l7 = iZ("PuckHeader", {
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
      l8 = (0, ci.memo)(() => {
        let {
            onPublish: a,
            renderHeader: b,
            renderHeaderActions: c,
            headerTitle: d,
            headerPath: e,
            iframe: f,
          } = mj(),
          g = jl((a) => a.dispatch),
          h = jm(),
          i = (0, ci.useMemo)(
            () =>
              b
                ? (console.warn(
                    "`renderHeader` is deprecated. Please use `overrides.header` and the `usePuck` hook instead"
                  ),
                  (a) => {
                    var { actions: c } = a,
                      d = cx(a, ["actions"]);
                    let e = jl((a) => a.state);
                    return (0, cZ.jsx)(
                      b,
                      cn(cw({}, d), cp({ dispatch: g, state: e, children: c }))
                    );
                  })
                : l4,
            [b]
          ),
          j = (0, ci.useMemo)(
            () =>
              c
                ? (console.warn(
                    "`renderHeaderActions` is deprecated. Please use `overrides.headerActions` and the `usePuck` hook instead."
                  ),
                  (a) => {
                    let b = jl((a) => a.state);
                    return (0, cZ.jsx)(c, cn(cw({}, a), cp({ dispatch: g, state: b })));
                  })
                : l4,
            [c]
          ),
          k = jl((a) => a.overrides.header || i),
          l = jl((a) => a.overrides.headerActions || j),
          [m, n] = (0, ci.useState)(!1),
          o = jl((a) => {
            var b, c;
            return null !=
              (c = (null == (b = a.state.indexes.nodes.root) ? void 0 : b.data).props.title)
              ? c
              : "";
          }),
          p = jl((a) => a.state.ui.leftSideBarVisible),
          q = jl((a) => a.state.ui.rightSideBarVisible),
          r = (0, ci.useCallback)(
            (a) => {
              let b = window.matchMedia("(min-width: 638px)").matches,
                c = "left" === a ? p : q;
              g({
                type: "setUi",
                ui: cw(
                  { [`${a}SideBarVisible`]: !c },
                  b ? {} : { ["left" === a ? "rightSideBarVisible" : "leftSideBarVisible"]: !1 }
                ),
              });
            },
            [g, p, q]
          );
        return (0, cZ.jsx)(k, {
          actions: (0, cZ.jsx)(cZ.Fragment, {
            children: (0, cZ.jsx)(l, {
              children: (0, cZ.jsx)(jB, {
                onClick: () => {
                  let b = h.getState().state.data;
                  a && a(b);
                },
                icon: (0, cZ.jsx)(jP, { size: "14px" }),
                children: "Publish",
              }),
            }),
          }),
          children: (0, cZ.jsx)("header", {
            className: l7({ leftSideBarVisible: p, rightSideBarVisible: q }),
            children: (0, cZ.jsxs)("div", {
              className: l7("inner"),
              children: [
                (0, cZ.jsxs)("div", {
                  className: l7("toggle"),
                  children: [
                    (0, cZ.jsx)("div", {
                      className: l7("leftSideBarToggle"),
                      children: (0, cZ.jsx)(jy, {
                        type: "button",
                        onClick: () => {
                          r("left");
                        },
                        title: "Toggle left sidebar",
                        children: (0, cZ.jsx)(jY, { focusable: "false" }),
                      }),
                    }),
                    (0, cZ.jsx)("div", {
                      className: l7("rightSideBarToggle"),
                      children: (0, cZ.jsx)(jy, {
                        type: "button",
                        onClick: () => {
                          r("right");
                        },
                        title: "Toggle right sidebar",
                        children: (0, cZ.jsx)(jZ, { focusable: "false" }),
                      }),
                    }),
                  ],
                }),
                (0, cZ.jsx)("div", {
                  className: l7("title"),
                  children: (0, cZ.jsxs)(kz, {
                    rank: "2",
                    size: "xs",
                    children: [
                      d || o || "Page",
                      e &&
                        (0, cZ.jsxs)(cZ.Fragment, {
                          children: [
                            " ",
                            (0, cZ.jsx)("code", { className: l7("path"), children: e }),
                          ],
                        }),
                    ],
                  }),
                }),
                (0, cZ.jsxs)("div", {
                  className: l7("tools"),
                  children: [
                    (0, cZ.jsx)("div", {
                      className: l7("menuButton"),
                      children: (0, cZ.jsx)(jy, {
                        type: "button",
                        onClick: () => n(!m),
                        title: "Toggle menu bar",
                        children: m
                          ? (0, cZ.jsx)(jK, { focusable: "false" })
                          : (0, cZ.jsx)(jI, { focusable: "false" }),
                      }),
                    }),
                    (0, cZ.jsx)(l6, {
                      dispatch: g,
                      onPublish: a,
                      menuOpen: m,
                      renderHeaderActions: () =>
                        (0, cZ.jsx)(l, {
                          children: (0, cZ.jsx)(jB, {
                            onClick: () => {
                              let b = h.getState().state.data;
                              a && a(b);
                            },
                            icon: (0, cZ.jsx)(jP, { size: "14px" }),
                            children: "Publish",
                          }),
                        }),
                      setMenuOpen: n,
                    }),
                  ],
                }),
              ],
            }),
          }),
        });
      });
    (cz(), cz(), cz());
    var l9 = iZ("ResizeHandle", {
        ResizeHandle: "_ResizeHandle_144bf_2",
        "ResizeHandle--left": "_ResizeHandle--left_144bf_16",
        "ResizeHandle--right": "_ResizeHandle--right_144bf_20",
      }),
      ma = ({ position: a, sidebarRef: b, onResize: c, onResizeEnd: d }) => {
        let { frameRef: e } = l1(),
          f = ju(e),
          g = (0, ci.useRef)(null),
          h = (0, ci.useRef)(!1),
          i = (0, ci.useRef)(0),
          j = (0, ci.useRef)(0),
          k = (0, ci.useCallback)(
            (b) => {
              if (!h.current) return;
              let d = b.clientX - i.current;
              (c(Math.max(192, "left" === a ? j.current + d : j.current - d)), b.preventDefault());
            },
            [c, a]
          ),
          l = (0, ci.useCallback)(() => {
            var a;
            if (!h.current) return;
            ((h.current = !1),
              (document.body.style.cursor = ""),
              (document.body.style.userSelect = ""));
            let c = document.getElementById("resize-overlay");
            (c && document.body.removeChild(c),
              document.removeEventListener("mousemove", k),
              document.removeEventListener("mouseup", l),
              d((null == (a = b.current) ? void 0 : a.getBoundingClientRect().width) || 0),
              f());
          }, [d]),
          m = (0, ci.useCallback)(
            (a) => {
              var c;
              ((h.current = !0),
                (i.current = a.clientX),
                (j.current =
                  (null == (c = b.current) ? void 0 : c.getBoundingClientRect().width) || 0),
                (document.body.style.cursor = "col-resize"),
                (document.body.style.userSelect = "none"));
              let d = document.createElement("div");
              ((d.id = "resize-overlay"),
                d.setAttribute("data-resize-overlay", ""),
                document.body.appendChild(d),
                document.addEventListener("mousemove", k),
                document.addEventListener("mouseup", l),
                a.preventDefault());
            },
            [a, k, l]
          );
        return (0, cZ.jsx)("div", { ref: g, className: l9({ [a]: !0 }), onMouseDown: m });
      };
    cz();
    var mb = iZ("Sidebar", {
        Sidebar: "_Sidebar_1xksb_1",
        "Sidebar--left": "_Sidebar--left_1xksb_8",
        "Sidebar--right": "_Sidebar--right_1xksb_14",
        "Sidebar-resizeHandle": "_Sidebar-resizeHandle_1xksb_20",
      }),
      mc = ({
        position: a,
        sidebarRef: b,
        isVisible: c,
        onResize: d,
        onResizeEnd: e,
        children: f,
      }) =>
        c
          ? (0, cZ.jsxs)(cZ.Fragment, {
              children: [
                (0, cZ.jsx)("div", { ref: b, className: mb({ [a]: !0 }), children: f }),
                (0, cZ.jsx)("div", {
                  className: `${mb("resizeHandle")}`,
                  children: (0, cZ.jsx)(ma, {
                    position: a,
                    sidebarRef: b,
                    onResize: d,
                    onResizeEnd: e,
                  }),
                }),
              ],
            })
          : null;
    function md(a, b) {
      let [c, d] = (0, ci.useState)(null),
        e = (0, ci.useRef)(null),
        f = jl((b) => ("left" === a ? b.state.ui.leftSideBarWidth : b.state.ui.rightSideBarWidth));
      return (
        (0, ci.useEffect)(() => {}, [b, a, f]),
        (0, ci.useEffect)(() => {
          void 0 !== f && d(f);
        }, [f]),
        {
          width: c,
          setWidth: d,
          sidebarRef: e,
          handleResizeEnd: (0, ci.useCallback)(
            (c) => {
              b({
                type: "setUi",
                ui: { ["left" === a ? "leftSideBarWidth" : "rightSideBarWidth"]: c },
              });
              let d = {};
              try {
                let a = localStorage.getItem("puck-sidebar-widths");
                d = a ? JSON.parse(a) : {};
              } catch (b) {
                console.error(`Failed to save ${a} sidebar width to localStorage`, b);
              } finally {
                localStorage.setItem(
                  "puck-sidebar-widths",
                  JSON.stringify(cn(cw({}, d), cp({ [a]: c })))
                );
              }
              window.dispatchEvent(
                new CustomEvent("viewportchange", { bubbles: !0, cancelable: !1 })
              );
            },
            [b, a]
          ),
        }
      );
    }
    cz();
    var me = iZ("Puck", lw),
      mf = iZ("PuckLayout", lw),
      mg = () => {
        let a = jl((a) => {
          var b, c;
          return a.selectedItem
            ? null !=
              (c = null == (b = a.config.components[a.selectedItem.type]) ? void 0 : b.label)
              ? c
              : a.selectedItem.type.toString()
            : "Page";
        });
        return (0, cZ.jsx)(lv, {
          noPadding: !0,
          noBorderTop: !0,
          showBreadcrumbs: !0,
          title: a,
          children: (0, cZ.jsx)(lA, {}),
        });
      },
      mh = (0, ci.createContext)({});
    function mi(a) {
      return (0, cZ.jsx)(mh.Provider, { value: a, children: a.children });
    }
    var mj = () => (0, ci.useContext)(mh);
    function mk({ children: a }) {
      let {
          config: b,
          data: c,
          ui: d,
          onChange: e,
          permissions: f = {},
          plugins: g,
          overrides: h,
          viewports: i = cH,
          iframe: j,
          initialHistory: k,
          metadata: l,
          onAction: m,
          fieldTransforms: n,
        } = mj(),
        o = (0, ci.useMemo)(() => cw({ enabled: !0, waitForStyles: !0 }, j), [j]),
        [p] = (0, ci.useState)(() => {
          var a, e, f;
          let g,
            h,
            i,
            j,
            k,
            l,
            m = cw(cw({}, cI.ui), d);
          !(Object.keys((null == c ? void 0 : c.root) || {}).length > 0) ||
            (null == (a = null == c ? void 0 : c.root) ? void 0 : a.props) ||
            console.warn(
              "Warning: Defining props on `root` is deprecated. Please use `root.props`, or republish this page to migrate automatically."
            );
          let n =
              (null == (e = null == c ? void 0 : c.root) ? void 0 : e.props) ||
              (null == c ? void 0 : c.root) ||
              {},
            o = cw(cw({}, null == (f = b.root) ? void 0 : f.defaultProps), n);
          return cO(
            ((k = cw({}, cI)),
            (l = {
              data:
                ((g = cw({}, c)),
                (h = {
                  root: cn(cw({}, null == c ? void 0 : c.root), cp({ props: o })),
                  content: c.content || [],
                }),
                cn(g, cp(h))),
              ui:
                ((i = cw(cw({}, m), {})),
                (j = {
                  componentList: b.categories
                    ? Object.entries(b.categories).reduce(
                        (a, [b, c]) =>
                          cn(
                            cw({}, a),
                            cp({
                              [b]: {
                                title: c.title,
                                components: c.components,
                                expanded: c.defaultExpanded,
                                visible: c.visible,
                              },
                            })
                          ),
                        {}
                      )
                    : {},
                }),
                cn(i, cp(j))),
            }),
            cn(k, cp(l))),
            b
          );
        }),
        { appendData: q = !0 } = k || {},
        [r] = (0, ci.useState)(
          [...((null == k ? void 0 : k.histories) || []), ...(q ? [{ state: p }] : [])].map((a) => {
            let c = cw(cw({}, p), a.state);
            return (a.state.indexes || (c = cO(c, b)), cn(cw({}, a), cp({ state: c })));
          })
        ),
        s = (null == k ? void 0 : k.index) || r.length - 1,
        t = r[s].state,
        u = (({ overrides: a, plugins: b }) =>
          (0, ci.useMemo)(
            () =>
              (({ overrides: a, plugins: b }) => {
                let c = cw({}, a);
                return (
                  null == b ||
                    b.forEach((a) => {
                      a.overrides &&
                        Object.keys(a.overrides).forEach((b) => {
                          var d;
                          if (!(null == (d = a.overrides) ? void 0 : d[b])) return;
                          if ("fieldTypes" === b) {
                            let b = a.overrides.fieldTypes;
                            Object.keys(b).forEach((a) => {
                              c.fieldTypes = c.fieldTypes || {};
                              let d = c.fieldTypes[a];
                              c.fieldTypes[a] = (c) =>
                                b[a](cn(cw({}, c), cp({ children: d ? d(c) : c.children })));
                            });
                            return;
                          }
                          let e = c[b];
                          c[b] = (c) =>
                            a.overrides[b](cn(cw({}, c), cp({ children: e ? e(c) : c.children })));
                        });
                    }),
                  c
                );
              })({ overrides: a, plugins: b }),
            [b, a]
          ))({ overrides: h, plugins: g }),
        v = (0, ci.useMemo)(() => {
          let a = (g || []).reduce((a, b) => cw(cw({}, a), b.fieldTransforms), {});
          return cw(cw({}, a), n);
        }, [n, g]),
        w = (0, ci.useCallback)(
          (a) => ({
            state: a,
            config: b,
            plugins: g || [],
            overrides: u,
            viewports: i,
            iframe: o,
            onAction: m,
            metadata: l,
            fieldTransforms: v,
          }),
          [t, b, g, u, i, o, m, l, v]
        ),
        [y] = (0, ci.useState)(() => jj(w(t)));
      ((0, ci.useEffect)(() => {}, [y]),
        (0, ci.useEffect)(() => {
          let a = y.getState().state;
          y.setState(cw({}, w(a)));
        }, [b, g, u, i, o, m, l]),
        (function (a, { histories: b, index: c, initialAppState: d }) {
          (0, ci.useEffect)(
            () =>
              a.setState({
                history: cn(
                  cw({}, a.getState().history),
                  cp({ histories: b, index: c, initialAppState: d })
                ),
              }),
            [b, c, d]
          );
          let e = () => {
              a.getState().history.back();
            },
            f = () => {
              a.getState().history.forward();
            };
          (jf({ meta: !0, z: !0 }, e),
            jf({ meta: !0, shift: !0, z: !0 }, f),
            jf({ meta: !0, y: !0 }, f),
            jf({ ctrl: !0, z: !0 }, e),
            jf({ ctrl: !0, shift: !0, z: !0 }, f),
            jf({ ctrl: !0, y: !0 }, f));
        })(y, { histories: r, index: s, initialAppState: t }));
      let z = (0, ci.useRef)(null);
      ((0, ci.useEffect)(() => {
        y.subscribe(
          (a) => a.state.data,
          (a) => {
            e && ((0, ck.default)(a, z.current) || (e(a), (z.current = a)));
          }
        );
      }, []),
        (0, ci.useEffect)(() => {
          let { permissions: a } = y.getState(),
            { globalPermissions: b } = a;
          (y.setState({ permissions: cn(cw({}, a), cp({ globalPermissions: cw(cw({}, b), f) })) }),
            a.resolvePermissions());
        }, [f]),
        (0, ci.useEffect)(
          () =>
            y.subscribe(
              (a) => a.state.data,
              () => {
                y.getState().permissions.resolvePermissions();
              }
            ),
          []
        ),
        (0, ci.useEffect)(
          () =>
            y.subscribe(
              (a) => a.config,
              () => {
                y.getState().permissions.resolvePermissions();
              }
            ),
          []
        ));
      let A = ((a) => {
        let [b] = (0, ci.useState)(() => c5(() => lr(lt(a.getState()))));
        return (
          (0, ci.useEffect)(
            () =>
              a.subscribe(
                (a) => lt(a),
                (a) => {
                  b.setState(lr(a));
                }
              ),
            []
          ),
          b
        );
      })(y);
      return (
        (0, ci.useEffect)(() => {
          let { resolveAndCommitData: a } = y.getState();
          a();
        }, []),
        (0, cZ.jsx)(jk.Provider, {
          value: y,
          children: (0, cZ.jsx)(ls.Provider, { value: A, children: a }),
        })
      );
    }
    function ml({ children: a }) {
      let b,
        c,
        { iframe: d, dnd: e, initialHistory: f } = mj(),
        g = (0, ci.useMemo)(() => cw({ enabled: !0, waitForStyles: !0 }, d), [d]);
      ((a, b) => {
        let [c, d] = (0, ci.useState)();
        return (
          (0, ci.useEffect)(() => {
            d(document.createElement("style"));
          }, []),
          (0, ci.useEffect)(() => {}, [b, c])
        );
      })(0, g.enabled);
      let h = jl((a) => a.dispatch),
        i = jl((a) => a.state.ui.leftSideBarVisible),
        j = jl((a) => a.state.ui.rightSideBarVisible),
        { width: k, setWidth: l, sidebarRef: m, handleResizeEnd: n } = md("left", h),
        { width: o, setWidth: p, sidebarRef: q, handleResizeEnd: r } = md("right", h);
      (0, ci.useEffect)(() => {
        window.matchMedia("(min-width: 638px)").matches ||
          h({ type: "setUi", ui: { leftSideBarVisible: !1, rightSideBarVisible: !1 } });
        let a = () => {
          window.matchMedia("(min-width: 638px)").matches ||
            h({
              type: "setUi",
              ui: (a) => cw(cw({}, a), a.rightSideBarVisible ? { leftSideBarVisible: !1 } : {}),
            });
        };
        return (
          window.addEventListener("resize", a),
          () => {
            window.removeEventListener("resize", a);
          }
        );
      }, []);
      let s = jl((a) => a.overrides),
        t = (0, ci.useMemo)(() => s.puck || l4, [s]),
        [u, v] = (0, ci.useState)(!1);
      (0, ci.useEffect)(() => {
        v(!0);
      }, []);
      let w = jl((a) => "READY" === a.status);
      ((0, ci.useEffect)(() => je(document), []),
        (0, ci.useEffect)(() => {
          if (w && g.enabled) {
            let a = k0();
            if (a) return je(a);
          }
        }, [w, g.enabled]),
        (b = jm()),
        jf(
          { meta: !0, i: !0 },
          (c = (0, ci.useCallback)(() => {
            (0, b.getState().dispatch)({
              type: "setUi",
              ui: (a) => ({ previewMode: "edit" === a.previewMode ? "interactive" : "edit" }),
            });
          }, [b]))
        ),
        jf({ ctrl: !0, i: !0 }, c));
      let y = {};
      return (
        k && (y["--puck-user-left-side-bar-width"] = `${k}px`),
        o && (y["--puck-user-right-side-bar-width"] = `${o}px`),
        (0, cZ.jsxs)("div", {
          className: `Puck ${me()}`,
          children: [
            (0, cZ.jsx)(k5, {
              disableAutoScroll: null == e ? void 0 : e.disableAutoScroll,
              children: (0, cZ.jsx)(t, {
                children:
                  a ||
                  (0, cZ.jsx)(l0, {
                    children: (0, cZ.jsx)("div", {
                      className: mf({ leftSideBarVisible: i, mounted: u, rightSideBarVisible: j }),
                      children: (0, cZ.jsxs)("div", {
                        className: mf("inner"),
                        style: y,
                        children: [
                          (0, cZ.jsx)(l8, {}),
                          (0, cZ.jsxs)(mc, {
                            position: "left",
                            sidebarRef: m,
                            isVisible: i,
                            onResize: l,
                            onResizeEnd: n,
                            children: [
                              (0, cZ.jsx)(lv, {
                                title: "Components",
                                noBorderTop: !0,
                                children: (0, cZ.jsx)(lE, {}),
                              }),
                              (0, cZ.jsx)(lv, { title: "Outline", children: (0, cZ.jsx)(lT, {}) }),
                            ],
                          }),
                          (0, cZ.jsx)(l3, {}),
                          (0, cZ.jsx)(mc, {
                            position: "right",
                            sidebarRef: q,
                            isVisible: j,
                            onResize: p,
                            onResizeEnd: r,
                            children: (0, cZ.jsx)(mg, {}),
                          }),
                        ],
                      }),
                    }),
                  }),
              }),
            }),
            (0, cZ.jsx)("div", { id: "puck-portal-root", className: me("portal") }),
          ],
        })
      );
    }
    function mm(a) {
      let b, c;
      return (0, cZ.jsx)(
        mi,
        ((b = cw({}, a)),
        (c = {
          children: (0, cZ.jsx)(mk, cn(cw({}, a), cp({ children: (0, cZ.jsx)(ml, cw({}, a)) }))),
        }),
        cn(b, cp(c)))
      );
    }
    ((mm.Components = lE),
      (mm.Fields = lA),
      (mm.Outline = lT),
      (mm.Preview = lN),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz(),
      cz());
    let mn = {
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
    a.s(
      [
        "default",
        0,
        function () {
          let [a, b] = (0, ci.useState)("edit"),
            [c, d] = (0, ci.useState)(mn),
            e = (0, ci.useMemo)(
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
                    render: (a) =>
                      (0, ch.jsxs)("section", {
                        className: "card",
                        style: { margin: "1rem 0" },
                        children: [
                          (0, ch.jsx)("h2", {
                            style: { marginTop: 0 },
                            children: a.title ?? "Landing section",
                          }),
                          (0, ch.jsx)("p", {
                            style: { color: "#4d4d4d", lineHeight: 1.6 },
                            children: a.subtitle ?? "",
                          }),
                          (0, ch.jsx)("a", {
                            className: "btn btn-primary",
                            href: a.ctaUrl ?? "#",
                            children: a.ctaLabel ?? "Learn more",
                          }),
                        ],
                      }),
                  },
                },
              }),
              []
            );
          return (0, ch.jsx)("main", {
            className: "editor-page",
            children: (0, ch.jsxs)("div", {
              className: "editor-shell",
              children: [
                (0, ch.jsxs)("div", {
                  style: { display: "flex", gap: "0.6rem", marginBottom: "0.8rem" },
                  children: [
                    (0, ch.jsx)("button", {
                      className: "btn btn-outline",
                      onClick: () => b("edit"),
                      type: "button",
                      children: "Edit",
                    }),
                    (0, ch.jsx)("button", {
                      className: "btn btn-outline",
                      onClick: () => b("preview"),
                      type: "button",
                      children: "Preview",
                    }),
                    (0, ch.jsx)("button", {
                      className: "btn btn-outline",
                      onClick: () => navigator.clipboard.writeText(JSON.stringify(c, null, 2)),
                      type: "button",
                      children: "Copy JSON",
                    }),
                  ],
                }),
                "edit" === a
                  ? (0, ch.jsx)(mm, { config: e, data: c, onPublish: (a) => d(a) })
                  : (0, ch.jsx)(lq, { config: e, data: c }),
              ],
            }),
          });
        },
      ],
      53587
    );
  },
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0920xjw._.js.map
