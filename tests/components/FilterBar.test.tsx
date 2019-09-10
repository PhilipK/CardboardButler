import * as React from "react";
import { GameInfo } from "../../src/models/GameInfo";
import { render, fireEvent, waitForElement, getByTestId } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import FilterBar from "../../src/components/FilterBar";
import { FilterOptions } from "../../src/models/FilterOptions";

describe("Filter bar", () => {

    describe("it renders", () => {
        it("without props", () => {
            const { baseElement } = render(<FilterBar />);
            expect(baseElement).toBeDefined();
        });
    });

    it("can select a time option", () => {
        const onChange = jest.fn((filterOptions: FilterOptions) => { });
        const { getByTestId } = render(<FilterBar onFilterChange={onChange} />);
        const playtimeDropdown = getByTestId("PlaytimeDropdown");
        fireEvent.click(playtimeDropdown);
        const options = playtimeDropdown.querySelectorAll(".item");
        fireEvent.click(options[1]);
        expect(onChange.mock.calls.length).toEqual(1);
        expect(onChange.mock.calls[0][0]).toEqual({
            playtime: {
                minimum: 0,
                maximum: 20
            }
        });
    })

    it("can select a player count option", () => {
        const onChange = jest.fn((filterOptions: FilterOptions) => { });
        const { getByTestId } = render(<FilterBar onFilterChange={onChange} />);
        const playerCountDropdown = getByTestId("PlayercountDropdown");
        fireEvent.click(playerCountDropdown);
        const options = playerCountDropdown.querySelectorAll(".item");
        fireEvent.click(options[3]);
        expect(onChange.mock.calls.length).toEqual(1);
        expect(onChange.mock.calls[0][0]).toEqual({
            playerCount: 3
        });
    })
});

