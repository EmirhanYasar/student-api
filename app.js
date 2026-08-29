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

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: "Öğrenciler alınamadı",
            error: error.message
        });
    }
});


app.get("/students/:id", async (req, res) => {
    try{
        const id = Number(req.params.id);

        const result = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Öğrenci Bulunamadı"
            });
        }
        res.json(result.rows[0]);

    } catch(error){
        res.status(500).json({
            message: "Bir hata oluştu",
            error: error.message
        });

    }
    
});

app.post("/students", async (req, res) => {
    try{
        const name = req.body.name;
        const age = req.body.age;
        const email = req.body.email;

        const result = await pool.query(
            "INSERT INTO students (name,age,email) VALUES ($1, $2, $3) RETURNING *",
            [name, age, email]
        );
        res.status(201).json(result.rows[0]);
    } catch(error){
        res.status(500).json({
            message: "Öğrenci eklenemedi",
            error: error.message
        });
    }
});

app.delete("/students/:id", async (req,res ) => {
    try{
        const id = Number(req.params.id);

        const result = await pool.query(
            "DELETE FROM students WHERE id = $1 RETURNING *",
            [id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({
                message: "Öğrenci Bulunamadı"
            });
        }
        res.json({
            message: "Öğrenci Silindi",
            student: result.rows[0]
        })

    }catch (error) {
        res.status(500).json({
            message: "Öğrenci silinemedi",
            error: error.message
        });
    }

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
