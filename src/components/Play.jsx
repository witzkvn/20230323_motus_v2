import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { userGuessState } from "../atoms/userGuesses/userGuessState";
import { onlyGoodLetterGuessedState } from "../atoms/userGuesses/onlyGoodLetterGuessedState";
import { wordToGuessLetterCountState } from "../atoms/word/wordToGuessLetterCountState";
import { wordToGuessState } from "../atoms/word/wordToGuessState";
import checkWin from "../utils/checkWin";
import status from "../utils/status";
import { isWinState } from "../atoms/game/isWinState";
import { isTeamATurnState } from "../atoms/game/isTeamATurnState";
import { teamADataState, teamBDataState } from "../atoms/teams/teamsDataState";
import { roundState } from "../atoms/game/roundState";
import Rules from "./Rules";
import Letter from "./Letter";
import Button from "./Button";
import getRandomWord from "../utils/getRandomWord";

const Play = ({ resetGame }) => {
    const [wordToGuess, setWordToGuess] = useRecoilState(wordToGuessState);
    const [wordToGuessLetterCount, setWordToGuessLetterCount] = useRecoilState(
        wordToGuessLetterCountState
    );
    const [userGuess, setUserGuess] = useRecoilState(userGuessState);
    const [isWin, setIsWin] = useRecoilState(isWinState);
    const [teamAData, setTeamAData] = useRecoilState(teamADataState);
    const [teamBData, setTeamBData] = useRecoilState(teamBDataState);
    const [round, setRound] = useRecoilState(roundState);
    const [isTeamATurn, setIsTeamATurn] = useRecoilState(isTeamATurnState);
    const [onlyGoodLetterGuessed, setOnlyGoodLetterGuessed] = useRecoilState(
        onlyGoodLetterGuessedState
    );

    const [guessValue, setGuessValue] = useState("");
    const [rulesTabOpen, setRulesTabOpen] = useState(false);
    const [confirmEndGameOpen, setConfirmEndGameOpen] = useState(false);
    const [tryNumber, setTryNumber] = useState(1);

    const generateNewWordToGuess = useCallback(async () => {
        const randomWord = await getRandomWord();
        console.log(
            "🚀 ~ file: Home.js:19 ~ setupGame ~ randomWord",
            randomWord
        );

        const wordInArray = randomWord.trim().toUpperCase().split("");
        setWordToGuess(wordInArray);

        // set first letter in good guess
        const goodLettersArray = wordInArray.map(() => {
            return {
                letter: ".",
                status: status.wrong,
            };
        });

        goodLettersArray[0] = {
            letter: wordInArray[0],
            status: status.good,
        };

        setOnlyGoodLetterGuessed(goodLettersArray);

        // count each letter in the word (ex: 2 'e', 1 'd' etc..)
        const count = {};
        for (const letter of wordInArray) {
            if (count[letter]) {
                count[letter] += 1;
            } else {
                count[letter] = 1;
            }
        }

        // deduct the first letter that is given to the remaining count of letters to guess
        count[wordInArray[0]] -= 1;
        setWordToGuessLetterCount(count);

        // set current user guess line to dots for every letter to guess
        const userGuessArray = wordInArray.map(() => {
            return {
                letter: ".",
                status: status.wrong,
            };
        });

        // and give first letter of the word
        userGuessArray[0] = {
            letter: wordInArray[0],
            status: status.wrong,
        };

        setUserGuess([userGuessArray]);

        // set number of try to the first try
        setTryNumber(1);
    }, [
        setOnlyGoodLetterGuessed,
        setUserGuess,
        setWordToGuess,
        setWordToGuessLetterCount,
    ]);

    useEffect(() => {
        async function getNewWord() {
            if (wordToGuess.length === 0) {
                await generateNewWordToGuess();
            }
        }
        getNewWord();
    }, [generateNewWordToGuess, wordToGuess.length]);

    const playRound = (e) => {
        e.preventDefault();

        const result = wordToGuess.map((el) => {
            return undefined;
        });
        const guessArray = guessValue.trim().toUpperCase().split("");

        // set a new count letter state with good, misplaced and wrong letter
        const count = {};

        // do good first
        for (let i = 0; i < wordToGuess.length; i++) {
            if (guessArray[i] === wordToGuess[i]) {
                const letterObj = {
                    letter: guessArray[i],
                    status: status.good,
                };

                if (count[letterObj.letter]) {
                    count[letterObj.letter] += 1;
                } else {
                    count[letterObj.letter] = 1;
                }

                result[i] = letterObj;
            }
        }

        // do misplaced letter then
        for (let i = 0; i < wordToGuess.length; i++) {
            if (result[i] !== undefined) continue;

            let newStatus = status.wrong;

            const isLetterCountFull =
                count[guessArray[i]] >= wordToGuessLetterCount[guessArray[i]];

            if (wordToGuess.includes(guessArray[i]) && !isLetterCountFull) {
                newStatus = status.misplaced;
            }

            const letterObj = {
                letter: guessArray[i],
                status: newStatus,
            };

            if (count[letterObj.letter]) {
                count[letterObj.letter] += 1;
            } else {
                count[letterObj.letter] = 1;
            }

            result[i] = letterObj;
        }

        // add this new letter count state as a user guess in the list
        const newArray = [...userGuess, result];
        setUserGuess(newArray);
        setGuessValue("");

        // show only good placed for next try
        const onlyGoodArray = result.map((letter, index) => {
            if (letter.status !== status.good) {
                if (onlyGoodLetterGuessed[index].status === status.good) {
                    return onlyGoodLetterGuessed[index];
                } else {
                    return {
                        letter: ".",
                        status: status.wrong,
                    };
                }
            } else {
                return letter;
            }
        });

        setOnlyGoodLetterGuessed(onlyGoodArray);

        // verify if the user won
        const isWin = checkWin(result);

        if (isWin) {
            setIsWin(true);
            if (isTeamATurn) {
                setTeamAData((prev) => {
                    return { ...prev, score: prev.score + 1 };
                });
            } else {
                setTeamBData((prev) => {
                    return { ...prev, score: prev.score + 1 };
                });
            }
            return;
        }

        setRound((prev) => prev + 1);

        // if the current team failed 8 consecutives rounds, it's the othe team turn to try for 8 rounds
        if (round === 7) {
            // if it's 3rd try (meaning team A and team B tried), reset game for new word
            // try state set at the end, we verify if value is actually 2
            if (tryNumber === 2) {
                resetGame(false);
            } else {
                setIsTeamATurn((prev) => !prev);
                setRound(0);

                // delete all previous user guesses and keep actual good letters guessed
                setUserGuess([[...onlyGoodLetterGuessed]]);
            }

            setTryNumber((prev) => prev + 1);
        }
    };

    const handleEndGame = () => {
        resetGame(true);
    };

    return (
        <div className="w-full bg-gradient-to-b from-orange-200 to-orange-400">
            <div className="mx-auto px-4 md:w-[38rem]">
                <div className="App min-h-screen flex items-center flex-col text-center py-6 px-2">
                    <h1 className="text-4xl mb-4 font-bold">
                        Devinez le mot !
                    </h1>
                    <div
                        onClick={() => setRulesTabOpen((prev) => !prev)}
                        className="cursor-pointer mb-4"
                    >
                        {rulesTabOpen
                            ? "Cacher les règles ❌"
                            : "Voir les règles 💡"}
                    </div>
                    {rulesTabOpen && <Rules />}

                    {confirmEndGameOpen ? (
                        <div className="mb-6 bg-white p-4 rounded-md">
                            <p>Etes-vous sûr de vouloir terminer la partie ?</p>
                            <p>
                                Les équipes vont êtres supprimées et les scores
                                remis à 0.
                            </p>
                            <div className="mt-4 flex gap-3 justify-center">
                                <Button
                                    onClick={() => setConfirmEndGameOpen(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    level={"primary"}
                                    onClick={handleEndGame}
                                >
                                    Confirmer
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p
                            className="cursor-pointer mb-4"
                            onClick={() =>
                                setConfirmEndGameOpen((prev) => !prev)
                            }
                        >
                            Terminer la partie
                        </p>
                    )}
                    <div className="grid grid-cols-2 w-full bg-gray-300 text-gray-500 rounded-md mb-6">
                        <div
                            className={`rounded-md p-4 ${
                                isTeamATurn &&
                                "border-4 border-blue-500 bg-blue-400 text-white"
                            }`}
                        >
                            <div className="font-bold whitespace-nowrap">
                                Score équipe {teamAData.name}
                            </div>
                            <div className="text-xl">{teamAData.score}</div>
                            {isTeamATurn && (
                                <p className="font-bold mt-2">A ton tour !</p>
                            )}
                        </div>
                        <div
                            className={`rounded-md p-4 ${
                                !isTeamATurn &&
                                "border-4 border-blue-500 bg-blue-400 text-white"
                            }`}
                        >
                            <div className="font-bold whitespace-nowrap mt-auto">
                                Score équipe {teamBData.name}
                            </div>
                            <div className="text-xl">{teamBData.score}</div>
                            {!isTeamATurn && (
                                <p className="font-bold mt-2">A ton tour !</p>
                            )}
                        </div>
                    </div>
                    <div className="mb-2 font-bold bg-gray-300 w-full p-2 rounded-md">
                        Tour {round + 1}/8
                    </div>
                    <div className="mb-6">
                        {userGuess ? (
                            userGuess.map((guess, index) => {
                                if (round > 0 && index === 0) {
                                    return null;
                                } else {
                                    return (
                                        <div
                                            key={`guess-${index}`}
                                            className="flex mb-1"
                                        >
                                            {guess.map((letter, index) => (
                                                <Letter
                                                    key={`letter-${round}-${index}`}
                                                    letter={letter}
                                                />
                                            ))}
                                        </div>
                                    );
                                }
                            })
                        ) : (
                            <p className="my-2 text-center">Chargement...</p>
                        )}
                        {round !== 0 && onlyGoodLetterGuessed && (
                            <div className="flex mb-1">
                                {onlyGoodLetterGuessed.map((letter, index) => (
                                    <Letter
                                        key={`letter-${round}-${index}`}
                                        letter={letter}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {isWin ? (
                        <div>
                            <h2 className="text-2xl mb-4 font-bold">
                                🎉 Vous avez trouvé le mot ! 🎉
                            </h2>
                            <p className="mb-6">
                                Il s'agissait bien de{" "}
                                <span className="font-bold text-2xl">
                                    {wordToGuess.join("")}
                                </span>
                                , trouvé en{" "}
                                <span className="font-bold text-green-700">
                                    {round + 1} tour
                                    {round > 1 ? "s" : ""}
                                </span>
                                .
                            </p>
                            <Button onClick={() => resetGame(false)}>
                                Tour Suivant
                            </Button>
                        </div>
                    ) : (
                        <form
                            onSubmit={playRound}
                            className="flex flex-col w-full mx-auto"
                        >
                            <input
                                className="uppercase p-2 rounded-sm mb-2 block text-black"
                                type="text"
                                onChange={(e) => setGuessValue(e.target.value)}
                                value={guessValue}
                                minLength={wordToGuess.length}
                                maxLength={wordToGuess.length}
                                required
                            />
                            <Button>Proposer ce mot</Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Play;
