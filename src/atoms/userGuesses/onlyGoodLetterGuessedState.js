import { atom } from "recoil";

export const onlyGoodLetterGuessedState = atom({
    key: "onlyGoodLetterGuessedState",
    default: {
        name: "",
        score: 0,
    },
});
