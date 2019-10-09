import GameListItem from "./GameListItem";
import FilterBar from "./FilterBar";
import { Item, Container, Header, Card, Icon, Divider } from "semantic-ui-react";

import * as React from "react";
import { FilterAndSortOptions } from "../models/FilterOptions";
import { GamesFilterAndSorter } from "../services/GamesFilterAndSorter";
import { GameInfoPlus } from "../models/GameInfo";
import NoGamesFound from "./NoGamesFound";
import PickAGameForMe from "./PickAGame";
import GameCardItem from "./GameCardItem";
import Footer from "./Footer";
import CollectionList from "./CollectionList";
import CollectionGrid from "./CollectionGrid";



type ViewType = "grid" | "list";

interface Props {
    games?: GameInfoPlus[];
    currentUsers?: string[];
}

interface State {
    filterOptions: FilterAndSortOptions;
    viewType: ViewType;
}


export default class CollectionPage extends React.Component<Props, State> {


    constructor(props: Props) {
        super(props);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onSetViewType = this.onSetViewType.bind(this);
        this.state = { filterOptions: {}, viewType: "list" };
    }

    onFilterChange(filterOptions: FilterAndSortOptions) {
        this.setState({
            filterOptions: filterOptions
        });
    }

    onSetViewType(viewType: ViewType) {
        this.setState({
            viewType: viewType
        });
    }

    render() {
        const { games = [], currentUsers = [] } = this.props;
        const { viewType } = this.state;
        const filterer = new GamesFilterAndSorter();
        const filteredGames = filterer.filterAndSort(games, this.state.filterOptions);
        const noGames = filteredGames.length === 0;
        return (
            <div data-testid="CollectionPage">
                <div style={{ position: "absolute", top: 20, right: 20 }}>
                    <Icon size="small" inverted={viewType === "list"} bordered circular name="list" onClick={() => this.onSetViewType("list")} />
                    <Icon size="small" inverted={viewType === "grid"} bordered circular name="grid layout" onClick={() => this.onSetViewType("grid")} />
                </div>
                <Container fluid textAlign="center" className="logoHeader">
                    <Header as="h1">
                        <span className="logoscript">Cardboard Butler</span>
                    </Header>
                </Container>
                <FilterBar onFilterChange={this.onFilterChange} currentUsers={currentUsers} />

                {noGames && <NoGamesFound />}

                {filteredGames.length > 0 && <Container text fluid>
                    <PickAGameForMe games={filteredGames} />
                    <Divider hidden />
                </Container>
                }
                <Container fluid text={viewType === "list"}>
                    {viewType === "list" &&
                        <CollectionList games={filteredGames} />
                    }
                    {viewType === "grid" &&
                        <CollectionGrid games={filteredGames} />
                    }
                </Container>
                <Footer />

            </div>
        );
    }
}
