const axios = require('axios');
const cheerio = require('cheerio');
const tableParser = require('cheerio-tableparser');
const knex = require('knex')(require('../knexfile'));

const baseURL = 'https://jkt48.com/';
const HS_PAGE = '/mypage/handshake-session?lang=id';

const getItemDetail = async (name, table) => {
    const result = (await knex(table).where('name', name))[0];
    return result;
};

module.exports = {
    mapHandshake: async (Cookie) => {
        try {
            const { data } = await axios.get(baseURL + HS_PAGE, {
                headers: {
                    Cookie
                }
            });

            const page = cheerio.load(data);

            for (let i = 1; i < 45; i++) {
                page(`#handshake${i}`).remove();
            }

            tableParser(page);

            let parsed = page('table').parsetable();

            if (!parsed.length) {
                return {
                    listMember: [],
                    total: 0
                }
            }

            let member = [];

            for (let i = 0; i < parsed[4].length; i++) {
                let namaMember = parsed[4][i];
                let jumlahHs = parsed[5][i];

                if (namaMember != 'Nama Member') {
                    member.push(namaMember + '+' + jumlahHs);
                }
            }

            member.sort();

            let result = [];
            
            let loopMember = member[0].split('+')[0];
            let count = 0;

            let totalHS = 0;

            for (let i = 0; i < member.length; i++) {
                let memberName = member[i].split('+')[0];
                let memberCount = Number(member[i].split('+')[1]);
                
                if (memberName == loopMember) {
                    count += memberCount;
                }
                
                else if (i != member.length - 1) {
                    result.push({
                        name: loopMember,
                        count
                    });

                    loopMember = memberName;
                    count = memberCount;
                }

                if (i == member.length - 1) {
                    result.push({
                        name: loopMember,
                        count
                    });
                }

                totalHS += memberCount;
            }

            result.sort((a, b) => {
                return b.count - a.count;
            });

            for (let index = 0; index < result.length; index++) {
                const member = await getItemDetail(result[index].name, 'members');
                if (member) result[index].image = member.image_url;
            }
            
            return {
                listMember: result,
                total: totalHS
            };
        } catch (err) {
            throw err;
        }
    },

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
                
                else if (i != sorted.length - 1) {
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

            for (let index = 0; index < mostSetlist.length; index++) {
                const show = await getItemDetail(mostSetlist[index].name, 'setlists');
                if (show) mostSetlist[index].image = show.image_url;
            }

            return {
                setlist: mostSetlist,
                total_shows: sorted.length
            };
        } catch (err) {
            throw err;
        }
    },
}