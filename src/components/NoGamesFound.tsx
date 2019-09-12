import React = require("react");
import { Header, Icon } from "semantic-ui-react";

export default class NoGamesFound extends React.PureComponent<{}> {

    render() {
        return (
            <Header as="h2" icon textAlign="center" data-testid="nogames">
                <Icon name="frown" circular />
                <Header.Content>
                    <span >Sorry, I could not find any games that match what you are looking for.</span>
                </Header.Content>
            </Header>
        );
    }
}