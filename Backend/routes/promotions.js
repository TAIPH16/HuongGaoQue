const router = require("express").Router();

const Promotion = require("../model/Promotion");
const Product = require("../model/product");

const {
  uploadSingle,
} = require("../middleware/upload.middleware");



router.get("/", async (req, res) => {

  const data =
    await Promotion.find()
      .populate("product");

  res.json({
    data,
  });

});



router.post(
  "/",
  uploadSingle("image"),
  async (req, res) => {

    const {
      name,
      product,
      benefits,
      quantity,
      listedPrice,
    } = req.body;


    const p =
      await Product.findById(
        product
      );

    if (!p) {
      return res.json({
        message:
          "Product không tồn tại",
      });
    }


    const promo =
      new Promotion({
        name,
        product,
        benefits,
        quantity,
        listedPrice,

        image:
          req.file?.originalname,
      });

    await promo.save();

    res.json(promo);

  }
);



router.delete(
  "/:id",
  async (req, res) => {

    await Promotion.findByIdAndDelete(
      req.params.id
    );

    res.json({
      ok: true,
    });

  }
);

module.exports = router;