import express from "express";
import "dotenv/config";
import path from 'node:path';
import session from "express-session";
import { fileURLToPath } from 'node:url';
import bcrypt from "bcrypt";
import { pool } from "./db/pool.js";
import { requireLogin, requireRole } from "./middleware/auth.js";

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 3000;
const baseURL = externalUrl || `http://localhost:${port}`;
const config = {
    baseURL: baseURL,
    saltRounds: 12
}
const hostname = externalUrl ? '0.0.0.0': '127.0.0.1';

var vulnerability_1 = true;
var vulnerability_2 = true;

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'slow-brown-fox-crawls-under-the-hardworking-dog',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use((req, res, next) => {
    res.locals.logged_in = req.session.user_id ? true : false;
    res.locals.user_id = req.session.user_id || null;
    res.locals.username = req.session.username || null;
    res.locals.role = req.session.role || null;
    next();
});

app.get("/", (req, res) => {
    res.render("index", {vulnerability_1, vulnerability_2, base_url: config.baseURL});
});

app.get("/welcome", (req, res) => {
    res.render("welcome", {vulnerable: vulnerability_1});
})

app.get("/attacker", (req, res) => {
    res.render("attacker");
})

app.post("/set", async (req, res) => {
    const { vul_1, vul_2 } = req.body;

    if(vul_1 == undefined || vul_2 == undefined) return res.status(400).send();

    vulnerability_1 = vul_1;
    vulnerability_2 = vul_2;

    res.send();
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = (await pool.query("SELECT * FROM users WHERE username = $1", [username])).rows[0];

    const success = user && bcrypt.compare(password, user.password_hash);
    if(!success) return res.status(401).send({message: "Neuspješna prijava! Nevaljano korisničko ime ili lozinka!"});

    req.session.regenerate(error => {
        if(error) return res.status(500).send({message: "Pogreška sjednice!"});
        req.session.user_id = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        res.send({message: "Uspješna prijava!"});
    })
});

app.post("/logout", async (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.send({message: "Uspješna odjava!"});
    })
});

app.get("/users/unsafe/:id", requireLogin, async (req, res) => {
    const { id } = req.params;

    try{
        if(!id) throw new Error("missing-id");
        if(Number.isNaN(parseInt(id))) {
            throw new Error("invalid-id");
        }

        const query = await pool.query("SELECT id, username, role FROM users WHERE id = $1", [id]);
        if(!query.rowCount) throw new Error("unknown-id");

        const user = query.rows[0];

        res.send({
            message: "Uspješno dohvaćeni podaci o korisniku s ID-em: "+id,
            user
        });
    }
    catch(error){
        return res.status(400).send({message: "Neispravan zahtjev!", error: error.message});
    }
})

app.get("/users/safe/:id", requireLogin, async (req, res) => {
    const { id } = req.params;

    try{
        if(!id) throw new Error("missing-id");
        if(Number.isNaN(parseInt(id))) {
            throw new Error("invalid-id");
        }

        // Ovo je glavni dio koji se tiče vlasničkog resursa
        if(req.session.user_id !== parseInt(id) && req.session.role !== "admin"){
            return res.status(403).send({message: "Nemate pravo pristupa resursu!"});
        }

        const query = await pool.query("SELECT id, username, role FROM users WHERE id = $1", [id]);
        if(!query.rowCount) throw new Error("unknown-id");

        const user = query.rows[0];

        res.send({
            message: "Uspješno dohvaćeni podaci o korisniku s ID-em: "+id,
            user
        });
    }
    catch(error){
        return res.status(400).send({message: "Neispravan zahtjev!", error: error.message});
    }
})

// Registracija nije tema ove laboratorijske vježbe, pa će koristiti već stvoreni računi: jedan administratorski i jedan obični
/*
app.post("/register", async (req, res) => {
    const { username, password, role } = req.body;
    
    try{
        const hash = await bcrypt.hash(password, config.saltRounds);
        const result = await pool.query("INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",[username,hash,role]);
        if(!result.rowCount) return res.status(400).send("Bad request!");

        res.status(200).send();
    }
    catch(error){
        res.status(500).send(error);
    }
});
*/

app.listen(port, hostname, () =>{
    console.log(`Server running at http://${hostname}:${port}`);
    if(externalUrl) console.log(`External URL: ${externalUrl}`);
});