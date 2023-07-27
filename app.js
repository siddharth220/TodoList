//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://harshitsiddharth56:lwgtrRedR34@cluster0.bzwsfni.mongodb.net/todolistDB", {useNewUrlParser: true})

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const firstItem = new Item ({
  name: "Welcome to your personal ToDo-List"
})

const secondItem = new Item ({
  name: "Hit the + to create a new item"
})

const thirdItem = new Item ({
  name: "<-- Hit this to check an item off your ToDo-List>"
})

const defaultItems = [firstItem, secondItem, thirdItem]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  Item.find({}).then(function (foundItems) {  
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
    .then(function () {  
      console.log("Successfully added default items");
    })
    .catch(function (err) {  
      console.log(err);
    })
    res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function (err) {  
    console.log(err);
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    }).catch((err)=>{
      console.log(err);
    })
  }
});

app.post("/delete", function (req, res) {  
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemID).then(() => console.log("Successfully deleted")).catch((err) => console.log(err))
    res.redirect("/") 
  } else {
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.pull({_id: checkedItemID})
      foundList.save()
      res.redirect("/"+listName)
    }).catch((err)=>{
      console.log(err);
    })
  }
})

app.get("/:customListName", function (req, res) {  
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName}).then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
      
        list.save()
        res.redirect("/"+customListName)
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
  }).catch((err) => {
    console.log(err);
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
