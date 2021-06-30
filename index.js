const express = require('express')
const fileUpload = require('express-fileupload')
const ObjectID = require('mongodb').ObjectID;
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = 5000
app.use(cors());
app.use(express.static('blog'));
app.use(fileUpload());
app.use(express.json())
app.get('/', (req, res) => {
    res.send("hello from db it's working")
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vlvew.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const blogContent = client.db("Blog").collection("Blog-Content");
    const adminInfo = client.db("Blog").collection("Admin-Data");
    
    // console.log('database connected');

    app.get('/blogContent', (req, res) => {
        blogContent.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    
    

//    app.post('/addBlog', (req, res) => {
//        const blog = req.body;
//     //    console.log(req.body)
//      const file =req.files.file;
//      const name=req.files.name;
//      console.log(blog,file,name); 
//      file.mv(`${__dirname}/blog/${file.name}`,err=>{
//          if(err){
//              console.log(err);
//              return res.status(500).send({msg:`Failed to upload image`});
//          }
//          return res.send({name:file.name,path:`/${file.name}`})
//      })
//     blogContent .insertOne(blog, (err, result) => {
//             res.send({count: result.insertedCount})
//         })
//     })


    app.post('/addBlog', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const date= new Date()
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        blogContent.insertOne({title,description,date, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })


    app.get('/blogContentInfo/:id', (req, res) => {

        const { id } = req.params;

        blogContent.find({_id: ObjectID(id)})
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    

  

    app.delete('/deleteBlog/:id', (req, res) => {
        const id = req.params.id;
        // console.log(id)
        blogContent.findOneAndDelete({"_id":ObjectID(id)})
        .then(result => {
            res.send({count: result.deletedCount})
        })
  })
  
});

app.listen(process.env.PORT || port);
