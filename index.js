// first bring in express, which we already installed
// you can see it in your package.json
const express = require("express");
// create your app
const app = express();
// Import the body-parser middleware
// this package contains middleware that can handle
// the parsing of many different types of data
// making it easier to work with data in the routes that
// accept data from client (POST, PATCH)
// you have to have a port defined for your server to run
const bodyParser = require("body-parser");
// in order to use the jsx view engine , i need to bring it in
const jsxViewEngine = require("jsx-view-engine");
// method override is used to be able do more than GET and POST
const methodOverride = require("method-override");
const PORT = 3000;

// import the data from the fake database files
const fruits = require("./data/fruits.js");
const vegetables = require("./data/vegetables.js");

//Set up the view engine to see it
app.set("view engine", "jsx");
app.set("views", "./views");
app.engine("jsx", jsxViewEngine());

// ========== MIDDLEWARE ==========
// this is imported middleware, meaning we are using code that someone else wrote
// we use body-parser middleware first so that
// we have access to the parsed data within our routes
// the have parsed data will be located in the req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static("./styles"));

// below is the custom middleware, meaning that we wrote the code that we wanted to be executed
app.use((req, res, next) => {
  console.log("Middleware: I run for all routes");
  next();
});

app.use((req, res, next) => {
  const time = new Date();
  console.log(
    `----- ${time.toLocaleString()}: Received a ${req.method} request to ${
      req.url
    }`
  );
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Containing the data");
    console.log(`${JSON.stringify(req.body)}`);
  }
  next();
});
// ============= ROUTES ==========

// we are going to create a full crude app
// that means that we will be able to
// C-Create new data
// R-Read data
// U-Update data
// D-Delete data
// ====== This corresponds to to 4 HTTP verbs
// CRUD            HTTP
// C - Create      Post
// R - Read        GET
// U - Update      PUT/PATCH
// D - Delete      DELETE

// Server side rendering, you also need the views for someone to input to put or post
// INDUCES
// I - Index     -GET      -READ - display all of the elements
// N - New       -GET      -CREATE * but this is a view that allows user inputs
// D - Delete    -DELETE
// u - update    -put    - update * this updates the data
// c - create    -post   -create * this adds new data
// e - edit      -get    - * update * but this is a view that allows user inputs
// s - show      -get    -read - displays one of the elements
// create routes to represents different requests
// define a route
// define a method
// start with a get request
// general format of the request
// app.get(route, function)
// the route is what the client or user types in for the request
// the function is how we respond
app.get("/", (req, res) => {
  res.send("<div> this is my home </div>");
});

app.get("/params", (req, res) => {
  console.log(req.params);
  res.send("<h1>Route Parameters Example</h1>");
});

app.get("/params/:p1", (req, res) => {
  console.log(req.params);
  res.send(
    `<h1>Route Parameters Example</h1><p>There is one parameter: ${req.params.p1}</p>`
  );
});

app.get("/params/:p1/explanations", (req, res) => {
  console.log(req.params);
  res.send(`<h1>This is where I explain ${req.params.p1} </h1> `);
});

app.get("/params/:p1/:p2", (req, res) => {
  console.log(req.params);
  res.send(
    `<h1>Route Parameters Example</h1><p>There are two parameters: ${req.params.p1} and ${req.params.p2}</p>`
  );
});

app.get("/index", (req, res) => {
  res.send("<h1>This is an Index Page</h1>");
});
// have your app start and listen for requests
// this is a server, so will be listening for requests and responding
app.listen(PORT, () => {
  console.log("listening");
});

// INDEX
// this is called an index route where you can see all the dat
//This is one version of READ
// this is only practical when you have small amounts of data
// but you can also use an index route an limit the number of responses
app.get("/api/fruits", (req, res) => {
  // res.json is a method that sends back a JSON object
  res.json(fruits);
});

//N-  New - allow a user to input a new fruit
app.get("/fruits/new", (req, res) => {
  // the fruits/New in the render needs to be pointing to something in my views folder
  res.render("fruits/New");
});

// this should be before the route with the parameter
// otherwise it will get caught up in that route
app.get("/api/fruits/descriptions", (req, res) => {
  res.send(`<h1>All Fruit Descriptions</h1>`);
});

// DELETE
app.delete("/api/fruits/:id", (req, res) => {
  if (req.params.id >= 0 && req.params.id < fruits.length) {
    fruits.splice(req.params.id, 1);
    res.json(fruits);
  } else {
    res.send("<p>This is not valid</p>");
  }
});

//UPDATE
// put replaces a resource
app.put("/api/fruits/:id", (req, res) => {
  if (req.params.id >= 0 && req.params.id < fruits.length) {
    // put takes the request body and replaces the entire database entry with it
    // find the id and replace the entire thing with the req.body
    fruits[req.params.id] = req.body;
    res.json(fruits);
    res.send(`Updated ${fruits[req.params.id].name}`);
  } else {
    res.send("<p>This is not valid</p>");
  }
});

// patch updates part of it
app.patch("/api/fruits/id:", (req, res) => {
  if (req.params.id >= 0 && req.params.id < fruits.length) {
    // patch only replaces the properties that we give it
    // find the id and replace only they new properties
    console.log(fruits[req.params.id]);
    console.log(req.body);
    const newFruit = { ...fruits[req.params.id], ...req.body };
    fruits[req.params.id] = newFruit;
    res.json(fruits[req.params.id]);
  } else {
    res.send("<p>This is not valid</p>");
  }
});

// CREATE
app.post("/api/fruits", (req, res) => {
  // you should check this when you first start, but then get rid of this console.log statement
  //   console.log(req.body);
  // need to add logic to change the check or not checked to true or false
  if (req.body.readyToEat === "on") {
    // if checked, req.body.readyToEat will be set to on
    req.body.readyToEat = true;
  } else {
    // if not checked, req.body.readyToEat will be undefined
    req.body.readyToEat = false;
  }
  fruits.push(req.body);
  res.json(fruits);
  //res.send("this was the post route");
});

// E- Edit
app.get("/fruits/:id/edit", (req, res) => {
  if (req.params.id >= 0 && req.params.id < fruits.length) {
    res.render("fruits/Edit", { fruit: fruits[req.params.id] });
  } else {
    res.send("<p>This is not a valid id</p>");
  }
});

// another version of READ is called a show route
// in this one, we can see more information on an individual piece of data
app.get("/api/fruits/:id", (req, res) => {
  // in this case, my unique identifier is going to be an array index
  // res.send(`<div>${req.params.id}</div>`);
  // this id can be anything, so i probably want to do some checking
  // before accessing the array
  if (req.params.id >= 0 && req.params.id < fruits.length) {
    res.json(fruits[req.params.id]);
  } else {
    res.status(404).send("Fruit Not Found");
  }
  res.json(fruits[req.params.id]);
});

// Vegetables ====================================================================

app.get("/api/vegetables", (req, res) => {
  res.json(vegetables);
});

// DELETE
app.delete("/api/vegetables/:id", (req, res) => {
  if (req.params.id >= 0 && req.params.id < vegetables.length) {
    vegetables.splice(req.params.id, 1);
    res.json(vegetables);
  } else {
    res.send("<p>This is not valid</p>");
  }
});

// UPDATE
app.put("/api/vegetables/:id", (req, res) => {
  if (req.params.id >= 0 && req.params.id < vegetables.length) {
    vegetables[req.params.id] = req.body;
    res.json(vegetables);
    res.send(`Updated ${vegetables[req.params.id].name}`);
  } else {
    res.send("<p>This is not valid</p>");
  }
});

// PATCH
app.patch("/api/vegetables/:id", (req, res) => {
  if (req.params.id >= 0 && req.params.id < vegetables.length) {
    const newVegetable = { ...vegetables[req.params.id], ...req.body };
    vegetables[req.params.id] = newVegetable;
    res.json(vegetables[req.params.id]);
  } else {
    res.send("<p>This is not valid</p>");
  }
});

// CREATE
app.post("/api/vegetables", (req, res) => {
  if (req.body.readyToEat === "on") {
    req.body.readyToEat = true;
  } else {
    req.body.readyToEat = false;
  }
  vegetables.push(req.body);
  res.json(vegetables);
});

// E- Edit
app.get("/vegetables/:id/edit", (req, res) => {
  if (req.params.id >= 0 && req.params.id < vegetables.length) {
    res.render("vegetables/Edit", { vegetable: vegetables[req.params.id] });
  } else {
    res.send("<p>This is not a valid id</p>");
  }
});

app.get("/vegetables/:id", (req, res) => {
  if (req.params.id >= 0 && req.params.id < vegetables.length) {
    res.json(vegetables[req.params.id]);
  } else {
    res.status(404).send("Vegetable Not Found");
  }
  res.json(vegetables[req.params.id]);
});

// Custom 404 (not found) middleware ==================================================================
// since we place this last, it will only process
// if no other routes have already sent a response
// we also don't need a next in this VERY SPECIAL case
// Because it is the last stop along the request-response cycle
app.use((req, res) => {
  console.log(
    "I am only in this middleware if no other routes sent a response"
  );
  res.status(404);
  res.json({ error: "Page Not Found" });
});
