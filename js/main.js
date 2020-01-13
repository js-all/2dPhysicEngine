"use strict";
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const cw = 1000;
const ch = 1000;
const game = new Game([], 0.1);
const square = new Square(new Vector(300, 450), 400, 50, new Vector(5, 0));
const other = [
    new Square(new Vector(100, 900), 800, 100, new Vector(0, 0), 1, 1, false),
    new Square(new Vector(900, 0), 100, 1000, new Vector(0, 0), 0, 0, false)
];
canvas.height = ch;
canvas.width = cw;
document.body.appendChild(canvas);
game.elements.push(...[square, ...other]);
function draw() {
    ctx.clearRect(0, 0, cw, ch);
    game.draw(ctx);
    requestAnimationFrame(draw);
}
function play() {
    game.play();
}
play.rate = 60;
draw();
play.interval = setInterval(play, 1000 / play.rate);
const _$$c = canvas;
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
