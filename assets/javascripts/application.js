var Go = {};

$(document).ready(function(){
    Go.board = jgo_generateBoard($("#board"));
    Go.board.click = boardClick;

    $("#board").attr('unselectable', 'on').css('-moz-user-select', 'none').each(function() {
        this.onselectstart = function() { return false; };
    });
});


function boardClick(coord) {
    var stone = Go.board.get(coord);

    if(stone == JGO_CLEAR)
      Go.board.set(coord, JGO_BLACK);
    else if(stone == JGO_BLACK)
      Go.board.set(coord, JGO_WHITE);
    else
      Go.board.set(coord, JGO_CLEAR);
}
