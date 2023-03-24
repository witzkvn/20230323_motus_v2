import React from "react";

const Button = ({ onClick, children, level = "primary" }) => {
  return (
    <button onClick={onClick} className={`btn btn-primary`}>
      {children}
    </button>
  );
};

export default Button;
