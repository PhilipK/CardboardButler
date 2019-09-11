import GameListItem from "./GameListItem";
import FilterBar from "./FilterBar";
import { Item, Container } from "semantic-ui-react";

import * as React from "react";
import { FilterOptions } from "../models/FilterOptions";
import { GamesFilterer } from "../services/GamesFilterer";
import { GameInfo } from "../models/GameInfo";


interface Props {
    games?: GameInfo[];
}

interface State {
    filterOptions: FilterOptions;
}


export default class CollectionPage extends React.Component<Props, State> {


    constructor(props: Props) {
        super(props);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.state = { filterOptions: {} };
    }

    onFilterChange(filterOptions: FilterOptions) {
        this.setState({
            filterOptions: filterOptions
        });
    }

    render() {
        const { games = [] } = this.props;
        const filterer = new GamesFilterer();
        const filteredGames = filterer.filter(games, this.state.filterOptions);
        return (
            <div data-testid="CollectionPage">
                <FilterBar onFilterChange={this.onFilterChange} />
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
