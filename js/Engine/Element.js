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
    draw(ctx, config) {
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(...this.hitbox[0].toArray());
        for (let i of this.hitbox) {
            ctx.lineTo(...i.toArray());
        }
        ctx.lineTo(...this.hitbox[0].toArray());
        ctx.stroke();
        ctx.closePath();
        /*
        for (let i of this.hitbox) {
            ctx.beginPath();
            ctx.moveTo(...i.toArray());
            ctx.lineTo(...i.add(this.velocity.multiply(20)).toArray())
            ctx.stroke();
            ctx.closePath();
        }*/
        for (let i of this.drawCalls) {
            i.func(...i.args);
        }
    }
    move(collideElements, config) {
        const lengths = [];
        const segs = [];
        const thisSegs = [];
        const points = [];
        // used to see velocity length in debugger
        const tempthisvelocitylength = this.velocity.length();
        // reset draw calls
        this.drawCalls.splice(0, this.drawCalls.length);
        //store every segment and every points of every element in the game in segs and points respectively
        {
            let tmpSegs = [];
            for (let i of collideElements) {
                let k = 1;
                for (let j of i.hitbox) {
                    const laterPoint = i.hitbox[k] || i.hitbox[0];
                    points.push(j);
                    tmpSegs.push([j, laterPoint]);
                    k++;
                }
            }
            let tmpNorm = [];
            // calculate normals
            for (let i of tmpSegs) {
                tmpNorm.push([getSingleVectorFromSeg(i).normal(), getNormalSeg(i, config.normalLength)]);
            }
            for (let i = 0; i < tmpSegs.length; i++) {
                const s = tmpSegs[i];
                const n = tmpNorm[i];
                segs.push({
                    seg: s,
                    normal: n[0],
                    normalSeg: n[1]
                });
            }
        }
        // store every segment of the moving object in thisSegs
        {
            let tmpSegs = [];
            for (let i = 0; i < this.hitbox.length; i++) {
                const e = this.hitbox[i];
                const laterPoint = this.hitbox[i + 1] || this.hitbox[0];
                tmpSegs.push([e, laterPoint]);
            }
            let tmpNorm = [];
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
                });
            }
        }
        // draw normals if necsarry
        if (config.showNormal) {
            for (let i of [...segs, ...thisSegs]) {
                this.drawCalls.push({
                    func: (n) => {
                        ctx.beginPath();
                        ctx.moveTo(n[0].x, n[0].y);
                        ctx.lineTo(n[1].x, n[1].y);
                        ctx.strokeStyle = "red";
                        ctx.stroke();
                        ctx.closePath();
                    },
                    args: [i.normalSeg]
                });
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
                    lengths.push({
                        length: l.distance,
                        raySegment: {
                            seg: j.seg,
                            normal: j.normal,
                            normalSeg: j.normalSeg
                        },
                        ///@ts-ignore
                        segmentHit: [i, l.position]
                    });
                }
            }
        }
        /**
         *
         *                THE GREAT DEBUGGING WALL
         *
         *    Thou shall not edit nor modify this old artefact
         *    Legends says it was erigged to win the great bug
         *    war, with the immense power to see every thing
         *    heppening on with the collisons only the choosen
         *    one can debug the project
         *
         *    (not enabled at the moment)
         *
         *    VISION +100
         *
         *    legendary spagethi code
         *
         *    sell price 42069M coins
         *
         */
        if (false) {
            let segnumber = 0;
            for (let i of lengths) {
                const u = i.raySegment.normal.multiply(getSingleVectorFromSeg(i.segmentHit).dot(i.raySegment.normal) / i.raySegment.normal.dot(i.raySegment.normal));
                const w = getSingleVectorFromSeg(i.segmentHit).substract(u);
                const v = w.substract(u);
                this.drawCalls.push({
                    func(i, n, v) {
                        ctx.fillStyle = "rgb(200, 100, 1)";
                        ctx.strokeStyle = ctx.fillStyle;
                        ctx.beginPath();
                        ctx.moveTo(...i.segmentHit[0].toArray());
                        ctx.lineTo(...i.segmentHit[1].toArray());
                        ctx.stroke();
                        ctx.closePath();
                        ctx.beginPath();
                        ctx.strokeStyle = "cyan";
                        ctx.moveTo(...i.segmentHit[1].toArray());
                        ctx.lineTo(...i.segmentHit[1].add(v.multiply(100)).toArray());
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(i.segmentHit[1].x, i.segmentHit[1].y, 10, 0, Math.PI * 2);
                        ctx.fillText(n.toString(), ...i.segmentHit[0].substract(new Vector(0, 30 * n)).toArray());
                        ctx.fill();
                        ctx.closePath();
                        ctx.strokeStyle = "purple";
                        ctx.beginPath();
                        ctx.fillStyle = "red";
                        ctx.font = "30px Arial";
                        ctx.moveTo(...i.raySegment.seg[0].toArray());
                        ctx.lineTo(...i.raySegment.seg[1].toArray());
                        ctx.fillText(n.toString(), ...i.raySegment.seg[0].add(getSingleVectorFromSeg(i.raySegment.seg).divide(20).multiply(n)).toArray());
                        ctx.stroke();
                        ctx.closePath();
                    },
                    args: [i, segnumber, v]
                });
                segnumber++;
            }
        }
        // check if any other point will collide with the object when it move. its used to detect the collision between a large moving element and a small obstacle
        /**
         * TODO fucing solve the probleme whereit check with evey points and not just them oving object
         */
        for (let i of points) {
            for (let j of thisSegs) {
                // cast a ray to know if the vector of the other element's point and its negatively moved version will collide with the moving element
                const l = vectorLineIntersection(i, this.velocity.negative(), ...j.seg);
                if (l.hit) {
                    // push the colliding distance in the lengths arrays
                    let v = j.seg[1].substract(j.seg[0]);
                    let middlePoint = j.seg[0].add(v.divide(2));
                    let n = v.normal().unit();
                    lengths.push({
                        length: l.distance,
                        raySegment: {
                            seg: j.seg,
                            normal: getSingleVectorFromSeg(j.seg).normal(),
                            normalSeg: getNormalSeg(j.seg)
                        },
                        segmentHit: [i, i.add(this.velocity.setLength(l.distance))]
                    });
                }
            }
        }
        let min = Infinity;
        let minSeg;
        let minM = [new Vector(0, 0), new Vector(0, 0)];
        let base = false;
        let moveFactor = this.velocity;
        // find the smaller collisions distance the know by how much the moving element can move
        for (let i of lengths) {
            if (i.length < min) {
                min = i.length;
                minSeg = i.raySegment;
                minM = i.segmentHit;
            }
        }
        if (min < this.velocity.length()) {
            // if min < velocity, minSeg is an elSeg
            ///@ts-ignore
            const u = minSeg.normal.multiply(this.velocity.dot(minSeg.normal) / minSeg.normal.dot(minSeg.normal));
            const w = this.velocity.substract(u);
            const v = w.substract(u);
            moveFactor = v.setLength(this.velocity.length() * 0.5);
        }
        else {
            min = this.velocity.length();
            base = true;
        }
        // set the final move factor and fix it to 10 decimals to avoid having a move factor of 3.00... ...001 wich break the collisions for some reason
        moveFactor.x = Math.round(moveFactor.x * 100) / 100;
        moveFactor.y = Math.round(moveFactor.y * 100) / 100;
        moveFactor.setLength(parseFloat(moveFactor.length().toFixed(5)));
        this.velocity = moveFactor;
        // apply the move factor
        for (let i = 0; i < this.hitbox.length; i++) {
            this.hitbox[i] = this.hitbox[i].add(moveFactor.setLength(moveFactor.length() - config.touchDistance).clamp(3));
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
    constructor(elements = [], config) {
        const defaultConfig = {
            gravity: 1.5,
            touchDistance: 0.1,
            showNormal: false,
            normalLength: 10
        };
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
        this.config = config;
    }
    draw(ctx) {
        const scale = 0.75;
        ctx.save();
        ctx.translate(ctx.canvas.width * ((1 - scale) / 2), ctx.canvas.height * ((1 - scale) / 2));
        ctx.scale(scale, scale);
        for (let i of this.elements) {
            i.draw(ctx, this.config);
        }
        ctx.restore();
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
