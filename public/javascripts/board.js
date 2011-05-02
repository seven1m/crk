var App = {};

App.Note = Backbone.Model.extend({
  initialize: function(attributes) {
    var defaults = {
      left: App.window.scroll().x + (App.window.size().width  / 2) - 125,
      top:  App.window.scroll().y + (App.window.size().height / 2) - 125
    }
    this.set(_.extend(defaults, attributes));
  }
});

App.NoteView = Backbone.View.extend({
  className: 'note',

  events: {
    'click':         'select',
    'dblclick':      'editStart',
    'blur textarea': 'editStop'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'select', 'editStart', 'editStop', 'dragStart', 'dragStop', 'remove');
    this.model.bind('change', this.render).bind('remove', this.remove);
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
      cancel: '.content, textarea'
    }).css({
      position: 'absolute'
    }).find('.content').html(
      this.model.get('content')
    );
    if(this.model.get('selected')) {
      $(this.el).addClass('note-selected').scrollIntoView();
      $('.delete-note').show().attr('href', '#notes/' + this.model.id + '/delete');
    } else {
      $(this.el).removeClass('note-selected');
      $('.delete-note').hide();
    }
    return this;
  },

  buildPin: function() {
    return $('<div/>', {'class': 'pin red-pin'});
  },

  select: function(event) {
    location.hash = 'notes/' + this.model.id;
    event.stopPropagation();
  },

  editStart: function(event) {
    $('<textarea/>').appendTo(
      this.$('.content').empty()
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

  initialize: function(models) {
    _.bindAll(this, 'render', 'renderAll');
    this.bind('refresh', this.renderAll).bind('add', this.render);
  },

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
    'notes':            'index',
    'notes/new':        'create',
    'notes/:id/delete': 'delete',
    'notes/:id':        'show'
  },

  initialize: function() {
    $('#board').empty()
    this.notes = new App.NotesCollection();
    this.notes.fetch({success: function(collection){
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
    var notes = this.notes;
    notes.create({});
    location.hash = 'notes';
  },

  delete: function(id) {
    this.notes.get(id).destroy();
    location.hash = 'notes';
  }
});

App.window = {
  size: function() {
    var html = document.getElementsByTagName('html')[0];
    return {width: html.clientWidth, height: html.clientHeight};
  },
  scroll: function(x, y) {
    if(x && y) {
      $(window).scrollLeft(x).scrollTop(y);
    } else {
      return {
        x: $(window).scrollLeft(),
        y: $(window).scrollTop()
      };
    }
  }
};

var controller;

$(function() {
  controller = new App.BoardController();
  $('.new-note').button({
    icons: { primary: 'ui-icon-plusthick' }
  });
  $('.delete-note').button({
    icons: { primary: 'ui-icon-closethick' }
  }).hide();
});
