import * as React from "react";
import { Container, Divider, Header, List } from "semantic-ui-react";


interface Props {
}

/**
 * PureComponent that renders a Footer.
 */
export default class Footer extends React.PureComponent<Props> {

    render() {
        return (
            <Container text className="Footer">
                <Divider />
                <List horizontal>
                    <List.Item>
                        <Header className="faded" as="h5">
                            <a href="about.html">About Cardboard Butler </a>
                        </Header >
                    </List.Item>
                    <List.Item>
                        <Header className="faded" as="h5">
                            <a href="https://github.com/PhilipK/CardboardButler">Github Page</a>
                        </Header >
                    </List.Item>
                    <List.Item>
                        <Header className="faded" as="h5">
                            <a href="https://boardgamegeek.com/support">Support BGG</a>
                        </Header >
                    </List.Item>

                </List>
                <Divider hidden />

            </Container>
        );
    }
}
