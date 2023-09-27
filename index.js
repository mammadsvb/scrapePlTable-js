const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const  schedule = require("node-schedule");
const Team = require('./models');

async function c2db(){
    await mongoose.connect("mongodb://127.0.0.1:27017/premierleague-table")
    .then(()=>console.log("connected."))
    .catch(()=>console.log("couldn't connect.")); 
}

async function updateDB(info){
   
    try{
         for (let i=0 ; i<info.length ;i++)
        {  
            await Team.findOneAndUpdate({Club : info[i]["Club"]},
                {$set :{    "Position" : info[i]["Position"],
                            "Next_Match" : info[i]["Next_Match"],
                            "Played" : info[i]["Played"],
                            "Won" : info[i]["Won"],
                            "Drawn" : info[i]["Drawn"],
                            "Lost" : info[i]["Lost"],
                            "GF" : info[i]["GF"],
                            "GA" : info[i]["GA"],
                            "GD" : info[i]["GD"],
                            "Points" : info[i]["Points"],
                            "Date" : info[i]["Date"],
                }}
                ,{new:true})
        }
    }catch(e){
        console.error(e)
    }
}

function next_Match($,element){
    const nextMatch={};
    element = $(element).find(".nextMatchCol")
    const next = $(element).find('abbr')
    const time = $(element).find('time')
    const date = $(element).find('.match-fixture__match-info')

    nextMatch["Home"]=$(next[0]).attr('title')
    nextMatch["Away"]=$(next[1]).attr('title') 
    // nextMatch["Time"]=$(time).text()
    nextMatch["Date"]=new Date(($(date).text()) + ' ' + $(time).text()).toGMTString()

    return nextMatch;
}


async function scrape(){
    
    try{ 
        await c2db();
        const headerList = ["Position","Club","Played","Won","Drawn","Lost","GF","GA","GD","Points"]
        const info = [];

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://www.premierleague.com/tables") ;
        const html = await page.content();
        const $ = await cheerio.load(html);
        $('table > tbody.isPL > tr[data-compseason="578"]').map((index,element)=>{ // [tr(team1) tr(team2) ...]
            const team = $(element).find('td') //[td(pos) td(club) ... ]
            const nextMatch = next_Match($,element); // return next match information
            
            const tableRow = {}
            tableRow["Club"] = $(element).attr("data-filtered-table-row-name");
            tableRow["Position"] = $(element).attr("data-position");
            tableRow["Next_Match"] = nextMatch; 
            
            $(team).each((i,e)=>{ //[td(pos(t1))](i=0) ->[td(club)(t1))](i=1)->...(i=11)->[td(pos(t2))](i=0)-> ...
                    if( i <= 1 || i>9) return true;
                    tableRow[headerList[i]] = $(e).text().trim(); //get pos played ...
            })

            info.push(tableRow);

        }).get()
        console.log(info);
        // await Team.insertMany(info); // run first time
        await updateDB(info);
        
        await browser.close();
    }catch(e){
        console.error(e);
    }
}

function scheduler(scrape){
    const job = schedule.scheduleJob("0 0 * * *",()=>{
        scrape();
    })
}

// scheduler(scrape);
scrape();