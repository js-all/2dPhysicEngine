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
    draw(ctx: CanvasRenderingContext2D, config: SureGameConfig) {
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(...this.hitbox[0].toArray());
        for (let i of this.hitbox) {
            ctx.lineTo(...i.toArray());
        }
        ctx.lineTo(...this.hitbox[0].toArray());
        ctx.stroke();
        ctx.closePath();
        for (let i of this.hitbox) {
            ctx.beginPath();
            ctx.moveTo(...i.toArray());
            ctx.lineTo(...i.add(this.velocity.setLength(100)).toArray())
            ctx.stroke();
            ctx.closePath();
        }
        for (let i of this.drawCalls) {
            i.func(...i.args)
        }

    }
    move(collideElements: GameElement[], config: SureGameConfig) {
        interface Length {
            length: number,
            raySegment: ElSeg,
            segmentHit: Segment
        }
        interface ElSeg {
            seg: Segment,
            normal: Vector,
            normalSeg: Segment
        }
        const lengths: Length[] = [];
        const segs: ElSeg[] = [];
        const thisSegs: ElSeg[] = [];
        const points: Vector[] = [];
        // used to see velocity length in debugger
        const tempthisvelocitylength = this.velocity.length();
        // reset draw calls
        this.drawCalls.splice(0, this.drawCalls.length)
        //store every segment and every points of every element in the game in segs and points respectively
        {
            let tmpSegs: Segment[] = [];
            for (let i of collideElements) {
                let k = 1;
                for (let j of i.hitbox) {
                    const laterPoint = i.hitbox[k] || i.hitbox[0];
                    points.push(j);
                    tmpSegs.push([j, laterPoint]);
                    k++;
                }
            }
            let tmpNorm: [Vector, [Vector, Vector]][] = [];
            // calculate normals
            for (let i of tmpSegs) {
                tmpNorm.push([getSingleVectorFromSeg(i).normal(), getNormalSeg(i)]);
            }
            for (let i = 0; i < tmpSegs.length; i++) {
                const s = tmpSegs[i];
                const n = tmpNorm[i];
                segs.push({
                    seg: s,
                    normal: n[0],
                    normalSeg: n[1]
                })
            }
        }
        // store every segment of the moving object in thisSegs
        {
            let tmpSegs: Segment[] = [];
            for (let i = 0; i < this.hitbox.length; i++) {
                const e = this.hitbox[i];
                const laterPoint = this.hitbox[i + 1] || this.hitbox[0];
                tmpSegs.push([e, laterPoint]);
            }
            let tmpNorm: [Vector, [Vector, Vector]][] = [];
            for (let i of tmpSegs) {
                tmpNorm.push([getSingleVectorFromSeg(i).normal(), getNormalSeg(i)]);
            }
            for (let i = 0; i < tmpSegs.length; i++) {
                const s = tmpSegs[i];
                const n = tmpNorm[i];
                thisSegs.push({
                    seg: s,
                    normal: n[0],
                    normalSeg: n[1]
                })
            }
        }
        // draw normals if necsarry
        if (config.showNormal) {
            for (let i of [...segs, ...thisSegs]) {
                this.drawCalls.push({
                    func: (n: [Vector, Vector]) => {
                        ctx.beginPath();
                        ctx.moveTo(n[0].x, n[0].y);
                        ctx.lineTo(n[1].x, n[1].y);
                        ctx.strokeStyle = "red"
                        ctx.stroke();
                        ctx.closePath();
                    },
                    args: [i.normalSeg]
                })
            }
        }
        // check if any point of the moving element will collide with any other element when moved
        for (let i of this.hitbox) {
            for (let j of segs) {
                // cast a ray to know if the vector of the point and its later position is colliding with a segment and if it does at what distance
                const l = vectorLineIntersection(i, this.velocity, ...j.seg);
                if (l.hit) {
                    // push the colliding distance in the lengths arrays
                    let v = j.seg[1].substract(j.seg[0]);
                    let middlePoint = j.seg[0].add(v.divide(2));
                    lengths.push({
                        length: <number>l.distance,
                        raySegment: {
                            seg: j.seg,
                            normal: j.seg[0].normal(),
                            normalSeg: getNormalSeg(j.seg)
                        },
                        segmentHit: [i, i.add(this.velocity.setLength(<number>l.distance))]
                    })
                }
            }
        }
        // check if any other point will collide with the object when it move. its used to detect the collision between a large moving element and a small obstacle
        /**
         * TODO fucing solve the probleme whereit check with evey points and not just them oving object
         */
        for (let i of points) {
            for (let j of thisSegs) {
                // cast a ray to know if the vector of the other element's point and its negatively moved version will collide with the moving element
                const l = vectorLineIntersection(i, this.velocity.negative(), ...j.seg)
                if (l.hit) {
                    // push the colliding distance in the lengths arrays
                    let v = j.seg[1].substract(j.seg[0]);
                    let middlePoint = j.seg[0].add(v.divide(2));
                    let n = v.normal().unit();
                    lengths.push({
                        length: <number>l.distance,
                        raySegment: {
                            seg: j.seg,
                            normal: getSingleVectorFromSeg(j.seg).normal(),
                            normalSeg: getNormalSeg(j.seg)
                        },
                        segmentHit: [i, i.add(this.velocity.setLength(<number>l.distance))]
                    })
                }
            }
        }
        let min = Infinity;
        let minSeg: ElSeg;
        let minM = [new Vector(0, 0), new Vector(0, 0)];
        let base = false;
        // find the smaller collisions distance the know by how much the moving element can move
        for (let i of lengths) {

            if (i.length < min) {
                min = i.length;
                minSeg = i.raySegment;
                minM = i.segmentHit;
            }
        }
        if (min < this.velocity.length()) {
            // if min < velocity, minSeg is obligatorely an elSeg
            ///@ts-ignore
            const u = (<ElSeg>minSeg).normal.multiply(this.velocity.dot(minSeg.normal));
            const w = this.velocity.substract(u);
            const v = w.substract(u);
            this.drawCalls.push({
                func: (a: [Vector, Vector], b: Vector) => {
                    ctx.strokeStyle = "blue";
                    ctx.beginPath();
                    ctx.moveTo(a[0].x, a[0].y);
                    ctx.lineTo(a[1].x, a[1].y);
                    ctx.stroke();
                    ctx.strokeStyle = 'green'
                    ctx.lineTo(a[1].add(b.setLength(500)).x, a[1].add(b.setLength(500)).y)
                    ctx.stroke();
                    ctx.closePath();
                },
                args: [minM, v]
            });
        } else {
            min = this.velocity.length();
            base = true;
        }
        // create a vector the dirrection of the original move factor but the length the smallest collide distance
        const moveFactorTemp = this.velocity.setLength(min);
        // check if the object should just continue moving or rebond
        const moveFactor = moveFactorTemp.length() > config.touchDistance ? this.velocity.setLength(min) : v.setLength(this.velocity.length());
        // set the final move factor and fix it to 10 decimals to avoid having a move factor of 3.00... ...001 wich break the collisions for some reason
        moveFactor.x = Math.round(moveFactor.x * 100) / 100
        moveFactor.y = Math.round(moveFactor.y * 100) / 100
        moveFactor.setLength(parseFloat(moveFactor.length().toFixed(5)))
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
        this.velocity = moveFactor;
        // apply the move factor
        for (let i = 0; i < this.hitbox.length; i++) {

            this.hitbox[i] = this.hitbox[i].add(moveFactor.setLength(moveFactor.length() - config.touchDistance).clamp(3));
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
interface GameConfig {
    gravity?: number,
    touchDistance?: number,
    showNormal?: boolean,
    normalLength?: number
}
interface SureGameConfig {
    gravity: number,
    touchDistance: number,
    showNormal: boolean,
    normalLength: number
}
class Game {
    elements: GameElement[];
    config: SureGameConfig;
    constructor(elements: GameElement[] = [], config?: GameConfig) {
        const defaultConfig: SureGameConfig = {
            gravity: 1.5,
            touchDistance: 0.1,
            showNormal: false,
            normalLength: 10
        }
        config = config || defaultConfig;
        this.elements = elements;
        for (let i in defaultConfig) {
            // ignoring because i don't care if its undefined, thats what i'm testing
            ///@ts-ignore
            if (config[i] === undefined) {
                ///@ts-ignore
                config[i] = defaultConfig[i];
            }
        }
        this.config = <SureGameConfig>config;
    }
    draw(ctx: CanvasRenderingContext2D) {
        for (let i of this.elements) {
            i.draw(ctx, this.config);
        }
    }
    play() {
        for (let i of this.elements) {
            if (i.actif) {
                const arr = [...this.elements];
                arr.splice(arr.indexOf(i), 1);
                i.move(arr, this.config);
                i.velocity = i.velocity.add(new Vector(0, this.config.gravity));
            }
        }
    }
}