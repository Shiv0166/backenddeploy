import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const root = process.cwd();

// allow form data
app.use(express.urlencoded({ extended: true }));

// serve static files (html, css, js)
app.use(express.static(root));

// homepage route (IMPORTANT)
app.get("/", (req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

// form handling
app.post("/order", (req, res) => {

  const { name, food, quantity } = req.body;

  const order = `${name} ordered ${food} (${quantity})\n`;

  fs.appendFile("orders.txt", order, (err) => {
    if (err) {
      console.log(err);
      return res.send("Error saving order");
    }

    res.send("Order saved successfully!");
  });

});

// read orders
app.get("/orders", (req, res) => {

  fs.readFile("orders.txt", "utf8", (err, data) => {
    if (err) return res.send("No orders yet");

    res.send(data);
  });

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});