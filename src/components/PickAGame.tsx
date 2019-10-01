import React = require("react");
import { Icon, Dimmer, Container, Item, Button, Segment, Card, Header, Divider } from "semantic-ui-react";
import { GameInfoPlus, } from "../models/GameInfo";
import GameListItem from "./GameListItem";

interface Props {
    games: GameInfoPlus[];
}

interface State {
    pickedGame?: GameInfoPlus;
    gamesAlreadyShown: GameInfoPlus[];
}

const initialState = {
    pickedGame: undefined,
    gamesAlreadyShown: []
};

export default class PickAGameForMe extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = initialState;
        this.pickARandomGame = this.pickARandomGame.bind(this);
        this.close = this.close.bind(this);
    }

    pickARandomGame() {
        const games = this.props.games;
        let gamesAlreadyShown = [...this.state.gamesAlreadyShown];
        let gamesToPickFrom = games.filter((gameToPossiblyPickFrom) => gamesAlreadyShown.every((alreadyShownGame) => alreadyShownGame.id !== gameToPossiblyPickFrom.id));
        if (gamesToPickFrom.length === 0) {
            gamesAlreadyShown = [];
            gamesToPickFrom = games;

        }
        const randomIndexDice = new Array(3).fill(0).map(() => this.randomInteger(0, gamesToPickFrom.length - 1));
        const randomIndex = randomIndexDice.reduce((p, c) => Math.min(p, c), Math.ceil((gamesToPickFrom.length - 1) / 2));
        const pickedGame = gamesToPickFrom[randomIndex];
        gamesAlreadyShown.push(pickedGame);
        this.setState({
            pickedGame: pickedGame,
            gamesAlreadyShown: gamesAlreadyShown
        });
    }

    randomInteger(from: number, to: number): number {
        return Math.floor(Math.random() * to) + from;
    }

    close() {
        this.setState(initialState);
    }

    render() {
        const pickedGame = this.state.pickedGame;
        if (pickedGame) {
            return (
                <Dimmer inverted active={true} onClick={this.close}>
                    <Container >
                        <Segment>
                            <Header as="h3">What about this game?</Header>
                            <Item.Group centered>
                                <GameListItem size={"large"} item={pickedGame} />
                            </Item.Group>
                            <Button className="large" color="black" onClick={(e) => {
                                e.stopPropagation();
                                this.pickARandomGame();
                            }} >
                                <Icon name="cube" />Find another
                            </Button>
                        </Segment>
                    </Container>

                </Dimmer >
            );
        } else {
            return (
                <Container text >
                    <Button fluid basic onClick={(e) => {
                        e.stopPropagation();
                        this.pickARandomGame();
                    }}>
                        <Icon name="cube" />Pick a game for me!
            </Button>
                </Container>
            );
        }
    }
}