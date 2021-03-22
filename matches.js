
let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path")
let statArr = [];
let gcount;
let count = 1;
function createFolder(url) {
    if (fs.existsSync(url) == false) {
        fs.mkdirSync(url);
    }
}
function createFile(url) {
    if (fs.existsSync(url) == false) {
        fs.openSync(url, "w");
        // to make file
        // w is for write agar hai phle se to write 
        // else make empty file
    }
}

let mainfolder = path.join(__dirname,"IPL-2020");
createFolder(mainfolder)
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results"

request(url, cb);

function cb(err, response, html) {
    let chSelector = cheerio.load(html);
    let that60scorecard = chSelector(".btn.btn-sm.btn-outline-dark.match-cta[data-hover=Scorecard]");
    gcount = that60scorecard.length;
    for (let i = 0; i < that60scorecard.length; i++) {
        let initial = "https://www.espncricinfo.com";
        let rest = chSelector(that60scorecard[i]).attr("href");
        let link = initial + rest;
        // console.log(link)
        request(link, cb1);  
    }
}
function cb1(err, response, html) {
    let chSelector = cheerio.load(html);
    let bothTeam = chSelector(".event .team");
    let winningteam;
    let lossingteam ;
    // finding the name of winning team
    if (chSelector(bothTeam[0]).hasClass("team-gray") == false) {
        winningteam = chSelector(bothTeam[0]).find(".name-link").text();
        lossingteam = chSelector(bothTeam[1]).find(".name-link").text();
    } else {
        winningteam = chSelector(bothTeam[1]).find(".name-link").text();
        lossingteam = chSelector(bothTeam[0]).find(".name-link").text();
    }
   
    
    let select = chSelector(".Collapsible .header-title.label"); // collapsable select
    for (let i = 0; i < select.length; i++) {
        let nam = chSelector(select[i]).text();
        let namee = nam.split("INNINGS")[0].trim(); // bina .trim ke ans nhi aarha 
        if (namee == winningteam) {
            createFolder(path.join(mainfolder,namee));
            // console.log(winningteam)
            let bat = chSelector(".Collapsible__contentOuter .table.batsman");
            let winningbat = chSelector(bat[i]);
            let everyrow = winningbat.find("tr");
            for (let j = 0; j < everyrow.length; j++) {
                let everycol = chSelector(everyrow[j]).find("td");
                if (everycol.length == 8) {
                    let playername = chSelector(everycol[0]).text();
                    let playerruns = chSelector(everycol[2]).text();
                    let playerbowl = chSelector(everycol[3]).text();
                    let player4s = chSelector(everycol[5]).text();
                    let player6s = chSelector(everycol[6]).text();
                    let player_strikerate = chSelector(everycol[7]).text();
                    //  console.log(playername , playerruns)
                    addToLeader(playerruns, playername,playerbowl,player4s,player6s,player_strikerate,namee);
                }
                // array of object input me leta hai
            }
            
            
        }else{
            createFolder(path.join(mainfolder,namee));
            let bat = chSelector(".Collapsible__contentOuter .table.batsman");
            let winningbat = chSelector(bat[i]);
            let everyrow = winningbat.find("tr");
            for (let j = 0; j < everyrow.length; j++) {
                let everycol = chSelector(everyrow[j]).find("td");
                if (everycol.length == 8) {
                    let playername = chSelector(everycol[0]).text();
                    let playerruns = chSelector(everycol[2]).text();
                    let playerbowl = chSelector(everycol[3]).text();
                    let player4s = chSelector(everycol[5]).text();
                    let player6s = chSelector(everycol[6]).text();
                    let player_strikerate = chSelector(everycol[7]).text();
                    //  console.log(playername , playerruns)
                    addToLeader(playerruns, playername,playerbowl,player4s,player6s,player_strikerate,namee);
                }
                // array of object input me leta hai
            }
        }
       
    }    
    

    // console.log(count);
    // count++;
    if (count == gcount) {
        console.table(statArr)
    } else {
        count++;
    }

}
function addToLeader(playerruns, playername,playerbowl,player4s,player6s,player_strikerate,namee) {
    // let doesExist = false;
    // for (let i = 0; i < statArr.length; i++) {
    //     if (statArr[i].Name == playername) {
    //         statArr[i].Runs += Number(playerruns);
    //         doesExist = true;
    //         break;
    //     }
    // }
    // if (doesExist == false) {
    //     let playerObject = {
    //         Name: playername,
    //         Runs: Number(playerruns)
    //     }
    //     statArr.push(playerObject);
    // }
   let teamname = path.join(mainfolder,namee);
   let player = path.join(teamname,playername+".json"); 
   createFile(player);
   
   let playerObject = {
        Runs: Number(playerruns),
        Bowls : playerbowl,
        Fours : player4s,
        Sixes : player6s,
        StrikeRate : player_strikerate
    }
    let content = fs.readFileSync(player).length;
    if(content == 0){
        let arr = [];
        arr.push(playerObject)
        let filetosend = JSON.stringify(arr);
        fs.writeFileSync(player,filetosend);  
        // console.table(statArr)
    }else{
        let content = fs.readFileSync(player)
        let arr = JSON.parse(content);
        arr.push(playerObject)
        let filetosend = JSON.stringify(arr);
        fs.writeFileSync(player,filetosend);
    }

}
