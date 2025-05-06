import React, { createContext, useContext } from "react";
import { makeAutoObservable } from "mobx";

const store = {
    data: [],
    searchTerm: "",
    currentPage: 1,
    pageSize: 5,
    sortKey: null,
    sortDirection: "asc",
    startDate: "",
    endDate: "",
    isDateFilterApplied: false,

    setSearchTerm(value) {
        this.searchTerm = value;
    },
    setPageSize(value) {
        this.pageSize = value;
    },
    setCurrentPage(value) {
        this.currentPage = value;
    },
    setSortKey(value) {
        this.sortKey = value;
    },
    setSortDirection(value) {
        this.sortDirection = value;
    },
    setStartDate(value) {
        this.startDate = value;
    },
    setEndDate(value) {
        this.endDate = value;
    },
    setDateFilterApplied(value) {
        this.isDateFilterApplied = value;
    },
    loadData() {
        this.data = Array.from({ length: 50 }, (_, i) => ({
            ReportEndDate: `2025-05-${(i + 1).toString().padStart(2, "0")}`,
            PatientName: `Patient ${i + 1}`,
            DownloadedAt: `2025-04-${(i + 1).toString().padStart(2, "0")}`,
        }));
    }
};

makeAutoObservable(store);

const StoreContext = createContext(store);

export const StoreProvider = ({ children }) => {
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
