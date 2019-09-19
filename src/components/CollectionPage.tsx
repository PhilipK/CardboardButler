import GameListItem from "./GameListItem";
import FilterBar from "./FilterBar";
import { Item, Container, Header } from "semantic-ui-react";

import * as React from "react";
import { FilterAndSortOptions } from "../models/FilterOptions";
import { GamesFilterAndSorter } from "../services/GamesFilterer";
import { GameInfo, GameInfoPlus } from "../models/GameInfo";
import NoGamesFound from "./NoGamesFound";


interface Props {
    games?: GameInfoPlus[];
    currentUsers?: string[];
}

interface State {
    filterOptions: FilterAndSortOptions;
}


export default class CollectionPage extends React.Component<Props, State> {


    constructor(props: Props) {
        super(props);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.state = { filterOptions: {} };
    }

    onFilterChange(filterOptions: FilterAndSortOptions) {
        this.setState({
            filterOptions: filterOptions
        });
    }

    render() {
        const { games = [], currentUsers = [] } = this.props;
        const filterer = new GamesFilterAndSorter();
        const filteredGames = filterer.filter(games, this.state.filterOptions);
        const noGames = filteredGames.length === 0;
        return (
            <div data-testid="CollectionPage">
                <Container fluid textAlign="center" className="logoHeader">
                    <Header as="h1">
                        <span className="logoscript">Cardboard Butler</span>
                    </Header>
                </Container>
                <FilterBar onFilterChange={this.onFilterChange} currentUsers={currentUsers} />

                {noGames && <NoGamesFound />}
                <Container fluid className="collections">
                    <div>
                        <Container text className="main" >
                            <Item.Group>
                                {filteredGames.map((game) => <GameListItem key={game.id} item={game} />)}
                            </Item.Group>
                        </Container>
                    </div>
                </Container>
            </div>
        );
    }
}
