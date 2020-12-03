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
        }else return MiddleMouseUtils.CANT_REACH_PLAYERID;
    }

    static get teamID(){
        var path = window.location.pathname; //getting current path
        var activationPaths = MiddleMouseUtils.TEAMMEMBERSIDS_ACTIVATION_PATH_REGEX.exec(path); //getting list of paths where playerID can be reached and scraped from the current window path.
        if (activationPaths != null) { //checking if we can actually find the playerID
            var pathArray = path.split("/");
            var mainPath = activationPaths[0].replaceAll("/", ""); //getting main path 
            for (var j = pathArray.indexOf(mainPath); j < pathArray.length; j++) {
                console.log("Checking : " + pathArray[j]);
                if (MiddleMouseUtils.ID_REGEX.test(pathArray[j])) {
                    return pathArray[j]; //getting only ID numbers
                }
            }
        }else return MiddleMouseUtils.CANT_REACH_TEAMID;
    }

}


class MiddleMouseUtils {
    static ID_REGEX = new RegExp('^[0-9]+$');
    static PLAYERID_ACTIVATION_PATH_REGEX = new RegExp('\/(player|admin_leaguebans|admin_exceptions|admin_leaguepenalties|admin_barrages|contestant)\/');
    static TEAMMEMBERSIDS_ACTIVATION_PATH_REGEX = new RegExp('\/(team|admin_leaguepenalties|admin_exceptions|team_permissions|contestant|)\/');

    static CANT_REACH_PLAYERID = "Can't reach player ID. You can't use this command here";
    static CANT_REACH_TEAMID = "Can't reach team ID. You can't use this command here";

}