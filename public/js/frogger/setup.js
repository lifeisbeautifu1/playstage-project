const canvas1 = document.querySelector('#canvas1');
const ctx1 = canvas1.getContext('2d');
canvas1.width = 600;
canvas1.height = 600;

const canvas2 = document.querySelector('#canvas2');
const ctx2 = canvas2.getContext('2d');
canvas2.width = 600;
canvas2.height = 600;

const canvas3 = document.querySelector('#canvas3');
const ctx3 = canvas3.getContext('2d');
canvas3.width = 600;
canvas3.height = 600;

const canvas4 = document.querySelector('#canvas4');
const ctx4 = canvas4.getContext('2d');
canvas4.width = 600;
canvas4.height = 600;

const canvas5 = document.querySelector('#canvas5');
const ctx5 = canvas5.getContext('2d');
canvas5.width = 600;
canvas5.height = 600;

// Global Variables

const grid = 80,
  particlesArray = [],
  ripplesArray = [],
  carsArray = [],
  logsArray = [],
  maxParticles = 300;
let keys = [],
  score = 0,
  collisionCount = 0,
  frame = 0,
  gameSpeed = 1,
  numberOfCars = 3,
  safe = false;

const background_lvl2 = new Image();
background_lvl2.src = '/public/img/frogger/background_lvl2.png';

const grass = new Image();
grass.src = '/public/img/frogger/grass.png';

const collisions = new Image();
collisions.src = '/public/img/frogger/collisions.png';

const turtle = new Image();
turtle.src = '/public/img/frogger/turtles.png';

const log = new Image();
log.src = '/public/img/frogger/log.png';

const car = new Image();
car.src = '/public/img/frogger/cars.png';

const froggerSprite = new Image();
froggerSprite.src = '/public/img/frogger/frog_spritesheet.png';
