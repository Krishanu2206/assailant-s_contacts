const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express= require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const { v4: uuid } = require('uuid');
require('dotenv').config();

//middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly:true,
    expires : Date.now() + 24*60*60*1000,
    maxAge : 24*60*60*1000 }
}))

app.use(flash());

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD
  });

  let getRandomUser=()=>{
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
  }

app.use((req, res, next)=>{
  res.locals.successmessage = req.flash("success");
  res.locals.errormessage = req.flash("error");
  next();
})

// try{
// connection.query(q, [data], (err, result)=>{
//     if(err){
//         throw err;
//     }
//     console.log(result);
// });
// }catch(err){
//     console.log(err);
// }

// connection.end();

app.get('/hello', (req, res)=>{
  return res.status(200).send('<h1>HELLO WORLD</h1>')
})

app.get('/', async(req, res)=>{
  let q = 'SELECT count(*) FROM user';
  try {
    connection.query(q, (err, result)=>{
    if(err){
        throw err;
    }
    let count = result[0]["count(*)"];
    res.render("home.ejs", {count : count})
  });
  } catch (error) {
    console.log(error);
    res.send("Internal Server Error")
  }
})

app.get('/user', (req, res)=>{
  let q = 'SELECT * FROM user';
  try{
    connection.query(q, (err, result)=>{
      if(err) throw err;
      let users = result;
      console.log(users);
      res.render("users.ejs", {users : users});
    })
  }catch(error){
    console.log(error);
    res.send("Internal Server Error");
  }
})

app.get('/user/:id/edit', (req, res)=>{
  let q = `SELECT * FROM user WHERE (id=?)`
  try {
    connection.query(q, req.params.id, (err, result)=>{
      if(err) throw err;
      let user = result[0]; //result is an array so user is also an array
      console.log(user);
      res.render("edit.ejs", {user : user});
    })
  } catch (error) {
    console.log(error);
    res.send("Internal Server Error");
  }
})

app.patch('/user/:id', async(req, res)=>{
  let q1 = 'SELECT * FROM user WHERE (id=?)';
  let q2 = 'UPDATE user SET username=?, email=? WHERE (id=?)'
  try {
    const {password, username, email} = req.body;
    connection.query(q1, req.params.id, (err, result)=>{
      if(err) throw err;
      let user=result[0];
      if(user.password != password){
        res.render("error.ejs");
      }else{
        connection.query(q2, [username, email, req.params.id], (err, result)=>{
        if(err) throw err;
        const updateduser = result[0];
        console.log(updateduser);
        req.flash("success", "User updated successfully!");
        res.redirect("/user");
      });
      }
    });
    
  } catch (error) {
    console.log(error);
    res.send("Internal Server Error");
  }
});

app.get('/create-user', (req, res)=>{
  res.render("userform.ejs");
})

app.post('/user', async(req, res)=>{
  let {username, email, password} = req.body;
  let q = 'INSERT INTO user (id, username, email,password) VALUES (?, ?, ?, ?)';
  try{
    let id= uuid();
    connection.query(q, [id, username, email, password], (err, result)=>{
      if(err) throw err;
      let newuser = result[0];
      console.log(newuser);
      req.flash("success", `New User created!`)
      res.redirect('/user');
    })
  }catch(error){
    console.log(error);
    res.send("Internal Server Error");
  }
})

app.delete('/user/:id/delete', (req, res)=>{
  let q1='SELECT * FROM user WHERE (id=?)'
  let q2 = 'DELETE FROM user WHERE (id=?)';
  try{
    const {password} = req.body;
    connection.query(q1, req.params.id, (err, result)=>{
      if(err) throw err;
      let user = result[0];
      if(password !== user.password){
        res.render("error.ejs");
      }else{
        connection.query(q2, req.params.id, (err, result)=>{
        if(err) throw err;
        const deleteduser = result[0];
        console.log(deleteduser);
        req.flash("success", "User deleted successfully!");
        res.redirect("/user");
      });
      }
    })
  }
    catch(error){
    console.log(error);
    res.send("Internal Server Error");
  }
})

app.listen("8080", ()=>{
  console.log("server listening on port 8080");
});




