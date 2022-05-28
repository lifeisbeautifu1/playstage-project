let startDate = new Date();
let elapsedTime = 0;

const focus = function () {
  startDate = new Date();
};

const blur = function () {
  const endDate = new Date();
  const spentTime = endDate.getTime() - startDate.getTime();
  elapsedTime += spentTime;
};

const beforeunload = async function () {
  const endDate = new Date();
  const spentTime = endDate.getTime() - startDate.getTime();
  elapsedTime += spentTime;
  let result = await fetch('/dashboard/time', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      game: document.getElementsByTagName('title')[0].innerHTML,
      elapsedTime: elapsedTime,
    }),
  }).then((res) => res.json());

  // elapsedTime contains the time spent on page in milliseconds
};

window.addEventListener('focus', focus);
window.addEventListener('blur', blur);
window.addEventListener('beforeunload', beforeunload);
