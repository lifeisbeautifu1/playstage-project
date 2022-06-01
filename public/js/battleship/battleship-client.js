let socket = io();
let code;

$('#waiting-title').click((e) => {
  navigator.clipboard.writeText(code);
});

$(function () {
  /**
   * Successfully connected to server event
   */

  $('#create-game').click(() => {
    socket.emit('create-game');
    $('#startScreen').hide();
    $('#waiting').show();
    $('#search').html('Waiting for other player to join');
    $('#search').show();
    //$('#waiting-room').show();
    // $('#waiting-info').html('Waiting for other player to join...');
  });

  $('#join-game').click(() => {
    code = $('#code-input').val();
    socket.emit('join-game', code);
  });

  $('#find-game').click(() => {
    socket.emit('find-game');
    $('#startScreen').hide();
    $('#search').html('Searching for the opponent');
    $('#search').show();
  });

  socket.on('connect', function () {
    console.log('Connected to server.');
    $('#disconnected').hide();
    $('#search').hide();
    $('#startScreen').show();
  });

  socket.on('code', function (gameCode) {
    code = gameCode;
    $('#waiting-title').html(`${code}`);
  });

  /**
   * Disconnected from server event
   */
  socket.on('disconnect', function () {
    console.log('Disconnected from server.');
    $('#search').hide();
    $('#game').hide();
    $('#startScreen').hide();
    $('#disconnected').show();
  });

  /**
   * User has joined a game
   */
  socket.on('join', function (gameId) {
    Game.initGame();
    $('#messages').empty();
    $('#disconnected').hide();
    $('#startScreen').hide();
    $('#waiting').hide();
    $('#search').hide();
    $('#game').show();
    $('#game-number').html(gameId);
  });

  /**
   * Update player's game state
   */
  socket.on('update', function (gameState) {
    Game.setTurn(gameState.turn);
    Game.updateGrid(gameState.gridIndex, gameState.grid);
  });

  /**
   * Game chat message
   */
  socket.on('chat', function (msg) {
    $('#messages').append(
      '<li><strong>' + msg.name + ':</strong> ' + msg.message + '</li>'
    );
    $('#messages-list').scrollTop($('#messages-list')[0].scrollHeight);
  });

  /**
   * Game notification
   */
  socket.on('notification', function (msg) {
    $('#messages').append('<li>' + msg.message + '</li>');
    $('#messages-list').scrollTop($('#messages-list')[0].scrollHeight);
  });

  /**
   * Change game status to game over
   */
  socket.on('gameover', function (isWinner) {
    Game.setGameOver(isWinner);
  });

  /**
   * Leave game and join waiting room
   */
  socket.on('leave', function () {
    $('#game').hide();
    // $('#startScreen').show();
    $('#search').html('Searching for the opponent');
    $('#search').show();
    $('#turn-status')
      .removeClass('alert-opponent-turn')
      .removeClass('alert-your-turn')
      .removeClass('alert-loser')
      .removeClass('alert-winner')
      .html('');
  });

  /**
   * Send chat message to server
   */
  $('#message-form').submit(function () {
    socket.emit('chat', $('#message').val());
    $('#message').val('');
    return false;
  });
});

/**
 * Send leave game request
 * @param {type} e Event
 */
function sendLeaveRequest(e) {
  e.preventDefault();
  socket.emit('leave');
}

/**
 * Send shot coordinates to server
 * @param {type} square
 */
function sendShot(square) {
  socket.emit('shot', square);
}
