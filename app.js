
/**
 * Module dependencies.
 */

var express = require('express'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var app = module.exports = express.createServer();

// Configuration

app.configure('development', function(){
  app.use(express.logger());
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

mongoose.connect('mongodb://localhost/crk');

// Models

var NoteSchema = new Schema({
  content: String,
  left:    Number,
  top:     Number,
  pin:     {type:     String,
            default:  'red',
            enum: ['red', 'green', 'blue', 'yellow']}
})
NoteSchema.virtual('hash').get(function() {
  return {
    id:      this._id,
    content: this.content,
    left:    this.left,
    top:     this.top,
    pin:     this.pin
  }
});
var Note = mongoose.model('Note', NoteSchema);

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Crk'
  });
});

app.get('/notes', function(req, res){
  Note.find({}, function(err, notes){
    var result = [];
    notes.forEach(function(note) {
      result.push(note.hash);
    });
    res.send(result);
  });
});

app.post('/notes', function(req, res){
  var note = new Note(req.body);
  note.save(function(err){
    if(err) res.send(err, 500);
    else res.send(note.hash);
  });
});

app.put('/notes/:id', function(req, res){
  Note.findById(req.params.id, {}, {}, function(err, note){
    if(err) return res.send(err, 404);
    note.content = req.body.content;
    note.left    = req.body.left;
    note.top     = req.body.top;
    note.pin     = req.body.pin;
    note.save(function(err){
      if(err) res.send(err, 500);
      else res.send(note);
    });
  });
});

app.delete('/notes/:id', function(req, res){
  var note = Note.findOne({_id: req.params.id});
  note.remove(function(err){
    if(err) res.send(err, 500);
    else res.send('success');
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
