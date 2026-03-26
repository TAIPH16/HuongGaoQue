const router = require("express").Router();

const Promotion = require("../model/Promotion");
const Product = require("../model/product");




router.get("/", async (req, res) => {

  const data = await Product.find();

  res.json({
    data,
  });

});


module.exports = router;