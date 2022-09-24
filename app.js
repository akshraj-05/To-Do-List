
//accessing all the erequired npm  packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();



//custome pakcage for finding current date
// const date = require(__dirname + "/date.js");


//all the set and connection works
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true
});



//making some default data in db
const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "hello"
});
const item2 = new Item({
    name: "hello brother"
});
const item3 = new Item({
    name: "hello sister"
});

const defaultItems = [item1, item2, item3];



//schema of the userdefined list
const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {


    // let day = date.getDay();


    //collecting all the data of Items collection
    Item.find({}, function (err, foundItems/*result*/) {

        //means if collection is empty than add all the default array object this will stop repetation
        if (foundItems.length == 0) {


            Item.insertMany(defaultItems, function (err) {

                if (err) {
                    console.log(err);
                }
                else {
                    console.log("item added to data base successfully!");
                }
            });

            //redirecting is most important because if we dont write this server has no idea where to go after this
            res.redirect("/");

        }
        else {

            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })

});

app.get("/:customListName", function (req, res) {

    const customListName = _.capitalize(req.params.customListName);


    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {

            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });

});


app.post("/", function (req, res) {


    let itemName = req.body.newItem;
    let listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    // let day = date.getDay();

    //if post request is for home rout
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }

    //if not
    else {

        //find one wil find first one instance of query  
        //in result actual out coe of the query is stored 
        List.findOne({ name: listName }, function (err, foundList) {

            //store newly created item in collection 
            foundList.item.push(item);
            foundList.save();
            //and redirecting to particular rout
            res.redirect("/" + listName);
        });
    }
});

//this is for deleting data 
app.post("/delete", function (req, res) {


    //will return the document in collection which we are want to delete
    let checkedItemId = req.body.checkbox;
    let listName = req.body.listname;

    if (listName == "Today") {
        //function for delete one item

        Item.findByIdAndRemove(checkedItemId, function (err) {

            if (!err) {
                console.log("successfully deleted item");
                //after this redirect to home route
                res.redirect("/");
            }


        });
    }
    else {

        //function for deleting from array
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } },
            function (err, foundList) {

                if (!err) {
                    res.redirect("/" + listName);
                }
            }

        );


    }
});

app.listen(3000, function () {
    console.log("server is running on port 3000");
});
