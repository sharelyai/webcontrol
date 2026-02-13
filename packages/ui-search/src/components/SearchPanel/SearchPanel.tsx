import { useEffect } from "react";
import styled from "styled-components";
import { Title } from "./Title";
import { Search as SearchInput } from "../SearchInput";
import { BodySearch as SearchResults } from "../SearchResults";
import { useSearchStorage } from "../../stores/searchStore";
import {
  useTags,
  useGlobalStore,
  constants,
  useSharelyContext,
  classNames
} from "@sharely/services";
import { useResponsive } from "@sharely/ui-shared";

export const SearchPanelWrapper: any = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  .loader {
    width: 100%;
    height: 100%;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
`;

export const SearchPanel = () => {
  const {
    searchText,
    isLoadingSearch,
    responseTags,
    tagsSelected,
    setSearchText,
    setIsLoadingSearch,
    setResponseSearch,
    setResponseTags,
    setTagsSelected,
  } = useSearchStorage();
  
  const { config, token, workspace, currentInformation } = useGlobalStore();
  const { tags, tagsOptions } = useTags();
  const { isMobile } = useResponsive();
  const { apiClient } = useSharelyContext();

  const hasSearch = searchText.length > 0;
  const globalCustomConfig =
    workspace?.spaceStyling?.customConfig?.views?.search;
  const customConfig = globalCustomConfig?.results;
  const hasCustomConfig = Boolean(customConfig);
  const searchConfig = globalCustomConfig?.input || {};

  useEffect(() => {
    if (!tagsOptions.isLoading) {
      setResponseTags(tags);
    }
  }, [tagsOptions.isLoading, tags, setResponseTags]);

  const getSearch = async ({ query = "", tags = [] as any[] }) => {
    if (!searchText && !query) {
      return;
    }
    const queryTags =
      tags?.map((tag) => tag.id) || tagsSelected.map((tag) => tag.id);
    const queryText = query || searchText;
    setIsLoadingSearch(true);
    
    apiClient.spaces.sendEvent(currentInformation.spaceId, constants.SPACE_EVENTS.SPACE_EVENT_SEARCH_TERM, {
      term: queryText,
    });

    // sleep to wait for the cookie to be set
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const languageId = config?.workspaceId === "d9d761cf-53f6-433f-9547-67e69aa39de4"
        ? undefined
        : config?.langKnowledge;

      const promiseQueryTitle = apiClient.fetcher<any[]>(`/workspaces/${config?.workspaceId}/knowledge/query-title`, {
        method: "POST",
        body: JSON.stringify({
          value: queryText,
          languageId,
        }),
      }).then((data) => {
        const existingTitles = new Set();
        setResponseSearch([]);
        setResponseSearch((prev: any[]) => {
          prev.forEach((item) => existingTitles.add(item.title));
          const uniqueData = data.filter(
            (item) => !existingTitles.has(item.title)
          );
          return [...prev, ...uniqueData];
        });
      });

      const promiseQuery = apiClient.fetcher<any[]>(`/workspaces/${config?.workspaceId}/knowledge/query`, {
        method: "POST",
        body: JSON.stringify({
          text: queryText,
          includeDescription: true,
          topK: 30,
          tags: queryTags || null,
          languageId,
        }),
      }).then((data) => {
        setResponseSearch((prev: any[]) => {
          const existingTitles = new Set(prev.map((item) => item.title));
          const uniqueData = data.filter(
            (item, index, self) =>
              !existingTitles.has(item.title) &&
              self.findIndex((i) => i.title === item.title) === index
          );
          return [...prev, ...uniqueData];
        });
      });

      await Promise.all([promiseQueryTitle, promiseQuery]);
      setIsLoadingSearch(false);
    } catch (error) {
      console.error(error);
      setResponseSearch([]);
      setIsLoadingSearch(false);
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    getSearch({ query: text });
  };

  return (
    <SearchPanelWrapper
      {...(hasCustomConfig &&
        isMobile && {
          style: customConfig?.containerMobileStyles,
        })}
    >
      {!hasSearch && <Title />}
      <SearchInput
        tags={responseTags?.map((tag: any) => ({
          id: tag.id,
          label: tag.name,
          selected: tagsSelected.some(
            (selectedTag: any) => selectedTag.id === tag.id
          ),
        }))}
        onChangeTags={(tags: any) => {
          setTagsSelected(tags);
          getSearch({ tags });
        }}
        showTags={config?.displayMode?.VIEWS?.SEARCH?.SHOW_TAGS}
        hasSearch={hasSearch}
        searchInputProps={{
          initialValue: searchText,
          onSearch: handleSearchTextChange,
          onClear: () => {
            setSearchText("");
            setResponseSearch([]);
            setTagsSelected([]);
          },
          showClearButton: hasSearch,
          placeholder:
            searchConfig?.placeholder || "EnterKeywordsToExploreText",
        }}
      />
      <SearchResults isLoadingSearch={isLoadingSearch} />
    </SearchPanelWrapper>
  );
};
