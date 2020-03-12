! function (t) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).polylabel = t()
    }
}(function () {
    return function () {
        return function t(n, e, r) {
            function i(u, a) {
                if (!e[u]) {
                    if (!n[u]) {
                        var f = "function" == typeof require && require;
                        if (!a && f) return f(u, !0);
                        if (o) return o(u, !0);
                        var h = new Error("Cannot find module '" + u + "'");
                        throw h.code = "MODULE_NOT_FOUND", h
                    }
                    var s = e[u] = {
                        exports: {}
                    };
                    n[u][0].call(s.exports, function (t) {
                        return i(n[u][1][t] || t)
                    }, s, s.exports, t, n, e, r)
                }
                return e[u].exports
            }
            for (var o = "function" == typeof require && require, u = 0; u < r.length; u++) i(r[u]);
            return i
        }
    }()({
        1: [function (t, n, e) {
            "use strict";
            var r = t("tinyqueue");

            function i(t, n, e) {
                var i, a, f, h;
                n = n || 1;
                for (var s = 0; s < t[0].length; s++) {
                    var d = t[0][s];
                    (!s || d[0] < i) && (i = d[0]), (!s || d[1] < a) && (a = d[1]), (!s || d[0] > f) && (f = d[0]), (!s || d[1] > h) && (h = d[1])
                }
                var l = f - i,
                    p = h - a,
                    c = Math.min(l, p),
                    v = c / 2,
                    g = new r(null, o);
                if (0 === c) return [i, a];
                for (var x = i; x < f; x += c)
                    for (var w = a; w < h; w += c) g.push(new u(x + v, w + v, v, t));
                var y = function (t) {
                        for (var n = 0, e = 0, r = 0, i = t[0], o = 0, a = i.length, f = a - 1; o < a; f = o++) {
                            var h = i[o],
                                s = i[f],
                                d = h[0] * s[1] - s[0] * h[1];
                            e += (h[0] + s[0]) * d, r += (h[1] + s[1]) * d, n += 3 * d
                        }
                        return 0 === n ? new u(i[0][0], i[0][1], 0, t) : new u(e / n, r / n, 0, t)
                    }(t),
                    m = new u(i + l / 2, a + p / 2, 0, t);
                m.d > y.d && (y = m);
                for (var b = g.length; g.length;) {
                    var q = g.pop();
                    q.d > y.d && (y = q, e && console.log("found best %d after %d probes", Math.round(1e4 * q.d) / 1e4, b)), q.max - y.d <= n || (v = q.h / 2, g.push(new u(q.x - v, q.y - v, v, t)), g.push(new u(q.x + v, q.y - v, v, t)), g.push(new u(q.x - v, q.y + v, v, t)), g.push(new u(q.x + v, q.y + v, v, t)), b += 4)
                }
                return e && (console.log("num probes: " + b), console.log("best distance: " + y.d)), [y.x, y.y]
            }

            function o(t, n) {
                return n.max - t.max
            }

            function u(t, n, e, r) {
                this.x = t, this.y = n, this.h = e, this.d = function (t, n, e) {
                    for (var r = !1, i = 1 / 0, o = 0; o < e.length; o++)
                        for (var u = e[o], f = 0, h = u.length, s = h - 1; f < h; s = f++) {
                            var d = u[f],
                                l = u[s];
                            d[1] > n != l[1] > n && t < (l[0] - d[0]) * (n - d[1]) / (l[1] - d[1]) + d[0] && (r = !r), i = Math.min(i, a(t, n, d, l))
                        }
                    return (r ? 1 : -1) * Math.sqrt(i)
                }(t, n, r), this.max = this.d + this.h * Math.SQRT2
            }

            function a(t, n, e, r) {
                var i = e[0],
                    o = e[1],
                    u = r[0] - i,
                    a = r[1] - o;
                if (0 !== u || 0 !== a) {
                    var f = ((t - i) * u + (n - o) * a) / (u * u + a * a);
                    f > 1 ? (i = r[0], o = r[1]) : f > 0 && (i += u * f, o += a * f)
                }
                return (u = t - i) * u + (a = n - o) * a
            }
            n.exports = i, n.exports.default = i
        }, {
            tinyqueue: 2
        }],
        2: [function (t, n, e) {
            "use strict";

            function r(t, n) {
                if (!(this instanceof r)) return new r(t, n);
                if (this.data = t || [], this.length = this.data.length, this.compare = n || i, this.length > 0)
                    for (var e = (this.length >> 1) - 1; e >= 0; e--) this._down(e)
            }

            function i(t, n) {
                return t < n ? -1 : t > n ? 1 : 0
            }
            n.exports = r, n.exports.default = r, r.prototype = {
                push: function (t) {
                    this.data.push(t), this.length++, this._up(this.length - 1)
                },
                pop: function () {
                    if (0 !== this.length) {
                        var t = this.data[0];
                        return this.length--, this.length > 0 && (this.data[0] = this.data[this.length], this._down(0)), this.data.pop(), t
                    }
                },
                peek: function () {
                    return this.data[0]
                },
                _up: function (t) {
                    for (var n = this.data, e = this.compare, r = n[t]; t > 0;) {
                        var i = t - 1 >> 1,
                            o = n[i];
                        if (e(r, o) >= 0) break;
                        n[t] = o, t = i
                    }
                    n[t] = r
                },
                _down: function (t) {
                    for (var n = this.data, e = this.compare, r = this.length >> 1, i = n[t]; t < r;) {
                        var o = 1 + (t << 1),
                            u = o + 1,
                            a = n[o];
                        if (u < this.length && e(n[u], a) < 0 && (o = u, a = n[u]), e(a, i) >= 0) break;
                        n[t] = a, t = o
                    }
                    n[t] = i
                }
            }
        }, {}]
    }, {}, [1])(1)
});