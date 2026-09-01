const express = require("express");
const pool = require("./db");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                message: "Geçerli bir ID girin."
            });
        }

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

        if(!name || name.trim() ===""){
            return res.status(400).json({
                message: "İsim Boş Bırakılamaz."
            });
        }

        if(!age || isNaN(age) || age <= 0){
            return res.status(400).json({
                message: "Geçerli Bir Yaş Girin."
            });
        }

        if(!email || !email.includes("@")){
            return res.status(400).json({
                message: "Geçerli Bir Email Girin."
            });
        }

        const result = await pool.query(
            "INSERT INTO students (name,age,email) VALUES ($1, $2, $3) RETURNING *",
            [name, age, email]
        );
        res.status(201).json(result.rows[0]);
    } catch(error){

        if(error.code === "23505"){
            return res.status(409).json({
                message: "Bu Email Zaten Kayıtlı."
            });
        }

        res.status(500).json({
            message: "Öğrenci eklenemedi",
            error: error.message
        });
    }
});

app.delete("/students/:id", async (req,res ) => {
    try{
        const id = Number(req.params.id);

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                message: "Geçerli bir ID girin."
            });
        }

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

         if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                message: "Geçerli bir ID girin."
            });
        }

        if (name !== undefined && name.trim() === "") {
            return res.status(400).json({
                message: "İsim boş bırakılamaz."
            });
        }

        if (age !== undefined && (isNaN(age) || age <= 0)) {
            return res.status(400).json({
                message: "Geçerli bir yaş girin."
            });
        }

        if (email !== undefined && !email.includes("@")) {
            return res.status(400).json({
                message: "Geçerli bir email girin."
            });
        }


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
        if(error.code === "23505"){
            return res.status(409).json({
                message: "Bu Email Zaten Kayıtlı."
            });
        }

        res.status(500).json({
            message: "Öğrenci güncellenemedi",
            error: error.message
        });
     }
});


app.post("/register", async(req, res) => {
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if(!name || !email || !password){
            return res.status(400).json({
                message: "Tüm alanları doldurun."
            });
        }

        if(!email.includes("@")){
            return res.status(400).json({
                message: "Geçerli bir email girin."
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "Kullanıcı Başarıyla Oluşturuldu.",
            user: result.rows[0]
        });
        } catch(error){

            if(error.code === "23505"){
                return res.status(409).json({
                    message: "Bu Email Zaten Kayıtlı."
                })
            }
            res.status(500).json({
                message: "Kullanıcı Oluşturulamadı.",
                error: error.message
            });
        }
 
}); 


app.post("/login", async (req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;

        if(!email || !password){
            return res.status(400).json({
                message: "Email ve Password Gerekli."
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Email veya şifre hatalı."
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Email veya şifre hatalı."
            });
        }

         const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );  
        res.json({
            message: "Giriş başarılı.",
            token: token
        });
        
    } catch (error) {
        res.status(500).json({
            message: "Giriş yapılamadı.",
            error: error.message
        });
    }
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    const token = authHeader && authHeader.split(" ")[1];
    
    if(!token) {
        return res.status(401).json({
            message: "Token Bulunamadı."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decoded;

        next();

    } catch (error) {
        res.status(401).json({
            message: "Geçersiz veya Süresi Dolmuş Token.",
            error: error.message
        });
    }

}



app.listen(3000, () => {
    console.log("Server 3000 Portunda Çalışıyor...");
});
