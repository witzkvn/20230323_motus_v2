import React from "react";

const Modal = ({
  modalId,
  title,
  text,
  btnSecondaryText,
  btnSecondaryAction,
  btnPrimaryText,
  btnPrimaryAction,
  isOpen,
  children,
}) => {
  return (
    <>
      <input
        type="checkbox"
        id={modalId}
        className="modal-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          {text && <p className="py-4">{text}</p>}
          {children}
          <div className="modal-action">
            {btnSecondaryText && btnSecondaryAction && (
              <label
                htmlFor={modalId}
                className="btn btn-secondary"
                onClick={btnSecondaryAction}
              >
                {btnSecondaryText}
              </label>
            )}
            {btnPrimaryText && btnPrimaryAction && (
              <label
                htmlFor={modalId}
                className="btn btn-primary"
                onClick={btnPrimaryAction}
              >
                {btnPrimaryText}
              </label>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
