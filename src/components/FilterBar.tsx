import * as React from "react";
import { Item, Dropdown } from "semantic-ui-react";
import { FilterOptions, PlayTimeOption, PlayCountOption } from "../models/FilterOptions";


export interface Props {

    onFilterChange?: (options: FilterOptions) => any;
}
interface State {
    filterOptions: FilterOptions;
}

interface TimerOptions {
    text: string,
    value: number;
    playtime?: PlayTimeOption;
}

export const timeOptions: TimerOptions[] = [
    { text: 'any time', value: 0, playtime: undefined },
    { text: 'less than 20 minutes', value: 1, playtime: { minimum: 0, maximum: 20 } },
    { text: '20-60 minutes', value: 2, playtime: { minimum: 20, maximum: 60 } },
    { text: '1-2 hours', value: 3, playtime: { minimum: 60, maximum: 120 } },
    { text: '2-4 hours', value: 4, playtime: { minimum: 120, maximum: 240 } },
    { text: '4 or more hours', value: 5, playtime: { minimum: 240, maximum: 9999999 } }
];



interface PlayerCountOptions {
    text: string,
    value: number;
    playercount?: PlayCountOption;
}

export const playercountOptions: PlayerCountOptions[] = [
    { text: 'any number of players', value: 0 },
    { text: '1 person', value: 1, playercount: 1 },
    { text: '2 people', value: 2, playercount: 2 },
    { text: '3 people', value: 3, playercount: 3 },
    { text: '5 people', value: 4, playercount: 5 },
    { text: '6 people', value: 5, playercount: 6 },
    { text: '7 people', value: 6, playercount: 7 },
    { text: '8 people', value: 7, playercount: 8 },
    { text: '9 people', value: 8, playercount: 9 },
    { text: '10 people', value: 9, playercount: 10 }
];


const initialState: State = {
    filterOptions: {

    }
};


/**
 * PureComponent that renders  a given GameInfo item into a list like view.
 */
export default class FilterBar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = initialState;
        this.onTimeChange = this.onTimeChange
    }


    onTimeChange(timerIndex: number) {
        const option = timeOptions[timerIndex].playtime;
        const newFilter = Object.assign({}, this.state.filterOptions, { playtime: option });
        this.props.onFilterChange(newFilter);
        this.setState({ filterOptions: newFilter });
    }

    onPlayerCountChange(playerCountIndex: number) {
        const option = playercountOptions[playerCountIndex].playercount;
        const newFilter = Object.assign({}, this.state.filterOptions, { playerCount: option });
        this.props.onFilterChange(newFilter);
        this.setState({ filterOptions: newFilter });
    }

    render() {
        return (
            <div>
                <Dropdown
                    inline={true}
                    placeholder='any time'
                    data-testid="PlaytimeDropdown"
                    options={timeOptions}
                    onChange={(e, d) => this.onTimeChange(d.value as number)} />
                );

                <Dropdown
                    inline={true}
                    placeholder='any number of players'
                    data-testid="PlayercountDropdown"
                    options={playercountOptions}
                    onChange={(e, d) => this.onPlayerCountChange(d.value as number)} />
                );
        </div>
        )
    };
}
