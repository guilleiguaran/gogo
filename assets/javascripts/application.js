var Go = {};
Go.turn = true;

$(document).ready(function(){
    Go.board = jgo_generateBoard($("#board"));
    Go.board.click = boardClick;

    $("#board").attr('unselectable', 'on').css('-moz-user-select', 'none').each(function() {
        this.onselectstart = function() { return false; };
    });
});


function boardClick(coord) {
    var stone = Go.board.get(coord);
    var group = Go.board.getGroup(coord);

    if(stone == JGO_CLEAR) {
        if(Go.board.hasLiberties(group)) {
            if(Go.turn == true) {
                Go.board.set(coord, JGO_BLACK);
            } else {
                Go.board.set(coord, JGO_WHITE);
            }
            Go.turn = !Go.turn;
            updateBoard();
        } else {
            alert('No se permite el suicidio');
        }
    } else {
        alert('La posicion esta ocupada');
    }
}

function updateBoard() {
    Go.board.each(function(coord) {
        var group = Go.board.getGroup(coord);
        if(!Go.board.hasLiberties(group)) {
            Go.board.set(coord, JGO_CLEAR);
        }
    });
}
