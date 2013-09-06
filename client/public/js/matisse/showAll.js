$('#showOwned').on('click', function(e){
    // We don't want this to act as a link so cancel the link action
    e.preventDefault();

    if($(this).text() == "Show all") {
        // Show all boards
        $('.ownedBoardHide').show();
        $(this).html("Hide all");
    }
    else {
        // Hide all boards
        $('.ownedBoardHide').hide();
        $(this).html("Show all");
    }
});
$('#showShared').on('click', function(e){
    // We don't want this to act as a link so cancel the link action
    e.preventDefault();

    if($(this).text() == "Show all") {
        // Show all boards
        $('.sharedBoardHide').show();
        $(this).html("Hide all");
    }
    else {
        // Hide all boards
        $('.sharedBoardHide').hide();
        $(this).html("Show all");
    }
});
//display "show all" links only when there are more than three white boards
$('div.whiteboardList').each(function() {
    if($(this).find('li').length > 3)
        $(this).parents('div.row').next('div.row').find('div#showAllCreateWhiteBoard').show();
});

function handleShowAllLink() {
    var ownedBoardDiv = $('div#ownedBoardList');
    var showAll = ownedBoardDiv.parents('div.row').next('div.row').find('div#showAllCreateWhiteBoard');
    var ownedBoardList = ownedBoardDiv.find('li');
    ownedBoardList.each(function(index) {
        index>2?$(this).addClass('ownedBoardHide'):$(this).removeClass('ownedBoardHide');
    });
    if(ownedBoardList.length <= 3) {
        showAll.hide();
        ownedBoardList.show();
    }
}

var handlerIn = function() {
    $(this).find('div.delete-board').slideDown('fast');
};

var handlerOut = function() {
    $(this).find('div.delete-board').slideUp('fast');
};

//Delete whiteboard handler
$('div.delete-board').on("click", function(event){
    event.preventDefault();
    return confirmDelete($(this));;

});

function confirmDelete(jqObject) {
    var answer = confirm("Delete board with title as '"+jqObject.attr('name')+"' ?");
    if (answer){
        deleteBoard(jqObject);
    }
    return false;
}

function deleteBoard(jqObject) {
    var self = jqObject;
    var boardId = self.attr('boardUrl');
    $.post('/remove', {boardUrl:boardId} , function(data) {
        if (data == "deleted") {
            self.hide();
            var boardImg = self.parents('div.thumbnail').find('img');
            var boardList = self.parents('li');
            boardImg.fadeOut('slow', function() {
                boardList.remove();
                handleShowAllLink();
                var ownedNumber = $('div.numButton').find('h3').first();
                var ownedModified = "<h3 style='display:none'>" + (ownedNumber.text() - 1) + "</h3>";
                ownedNumber.after(ownedModified);
                ownedNumber.slideUp('slow').next('h3').slideDown('slow',function() {$(this).prev('h3').remove();});
            });
        }
        else {
            console.log(data);
        }
    });
}
