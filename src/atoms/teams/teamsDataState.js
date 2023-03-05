import { atom } from "recoil";

export const teamADataState = atom({
    key: "teamADataState",
    default: {
        name: "",
        score: 0,
    },
});

export const teamBDataState = atom({
    key: "teamBDataState",
    default: {
        name: "",
        score: 0,
    },
});
