 const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://vishnu_reddy:vishnu@123@cluster0.mligh.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Ht the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to deete and item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
// const day = date.getDate();
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log("FUCK!!!");
          console.log(err);
        }else{
          console.log("Successfully saved default items to the DB");
        }
      });
      res.redirect("/")
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted checked Item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:site", function(req,res){
  const requestedSite = _.capitalize(req.params.site);

  List.findOne({name: requestedSite}, function(err, foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        const list = new List ({
          name: requestedSite,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + requestedSite);
      }else{
        res.render("list", {listTitle: requestedSite, newListItems: foundList.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
