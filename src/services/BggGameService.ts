import GameService, { BggRetryResult } from "./GameService";
import FetchService from "./FetchService";

class BggGameService implements GameService {

    private fetchService: FetchService;

    constructor(fetchService: FetchService) {
        this.fetchService = fetchService;
    }

    getUserCollection(username: string): GameInfo[] | BggRetryResult {
        this.fetchService(`https://cors-anywhere.herokuapp.com/https://api.geekdo.com/xmlapi2/collection?username=${username}&own=1&stats=1`);
        return [];
    }

}

export default BggGameService;