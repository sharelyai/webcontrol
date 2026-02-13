import { Wrapper } from "./styles";
import { Close } from "@sharely/ui-shared";
import { AuthForm } from "./components/authForm";
import { constants, useGlobalStore } from "@sharely/services";

export interface AuthModalProps {
  onClose: () => void;
  handleInitWithToken: (token: string) => void;
}

export const AuthModal = (props: AuthModalProps) => {
  const { onClose, handleInitWithToken } = props;
  const { workspace } = useGlobalStore();

  const showCloseButton =
    workspace?.verificationSpace?.authAction !==
    constants.AUTH_ACTION_AT_THE_BEGINNING;

  const handleClose = () => {
    if (!showCloseButton) return;
    onClose();
  };

  return (
    <Wrapper>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-title">
            <div className="logo">
              {workspace?.photo && <img src={workspace.photo} alt="Logo" />}
            </div>
            <span className="title">{workspace?.name}</span>
          </div>
          <button className="modal-header-icon" onClick={handleClose}>
            {showCloseButton && <Close />}
          </button>
        </div>
        <div className="modal-body">
          <AuthForm
            onClose={onClose}
            handleInitWithToken={handleInitWithToken}
          />
        </div>
      </div>
    </Wrapper>
  );
};