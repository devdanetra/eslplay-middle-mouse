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

    static CANT_GET_LOGINDATA = "Can't get ip logs. Maybe you don't have permissions.";
    static CANT_GET_PLAYER = "Can't get ip logs. Maybe there is no player with this id.";
    static CANT_REACH_GAMEACCOUNTDATA = "Can't reach gameaccount logs. Maybe there is no player with this id."


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
    constructor(id, name, registerDate, homepage, nationality) {
        this.id = id;
        this.name = name;
        this.registerDate = registerDate;
        this.homepage = homepage;
        this.nationality = nationality;
    }

    static async byID() {
        //todo make this working
    }
    getMembers() {
        //todo make this working
    }

    getPenalties() {
        //todo make this working
    }
}

class User {

    constructor(id, name, nick, registerDate, age, gender, nationality, country, mainTeam, homepage) {
        this.id = id;
        this.name = name;
        this.nick = nick;
        this.registerDate = registerDate;
        this.age = age;
        this.gender = gender;
        this.nationality = nationality;
        this.country = country;
        this.mainTeam = mainTeam;
        this.homepage = homepage;
    }

    async getLoginData() {
        const loginData = new Array();
        await axios.get(`https://play.eslgaming.com/rainbowsix/player/logins/${this.id}/`).then((response) => { //getting user page from id
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('.esl_compact_zebra', page).children().children();
                elements = Array.from(elements);
                elements.splice(0, 1);
                elements.forEach((element) => {
                    const dataArr = element.children;
                    console.log(dataArr[2].innerText);
                    loginData.push(new GameAccountData(dataArr[0].innerText, dataArr[1].innerText.trim(), dataArr[2].innerText.trim(), dataArr[3].innerText.trim(), dataArr[4].innerText.trim()));
                });
            }else throw new Error(CANT_REACH_LOGINDATA);
        });
        loginData.forEach(element => {
            console.log(element);
        });
    }

    getPenalties() {
        //todo make this working
    }

    async getGameAccountsData() {
        const gameAccountsData = new Array();
        await axios.get(`https://play.eslgaming.com/rainbowsix/player/gameaccounts/${this.id}/`).then((response) => { //getting user page from id
            if (response.status == 200) {
                var page = $.parseHTML(response.data);
                var elements = $('.vs_rankings_table', page).children().children();
                elements = Array.from(elements);
                elements.splice(0, 2);
                console.log(elements);
                elements.forEach((element) => {
                    const dataArr = element.children;
                    var iconHTML = new String(dataArr[1].children[0].outerHTML);
                    var active = iconHTML.includes("/active_y.gif");
                    gameAccountsData.push(new GameAccountData(dataArr[0].innerText.trim(), dataArr[1].innerText.trim(), dataArr[1].children[1].href.trim(), active,dataArr[2].innerText));
                });
            }else throw new Error(CANT_REACH_GAMEACCOUNTDATA);
        });
        gameAccountsData.forEach(element => {
            console.log(element);
        });
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

                //Parsing results and checking if not defined by user.
                name = (results[0] != '--') ? results[0] : undefined;
                nick = (results[1] != '--') ? results[1] : undefined;
                registerDate = (results[2] != '--') ? results[2] : undefined;
                age = (results[3].split("/")[0].trim() != '-') ? results[3].split("/")[0].trim() : undefined;
                gender = (results[3].split("/")[1].trim() != '-') ? results[3].split("/")[1].trim() : undefined;
                nationality = (results[4] != '--') ? results[4] : undefined;
                country = (results[5] != '--') ? results[5] : undefined;
                mainTeam = (results[6] != '--') ? results[6] : undefined;
                homepage = (results[7] != '--') ? results[7] : undefined;
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