var App = {};

App.Note = Backbone.Model.extend({
  pinColors: ['red', 'green', 'blue', 'yellow'],

  initialize: function(attributes) {
    _.bindAll(this, 'changePin');
    var html = document.getElementsByTagName('html')[0];
    var wsize = App.window.size();
    var defaults = {
      left: App.window.scroll().x + (wsize.width  / 2) - 125,
      top:  App.window.scroll().y + (wsize.height / 2) - 125,
      pin: 'red',
      client: App.clientId
    }
    this.set(_.extend(defaults, attributes));
  },

  validate: function(attributes) {
    if(attributes.left < -200) attributes.left = -200;
    if(attributes.top  < -180) attributes.top  = -180;
  },

  changePin: function() {
    var color = _.indexOf(this.pinColors, this.get('pin')) + 1;
    if(color > this.pinColors.length-1) color = 0;
    this.set({'pin': this.pinColors[color], client: App.clientId});
    this.save();
  },

  contentHtml: function() {
    var converter = new Showdown.converter();
    return converter.makeHtml($('<div/>').text(this.get('content') || '').html());
  }
});

App.NoteView = Backbone.View.extend({
  className: 'note',

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
      $('.delete-note').show().attr('href', '#notes/' + this.model.id + '/delete');
    } else {
      $(this.el).removeClass('note-selected');
      $('.delete-note').hide();
    }
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
    this.model.set({content: content, client: App.clientId}); // fires change, then render()
    this.model.save();
  },

  dragStart: function(event, ui) {
    $(this.el).addClass('note-drag');
  },

  dragStop: function(event, ui) {
    $(this.el).removeClass('note-drag');
    this.model.set({
      left: ui.position.left,
      top:  ui.position.top,
      client: App.clientId
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

App.WorkspaceView = Backbone.View.extend({
  className: 'workspace',
  scaleFactor: 0.03,

  initialize: function() {
    _.bindAll(this, 'render', 'setScroll');
    $(window).resize(this.render).scroll(this.render);
    this.slider = $('<div/>', {'class': 'work-area'});
    $(this.el).append(this.slider);
    controller.notes
      .bind('add', this.render)
      .bind('change', this.render)
      .bind('remove', this.render)
      .bind('refresh', this.render);
  },

  render: function() {
    var wsize = App.window.size();
    var scroll = App.window.scroll();
    this.slider.css({
      left:   scroll.x * this.scaleFactor,
      top:    scroll.y * this.scaleFactor,
      width:  wsize.width  * this.scaleFactor,
      height: wsize.height * this.scaleFactor
    }).draggable({
      containment: 'parent',
      scroll:      false,
      stop:        this.setScroll
    });
    var tns = this.$('.note-thumbnail');
    controller.notes.each(function(note, index) {
      var tn = tns.eq(index);
      if(tn.length == 0)
        tn = $('<div/>', {'class': 'note-thumbnail'}).appendTo(this.el);
      tn.css({
        left: note.get('left') * this.scaleFactor,
        top:  note.get('top')  * this.scaleFactor
      });
    }, this);
    for(var i=controller.notes.length; i<tns.length; i++) {
      tns.eq(i).remove();
    }
    return this;
  },

  setScroll: function(event, ui) {
    console.log(ui.position.left / this.scaleFactor + 1, ui.position.top / this.scaleFactor + 1);
    App.window.scroll(ui.position.left / this.scaleFactor + 1, ui.position.top / this.scaleFactor + 1);
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
    _.bindAll(this, 'show');
    $('#board').empty()
    this.notes = new App.NotesCollection();
    this.notes.fetch({success: function(collection){
      Backbone.history.start();
      var workspace = new App.WorkspaceView()
      $('body').append(workspace.render().el);
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

App.clientId = null;

App.setupSocket = function(controller) {
  var socket = new io.Socket();
  socket.connect();
  socket.on('connect', function() {
    App.clientId = socket.transport.sessionid;
  });
  var notes = controller.notes;
  socket.on('message', function(msg) {
    if(msg.data.client == App.clientId) return;
    switch(msg.action) {
      case 'create':
        notes.add(new App.Note(msg.data));
        break;
      case 'update':
        notes.get(msg.data.id).set(msg.data);
        break;
      case 'delete':
        notes.remove(notes.get(msg.data.id))
        break;
    }
  });
};

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
  App.setupSocket(controller);
  $('.new-note').button({
    icons: { primary: 'ui-icon-plusthick' }
  });
  $('.delete-note').button({
    icons: { primary: 'ui-icon-closethick' }
  }).hide();
});
