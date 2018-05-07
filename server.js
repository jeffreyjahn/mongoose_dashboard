const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
    secret: 'Jeffsrandomsecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))

const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const flash = require('express-flash');
app.use(flash());

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose');
mongoose.Promise = global.Promise;

const meerkatSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 1},
    favoriteFood: {type: String, required: true, minlength: 1},
    age: {type: Number, required: true, min:1, max:24}
}, {timestamps: true});

const Meerkat = mongoose.model('meerkats', meerkatSchema);

app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');

// rendering pages
app.get('/', function(req, res){
    Meerkat.find({}, function(err, meerkats){
        console.log(err);
        console.log(meerkats);
        res.render('index', {meerkats: meerkats});
    }).sort('-createdAt');
})
app.get('/meerkat/new', function(req, res){
    res.render('new_meerkat');
})
app.get('/meerkat/:id', function(req, res){
    Meerkat.findOne({_id: req.params.id}, function(err, meerkats){
        if(err) {
            res.redirect('/');
        };
        res.render('meerkat_info', {meerkats: meerkats});
    });
})
app.get('/meerkat/edit/:id', function(req, res){
    Meerkat.findOne({_id: req.params.id}, function(err, meerkats){
        if(err) {
            res.redirect('/');
        };
        res.render('meerkat_edit', {meerkats: meerkats});
    });
})

// post requests
app.post('/add_meerkat', function(req, res){
    var new_meerkat = new Meerkat(req.body);
    new_meerkat.save(function(err){
        if(err){
            console.log("wat", err);
            for(var key in err.errors){
                req.flash('meerkat_reg', err.errors[key].message);
            }
            res.redirect('/meerkat/new');
        } else{
            res.redirect('/');
        }
    });
});

app.post('/edit_meerkat/:id', function(req, res){
    Meerkat.update({_id: req.params.id}, req.body, function(err, result){
        if(err){
            res.redirect('/meerkat/edit/'+req.params.id);
        }else{
            res.redirect('/meerkat/'+req.params.id);
        }
    });
})

// destroy
app.get('/meerkat/destroy/:id', function(req, res){
    Meerkat.remove({_id: req.params.id}, function(err){
        res.redirect('/');
    });
    
})


app.listen(9999, function(){
    console.log('Local host listening on port: 9999.')
});