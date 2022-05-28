function animate() {
  ctx1.clearRect(0, 0, canvas1.width, canvas2.height);
  ctx2.clearRect(0, 0, canvas1.width, canvas2.height);
  ctx3.clearRect(0, 0, canvas1.width, canvas2.height);
  ctx4.clearRect(0, 0, canvas1.width, canvas2.height);
  ctx5.clearRect(0, 0, canvas1.width, canvas2.height);

  handleRipples();
  ctx2.drawImage(background_lvl2, 0, 0, canvas1.width, canvas2.height);
  handleParticles();

  frogger.draw();
  frogger.update();

  handleObstacles();
  handleScoreboard();
  ctx4.drawImage(grass, 0, 0);
  frame++;
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('keydown', (e) => {
  keys = [];
  keys[e.key] = true;
  if (
    keys['ArrowUp'] ||
    keys['ArrowDown'] ||
    keys['ArrowLeft'] ||
    keys['ArrowRight']
  ) {
    frogger.jump();
  }
});

window.addEventListener('keyup', (e) => {
  delete keys[e.key];
  frogger.moving = false;
  frogger.frameX = 0;
});

function scored() {
  score++;
  gameSpeed += 0.05;
  frogger.x = canvas1.width / 2 - frogger.width / 2;
  frogger.y = canvas1.height - frogger.height - 40;
}

function handleScoreboard() {
  ctx4.fillStyle = 'black';
  ctx4.strokeStyle = 'black';
  ctx4.font = '16px Verdana';
  ctx4.strokeText('Score', 265, 15);
  ctx4.font = '60px Verdana';
  ctx4.fillText(score, 270, 65);
  ctx4.font = '16px Verdana';
  ctx4.strokeText(`Game Speed: ${gameSpeed.toFixed(2)}`, 10, 175);
}

function collision(first, second) {
  return !(
    first.x > second.x + second.width ||
    first.x + first.width < second.x ||
    first.y > second.y + second.height ||
    first.y + first.height < second.y
  );
}

function resetGame() {
  score = 0;
  collisionCount++;
  gameSpeed = 1;
  frogger.x = canvas1.width / 2 - frogger.width / 2;
  frogger.y = canvas1.height - frogger.height - 40;
}
