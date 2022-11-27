import React from "react";
import styles from "./App.module.css";
import axios from "axios";
import List, { Stories, Story } from "./List";
import SearchForm from "./SearchForm";

const Clock = () => {
    const [date, setDate] = React.useState(new Date());
    React.useEffect(() => {
        const timerID = setInterval(() => setDate(new Date()), 1000);

        return function cleanup() {
            clearInterval(timerID);
        };
    }, [date]);

    return <div>It is {date.toLocaleTimeString("pt-BR")}</div>;
};

const useSemiPersistentState = (
    key: string,
    initialState: string
): [string, (newValue: string) => void] => {
    const isMounted = React.useRef(false);
    // state hook
    const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);

    // useEffect executes the function in the first argument when the value in the second argument changes
    React.useEffect(() => {
        // avoid running the side-effect function in the first render
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            localStorage.setItem(key, value);
        }
    }, [value]);

    return [value, setValue];
};

export type StoriesState = {
    data: Stories;
    isLoading: boolean;
    isError: boolean;
};

interface StoriesFetchInitAction {
    type: "STORIES_FETCH_INIT";
}

interface StoriesFetchSuccessAction {
    type: "STORIES_FETCH_SUCCESS";
    payload: Stories;
}

interface StoriesFetchFailureAction {
    type: "STORIES_FETCH_FAILURE";
}

interface StoriesRemoveAction {
    type: "REMOVE_STORY";
    payload: Story;
}

export type StoriesAction =
    | StoriesFetchInitAction
    | StoriesFetchSuccessAction
    | StoriesFetchFailureAction
    | StoriesRemoveAction;

export const storiesReducer = (state: StoriesState, action: StoriesAction) => {
    switch (action.type) {
        case "STORIES_FETCH_INIT":
            return { ...state, isLoading: true, isError: false };
        case "STORIES_FETCH_SUCCESS":
            return { ...state, isLoading: false, isError: false, data: action.payload };
        case "STORIES_FETCH_FAILURE":
            return { ...state, isLoading: false, isError: true };
        case "REMOVE_STORY":
            return {
                ...state,
                data: state.data.filter((story) => action.payload.objectID !== story.objectID),
            };
        default:
            throw new Error();
    }
};

const getSumComments = (stories: StoriesState) => {
    console.log("C");
    return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";
const App = () => {
    // const initialStories = [
    //     {
    //         title: "React",
    //         url: "https://reactjs.org",
    //         author: "Jordan Walke",
    //         num_comments: 3,
    //         points: 4,
    //         objectID: 0,
    //     },
    //     {
    //         title: "Redux",
    //         url: "https://redux.js.org",
    //         author: "Dan Abramov, Andrew Clark",
    //         num_comments: 2,
    //         points: 5,
    //         objectID: 1,
    //     },
    // ];

    // Simulate fetching data from an API
    // const getAsyncStories = () =>
    //     new Promise((resolve) =>
    //         setTimeout(() => {
    //             resolve({
    //                 data: {
    //                     stories: initialStories,
    //                 },
    //             });
    //         }, 2000)
    //     );
    // Simulate error when fetching the data
    // const getAsyncStories = () => new Promise((resolve, reject) => setTimeout(reject, 2000));

    const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
    const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

    // We moved from unreliable state transitions with multiple useState hooks to
    // predictable state transitions with React’s useReducer Hook. The state object
    // managed by the reducer encapsulates everything related to the stories,
    // including loading and error state, but also implementation details like
    // removing a story from the list of stories.
    // const [stories, setStories] = React.useState([]);
    // const [isLoading, setIsLoading] = React.useState(false);
    // const [isError, setIsError] = React.useState(false);
    const [stories, dispatchStories] = React.useReducer(storiesReducer, {
        data: [],
        isLoading: false,
        isError: false,
    });

    const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);

        // Prevents the HTML form’s native behavior, which leads to a browser reload.
        event.preventDefault();
    };

    const handleFetchStories = React.useCallback(() => {
        // if (!searchTerm) return;

        // setIsLoading(true);
        dispatchStories({ type: "STORIES_FETCH_INIT" });
        // getAsyncStories()
        // Use third-party library to fetch the data
        // fetch(url)
        axios
            .get(url)
            // dont need to get the json with axios
            // .then((response) => response.json())
            .then((result) => {
                // setStories(newStories);
                dispatchStories({
                    type: "STORIES_FETCH_SUCCESS",
                    payload: /* result.data.stories */ result.data.hits,
                });
                // setIsLoading(false);
            })
            .catch(() => /*setIsError(true)*/ dispatchStories({ type: "STORIES_FETCH_FAILURE" }));
    }, [url]);

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    const handleRemoveStory = React.useCallback((item: Story) => {
        // Move the removal logic to the reducer function!
        // const newStories = stories.filter((story) => item.objectID !== story.objectID);
        // setStories(newStories);

        dispatchStories({ type: "REMOVE_STORY", payload: item });
    }, []);

    // const handleSearch = (event) => setSearchTerm(event.target.value);

    // const searchedStories = stories.data.filter((story) =>
    //     story.title.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    // only run the function if one of its dependencies has changed. If no dependency changed,
    // the result of the function stays the same. NOTE: USE FOR HEAVY COMPUTATIONS
    const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

    console.log("B:App");
    return (
        // <div className="container">
        <div className={styles.container}>
            <h1 className={styles.headlinePrimary}>
                NEEEEWWSSSS!!!! Total Comments {sumComments} <Clock />
            </h1>
            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            {stories.isError && <p>Somethin went wrong...</p>}
            {stories.isLoading ? (
                <p>Loading ...</p>
            ) : (
                <List list={stories.data} onRemoveItem={handleRemoveStory} />
            )}
        </div>
    );
};

export default App;
