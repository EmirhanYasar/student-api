const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());

const students = [
        { id: 1, name: "Ali", age: 20 },
        { id: 2, name: "Mehmet", age: 19 }
    ];

app.get("/db-test", async (req, res) =>{
    try{
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Veritabanı bağlantısı başarılı",
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            message: "Veritabanı bağlantı hatası",
            error: error.message
        });
    }
});



app.get("/students", async (req, res) => {
    try{
        const result = await pool.query(
            "SELECT * FROM students ORDER BY id"
        );

        es.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: "Öğrenciler alınamadı",
            error: error.message
        });
    }
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
});

app.post("/students",(req, res) => {
    const name = req.body.name;
    const age = req.body.age;

    const newStudent = {
        id: students.length + 1,
        name: name,
        age: age
    }

    students.push(newStudent);
    res.status(201).json(newStudent);
});

app.delete("/students/:id", (req,res ) => {
    const id = Number(req.params.id);

    const studentIndex = students.findIndex((student) => student.id === id);


    if (studentIndex === -1) {
        return res.status(404).json({
            message: "Öğrenci Bulunamadı"
        });
    }

    students.splice(studentIndex,1);

    res.json({
        message: "Öğrenci Silindi"
    });

})

app.patch("/students/:id",(req, res) => {
    const id = Number(req.params.id);

    const student = students.find((student) => student.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Öğrenci Bulunamadı"
        });
    }
    if (req.body.name !== undefined) {
        student.name = req.body.name;
    }

    if (req.body.age !== undefined) {
        student.age = req.body.age;
    }

    res.json(student);



})




app.listen(3000, () => {
    console.log("Server 3000 Portunda Çalışıyor...");
});
