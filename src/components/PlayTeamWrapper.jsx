import React from "react";

const PlayTeamWrapper = ({ team, isTeamA }) => {
  return (
    <div
      className={`flex gap-4 rounded-md items-center justify-center p-1 ${
        isTeamA ? "bg-green-500 text-white" : "bg-base-300"
      }`}
    >
      <div className="flex items-center pr-4 border-r-2 border-r-gray-600">
        {isTeamA && <p className="mr-3">➡️</p>}
        <div className="font-bold whitespace-nowrap mt-auto">
          Score {team.name}
        </div>
      </div>
      <div className="text-3xl">{team.score}</div>
    </div>
  );
};

export default PlayTeamWrapper;
