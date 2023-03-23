import React from "react";

const Button = ({ onClick, children, level }) => {
    return (
        <button
            onClick={onClick}
            className={` font-semibold py-2 px-4 border border-gray-400 rounded shadow transition-all ${
                level === "primary"
                    ? "bg-orange-500 hover:bg-orange-400 text-white"
                    : "bg-white hover:bg-gray-100 text-gray-800"
            }`}
        >
            {children}
        </button>
    );
};

export default Button;
