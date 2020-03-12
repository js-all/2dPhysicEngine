const canvas = <HTMLCanvasElement>document.createElement('canvas');
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
const cw: number = 1000;
const ch: number = 1000;
const playRate = 60;
const game = new Game([], { showNormal: false, gravity: 0.006 * playRate, touchDistance: 0.01, normalLength: 20 });
const square = new Square(new Vector(800, 750), 100, 100, new Vector(-10, 30));
const other: GameElement[] = [
    new Square(new Vector(100, 750), 100, 100, new Vector(10, 30)),
    new Square(new Vector(0, 900), 1000, 100, new Vector(0, 0), 1, 1, false)
];
canvas.height = ch;
canvas.width = cw;

document.body.appendChild(canvas)
game.elements.push(...[square, ...other]);

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

