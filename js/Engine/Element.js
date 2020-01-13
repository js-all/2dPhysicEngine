"use strict";
class GameElement {
    constructor(hitbox, position, velocity = new Vector(0, 0), friction = 1, bounciness = 1, actif = true) {
        this.hitbox = hitbox;
        this.position = position;
        this.velocity = velocity;
        this.friction = friction;
        this.bounciness = bounciness;
        this.actif = actif;
        this.drawCalls = [];
    }
    draw(ctx) {
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(...this.hitbox[0].toArray());
        for (let i of this.hitbox) {
            ctx.lineTo(...i.toArray());
        }
        ctx.lineTo(...this.hitbox[0].toArray());
        ctx.stroke();
        ctx.closePath();
        for (let i of this.drawCalls) {
            i.func(...i.args);
        }
        this.drawCalls.splice(0, this.drawCalls.length);
    }
    move(collideElements, touchTreshold) {
        const lengths = [];
        const segs = [];
        const thisSegs = [];
        const points = [];
        for (let i of collideElements) {
            let k = 1;
            for (let j of i.hitbox) {
                const laterPoint = i.hitbox[k] || i.hitbox[0];
                points.push(j);
                segs.push([j, laterPoint]);
                k++;
            }
        }
        for (let i = 0; i < this.hitbox.length; i++) {
            const e = this.hitbox[i];
            const laterPoint = this.hitbox[i + 1] || this.hitbox[0];
            thisSegs.push([e, laterPoint]);
        }
        for (let i of this.hitbox) {
            for (let j of segs) {
                const l = vectorLineIntersection(i, this.velocity, j[0], j[1]);
                if (l.hit) {
                    lengths.push([l.distance, j]);
                }
            }
        }
        for (let i of points) {
            for (let j of thisSegs) {
                const l = vectorLineIntersection(i, i.add(this.velocity.negative()), j[0], j[1]);
                if (l.hit) {
                    debugger;
                    lengths.push([l.distance, j]);
                }
            }
        }
        let min = Infinity;
        let minSeg = [new Vector(0, 0), new Vector(0, 0)];
        let base = false;
        for (let i of lengths) {
            if (i[0] < min) {
                min = i[0];
                minSeg = i[1];
            }
        }
        if (this.velocity.length() < min) {
            min = this.velocity.length();
            base = true;
        }
        const moveFactorTemp = (Vector.fromAngle(this.velocity.toAngle(), min));
        const moveFactor = moveFactorTemp.length() > touchTreshold ? moveFactorTemp : new Vector(0, 0);
        this.drawCalls.push({
            func: () => ctx.fillStyle = 'black',
            args: []
        }, {
            func: () => ctx.font = "Arial 20px",
            args: []
        }, {
            func: ctx.fillText.bind(ctx),
            args: [moveFactor.length().toString(), 10, 50]
        });
        moveFactor.x = parseFloat(moveFactor.x.toFixed(10));
        moveFactor.y = parseFloat(moveFactor.y.toFixed(10));
        for (let i = 0; i < this.hitbox.length; i++) {
            this.hitbox[i] = this.hitbox[i].add(moveFactor);
        }
    }
}
class Square extends GameElement {
    constructor(position, width, height, velocity = new Vector(0, 0), friction = 1, bounciness = 1, actif = true) {
        super([
            position.add(new Vector(0, 0)),
            position.add(new Vector(width, 0)),
            position.add(new Vector(width, height)),
            position.add(new Vector(0, height))
        ], position, velocity, friction, bounciness, actif);
    }
}
class Game {
    constructor(elements = [], gravity = 8, touchdistance = 0.01) {
        this.elements = elements;
        this.gravity = gravity;
        this.touchDistance = touchdistance;
    }
    draw(ctx) {
        for (let i of this.elements) {
            i.draw(ctx);
        }
    }
    play() {
        for (let i of this.elements) {
            if (i.actif) {
                const arr = [...this.elements];
                arr.splice(arr.indexOf(i), 1);
                i.move(arr, this.touchDistance);
                i.velocity = i.velocity.add(new Vector(0, this.gravity));
            }
        }
    }
}
