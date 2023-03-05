import status from "./status";

const checkWin = (array) => {
    return array.every((el) => el.status === status.good);
};

export default checkWin;
