

const express = require("express");
    const mongoose = require("mongoose");
    const bodyParser = require("body-parser");
    const _ = require("lodash");
    const app = express();
    
    app.set('view engine', 'ejs');
    app.use(express.urlencoded({ extended: true })); // Use built-in middleware
    app.use(express.static("public"));
    
    async function main() {

        await mongoose.connect('mongodb://127.0.0.1:27017/ListDB');

    
        const itemsSchema = new mongoose.Schema ({
            name: String,
        });
    
        const Item = mongoose.model("Item", itemsSchema);

        

        const item1=new Item({
            name: "Welcome to your list!"
        });

    
        
        const item2=new Item({
          name: "Write to your list."
        });


        const item3=new Item({
            name: "Delete to your list!"
        });

         const defaultItems=[item1, item2, item3]


 
       const appGet  = async () => {
         
        app.get("/", async(req, res) =>{

            const foundItems= await Item.find({});
        
        

            if (foundItems.length ===0 ) {
                await Item.insertMany(defaultItems);

            res.redirect("/");

        } else {
        
        res.render('list', {listTitle: "Today",  newListItems: foundItems})
        }
    
                    
    })};
    
         

appGet();
    


 async function Post () {

    app.post("/", async(req, res)=>{

        const itemName = req.body.newItem;
        const listName = req.body.list;
    
        const item = new Item({
    
            name: itemName
        });

        if (listName === "Today") {

            // If the list is "Today", save the item directly

            await item.save();

            res.redirect("/");

        } else {

            // Find the custom list by name

            const foundList = await List.findOne({ name: listName });


            if (foundList) {

                // If the list exists, push the new item to its items array

                foundList.items.push(item);

                await foundList.save(); // Save the updated list

                res.redirect("/" + listName); // Redirect to the custom list

            } else {

                // If the list does not exist, handle it (optional)

                console.log("List not found");

               // res.redirect("/");

            }
    

    };
    
});
};

 Post();


 async function Delete () {

app.post("/delete", async(req, res)=>{

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
     
        await Item.findByIdAndDelete(checkedItemId);

        res.redirect("/");

    } else {
      
     await List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}});
      res.redirect("/" + listName);



 } 
});
    }

  
 
 Delete();


 const listSchema=new mongoose.Schema ({
    name: String,
    items:[itemsSchema]
 });

 const List= mongoose.model ("List", listSchema);


async function Get () {

    
 app.get("/:customListName", async (req, res)=> {

    const customListName= _.capitalize(req.params.customListName);

     console.log("Requested list name:", customListName); // Log the requested list name


    const foundList = await List.findOne({ name: customListName });

    console.log("Found List:", foundList); // Debugging line


    if (!foundList) {

    const list = new List({

        name: customListName,

        items:defaultItems.map(item => ({ name: item.name })) // Save only the name

    });

    await list.save();

    console.log("Created new list:", list);

    res.redirect("/" + customListName); // Redirect to the new list

   

} else {

    // If the list exists, render it


 console.log("Rendering existing list with items:", foundList.items); // Debugging line

    res.render('list', { listTitle: foundList.name, newListItems: foundList.items });

    }
 });


}

Get();
 

   app.listen(3000, function(){
    console.log("Server started on port 3000");
});



    };

    
main().catch(err => console.log(err))

//mongoose.disconnect();
