import React from "react";
import { render, screen } from "@testing-library/react";
import App, { StoriesAction, storiesReducer, StoriesState } from "./App";
import axios from "axios";
import { Stories, Story } from "./List";

const storyOne = {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: "0",
};

const storyTwo: Story = {
    title: "Redux",
    url: "https://redux.js.org/",
    author: "Dan Abramov, Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: "1",
};

const stories: Stories = [storyOne, storyTwo];

describe("storiesReducer", () => {
    test("removes a story from all stories", () => {
        const action: StoriesAction = { type: "REMOVE_STORY", payload: storyOne };
        const state: StoriesState = { data: stories, isLoading: false, isError: false };

        const newState = storiesReducer(state, action);

        const expectedState = {
            data: [storyTwo],
            isLoading: false,
            isError: false,
        };

        expect(newState).toStrictEqual(expectedState);
    });
});
