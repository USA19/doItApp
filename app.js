const express=require('express');
const bodyParser=require('body-parser');
const path=require('path');
const mongoose=require('mongoose');
const _=require('lodash');
const app=express();

app.set('views','views');
app.set('view engine','ejs');



// app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')));

mongoose.connect("mongodb://localhost:27017/toDOList",{ useNewUrlParser: true , useUnifiedTopology: true });
//,function(err){
//         if(err){
//             throw err;
//         }
//         else{
//             app.listen(3000);

//         }
// });

const itemsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[1,"you haven't entered the name"]
    }

});
const Item=mongoose.model('Item',itemsSchema);

   const item1=new Item( {
        name:"Buy Food"
    });
    const item2= new Item( 
    {
        name:"Cook Food"
        });
const item3=new Item( { name:"Eat Food"});

const listSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    items:[]
});
const List=mongoose.model('List',listSchema);

// item.save();

// mongoose.connection.close();
// app.use((req,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin','*');
//     res.setHeader('Access-Control-Allow-Method','get,post,delete,option,put,patch,delete');
//     res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
// });

app.get('/',function(req,res){

    Item.find({},function(err,result){
       if(err){
           throw err;
       }
       else
       if(result.length===0){
        Item.insertMany([item1,item2,item3],function(err){
            if(err){
                throw err;
            }
            else{
                console.log('inserted');
            }
        });
        res.redirect('/');
       }else{
        res.render('index',{
            currentDay:"Today",
            items:result
    
        });
       }
   });
    

});
app.post('/',function(req,res){
    const item=req.body.newItem;
    const pageTitle=req.body.list;
   const listItem=new Item({
       name:item
   });
   if(pageTitle==="Today")
  {listItem.save();
    res.redirect('/');}
    else{
      List.findOne({name:pageTitle},function(err,foundItem){
          
          foundItem.items.push(listItem);
          foundItem.save();
          res.redirect('/'+pageTitle);

      });  
    }
});

app.post('/delete',function(req,res){
    const itemId=req.body.checkBox;
    const currentDay=req.body.listName;

    if(currentDay==="Today"){
    Item.findByIdAndRemove({
        _id:itemId
    } ,function(err){
        console.log(err);
    });
    res.redirect('/');}
    else{
           List.findOneAndUpdate({name:currentDay},{ $pull:{ items:{_id:itemId}}},function(err,foundList){
            

            if(!err){
                res.redirect('/'+currentDay);
                console.log(foundList);
            }

        });

    }

});

app.get('/:dynamicRoute',function(req,res){
    const customListName= _.capitalize(req.params.dynamicRoute);
    List.findOne({
        name:customListName
    },function(err,result){
        if (!err){
            if(!result){
                const customList=new List({
                    name:customListName,
                    items:[item1,item2,item3]});
                    customList.save();
                    res.redirect('/'+customListName);

            }
            else{
                console.log('list Exists');
                res.render('index',{
                    currentDay:customListName,
                    items:result.items
            
                });
                //render the existing list
            }
           
        }
        else{
              throw err;
            }
    })
  
});

app.listen(3000);


// mongoose.connection.close();