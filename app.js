const express = require('express');
const axios = require('axios');
const random = require('randomstring');

const { mostShow, setName } = require('./helpers/helpers');

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

        let listShow = await mostShow(Cookie);
        let name = await setName(Cookie);
        
        listShow.name = name;

        res.status(200).json(listShow);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

app.post('/', this.main);
app.listen(80, () => {
  console.log('running')
})