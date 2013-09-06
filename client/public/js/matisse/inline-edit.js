$(document).ready(function () {
    $('.editable').editable(function (value, settings) {
        var obj = $($(this)[0]);
        // check if changed at all
        if (value == "") {
            this.reset();
            return;
        }
        if (this.revert == value) {
            this.reset();
            return;
        }
        $.ajax({
            type: "POST",
            url: "/boards/update",
            data: {
                id: $(this)[0].id.replace('board-name-', ''),
                name: value
            }
        }).done(function (msg) {
                obj.addClass('success');
                setTimeout(function () {
                    obj.removeClass('success');
                }, 1000)
            }).fail(function (msg) {
                obj.addClass('error');
                setTimeout(function () {
                    obj.removeClass('error');
                }, 1000)
            });
        return (value);
    }, {
        indicator: 'Saving...',
        tooltip: 'Click to edit...',
        width: "140px",
        maxlength: "20",
        height: "20px"
    });
});