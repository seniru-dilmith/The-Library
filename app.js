// Getting dotenvDATBASE_HOSTNAME
require('dotenv').config();

// requiring common packages
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const vanillajs = require("vanillajs");
// below algorhythm is used to encrypt data
const md5 = require("md5");

// creating app
const app = express();

// getting private information from dotenv
const databaseHost = process.env.DATBASE_HOSTNAME;
const databasePassword = process.env.DATABASE_PASSWORD;
const databaseUser = process.env.DATABASE_USERNAME;
const databaseName = process.env.DATABASE_NAME;

// making connection to the database
const connection = mysql.createConnection({
  host: databaseHost,
  user: databaseUser,
  password: databasePassword,
  database: databaseName
});

// Create libDB database--------------------------------------------------------------------------

try {
  connection.query("CREATE DATABASE IF NOT EXISTS libDB");
} catch (e) {
  console.log(e);
} finally {
  console.log("Tried creating libDB database");
}

// -----------------------------------------------------------------------------------------------
//
// Creating Table users---------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------------------------

// Connecting to database------------------------------------------------------------------------
//
// connection.connect((error) => {
//   console.log("Successfully connected to libDB");
// });
//
// // -------------------------------------------------------------------------------------------

// setting body-parser up
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// allowing server to use static folder
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
//     is a user alreadey logged in?
//     then render this
    if(user_logged_in===true){
      res.render("books-user", {
        user_name: logged_in_user.first_name,
        user: logged_in_user,
        admin: admin_user,
        visibility: hidden_or_no
      });
      
//       or the logged in user is an admin?
//       then render this
  } else if (admin_logged_in===true) {
    res.render("books-user", {
      user_name: admin_user.first_name,
      user: logged_in_user,
      admin: admin_user,
      visibility: hidden_or_no
    });
//     currently is anyone not logged into the website?
//     then render the no-access page
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

// This allows users to change his first name and last name recorded in the database
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

// logging out from the website will delete logged in user's or admin user's data cached on to the website
// following code section is used to, set all the values, which are retrieved from the database, to default values
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

// following route shows normal users the list of books and admins to edit the book list
// which to render is determined on front-end
// have a look inside book-list.ejs to see the logic behind
app.get("/book-list-data", function(req, res){

  const sql = "SELECT * FROM books " +
  "ORDER BY bookID ASC";

  connection.query(sql, function(err, results){

    res.send(results);

  });

});

// --------------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------------------

//About Us Route-------------------------------------------------------------------------------------------------------------

// this route is for a simple page which shows everyone
// the about details of ther library
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

// faq route is also a simple route which
// holds frequently asked questions online and on-site
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

// this post rewquest triggers when the submit mutton on the login page is clicked
// the submit button the login page is the 'login' button on the /login route
app.post("/login", function(req, res){

//   the following two lines get hold of the username and password entered into the textboxes
  var username_enrtered = req.body.user_email;
  var password_entered = md5(req.body.user_password);

  // const database = databaseName;
  // const collection = database."users";

//   this line is the MySQL query for checking whether is there an account matching with the given username 
  let query_1 = "SELECT DISTINCT userID, firstName, lastName, email, password, admin " +
  "FROM users " +
  "WHERE email = " + "'" + username_enrtered + "';";

//   following object is created to temporary hold the user's data 
//   matching with the above credentials
  var user_data = {
    userID: 0,
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    admin: 0
  };

//   checking was there a matching user?
  if (user_data['userID']!==0) {

//     found a user, getting hold of his/her data 
    connection.query(query_1, function(err, rows){
      
//       saving retrieved data to the above created user_data object
      user_data = {
        userID: parseInt(rows[0]['userID']),
        first_name: rows[0]['firstName'],
        last_name: rows[0]['lastName'],
        email: rows[0]['email'],
        password: rows[0]['password'],
        admin: parseInt(rows[0]['admin'])
      };
      
//       passwords are matching and not an admin
      if (user_data.password===password_entered && user_data!==null && user_data['admin']===0){

        user_logged_in = true;
        admin_logged_in = false;

//         assingning values to the logged in user object
        logged_in_user.userID = user_data.userID;
        logged_in_user.first_name = user_data.first_name;
        logged_in_user.last_name = user_data.last_name;
        logged_in_user.email = user_data.email;
        logged_in_user.password = user_data.password;
        logged_in_user.admin = 0;
        
//         after assigning values, book list is shown to the user
        res.redirect("/books-user");

//         passwords are matching and user is an admin
      } else if(user_data.password===password_entered && user_data!==null && user_data['admin']>0){

        user_logged_in = false;
        admin_logged_in = true;
        
//         assigning the returned user's values to the admin user object
        admin_user.userID = user_data.userID;
        admin_user.first_name = user_data.first_name;
        admin_user.last_name = user_data.last_name;
        admin_user.email = user_data.email;
        admin_user.password = user_data.password;
        admin_user.admin = 1;

//         after assigning, the book list is returned to the user
        res.redirect("/books-user");

      } else {

//         if no matching user then the following message
//         will be displayed
        user_notification = "No user exits for above credentials. Please try again.";
//         reloading current page to clear the text boxes's current values
        res.redirect("/login");

      }

    });

  } else {

//     no user is returned and the message below is displayed
    user_notification = "No user exits for above credentials. Please try again.";
//     reloading the currnt page
    res.redirect("/login");

  }

});
// -----------------------------------------------------------------------------------------------------------------


// sign-up ---------------------------------------------------------------------------------------------------------

// post request of the submit button (sign-up button) 
app.post("/sign-up", function(req, res){

//   this varaible holds how many users are registered with the 
//   same email entered above
  var used_data = 0;

//   assigning the entered information to the temporary user object
  temporary_user.first_name = req.body.user_f_name;
  temporary_user.last_name = req.body.user_l_name;
  temporary_user.email = req.body.email_of_user;
  temporary_user.admin = 0;

//   getting hold of the two password fields
  var password_entered = req.body.user_password_01;
  var again_entered_password = req.body.user_password_02;

//   MySQL command for
//   counting registered users with the above entered email
  let query_2 = "SELECT COUNT(email) " +
  "FROM users " +
  "WHERE (users.email = " + "'" + temporary_user.email + "');";

//   executing the above command 
  connection.query(query_2, function(err, rows){
//     how many users have returned?
    used_data = parseInt(rows[0]['COUNT(email)']);
    
//     any field is not empty
    if (temporary_user.first_name!="" && temporary_user.last_name!="" && temporary_user.email!="" && password_entered!="" && again_entered_password!=""){
//       there are no registered users with the above email then 
      if(used_data===0){
//         are both passwords matching (entered and again entered)
        if(password_entered===again_entered_password){
          
//           saving user as a logged in user
          logged_in_user.first_name = req.body.user_f_name;
          logged_in_user.last_name = req.body.user_l_name;
          logged_in_user.email = req.body.email_of_user;
          logged_in_user.admin = 0;

          password_status = "";
//           passwoerd is encrypted when saving
          logged_in_user.password = md5(password_entered);

        // const database = databaseName;
        // const collection = database."users";

//           constructing the MySQL command for insertin g above data
          const sql = "INSERT INTO users (firstName, lastName, email, password, admin) " +
          "VALUES (" + "'" + logged_in_user.first_name.toString() + "'" + ", " + "'" + logged_in_user.last_name.toString() + "'" + ", " + "'" + logged_in_user.email.toString() + "'" + ", " + "'" + logged_in_user.password + "'" + ", 0)";

//           executing the insert command
          connection.query(sql, function(err, rows){

//             signed up user was lpogged into the website
            user_logged_in = true;
            logged_in_user = temporary_user;

          });
          
//           showing book list to the logged in user
          res.redirect("/books-user");



        } else {
//           if password aren't matched this block will get executed
          message_to_show = "Passwords are't matching or empty! Check again!";
          res.redirect("/sign-up");
        }
      } else {
//         if there's a user already registered with the entered email
//         this block will get executed
        message_to_show = "User already exists. Please use a different email!";
        res.redirect("/sign-up");
      }
    } else {
//       if one or more fiels are seems to be empty
//       this bl;ock will get executed
      message_to_show = "Any field should't be empty!";
      res.redirect("/sign-up");
    }

  });

});

// -------------------------------------------------------------------------------------------------------------------

// Add data to table--------------------------------------------------------------------------------------------------

// adding books to the books table
// only admins have access
// connected with front-end
app.post("/add_data", function(req, res){

//   getting hold of the data of the selected book
  const book_name = req.body.book_name;
  const author_name = req.body.author_name;
  const availability = parseInt(req.body.availability);
  const availableOn = req.body.availableOn;

//   MySQL command for inserting a new book
  const sql ="INSERT INTO books (bookName, author, availability, availableOn) " +
  "VALUES ('" + book_name + "', '" + author_name + "', " + availability + ", '" + availableOn + "')";

//   obove statemen t will get executed in the lines below
  connection.query(sql, function(err, rows){
    res.json({
      message: 'Data Added'
    });
  });

});

// -------------------------------------------------------------------------------------------------------------------------

// Update data on table route-----------------------------------------------------------------------------------------------

// updates data on the books table
// completely connected with front-end
// only admis have access
app.post("/update_data", function(req, res){

//   getting required information of the book
  const variable_name = req.body.variable_name;
  const variable_value = req.body.variable_value;
  const id = req.body.id;

//   MySQL command to update the selected record
  const sql =`UPDATE books
  SET ` +variable_name+ `="${variable_value}"
  WHERE bookID = "${id}" `;
  
//   execution of the above command
  connection.query(sql, function(err, rows){

    res.json({
      message: "Data Updated"
    });

  });

});

// ----------------------------------------------------------------------------------------------------------------------

// Edit Details----------------------------------------------------------------------------------------------------------

// this route update users' first name and last an names
app.post("/edit-account", function(req, res){
  
//   getting hold of the currnt usere's data
  logged_in_user.first_name = req.body.user_f_name;
  logged_in_user.last_name = req.body.user_l_name;
  logged_in_user.email = req.body.user_email;
  logged_in_user.admin = false;

  try {

//     MySQL command to update user details
    connection.query("UPDATE users" +
    "SET firstName = " + logged_in_user.first_name.toString() + ", lastName = " + logged_in_user.lastName.toString());

  } catch (e) {

    console.log(e);

  } finally {

    res.redirect("/edit-account")

  }

});

// --------------------------------------------------------------------------------------------------------------------------

// Delete Book Records-------------------------------------------------------------------------------------------------------

// this route is for delete records on the book list
// is completely tangled with front-end
// access for admins only
app.post("/delete_data", function(req, res){

//   getting hold of a book's ID
  const id = req.body.id;

//   deleting the above selected book
  const sql = `DELETE from books
  WHERE bookid=${id}`;

//   executing the command created above
  connection.query(sql, function(err, rows){

    res.json({
      message: 'Data Deleted'
    });

  });

});

// ---------------------------------------------------------------------------------------------------------------------


// Listening -----------------------------------------------------------------------------------------------------------

// assigning a port(3000) to the app to run on
app.listen(process.env.PORT || 3000, function(){
  console.log("Server is up and running on port 3000");
});
