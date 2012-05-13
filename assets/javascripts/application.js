var Go = {};

$(document).ready(function(){
    Go.board = jgo_generateBoard($("#board"));
    Go.board.click = boardClick;
    Go.lastMovement = null;

    $("#board").attr('unselectable', 'on').css('-moz-user-select', 'none').each(function() {
        this.onselectstart = function() { return false; };
    });

    $("#enable_bot").live("submit", function(e) {
        $.post($(this).attr("action"));
        e.preventDefault();
    });
});

function streaming(){
    Go.source = new EventSource("/games/"+Go.gameId+"/stream");

    Go.source.addEventListener('gameplay', function(event) {
        var data = JSON.parse(event.data);
        var player = parseInt(data.player);
        if(player != Go.current) {
            var coord = new JGOCoordinate(data.move);
            var captures = Go.board.play(coord, player);
            playStoneSound();
            if(captures > 0) alert('Capturadas '+captures+' piedras');
            Go.turn = true;
        }
    }, false);

    Go.source.addEventListener('notice', function(event) {
        var data = JSON.parse(event.data);
        alert(data.message);
    }, false);
}


function boardClick(coord) {
    var stone = Go.board.get(coord);

    if(stone == JGO_CLEAR) {
        if(Go.turn == true) {
            var captures = Go.board.play(coord, Go.current);
            if(captures == -1) {
                alert('No se permite el suicidio');
            } else {
                playStoneSound();
                if(captures > 0) alert('Capturadas '+captures+' piedras');
                $.post("/games/"+Go.gameId, { move: coord.toString(), player: Go.current, _method: 'put' });
                Go.turn = false;
            }
        } else {
            alert('No es tu turno de jugar');
        }
    } else {
        alert('La posicion esta ocupada');
    }
}

function playStoneSound() {
    try {
        var sound = $("#stone_sound").get(0);
        sound.volume = 0.7;
        sound.currentTime = 0;
        sound.play();
    } catch(err) {
        alert("There was an error attempting to play a sound. Press OK to continue. " + err);
    }
}
