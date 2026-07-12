(function(){

  var WIN_COMBOS = [
    [0,1,2], [3,4,5], [6,7,8],   // rows
    [0,3,6], [1,4,7], [2,5,8],   // columns
    [0,4,8], [2,4,6]             // diagonals
  ];

  var CELL_CENTERS = [
    [50,50],   [150,50],  [250,50],
    [50,150],  [150,150], [250,150],
    [50,250],  [150,250], [250,250]
  ];

  /* ---------- DOM refs ---------- */
  var cells = Array.prototype.slice.call(document.querySelectorAll('.cell'));
  var statusEl = document.getElementById('status');
  var modeToggle = document.getElementById('modeToggle');
  var difficultyToggle = document.getElementById('difficultyToggle');
  var newGameBtn = document.getElementById('newGameBtn');
  var resetScoresBtn = document.getElementById('resetScoresBtn');
  var scoreXEl = document.getElementById('scoreX');
  var scoreOEl = document.getElementById('scoreO');
  var scoreDrawEl = document.getElementById('scoreDraw');
  var oLabelEl = document.getElementById('oLabel');
  var winLineEl = document.getElementById('winLineEl');

  /* ---------- State ---------- */
  var board = new Array(9).fill(null);   // 'X' | 'O' | null
  var currentPlayer = 'X';
  var gameOver = false;
  var mode = 'cpu';          // 'cpu' | 'pvp'
  var difficulty = 'unbeatable'; // 'easy' | 'unbeatable'
  var scores = { X: 0, O: 0, draw: 0 };
  var cpuThinking = false;

  /* ---------- Win / draw detection ---------- */
  function getWinningCombo(b){
    for (var i = 0; i < WIN_COMBOS.length; i++){
      var c = WIN_COMBOS[i];
      if (b[c[0]] && b[c[0]] === b[c[1]] && b[c[1]] === b[c[2]]){
        return c;
      }
    }
    return null;
  }

  function isBoardFull(b){
    return b.every(function(v){ return v !== null; });
  }

  /* ---------- Rendering ---------- */
  function renderBoard(){
    cells.forEach(function(cell, i){
      cell.classList.remove('x', 'o', 'taken', 'win', 'mark-in');
      cell.textContent = '';
      if (board[i]){
        cell.textContent = board[i];
        cell.classList.add(board[i].toLowerCase(), 'taken');
      }
    });
  }

  function setStatus(html){
    statusEl.innerHTML = html;
  }

  function updateStatusForOngoingGame(){
    var label = currentPlayer === 'X' ? 'hl-x' : 'hl-o';
    var who = currentPlayer;
    if (mode === 'cpu' && currentPlayer === 'O'){
      setStatus('Computer is thinking&hellip;');
    } else {
      var whoText = mode === 'cpu' && currentPlayer === 'X' ? 'Your move' : (who + "'s turn");
      setStatus(whoText + ' — <span class="' + label + '">' + who + '</span>');
    }
  }

  function updateScoreboard(){
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDrawEl.textContent = scores.draw;
  }

  function drawWinLine(combo){
    var start = CELL_CENTERS[combo[0]];
    var end = CELL_CENTERS[combo[2]];
    winLineEl.setAttribute('x1', start[0]);
    winLineEl.setAttribute('y1', start[1]);
    winLineEl.setAttribute('x2', end[0]);
    winLineEl.setAttribute('y2', end[1]);
    // force reflow so the transition replays each time
    winLineEl.classList.remove('show');
    void winLineEl.getBoundingClientRect();
    winLineEl.classList.add('show');
  }

  function clearWinLine(){
    winLineEl.classList.remove('show');
    winLineEl.setAttribute('x1', 0);
    winLineEl.setAttribute('y1', 0);
    winLineEl.setAttribute('x2', 0);
    winLineEl.setAttribute('y2', 0);
  }

  /* ---------- Game flow ---------- */
  function endGame(combo, winner){
    gameOver = true;
    if (combo){
      combo.forEach(function(i){ cells[i].classList.add('win'); });
      drawWinLine(combo);
    }
    if (winner === 'draw'){
      scores.draw++;
      setStatus("It's a draw!");
    } else {
      scores[winner]++;
      var label = winner === 'X' ? 'hl-x' : 'hl-o';
      var winnerText = (mode === 'cpu' && winner === 'O') ? 'Computer wins' : (winner + ' wins');
      setStatus('<span class="hl-win">' + winnerText + '!</span>');
    }
    updateScoreboard();
  }

  function playMove(index, player){
    if (board[index] || gameOver) return false;
    board[index] = player;
    renderBoard();
    cells[index].classList.add('mark-in');

    var combo = getWinningCombo(board);
    if (combo){
      endGame(combo, player);
      return true;
    }
    if (isBoardFull(board)){
      endGame(null, 'draw');
      return true;
    }

    currentPlayer = player === 'X' ? 'O' : 'X';
    updateStatusForOngoingGame();

    if (mode === 'cpu' && currentPlayer === 'O' && !gameOver){
      cpuThinking = true;
      setTimeout(cpuMove, 450);
    }
    return true;
  }

  function handleCellClick(e){
    var index = parseInt(e.currentTarget.dataset.index, 10);
    if (gameOver || board[index] || cpuThinking) return;
    if (mode === 'cpu' && currentPlayer !== 'X') return;
    playMove(index, currentPlayer);
  }

  /* ---------- Computer AI ---------- */
  function cpuMove(){
    cpuThinking = false;
    if (gameOver) return;
    var index = difficulty === 'unbeatable' ? bestMoveMinimax(board, 'O') : bestMoveEasy(board);
    if (index !== null && index !== undefined){
      playMove(index, 'O');
    }
  }

  function availableMoves(b){
    var moves = [];
    for (var i = 0; i < b.length; i++){
      if (!b[i]) moves.push(i);
    }
    return moves;
  }

  /* Easy AI: mostly random, but still blocks an immediate opponent win
     and takes an immediate win when available, so it feels fair rather
     than careless. */
  function bestMoveEasy(b){
    var moves = availableMoves(b);

    var winMove = findImmediateMove(b, 'O');
    if (winMove !== null) return winMove;

    var blockMove = findImmediateMove(b, 'X');
    if (blockMove !== null && Math.random() < 0.6) return blockMove;

    return moves[Math.floor(Math.random() * moves.length)];
  }

  function findImmediateMove(b, player){
    var moves = availableMoves(b);
    for (var i = 0; i < moves.length; i++){
      var copy = b.slice();
      copy[moves[i]] = player;
      if (getWinningCombo(copy)) return moves[i];
    }
    return null;
  }

  /* Unbeatable AI: full minimax with alpha-beta pruning. */
  function bestMoveMinimax(b, player){
    var bestScore = -Infinity;
    var move = null;
    var moves = availableMoves(b);

    // small opening-book shortcut: if board is empty, take a corner —
    // avoids a costly full search on the first move and plays naturally.
    if (moves.length === 9) return 0;

    moves.forEach(function(i){
      var copy = b.slice();
      copy[i] = player;
      var score = minimax(copy, 0, false, -Infinity, Infinity);
      if (score > bestScore){
        bestScore = score;
        move = i;
      }
    });
    return move;
  }

  function minimax(b, depth, isMaximizing, alpha, beta){
    var combo = getWinningCombo(b);
    if (combo){
      var winner = b[combo[0]];
      if (winner === 'O') return 10 - depth;
      if (winner === 'X') return depth - 10;
    }
    if (isBoardFull(b)) return 0;

    var moves = availableMoves(b);

    if (isMaximizing){
      var maxEval = -Infinity;
      for (var i = 0; i < moves.length; i++){
        var copy = b.slice();
        copy[moves[i]] = 'O';
        var evalScore = minimax(copy, depth + 1, false, alpha, beta);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (var j = 0; j < moves.length; j++){
        var copy2 = b.slice();
        copy2[moves[j]] = 'X';
        var evalScore2 = minimax(copy2, depth + 1, true, alpha, beta);
        minEval = Math.min(minEval, evalScore2);
        beta = Math.min(beta, evalScore2);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  /* ---------- New game / mode switching ---------- */
  function newGame(){
    board = new Array(9).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    cpuThinking = false;
    renderBoard();
    clearWinLine();
    updateStatusForOngoingGame();
  }

  function resetScores(){
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreboard();
  }

  function setMode(newMode){
    mode = newMode;
    Array.prototype.forEach.call(modeToggle.children, function(btn){
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });
    difficultyToggle.classList.toggle('hidden', newMode !== 'cpu');
    oLabelEl.textContent = newMode === 'cpu' ? 'O · CPU' : 'O';
    newGame();
  }

  function setDifficulty(newDiff){
    difficulty = newDiff;
    Array.prototype.forEach.call(difficultyToggle.children, function(btn){
      btn.classList.toggle('active', btn.dataset.diff === newDiff);
    });
    newGame();
  }

  /* ---------- Wire up events ---------- */
  cells.forEach(function(cell){
    cell.addEventListener('click', handleCellClick);
  });

  modeToggle.addEventListener('click', function(e){
    var btn = e.target.closest('.mode-btn');
    if (!btn) return;
    setMode(btn.dataset.mode);
  });

  difficultyToggle.addEventListener('click', function(e){
    var btn = e.target.closest('.diff-btn');
    if (!btn) return;
    setDifficulty(btn.dataset.diff);
  });

  newGameBtn.addEventListener('click', newGame);
  resetScoresBtn.addEventListener('click', resetScores);

  /* ---------- Init ---------- */
  updateStatusForOngoingGame();
  updateScoreboard();

})();
