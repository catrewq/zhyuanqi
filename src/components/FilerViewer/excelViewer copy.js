import React, { useState, useEffect } from "react";
import { ExcelRenderer } from "react-excel-renderer";
import { Button } from "antd";
import "./excelViewer.css";

const ExcelViewer = ({ filePath }) => {
  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(filePath)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], "file.xlsx", { type: blob.type });
        ExcelRenderer(file, (err, resp) => {
          if (err) {
            console.error(err);
          } else {
            setCols(resp.cols);
            setRows(resp.rows);
            setLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching the file:', error);
        setLoading(false);
      });
  }, [filePath]);

  const handleDownload = () => {
    window.location.href = filePath;
  };

  return (
    <div className="excel-viewer">
      <div className="header">
        <h1>Excel 文件预览</h1>
        <Button onClick={handleDownload} style={{ marginLeft: '20px' }}>下载附件</Button>
      </div>
      {loading ? (
        <p>加载中...</p>
      ) : rows.length > 0 ? (
        <div className="table-container">
          <table className="excel-table">
            <thead>
              <tr>
                {cols.map((col, index) => (
                  <th key={index}>{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>没有数据可显示</p>
      )}
    </div>
  );
};

export default ExcelViewer;