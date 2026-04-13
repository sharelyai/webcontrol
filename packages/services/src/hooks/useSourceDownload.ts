import { useState, useCallback } from "react";
import { useSharelyContext } from "../provider";
import { regex } from "../utils/regex";
import { customEvents } from "../utils/customEvents";
import { CUSTOM_EVENTS } from "../constants";
import type { Source } from "../types/agent";

export function useSourceDownload() {
  const { apiClient } = useSharelyContext();
  const [isLoading, setIsLoading] = useState(false);

  const downloadSource = useCallback(
    async (source: Source) => {
      // STRING type sources are text-only, skip download
      const sourceType = source.metadata?.sourceType?.toUpperCase();
      if (sourceType === "STRING") {
        if (source.url) {
          window.open(source.url, "_blank");
        }
        return;
      }

      // Prefer metadata.knowledgeId which is the actual knowledge UUID.
      // source.id may be a vector/chunk ID that the download API won't accept.
      const knowledgeId = source.metadata?.knowledgeId;
      const pageNumber = source.metadata?.pageNumber;

      // If no knowledgeId, try opening URL or skip
      if (!knowledgeId) {
        if (source.url) {
          window.open(source.url, "_blank");
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.knowledge.downloadFile(
          knowledgeId,
          pageNumber || 1,
        );

        if (response?.url) {
          const cleanUrl = response.url.replace(regex.GET_DOWNLOAD_WORD, "");

          if (cleanUrl.includes("pdf")) {
            // Trigger PDF preview modal via custom event
            customEvents.publish(CUSTOM_EVENTS.OPEN_PDF_PREVIEW, {
              url: cleanUrl,
              fileName: source.title,
              pageNumber: pageNumber || 1,
            });
          } else {
            // For non-PDF files, open in new window
            window.open(cleanUrl, "_blank");
          }
        }
      } catch (error) {
        console.error("[useSourceDownload] Failed to download source:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient],
  );

  return { downloadSource, isLoading };
}
