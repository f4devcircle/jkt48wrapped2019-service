const axios = require('axios');
const cheerio = require('cheerio');
const HS_PAGE = 'mypage/handshake-session?lang=id';

const baseURL = 'https://jkt48.com/';

const handshake = async Cookie => {
    const response = await axios.get(baseURL + HS_PAGE, {
        headers: {
            Cookie
        }
    });
    require('fs').writeFileSync('./a.html', response.data)
}

const parse = _ => {
    const firstHSId = 45;
    const lastHSId = 67;
    const page = cheerio.load(require('fs').readFileSync('./a.html', 'utf-8'));
    const hs45 = page(`#handshake${lastHSId}`);
    const table = page(hs45).html();
    console.log(table);
}

parse();
// handshake(Cookie);

module.exports = {

    setName: async (Cookie) => {
        try {
            let { data } = await axios.get(baseURL + '/mypage?lang=id', {
                headers: {
                    Cookie
                }
            })

            let $ = cheerio.load(data);

            let greeting = await $('.hello').children().toArray();

            return greeting[0].children[0].data;
        } catch (err) {
            throw err;
        }
    },

    mostShow: async (Cookie) => {
        try {
            let { data } = await axios.get(baseURL + '/mypage/ticket-list?lang=id', {
                headers: {
                    Cookie
                }
            })

            let $ = cheerio.load(data);

            let table = await $('tr').children().toArray();

            let show = ['SIANG', 'MALAM']
            let setlist = [];

            for (let i = 0; i < table.length; i++) {
                if (table[i].children[0].data) {
                    if (show.includes(table[i].children[0].data) && table[i - 1].children[0].data.includes('2019')) {
                        setlist.push(table[i - 2].children[0].data);
                    }
                }
            }

            if (!setlist.length) {
                return {
                    setlist: [],
                    total_shows: 0
                };
            }

            let sorted = setlist.sort();

            let mostSetlist = [];
            
            let loopSetlist = sorted[0];
            let count = 0;

            for (let i = 0; i < sorted.length; i++) {
                
                if (sorted[i] == loopSetlist) {
                    count++
                }
                
                else {
                    mostSetlist.push({
                        name: loopSetlist,
                        count
                    });

                    loopSetlist = sorted[i];
                    count = 1;
                }

                if (i == sorted.length - 1) {
                    mostSetlist.push({
                        name: loopSetlist,
                        count
                    });
                }

            }

            mostSetlist.sort((a, b) => {
                return b.count - a.count;
            });

            return {
                setlist: mostSetlist,
                total_shows: sorted.length
            };
        } catch (err) {
            throw err;
        }
    },
}