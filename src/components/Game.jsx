import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { isTeamATurnState } from "../atoms/game/isTeamATurnState";
import { isWinState } from "../atoms/game/isWinState";
import { roundState } from "../atoms/game/roundState";
import { teamADataState, teamBDataState } from "../atoms/teams/teamsDataState";
import { userGuessState } from "../atoms/userGuesses/userGuessState";
import { wordToGuessLetterCountState } from "../atoms/word/wordToGuessLetterCountState";
import { wordToGuessState } from "../atoms/word/wordToGuessState";
import Home from "./Home";
import Play from "./Play";

const Game = () => {
    const [wordToGuess, setWordToGuess] = useRecoilState(wordToGuessState);
    const [wordToGuessLetterCount, setWordToGuessLetterCount] = useRecoilState(
        wordToGuessLetterCountState
    );
    const [userGuess, setUserGuess] = useRecoilState(userGuessState);
    const [isWin, setIsWin] = useRecoilState(isWinState);
    const [round, setRound] = useRecoilState(roundState);
    const [teamAData, setTeamAData] = useRecoilState(teamADataState);
    const [teamBData, setTeamBData] = useRecoilState(teamBDataState);
    const [isTeamATurn, setIsTeamATurn] = useRecoilState(isTeamATurnState);

    const [isReady, setIsReady] = useState(false);

    const resetGame = (resetAlsoTeams) => {
        if (resetAlsoTeams) {
            setTeamBData({
                name: "",
                score: 0,
            });
            setTeamAData({
                name: "",
                score: 0,
            });
            setIsReady(false);
        }

        setWordToGuess([]);
        setWordToGuessLetterCount({});
        setUserGuess([]);
        setRound(0);
        setIsWin(false);
        setIsTeamATurn((prev) => !prev);
    };

    if (!isReady) {
        return <Home setIsReady={setIsReady} />;
    }

    return <Play resetGame={resetGame} />;
};

export default Game;
