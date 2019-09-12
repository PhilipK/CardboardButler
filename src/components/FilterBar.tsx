import * as React from "react";
import { Dropdown, Container } from "semantic-ui-react";
import { FilterOptions, PlayTimeOption, PlayCountOption } from "../models/FilterOptions";

export interface Props {

    onFilterChange?: (options: FilterOptions) => any;
    currentUsers?: string[];
}
interface State {
    filterOptions: FilterOptions;
}

interface TimerOptions {
    text: string;
    value: number;
    playtime?: PlayTimeOption;
}

export const timeOptions: TimerOptions[] = [
    { text: "any time", value: 0, playtime: null },
    { text: "less than 20 minutes", value: 1, playtime: { minimum: 0, maximum: 20 } },
    { text: "20-60 minutes", value: 2, playtime: { minimum: 20, maximum: 60 } },
    { text: "1-2 hours", value: 3, playtime: { minimum: 60, maximum: 120 } },
    { text: "2-4 hours", value: 4, playtime: { minimum: 120, maximum: 240 } },
    { text: "4 or more hours", value: 5, playtime: { minimum: 240, maximum: 9999999 } }
];



interface PlayerCountOptions {
    text: string;
    value: number;
    playercount?: PlayCountOption;
}

export const playercountOptions: PlayerCountOptions[] = [
    { text: "any number of players", value: 0, playercount: null },
    { text: "1 person", value: 1, playercount: 1 },
];

for (let i = 2; i <= 10; i++) {
    playercountOptions.push({ text: i + " people", value: i, playercount: i });
}


const initialState: State = {
    filterOptions: {
    }
};

export default class FilterBar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = initialState;
    }

    onTimeChange(timerIndex: number) {
        const option = timeOptions[timerIndex].playtime;
        this.combineState({ playtime: option });
    }

    onPlayerCountChange(playerCountIndex: number) {
        const option = playercountOptions[playerCountIndex].playercount;
        this.combineState({ playerCount: option });

    }

    combineState(options: FilterOptions) {
        const newFilter = Object.assign({}, this.state.filterOptions, options);
        if (this.props.onFilterChange) {
            this.props.onFilterChange(newFilter);
        }
        this.setState({ filterOptions: newFilter });
    }

    joinWithAndEnd(strings: string[]): string {
        if (strings.length === 1) {
            return strings[0];
        }
        const newStrings = [...strings];
        const last = newStrings.pop();
        return newStrings.join(", ") + " and " + last;
    }

    render() {
        const { currentUsers = ["Unknown"] } = this.props;
        const oneUser = currentUsers.length <= 1;
        const iAmWeAre = oneUser ? "i am" : "we are";
        return (
            <Container fluid>
                <div className="topMenu ui fixed" >
                    <div className="ui container">
                        <span className="topselect">
                            <span>Hi {iAmWeAre} </span>
                            <Dropdown
                                inline={true}
                                text={this.joinWithAndEnd(currentUsers)}
                            />
                            <span>{iAmWeAre} looking for a </span>
                            <span>boardgame </span>
                            <span className="topselect">
                                <span>that plays in </span>
                                <Dropdown
                                    inline={true}
                                    placeholder="any time"
                                    data-testid="PlaytimeDropdown"
                                    options={timeOptions}
                                    closeOnChange={true}
                                    onChange={(_e, d) => this.onTimeChange(d.value as number)} />
                            </span>
                        </span>

                        <span className="topselect">
                            <span>with </span>
                            <Dropdown
                                inline={true}
                                placeholder="any number of players"
                                data-testid="PlayercountDropdown"
                                options={playercountOptions}
                                closeOnChange={true}
                                onChange={(_e, d) => this.onPlayerCountChange(d.value as number)} />
                        </span>
                    </div>
                </div>
            </Container>
        );
    }
}
