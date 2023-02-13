$('document').ready(function() {
    generatePagi();

    $('#group-list li').click(function(e) {
        var show = $(this).data('show');

        $('.showcase:visible')
            .removeClass('current')
            .addClass('hide');
        $('.showcase').filter('[data-show=' + show + ']')
            .removeClass('hide')
            .addClass('current');

        $('#group-list li.current').removeClass('current');
        $('#group-list li[data-show=' + show + ']').addClass('current');

        generatePagi();

    });

    function generatePagi() {
        var dataSource = $.makeArray($('.showcase.current article'));
        if(!dataSource.length) {
            return false;
        }

        $('.showcase.current #paginator').pagination({
            dataSource: dataSource,
            pageSize: 7,
            callback: function(data, pagination) {
                $(dataSource).hide();
                $(data).show();
            }
        });

    }

});