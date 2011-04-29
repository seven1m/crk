(function($) {
  $.fn.scrollIntoView = function(duration, complete) {
    var html = document.getElementsByTagName('html')[0];
    var pos = this.position();
    $('body').animate({
      scrollLeft: pos.left - (html.clientWidth  / 2) + (this.outerWidth()  / 2),
      scrollTop: pos.top  - (html.clientHeight / 2) + (this.outerHeight() / 2)
    }, duration || 500, complete);
  };
})(jQuery);
