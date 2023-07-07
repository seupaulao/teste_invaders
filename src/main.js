import kaboom from "kaboom"

//initialize game
kaboom({
	background: [0,0,0],
	width: 800,
	height: 600,
	scale: 1,
	debug: true
})

//load atlas alien e player
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

//config variables  
const ALIEN_ROWS = 5
const ALIEN_COLS = 6

const BLOCK_WIDTH = 32
const BLOCK_HEIGHT = 40

const OFFSET_X = 200
const OFFSET_Y = 100

const PLAYER_MOVE_SPEED = 500;
const SCREEN_EDGE = 100;

const ALIEN_SPEED = 15;
const ALIEN_STEPS = 322;
const ALIEN_ROWS_MOVE = 7;

const GUN_COOLDOWN_TIME = 1;

const BULLET_SPEED = 300

const POINTS_PER_ALIEN = 100;

scene("game", () =>{
	//show player
	const player = add([
		sprite("player"),
		scale(1),
		anchor("center"),
		pos(50,550),
		area(),
		{
			score: 0,
			lives: 3
		},
		"player"
	])

	player.play("move")

	//show aliens
	let alienMap = [];
	function spawnAliens() {
	for (let row = 0; row < ALIEN_ROWS; row++) {
		alienMap[row] = [];
		for (let col = 0; col < ALIEN_COLS; col++) {
		const x = col * BLOCK_WIDTH * 2 + OFFSET_X;
		const y = row * BLOCK_HEIGHT + OFFSET_Y;
		const alien = add([
			pos(x, y),
			sprite("alien"),
			area(),
			scale(4),
			anchor("center"),
			"alien",
			{
			row: row,
			col: col,
			},
		]);
		alien.play("fly");
		alienMap[row][col] = alien;
		}
	}
	}
	spawnAliens();

	let pause = false;
	onKeyDown("left", () => {
	if (pause) return;
	if (player.pos.x >= SCREEN_EDGE) {
		player.move(-1 * PLAYER_MOVE_SPEED, 0);
	}
	});

	onKeyDown("right", () => {
	if (pause) return;
	if (player.pos.x <= width() - SCREEN_EDGE) {
		player.move(PLAYER_MOVE_SPEED, 0);
	}
	});

	let alienDirection = 1;
	let alienMoveCounter = 0;
	let alienRowsMoved = 0;

	onUpdate(() => {
		if (pause) return;

		for (let row = 0; row < ALIEN_ROWS; row++) {
			for (let col = 0; col < ALIEN_COLS; col++) {
				const alien = alienMap[row][col];
				if (alien != null) alien.move(alienDirection * ALIEN_SPEED, 0);
			}
		}	
	
		// every("alien", (alien) => {
		//   alien.move(alienDirection * ALIEN_SPEED, 0);
		// });
	
		alienMoveCounter++;
	
		if (alienMoveCounter > ALIEN_STEPS) {
		alienDirection = alienDirection * -1;
		alienMoveCounter = 0;
		moveAliensDown();
		}
	
		if (alienRowsMoved > ALIEN_ROWS_MOVE) {
		pause = true;
		player.play("explode");
		wait(2, () => {
			go("gameOver", player.score);
		});
		}
	});
	
	function moveAliensDown() {
		alienRowsMoved++;
		for (let row = 0; row < ALIEN_ROWS; row++) {
			for (let col = 0; col < ALIEN_COLS; col++) {
				const alien = alienMap[row][col];
				if (alien != null) alien.moveBy(0, BLOCK_HEIGHT);
			}
		}	
		// every("alien", (alien) => {
		//   alien.moveBy(0, BLOCK_HEIGHT);
		// });
	}

	let lastShootTime = time();

	onKeyPress("space", () => {
	if (pause) return;
	if (time() - lastShootTime > GUN_COOLDOWN_TIME) {
		lastShootTime = time();
		spawnBullet(player.pos, -1, "bullet");
	}
	});

	function spawnBullet(bulletPos, direction, tag) {
	add([
		rect(2, 6),
		pos(bulletPos),
		anchor("center"),
		color(255, 255, 255),
		area(),
		offscreen({ destroy: true }),
		"missile",
		tag,
		{
		direction,
		},
	]);
	}

	onUpdate("missile", (missile) => {
		if (pause) return;
		missile.move(0, BULLET_SPEED * missile.direction);
	});

	onCollide("alien","player",() => {
		go("gameOver", player.score)
	})

	onCollide("bullet", "alien", (bullet, alien) => {
		destroy(bullet);
		alien.play("explode");
		alien.use(lifespan(0.5, { fade: 0.1 }));
		alienMap[alien.row][alien.col] = null; // Mark the alien as dead
		updateScore(POINTS_PER_ALIEN);
	  });

	  add([
		text("SCORE:", { size: 20, font: "sink" }),
		pos(100, 40),
		anchor("center"),
	//	layer("ui"),
	  ]);
	  
	  const scoreText = add([
		text("000000", { size: 20, font: "sink" }),
		pos(200, 40),
		anchor("center"),
	//	layer("ui"),
	  ]);
	  
	  function updateScore(points) {
		player.score += points;
		scoreText.text = player.score.toString().padStart(6, "0");
	  }

	  loop(1, ()=>{
		if (pause) return 

		let row, col
		col = randi(0, ALIEN_COLS)
		let shooter = null

		for (row = ALIEN_ROWS - 1; row >= 0; row--){
			shooter = alienMap[row][col]
			if (shooter != null) {
				break;
			}
		}

		if (shooter != null) {
			spawnBullet(shooter.pos, 1, "alienBullet")
		}
	  })

	  player.onCollide("alienBullet", (bullet) => {
		if (pause) return;
		destroyAll("bullet");
		player.play("explode");
		updateLives(-1);
		pause = true;
		wait(2, () => {
		  if (player.lives == 0) {
			go("gameOver", player.score);
		  } else {
			player.moveTo(50, 550);
			player.play("move");
			pause = false;
		  }
		});
	  });

	  add([
		text("LIVES:", { size: 20, font: "sink" }),
		pos(650, 40),
		anchor("center"),
		//layer("ui"),
	  ]);
	  
	  const livesText = add([
		text("3", { size: 20, font: "sink" }),
		pos(700, 40),
		anchor("center"),
		//layer("ui"),
	  ]);
	  
	  function updateLives(life) {
		player.lives += life;
		livesText.text = player.lives.toString();
	  }
	
})

scene("gameOver", (score) => {
	add([
		text("GAME OVER", { size: 40, font: "sink" }),
		pos(width() / 2, height() / 2),
		anchor("center"),
		//layer("ui"),
	  ]);
	  
	  add([
		text("SCORE: " + score, { size: 20, font: "sink" }),
		pos(width() / 2, height() / 2 + 50),
		anchor("center"),
		//layer("ui"),
	  ]);
	  
	  onKeyPress("space", () => {
		go("game");
	  });
})

go("game")


