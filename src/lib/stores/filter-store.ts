import { create } from "zustand";

interface FilterState {
  areaId: string | null;
  status: string[]; // 'todo', 'in_progress', 'done'
  priority: string[]; // 'low', 'medium', 'high', 'urgent'
  search: string;
  setAreaId: (id: string | null) => void;
  setStatus: (status: string[]) => void;
  setPriority: (priority: string[]) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  areaId: null,
  status: [],
  priority: [],
  search: "",
  setAreaId: (id) => set({ areaId: id }),
  setStatus: (status) => set({ status }),
  setPriority: (priority) => set({ priority }),
  setSearch: (search) => set({ search }),
  clearFilters: () =>
    set({ areaId: null, status: [], priority: [], search: "" }),
}));
