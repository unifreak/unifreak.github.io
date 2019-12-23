$('document').ready(function() {
    generatePagi();

    $('#post-list li').click(function(e) {
        var show = $(this).data('show');

        $('.showcase:visible')
            .removeClass('current')
            .addClass('hide');
        $('.showcase').filter('[data-show=' + show + ']')
            .removeClass('hide')
            .addClass('current');

        $('#post-list li.current').removeClass('current');
        $('#post-list li[data-show=' + show + ']').addClass('current');

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