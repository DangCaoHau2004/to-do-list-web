import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const port = 3000;
const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;
const PORT = process.env.PORT;
// thiết lập database
const db = new pg.Client({
  user: USER,
  host: HOST,
  database: DATABASE,
  password: PASSWORD,
  port: PORT,
});

// kết nối database
db.connect()
  .then(() => console.log("Connected to database successfully"))
  .catch((err) => {
    console.log("Error connecting to database: ", err);
    process.exit(1);
  });

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function checkAllItems() {
  await db.query(
    "CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL);"
  );
  const result = await db.query("SELECT * FROM items ORDER BY id");
  return result.rows;
}
let items = [];

// homepage
app.get("/", async (req, res) => {
  items = await checkAllItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});
// post add
app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items(title) VALUES($1)", [item]);
  res.redirect("/");
});
// post edit
app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [title, id]);
  res.redirect("/");
});
//post delete
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1", [id]);
  res.redirect("/");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
