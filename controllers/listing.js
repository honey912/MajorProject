const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
  }
  module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({
      path: "review",
      populate: {
        path: "author",
      },
    }).populate("owner", "username");

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

  module.exports.createListing=async (req, res, next) => {
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
     newListing.owner=req.user._id;
     newListing.image={url,filename};
     await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
  }
  module.exports.renderEditForm=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("review").populate("owner");
    if (!listing) {
      req.flash("error"," Listing you requested for doesnot exist!");
      res.redirect("/listings");
    }
     let originalImageUrl=listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing , originalImageUrl });
  }  
  
module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    if( typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image ={url,filename};
    await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
  }
module.exports.destroyListing=async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      throw new ExpressError(404, "Listing not found");
    }
    req.flash("success","New Listing Deleted!");
    res.redirect("/listings");
  }