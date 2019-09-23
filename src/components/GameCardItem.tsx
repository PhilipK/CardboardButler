import * as React from "react";
import { GameInfoPlus } from "../models/GameInfo";
import { Card, Icon, Image } from "semantic-ui-react";
import DescriptionGenerator from "../services/GameDescriptionGenerator";

type Size = "mini" | "tiny" | "small" | "medium" | "large" | "big" | "huge" | "massive";


export interface AppProps {
    item: GameInfoPlus;
    size?: Size;
}

const gameDescription = new DescriptionGenerator();

/**
 * PureComponent that renders  a given GameInfo item into a list like view.
 */
export default class GameCardItem extends React.PureComponent<AppProps> {

    render() {
        const { item, size } = this.props;
        const { owners = [] } = item;
        return (
            <Card size={size}>
                <Image src={item.imageUrl} size={"massive"} wrapped ui={false} />
                <Card.Content>
                    <Card.Header>{item.name}</Card.Header>
                    <Card.Meta>
                        <span className="date">{(item.yearPublished || "") + " - " + owners.join(", ")}</span>
                    </Card.Meta>
                    <Card.Description>
                        {gameDescription.generateDescription(item)}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    {("categories" in item) && item.categories && item.categories.join(", ")}
                </Card.Content>
            </Card>
        );
    }
}
