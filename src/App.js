import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./StoreProvider";
import * as XLSX from "xlsx"; // Importing XLSX library

const App = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.setCurrentPage(1);
  }, [store.searchTerm, store.startDate, store.endDate, store.isDateFilterApplied, store.sortKey, store.sortDirection]);


  const handleSort = (key) => {
    if (store.sortKey === key) {
      store.setSortDirection(store.sortDirection === "asc" ? "desc" : "asc");
    } else {
      store.setSortKey(key);
      store.setSortDirection("asc");
    }
  };

  const filteredData = store.data
    .filter((item) =>
      Object.values(item).some((val) =>
        val.toLowerCase().includes(store.searchTerm.toLowerCase())
      )
    )
    .filter((item) => {
      if (!store.isDateFilterApplied) return true;
      const date = new Date(item.ReportEndDate);
      const start = new Date(store.startDate);
      const end = new Date(store.endDate);
      return date >= start && date <= end;
    });

  const sortedData = [...filteredData].sort((a, b) => {
    const { sortKey, sortDirection } = store;
    if (!sortKey) return 0;
    if (a[sortKey] < b[sortKey]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / store.pageSize);
  const startIdx = (store.currentPage - 1) * store.pageSize;
  const paginatedData = sortedData.slice(startIdx, startIdx + store.pageSize);

  // Function to handle Excel export
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(paginatedData); // Convert data to sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grid Data");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "grid_data.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Top Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={store.searchTerm}
          onChange={(e) => store.setSearchTerm(e.target.value)}
          style={{ width: "30%" }}
        />

        {/* Date Range Filter */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "center" }}>
          <input
            type="date"
            value={store.startDate}
            onChange={(e) => store.setStartDate(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <span style={{ margin: "0 8px" }}>to</span>
          <input
            type="date"
            value={store.endDate}
            onChange={(e) => store.setEndDate(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={() => store.setDateFilterApplied(true)} style={{ marginLeft: 8 }}>
            Apply
          </button>
          <button onClick={() => store.setDateFilterApplied(false)} style={{ marginLeft: 4 }}>
            Reset
          </button>
        </div>

        {/* Page Size & Download Excel Button */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <select
            value={store.pageSize}
            onChange={(e) => store.setPageSize(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadExcel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              marginLeft: 10,
            }}
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <table width="100%" border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th onClick={() => handleSort("ReportEndDate")}>Report End Date</th>
            <th onClick={() => handleSort("PatientName")}>Patient Name</th>
            <th onClick={() => handleSort("DownloadedAt")}>Downloaded At</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index}>
              <td>{item.ReportEndDate}</td>
              <td>{item.PatientName}</td>
              <td>{item.DownloadedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button
          disabled={store.currentPage === 1}
          onClick={() => store.setCurrentPage(store.currentPage - 1)}
        >
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {store.currentPage} of {totalPages}
        </span>
        <button
          disabled={store.currentPage === totalPages}
          onClick={() => store.setCurrentPage(store.currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default App;
