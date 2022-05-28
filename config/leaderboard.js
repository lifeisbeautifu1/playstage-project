class Leaderboard {
  constructor() {
    this.board = [];
  }

  add(name, score, id) {
    this.board.push({ name, score, id });
  }

  remove(id) {
    let index = this.board.findIndex((player) => player.id == id);
    if (index !== -1) {
      this.board.splice(index, 1);
    }
  }

  update(id, score) {
    this.board.forEach((player) => {
      if (player.id == id) {
        player.score = Math.floor(score);
      }
    });
  }
  organize() {
    this.board.sort((a, b) => b.score - a.score);
  }
}

module.exports = Leaderboard;
