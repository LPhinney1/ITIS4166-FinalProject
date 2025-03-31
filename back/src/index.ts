import express from "express";
const app = express();

app.get("/health", (req, res) =>{
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Backend running on port 3000\n@ http://localhost:3000/'));
