class MiddleMouse {
    constructor(site) {
        this.site = site;
    }

    static get AdminNick() {
        return ($('.userbox__profile__nickname').text().trim());
    }

    static get adminID() {
        var path = $('.userbox__profile').find("a").attr("href"); //getting path to admin profile
        var id = path.replace(/\D/g, ''); //getting only ID numbers
        return id;
    }

    static get playerID() {
        var path = window.location.pathname; //getting current path
        var activationPaths = MiddleMouseUtils.PLAYERID_ACTIVATION_PATH_REGEX.exec(path); //getting list of paths where playerID can be reached and scraped from the current window path.
        if (activationPaths != null) { //checking if we can actually find the playerID
            var pathArray = path.split("/");
            var mainPath = activationPaths[0].replaceAll("/", ""); //getting main path 
            for (var j = pathArray.indexOf(mainPath); j < pathArray.length; j++) {
                console.log("Checking : " + pathArray[j]);
                if (MiddleMouseUtils.ID_REGEX.test(pathArray[j])) {
                    return pathArray[j]; //getting only ID numbers
                }
            }
        } else return MiddleMouseUtils.CANT_REACH_PLAYERID;
    }

    static get teamID() {
        var path = window.location.pathname; //getting current path
        var activationPaths = MiddleMouseUtils.TEAMID_ACTIVATION_PATH_REGEX.exec(path); //getting list of paths where teamID can be reached and scraped from the current window path.
        if (activationPaths != null) { //checking if we can actually find the teamID
            var pathArray = path.split("/");
            var mainPath = activationPaths[0].replaceAll("/", ""); //getting main path 
            for (var j = pathArray.indexOf(mainPath); j < pathArray.length; j++) {
                console.log("Checking : " + pathArray[j]);
                if (MiddleMouseUtils.ID_REGEX.test(pathArray[j])) {
                    return pathArray[j]; //getting only ID numbers
                }
            }
        } else return MiddleMouseUtils.CANT_REACH_TEAMID;
    }

}

class MiddleMouseUtils {
    static ID_REGEX = new RegExp('^[0-9]+$');
    static PLAYERID_ACTIVATION_PATH_REGEX = new RegExp('\/(player|admin_leaguebans|admin_exceptions|admin_leaguepenalties|admin_barrages|contestant)\/');
    static TEAMID_ACTIVATION_PATH_REGEX = new RegExp('\/(team|admin_leaguepenalties|admin_exceptions|team_permissions|contestant|)\/');

    static CANT_REACH_PLAYERID = "Can't reach player ID. You can't use this command here.";
    static CANT_REACH_TEAMID = "Can't reach team ID. You can't use this command here.";

    static CANT_GET_PLAYER = "Can't get player info. Maybe there is no player with this id.";
    static CANT_GET_TEAM = "Can't get team info. Maybe there is no team with this id.";
    static CANT_GET_LOGINDATA = "Can't get ip logs. Maybe you don't have permissions.";
    static CANT_GET_GAMEACCOUNTDATA = "Can't reach gameaccount logs. Maybe there is no player with this id.";
    static CANT_GET_BARRAGEDATA = "Can't reach barrages logs. Maybe there is no player with this id.";
    static CANT_GET_ADMINEXCEPTIONDATA = "Can't reach exceptions logs. Maybe there is no player with this id.";
}

class TeamMember {
    constructor(id, role, permission, memberSince) {
        this.id = id;
        this.role = role;
        this.permission = permission;
        this.memberSince = memberSince;
    }
}

class Team {
    constructor(id, name, shorthandle, registerDate, homepage, nationality) {
        this.id = id;
        this.name = name;
        this.shorthandle = shorthandle;
        this.registerDate = registerDate;
        this.homepage = homepage;
        this.nationality = nationality;
    }

    static async byID(id) {
        var name, shorthandle, registerDate, homepage, nationality;
        await axios.get(`https://play.eslgaming.com/team/${id}/`).then((response) => { //getting user page from id
            if (response.status == 200) {

                var page = $.parseHTML(response.data);
                var elements = $('.playerprofile_stammdaten', page).children().children().children(); //Getting profile data

                const results = new Array();
                elements = Array.from(elements);
                elements.forEach((e) => {
                    if(e.innerText != "Shorthandle" && e.innerText != "homepage"){
                        results.push(e.innerText);
                    }else{
                        if(e.innerText == "Shorthandle")
                            shorthandle = elements[elements.indexOf(e) + 1].innerText;
                        else if(e.innerText == "homepage")
                            homepage = elements[elements.indexOf(e) + 1].innerText;
                        elements.splice(elements.indexOf(e),1);
                    }
                });

                //Parsing results , temporary solution
                if(elements.length>3){
                    name = results[1];
                    nationality = results[results.length-1];
                }else{
                    name = results[1];
                    registerDate = results[3];
                    nationality = results[5];
                }
            } else throw Error(CANT_GET_TEAM);
        });
        return new Team(id, name, shorthandle, registerDate, homepage, nationality);
    }
    async getMembers() {
        const members = new Array();
        await axios.get(`https://play.eslgaming.com/rainbowsix/team/members/${this.id}/?adminview=1`).then((response) => {
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('.esl_compact_zebra', page).children().children();
                elements = Array.from(elements);
                console.log(elements);
                // elements.forEach((element) => {
                //     const dataArr = element.children;
                //     var action = dataArr[0].innerText;
                //     var date = dataArr[1].innerText.trim();
                //     var service = dataArr[2].innerText.trim();
                //     var ip = dataArr[3].innerText.trim();
                //     var dns = dataArr[4].innerText.trim();
                //     loginData.push(new GameAccountData(action, date, service, ip, dns));
                // });
        //     } else throw new Error(CANT_GET_LOGINDATA);
        // });
        // loginData.forEach(element => {
        //     console.log(element);
        // });
        return members;
            }
        });
    }

    getPenalties() {
        //todo make this working
    }
}

class User {

    constructor(id, name, nick, registerDate, age, gender, nationality, country, mainTeam, homepage) {
        this.id = id;
        this.name = name != '--' ? name : undefined;
        this.nick = nick;
        this.registerDate = registerDate;
        this.age = age != '--' ? age : undefined;
        this.gender = gender != '--' ? gender : undefined;
        this.nationality = nationality != '--' ? nationality : undefined;
        this.country = country != '--' ? country : undefined;
        this.mainTeam = mainTeam != '--' ? mainTeam : undefined;
        this.homepage = homepage != '--' ? homepage : undefined;
    }

    async getLoginData() {
        const loginData = new Array();
        await axios.get(`https://play.eslgaming.com/rainbowsix/player/logins/${this.id}/`).then((response) => {
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('.esl_compact_zebra', page).children().children();
                elements = Array.from(elements);
                elements.splice(0, 1);
                elements.forEach((element) => {
                    const dataArr = element.children;
                    var action = dataArr[0].innerText;
                    var date = dataArr[1].innerText.trim();
                    var service = dataArr[2].innerText.trim();
                    var ip = dataArr[3].innerText.trim();
                    var dns = dataArr[4].innerText.trim();

                    loginData.push(new GameAccountData(action, date, service, ip, dns));
                });
            } else throw new Error(CANT_GET_LOGINDATA);
        });
        loginData.forEach(element => {
            console.log(element);
        });
        return loginData;
    }

    async isBarred() {
        var isBarred = false;
        await axios.get(`https://play.eslgaming.com/rainbowsix/admin_barrages/${this.id}/`).then((response) => {
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('b', page);
                if (elements[0] === undefined)
                    return;
                console.log(elements[0].innerText);
                if (elements[0].innerText == "Account is barred at the moment!")
                    isBarred = true;
            } else throw new Error(CANT_GET_BARRAGEDATA);
        });
        return isBarred;
    }

    async getBarragesData() {
        const barragesData = new Array();
        await axios.get(`https://play.eslgaming.com/rainbowsix/admin_barrages/${this.id}/`).then((response) => {
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('table', page).children().children();
                elements = Array.from(elements);
                elements.splice(0, 2);
                elements.forEach((element) => {
                    const dataArr = element.children;

                    //Parsing Data
                    var createdDate = dataArr[0].innerText;
                    var beginDate = dataArr[1].innerText.split("-")[0].trim();
                    var endDate = dataArr[1].innerText.split("-")[1].trim();
                    var title = dataArr[2].innerText;
                    var admin = dataArr[3].innerText;

                    barragesData.push(new BarrageData(createdDate,beginDate,endDate,title,admin));

                });
            } else throw new Error(CANT_GET_BARRAGEDATA);
        });
        barragesData.forEach(element => {
            console.log(element);
        });
        return barragesData;
    }

    async getAdminExceptionsData() {
        const adminExceptionsData = new Array();
        await axios.get(`https://play.eslgaming.com/rainbowsix/admin_exceptions/${this.id}/`).then((response) => {
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('table', page).children().children();
                elements = Array.from(elements);
                elements.splice(0, 2);
                elements.forEach((element) => {
                    const dataArr = element.children;

                    //Parsing Data
                    var createdDate = dataArr[0].innerText;
                    var points = dataArr[1].innerText;
                    var exception = dataArr[2].children[0].innerText
                    var admin = dataArr[2].children[1].innerText.trim()
                    var league = dataArr[3].innerText;
                    adminExceptionsData.push(new AdminExceptionsData(createdDate, points, exception, admin, league));
                });
            } else throw new Error(CANT_GET_ADMINEXCEPTIONDATA);
        });
        adminExceptionsData.forEach(element => {
            console.log(element);
        });
        return adminExceptionsData;
    }

    async getGameAccountsData() {
        const gameAccountsData = new Array();
        await axios.get(`https://play.eslgaming.com/rainbowsix/player/gameaccounts/${this.id}/`).then((response) => {
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('.vs_rankings_table', page).children().children();
                elements = Array.from(elements);
                elements.splice(0, 2);
                elements.forEach((element) => {
                    const dataArr = element.children;
                    var iconHTML = new String(dataArr[1].children[0].outerHTML);

                    //Parsing results
                    var platform = dataArr[0].innerText.trim();
                    var nick = dataArr[1].innerText.trim();
                    var url = dataArr[1].children[1].href.trim();
                    var active = iconHTML.includes("/active_y.gif");
                    var createdDate = active.dataArr[2].innerText;
                    gameAccountsData.push(new GameAccountData(platform, nick, url, active, createdDate));
                });
            } else throw new Error(CANT_GET_GAMEACCOUNTDATA);
        });
        gameAccountsData.forEach(element => {
            console.log(element);
        });
        return gameAccountsData;
    }

    static async byID(id) {
        var name, nick, registerDate, age, gender, nationality, country, mainTeam, homepage;
        await axios.get(`https://play.eslgaming.com/player/${id}/`).then((response) => { //getting user page from id
            if (response.status == 200) {

                var page = $.parseHTML(response.data);
                var elements = $('.playerprofile_stammdaten', page).children().children().children().next(); //Getting profile data

                const results = new Array();
                Array.from(elements).forEach((e) => {
                    results.push(e.innerText.trim());
                });

                //Parsing results
                name = results[0];
                nick = results[1];
                registerDate = results[2];
                age = results[3].split("/")[0].trim();
                gender = results[3].split("/")[1].trim();
                nationality = results[4];
                country = results[5];
                mainTeam = results[6];
                homepage = results[7];
                console.log(name + " | " + nick + " | " + registerDate + " | " + age + " | " + gender + " | " + nationality + " | " + country + "| " + mainTeam); //TO REMOVE ON RELEASE
            } else throw Error(CANT_GET_PLAYER);
        });
        return new User(id, name, nick, registerDate, age, gender, nationality, country, mainTeam, homepage);
    }
}

class LoginData {
    constructor(action, date, service, ip, dns) {
        this.action = action;
        this.date = date;
        this.service = service;
        this.ip = ip;
        this.dns = dns;
    };
}

class GameAccountData {
    constructor(platform, nick, url, active, createdDate) {
        this.platform = platform;
        this.nick = nick;
        this.url = url;
        this.active = active;
        this.createdDate = createdDate;
    };
}

class AdminExceptionsData {
    constructor(createdDate, points, exception, admin, league) {
        this.createdDate = createdDate;
        this.points = points;
        this.exception = exception;
        this.admin = admin;
        this.league = league;
    };
}

class BarrageData {
    constructor(createdDate, beginDate, endDate, title, admin) {
        this.createdDate = createdDate;
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.title = title;
        this.admin = admin;
    };
}
