const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {

  const { message } = req.body;

  if (!message) {
    return res.json({
      reply: "Bạn chưa nhập câu hỏi",
    });
  }

  const msg = message.toLowerCase();

  let reply = "Xin lỗi, tôi chưa hiểu. Bạn hỏi về giá gạo, giao hàng, hoặc đặt hàng.";

  if (msg.includes("giá")) {
    reply = "Giá gạo từ 15.000đ đến 25.000đ / kg.";
  }

  else if (msg.includes("ship") || msg.includes("giao")) {
    reply = "Chúng tôi giao hàng toàn quốc.";
  }

  else if (msg.includes("loại gạo")) {
    reply = "Chúng tôi có gạo ST25, Jasmine, gạo nếp.";
  }

  else if (msg.includes("xin chào") || msg.includes("hello")) {
    reply = "Xin chào, tôi là chatbot cửa hàng gạo.";
  }

  else if (msg.includes("đặt hàng")) {
    reply = "Bạn có thể đặt hàng trong trang sản phẩm.";
  }

  res.json({
    reply,
  });

});

module.exports = router;