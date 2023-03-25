import React, { useCallback, useEffect, useRef, useState } from "react";
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
import Letter from "./Letter";
import getRandomWord from "../utils/getRandomWord";
import Modal from "./Modal";
import PlayTeamWrapper from "./PlayTeamWrapper";

const endgameModalId = "engame-modal";
const rulesModalId = "rules-modal";
const winModalId = "win-modal";
const lostModalId = "lost-modal";
const changeTurnModalId = "change-turn-modal";

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
  const [isEndGame, setIsEndGame] = useState(false);
  const [isChangingTeam, setIsChangingTeam] = useState(false);

  const wordInput = useRef();

  const generateNewWordToGuess = useCallback(async () => {
    const randomWord = await getRandomWord();
    console.log("🚀 ~ file: Home.js:19 ~ setupGame ~ randomWord", randomWord);

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
    setIsEndGame(false);
  }, [
    setOnlyGoodLetterGuessed,
    setUserGuess,
    setWordToGuess,
    setWordToGuessLetterCount,
  ]);

  // if reset of game, call function to generate new word to guess
  useEffect(() => {
    async function getNewWord() {
      if (wordToGuess.length === 0) {
        await generateNewWordToGuess();
      }
    }
    getNewWord();
  }, [generateNewWordToGuess, wordToGuess.length]);

  // check user word proposition and process good / misplaced / wrong letters
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
        setIsEndGame(true); // show the word to guess and button to reset game
      } else {
        setIsTeamATurn((prev) => !prev);
        setIsChangingTeam(true);
        setRound(0);
      }

      // delete all previous user guesses and keep actual good letters guessed
      setUserGuess([[...onlyGoodLetterGuessed]]);

      setTryNumber((prev) => prev + 1);
    }

    // set word input in focus for better user experience
    wordInput.current.focus();
  };

  const handleEndGame = () => {
    resetGame(true);
    setConfirmEndGameOpen(false);
  };

  return (
    <>
      <Modal
        title={"Les règles"}
        btnPrimaryText={"OK"}
        btnPrimaryAction={() => setRulesTabOpen(false)}
        modalId={rulesModalId}
      >
        <p className="mb-2">
          Vous devez trouver un mot aléatoire en 8 tours maximum ! Bonne chance
          😉
        </p>
        <p className="font-bold text-2xl mb-2">Légende :</p>
        <div className="flex items-center mb-1">
          <Letter
            customSizesClasses={"h-4 w-4"}
            letter={{ letter: "", status: status.good }}
          />
          <p>Lettre bien placée</p>
        </div>
        <div className="flex items-center mb-1">
          <Letter
            customSizesClasses={"h-4 w-4"}
            letter={{ letter: "", status: status.misplaced }}
          />
          <p>Lettre présente mais mal placée</p>
        </div>
        <div className="flex items-center">
          <Letter
            customSizesClasses={"h-4 w-4"}
            letter={{ letter: "", status: status.wrong }}
          />
          <p>Mauvaise lettre</p>
        </div>
      </Modal>

      <Modal
        title={"Etes-vous sûr de vouloir terminer la partie ?"}
        text="Les équipes vont êtres supprimées et les scores remis à 0."
        btnSecondaryText="Annuler"
        btnSecondaryAction={() => setConfirmEndGameOpen(false)}
        btnPrimaryText={"Confirmer"}
        btnPrimaryAction={handleEndGame}
        modalId={endgameModalId}
      />

      <Modal
        title={"A l'autre équipe de jouer !"}
        text="Vous n'avez pas trouvé le mot en 8 tours. La main passe à l'autre équipe."
        btnPrimaryText={"OK"}
        btnPrimaryAction={() => setIsChangingTeam(false)}
        modalId={changeTurnModalId}
        isOpen={isChangingTeam}
      />

      <Modal
        title={"🎉 Vous avez trouvé le mot ! 🎉"}
        btnPrimaryText={"Tour Suivant"}
        btnPrimaryAction={() => resetGame(false)}
        modalId={winModalId}
        isOpen={isWin}
      >
        <p>
          Il s'agissait bien de{" "}
          <span className="font-bold text-2xl">{wordToGuess.join("")}</span>,
          trouvé en{" "}
          <span className="font-bold text-green-700">
            {round + 1} tour
            {round > 1 ? "s" : ""}
          </span>
          .
        </p>
      </Modal>

      <Modal
        title={"C'est perdu..."}
        btnPrimaryText={"Mot suivant"}
        btnPrimaryAction={() => resetGame(false)}
        modalId={lostModalId}
        isOpen={isEndGame}
      >
        <p>
          Le mot à trouver était{" "}
          <span className="text-bold">{wordToGuess}</span>
        </p>
      </Modal>

      <div className="w-full bg-image text-black">
        <div className="mx-auto px-4 md:w-[38rem]">
          <div className="App min-h-screen flex items-center flex-col text-center py-6 px-2">
            <h1 className="text-4xl mb-4 font-bold font-pacifico ">Momotus</h1>

            <div className="mx-auto grid grid-cols-2 justify-end gap-3 p-3 mb-4 rounded-md">
              <label
                htmlFor={rulesModalId}
                className="btn btn-xs btn-outline"
                onClick={() => setRulesTabOpen(true)}
              >
                Voir les règles
              </label>

              <label
                htmlFor={endgameModalId}
                className="btn btn-xs btn-outline"
                onClick={() => setConfirmEndGameOpen(true)}
              >
                Terminer la partie
              </label>
            </div>
            <div className="grid grid-cols-2 w-full rounded-md">
              <PlayTeamWrapper team={teamAData} isTeamA={isTeamATurn} />
              <PlayTeamWrapper team={teamBData} isTeamA={!isTeamATurn} />
            </div>

            <div className="card w-full items-center bg-base-100 my-8">
              <div className="card-body">
                {userGuess ? (
                  userGuess.map((guess, index) => {
                    if (round > 0 && index === 0) {
                      return null;
                    } else {
                      return (
                        <div key={`guess-${index}`} className="flex mb-1">
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
            </div>

            <form onSubmit={playRound} className="flex flex-col w-full mx-auto">
              <div className="font-bold bg-base-300 w-full p-2 flex justify-between rounded-md">
                <p>Tour {round + 1}/8</p>
                <p>Mot en {wordToGuess.length} lettres</p>
              </div>

              <input
                className="uppercase input mb-3"
                ref={wordInput}
                type="text"
                onChange={(e) => setGuessValue(e.target.value)}
                value={guessValue}
                minLength={wordToGuess.length}
                maxLength={wordToGuess.length}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
              />
              <button className="btn btn-secondary">Proposer ce mot</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Play;
