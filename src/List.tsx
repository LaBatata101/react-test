import React from "react";
import styles from "./App.module.css";
import { ReactComponent as Check } from "./check.svg";

export type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
};

export type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => {
    const handleRemoveItem = () => {
        onRemoveItem(item);
    };
    return (
        // <div className="item">
        <div className={styles.item}>
            <span style={{ width: "40%" }}>
                <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: "30%" }}>{item.author}</span>
            <span style={{ width: "10%" }}>{item.num_comments}</span>
            <span style={{ width: "10%" }}>{item.points}</span>
            <span style={{ width: "10%" }}>
                <button
                    type="button"
                    onClick={handleRemoveItem}
                    className={`${styles.button} ${styles.buttonSmall}`}
                >
                    <Check height="18px" width="18px" />
                </button>
            </span>
        </div>
    );
};

export type Stories = Array<Story>;

type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
};

// React.memo avoids a re-render if the props doesn't change. NOTE: USE FOR HEAVY COMPUTATIONS
const List = React.memo(({ list, onRemoveItem }: ListProps) => {
    console.log("B:List");
    return (
        <>
            {list.map((item) => (
                <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
            ))}
        </>
    );
});

export default List;
