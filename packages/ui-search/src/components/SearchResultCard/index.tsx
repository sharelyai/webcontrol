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
} from "@sharely/ui-shared";
import { 
  useGlobalStore, 
  useLanguage, 
  constants, 
  customEvents, 
  regex, 
  useSharelyContext,
  classNames
} from "@sharely/services";

const Container: any = styled.div`
  ${({ theme }: { theme: any }) => css`
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
      background: ${theme.colors.whiteLilac2};
    }

    @media (max-width: ${theme.screens.md}) {
      padding: 20px 16px;

      &:hover {
        background: ${theme.colors.transparent};
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
          background: ${theme.colors.whiteLilac2};

          & > svg {
            width: 24px;
            height: 24px;
            color: ${theme.colors.paleSky};
            fill: ${theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }

          &.customIcon {
            background: ${theme.colors.transparent};
          }

          &.pdf, &.mp4, &.png, &.jpeg, &.gif, &.webp {
            background: ${theme.colors.cinnabar2}14;
            & > svg {
              color: ${theme.colors.cinnabar2};
              fill: ${theme.colors.cinnabar2};
            }
          }

          &.zip, &.rar {
            background: ${theme.colors.athensGray2};
            & > svg {
              color: ${theme.colors.mirage};
              fill: ${theme.colors.mirage};
            }
          }

          &.mp3 {
            background: ${theme.colors.selectiveYellow}14;
            & > svg {
              color: ${theme.colors.selectiveYellow};
              fill: ${theme.colors.selectiveYellow};
            }
          }

          &.doc, &.docx {
            background: ${theme.colors.cornflowerBlue}14;
            & > svg {
              color: ${theme.colors.cornflowerBlue};
              fill: ${theme.colors.cornflowerBlue};
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
              color: ${theme.colors.ebony};
              text-overflow: ellipsis;
              font-size: ${theme.fonts.base};
              font-style: normal;
              font-weight: 600;
              line-height: 110%;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;

              &.italic { font-style: italic; }
            }

            & > .pill {
              display: flex;
              padding: 3px 6px;
              justify-content: center;
              align-items: center;
              gap: 10px;
              border-radius: 100px;
              background: ${theme.colors.athensGray4};
              color: ${theme.colors.ebony};
              font-size: ${theme.fonts.xs};
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
            color: ${theme.colors.fiord};
            font-size: ${theme.fonts.xs};
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
              background: ${theme.colors.athensGray4};
              font-size: ${theme.fonts.xs};
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
            & > svg { transform: rotate(180deg); }
          }

          & > svg {
            width: 24px;
            height: 24px;
            color: ${theme.colors.paleSky};
            fill: ${theme.colors.paleSky};
            transition: all 0.2s ease-in-out;
          }
        }
      }
    }

    & > .description {
      overflow: hidden;
      color: ${theme.colors.fiord};
      text-overflow: ellipsis;
      font-size: ${theme.fonts.base};
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `}
`;

const MAP_BLOB_TYPE_TO_ICON: Record<string, any> = {
  [constants.MIMETYPE_APPLICATION_PDF]: PictureAsPdf,
  [constants.MIMETYPE_TEXT]: Description,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT]: Word,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_SPREADSHEETML_SHEET]: Excel,
  [constants.MIMETYPE_APPLICATION_VND_MS_EXCEL]: Excel,
  [constants.MIMETYPE_APPLICATION_MSWORD]: Word,
  https: Language,
  [constants.MIMETYPE_APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_PRESENTATIONML_PRESENTATION]: Archive,
  [constants.MIMETYPE_APPLICATION_ZIP]: Archive,
  [constants.MIMETYPE_APPLICATION_RAR]: Archive,
  [constants.MIMETYPE_AUDIO_MP3]: AudioFile,
  [constants.MIMETYPE_VIDEO_MP4]: VideoFile,
  [constants.MIMETYPE_IMAGE_PNG]: Image,
  [constants.MIMETYPE_IMAGE_JPEG]: Image,
  [constants.MIMETYPE_IMAGE_GIF]: Image,
  [constants.MIMETYPE_IMAGE_WEBP]: Image,
};

const MAP_BLOB_TYPE_TO_ICON_FILES = { LINK: Link };

const RelevantScore = ({ score }: { score: number }) => {
  const percent = (score * 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return <span className="item">{percent}% Relevant</span>;
};

export const SearchResultCard = (props: any) => {
  const { showDropdown = false, ...item } = props;
  const [showMore, setShowMore] = useState(false);

  const { workspace, currentInformation } = useGlobalStore();
  const { langText: t } = useLanguage();
  const { apiClient } = useSharelyContext();

  const blobType =
    item?.metadata?.["blobType"] ||
    item?.metadata?.["mimeType"] ||
    item?.metadata?.["mimetype"] ||
    item?.metadata?.["type"] ||
    item?.metadata?.["elasticSearch.url_scheme.raw"];
  const iconType = blobType ?? "text/plain";
  const customIcons: any = workspace?.spaceStyling?.icons;
  const hasCustomIcon = Boolean(customIcons);
  
  const customConfig = workspace?.spaceStyling?.customConfig?.views?.search?.results?.listItem;
  const showDescription = customConfig?.showDescription ?? true;
  const showPill = customConfig?.showPill ?? true;
  const showOpenInFullView = customConfig?.showOpenInFullView ?? true;
  
  const isChunk = item?.metadata?.["chunkType"] === "CHUNK";
  const isPdf = blobType === "application/pdf";
  const isDownloadable = Object.keys(MAP_BLOB_TYPE_TO_ICON).includes(blobType) || (isChunk && blobType !== "LINK");
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
    const iconExtension = (constants as any).MIMETYPE_TO_EXTENSION?.[item?.["type"]] || (constants as any).MIMETYPE_TO_EXTENSION?.[iconType];
    const customIconSvg =
      (isChunk ? customIcons?.["star"] : undefined) ||
      (iconExtension ? customIcons?.[iconExtension] : undefined) ||
      customIcons?.["default"];
      
    if (customIconSvg) {
      return <span dangerouslySetInnerHTML={{ __html: customIconSvg }} style={{ display: "inline-flex", alignItems: "center" }} />;
    }
    const Icon = MAP_BLOB_TYPE_TO_ICON[iconType] || (MAP_BLOB_TYPE_TO_ICON_FILES as any)[iconType] || Description;
    return <Icon />;
  };

  const handleDownload = async (e: any) => {
    e.stopPropagation();
    try {
      const responseDownload = await apiClient.knowledge.downloadFile(item.metadata?.["knowledgeId"] ?? item?.id);
      if (responseDownload?.url) {
        const url = responseDownload.url;
        const anchor = document.body.appendChild(document.createElement("a"));
        anchor.href = url;
        anchor.download = "download.pdf";
        anchor.click();
        anchor.remove();
      }
    } catch (err) { console.error(err); }
  };

  const handleOpenInFullView = (e: any) => {
    e.stopPropagation();
    if (item?.metadata?.["type"] === "LINK") {
      const newWindow = window.open(item?.["content"] || item?.metadata?.["content"] || item?.metadata?.["link"] || "", "_blank");
      return;
    }
    
    apiClient.knowledge.downloadFile(item.metadata?.["knowledgeId"] ?? item?.id).then((responseDownload) => {
      if (responseDownload?.url) {
        const cleanUrl = responseDownload.url
          .replace(regex.GET_DOWNLOAD_WORD, "")
          .replace(regex.GET_PAGE_WORD, page ? `page=${page}` : "");

        if (cleanUrl.includes("pdf")) {
          customEvents.publish(constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW, {
            url: cleanUrl,
            fileName: sourceName || title || "Document",
            pageNumber: page || 1,
          });
        } else {
          window.open(cleanUrl, "_blank");
        }
      }
    });
  };

  const handleContainerClick = (event: any) => {
    apiClient.spaces.sendEvent(currentInformation.spaceId, constants.SPACE_EVENTS.SPACE_EVENT_CLICKED_SEARCH_RESULT, {
      term: title,
      resultId: item.id,
      resultTitle: title,
      blobType,
      description,
      isChunk,
      sourceName,
      page,
    });
    
    if (hasToShowOpenInFullView) {
      handleOpenInFullView(event);
      return;
    }
    handleDownload(event);
  };

  const iconExtensionForClass = (constants as any).MIMETYPE_TO_EXTENSION?.[iconType];

  return (
    <Container onClick={handleContainerClick}>
      <div className="wrapper-title">
        <div className="title">
          <div className={classNames("icon", {
            [iconExtensionForClass]: !hasCustomIcon && iconExtensionForClass,
            customIcon: hasCustomIcon,
          })}>
            <IconComponent />
          </div>
          <div className="content">
            <div className="wrapper-title">
              <span className={classNames("title", { italic: isChunk })}>{title}</span>
              {showPill && (
                <span className="pill">
                  {!isChunk ? t.FileText : t.ContentText}
                </span>
              )}
            </div>
            <span className="description">
              {customConfig?.showPageAsPill && page && (
                <span className="item pill">{t.PageText} {page} </span>
              )}
              {sourceName && <span className="item">{sourceName}</span>}
              {item?.score > 0 && (
                <>
                  <Divider type="dot" />
                  <RelevantScore score={item.score} />
                </>
              )}
            </span>
          </div>
        </div>
        <div className="actions">
          {hasToShowOpenInFullView && showOpenInFullView && (
            <Tooltip text="Open in full view">
              <button className="icon" onClick={handleOpenInFullView}><Launch /></button>
            </Tooltip>
          )}
          {isDownloadable && (
            <Tooltip text="Download">
              <button className="icon" onClick={handleDownload}><Download /></button>
            </Tooltip>
          )}
        </div>
      </div>
      {showDescription && <div className="description">{description}</div>}
    </Container>
  );
};
