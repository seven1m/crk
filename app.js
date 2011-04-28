
/**
 * Module dependencies.
 */

var express = require('express'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var app = module.exports = express.createServer();

// Configuration

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

var Note = mongoose.model('Note', new Schema({
  content: String,
  left:    Number,
  top:     Number,
  pin:     {type:     String,
            default:  'red',
            enum: ['red', 'green', 'blue', 'yellow']}
}));

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Crk'
  });
});

app.get('/notes', function(req, res){
  Note.find({}, function(err, notes){
    res.send(JSON.stringify(notes));
  });
});

app.post('/notes', function(req, res){
  var note = new Note(req.body);
  note.save(function(err){
    if(err) res.send('error');
    else res.send('success');
  });
});

app.put('/notes/:id', function(req, res){
  Note.update({_id: req.params.id}, req.body, {}, function(err){
    if(err) res.send('error');
    else res.send('success');
  });
});

app.delete('/notes/:id', function(req, res){
  var note = Note.findOne({_id: req.params.id});
  note.remove(function(err){
    if(err) res.send('error');
    else res.send('success');
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
