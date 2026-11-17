//importing all the packages used in the project 
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverrride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB.");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverrride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req,res) => {
    res.send("Hii, I am root.");
});

const validateListing = (req, res , next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, result.error);
    } else {
        next();
    }
};

//index route : page for all the listings
app.get("/listings",wrapAsync( async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new route : function to add a new listing
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
});

//show route : represents details of a listing
app.get("/listings/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//create route 
app.post("/listings",validateListing, wrapAsync (async (req,res, next) => {
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit",wrapAsync( async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update route : used to update details of a listing 
app.put("/listings/:id",validateListing, wrapAsync( async (req,res) => {
    let {id} = req.params; //importing id/listing
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`); //redirecting back 
}));

//delete route
app.delete("/listings/:id",wrapAsync(async (req, res) => {
    let {id} = req.params; //importing id/listing
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing); 
    res.redirect("/listings"); //redirecting back 
}));

// app.get("/testListing",async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "by the beach",
//         price: 1200,
//         location: "North cliff, Varkala",
//         country: "India"
//     })

//     await sampleListing.save();
//     console.log("Sample was saved.");
//     res.send("successful testing");
// });

app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong! "} = err;
    res.status(statusCode).render("error.ejs", {message});
    //res.status(statusCode).send(message);
});

console.log("Reached the bottom of app.js, setting up server...");

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});