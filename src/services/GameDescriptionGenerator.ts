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

const vowel_list = "aeiouAEIOU";


/**
 * Can generate a human readable describtion of a given game.
 */
export default class DescriptionGenerator {

    /**
     * Given game information, generates a human readable description.
     * @param gameInfo the game to generate a description for.
     */
    generateDescription(gameInfo: GameInfo): string {
        const rating = this.getRatingDescription(gameInfo.averagerating);
        const family = this.getFamilyDescription(gameInfo);
        const players = this.getPlayerInfoString(gameInfo);
        const playtime = this.getTimeInfoString(gameInfo);
        const aOrAn = this.getAOrAn(family);
        let firstString = `${aOrAn} ${family} for ${players} in ${playtime}.`;

        if (gameInfo.weight !== undefined || gameInfo.averagerating !== undefined) {
            firstString += ` Most people think it is `;
        }
        if (gameInfo.averagerating !== undefined) {
            firstString += rating.toLowerCase();
            if (gameInfo.weight === undefined) {
                firstString += ".";
            }
        }
        if (gameInfo.weight !== undefined && gameInfo.averagerating !== undefined) {
            firstString = firstString + " and ";
        }
        if (gameInfo.weight !== undefined) {
            const weight = this.getWeightInfo(gameInfo);
            firstString += weight + " to learn.";
        }
        return firstString;
    }

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
        let name = bestFamily.friendlyName.toLowerCase();
        if (name.indexOf(" rank") > -1) {
            name = name.substring(0, name.indexOf(" rank"));
        }
        if (!name.endsWith("game")) {
            name += " game";
        }
        return name;
    }

    private getRatingDescription(ratingValue?: number) {
        const ratingIndex = Math.round(ratingValue);
        const ratingInfo = ratingNames[ratingIndex - 1];
        return ratingInfo ? ratingInfo : "";
    }

    private getPlayerInfoString(gameInfo: GameInfo) {
        let playerInfo = "";
        const { minPlayers, maxPlayers } = gameInfo;

        if (minPlayers === maxPlayers) {
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

        if (mintime === maxtime) {
            timeInfo += maxtime + " minute";
        } else if (maxtime < mintime) {
            timeInfo += mintime + " minute";
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
        return weightName[Math.max(weightIndex, 0)].toLowerCase();
    }
}