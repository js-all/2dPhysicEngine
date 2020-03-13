
const canvas = <HTMLCanvasElement>document.createElement('canvas');
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
const cw: number = 2000;
const ch: number = 1000;
const playRate = 60;
const game: Game = new Game([], { showNormal: false, gravity: 0.006 * playRate, touchDistance: 0.05, normalLength: 20 });
const other: GameElement[] = [
    new Square(new Vector(800, 200), 100, 100, new Vector(-10, -10), 0.01, 0.9, 1),
    new Square(new Vector(100, 200), 100, 100, new Vector(10, -10), 100000000, 0.9, 1),
    new RegularPolygon(new Vector(500, 500), -50, 32, new Vector(10, 5), 1.1, 1, 0.1),

    new Square(new Vector(10, 900), 1980, 100, new Vector(0, 0), 1000000000, 0.9, 0.5, false), // bottom
    new Square(new Vector(0, 0), 10, 1000, new Vector(0, 0), 1, 0.1, 0.5, false),   // left
    new Square(new Vector(1990, 0), 10, 1000, new Vector(0, 0), 1, 0.9, 1, false),  // right
    new Square(new Vector(0, 0), 2000, 20, new Vector(0, 0), 1, 0.9, 0.5, false)    // top
];
//other[3].hitbox[0].y = 800
canvas.height = ch;
canvas.width = cw;

document.body.appendChild(canvas)
game.elements.push(...other);

function draw() {
    ctx.clearRect(0, 0, cw, ch);
    game.draw(ctx);
    requestAnimationFrame(draw);
}

function play() {
    game.play();
}



draw();
play.interval = setInterval(play, 1000 / playRate);


const _$$c: HTMLCanvasElement = canvas;
const _$$cw = _$$c.width;
const _$$ch = _$$c.height;
function _$$adaptSize() {
    let rhl = _$$cw / _$$ch;
    let rlh = _$$ch / _$$cw;
    if (window.innerWidth > window.innerHeight * rhl) {
        _$$c.style.width = 'inherit';
        _$$c.style.height = '100%';
    }
    if (window.innerHeight > window.innerWidth * rlh) {
        _$$c.style.height = 'inherit';
        _$$c.style.width = '100%';
    }
}
_$$adaptSize();

window.addEventListener('resize', _$$adaptSize);
document.addEventListener('keydown', e => {
    if (e.keyCode === 32) {
        console.log(JSON.stringify(game));
    }
})

