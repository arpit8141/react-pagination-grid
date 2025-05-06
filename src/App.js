import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./StoreProvider";
import * as XLSX from "xlsx";
import "./App.css";

// Function to filter data
const filterData = (data, store) => {
  return data.filter((item) => {
    const { searchTerm, startDate, endDate, isDateFilterApplied } = store;

    const matchSearch = Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (isDateFilterApplied && (startDate || endDate)) {
      const itemDate = new Date(item.ReportEndDate);
      const fromDate = startDate ? new Date(startDate) : null;
      const toDate = endDate ? new Date(endDate) : null;

      if ((fromDate && itemDate < fromDate) || (toDate && itemDate > toDate)) {
        return false;
      }
    }

    return matchSearch;
  });
};

// Function to sort data
const sortData = (data, store) => {
  const { sortKey, sortDirection } = store;
  if (!sortKey) return data;

  return data.sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
};

// Function to paginate data
const paginateData = (data, store) => {
  const startIndex = (store.currentPage - 1) * store.pageSize;
  return data.slice(startIndex, startIndex + store.pageSize);
};

// Main App Component
const App = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.loadData();
  }, []);

  useEffect(() => {
    store.setCurrentPage(1);
  }, [
    store.searchTerm,
    store.startDate,
    store.endDate,
    store.isDateFilterApplied,
    store.sortKey,
    store.sortDirection,
  ]);

  const handleSort = (key) => {
    const direction =
      store.sortKey === key && store.sortDirection === "asc" ? "desc" : "asc";
    store.setSortKey(key);
    store.setSortDirection(direction);
  };

  // Filtering, sorting, and pagination functions
  let filteredData = filterData(store.data, store);
  filteredData = sortData(filteredData, store);
  const paginatedData = paginateData(filteredData, store);

  const totalPages = Math.ceil(filteredData.length / store.pageSize);

  const handleDownload = () => {
    const dataToDownload = paginatedData.map((row) => ({
      ReportEndDate: row.ReportEndDate,
      PatientName: row.PatientName,
      DownloadedAt: row.DownloadedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GridData");
    XLSX.writeFile(workbook, "grid_data.xlsx");
  };

  return (
    <div className="container">
      <div className="header">
        <div className="left">
          <input
            type="text"
            placeholder="Search..."
            value={store.searchTerm}
            onChange={(e) => store.setSearchTerm(e.target.value)}
          />
        </div>

        <div className="center">
          <input
            type="date"
            value={store.startDate}
            onChange={(e) => store.setStartDate(e.target.value)}
          />
          <input
            type="date"
            value={store.endDate}
            onChange={(e) => store.setEndDate(e.target.value)}
          />
          <button onClick={() => store.setDateFilterApplied(true)}>Apply</button>
          <button
            onClick={() => {
              store.setDateFilterApplied(false);
              store.setStartDate("");
              store.setEndDate("");
            }}
          >
            Reset
          </button>
        </div>

        <div className="right">
          <select
            value={store.pageSize}
            onChange={(e) => store.setPageSize(parseInt(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <button onClick={handleDownload}>Download Excel</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("ReportEndDate")}>Report End Date</th>
              <th onClick={() => handleSort("PatientName")}>Patient Name</th>
              <th onClick={() => handleSort("DownloadedAt")}>Downloaded At</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.ReportEndDate}</td>
                <td>{row.PatientName}</td>
                <td>{row.DownloadedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => store.setCurrentPage(store.currentPage - 1)}
          disabled={store.currentPage === 1}
        >
          Prev
        </button>
        <span className="current-page">
          Page {store.currentPage} of {totalPages}
        </span>
        <button
          onClick={() => store.setCurrentPage(store.currentPage + 1)}
          disabled={store.currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default App;
