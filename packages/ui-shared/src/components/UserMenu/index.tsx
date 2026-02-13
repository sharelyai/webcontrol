import { BackgroundWrapper, Wrapper } from "./styles";
import { ArrowForward, LogOut, Person, Sms, Close, useResponsive } from "../../index";

interface IProps {
  isOpen: boolean;
  user: any;
  signOut: () => void;
  onClose: () => void;
  left?: number;
  bottom?: number;
}

export const UserMenu = (props: IProps) => {
  const { isOpen, user, left = 0, bottom = 70, signOut, onClose } = props;

  const { isMobile } = useResponsive();

  const wrapperProps = { $isOpen: isOpen, $left: left, $bottom: bottom };

  const handleOpenSpaces = () => {
    // This should be passed as a prop or from a config context
    console.warn("VITE_REDIRECT_URL is not available in this context.");
    // window.open(import.meta.env.VITE_REDIRECT_URL + `/spaces`, "_blank");
  };

  if (!user) return null;

  const userMenuContent = (
    <>
      {isMobile && (
        <div className="drag-bar-container">
          <div>
            <Close onClick={onClose} />
          </div>
        </div>
      )}
      <div className="user-menu-header">
        <div className="user-menu-header-picture">
          {user?.photo ? (
            <img src={user?.photo} alt={user?.name} className="user-photo" />
          ) : (
            <Person />
          )}
        </div>
        <div className="user-menu-header-texts">
          <p className="user-menu-header-title">{user?.name}</p>
          <p className="user-menu-header-description">{user?.email}</p>
        </div>
      </div>
      <div className="user-menu-body">
        <div className="option" onClick={handleOpenSpaces}>
          {!isMobile && (
            <div className="icon indigo">
              <Sms />
            </div>
          )}
          <div className="wrapper-text">
            {isMobile && (
              <div className="icon indigo">
                <Sms />
              </div>
            )}
            <p className="title">My spaces</p>
            <p className="sub-title">
              Engage with businesses through your private spaces
            </p>
          </div>
          <div className="arrow-icon">
            {isMobile && "Go to myspaces"}
            <ArrowForward />
          </div>
        </div>
      </div>
      <div className="user-menu-log-out" onClick={signOut}>
        <LogOut />
        <p className="user-menu-log-out-text">Log out</p>
      </div>
    </>
  );

  return (
    <>
      {isOpen && <BackgroundWrapper onClick={onClose} />}
      <Wrapper {...wrapperProps}>{userMenuContent}</Wrapper>
    </>
  );
};