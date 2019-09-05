import * as React from "react";
import "./../assets/scss/App.scss";
import BggGameService from "../services/BggGameService";
import { GameInfo } from "../models/GameInfo";
import GameListItem from "./GameListItem";
import SelectUserInput from "./SelectUserInput";



import { Item, Container } from "semantic-ui-react";

export interface AppProps {
}


export interface AppState {
    games: GameInfo[];
    loadingMessage: string;
    names: string[];
}


export default class App extends React.Component<AppProps, AppState> {

    private bggService: BggGameService;
    constructor(superProps: Readonly<AppProps>) {
        super(superProps);
        this.state = { games: [], loadingMessage: "", names: [] };
        this.fetchGames = this.fetchGames.bind(this);
        this.bggService = new BggGameService(window.fetch);
        this.onNameChange = this.onNameChange.bind(this);
    }

    componentDidMount() {
        this.fetchGames();
    }

    async fetchGames() {
        this.setState({ loadingMessage: "Fetching games" });
        const games = await this.bggService.getUserCollection("Warium");
        console.log(games);
        if (Array.isArray(games)) {
            this.setState({ games: games, loadingMessage: "" });
        } else if (games.retryLater) {
            if (games.error) {
                this.setState({ loadingMessage: "An error occoured, trying agian in 5 seconds" });
            } else {
                this.setState({ loadingMessage: "Bgg is working on it, trying again in 5 seconds" });
            }
            setTimeout(this.fetchGames, 5000);
        }
    }

    onNameChange(newNames: string[]) {
        this.setState({
            names: newNames
        })
    }

    render() {
        const { games, loadingMessage, names } = this.state;
        return (
            <div className="app">
                <SelectUserInput bggNames={names} onNameChange={this.onNameChange} />
                {loadingMessage}
                <Container fluid className="collections">
                    <div>
                        <Container text className="main" >
                            <Item.Group>
                                {games.map((game) => <GameListItem item={game} />)}
                            </Item.Group>
                        </Container>
                    </div>
                </Container>
            </div>
        );
    }
}
