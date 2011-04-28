var App = {

  Note: Backbone.Model.extend({
    // TODO
  }),

  NoteView: Backbone.View.extend({
    className: 'note',

    initialize: function() {
      _.bindAll(this, 'render', 'dragStart', 'dragStop');
      this.model.bind('change', this.render);
    },

    render: function() {
      console.log(this.model);
      $(this.el).css({
        left: this.model.get('left') + 'px',
        top:  this.model.get('top') + 'px'
      }).draggable({
        start: this.dragStart,
        stop:  this.dragStop
      }).text(
        this.model.get('content')
      );
      return this;
    },

    dragStart: function(event, ui) {
      $(this.el).addClass('note-drag');
    },

    dragStop: function(event, ui) {
      $(this.el).removeClass('note-drag');
      console.log(ui.position.left, ui.position.top);
    }
  })


};


// demo time:

var model;

$(function() {
  model = new App.Note({
    content: 'Hello World',
    left: 100,
    top: 100
  });
  var view = new App.NoteView({
    model: model
  });
  $('#board').append(view.render().el);
});
