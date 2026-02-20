import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore } from "../filter-store";

describe("useFilterStore", () => {
  beforeEach(() => {
    useFilterStore.setState({
      areaId: null,
      status: [],
      priority: [],
      search: "",
    });
  });

  it("has correct initial state", () => {
    const state = useFilterStore.getState();
    expect(state.areaId).toBeNull();
    expect(state.status).toEqual([]);
    expect(state.priority).toEqual([]);
    expect(state.search).toBe("");
  });

  it("sets areaId", () => {
    useFilterStore.getState().setAreaId("area-123");
    expect(useFilterStore.getState().areaId).toBe("area-123");
  });

  it("sets areaId to null", () => {
    useFilterStore.getState().setAreaId("area-123");
    useFilterStore.getState().setAreaId(null);
    expect(useFilterStore.getState().areaId).toBeNull();
  });

  it("sets status filters", () => {
    useFilterStore.getState().setStatus(["todo", "in_progress"]);
    expect(useFilterStore.getState().status).toEqual(["todo", "in_progress"]);
  });

  it("sets priority filters", () => {
    useFilterStore.getState().setPriority(["high", "urgent"]);
    expect(useFilterStore.getState().priority).toEqual(["high", "urgent"]);
  });

  it("sets search query", () => {
    useFilterStore.getState().setSearch("my task");
    expect(useFilterStore.getState().search).toBe("my task");
  });

  it("clears all filters", () => {
    const store = useFilterStore.getState();
    store.setAreaId("area-123");
    store.setStatus(["done"]);
    store.setPriority(["urgent"]);
    store.setSearch("search term");

    useFilterStore.getState().clearFilters();

    const state = useFilterStore.getState();
    expect(state.areaId).toBeNull();
    expect(state.status).toEqual([]);
    expect(state.priority).toEqual([]);
    expect(state.search).toBe("");
  });
});
