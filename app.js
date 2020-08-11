//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const path = require("path"); 
// const crypto = require("crypto");
const multer = require("multer");
// const GridFsStorage = require("multer-gridfs-storage");
// const Grid = require ("gridfs-stream");
const methodOverride = require("method-override");
const port = 3000;
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();



//Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// app.use(methodOverride("_method"));
app.use(express.static("public"));
require('dotenv').config()

//Mongo URI & Create Mongo Connection

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

//public folder

app.use(express.static("./public"))

//set storage engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb){ 
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

//init upload
const upload = multer ({
  storage: storage,
  limits: {fileSize: 5000000},
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
}}).single("myImage");

//check file type
function checkFileType (file, cb){
  //allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  //check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!")
  }
}

// "/" or Root Route - Get and Post

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      posts: posts
      });
  });
});

//mongoose schema

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

// "/compose" route - Get and Post

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});


app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

// GET /gallery

app.get("/journal", function (req, res){
  res.send("hello");


})

// GET /upload

app.get("/upload", function(req, res){
  res.render("upload");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err){
      res.render("upload", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render ("upload", {
          msg: "Error: No File Selected!"
        });
      } else {
        res.render("upload", {
          msg: "File Uploaded Successfully!",
          file: `uploads/${req.file.filename}`
        });
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

//listening on port locally

app.listen(port, () => 
  console.log(`Server started on port ${port}`)
);
