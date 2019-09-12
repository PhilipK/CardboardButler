import * as React from "react";
import { Dropdown } from "semantic-ui-react";
import { FilterOptions, PlayTimeOption, PlayCountOption } from "../models/FilterOptions";


export interface Props {

    onFilterChange?: (options: FilterOptions) => any;
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

    render() {
        return (
            <div>
                <Dropdown
                    inline={true}
                    placeholder="any time"
                    data-testid="PlaytimeDropdown"
                    options={timeOptions}
                    closeOnChange={true}
                    onChange={(_e, d) => this.onTimeChange(d.value as number)} />
                <Dropdown
                    inline={true}
                    placeholder="any number of players"
                    data-testid="PlayercountDropdown"
                    options={playercountOptions}
                    closeOnChange={true}
                    onChange={(_e, d) => this.onPlayerCountChange(d.value as number)} />

            </div>
        );
    }
}
