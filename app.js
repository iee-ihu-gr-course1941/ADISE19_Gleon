//jshint esversion:6

//imports
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//root page
app.get("/",function(req,res){
  res.render("index");
});

//server start
app.listen(3000,function(){
  console.log("Server started on port 3000");
});
