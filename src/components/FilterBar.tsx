import * as React from "react";
import { Dropdown, Container } from "semantic-ui-react";
import { FilterAndSortOptions, PlayTimeOption, PlayCountOption, SortOption } from "../models/FilterOptions";

export interface Props {

    onFilterChange?: (options: FilterAndSortOptions) => any;
    currentUsers?: string[];
}
interface State {
    filterOptions: FilterAndSortOptions;
}

interface TimerOptions {
    text: string;
    value: number;
    playtime?: PlayTimeOption;
}





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

interface SortingOptions {
    text: string;
    value: number;
    sortoption?: SortOption;
    ["data-testid"]?: string;
}





const initialState: State = {
    filterOptions: {
    }
};

export default class FilterBar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = initialState;
        this.getSortOptionFromIndex = this.getSortOptionFromIndex.bind(this);
        this.getSortOptionFromIndexSingle = this.getSortOptionFromIndexSingle.bind(this);
        this.getDropdownValues = this.getDropdownValues.bind(this);
        this.getSortOptions = this.getSortOptions.bind(this);
    }

    getOptions() {
        const timeOptions: TimerOptions[] = [
            { text: "any time", value: 0, playtime: null },
            { text: "30 minutes or less", value: 1, playtime: { minimum: 0, maximum: 30 } },
            { text: "1 hour or less", value: 2, playtime: { maximum: 60 } },
            { text: "2 hours or less", value: 3, playtime: { maximum: 120 } },
            { text: "3 hours or less", value: 4, playtime: { maximum: 180 } },
            { text: "20-60 minutes", value: 5, playtime: { minimum: 20, maximum: 60 } },
            { text: "1-2 hours", value: 6, playtime: { minimum: 60, maximum: 120 } },
            { text: "2-4 hours", value: 7, playtime: { minimum: 120, maximum: 240 } },
            { text: "4 or more hours", value: 8, playtime: { minimum: 240, maximum: 9999999 } },

        ];
        return timeOptions;
    }

    getSortOptions() {
        const options = this.state.filterOptions.sortOption;
        const allowMultiSelect = Array.isArray(options);
        const { currentUsers = ["Unknown"] } = this.props;
        const oneUser = currentUsers.length <= 1;
        const iWe = oneUser ? "I" : "we";

        const sortingOptions: SortingOptions[] = [
            { text: "are highly rated", value: 0, sortoption: "bggrating" },
            { text: "are alphabetic", value: 1, sortoption: "alphabetic" },
            { text: "are new", value: 2, sortoption: "new", ["data-testid"]: "sortByNew" },
            { text: "are old", value: 3, sortoption: "old" },
            { text: iWe + " rate highly", value: 4, sortoption: "userrating" },
            { text: "are easy to learn", value: 5, sortoption: "weight-light" },
            { text: "are complex", value: 6, sortoption: "weight-heavy" },
            { text: "are best with this number of players", value: 7, ["data-testid"]: "suggestedPlayers" },
            { text: iWe + " played recently", value: 8, sortoption: "playedRecently" },
            { text: iWe + " haven't played in a while", value: 9, sortoption: "playedLongAgo" },
            { text: iWe + " have played a lot", value: 10, sortoption: "playedALot" },
            { text: iWe + " have not played a lot", value: 11, sortoption: "playedNotALot" },
        ];
        const singlePreferenceOption: SortingOptions = { text: iWe + " only have one preference", value: 12, ["data-testid"]: "SortBySingleOption" };
        const multiPreferenceOption: SortingOptions = { text: iWe + " have multiple preferences", value: 12, ["data-testid"]: "SortByMultipleOption" };
        return [...sortingOptions, allowMultiSelect ? singlePreferenceOption : multiPreferenceOption];
    }

    onTimeChange(timerIndex: number) {
        const option = this.getOptions()[timerIndex].playtime;
        this.combineState({ playtime: option });
    }

    onPlayerCountChange(playerCountIndex: number) {
        const option = playercountOptions[playerCountIndex].playercount;
        const sortOption = this.state.filterOptions.sortOption;
        if (Array.isArray(sortOption)) {
            this.combineState({ playerCount: option, sortOption: sortOption.map((so) => typeof so === "object" ? Object.assign({}, this.state.filterOptions.sortOption, { numberOfPlayers: option }) : so) as any });
        } else if (typeof sortOption === "object") {
            this.combineState({ playerCount: option, sortOption: Object.assign({}, this.state.filterOptions.sortOption, { numberOfPlayers: option }) });
        } else {
            this.combineState({ playerCount: option });
        }
    }

    onSortChange(sortOptionIndex: number | number[]) {
        const currentOption = this.state.filterOptions.sortOption;
        const clickedSwitchState = sortOptionIndex === 12 || (Array.isArray(sortOptionIndex) && sortOptionIndex.indexOf(12) > -1);
        if (clickedSwitchState) {
            if (Array.isArray(currentOption)) {
                this.combineState({ sortOption: currentOption[0] });
            } else {
                this.combineState({ sortOption: [currentOption] });
            }
        } else {
            if (Array.isArray(sortOptionIndex)) {
                this.combineState({ sortOption: this.getSortOptionFromIndex(sortOptionIndex) as SortOption[] });
            } else {
                this.combineState({ sortOption: this.getSortOptionFromIndexSingle(sortOptionIndex) });
            }
        }
    }



    getSortOptionFromIndex(sortOptionIndex: number[]) {
        if (sortOptionIndex.length === 0) {
            return this.getSortOptions()[0];
        }
        return sortOptionIndex.map(this.getSortOptionFromIndexSingle);
    }

    getSortOptionFromIndexSingle(sortOptionIndex: number) {
        const sortingOptions = this.getSortOptions();
        let option = sortingOptions[sortOptionIndex].sortoption;
        if (option === undefined && sortingOptions[sortOptionIndex].value === 7) {
            option = {
                type: "suggestedPlayers",
                numberOfPlayers: this.state.filterOptions.playerCount
            };
        }
        return option;
    }

    combineState(options: FilterAndSortOptions) {
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

    getDropdownValues() {
        const options = this.state.filterOptions.sortOption;
        const sortingOptions = this.getSortOptions();
        if (options === undefined) {
            return undefined;
        }
        if (Array.isArray(options)) {
            if (options.length === 1 && options[0] === undefined) {
                return [];
            }
            return options.map((o) => typeof o === "object" ? 7 : sortingOptions.findIndex((so) => so.sortoption === o));
        } else {
            return typeof options === "object" ? 7 : sortingOptions.findIndex((so) => so.sortoption === options);
        }
    }

    render() {


        const { currentUsers = ["Unknown"] } = this.props;
        const options = this.state.filterOptions.sortOption;
        const allowMultiSelect = Array.isArray(options);
        const oneUser = currentUsers.length <= 1;
        const iWe = oneUser ? "I" : "we";
        const amAre = oneUser ? "am" : "are";
        const sortingOptions = this.getSortOptions();
        const values = this.getDropdownValues();
        const timeOptions = this.getOptions();
        return (
            <Container fluid>
                <div className="topMenu ui fixed" >
                    <div className="ui container">
                        <span className="topselect">
                            <span>Hi {iWe}  {amAre} </span>
                            <span><a href="#"><b>{this.joinWithAndEnd(currentUsers)}</b></a></span>
                            <span> {iWe}  {amAre} looking for a </span>
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

                        <span className="topselect">
                            <span>and {iWe} prefer games that </span>
                            <Dropdown
                                inline={true}
                                placeholder={sortingOptions[0].text}
                                data-testid="SortOptionDropdown"
                                options={this.getSortOptions()}
                                multiple={allowMultiSelect}
                                closeOnChange={!allowMultiSelect}
                                value={values}
                                onChange={(_e, d) => this.onSortChange(d.value as number[])} />
                        </span>
                    </div>
                </div>
            </Container>
        );
    }
}
