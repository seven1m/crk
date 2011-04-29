var App = {};

App.Note = Backbone.Model.extend({
  pinColors: ['red', 'green', 'blue', 'yellow'],

  initialize: function() {
    _.bindAll(this, 'changePin');
  },

  validate: function(attributes) {
    if(attributes.left < -200) attributes.left = -200;
    if(attributes.top  < -180) attributes.top  = -180;
  },

  changePin: function() {
    var color = _.indexOf(this.pinColors, this.get('pin')) + 1;
    if(color > this.pinColors.length-1) color = 0;
    this.set({'pin': this.pinColors[color]});
    this.save();
  },

  contentHtml: function() {
    return $('<div/>').text(this.get('content') || '').html().replace(/\n/g, '<br/>');
  }
});

App.NoteView = Backbone.View.extend({
  className: 'note',

  initialize: function() {
    _.bindAll(this, 'render', 'select', 'editStart', 'editStop', 'dragStart', 'dragStop');
    this.model.bind('change', this.render);
  },

  render: function() {
    $(this.el).css({
      left: this.model.get('left') + 'px',
      top:  this.model.get('top') + 'px'
    }).html(
      this.buildPin().add(
      $('<div/>', {'class': 'content'}))
    ).draggable({
      start: this.dragStart,
      stop:  this.dragStop,
      scroll: false,
      stack: '.note',
      cancel: '.content'
    }).css({
      position: 'absolute'
    }).click(
      this.select
    ).dblclick(
      this.editStart
    ).find('.content').html(
      this.model.contentHtml()
    );
    if(this.model.get('selected')) {
      $(this.el).addClass('note-selected').scrollIntoView();
    }
    else $(this.el).removeClass('note-selected');
    return this;
  },

  buildPin: function() {
    return $('<div/>', {'class': 'pin ' + this.model.get('pin') + '-pin'}).click(this.model.changePin);
  },

  select: function(event) {
    location.hash = 'notes/' + this.model.id;
    event.stopPropagation();
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
    this.model.save();
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
    this.model.save();
  }
});

App.NotesCollection = Backbone.Collection.extend({
  model: App.Note,

  url: '/notes',

  renderAll: function() {
    this.each(function(note) {
      this.render(note);
    }, this);
  },

  render: function(note) {
    var view = new App.NoteView({model: note});
    $('#board').append(view.render().el);
    return view;
  },

  clearSelection: function() {
    this.each(function(note) {
      note.set({'selected': false});
    });
  }
});

App.BoardController = Backbone.Controller.extend({
  routes: {
    'notes':     'index',
    'notes/new': 'create',
    'notes/:id': 'show'
  },

  initialize: function() {
    _.bindAll(this, 'show');
    $('#board').empty()
    this.notes = new App.NotesCollection();
    this.notes.fetch({success: function(collection){
      collection.renderAll();
      Backbone.history.start();
    }});
    $('#board').click(function() {
      location.hash = 'notes';
    });
  },

  index: function() {
    this.notes.clearSelection();
  },

  show: function(id) {
    this.notes.clearSelection();
    var note = this.notes.get(id)
    if(note) note.set({'selected': true});
  },

  create: function() {
    var html = document.getElementsByTagName('html')[0];
    var notes = this.notes;
    notes.create({
      left: $('body').scrollLeft() + (html.clientWidth  / 2) - 125,
      top:  $('body').scrollTop()  + (html.clientHeight / 2) - 125
    }, {success: function(note) {
      $(notes.render(note).el).dblclick();
    }});
    location.hash = 'notes'
  }
});

$(function() {
  var controller = new App.BoardController();
  $('.new-note').button({
    icons: { primary: 'ui-icon-plusthick' }
  });
});
