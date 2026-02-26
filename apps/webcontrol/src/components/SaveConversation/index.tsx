import { useLanguage, customEvents, constants } from '@sharely/services';
import { useResponsive } from '@sharely/ui-shared';
import { Wrapper } from './styles';

interface SaveConversationProps {
  handleIsModalOpen: (value: boolean) => void;
}

export const SaveConversation = ({ handleIsModalOpen }: SaveConversationProps) => {
  const { t } = useLanguage();
  const { isDesktop } = useResponsive();

  const handleOpenModal = () => {
    handleIsModalOpen(true);
    setTimeout(() => {
      customEvents.publish(
        constants.CUSTOM_EVENTS.TOGGLE_SAVE_CONVERSATION_VIEW,
        { view: 1 }
      );
    }, 0);
  };

  const handleOpenLoginModal = () => {
    handleIsModalOpen(true);
    setTimeout(() => {
      customEvents.publish(
        constants.CUSTOM_EVENTS.TOGGLE_SAVE_CONVERSATION_VIEW,
        { view: 0 }
      );
    }, 0);
  };

  return (
    <Wrapper>
      <div className="left">
        {!isDesktop && (
          <p className="sharelyai-webcontroller-content-save-conversation-text">
            {t('IndexSaveConversationText')}
          </p>
        )}
      </div>
      {isDesktop && (
        <div
          className="sharelyai-webcontroller-content-save-conversation"
          onClick={handleOpenModal}
        >
          <p className="sharelyai-webcontroller-content-save-conversation-text">
            {t('IndexSaveConversationText')}
          </p>
          <p className="sharelyai-webcontroller-content-save-conversation-text sharelyai-webcontroller-save">
            {t('IndexSaveConversationSubText')}
          </p>
        </div>
      )}
      <div className="right">
        {!isDesktop && (
          <p
            className="sharelyai-webcontroller-content-save-conversation-text sharelyai-webcontroller-save"
            onClick={handleOpenModal}
          >
            {t('IndexSaveConversationSubText')}
          </p>
        )}
        <p
          className="sharelyai-webcontroller-content-save-conversation-text sharelyai-webcontroller-save"
          onClick={handleOpenLoginModal}
        >
          {t('IndexSaveConversationRighText')}
        </p>
      </div>
    </Wrapper>
  );
};
