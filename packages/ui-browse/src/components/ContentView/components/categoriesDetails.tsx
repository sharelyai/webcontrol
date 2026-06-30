import styled, { css } from "styled-components";
import { SearchResultCard as ListSearchItem } from "@sharelyai/ui-search";
import {
  ScrollBar,
  ArrowBackIos,
  ArrowForward,
  ChatNotStarted,
  Loader,
  EmptyState,
  useResponsive,
} from "@sharelyai/ui-shared";
import {
  useGlobalStore,
  useLanguage,
  useKnowledgeCategories,
  useKnowledgeResources,
  constants,
  useSharelyContext,
} from "@sharelyai/services";
import { useBrowseStorage } from "../../../stores/browseStore";

const Wrapper: any = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    & > .header {
      display: flex;
      padding: 8px 120px;

      @media (max-width: ${theme.screens.md}) {
        padding: 8px 12px 8px 16px;
      }

      & > .breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;

        button {
          background: none;
          border: none;
          display: flex;
          height: 31px;
          padding: 8px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          border-radius: 8px;
          background: ${theme.colors.royalBlue}26;
          color: ${theme.colors.indigo};
          font-size: ${theme.fonts.sm};
          font-weight: 600;
          cursor: pointer;

          &.current {
            background: transparent;
            color: ${theme.colors.ebony};
            font-size: ${theme.fonts.xl};
            padding: 0;
          }
        }

        .arrow {
          display: flex;
          align-items: center;
          svg {
            width: 16px;
            height: 16px;
            fill: ${theme.colors.fiord};
          }
        }
      }
    }

    & > .results {
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
      overflow: hidden;

      & > .resume {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.sm};
        font-weight: 600;
        padding: 16px 120px;
        display: flex;
        align-items: center;
        gap: 8px;

        @media (max-width: ${theme.screens.md}) {
          padding: 8px 12px 8px 16px;
        }
      }

      & > .list {
        flex: 1;
        padding: 0 100px;
        @media (max-width: ${theme.screens.md}) {
          padding: 0;
        }
      }
    }

    & > .subcategories {
      display: grid;
      grid-template-columns: repeat(3, minmax(177px, 245px));
      padding: 8px 120px;
      gap: 16px;

      @media (max-width: ${theme.screens.md}) {
        padding: 8px 12px 8px 16px;
        grid-template-columns: repeat(2, 1fr);
      }

      & > button {
        background: ${theme.colors.white};
        padding: 16px;
        height: 71px;
        border-radius: 12px;
        border: 1px solid ${theme.colors.athensGray6};
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;

        & > .title {
          text-align: left;
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.base};
          font-weight: 600;
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      }
    }
  `}
`;

export const CategoriesDetails = () => {
  const {
    breadcrumb,
    treeCategoriesLevelData,
    setTreeCategoriesLevelData,
    setBreadcrumb,
  } = useBrowseStorage();

  const { treeCategories, isLoading: isLoadingCategories } =
    useKnowledgeCategories({
      categoryId: treeCategoriesLevelData?.id,
    });

  const { knowledgeResources, isLoading: isLoadingResources } =
    useKnowledgeResources({
      categoryIds: [
        ...((treeCategories as any[])?.map((cat) => cat?.id) || []),
        treeCategoriesLevelData?.id,
      ].filter(Boolean),
      enabled: !isLoadingCategories,
    });

  const { isMobile } = useResponsive();
  const { workspace, currentInformation } = useGlobalStore();
  const { t } = useLanguage();
  const { apiClient } = useSharelyContext();

  const isLoading = isLoadingCategories || isLoadingResources;
  const hasKnowledge =
    knowledgeResources && knowledgeResources.length > 0 && !isLoading;
  const customParentConfig =
    workspace?.spaceStyling?.customConfig?.views?.browse;
  const customConfig = customParentConfig?.results;

  const setTreeCategoriesLevel = (category: any) => {
    setTreeCategoriesLevelData(category);
    apiClient.spaces.sendEvent(
      currentInformation.spaceId,
      constants.SPACE_EVENTS.SPACE_EVENT_CLICKED_CATEGORY_IN_BROWSE,
      {
        categoryId: category?.id,
        categoryName: category?.name,
        categoryNavigationCount: category?.categoryNavigationCount,
      },
    );
  };

  return (
    <Wrapper>
      <div className="header">
        <div className="breadcrumb">
          <button
            onClick={() => {
              setTreeCategoriesLevel(null);
              setBreadcrumb([]);
            }}
          >
            {isMobile ? <ArrowBackIos /> : t("BrowseTabText")}
          </button>
          {!isMobile && (
            <span className="arrow">
              <ArrowForward />
            </span>
          )}
          {!isMobile &&
            breadcrumb.map((item: any) => {
              const isCurrent = item?.id === treeCategoriesLevelData?.id;
              return (
                <div
                  key={item?.id}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <button
                    onClick={() => {
                      setTreeCategoriesLevel(item);
                      setBreadcrumb([
                        ...breadcrumb.slice(0, breadcrumb.indexOf(item) + 1),
                      ]);
                    }}
                    className={isCurrent ? "current" : ""}
                  >
                    {item.name}
                  </button>
                  {!isCurrent && (
                    <span className="arrow">
                      <ArrowForward />
                    </span>
                  )}
                </div>
              );
            })}
          {isMobile && breadcrumb.length > 0 && (
            <button
              onClick={() => {
                const prev = breadcrumb[breadcrumb.length - 2];
                setTreeCategoriesLevel(prev || null);
                setBreadcrumb(breadcrumb.slice(0, -1));
              }}
              className={"current"}
            >
              {breadcrumb[breadcrumb.length - 1]?.name}
            </button>
          )}
        </div>
      </div>

      {(treeCategories as any[])?.length > 0 && (
        <div className="subcategories">
          {(treeCategories as any[]).map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => {
                setTreeCategoriesLevel(subcategory);
                setBreadcrumb([...breadcrumb, subcategory]);
              }}
            >
              <span className="title">{subcategory.name}</span>
              {subcategory?.categoryNavigationCount > 0 && <ArrowForward />}
            </button>
          ))}
        </div>
      )}

      <div className="results">
        <span className="resume">
          {isLoading && <Loader type="circular-loader" />}
          {knowledgeResources?.length} {t("DocumentsAndResourcesText")}
        </span>
        <div className="list">
          <ScrollBar options={{ suppressScrollX: true }}>
            {isLoading && (
              <Loader type="card-loading" text={t("LoadingKnowledgeText")} />
            )}
            {!hasKnowledge && !isLoading && (
              <EmptyState
                text={t("NoResultsFoundText")}
                description={t("BroadenSearchText")}
                icon={<ChatNotStarted />}
              />
            )}
            {hasKnowledge &&
              !isLoading &&
              (knowledgeResources as any[]).map((item) => (
                <ListSearchItem
                  key={item?.coreKnowledge?.id || item.id}
                  description={item?.metadata?.description}
                  id={item?.coreKnowledge?.id || item.id}
                  metadata={{
                    ...item?.coreKnowledge,
                    ...item?.metadata,
                    ...item?.uploadFileMetadata?.[0],
                    blobType:
                      item?.metadata?.blobType ||
                      item?.coreKnowledge?.blobType ||
                      item?.blobType,
                    title: item?.metadata?.title || item.title,
                    uploadFileMetadata:
                      item?.metadata?.uploadFileMetadata ??
                      item?.uploadFileMetadata ??
                      item?.coreKnowledge?.uploadFileMetadata,
                  }}
                  showDropdown={false}
                />
              ))}
          </ScrollBar>
        </div>
      </div>
    </Wrapper>
  );
};
