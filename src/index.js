function Cell(row, column, opened, flagged, mined, neighborMineCount) {
    return {
        id: row + "" + column,
        row: row,
        column: column,
        opened: opened,
        flagged: flagged,
        mined: mined,
        neighborMineCount: neighborMineCount
    }
}

function Board(boardSize, mineCount) {
    var board = {};
    for (var row = 0; row < boardSize; row++) {
        for (var column = 0; column < boardSize; column++) {
            board[row + "" + column] = Cell(row, column, false, false, false, 0);
        }
    }
    board = randomlyAssignMines(board, mineCount);
    board = calculateNeighborMineCounts(board, boardSize);
    return board;
}

var initializeCells = function (boardSize) {
    var row = 0;
    var column = 0;
    $('.cell').each(function () {
        $(this).attr('id', row + "" + column);
        column++;
        if (column >= boardSize) {
            column = 0;
            row++;
        }
        $(this).off().click(function (e) {
            handleClick($(this).attr("id"));
            var isVictory = true;
            var cells = Object.keys(board);
            for (var i = 0; i < cells.length; i++) {
                if (!board[cells[i]].mined) {
                    if (!board[cells[i]].opened) {
                        isVictory = false;
                        break;
                    }
                }
            }
            if (isVictory) {
                gameOver = true;
                $('#messageBox').text("你赢了!");
                clearInterval(timeout);
            }
        });
        $(this).contextmenu(function (e) {
            handleRightClick($(this).attr("id"));
            return false;
        });
    });
}
var handleClick = function (id) {
    if (!gameOver) {
        if (ctrlIsPressed) {
            handleCtrlClick(id);
        } else {
            var cell = board[id];
            var $cell = $('#' + id);
            if (!cell.opened) {
                if (!cell.flagged) {
                    if (cell.mined) {
                        loss();
                        $cell.html(`<span class="text">${MINE}</span>`).css('color', 'red');
                    } else {
                        cell.opened = true;
                        if (cell.neighborMineCount > 0) {
                            $cell[0].className += " severity" + cell.neighborMineCount;
                            $cell.html(`<span class="text">${cell.neighborMineCount}</span>`);
                        } else {
                            $cell.html("");
                            var neighbors = getNeighbors(id);
                            for (var i = 0; i < neighbors.length; i++) {
                                var neighbor = neighbors[i];
                                if (typeof board[neighbor] !== "undefined" && !board[neighbor].flagged && !board[neighbor].opened) {
                                    handleClick(neighbor);
                                }
                            }
                        }
                        $cell[0].className += " clear";
                    }
                }
            }
        }
    }
}
var handleCtrlClick = function (id) {
    var cell = board[id];
    var $cell = $('#' + id);
    if (cell.opened && cell.neighborMineCount > 0) {
        var neighbors = getNeighbors(id);
        var flagCount = 0;
        var flaggedCells = [];
        var neighbor;
        for (var i = 0; i < neighbors.length; i++) {
            neighbor = board[neighbors[i]];
            if (neighbor.flagged) {
                flaggedCells.push(neighbor);
            }
            flagCount += neighbor.flagged;
        }
        var lost = false;
        if (flagCount === cell.neighborMineCount) {
            for (var i = 0; i < flaggedCells.length; i++) {
                if (flaggedCells[i].flagged && !flaggedCells[i].mined) {
                    loss();
                    lost = true;
                    break;
                }
            }
            if (!lost) {
                for (var i = 0; i < neighbors.length; i++) {
                    neighbor = board[neighbors[i]];
                    if (!neighbor.flagged && !neighbor.opened) {
                        ctrlIsPressed = false;
                        handleClick(neighbor.id);
                    }
                }
            }
        }
    }
}

var handleRightClick = function (id) {
    if (!gameOver) {
        var cell = board[id];
        var $cell = $('#' + id);
        if (!cell.opened) {
            if (!cell.flagged && minesRemaining > 0) {
                cell.flagged = true;
                $cell.html(`<span class="text">${FLAG}</span>`).css('color', 'red');
                minesRemaining--;
            } else if (cell.flagged) {
                cell.flagged = false;
                $cell.html("");
                minesRemaining++;
            }
            $('#mines-remaining').text(minesRemaining);
        }
    }
}
var loss = function () {
    gameOver = true;
    $('#messageBox').text('游戏结束');
    var cells = Object.keys(board);
    for (var i = 0; i < cells.length; i++) {
        if (board[cells[i]].mined && !board[cells[i]].flagged) {
            $('#' + board[cells[i]].id).html(`<span class="text">${MINE}</span>`).css('color', 'black');
        }
    }
    clearInterval(timeout);
};

var randomlyAssignMines = function (board, mineCount) {
    var mineCooridinates = [];
    for (var i = 0; i < mineCount; i++) {
        var randomRowCoordinate = getRandomInteger(0, boardSize);
        var randomColumnCoordinate = getRandomInteger(0, boardSize);
        var cell = randomRowCoordinate + "" + randomColumnCoordinate;
        while (mineCooridinates.includes(cell)) {
            randomRowCoordinate = getRandomInteger(0, boardSize);
            randomColumnCoordinate = getRandomInteger(0, boardSize);
            cell = randomRowCoordinate + "" + randomColumnCoordinate
        }
        mineCooridinates.push(cell);
        board[cell].mined = true;
    }
    return board;
}

var calculateNeighborMineCounts = function (board, boardSize) {
    var cell;
    var neighborMineCount = 0;
    for (var row = 0; row < boardSize; row++) {
        for (var column = 0; column < boardSize; column++) {
            var id = row + "" + column;
            cell = board[id];
            if (!cell.mined) {
                var neighbors = getNeighbors(id);
                neighborMineCount = 0;
                for (var i = 0; i < neighbors.length; i++) {
                    neighborMineCount += isMined(board, neighbors[i]);
                }
                cell.neighborMineCount = neighborMineCount;
            }
        }
    }
    return board;
}

var getNeighbors = function (id) {
    var row = parseInt(id[0]);
    var column = parseInt(id[1]);
    var neighbors = [];
    neighbors.push((row - 1) + "" + (column - 1));
    neighbors.push((row - 1) + "" + column);
    neighbors.push((row - 1) + "" + (column + 1));
    neighbors.push(row + "" + (column - 1));
    neighbors.push(row + "" + (column + 1));
    neighbors.push((row + 1) + "" + (column - 1));
    neighbors.push((row + 1) + "" + column);
    neighbors.push((row + 1) + "" + (column + 1));
    for (var i = 0; i < neighbors.length; i++) {
        if (neighbors[i].length > 2) {
            neighbors.splice(i, 1);
            i--;
        }
    }
    return neighbors;
}

var isMined = function (board, id) {
    var cell = board[id];
    var mined = 0;
    if (typeof cell !== 'undefined') {
        mined = cell.mined ? 1 : 0;
    }
    return mined;
}

var getRandomInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var newGame = function (boardSize, mines) {
    $('#time').text("0");
    $('.messageBox').text('开始游戏');
    minesRemaining = mines;
    $('#mines-remaining').text(minesRemaining);
    gameOver = false;
    initializeCells(boardSize);//初始化单元格
    board = Board(boardSize, mines);
    timer = 0;
    clearInterval(timeout);
    timeout = setInterval(function () {
        timer++;
        if (timer >= 999) {
            timer = 999;
        }
        $('#time').text(timer);
    }, 1000);
    return board;
};


var FLAG = "&#9873;"; //标记
var MINE = "&#9881;";//炸弹
var boardSize = 10;//面板大小
var mines = 10;//炸弹数
var timer = 0;//时间
var timeout;
var minesRemaining;//炸弹剩余数

$(document).keydown(function (event) {
    if (event.ctrlKey)
        ctrlIsPressed = true;
});

$(document).keyup(function () {
    ctrlIsPressed = false;
});

var ctrlIsPressed = false;
var board = newGame(boardSize, mines);

$('#new-game-button').click(function () {
    board = newGame(boardSize, mines);
});












