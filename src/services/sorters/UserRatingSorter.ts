import { Sorter } from "./Sorter";
import { GameInfoPlus, GameInfo } from "../../models/GameInfo";

export class UserRatingSorter implements Sorter {

    constructor() {
        this.userRatingSorter = this.userRatingSorter.bind(this);
    }

    sort(collection: GameInfoPlus[]): GameInfoPlus[] {
        return [...collection.sort(this.userRatingSorter)];
    }

    private userRatingSorter(a: GameInfo, b: GameInfo): number {
        const aRating = this.getAverageUserRating(a);
        const bRating = this.getAverageUserRating(b);
        return (bRating || 0) - (aRating || 0);
    }

    private getAverageUserRating(a: GameInfo) {
        const scoreMap = a.userRating;
        if (!scoreMap) {
            return undefined;
        } else {
            const userNames = Object.keys(scoreMap);
            const userNamesWithRatings = userNames.filter((name) => scoreMap[name]);
            if (userNamesWithRatings.length === 0) {
                return undefined;
            }
            const sum = userNamesWithRatings.reduce((p, c) => p + scoreMap[c], 0);
            return sum / userNamesWithRatings.length;
        }
    }
}