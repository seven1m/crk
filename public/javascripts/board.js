var App = {

  Note: Backbone.Model.extend({
    pinColors: ['red', 'green', 'blue', 'yellow'],

    initialize: function() {
      _.bindAll(this, 'changePin');
    },

    changePin: function() {
      var color = _.indexOf(this.pinColors, this.get('pin')) + 1;
      if(color > this.pinColors.length-1) color = 0;
      this.set({'pin': this.pinColors[color]});
    },

  }),

  NoteView: Backbone.View.extend({
    className: 'note',

    initialize: function() {
      _.bindAll(this, 'render', 'editStart', 'editStop', 'dragStart', 'dragStop');
      this.model.bind('change', this.render);
    },

    render: function() {
      console.log('render');
      $(this.el).css({
        left: this.model.get('left') + 'px',
        top:  this.model.get('top') + 'px'
      }).html(
        this.buildPin().add(
        $('<div/>', {'class': 'content'}))
      ).draggable({
        start: this.dragStart,
        stop:  this.dragStop
      }).dblclick(
        this.editStart
      ).find('.content').text(
        this.model.get('content')
      );
      return this;
    },

    buildPin: function() {
      return $('<div/>', {'class': 'pin ' + this.model.get('pin') + '-pin'}).click(this.model.changePin);
    },

    editStart: function(event) {
      $('<textarea/>').appendTo(
        this.$('.content').empty()
      ).blur(
        this.editStop
      ).val(
        this.model.get('content')
      )[0].focus();
    },

    editStop: function(event) {
      var content = this.$('textarea').val();
      this.model.set({content: content}); // fires change, then render()
    },

    dragStart: function(event, ui) {
      $(this.el).addClass('note-drag');
    },

    dragStop: function(event, ui) {
      $(this.el).removeClass('note-drag');
      this.model.set({
        left: ui.position.left,
        top:  ui.position.top
      }, {silent: true});
    }
  })


};


// demo time:

var model;

$(function() {
  model = new App.Note({
    content: 'Hello World',
    left: 100,
    top: 100,
    pin: 'red'
  });
  var view = new App.NoteView({
    model: model
  });
  $('#board').append(view.render().el);
});
