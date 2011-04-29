/**
 * Module dependencies.
 */

var express = require('express'),
    mongodb = require('mongodb');

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

function noteHash(note) {
  return {
    id:      note._id,
    content: note.content,
    left:    note.left,
    top:     note.top,
    pin:     note.pin
  }
}

var validPinColors = ['red', 'green', 'blue', 'yellow'];

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Crk'
  });
});

app.get('/notes', function(req, res){
  notes.find({}, {}, function(err, cursor){
    var result = [];
    cursor.each(function(err, note){
      if(note != null) result.push(noteHash(note));
      else res.send(result);
    });
  });
});

app.post('/notes', function(req, res){
  notes.insert(req.body, {safe: true}, function(err, docs){
    if(err) res.send(err, 500);
    else res.send(noteHash(docs[0]));
  });
});

app.put('/notes/:id', function(req, res){
  var note = req.body;
  if(validPinColors.indexOf(note.pin) == -1) note.pin = 'red';
  console.log(note);
  notes.update({_id: new ObjectID(req.params.id)}, note, {safe: true}, function(err, note){
    if(err) return res.send(err, 500);
    console.log(note);
    res.send(noteHash(note));
  });
});

app.delete('/notes/:id', function(req, res){
  notes.remove({_id: new ObjectID(req.params.id)}, function(err, result){
    if(err) res.send(err, 500);
    else res.send('success');
  });
});

// setup connections

var db = new mongodb.Db('crk', new mongodb.Server('localhost', 27017, {}));

var notes, ObjectID;

db.open(function(err, client){
  ObjectID = client.bson_serializer.ObjectID;
  client.collection('notes', function(err, collection) {
    notes = collection;
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port);
  })
});

