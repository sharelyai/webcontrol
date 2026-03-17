import { useState } from "react";
import styled, { css } from "styled-components";

import {
  Divider,
  Tooltip,
  Archive,
  ArrowDown,
  AudioFile,
  Description,
  Download,
  Excel,
  Language,
  Launch,
  PictureAsPdf,
  VideoFile,
  Word,
  Image,
  Link,
} from "@sharelyai/ui-shared";
import {
  constants,
  customEvents,
  regex,
  useGlobalStore,
  useSharelyContext,
  useLanguage,
  classNames
} from "@sharelyai/services";

const Container: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    align-self: stretch;
    cursor: pointer;
    width: 99%;
    transition: all 0.2s ease-in-out;
    border-bottom: 1px solid ${theme.colors.athensGray2};

    &:hover {
      background: ${({ theme }) => theme.colors.whiteLilac2};
    }

    @media (max-width: ${theme.screens.md}) {
      padding: 20px 16px;

      &:hover {
        background: ${({ theme }) => theme.colors.transparent};
      }
    }

    & > .wrapper-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      & > .title {
        display: flex;
        align-items: center;
        gap: 12px;
        overflow: hidden;

        @media (max-width: ${theme.screens.md}) {
          width: 80%;
        }

        & > .icon {
          display: flex;
          width: 36px;
          height: 36px;
          padding: 8px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          border-radius: 8px;
          background: ${({ theme }) => theme.colors.whiteLilac2};

          & > svg {
            width: 24px;
            height: 24px;
            color: ${({ theme }) => theme.colors.paleSky};
            fill: ${({ theme }) => theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }

          &.customIcon {
            background: ${({ theme }) => theme.colors.transparent};
          }

          &.pdf,
          &.mp4,
          &.png,
          &.jpeg,
          &.gif,
          &.webp {
            background: ${({ theme }) => theme.colors.cinnabar2}14;

            & > svg {
              color: ${({ theme }) => theme.colors.cinnabar2};
              fill: ${({ theme }) => theme.colors.cinnabar2};
            }
          }

          &.zip,
          &.rar {
            background: ${({ theme }) => theme.colors.athensGray2};

            & > svg {
              color: ${({ theme }) => theme.colors.mirage};
              fill: ${({ theme }) => theme.colors.mirage};
            }
          }

          &.mp3 {
            background: ${({ theme }) => theme.colors.selectiveYellow}14;

            & > svg {
              color: ${({ theme }) => theme.colors.selectiveYellow};
              fill: ${({ theme }) => theme.colors.selectiveYellow};
            }
          }

          &.doc,
          &.docx {
            background: ${({ theme }) => theme.colors.cornflowerBlue}14;

            & > svg {
              color: ${({ theme }) => theme.colors.cornflowerBlue};
              fill: ${({ theme }) => theme.colors.cornflowerBlue};
            }
          }
        }

        & > .content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          overflow: hidden;

          & > .wrapper-title {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            overflow: hidden;

            & > .title {
              overflow: hidden;
              color: ${({ theme }) => theme.colors.ebony};
              text-overflow: ellipsis;
              font-size: ${({ theme }) => theme.fonts.base};
              font-style: normal;
              font-weight: 600;
              line-height: 110%;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;

              &.italic {
                font-style: italic;
              }
            }

            & > .pill {
              display: flex;
              padding: 3px 6px;
              justify-content: center;
              align-items: center;
              gap: 10px;
              border-radius: 100px;
              background: ${({ theme }) => theme.colors.athensGray4};
              color: ${({ theme }) => theme.colors.ebony};
              font-size: ${({ theme }) => theme.fonts.xs};
              font-style: normal;
              font-weight: 500;
              line-height: 110%;
            }
          }

          & > .description {
            display: flex;
            align-items: center;
            gap: 8px;
            align-self: stretch;
            color: ${({ theme }) => theme.colors.fiord};
            font-size: ${({ theme }) => theme.fonts.xs};
            font-style: normal;
            font-weight: 400;
            line-height: 110%;
            width: 100%;
            flex-wrap: wrap;

            & > .item {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            & > .pill {
              display: flex;
              padding: 3px 6px;
              justify-content: center;
              align-items: center;
              gap: 10px;
              border-radius: 100px;
              background: ${({ theme }) => theme.colors.athensGray4};
              font-size: ${({ theme }) => theme.fonts.xs};
              font-style: normal;
              font-weight: 500;
              line-height: 110%;
              width: max-content;
            }
          }
        }
      }

      & > .actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;

        .icon {
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.active {
            & > svg {
              transform: rotate(180deg);
            }
          }

          & > svg {
            width: 24px;
            height: 24px;
            color: ${({ theme }) => theme.colors.paleSky};
            fill: ${({ theme }) => theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }
        }
      }
    }

    & > .description {
      overflow: hidden;
      color: ${({ theme }) => theme.colors.fiord};
      text-overflow: ellipsis;
      font-size: ${({ theme }) => theme.fonts.base};
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & > .tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
      opacity: 0;

      &.show {
        max-height: 200px;
        opacity: 1;
      }

      & > .tag {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        height: 32px;
        padding: 2px 16px;
        justify-content: center;
        align-items: center;
        gap: 6px;
        border-radius: 16px;
        border: 1px solid ${({ theme }) => theme.colors.athensGray2};
        color: ${({ theme }) => theme.colors.OxfordBlue};
        text-align: center;
        font-size: ${({ theme }) => theme.fonts.sm};
        font-style: normal;
        font-weight: 500;
        line-height: 110%;

        &:hover {
          border: 1px solid ${({ theme }) => theme.colors.indigo};
          color: ${({ theme }) => theme.colors.indigo};
        }
      }
    }
  `}
`;

type ComponentProps = {
  id: string;
  description: string;
  score?: number;
  metadata: any;
  showDropdown?: boolean;
  type?: "search" | "category";
};

// map blob type with text to icon
const MAP_BLOB_TYPE_TO_ICON: { [key: string]: React.ElementType } = {
  [constants.MIMETYPE_APPLICATION_PDF]: PictureAsPdf,
  [constants.MIMETYPE_TEXT]: Description,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT]:
    Word,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_SPREADSHEETML_SHEET]:
    Excel,
  [constants.MIMETYPE_APPLICATION_VND_MS_EXCEL]: Excel,
  [constants.MIMETYPE_APPLICATION_MSWORD]: Word,
  https: Language,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_PRESENTATIONML_PRESENTATION]:
    Archive,
  [constants.MIMETYPE_APPLICATION_ZIP]: Archive,
  [constants.MIMETYPE_APPLICATION_RAR]: Archive,
  [constants.MIMETYPE_AUDIO_MP3]: AudioFile,
  [constants.MIMETYPE_VIDEO_MP4]: VideoFile,
  [constants.MIMETYPE_IMAGE_PNG]: Image,
  [constants.MIMETYPE_IMAGE_JPEG]: Image,
  [constants.MIMETYPE_IMAGE_GIF]: Image,
  [constants.MIMETYPE_IMAGE_WEBP]: Image,
};

const MAP_BLOB_TYPE_TO_ICON_FILES: { [key: string]: React.ElementType } = { LINK: Link };

const RelevantScore = ({ score }: { score: number }) => {
  const percent = (score * 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return <span className="item">{percent}% Relevant</span>;
};

export const ListSearchItem = (props: ComponentProps) => {
  const { showDropdown = false, type = "search", ...item } = props;

  const [showMore, setShowMore] = useState(false);

  const { config, token, workspace, currentInformation } = useGlobalStore();
  const { langText } = useLanguage();
  const { apiClient } = useSharelyContext();

  const blobType =
    item?.metadata?.["blobType"] ||
    item?.metadata?.["mimeType"] ||
    item?.metadata?.["mimetype"] ||
    item?.metadata?.["type"] ||
    item?.metadata?.["elasticSearch.url_scheme.raw"];
  const iconType = blobType ?? "text/plain";
  const customIcons = workspace?.spaceStyling?.icons;
  const hasCustomIcon = Boolean(customIcons);
  const customConfig =
    workspace?.spaceStyling?.customConfig?.views?.search?.results?.listItem;
  const showDescription = customConfig?.showDescription ?? true;
  const showPill = customConfig?.showPill ?? true;
  const showOpenInFullView = customConfig?.showOpenInFullView ?? true;
  const isChunk = item?.metadata?.["chunkType"] === "CHUNK";
  const isPdf = blobType === "application/pdf";
  const isDownloadable =
    Object.keys(MAP_BLOB_TYPE_TO_ICON).includes(blobType) ||
    (isChunk && blobType !== "LINK");
  const hasToShowOpenInFullView = isPdf || blobType === "LINK";
  const title =
    item?.metadata?.["title"] ??
    item?.metadata?.["text"] ??
    item?.metadata?.["filename"] ??
    item.metadata?.["elasticSearch.title.raw"] ??
    "";
  const description =
    item?.["description"] ??
    item.metadata?.["elasticSearch.meta_description.raw"] ??
    "";
  const sourceName =
    item?.metadata?.["filename"] ??
    item?.metadata?.["elasticSearch.url.raw"] ??
    item?.metadata?.["link"] ??
    item?.metadata?.["source"] ??
    item?.metadata?.["uploadFileMetadata"]?.["filename"];
  const page = item?.metadata?.["loc.pageNumber"];

  const IconComponent = () => {
    const customIconSvg =
      customIcons?.[isChunk ? "star" : undefined] ||
      customIcons?.[constants.MIMETYPE_TO_EXTENSION?.[item?.["type"]]] ||
      customIcons?.[constants.MIMETYPE_TO_EXTENSION?.[iconType]] ||
      customIcons?.["default"];
    if (customIconSvg) {
      // Convert SVG string to React component
      return (
        <span
          dangerouslySetInnerHTML={{ __html: customIconSvg }}
          style={{ display: "inline-flex", alignItems: "center" }}
        />
      );
    }
    const Icon =
      MAP_BLOB_TYPE_TO_ICON[iconType] ||
      MAP_BLOB_TYPE_TO_ICON_FILES[iconType] ||
      Description;
    return <Icon />;
  };

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const responseDownload = await apiClient.knowledge.downloadFile(item.metadata?.["knowledgeId"] ?? item?.id);
    if (responseDownload?.url) {
      const url = responseDownload.url;
      const parsedUrl = new URL(url);
      const downloadValue = parsedUrl.searchParams.get("download");

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadValue || "download.pdf";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const handleOpenInFullView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (item?.metadata?.["type"] === "LINK") {
      const newWindow = window.open("about:blank", "_blank");
      if(newWindow) newWindow.location.href =
        item?.["content"] ||
        item?.metadata?.["content"] ||
        item?.metadata?.["link"] ||
        "";
      return;
    }
    // Continue asynchronously
    apiClient.knowledge.downloadFile(item.metadata?.["knowledgeId"] ?? item?.id)
    .then((responseDownload) => {
      if (responseDownload?.url) {
        const cleanUrl = responseDownload?.url
          ?.replace(regex.GET_DOWNLOAD_WORD, "")
          ?.replace(regex.GET_PAGE_WORD, page ? `page=.${page}` : "");

        if (cleanUrl.includes("pdf")) {
          // Trigger PDF preview modal via custom event
          customEvents.publish(constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW, {
            url: cleanUrl,
            fileName: sourceName || title || "Document",
            pageNumber: page || 1,
          });
        } else {
          // For non-PDF files, open in new window
          const newWindow = window.open("about:blank", "_blank");
          if(newWindow) newWindow.location.href = cleanUrl;
        }
      }
    });
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    apiClient.spaces.sendEvent(
      currentInformation.spaceId,
      constants.SPACE_EVENTS.SPACE_EVENT_CLICKED_SEARCH_RESULT,
      {
        term: title,
        resultId: item.id,
        resultTitle: title,
        blobType,
        description,
        isChunk,
        sourceName,
        page,
      }
    );
    if (hasToShowOpenInFullView) {
      handleOpenInFullView(event as any);
      return;
    }
    handleDownload(event as any);
  };

  return (
    <Container
      onClick={handleContainerClick}
      {...(customConfig && { style: customConfig.styles })}
    >
      <div className="wrapper-title">
        <div className="title">
          <div
            className={classNames("icon", {
              [constants.MIMETYPE_TO_EXTENSION[iconType]]: !hasCustomIcon,
              customIcon: hasCustomIcon,
            })}
          >
            <IconComponent />
          </div>
          <div className="content">
            <div className="wrapper-title">
              <span
                className={classNames("title", {
                  italic: isChunk,
                })}
              >
                {title}
              </span>
              {showPill && (
                <span className="pill">
                  {!isChunk ? langText.FileText : langText.ContentText}
                </span>
              )}
            </div>
            <span className="description">
              {customConfig?.showPageAsPill && page && (
                <span className="item pill">
                  {langText.PageText} {page}{" "}
                </span>
              )}
              {sourceName && <span className="item">{sourceName}</span>}
              {item?.score > 0 && (
                <>
                  <Divider type="dot" />
                  <RelevantScore score={item.score} />
                </>
              )}
              {page && !customConfig?.showPageAsPill && (
                <>
                  <Divider type="dot" />
                  <span className="item">
                    {langText.PageText} {page}{" "}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
        <div className="actions">
          {hasToShowOpenInFullView && showOpenInFullView && (
            <Tooltip text="Open in full view">
              <button className="icon" onClick={handleOpenInFullView}>
                <Launch />
              </button>
            </Tooltip>
          )}
          {isDownloadable && (
            <Tooltip text="Download">
              <button className="icon" onClick={handleDownload}>
                <Download />
              </button>
            </Tooltip>
          )}
          {showDropdown && (
            <Tooltip text="View more">
              <button
                className={classNames("icon", { active: showMore })}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMore((prev) => !prev);
                }}
              >
                <ArrowDown />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      {showDescription && <div className="description">{description}</div>}
      {false && (
        <div className={classNames("tags", { show: showMore })}>
          {Array(0)
            .fill(0)
            .map((_, index) => {
              return (
                <button className="tag" key={index}>
                  Test tag
                </button>
              );
            })}
        </div>
      )}
    </Container>
  );
};
