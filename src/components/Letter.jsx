import React from "react";
import status from "../utils/status";

const Letter = ({ letter, customSizesClasses }) => {
  return (
    <div className="text-base md:text-3xl w-max bg-gradient-to-b from-cyan-600 to-blue-600 text-white mr-1 last:mx-0">
      <div
        className={` flex justify-center items-center ${
          letter.status === status.good
            ? "bg-gradient-to-b from-green-800 to-green-600"
            : letter.status === status.misplaced
            ? "bg-gradient-to-b from-orange-400 to-orange-500 rounded-full"
            : ""
        } ${
          customSizesClasses
            ? customSizesClasses
            : "w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14"
        }`}
      >
        {letter.letter}
      </div>
    </div>
  );
};

export default Letter;
