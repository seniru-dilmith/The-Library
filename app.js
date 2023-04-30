// Getting dotenv
require('dotenv').config();

// requiring common packages
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const vanillajs = require("vanillajs");
const md5 = require("md5");

// creating app
const app = express();

// making connection to the database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "libDB"
});

// Create libDB database---------------------------------------------------------------------

try {
  connection.query("CREATE DATABASE IF NOT EXISTS libDB");
} catch (e) {
  console.log(e);
} finally {
  console.log("Tried creating libDB database");
}

// -----------------------------------------------------------------------------------------------
//
// Creating Table users----------------------------------------------------------------------

try {
  connection.query(`CREATE TABLE IF NOT EXISTS users (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    password MEDIUMTEXT,
    admin BOOL
      )`
    );
} catch (e) {
  console.log(e);
} finally {
  console.log("Tried creating table users in libDB database");
}

// ------------------------------------------------------------------------------------------

// Creating Table books----------------------------------------------------------------------

try {
  connection.query(`CREATE TABLE IF NOT EXISTS books (
    bookID INT PRIMARY KEY AUTO_INCREMENT,
    bookName VARCHAR(255),
    author VARCHAR(255),
    availability BOOL,
    availableOn DATE
    )`
  );
} catch (e) {
  console.log(e);
} finally {
  console.log("Tried creating table books in libDB database");
}

// ------------------------------------------------------------------------------------------

// Creating Table users----------------------------------------------------------------------

try {
  connection.query(`CREATE TABLE IF NOT EXISTS users (
  userID int NOT NULL AUTO_INCREMENT,
  firstName varchar(255) DEFAULT NULL,
  lastName varchar(255) DEFAULT NULL,
  email varchar(255) DEFAULT NULL,
  password mediumtext,
  admin tinyint(1) DEFAULT NULL,
  PRIMARY KEY (userID)
    )`
  );
} catch (e) {
  console.log(e);
} finally {
  console.log("Tried creating table users in libDB database");
}

// ------------------------------------------------------------------------------------------

// Connecting to database--------------------------------------------------------------------
//
// connection.connect((error) => {
//   console.log("Successfully connected to libDB");
// });
//
// // -------------------------------------------------------------------------------------------

// setting common things up
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static("public"));

// declaring some variables to use on html pages
var message_to_show = "";
var user_logged_in = false;
var admin_logged_in = false;
var user_notification = "";

// logged in user is the user currently logged in on the website
// this objects holds the data of him/her
var logged_in_user = {
  userID: 0,
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  admin: 0,
};

// temporary user is a object which holds a user's data until
// until he clicks the sign up button on the sign up page
var temporary_user = {
  userID: 0,
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  admin: 0,
};

// admin user is a user objects which holds data of an admin
// This object's purpose is to clarify whether the user is an admin or a regular user
var admin_user = {
  userID: 0,
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  admin: 1,
};

// this user count variable is used on sign up page 
// to determine whether, are there any users with the currnt email, 
// entered on the signup page
var data_count = 0;

// This variable also help to determine whether a user is
// an admin or a regular user,
// it holds "hidden" for a regular user and "" for an admin 
var hidden_or_no = "hidden";


// GET requests ---------------------------------------------------------------------------------------------------------

// Root------------------------------------------------------------------------------------------------------------------
app.get("/", function(req, res){
  
//   getting rendered the home page for users GET request
  res.render("home", {
    user_name: logged_in_user.first_name,
    user: logged_in_user,
    admin: admin_user,
  });
});
//-----------------------------------------------------------------------------------------------------------------------

// Login Route-----------------------------------------------------------------------------------------------------------

app.get("/login", function(req, res){

  //   getting rendered the login users GET request
    res.render("login", {
      message: user_notification,
      user_name: logged_in_user.first_name,
      user: logged_in_user,
      admin: admin_user,
    });

});

//-----------------------------------------------------------------------------------------------------------------------

// Sign-Up Route---------------------------------------------------------------------------------------------------------
app.get("/sign-up", function(req, res){

  //   getting rendered the sign-up page for users GET request
  res.render("sign-up", {
    message: message_to_show,
    user_name: logged_in_user.first_name,
    user: logged_in_user,
    admin: admin_user,
  });
});

//-----------------------------------------------------------------------------------------------------------------------

// Books-User Route------------------------------------------------------------------------------------------------------

app.get("/books-user", function(req, res){
  
//   rendering the same ejs template with different arguments for different scenarios

//      for a regular user
    if (admin_user.email==="") {
      hidden_or_no = "hidden";
    } else {
      
//       for an admin
      hidden_or_no = "";
    }

    if(user_logged_in===true){
      res.render("books-user", {
        user_name: logged_in_user.first_name,
        user: logged_in_user,
        admin: admin_user,
        visibility: hidden_or_no
      });
  } else if (admin_logged_in===true) {
    res.render("books-user", {
      user_name: admin_user.first_name,
      user: logged_in_user,
      admin: admin_user,
      visibility: hidden_or_no
    });
  } else {
    res.render("no-access", {
      user_name: logged_in_user.first_name,
      user: logged_in_user,
      admin: admin_user
    });
  }

});


//-----------------------------------------------------------------------------------------------------------------------

// Edit Account Route----------------------------------------------------------------------------------------------------

app.get("/edit-account", function(req, res){
  res.render("edit-account", {
    user_name: logged_in_user.first_name,
    user: logged_in_user,
    admin: admin_user,
    first_name: logged_in_user.first_name,
    last_name: logged_in_user.last_name,
    email: logged_in_user.email,
  });

});

//Logged-Out Route ---------------------------------------------------------------------------------------------------------

app.get("/logged-out", function(req, res){
  message_to_show = "";
  user_logged_in = false;
  admin_logged_in = false;
  user_notification = "";
  logged_in_user = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    admin:false,
  };

  admin_user = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    admin:true,
  };

  hidden_or_no = "hidden";
  admin_logged_in = false;


  res.render("logged-out", {
    user_name: logged_in_user.first_name,
    user: logged_in_user,
    admin: admin_user,
    visibility: hidden_or_no
  });

});

// Book List Route----------------------------------------------------------------------------------------------------------

app.get("/book-list-data", function(req, res){

  const sql = "SELECT * FROM books " +
  "ORDER BY bookID ASC";

  connection.query(sql, function(err, results){

    res.send(results);

  });

});

// --------------------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------------------------

//About Us Route---------------------------------------------------------------------------------------------------------

app.get("/about-us", function(req, res){
  res.render("about-us", {
    user_name: logged_in_user.first_name,
    user: logged_in_user,
    admin: admin_user,
    visibility: hidden_or_no
  });
});

//-----------------------------------------------------------------------------------------------------------------------

//FAQ Route--------------------------------------------------------------------------------------------------------------

app.get("/faq", function(req, res){
  res.render("faq", {
    user_name: logged_in_user.first_name,
    user: logged_in_user,
    admin: admin_user,
    visibility: hidden_or_no
  });
});

//-----------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------




// POST requests --------------------------------------------------------------------------------------------------------

// login-----------------------------------------------------------------------------------------------------------------
app.post("/login", function(req, res){

  var username_enrtered = req.body.user_email;
  var password_entered = md5(req.body.user_password);

  // const database = "libDB";
  // const collection = database."users";

  let query_1 = "SELECT DISTINCT userID, firstName, lastName, email, password, admin " +
  "FROM users " +
  "WHERE email = " + "'" + username_enrtered + "';";

  var user_data = {
    userID: 0,
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    admin: 0
  };

  if (user_data['userID']!==0) {

    connection.query(query_1, function(err, rows){

      console.log(query_1);

      user_data = {
        userID: parseInt(rows[0]['userID']),
        first_name: rows[0]['firstName'],
        last_name: rows[0]['lastName'],
        email: rows[0]['email'],
        password: rows[0]['password'],
        admin: parseInt(rows[0]['admin'])
      };

      console.log(user_data);
      console.log(password_entered + " is the converted from textbox.");

      if (user_data.password===password_entered && user_data!==null && user_data['admin']===0){

        user_logged_in = true;
        admin_logged_in = false;

        logged_in_user.userID = user_data.userID;
        logged_in_user.first_name = user_data.first_name;
        logged_in_user.last_name = user_data.last_name;
        logged_in_user.email = user_data.email;
        logged_in_user.password = user_data.password;
        logged_in_user.admin = 0;

        res.redirect("/books-user");

      } else if(user_data.password===password_entered && user_data!==null && user_data['admin']>0){

        user_logged_in = false;
        admin_logged_in = true;

        admin_user.userID = user_data.userID;
        admin_user.first_name = user_data.first_name;
        admin_user.last_name = user_data.last_name;
        admin_user.email = user_data.email;
        admin_user.password = user_data.password;
        admin_user.admin = 1;

        res.redirect("/books-user");

      } else {

        user_notification = "No user exits for above credentials. Please try again.";
        res.redirect("/login");

      }

    });

  } else {

    user_notification = "No user exits for above credentials. Please try again.";
    res.redirect("/login");

  }

});
// -----------------------------------------------------------------------------------------------------------------


// sign-up ---------------------------------------------------------------------------------------------------------
app.post("/sign-up", function(req, res){

  var used_data = 0;

  temporary_user.first_name = req.body.user_f_name;
  temporary_user.last_name = req.body.user_l_name;
  temporary_user.email = req.body.email_of_user;
  temporary_user.admin = 0;

  var password_entered = req.body.user_password_01;
  var again_entered_password = req.body.user_password_02;

  let query_2 = "SELECT COUNT(email) " +
  "FROM users " +
  "WHERE (users.email = " + "'" + temporary_user.email + "');";

  connection.query(query_2, function(err, rows){
    used_data = parseInt(rows[0]['COUNT(email)']);

    if (temporary_user.first_name!="" && temporary_user.last_name!="" && temporary_user.email!="" && password_entered!="" && again_entered_password!=""){
      if(used_data===0){
        if(password_entered===again_entered_password){

          logged_in_user.first_name = req.body.user_f_name;
          logged_in_user.last_name = req.body.user_l_name;
          logged_in_user.email = req.body.email_of_user;
          logged_in_user.admin = 0;

          password_status = "";
          logged_in_user.password = md5(password_entered);

        // const database = "libDB";
        // const collection = database."users";

          const sql = "INSERT INTO users (firstName, lastName, email, password, admin) " +
          "VALUES (" + "'" + logged_in_user.first_name.toString() + "'" + ", " + "'" + logged_in_user.last_name.toString() + "'" + ", " + "'" + logged_in_user.email.toString() + "'" + ", " + "'" + logged_in_user.password + "'" + ", 0)";

          connection.query(sql, function(err, rows){

            user_logged_in = true;
            logged_in_user = temporary_user;

          });

          res.redirect("/books-user");



        } else {
          message_to_show = "Passwords are't matching or empty! Check again!";
          res.redirect("/sign-up");
        }
      } else {
        message_to_show = "User already exists. Please use a different email!";
        res.redirect("/sign-up");
      }
    } else {
      message_to_show = "Any field should't be empty!";
      res.redirect("/sign-up");
    }

  });

});

// -------------------------------------------------------------------------------------------------------------------

// Add data to table-----------------------------------------------------------------------------------------------

app.post("/add_data", function(req, res){

  const book_name = req.body.book_name;
  const author_name = req.body.author_name;
  const availability = parseInt(req.body.availability);
  const availableOn = req.body.availableOn;

  const sql ="INSERT INTO books (bookName, author, availability, availableOn) " +
  "VALUES ('" + book_name + "', '" + author_name + "', " + availability + ", '" + availableOn + "')";

  connection.query(sql, function(err, rows){
    res.json({
      message: 'Data Added'
    });
  });

});

// ----------------------------------------------------------------------------------------------------------------------

// Update data on table route-----------------------------------------------------------------------------------------------

app.post("/update_data", function(req, res){

  const variable_name = req.body.variable_name;
  const variable_value = req.body.variable_value;
  const id = req.body.id;

  const sql =`UPDATE books
  SET ` +variable_name+ `="${variable_value}"
  WHERE bookID = "${id}" `;

  connection.query(sql, function(err, rows){

    res.json({
      message: "Data Updated"
    });

  });

});

// ----------------------------------------------------------------------------------------------------------------------

// Edit Details-------------------------------------------------------------------------------------------------------

app.post("/edit-account", function(req, res){

  logged_in_user.first_name = req.body.user_f_name;
  logged_in_user.last_name = req.body.user_l_name;
  logged_in_user.email = req.body.user_email;
  logged_in_user.admin = false;

  try {

    connection.query("UPDATE users" +
    "SET firstName = " + logged_in_user.first_name.toString() + ", lastName = " + logged_in_user.lastName.toString());

  } catch (e) {

    console.log(e);

  } finally {

    res.redirect("/edit-account")

  }

});

// ---------------------------------------------------------------------------------------------------------------------

// Delete Book Records-------------------------------------------------------------------------------------------------------

app.post("/delete_data", function(req, res){

  const id = req.body.id;

  const sql = `DELETE from books
  WHERE bookid=${id}`;

  connection.query(sql, function(err, rows){

    res.json({
      message: 'Data Deleted'
    });

  });

});

// ---------------------------------------------------------------------------------------------------------------------


// Listening ---------------------------------------------------------------------------------------------------------

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is up and running on port 3000");
});
