import GameService, { BggRetryResult } from "./GameService";
import FetchService from "./FetchService";

class BggGameService implements GameService {

    private fetchService: FetchService;
    private parser = new DOMParser();


    constructor(fetchService: FetchService) {
        this.fetchService = fetchService;
    }

    async getUserCollection(username: string): Promise<GameInfo[] | BggRetryResult> {
        const textResult = await this.fetchService(this.buildCollectionUrl(username)).then((res) => res.text());
        const xmlDoc = this.parser.parseFromString(textResult, "application/xml");
        const itemsXml = xmlDoc.childNodes[1];
        const games: GameInfo[] = [];
        itemsXml.childNodes.forEach((item, i) => {
            if (item.nodeName == "item") {
                
                const game: GameInfo = {
                    name: "john",
                    thumbnailUrl: "seena"
                }
                games.push(game);
            }
        });
        return games;

    }

    private buildCollectionUrl(username: string) {
        return `https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1`;
    }
}

export default BggGameService;