import { GameInfo } from "../models/GameInfo";


const ratingNames = [
    "Outstanding",
    "Outstanding",
    "Very good",
    "Good",
    "Ok",
    "Mediocre",
    "Not so good",
    "Bad",
    "Very bad",
    "Awful"
].reverse();

const weightName = [
    "Very easy",
    "Easy",
    "Moderately difficult",
    "Somewhat hard",
    "Hard",
    "Very Hard"
];

var vowel_list = 'aeiouAEIOU';


export default class DescriptionGenerator {

    generateDescription(gameInfo: GameInfo): string {
        const rating = this.getRatingDescription(gameInfo.averagerating);
        const family = this.getFamilyDescription(gameInfo);
        const players = this.getPlayerInfoString(gameInfo);
        const playtime = this.getTimeInfoString(gameInfo);
        const aOrAn = this.getAOrAn(family);
        const firstString = `${aOrAn} ${family} for ${players} in ${playtime}. Most people think it is ${rating.toLowerCase()}`;
        if (gameInfo.weight !== undefined) {
            const weight = this.getWeightInfo(gameInfo);
            return firstString + " and " + weight + " to learn.";
        } else {
            return firstString + ".";
        }
    };

    private isVowel(input: string) {
        return vowel_list.indexOf(input) > -1;
    }

    private getAOrAn(input: string) {
        if (this.isVowel(input.charAt(0))) {
            return "An";
        }
        return "A";
    }

    private getFamilyDescription(gameInfo: GameInfo) {
        if (gameInfo.families === undefined || gameInfo.families.length === 0) {
            return "boardgame";
        }
        const bestFamily = gameInfo.families.sort((a, b) => a.value - b.value)[0];
        const name = bestFamily.friendlyName.toLowerCase();
        if (name.indexOf(" rank") > -1) {
            return name.substring(0, name.indexOf(" rank"))
        }
        return name;
    }

    private getRatingDescription(ratingValue: number) {
        const ratingIndex = Math.round(ratingValue);
        const ratingInfo = ratingNames[ratingIndex - 1];
        return ratingInfo ? ratingInfo : "Ok";
    }

    private getPlayerInfoString(gameInfo: GameInfo) {
        let playerInfo = "";
        const { minPlayers, maxPlayers } = gameInfo;

        if (minPlayers == maxPlayers) {
            playerInfo += maxPlayers + " player";
        } else {
            playerInfo += minPlayers + " to " + maxPlayers + " player";
        }
        if (maxPlayers > 1) {
            playerInfo += "s";
        }
        return playerInfo;
    }

    private getTimeInfoString(gameInfo: GameInfo) {
        let timeInfo = "";

        const mintime = gameInfo.minPlaytime;
        const maxtime = gameInfo.maxPlaytime;

        if (mintime == maxtime) {
            timeInfo += maxtime + " minute";
        } else if (maxtime < mintime) {
            timeInfo += mintime + " minutes";
        } else {
            timeInfo += mintime + " - " + maxtime + " minute";
        }
        if (maxtime > 1) {
            timeInfo += "s";
        }
        return timeInfo;
    }

    private getWeightInfo = (gameInfo: GameInfo) => {
        const weight = gameInfo.weight;
        const weightIndex = Math.round((weight - 1) / 5 * 6);
        if (weightIndex <= 0) {
            return weightName[0].toLowerCase();;
        }

        return weightName[weightIndex].toLowerCase();
    }
}