type Segment = [Vector, Vector];

/**
 * calculate the position of the intersection of a line and a segment
 * @param ox origin of the line x
 * @param oy origin of the line y
 * @param vx dirrection of the line x
 * @param vy dirrection of the line y
 * @param sx start of the segment x
 * @param sy start of the segment y
 * @param ex end of the segment x
 * @param ey end of the segment y
 */
function LineSegmentIntersection(ox: number, oy: number, vx: number, vy: number, sx: number, sy: number, ex: number, ey: number): castInterface {
    //debugger;
    const x3 = ox;
    const y3 = oy;
    const x4 = vx;
    const y4 = vy;

    const x1 = sx;
    const y1 = sy;
    const x2 = ex;
    const y2 = ey;

    const den: number = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) return {
        distance: null,
        hit: false,
        position: null
    };

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -(((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den);
    if (u >= 0 && t < 1 && t > 0) {
        let tptx = x1 + t * (x2 - x1);
        let tpty = y1 + t * (y2 - y1);
        let distance: number = Math.hypot(Math.abs(tptx - ox), Math.abs(tpty - oy))
        return {
            distance: distance,
            hit: true,
            position: new Vector(tptx, tpty)
        };
    } else {
        return {
            distance: null,
            hit: false,
            position: null
        };
    }
}

function vectorLineIntersection(VecLocation: Vector, Vec: Vector, segStart: Vector, segEnd: Vector) {
    return LineSegmentIntersection(VecLocation.x, VecLocation.y, VecLocation.add(Vec).x, VecLocation.add(Vec).y, segStart.x, segStart.y, segEnd.x, segEnd.y)
}

function getNormalSeg(seg: Segment, length: number = 5): Segment {
    let v = getSingleVectorFromSeg(seg);
    let middlePoint = seg[0].add(v.divide(2));
    let n = v.normal().unit();

    return [middlePoint, middlePoint.add(n.setLength(length))];
}
function getSingleVectorFromSeg(seg: Segment): Vector {
    return seg[1].substract(seg[0]);
}

function VectorListToGeoJson(list: Vector[]) {
    const res: [number, number][][] = [[]];
    for (let i of list) {
        res[0].push(i.toArray());
    }
    return res;
}