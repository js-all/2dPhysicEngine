interface castInterface {
    distance: number | null,
    hit: boolean,
    position: Vector | null
}

class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    negative() {
        return new Vector(-this.x, -this.y);
    }
    add(v: Vector | number) {
        if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y);
        return new Vector(this.x + v, this.y + v);
    }
    substract(v: Vector | number) {
        if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y);
        return new Vector(this.x - v, this.y - v);
    }
    multiply(v: Vector | number) {
        if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y);
        return new Vector(this.x * v, this.y * v);
    }
    divide(v: Vector | number) {
        if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y);
        return new Vector(this.x / v, this.y / v);
    }
    equals(v: Vector) {
        return this.x == v.x && this.y === v.y;
    }
    dot(v: Vector) {
        return this.x * v.x + this.y * v.y;
    }
    clamp(n: number = 4) {
        const fac = Math.pow(10, n);
        const f = (nu: number) => parseFloat(nu.toFixed(n))
        return new Vector(
            f(this.x),
            f(this.y)
        )
    }
    setLength(length: number) {
        if (this.equals(new Vector(0, 0))) return this;
        return Vector.fromAngle(this.toAngle(), length);
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    unit() {
        return this.divide(this.length());;
    }
    min() {
        return Math.min(this.x, this.y);
    }
    max() {
        return Math.max(this.x, this.y);
    }
    toAngle() {
        if (this.x === 0 && this.y === 0) return 0;
        return Math.atan2(this.unit().y, this.unit().x);
    }
    angleTo(a: Vector) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }
    toArray(): [number, number] {
        return [this.x, this.y];
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    init(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }
    normal() {
        return new Vector(this.y, -this.x);
    }
    floor() {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
    static fromAngle(angle: number = 0, length: number = 1) {
        return new Vector(Math.cos(angle) * length, Math.sin(angle) * length);
    }
    static randomDirrection(length: number | null) {
        const l = length === null ? Math.random() * Number.MAX_VALUE / 100000 : length;
        if (length === null) return Vector.fromAngle(Math.random() * (Math.PI * 2), l);
    }
}
