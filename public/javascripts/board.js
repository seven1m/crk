var App = {

  Note: Backbone.Model.extend({
    // TODO
  }),

  NoteView: Backbone.View.extend({
    className: 'note',

    initialize: function() {
      _.bindAll(this, 'render', 'editStart', 'editStop', 'dragStart', 'dragStop');
      this.model.bind('change', this.render);
    },

    render: function() {
      $(this.el).css({
        left: this.model.get('left') + 'px',
        top:  this.model.get('top') + 'px'
      }).draggable({
        start: this.dragStart,
        stop:  this.dragStop
      }).dblclick(
        this.editStart
      ).text(
        this.model.get('content')
      );
      return this;
    },

    editStart: function(event) {
      $('<textarea/>').appendTo(
        $(this.el).empty()
      ).blur(
        this.editStop
      ).val(
        this.model.get('content')
      )[0].focus();
    },

    editStop: function(event) {
      var content = this.$('textarea').val();
      this.model.set({content: content});
      $(this.el).empty().text(content);
    },

    dragStart: function(event, ui) {
      $(this.el).addClass('note-drag');
    },

    dragStop: function(event, ui) {
      $(this.el).removeClass('note-drag');
      this.model.set({
        left: ui.position.left,
        top:  ui.position.top
      });
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
