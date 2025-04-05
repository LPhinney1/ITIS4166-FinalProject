import express from "express";
import cors from "cors";
import { migrateToLatest } from "./database/migrate.js";

await migrateToLatest();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>{
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Backend running @\nhttp://localhost:3000/'));
