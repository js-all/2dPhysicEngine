interface DrawCall {
    func: Function,
    args: any[];
}

class GameElement {
    hitbox: Vector[];
    position: Vector;
    velocity: Vector;
    friction: number;
    bounciness: number;
    actif: boolean;
    drawCalls: DrawCall[];
    constructor(hitbox: Vector[], position: Vector, velocity: Vector = new Vector(0, 0), friction: number = 1, bounciness: number = 1, actif: boolean = true) {
        this.hitbox = hitbox;
        this.position = position;
        this.velocity = velocity;
        this.friction = friction;
        this.bounciness = bounciness;
        this.actif = actif;
        this.drawCalls = [];
    }
    draw(ctx: CanvasRenderingContext2D) {
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
            i.func(...i.args)
        }
        this.drawCalls.splice(0, this.drawCalls.length)
    }
    move(collideElements: GameElement[], touchTreshold: number) {
        const lengths: [number, [Vector, Vector]][] = [];
        const segs: [Vector, Vector][] = [];
        const thisSegs: [Vector, Vector][] = [];
        const points: Vector[] = [];
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
                    lengths.push([<number>l.distance, j])
                }
            }
        }
        for (let i of points) {
            for (let j of thisSegs) {
                const l = vectorLineIntersection(i, i.add(this.velocity.negative()), j[0], j[1])
                if (l.hit) {
                    debugger;
                    lengths.push([<number>l.distance, j])
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
        const moveFactorTemp = (Vector.fromAngle(this.velocity.toAngle(), min))
        const moveFactor = moveFactorTemp.length() > touchTreshold ? moveFactorTemp : new Vector(0, 0);
        const l = minSeg[1].substract(minSeg[0]);
        const bounceVector = 2 * (moveFactor.dot(l) / l.dot(l))
        this.drawCalls.push(
            {
                func: () => ctx.fillStyle = 'black',
                args: []
            },
            {
                func: () => ctx.font = "Arial 20px",
                args: []
            },
            {
                func: ctx.fillText.bind(ctx),
                args: [moveFactor.length().toString(), 10, 50]
            }
        )
        moveFactor.x = parseFloat(moveFactor.x.toFixed(10));
        moveFactor.y = parseFloat(moveFactor.y.toFixed(10));
        for (let i = 0; i < this.hitbox.length; i++) {
            this.hitbox[i] = this.hitbox[i].add(moveFactor);
        }

    }
}

class Square extends GameElement {
    constructor(position: Vector, width: number, height: number, velocity: Vector = new Vector(0, 0), friction: number = 1, bounciness: number = 1, actif: boolean = true) {
        super([
            position.add(new Vector(0, 0)),
            position.add(new Vector(width, 0)),
            position.add(new Vector(width, height)),
            position.add(new Vector(0, height))
        ], position, velocity, friction, bounciness, actif);
    }
}

class Game {
    elements: GameElement[];
    gravity: number;
    touchDistance: number;
    constructor(elements: GameElement[] = [], gravity: number = 8, touchdistance: number = 0.01) {
        this.elements = elements;
        this.gravity = gravity;
        this.touchDistance = touchdistance;
    }
    draw(ctx: CanvasRenderingContext2D) {
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