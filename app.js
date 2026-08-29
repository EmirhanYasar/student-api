const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());


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

app.patch("/students/:id", async (req, res) => {
    try{
        const id = Number(req.params.id);

        const name = req.body.name;
        const age = req.body.age;
        const email = req.body.email;

        const result = await pool.query(
            `UPDATE students
             SET name = COALESCE($1, name),
                 age = COALESCE($2, age),
                 email = COALESCE($3, email)
             WHERE id = $4
             RETURNING *`,
            [name, age, email, id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                message: "Öğrenci Bulunamadı"
            });

        }
        res.json(result.rows[0]);
 
    } catch (error) {
        res.status(500).json({
            message: "Öğrenci güncellenemedi",
            error: error.message
        });
     }
});


app.listen(3000, () => {
    console.log("Server 3000 Portunda Çalışıyor...");
});
