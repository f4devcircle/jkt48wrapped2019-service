const express = require('express');
const axios = require('axios');
const random = require('randomstring');
const cors = require('cors')

const { mostShow, setName, mapHandshake } = require('./helpers/helpers');

const app = express();

app.use(express.json())

app.use(express.urlencoded({
  extended: false
}))

exports.main = async (req, res) => {
    try {
        let { email, password } = req.body;

        let Cookie = `sid=${random.generate()}`;

        let login = await axios.post('https://jkt48.com/login?lang=id', `return_path=&login_id=${encodeURIComponent(email)}&login_password=${encodeURIComponent(password)}&x=86&y=9`, {
            headers: {
                Cookie
            }
        })

        if (login.data.includes('Alamat email atau Kata kunci salah')) {
            res.status(400).json({
                msg: 'Email atau password anda salah'
            })
        } else {
            let listShow = await mostShow(Cookie);
            let name = await setName(Cookie);
            let handshake = await mapHandshake(Cookie);
            
            listShow.name = name;
            listShow.handshake = handshake.listMember;
            listShow.total_handshake = handshake.total;
            
            res.status(200).json(listShow);
        }    
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

app.use(cors());

app.post('/', this.main);

app.listen(3030, () => {
  console.log('running')
})