import * as React from "react";
import { Item } from "semantic-ui-react";

interface AppProps {
    bggNames?: string[];
    onNameChange?: (newNames: string[]) => any;
    validNames?: string[];
    loadingNames?: string[];
    onNameSelect?: (names: string[]) => any;
}


/**
 * PureComponent that renders  a given GameInfo item into a list like view.
 */
export default class SelectUserInput extends React.PureComponent<AppProps> {

    constructor(props: AppProps) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this);
        this.getNamesToShow = this.getNamesToShow.bind(this);
        this.onAddClick = this.onAddClick.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.onUseClick = this.onUseClick.bind(this);
    }

    onInputChange(value: string, index: number) {
        if (this.props.onNameChange) {
            const bggNames = this.props.bggNames || [];
            const clone = [...bggNames];
            clone[index] = value;
            this.props.onNameChange(clone);
        }
    }

    onAddClick() {
        if (this.props.onNameChange) {
            const newNamesToShow = this.getNamesToShow().concat([""]);
            this.props.onNameChange(newNamesToShow);
        }
    }

    onDeleteClick(index: number) {
        if (this.props.onNameChange && this.props.bggNames) {
            const clone = [...this.props.bggNames];
            clone.splice(index, 1);
            this.props.onNameChange(clone);
        }
    }

    getNamesToShow() {
        const { bggNames } = this.props;
        const namesToShow = (bggNames === undefined || bggNames.length == 0) ? [""] : [...bggNames];
        return namesToShow;

    }

    onUseClick() {
        const { onNameSelect } = this.props;
        if (onNameSelect) {
            onNameSelect(this.props.bggNames);
        };
    }

    render() {
        const namesToShow = this.getNamesToShow();
        const showDelete = namesToShow.length > 1;
        const { validNames = [], loadingNames = [] } = this.props;
        const hasEnoughNames = namesToShow.length > 0 && namesToShow[0] !== "";
        const canUseNames = hasEnoughNames && namesToShow.every((name) => validNames.indexOf(name) > -1);
        return (
            <div >
                {
                    namesToShow.map((name, i) => {
                        const isValid = validNames.indexOf(name) > -1;
                        const isLoading = loadingNames.indexOf(name) > -1;
                        const inputName = "Input" + i;
                        return <div key={inputName}>
                            <input
                                data-testid={inputName}
                                value={name}
                                type="text"
                                onChange={(e) => this.onInputChange(e.target.value, i)} />
                            {isValid && <span data-testid={inputName + "Valid"}>✓</span>}
                            {isLoading && <span data-testid={inputName + "Loading"}>↺</span>}
                            {showDelete && <button
                                style={{ cursor: "pointer" }}
                                onClick={(e) => this.onDeleteClick(i)}
                                data-testid={inputName + "Delete"}>X</button>}
                        </div>
                    }
                    )
                }
                <button data-testid="AddButton" onClick={(e) => this.onAddClick()} >Add Name</button>
                <button data-testid="UseNames" disabled={!canUseNames} onClick={(e) => this.onUseClick()} >Go</button>
            </div >
        );
    }
}
