import { useRecoilState } from "recoil";
import { teamADataState, teamBDataState } from "../atoms/teams/teamsDataState";
import Button from "./Button";

const Home = ({ setIsReady }) => {
    const [teamAData, setTeamAData] = useRecoilState(teamADataState);
    const [teamBData, setTeamBData] = useRecoilState(teamBDataState);

    const setupGame = async (e) => {
        e.preventDefault();
        setIsReady(true);
    };

    return (
        <div className=" bg-gradient-to-b from-cyan-600 to-blue-600">
            <div className="max-w-sm h-screen mx-auto text-white flex items-center flex-col text-center py-6 px-2">
                <h1 className="mb-6 text-2xl font-bold uppercase md:text-3xl">
                    Jouez à{" "}
                    <span className="font-bold text-orange-400">Motus</span> !
                </h1>
                <p className="font-bold">
                    Veuillez choisir un nom pour chaque équipe puis cliquez sur{" "}
                    <span className="text-orange-300">"Lancer le jeu"</span>.
                </p>
                <p className="font-bold">
                    Un mot aléatoire à deviner compris entre 4 et 9 lettres*
                    sera choisi aléatoirement !
                </p>
                <p className="mb-6 text-sm">
                    * Aucun accent ne sera pris en compte
                </p>
                <form onSubmit={setupGame}>
                    <div className="flex flex-col mb-6">
                        <label className="block mb-1" htmlFor="teamA">
                            Entrez un nom pour la première équipe :
                        </label>
                        <input
                            className="py-1 px-2 rounded-sm mb-2 text-black md:mb-0 md:mr-2"
                            type="text"
                            id="teamA"
                            placeholder="Equipe A"
                            onChange={(e) =>
                                setTeamAData({ name: e.target.value, score: 0 })
                            }
                            value={teamAData.name}
                            required
                        />
                    </div>
                    <div className="flex flex-col mb-6">
                        <label className="block mb-1" htmlFor="teamB">
                            Entrez un nom pour la deuxième équipe :
                        </label>
                        <input
                            className="py-1 px-2 rounded-sm mb-2 text-black md:mb-0 md:mr-2"
                            type="text"
                            id="teamB"
                            placeholder="Equipe B"
                            onChange={(e) =>
                                setTeamBData({ name: e.target.value, score: 0 })
                            }
                            value={teamBData.name}
                            required
                        />
                    </div>
                    <Button>Lancer le jeu</Button>
                </form>
            </div>
        </div>
    );
};

export default Home;
