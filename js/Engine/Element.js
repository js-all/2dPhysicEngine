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
        for (let i of this.drawCalls) {
            i.func(...i.args);
        }
        this.drawCalls.splice(0, this.drawCalls.length);
    }
    move(collideElements, config) {
        const lengths = [];
        const segs = [];
        const thisSegs = [];
        const points = [];
        const segsN = [];
        const thisSegsN = [];
        //store every segment and every points of every element in the game in segs and points respectively
        for (let i of collideElements) {
            let k = 1;
            for (let j of i.hitbox) {
                const laterPoint = i.hitbox[k] || i.hitbox[0];
                points.push(j);
                segs.push([j, laterPoint]);
                k++;
            }
        }
        // store every segment of the moving object in thisSegs
        for (let i = 0; i < this.hitbox.length; i++) {
            const e = this.hitbox[i];
            const laterPoint = this.hitbox[i + 1] || this.hitbox[0];
            thisSegs.push([e, laterPoint]);
        }
        // calculate normals
        for (let i of segs) {
            let v = i[1].substract(i[0]);
            let middlePoint = i[0].add(v.divide(2));
            let n = v.normal().setLength(10);
            segsN.push([middlePoint, middlePoint.add(n)]);
        }
        for (let i of thisSegs) {
            let v = i[1].substract(i[0]);
            let middlePoint = i[0].add(v.divide(2));
            let n = v.normal().setLength(10);
            thisSegsN.push([middlePoint, middlePoint.add(n)]);
        }
        // draw normals if necsarry
        if (config.showNormal) {
            for (let i of [...segsN, ...thisSegsN]) {
                this.drawCalls.push({
                    func: (n) => {
                        ctx.beginPath();
                        ctx.moveTo(n[0].x, n[0].y);
                        ctx.lineTo(n[1].x, n[1].y);
                        ctx.strokeStyle = "red";
                        ctx.stroke();
                        ctx.closePath();
                    },
                    args: [i]
                });
            }
        }
        // check if any point of the moving element will collide with any other element when moved
        for (let i of this.hitbox) {
            for (let j of segs) {
                // cast a ray to know if the vector of the point and its later position is colliding with a segment and if it does at what distance
                const l = vectorLineIntersection(i, this.velocity, j[0], j[1]);
                if (l.hit) {
                    // push the colliding distance in the lengths arrays
                    lengths.push([l.distance, j]);
                }
            }
        }
        // check if any other point will collide with the object when it move. its used to detect the collision between a small moving element and a large obstacle
        for (let i of points) {
            for (let j of thisSegs) {
                // cast a ray to know if the vector of the other element's point and its negatively moved version will collide with the moving element
                const l = vectorLineIntersection(i, i.add(this.velocity.negative()), j[0], j[1]);
                if (l.hit) {
                    // push the colliding distance in the lengths arrays
                    lengths.push([l.distance, j]);
                }
            }
        }
        let min = Infinity;
        let minSeg = [new Vector(0, 0), new Vector(0, 0)];
        let base = false;
        // find the smaller collisions distance the know by how much the moving element can move
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
        // create a vector the dirrection of the original move factor but the length the smallest collide distance
        const moveFactorTemp = this.velocity.setLength(min);
        // check if the move factor is too small, if it is just set it to 0 to avoid object passing through other after a certain time
        const moveFactor = moveFactorTemp.length() > config.touchDistance ? moveFactorTemp : new Vector(0, 0);
        const l = minSeg[1].substract(minSeg[0]);
        const bounceVector = 2 * (moveFactor.dot(l) / l.dot(l));
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
        // set the final move factor and fix it to 10 decimals to avoid having a move factor of 3.00... ...001 wich break the collisions for some reason
        moveFactor.x = parseFloat(moveFactor.x.toFixed(10));
        moveFactor.y = parseFloat(moveFactor.y.toFixed(10));
        // apply the move factor
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
    constructor(elements = [], config) {
        const defaultConfig = {
            gravity: 1.5,
            touchDistance: 0.01,
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
