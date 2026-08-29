const express = require("express");

const app = express();

app.get("/", (req,res) =>{
    res.send("Server Çalışıyor.");
})

app.listen(3000, () => {
    console.log("Server 3000 Portunda Çalışıyor...");
})
