import GameService from "./GameService";
import FetchService from "./FetchService";

class BggGameService implements GameService {

    fetchService: FetchService;

    constructor(fetchService: FetchService) {
        this.fetchService = fetchService;
    }

    getUserCollection(username: string): GameInfo[] {
        
        throw new Error("Method not implemented.");
    }

}

export default BggGameService;