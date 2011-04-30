(function($) {
  $.fn.scrollIntoView = function(duration, complete) {
    var html = document.getElementsByTagName('html')[0];
    var pos = this.position();
    var x = pos.left - (html.clientWidth  / 2) + (this.outerWidth()  / 2),
        y = pos.top  - (html.clientHeight / 2) + (this.outerHeight() / 2)
    $('html, body').animate({scrollLeft: x, scrollTop: y}, duration || 500, complete);
  };
})(jQuery);
