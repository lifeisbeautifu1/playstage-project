document
  .querySelector('.change-password')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.querySelector('.error-password');
    const password = document.querySelector('#password').value;
    const password2 = document.querySelector('#password2').value;
    if (!password || !password2) {
      msg.textContent = 'Please enter new password';
      setTimeout(() => (msg.textContent = ''), 3000);
    } else if (password !== password2) {
      msg.textContent = 'Password must match';
      setTimeout(() => (msg.textContent = ''), 3000);
    } else if (password.length < 6) {
      msg.textContent = 'Password must be at least 6 characters long';
      setTimeout(() => (msg.textContent = ''), 3000);
    } else {
      const result = await fetch('users/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      }).then((res) => res.json());
      if (result.status == 'ok') {
        const message = document.querySelector('.success-password');
        message.textContent = 'Password successfully has been changed!';
        setTimeout(() => {
          message.textContent = '';
          // window.location.href = '/dashboard';
        }, 3000);
      } else {
        msg.textContent = 'New password is the same as the old one';
        setTimeout(() => (msg.textContent = ''), 3000);
      }
    }
  });
document
  .querySelector('.change-email')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.querySelector('.error-email');
    const email = document.querySelector('#email').value;
    if (email === '') {
      msg.textContent = 'Please enter new email.';
      setTimeout(() => (msg.textContent = ''), 3000);
      return;
    } else {
      if (!email.match(/\S+@\S+\.\S+/)) {
        msg.textContent = 'Incorrect email format!';
        setTimeout(() => (msg.textContent = ''), 3000);
      } else {
        const result = await fetch('users/email/change', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        }).then((res) => res.json());
        if (result.status == 'ok') {
          const message = document.querySelector('.success-email');
          message.textContent = 'Email has been successfully changed!';
          document.querySelector('.user-email').textContent = email;

          setTimeout(() => {
            message.textContent = '';
            // window.location.href = '/dashboard';
          }, 3000);
        } else {
          msg.textContent = result.msg;
          setTimeout(() => (msg.textContent = ''), 3000);
        }
      }
    }
  });
document
  .querySelector('.change-username')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.querySelector('.error-username');
    const name = document.querySelector('#name').value;
    // document.querySelector('.dashboard-username').textContent = name;
    if (name === '') {
      msg.textContent = 'Please enter new username.';
      setTimeout(() => (msg.textContent = ''), 3000);
      return;
    } else {
      const result = await fetch('users/name/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      }).then((res) => res.json());
      if (result.status == 'ok') {
        const message = document.querySelector('.success-username');
        message.textContent = 'Username has been successfully changed!';
        document.querySelector('.user-name').textContent = name;
        document.querySelector('.nameInProfile').textContent = name;
        setTimeout(() => {
          message.textContent = '';
          // window.location.href = '/dashboard';
        }, 3000);
      } else {
        msg.textContent = result.msg;
        setTimeout(() => (msg.textContent = ''), 3000);
      }
    }
  });

document
  .querySelector('.change-about')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.querySelector('.error-about');
    const about = document.querySelector('#about').value;
    if (about === '') {
      msg.textContent = 'Please enter info about yourself.';
      setTimeout(() => (msg.textContent = ''), 3000);
      return;
    } else {
      const result = await fetch('users/about/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          about,
        }),
      }).then((res) => res.json());
      if (result.status == 'ok') {
        const message = document.querySelector('.success-about');
        document.querySelector('.user-about').textContent = about;
        document.querySelector('#about').value = '';
        document.querySelector('#about').placeholder = about;
        message.textContent = 'About info has been successfully changed!';
        setTimeout(() => {
          message.textContent = '';
          // window.location.href = '/dashboard';
        }, 3000);
      } else {
        msg.textContent = result.msg;
        setTimeout(() => (msg.textContent = ''), 3000);
      }
    }
  });

document
  .querySelector('.change-country')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.querySelector('.error-country');
    const country = document.querySelector('.datalist-input').value;
    if (country === '') {
      msg.textContent = 'Please select current country.';
      setTimeout(() => (msg.textContent = ''), 3000);
      return;
    } else {
      const result = await fetch('users/country/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country,
        }),
      }).then((res) => res.json());
      if (result.status == 'ok') {
        const message = document.querySelector('.success-country');
        document.querySelector('.countryInProfile').textContent = ' ' + country;
        message.textContent = 'Current country has been successfully changed!';
        setTimeout(() => {
          message.textContent = '';
          // window.location.href = '/dashboard';
        }, 3000);
      } else {
        msg.textContent = result.msg;
        setTimeout(() => (msg.textContent = ''), 3000);
      }
    }
  });

const profileModal = document.querySelector('.my-profile-modal');

document.querySelector('.closeProfileBtn').addEventListener('click', () => {
  profileModal.classList.toggle('hidden');
});

const profileClose = document.querySelector('.my-profile-close');

window.addEventListener('click', (e) => {
  if (e.target == profileModal) {
    profileModal.classList.toggle('hidden');
  } else if (e.target == roomModal) {
    roomModal.classList.toggle('hidden');
  } else if (e.target == chatModal) {
    chatModal.classList.toggle('hidden');
    isOpen = false;
  } else if (e.target == profileClose) {
    profileModal.classList.toggle('hidden');
  } else if (e.target == chatSectionModal) {
    chatSectionModal.classList.toggle('hidden');
    isOpen = false;
  }
});

document.querySelector('.profile-btn').addEventListener('click', (e) => {
  e.preventDefault();

  profileModal.classList.toggle('hidden');
});

// Tabs switch in leaderboard

const tabs = document.querySelectorAll('.tab-item');

const items = document.querySelectorAll('.tab-content-item');

function removeActive() {
  tabs.forEach((tab) => {
    tab.classList.remove('active');
  });
}

function hide() {
  items.forEach((item) => {
    item.classList.add('hidden');
  });
}

tabs.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    removeActive();
    hide();
    e.target.classList.add('active');
    if (e.target.id === 'wordle-table') {
      document.querySelector('.wordle-table').classList.remove('hidden');
    } else if (e.target.id === 'number-table') {
      document.querySelector('.number-table').classList.remove('hidden');
    } else if (e.target.id === 'snake-table') {
      document.querySelector('.snake-table').classList.remove('hidden');
    } else if (e.target.id == 'bird-table') {
      document.querySelector('.bird-table').classList.remove('hidden');
    } else if (e.target.id == 'doodle-table') {
      document.querySelector('.doodle-table').classList.remove('hidden');
    } else if (e.target.id == 'speed-table') {
      document.querySelector('.speed-table').classList.remove('hidden');
    } else if (e.target.id == 'minesweeper-table') {
      document.querySelector('.minesweeper-table').classList.remove('hidden');
    } else {
      document.querySelector('.tenzies-table').classList.remove('hidden');
    }
  });
});

// const roomModal = document.querySelector('.modal-rooms');

// const chatRoomBtn = document.querySelector('#chat-rooms');

// chatRoomBtn.addEventListener('click', (e) => {
//   e.preventDefault();
//   if (!flag) roomModal.classList.toggle('hidden');
//   else {
//     chatModal.classList.toggle('hidden');
//     isOpen = true;
//   }
// });

const firstNav = document.querySelector('.first'),
  secondNav = document.querySelector('.second'),
  thirdNav = document.querySelector('.third');

const leaderboardToggler = document.querySelector('.leaderboard-toggler'),
  leaderboardTogglerTwo = document.querySelector('.leaderboard-toggler-two'),
  leaderboardTogglerThree = document.querySelector(
    '.leaderboard-toggler-three'
  );

leaderboardTogglerThree.addEventListener('click', (e) => {
  e.preventDefault();
  thirdNav.classList.toggle('none');
  firstNav.classList.toggle('none');
});

leaderboardTogglerTwo.addEventListener('click', (e) => {
  e.preventDefault();
  secondNav.classList.toggle('none');
  thirdNav.classList.toggle('none');
});

leaderboardToggler.addEventListener('click', (e) => {
  e.preventDefault();
  firstNav.classList.toggle('none');
  secondNav.classList.toggle('none');
});

const levelBar = document.querySelector('.leverBar');

levelBar.style.width = `${levelBar.getAttribute('data-width')}%`;

// const navLinks = document.querySelectorAll('.nav-item');
// const menuToggle = document.querySelector('.navbar-toggler');
// const menu = document.querySelector('#navmenu');
// const bsCollapse = new bootstrap.Collapse(menuToggle);
// navLinks.forEach((l) => {
//   l.addEventListener('click', (e) => {
//     menuToggle.click();
//   });
// });

// const navbarCollapse = document.querySelector('.navbar-collapse');

const menuOnMobile = document.querySelector('.menu-on-mobile');

const profileIcon = document.querySelector('.profile-icon');
const exitIcon = document.querySelector('.exit-icon');
const playIcon = document.querySelector('.play-icon');
const leaderboardIcon = document.querySelector('.leaderboard-icon');

playIcon.addEventListener('click', () => {
  setTimeout(() => {
    document.getElementById('games').scrollIntoView();
  }, 1000);
});

leaderboardIcon.addEventListener('click', () => {
  setTimeout(() => {
    document.getElementById('leaderboard').scrollIntoView();
  }, 1000);
});

profileIcon.addEventListener('click', (e) => {
  setTimeout(() => {
    profileModal.classList.toggle('hidden');
  }, 1000);
});

exitIcon.addEventListener('click', (e) => {
  setTimeout(() => {
    location.href = '/users/logout';
  }, 1000);
});

let myFlag = true;

// menuToggle.addEventListener('click', (e) => {
//   menuOnMobile.classList.toggle('out');
//   if (myFlag) {
//     menuOnMobile.classList.toggle('hidden');
//     myFlag = false;
//   }

//   navbar.classList.toggle('dark-color');
//   navbarTogglerIcon.classList.toggle('dark-color');
// });

const icons = document.querySelectorAll('.icon');

icons.forEach((icon) => {
  icon.addEventListener('click', (e) => {
    toggleMenu();
  });
});

const hamburgerMenu = document.querySelector('.hamburger');
hamburgerMenu.addEventListener('click', toggleMenu);

function toggleMenu() {
  hamburgerMenu.classList.toggle('clicked');
  if (!menuOnMobile.classList.contains('out')) {
    navbar.classList.remove('dark-color');
  }
  if (
    menuOnMobile.classList.contains('out') &&
    !navbar.classList.contains('dark-color')
  ) {
    navbar.classList.add('dark-color');
  }
  menuOnMobile.classList.toggle('out');
  if (myFlag) {
    menuOnMobile.classList.toggle('hidden');
    myFlag = false;
  }
}

// let lastWidth = 1000;

// window.addEventListener(
//   'resize',
//   function (event) {
//     if (this.visualViewport.width < 768 && lastWidth > 768) {
//       bsCollapse.toggle();
//       lastWidth = this.visualViewport.width;
//     }
//   },
//   true
// );

const loadCountries = async () => {
  const res = await fetch('https://restcountries.com/v3.1/all').then((res) =>
    res.json()
  );

  const country = document.querySelector('#country');
  res.forEach((data) => {
    const option = document.createElement('option');
    option.value = data.name.common;
    country.append(option);
  });
};

loadCountries();
