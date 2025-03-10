// EditableList.js
//编辑删除 保存取消列表
// EditableList.js
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Button, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
const { Option } = Select;
const EditableList = forwardRef(({ columns, initialRows, createNewRow, isViewMode }, ref) => {
    const [rows, setRows] = useState(initialRows);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingRow, setEditingRow] = useState(null);

    // 初始化/编辑查看回显
    useEffect(() => {
        setRows(initialRows);
    }, [initialRows]);


    useImperativeHandle(ref, () => ({
        getRows: () => rows,
        resetRows: () => {
            setRows([]);//新增/取消后清空rows
            setEditingIndex(null);//新增/取消后 取消加号禁用
            setEditingRow(null);//新增/取消后 取消加号禁用
        },
    }));


    const updateEditingRow = (field, value) => {
        setEditingRow({ ...editingRow, [field]: value });
    };


    const saveRow = (index) => {
        const newRows = [...rows];
        newRows[index] = editingRow;
        setRows(newRows);
        setEditingIndex(null);
        setEditingRow(null);
    };

    const cancelEdit = () => {
        const emptyRow = columns.reduce((acc, column) => {
            acc[column.field] = '';
            return acc;
        }, {});
        setEditingRow(emptyRow);
    };


    const editRow = (index) => {
        setEditingIndex(index);
        setEditingRow({ ...rows[index] });
    };

    const deleteRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        setEditingIndex(null);
        setEditingRow(null);
    };

    const addRow = () => {
        // const newRow = createNewRow();
        // setRows([...rows, newRow]);
        // setEditingIndex(rows.length);
        // setEditingRow(newRow);
        //  添加不保存不能新增
        if (editingIndex === null) {
            const newRow = createNewRow();
            setRows([...rows, newRow]);
            setEditingIndex(rows.length);
            setEditingRow(newRow);
        }
    };

    // 添加类型数字校验
    const handleInputChange = (field, value, index) => {
        if (columns.find(col => col.field === field)?.validationType === 'number') {
            if (!/^\d*$/.test(value)) {
                message.error('请输入数字');
                return;
            }
        }
        updateEditingRow(field, value);
    };

    return (
        <table className="myTable">
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.field}>
                            <span className={column.required ? 'required' : ''}>
                                {column.title}
                            </span>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, index) => (
                    <tr key={index}>
                        {/*  columns添加type属性，区分列表input、select等 */}
                        {/* {columns.map((column) => (
                            column.field && (
                                <td key={column.field}>
                                    <Input
                                        type="text"
                                        value={editingIndex === index ? editingRow[column.field] : row[column.field]}
                                        onChange={(e) => updateEditingRow(column.field, e.target.value)}
                                        disabled={editingIndex !== index}
                                    />
                                </td>
                            )
                        ))} */}
                        {columns.map((column) => (
                            column.field && (
                                <td key={column.field}>
                                    {column.type === 'select' && (
                                        <Select
                                            value={editingIndex === index ? editingRow[column.field] : row[column.field]}
                                            // onChange={(value) => updateEditingRow(column.field, value)}
                                            onChange={(value) => { updateEditingRow(column.field, value) }}
                                            disabled={editingIndex !== index}
                                            style={{ width: '100%' }}
                                        >
                                            {column.options.map(option => (
                                                <Option key={option.value} value={option.value}>{option.label}</Option>
                                            ))}
                                        </Select>
                                    )}
                                    {column.type === 'input' && (
                                        <Input
                                            type="text"
                                            value={editingIndex === index ? editingRow[column.field] : row[column.field]}
                                            onChange={(e) => {
                                                updateEditingRow(column.field, e.target.value);
                                                handleInputChange(column.field, e.target.value);
                                            }}
                                            disabled={editingIndex !== index}
                                            addonAfter={(column.field === 'insCost' || column.field === 'compensationAmount') ? '/元' : undefined}
                                        />
                                    )}
                                </td>
                            )
                        ))}
                        <td style={{ padding: 0 }}>
                            {editingIndex === index ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        type="primary"
                                        size="middle"
                                        style={{ width: '48%', height: '100%' }}
                                        onClick={() => saveRow(index)}
                                        disabled={isViewMode ? true : false}
                                    >
                                        保存
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="middle"
                                        style={{ width: '48%', height: '100%' }}
                                        onClick={cancelEdit}
                                        disabled={isViewMode ? true : false}
                                    >
                                        取消
                                    </Button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        type="primary"
                                        size="middle"
                                        style={{ width: '48%', height: '100%' }}
                                        onClick={() => editRow(index)}
                                        disabled={isViewMode ? true : false}
                                    >
                                        编辑
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="middle"
                                        style={{ width: '48%', height: '100%' }}
                                        onClick={() => deleteRow(index)}
                                        disabled={isViewMode ? true : false}
                                    >
                                        删除
                                    </Button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                {/* <tr>
                    <td colSpan={columns.length} style={{ textAlign: 'center', border: '1px dashed #47b493' }}>
                        <Button onClick={addRow} disabled={editingIndex !== null}>
                            <PlusOutlined />
                        </Button>
                    </td>
                </tr> */}
                {!isViewMode && (
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: 'center', border: '1px dashed #47b493' }}>
                            <Button onClick={addRow} disabled={editingIndex !== null}>
                                <PlusOutlined />
                            </Button>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
});

export default EditableList;


// 使用
// App.js
// import React from 'react';
// import EditableList from './EditableList';
// import { Button } from 'antd';
// const [initialRows1, setInitialRows1] = useState([]);
// const [initialRows2, setInitialRows2] = useState([]);

// const App = () => {
// const columns1 = [
//     { field: 'duty', title: '保险责任', required: false, type: 'input' },
//     { field: 'compensationAmount', title: '保额/赔付金额', required: false, type: 'input' },
//     { field: 'addInfo', title: '附加说明', required: false, type: 'input' },
//     { field: '', title: '操作', required: false, type: 'action' },
//   ];

//   const columns2 = [
//     { field: 'jobType', title: '职业类别（伤残比例）', required: false, type: 'input' },
//     { field: 'insCost', title: '保费金额（成本）', required: false, type: 'input' },
//     {
//       field: 'costPeriod', title: '周期', required: false, type: 'select', options: [
//         { label: '年', value: 3 },
//         { label: '月', value: 2 },
//         { label: '日', value: 1 }
//       ]
//     },
//     { field: '', title: '操作', required: false, type: 'action' },
//   ];




//     const createNewRow1 = () => ({ age: '', rule: '', specialAgree: '' });
//     const createNewRow2 = () => ({ name: '', description: '' });

//     const list1Ref = React.createRef();
//     const list2Ref = React.createRef();

// const handleGetValues = () => {
//     console.log('列表1的值:', list1Ref.current.getRows());
//     console.log('列表2的值:', list2Ref.current.getRows());
//   };

// const reset = () => {
//     list1Ref.current.resetRows(); // Call resetRows to clear the rows data
//     list2Ref.current.resetRows();
// };

// useImperativeHandle(ref, () => ({
//     reset: () => reset(),
//   }));

//     return (
//         <div>
//             <h2>列表1</h2>
//             <EditableList ref={list1Ref} columns={columns1} initialRows={initialRows1} createNewRow={createNewRow1} />
//             <h2>列表2</h2>
{/* isViewMode={true} // 设置为查看模式 */ }
//             <EditableList ref={list2Ref} columns={columns2} initialRows={initialRows2} createNewRow={createNewRow2}  isViewMode={true} />
//             <Button onClick={handleGetValues}>获取两个列表的值</Button>
//         </div>
//     );
// };

// export default App;
