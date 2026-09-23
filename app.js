const path = require('node:path');
const FilePath = path.join(__dirname, "./db.js")
const pool = require(FilePath);
const express = require('express');

const app = express();;
app.use(express.json());

app.post('/assignments', async(req, res)=>{
    try{
        const {title, deadline}=req.body;
        let result = await pool.query(`
            INSERT INTO assignments(title, deadline)
            values($1, $2)
            returning *;
            `, [title, deadline])
        res.status(201).json(result.rows[0])
    }catch(err){
        console.log(err)
        res.status(500).json({err:"Server Failed"});
    }
})

app.get('/assignments', async(req, res)=>{
    try{
        let result = await pool.query(`SELECT * FROM assignments ORDER BY id desc`)
        res.status(200).json(result.rows)
    }catch(err){
        console.log(err)
        res.status(500).json({err:"Server Failed"})
    }
})

app.patch('/assignments/:id', async(req, res)=>{
    try{
        const { id } = req.params;
        const result = await pool.query(`
            UPDATE assignments SET submitted = true where id = $1
            RETURNING * ;`, [id])
        if (result.row.length === 0){
            return res.status(404).json({err:"Request not Found"})
        } else {
            res.status(201).json(result.rows[0])
        }
    }catch(err){
        console.log(err)
        res.status(500).json({err:"Server Failed"})
    }
})

app.delete('/assignments/:id', async(req, res)=>{
    try{
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM assignments
            WHERE id = $1
            returning *;`,[id])
        if (result.rows.length === 0){
            return res.status(404).json({
                errorMessage: 'Request Not Found'
            })
        }
        res.status(201).json({message: 'Assignments has been deleted',
            assignments: result.rows[0]
        })

    }catch(err){
        console.log(err)
        res.status(500).json({
            errorMessage: 'Server is stop'
        });
    }
})

app.get('/assignments', async(req, res)=>{
    try {
        const { submitted } = req.params;
        let result = await pool.query(`
            SELECT * from assignments where submitted=$1
            returning *;`, [submitted])
        res.status(200).json(result.rows[0])
    } catch(err) {
        console.log(err)
        res.status(500).json({
            errorMessage: 'Server is stop'
        });
    }
})
app.listen(3000,() => {
    console.log('Server Chal Gaya Sir')
});