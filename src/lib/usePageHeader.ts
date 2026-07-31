import { useEffect, useState } from "react";
import { PageHeaderApi } from "@/api/PageHeaderController";

export type PageHeaderContent = {
  title: string;
  description: string;
};

export function usePageHeader(
  pageKey: string,
  fallback: PageHeaderContent,
): PageHeaderContent {
  const [pageHeader, setPageHeader] =
    useState<PageHeaderContent>(fallback);

  useEffect(() => {
    let active = true;

    async function loadPageHeader() {
      try {
        const data = await PageHeaderApi.get(pageKey);

        if (!active) {
          return;
        }

        setPageHeader({
          title: data.title?.trim() || fallback.title,
          description:
            data.description?.trim() || fallback.description,
        });
      } catch (error) {
        /*
         * Keep the fallback text when:
         * - the record does not exist;
         * - the backend is temporarily unavailable;
         * - the request fails for another reason.
         */
        console.error(
          `Failed to load page header "${pageKey}":`,
          error,
        );

        if (active) {
          setPageHeader(fallback);
        }
      }
    }

    loadPageHeader();

    return () => {
      active = false;
    };
  }, [pageKey, fallback.title, fallback.description]);

  return pageHeader;
}