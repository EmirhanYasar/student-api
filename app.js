const express = require("express");

const app = express();

const students = [
        { id: 1, name: "Ali", age: 20 },
        { id: 2, name: "Mehmet", age: 19 }
    ];

app.get("/", (req, res) =>{
    res.send("Server Çalışıyor.");
});


app.get("/students", (req, res) => {
    res.json(students);
});


app.get("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const student = students.find((student) => student.id === id);

    if(!student){
        return res.status(404).json({
            message: "Öğrenci Bulunamadı"
        })

    }
    res.json(student);
})


app.listen(3000, () => {
    console.log("Server 3000 Portunda Çalışıyor...");
});
