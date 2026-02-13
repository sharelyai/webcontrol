import { create } from "zustand";

interface BrowseContextState {
  treeCategoriesLevelData?: any;
  setTreeCategoriesLevelData?: (treeCategoriesLevel: any) => void;
  breadcrumb?: any[];
  setBreadcrumb?: (breadcrumb: any[]) => void;
  customModal?: any;
  setCustomModal?: (customModal: any) => void;
}

export const useBrowseStorage = create<BrowseContextState>((set) => ({
  treeCategoriesLevelData: null,
  setTreeCategoriesLevelData: (treeCategoriesLevelData) =>
    set({ treeCategoriesLevelData }),
  breadcrumb: [],
  setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
  customModal: null,
  setCustomModal: (customModal) => set({ customModal }),
}));
