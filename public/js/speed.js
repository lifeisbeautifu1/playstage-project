const input = document.querySelector('#input');
const newGameBtn = document.querySelector('.new-game');
const cor = document.querySelector('.correct');
let string;
let correct = 0;
let time = 60;
let wpm = 0;
let updateSpeed;
let timeLeft;

newGameBtn.addEventListener('click', start);

const text = document.querySelector('.text');

async function start() {
  input.value = '';
  wpm = 0;
  cor.innerHTML = 0;
  correct = 0;
  stop();
  input.disabled = false;
  time = 60;
  const type = 'paragraph';
  const number = 4;
  const params = '&type=' + type + '&number=' + number;

  const options = {
    method: 'GET',
  };
  const res = await fetch('https://fish-text.ru/get?' + params, options).then(
    (res) => res.json()
  );

  string = res.text;
  while (string.indexOf('\\n') != -1) {
    string = string.replace('\\n', '');
  }
  while (string.indexOf('  ') != -1) {
    string = string.replace('  ', ' ');
  }
  let inner = '';
  const arr = string.split('');
  arr.forEach((letter) => {
    inner += `<span class="letter">${letter}</span>`;
  });
  text.innerHTML = inner;

  updateSpeed = setInterval(() => {
    wpm = Math.floor(((correct / 5) * 60) / (60 - time));
    document.querySelector('.wpm').innerHTML = isNaN(wpm) ? 0 : wpm;
  }, 1000);

  timeLeft = setInterval(() => {
    time--;
    if (time == 0) {
      stop();
      gameover(wpm);
    }
    document.querySelector('.time').innerHTML = time;
  }, 1000);

  input.focus();
}

function stop() {
  if (updateSpeed) {
    clearInterval(updateSpeed);
  }
  if (timeLeft) {
    clearInterval(timeLeft);
  }
  input.disabled = true;
}

window.addEventListener('DOMContentLoaded', start);

input.addEventListener('input', (e) => {
  if (Math.floor(input.value.length / 150) > 0) {
    text.scrollTo({ top: (20 * input.value.length) / 50, behavior: 'smooth' });
  }
  correct = 0;
  let spans = document.querySelectorAll('.letter');
  spans.forEach((span) => (span.className = 'letter'));
  let arr = input.value.split('');
  arr.forEach((letter, index) => {
    if (spans[index].innerHTML == letter) {
      spans[index].classList.add('text-success');
      correct++;
    } else {
      spans[index].classList.add('text-danger');
    }
  });
  cor.innerHTML = correct;
});

async function gameover(score) {
  let result = await fetch('/dashboard/speed/gameOver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      score: score,
    }),
  }).then((res) => res.json());
}
