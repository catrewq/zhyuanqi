// import React, { useEffect, useState } from "react";
// import NewFileViewer from "react-file-viewer";
// import "./index.less";

// export default function FileViewer(props) {
//   const filePath = props.file;
//   const [type, setType] = useState("");
//   useEffect(() => {
//     const type = filePath.split(".")[filePath.split(".").length - 1];
//     setType(type);
//     console.log(filePath);
//   }, [filePath]);

//   const getError = (val) => {
//     console.log("err=", val);
//   };

//   return (
//     <div className="file-view">
//       {type == "png" && (
//         <div style={{ overflow: "scroll", height: "100%" }}>
//           <img alt="example" style={{ width: "100%" }} src={filePath} />
//         </div>
//       )}
//       {type !== "png" && type && (
//         <NewFileViewer
//           fileType={type}
//           filePath={filePath}
//           errorComponent={getError}
//           onError={(err) => console.log(err)}
//         />
//       )}
//     </div>
//   );
// }


// 测
// import React, { useEffect, useState } from "react";
// import FileViewer from 'react-file-viewer';
// import "./index.less";

// export default function MyFileViewer(props) {
//   const [type, setType] = useState("");

//   useEffect(() => {
//     const fileType = props.file.split('.').pop();
//     setType(fileType);
//     console.log(props.file);
//   }, [props.file]);

//   const onError = (e) => {
//     console.error('Error in file-viewer:', e);
//   };

//   return (
//     <div className="file-view">
//       {type === "png" ? (
//         <div style={{ overflow: "scroll", height: "100%" }}>
//           <img alt="example" style={{ width: "100%" }} src={props.file} />
//         </div>
//       ) : (
//         <FileViewer
//           fileType={type}
//           filePath={props.file}
//           // errorComponent={onError}
//           // onError={onError}
//         />
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { ExcelRenderer } from "react-excel-renderer";
// import "./index.less";

// const ExcelViewer = ({ filePath }) => {
//   const [cols, setCols] = useState([]);
//   const [rows, setRows] = useState([]);

//   useEffect(() => {
//     // Fetch the file
//     fetch(filePath)
//       .then(response => response.blob()) // Convert response to Blob
//       .then(blob => {
//         // Create a File from the Blob
//         const file = new File([blob], "file.xlsx", { type: blob.type });
//         // Use ExcelRenderer to parse the file
//         ExcelRenderer(file, (err, resp) => {
//           if (err) {
//             console.error(err);
//           } else {
//             setCols(resp.cols);
//             setRows(resp.rows);
//           }
//         });
//       })
//       .catch(error => console.error('Error fetching the file:', error));
//   }, [filePath]);

//   return (
//     <div>
//       <h1>Excel File Preview</h1>
//       {rows.length > 0 ? (
//         <table>
//           <thead>
//             <tr>
//               {cols.map((col, index) => (
//                 <th key={index}>{col.name}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, rowIndex) => (
//               <tr key={rowIndex}>
//                 {row.map((cell, cellIndex) => (
//                   <td key={cellIndex}>{cell}</td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// };

// export default ExcelViewer;

// import React, { useState, useEffect } from "react";
// import { ExcelRenderer } from "react-excel-renderer";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import "./index.less";

// const ExcelViewer = ({ filePath }) => {
//   const [columnDefs, setColumnDefs] = useState([]);
//   const [rowData, setRowData] = useState([]);

//   useEffect(() => {
//     fetch(filePath)
//       .then(response => response.blob())
//       .then(blob => {
//         const file = new File([blob], "file.xlsx", { type: blob.type });
//         ExcelRenderer(file, (err, resp) => {
//           if (err) {
//             console.error(err);
//           } else {
//             const cols = resp.cols.map(col => ({ headerName: col.name, field: col.name }));
//             setColumnDefs(cols);
//             setRowData(resp.rows.map(row => {
//               const rowData = {};
//               cols.forEach((col, index) => {
//                 rowData[col.field] = row[index];
//               });
//               return rowData;
//             }));
//           }
//         });
//       })
//       .catch(error => console.error('Error fetching the file:', error));
//   }, [filePath]);

//   return (
//     <div>
//       <h1>Excel File Preview</h1>
//       {rowData.length > 0 ? (
//         <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
//           <AgGridReact
//             columnDefs={columnDefs}
//             rowData={rowData}
//           />
//         </div>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// };

// export default ExcelViewer;



import React, { useState, useEffect } from "react";
import { ExcelRenderer } from "react-excel-renderer";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./index.less";

const ExcelViewers = ({ filePath }) => {
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    fetch(filePath)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], "file.xlsx", { type: blob.type });
        ExcelRenderer(file, (err, resp) => {
          if (err) {
            console.error(err);
          } else {
            const cols = resp.cols.map(col => ({ headerName: col.name, field: col.name }));
            setColumnDefs(cols);
            setRowData(resp.rows.map(row => {
              const rowData = {};
              cols.forEach((col, index) => {
                rowData[col.field] = row[index];
              });
              return rowData;
            }));
          }
        });
      })
      .catch(error => console.error('Error fetching the file:', error));
  }, [filePath]);

  return (
    <div>
      <h1>Excel File Preview</h1>
      {rowData.length > 0 ? (
        <div className="ag-theme-alpine" style={{ height: '400px', width: '100%', overflow: 'auto' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            domLayout='autoHeight'
            pagination={true}
            paginationPageSize={20}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ExcelViewers;
