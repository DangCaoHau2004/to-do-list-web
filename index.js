import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const port = 3000;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;

const db = new pg.Client({
  user: USER,
  host: "localhost",
  database: "postgres",
  password: PASSWORD,
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function checkAllItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id");
  return result.rows;
}
let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  items = await checkAllItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items(title) VALUES($1)", [item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [title, id]);
  res.redirect("/");
});
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1", [id]);
  res.redirect("/");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
