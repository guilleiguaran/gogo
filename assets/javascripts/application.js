var Go = {};

$(document).ready(function(){
    Go.board = jgo_generateBoard($("#board"));
    Go.board.click = boardClick;
    Go.lastMovement = null;

    $("#board").attr('unselectable', 'on').css('-moz-user-select', 'none').each(function() {
        this.onselectstart = function() { return false; };
    });
});

function setupStreaming(){
    Go.source = new EventSource("/games/"+Go.gameId+"/stream");
    Go.source.onmessage = function(event) {
        console.log(event);
    };
}


function boardClick(coord) {
    alert(coord);
    var stone = Go.board.get(coord);

    if(stone == JGO_CLEAR) {
        if(Go.turn == true) {
            captures = Go.board.play(coord, Go.current);
            if(captures == -1) {
                alert('No se permite el suicidio');
            } else {
                if(captures > 0) alert('Capturadas '+captures+' piedras');
                Go.turn = !Go.turn;
                $.post("/games/"+Go.gameId, { move: coord.copy, player: Go.current, _method: 'put' });
            }
        } else {
            alert('No es tu turno de jugar');
        }
    } else {
        alert('La posicion esta ocupada');
    }
}
