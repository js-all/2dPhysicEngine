"use strict";
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    negative() {
        return new Vector(-this.x, -this.y);
    }
    add(v) {
        if (v instanceof Vector)
            return new Vector(this.x + v.x, this.y + v.y);
        return new Vector(this.x + v, this.y + v);
    }
    substract(v) {
        if (v instanceof Vector)
            return new Vector(this.x - v.x, this.y - v.y);
        return new Vector(this.x - v, this.y - v);
    }
    multiply(v) {
        if (v instanceof Vector)
            return new Vector(this.x * v.x, this.y * v.y);
        return new Vector(this.x * v, this.y * v);
    }
    divide(v) {
        if (v instanceof Vector)
            return new Vector(this.x / v.x, this.y / v.y);
        return new Vector(this.x / v, this.y / v);
    }
    equals(v) {
        return this.x == v.x && this.y === v.y;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    clamp(n = 4) {
        const fac = Math.pow(10, n);
        const f = (nu) => parseFloat(nu.toFixed(n));
        return new Vector(f(this.x), f(this.y));
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    unit() {
        return this.divide(this.length());
        ;
    }
    min() {
        return Math.min(this.x, this.y);
    }
    max() {
        return Math.max(this.x, this.y);
    }
    toAngle() {
        if (this.x === 0 && this.y === 0)
            return 0;
        return Math.atan2(this.unit().y, this.unit().x);
    }
    angleTo(a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }
    toArray() {
        return [this.x, this.y];
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    init(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    floor() {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
    static fromAngle(angle = 0, length = 1) {
        return new Vector(Math.cos(angle) * length, Math.sin(angle) * length);
    }
    static randomDirrection(length) {
        const l = length === null ? Math.random() * Number.MAX_VALUE / 100000 : length;
        if (length === null)
            return Vector.fromAngle(Math.random() * (Math.PI * 2), l);
    }
}
