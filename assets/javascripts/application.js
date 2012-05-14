var Go = {};

$(document).ready(function(){

    Go.board = jgo_generateBoard($("#board"));
    Go.board.click = boardClick;
    Go.lastMovement = null;
    Go.scores = [0, 0, 0];

    $("#board").attr('unselectable', 'on').css('-moz-user-select', 'none').each(function() {
        this.onselectstart = function() { return false; };
    });

    $("#enable_bot").live("submit", function(e) {
        $.post($(this).attr("action"));
        e.preventDefault();
    });

    var even = (Go.moves.size % 2 == 0);
    Go.turn = (even && Go.current == JGO_BLACK) || (!even && Go.current == JGO_BLACK);
    streaming();
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
            if(captures > 0) {
                alert_meesage('', 'Capturadas '+captures+' piedras');
                Go.scores[player] += captures;
                updateScores();
            }
            Go.turn = true;
        }
    }, false);

    Go.source.addEventListener('notice', function(event) {
        var data = JSON.parse(event.data);
        alert_message('', data.message);
    }, false);
}


function boardClick(coord) {
    var stone = Go.board.get(coord);

    if(stone == JGO_CLEAR) {
        if(Go.turn == true) {
            var captures = Go.board.play(coord, Go.current);
            if(captures == -1) {
                alert_message('error', 'No se permite el suicidio');
            } else {
                playStoneSound();
                if(captures > 0) {
                    alert_message('', 'Capturadas '+captures+' piedras');
                    Go.scores[Go.current] += captures;
                    updateScores();
                }
                $.post("/games/"+Go.gameId, { move: coord.toString(), player: Go.current, _method: 'put' });
                Go.turn = false;
            }
        } else {
            alert_message('error', 'No es tu turno de jugar');
        }
    } else {
        alert_message('error', 'La posicion esta ocupada');
    }
}

function playStoneSound() {
    try {
        var sound = $("#stone_sound").get(0);
        sound.volume = 0.7;
        sound.load();
        sound.play();
    } catch(err) {
        alert_message('error', "There was an error attempting to play a sound. Press OK to continue. " + err);
    }
}

function updateScores() {
    $("#score_black").html(Go.scores[JGO_BLACK].toString());
    $("#score_white").html(Go.scores[JGO_WHITE].toString());
}

function alert_message(alertType, msg){
    var $flash = $("<div class='alert alert-"+alertType+"'><button class='close' data-dismiss='alert'>×</button>"+msg+".</div>").alert();
    $("#flashes").html($flash);

    setTimeout(function(){
        $flash.alert('close');
    }, 2500);
}
