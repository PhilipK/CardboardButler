import * as React from "react";
import { GameInfo } from "../../src/models/GameInfo";
import { render, fireEvent, waitForElement, getByTestId, getByText } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import FilterBar from "../../src/components/FilterBar";
import { FilterOptions } from "../../src/models/FilterOptions";

describe("Filter bar", () => {

    describe("it renders", () => {
        it("without props", () => {
            const { baseElement } = render(<FilterBar />);
            expect(baseElement).toBeDefined();
        });

        it("does not crash when selecting without onFilterChange", () => {
            const { getByTestId } = render(<FilterBar />);
            const playtimeDropdown = getByTestId("PlaytimeDropdown");
            fireEvent.click(playtimeDropdown);
            const options = playtimeDropdown.querySelectorAll(".item");
            fireEvent.click(options[0]);
        });
    });

    describe("Time selection", () => {

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
        });


        it("Clicking 'any' time will result in null", () => {
            const onChange = jest.fn((filterOptions: FilterOptions) => { });
            const { getByTestId } = render(<FilterBar onFilterChange={onChange} />);
            const playtimeDropdown = getByTestId("PlaytimeDropdown");
            fireEvent.click(playtimeDropdown);
            const options = playtimeDropdown.querySelectorAll(".item");
            fireEvent.click(options[0]);
            expect(onChange.mock.calls.length).toEqual(1);
            expect(onChange.mock.calls[0][0]).toEqual({
                playtime: null
            });
        });
    });

    describe("Player count selection", () => {

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
        });

        it("Clicking 'any' playercount will result in null", () => {
            const onChange = jest.fn((filterOptions: FilterOptions) => { });
            const { getByTestId } = render(<FilterBar onFilterChange={onChange} />);
            const playerCountDropdown = getByTestId("PlayercountDropdown");
            fireEvent.click(playerCountDropdown);
            const options = playerCountDropdown.querySelectorAll(".item");
            fireEvent.click(options[0]);
            expect(onChange.mock.calls.length).toEqual(1);
            expect(onChange.mock.calls[0][0]).toEqual({
                playerCount: null
            });
        });
    });


    describe("Selecting multiple", () => {

        it("combines filter options", () => {
            const onChange = jest.fn((filterOptions: FilterOptions) => { });
            const { getByTestId } = render(<FilterBar onFilterChange={onChange} />);
            const playerCountDropdown = getByTestId("PlayercountDropdown");
            fireEvent.click(playerCountDropdown);
            const playerCountOptions = playerCountDropdown.querySelectorAll(".item");
            fireEvent.click(playerCountOptions[1]);

            const playtimeDropdown = getByTestId("PlaytimeDropdown");
            fireEvent.click(playtimeDropdown);
            const playtimeOptions = playtimeDropdown.querySelectorAll(".item");
            fireEvent.click(playtimeOptions[1]);

            expect(onChange.mock.calls.length).toEqual(2);
            expect(onChange.mock.calls[1][0]).toEqual({
                playerCount: 1,
                playtime: {
                    minimum: 0,
                    maximum: 20
                }
            });
        });
    });


    describe("Showing names", () => {

        it("shows given multiple names", () => {
            const currentUsers = ["Cyndaq", "Warium", "Nakul"];
            const { getByText } = render(<FilterBar currentUsers={currentUsers} />);
            getByText("Hi we are");
            getByText("Cyndaq, Warium and Nakul");
            getByText("we are looking for a");
        });

        it("shows given single name", () => {
            const currentUsers = ["Cyndaq"];
            const { getByText } = render(<FilterBar currentUsers={currentUsers} />);
            getByText("Hi I am");
            getByText("Cyndaq");
            getByText("I am looking for a");
        });
    });


    describe("sorting", () => {

        it("can sort by the selected sort option", () => {

            const onChange = jest.fn((filterOptions: FilterOptions) => { });
            const { getByTestId } = render(<FilterBar onFilterChange={onChange} />);
            const sortDropdown = getByTestId("SortOptionDropdown");
            fireEvent.click(sortDropdown);
            const options = sortDropdown.querySelectorAll(".item");
            fireEvent.click(options[1]);
            fireEvent.click(options[2]);
            fireEvent.click(options[0]);
            expect(onChange.mock.calls.length).toEqual(3);

            expect(onChange.mock.calls[0][0]).toEqual({
                sortOption: "bggrating"
            });
            expect(onChange.mock.calls[1][0]).toEqual({
                sortOption: "new"
            });
            expect(onChange.mock.calls[2][0]).toEqual({
                sortOption: "alphabetic"
            });
        });




    });
});

