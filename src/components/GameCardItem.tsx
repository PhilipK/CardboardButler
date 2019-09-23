import * as React from "react";
import { GameInfoPlus } from "../models/GameInfo";
import { Card, Icon, Image } from "semantic-ui-react";
import DescriptionGenerator from "../services/GameDescriptionGenerator";

export interface AppProps {
    item: GameInfoPlus;
    size: "large" | "medium" | "small" | undefined;
}

const gameDescription = new DescriptionGenerator();

/**
 * PureComponent that renders  a given GameInfo item into a list like view.
 */
export default class GameCardItem extends React.PureComponent<AppProps> {

    render() {
        const { item, size = "medium" } = this.props;
        return (
            <Card size={size}>
                <Image src={item.imageUrl} size={"massive"} wrapped ui={false} />
                <Card.Content>
                    <Card.Header>{item.name}</Card.Header>
                    <Card.Meta>
                        <span className="date">{(item.yearPublished || "") + " - " + item.owners.join(", ")}</span>
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
