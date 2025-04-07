import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './IfscSearch.css'; // reuse same styles

const IFSCSearch = () => {
  const [manualIfsc, setManualIfsc] = useState('');
  const [ifscList, setIfscList] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleManualSearch = async () => {
    if (!manualIfsc.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${manualIfsc}`);
      if (!res.ok) throw new Error('Invalid IFSC');
      const data = await res.json();
      setResults([data, ...results]);
    } catch (err) {
      setResults([{ IFSC: manualIfsc, error: 'Invalid IFSC Code' }, ...results]);
    }
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const codes = parsedData.flat().filter(Boolean);
      setIfscList(codes);
    };

    reader.readAsArrayBuffer(file);
  };

  const fetchIFSCData = async () => {
    setLoading(true);
    const resultData = [];

    for (let code of ifscList) {
      try {
        const res = await fetch(`https://ifsc.razorpay.com/${code}`);
        if (!res.ok) throw new Error("Invalid IFSC");
        const data = await res.json();
        resultData.push(data);
      } catch (err) {
        resultData.push({ IFSC: code, error: 'Invalid IFSC Code' });
      }
    }

    setResults([...resultData, ...results]);
    setLoading(false);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IFSC Data');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'finolex_ifsc_data.xlsx');
  };

  return (
    <div className="dashboard-container">
      {loading && <div className="loading-bar"></div>}

      <h2>IFSC Code Search</h2>

      <div className="top-controls">
        <div className="left-controls">
          <input
            type="text"
            placeholder="Enter IFSC code"
            value={manualIfsc}
            onChange={(e) => setManualIfsc(e.target.value)}
          />
          <button onClick={handleManualSearch}>Search</button>

          <input type="file" onChange={handleFileUpload} />
          <button onClick={fetchIFSCData}>Search from Excel</button>
        </div>

        <button className="export-btn" onClick={exportToExcel}>Export</button>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th>IFSC</th>
            <th>Bank</th>
            <th>Branch</th>
            <th>Address</th>
            <th>City</th>
            <th>State</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item, index) => (
            <tr key={index}>
              <td>{item.IFSC || ''}</td>
              <td>{item.BANK || ''}</td>
              <td>{item.BRANCH || ''}</td>
              <td>{item.ADDRESS || ''}</td>
              <td>{item.CITY || ''}</td>
              <td>{item.STATE || ''}</td>
              <td>{item.error || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IFSCSearch;
