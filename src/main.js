import kaboom from "kaboom"

kaboom({
	background: [0,0,0],
	width: 800,
	height: 600,
	scale: 1,
	debug: true
})

loadRoot("sprites/");
loadSpriteAtlas("alien-sprite.png", {
  alien: {
    x: 0,
    y: 0,
    width: 48,
    height: 12,
    sliceX: 4,
    sliceY: 1,
    anims: {
      fly: { from: 0, to: 1, speed: 4, loop: true },
      explode: { from: 2, to: 3, speed: 8, loop: true },
    },
  },
});

loadSpriteAtlas("player-sprite.png", {
  player: {
    x: 0,
    y: 0,
    width: 180,
    height: 30,
    sliceX: 3,
    sliceY: 1,
    anims: {
      move: { from: 0, to: 0, speed: 4, loop: false },
      explode: { from: 1, to: 2, speed: 8, loop: true },
    },
  },
});

scene("game", () =>{

})

scene("gameover", () => {

})

go("game")


