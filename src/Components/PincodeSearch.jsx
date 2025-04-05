/* File: src/components/PincodeDashboard.jsx */

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './PincodeDashboard.css';

function PincodeSearch() {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const pinCodes = data.slice(1).map(row => row[0]).filter(Boolean);

      if (pinCodes.length === 0) {
        setError("No PIN codes found in file.");
        return;
      }

      setError('');
      const output = [];

      for (const pin of pinCodes) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const json = await res.json();
          const postOffices = json[0].PostOffice || [];

          postOffices.forEach((office) => {
            output.push({

              pincode: pin,
              area: office.Name,
              district: office.District,
              state: office.State,
              block: office.Block,
            });
          });
        } catch {
          output.push({ pincode: pin, area: 'Error', district: '', state: '', block: '' });
        }
      }

      setResults((prev) => [...prev, ...output]);
    };
    reader.readAsBinaryString(file);
  };

  const handleManualSearch = async () => {
    const pin = searchTerm.trim();
    if (!/^[0-9]{6}$/.test(pin)) {
      setError('Enter a valid 6-digit PIN code.');
      return;
    }

    setError('');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const json = await res.json();
      const postOffices = json[0].PostOffice || [];

      const newData = postOffices.map((office) => ({
        date: new Date().toLocaleDateString(),
        pincode: pin,
        area: office.Name,
        district: office.District,
        state: office.State,
        block: office.Block,
      }));

      const combined = [...results, ...newData].filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.pincode === item.pincode &&
              t.area === item.area &&
              t.district === item.district
          )
      );

      setResults(combined);
    } catch (err) {
      setError('Error fetching PIN code details.');
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PIN Details');
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'PincodeData.xlsx');
  };

  const filteredResults = results.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Pincode Search</h1>
      </header>

      <div className="top-controls">
        <div className="left-controls">
          <input
            type="text"
            placeholder="Search or enter a new PIN code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleManualSearch}>🔍 Search</button>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
        </div>

        <button className="export-btn" onClick={handleExport}>⬇️ Export Excel</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {filteredResults.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Pincode</th>
              <th>Area</th>
              <th>City/Taluka</th>
              <th>District</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((item, idx) => (
              <tr key={idx}>
                <td>{item.pincode}</td>
                <td>{item.area}</td>
                <td>{item.block}</td>
                <td>{item.district}</td>
                <td>{item.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PincodeSearch;