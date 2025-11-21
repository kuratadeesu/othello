$(function () {

  const SIZE = 8;
  let board;
  let current;

  const DIRS = [
    [0,1],[1,1],[1,0],[1,-1],
    [0,-1],[-1,-1],[-1,0],[-1,1]
  ];

  // ポップアップ
  const $resultPopup = $("#resultPopup");
  const $resultText  = $("#resultText");
  const $passPopup   = $("#passPopup");
  const $passText    = $("#passText");

  // 初期化
  function initBoard() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    board[3][3] = 2; board[4][4] = 2;
    board[3][4] = 1; board[4][3] = 1;
    current = 1;
  }

  initBoard();

  // 裏返せる石を取得
  function getFlips(x, y, color) {
    if (board[y][x] !== 0) return [];
    let flips = [];

    for (const [dx, dy] of DIRS) {
      let px = x + dx, py = y + dy;
      let temp = [];

      while (px >= 0 && py >= 0 && px < SIZE && py < SIZE) {
        if (board[py][px] === 0) break;

        if (board[py][px] === color) {
          if (temp.length > 0) flips.push(...temp);
          break;
        }

        temp.push([px, py]);
        px += dx; py += dy;
      }
    }
    return flips;
  }

  // 置ける場所
  function getAllValidMoves(color) {
    let moves = [];
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++)
        if (getFlips(x, y, color).length > 0) moves.push([x, y]);
    return moves;
  }

  // 石数
  function countStones() {
    let black = 0, white = 0;
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if (board[y][x] === 1) black++;
        if (board[y][x] === 2) white++;
      }
    return { black, white };
  }

  // 勝敗判定
  function checkGameEnd() {
    const blackMoves = getAllValidMoves(1);
    const whiteMoves = getAllValidMoves(2);

    if (blackMoves.length === 0 && whiteMoves.length === 0) {
      const { black, white } = countStones();

      let msg = `黒: ${black} 石\n白: ${white} 石\n\n`;
      if (black > white) msg += "黒の勝ち！";
      else if (white > black) msg += "白の勝ち！";
      else msg += "引き分け！";

      $resultText.text(msg);
      $resultPopup.addClass("active");
      return true;
    }
    return false;
  }

  // 描画
  function render() {
    const $board = $("#board");
    $board.empty();

    const moves = getAllValidMoves(current);

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {

        const $cell = $(`<div class="cell" data-x="${x}" data-y="${y}"></div>`);

        if (board[y][x] !== 0) {
          const color = board[y][x] === 1 ? "black" : "white";

          $cell.append(`
            <div class="stone">
              <div class="front ${color}"></div>
              <div class="back ${color === "black" ? "white" : "black"}"></div>
            </div>
          `);
        }

        if (moves.some(m => m[0] === x && m[1] === y))
          $cell.addClass("highlight");

        $board.append($cell);
      }
    }

    const { black, white } = countStones();
    $("#score").text(`黒 ${black}石 | 白 ${white}石`);
    $("#turn").text(current === 1 ? "黒の番です" : "白の番です");
  }

  // クリック処理
  $("#board").on("click", ".cell", function () {
    const x = +$(this).data("x");
    const y = +$(this).data("y");

    const flips = getFlips(x, y, current);
    if (flips.length === 0) return;

    // 石を置く
    board[y][x] = current;

    // 裏返し
    flips.forEach(([fx, fy]) => board[fy][fx] = current);

    render();

    // 裏返しアニメ
    flips.forEach(([fx, fy]) => {
      $(`.cell[data-x=${fx}][data-y=${fy}] .stone`).addClass("flip");
    });

    // 手番交代
    current = current === 1 ? 2 : 1;

    // ★ 勝敗判定（両者打てない）
    if (getAllValidMoves(1).length === 0 && getAllValidMoves(2).length === 0) {
      checkGameEnd();
      return;
    }

    // ★ 片方だけ置けない → パス
    if (getAllValidMoves(current).length === 0) {
      const name = current === 1 ? "黒" : "白";
      $passText.text(`${name}は置ける場所がないためパス！`);
      $passPopup.addClass("active");
      return;
    }

    render();
  });

  // 再スタート
  $("#restartBtn").click(() => {
    $resultPopup.removeClass("active");
    initBoard();
    render();
  });

  // パスOK
  $("#passOk").click(() => {
    $passPopup.removeClass("active");
    current = current === 1 ? 2 : 1;
    render();
  });

  render();
});
