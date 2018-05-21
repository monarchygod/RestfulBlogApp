var bodyParser          = require('body-parser'),
    expressSanitizer    = require('express-sanitizer'),
    mongoose            = require('mongoose'),
    express             = require('express'),
    morgan              = require('morgan'),
    methodOverride      = require('method-override'),
    app                 = express();

//connect to mongodb
mongoose.connect('mongodb://localhost/rest_blog_app');

//mongoose schema
var blogShema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    created: {type: Date, default: Date.now}
});

//compile mongoose schema
var Blog = mongoose.model('Blog', blogShema);

//create first blog post


//app config
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(morgan('dev'));
app.use(methodOverride('_method'));


//Routes
//root redirect to home
app.get('/', function(req, res){
    res.redirect('/blogs')
});
//index route
app.get('/blogs', function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error!")
        }else{
             res.render('index', {blogs: blogs});
        }
    })
});

//New form route
app.get('/blogs/new', function(req, res){
    res.render('new');
});

//create route
app.post('/blogs', function(req, res) {
    req.body.blog.description = req.sanitize(req.body.blog.description);
    Blog.create(req.body.blog, function (err, blogCreated) {
        if (err) {
            console.log(err);
        } else {
            console.log('New Blog post created!');
            res.redirect('/blogs');
        }
    });
});
//show route
app.get('/blogs/:id', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('single', {blog: foundBlog});
        }
    });
});

//Edit route
app.get('/blogs/:id/edit', function(req, res, next){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        }else{
            res.render('edit', {blog: foundBlog});
            next();
        }
    });
});

//update route
app.put('/blogs/:id', function(req, res){
    req.body.blog.description = req.sanitize(req.body.blog.description);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect('/blogs');
        }else {
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

//Delete route
app.delete('/blogs/:id', function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/blogs');
        }else {
            res.redirect('/blogs/');
            console.log('Post deleted')
        }
    });
});

app.listen(3000, function(){
    console.log('Server running on port 3000');
});