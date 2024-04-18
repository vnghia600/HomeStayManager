var lazyLoadMore = function () {
    return {
        restrict: 'A',
        link: function (scope, elem) {
            var scroller = elem[0];
            $(scroller).bind('scroll', function () {
                if (scroller.scrollTop + scroller.offsetHeight >= scroller.scrollHeight) {
                    scope.$apply('LoadMore()');
                }
            });
        }
    }
}
lazyLoadMore.$inject = [];