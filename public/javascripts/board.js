var App = {

  Note: Backbone.Model.extend({
    // TODO
  }),

  NoteView: Backbone.View.extend({
    className: 'note',

    initialize: function() {
      _.bindAll(this, 'render', 'move');
      this.model.bind('change', this.render);
    },

    render: function() {
      console.log(this.model);
      $(this.el).css({
        left: this.model.get('left') + 'px',
        top:  this.model.get('top') + 'px'
      }).draggable({
        stop: this.move
      }).text(
        this.model.get('content')
      );
      return this;
    },

    move: function(event, ui) {
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
