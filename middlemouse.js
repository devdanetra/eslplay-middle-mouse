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

    static get teamMembers() {
        //todo make this working
    }

}


class MiddleMouseUtils {
    static ID_REGEX = new RegExp('^[0-9]+$');
    static PLAYERID_ACTIVATION_PATH_REGEX = new RegExp('\/(player|admin_leaguebans|admin_exceptions|admin_leaguepenalties|admin_barrages|contestant)\/');
    static TEAMID_ACTIVATION_PATH_REGEX = new RegExp('\/(team|admin_leaguepenalties|admin_exceptions|team_permissions|contestant|)\/');

    static CANT_REACH_PLAYERID = "Can't reach player ID. You can't use this command here";
    static CANT_REACH_TEAMID = "Can't reach team ID. You can't use this command here";

}

class LoginData{
    constructor(ip,date,service){
        this.ip=ip;
        this.date = date;
        this.service = service;
    };
}

class User {
    
    constructor(id, name, nick, registerDate, age, gender, nationality, country, mainTeam,homepage) {
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

    getAllLoginData(){
        //todo make this working
    }

    static async getFromID(id) { //todo add error handling
        var name,nick,registerDate,age,gender,nationality,country,mainTeam,homepage;
        await axios.get(`https://play.eslgaming.com/player/${id}/`).then((response) => { //getting user page from id
            if (response.status == 200) {

                var page = $.parseHTML(response.data);
                var elements = $('.playerprofile_stammdaten', page).children().children().children().next(); //Getting profile data

                var results = new Array();
                Array.from(elements).forEach((e) => {
                    results.push(e.innerText.trim());
                });

                //PARSING RESULTS
                name = results[0];
                nick = results[1];
                registerDate = results[2];
                age = results[3].split("/")[0].trim();
                gender = results[3].split("/")[1].trim();
                nationality = results[4];
                country = results[5];
                mainTeam = results[6];
                homepage = results[7];

                console.log(name + " | " + nick + " | " + registerDate + " | " + age + " | " + gender + " | " + nationality + " | " + country);

            } else return console.log("unable to fetch player id " + id);
        });
        return new User(id,name, nick, registerDate, age, gender, nationality, country,mainTeam,homepage);

    }
}