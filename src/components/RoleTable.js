import { Button, Input, message, Modal, Select } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { fetchList } from '../utils/apiData';
import axios from '../utils/axios';
import { filterEmptyValues, findItemInList } from '../utils/util';
import "./RoleTable.less";
const { confirm } = Modal;
const { Option } = Select;
const Table = forwardRef(({ roleId, modalVisible, showButtons }, ref) => {
  const [firstRender, setFirstRender] = useState(true);//是否第一次渲染
  const [roleList, setRoleList] = useState([]);
  const [rows, setRows] = useState([
    // { select: 'option1', input1: '', input2: '' }
  ]);
  const BTN_STABLE = 'commitbtn';
  const BTN_CANCEL = 'cancelbtn';

  // 角色管理新增删除
  const [adRe, setAdRe] = useState({
    bntAdd: BTN_CANCEL,
    // bntRemove: BTN_CANCEL,
    rowRemove: BTN_CANCEL
  });

  const operates = {
    'ADD': 'bntAdd',
    // 'REMOVE': ['bntRemove', 'rowRemove']
    'REMOVE': 'rowRemove'
  }

  const [addedRows, setAddedRows] = useState([]);
  const [disabledBtn, setDisabledBtn] = useState(false);
  // const [deletedRows, setDeletedRows] = useState([]);
  const [rowRemove, setRowRemove] = useState([]);
  const [deleteRow_callbacks, setDeleteRowCallbacks] = useState([]);
  const [perList, setPerList] = useState([]);
  const [isClicks, setIsClicks] = useState(false);
  const [sortDirection, setSortDirection] = useState({
    select: true,
    input1: true,
    input2: true
  });
  const columns = [
    { field: 'select', title: '角色新增', required: true },
    { field: 'input2', title: '角色描述', required: false },
    { field: '', title: '操作', required: false },
  ]

  const addRow = () => {
    setAdRe({
      bntRemove: BTN_CANCEL,
      bntAdd: BTN_STABLE,
      rowRemove: BTN_CANCEL
    })
    const newRow = { select: '', input2: '' };
    setRows([...rows, newRow]);
    setAddedRows([...addedRows, newRow]);
    setDisabledBtn(false);
  };

  // const deleteLastRow = () => {
  //   setAdRe({
  //     bntAdd: BTN_CANCEL,
  //     bntRemove: "primary",
  //     rowRemove: BTN_CANCEL
  //   })
  //   confirm({
  //     content: (
  //       <div>
  //         <p>{'是否确认删除最后一行角色设置'}</p>
  //       </div>
  //     ),
  //     onOk() {
  //       const newRows = [...rows];
  //       const deletedRow = newRows.pop();
  //       setRows(newRows);
  //       setDeletedRows([...deletedRows, deletedRow]);
  //       console.log(deletedRow);
  //       setDeleteRowCallbacks([deletedRow]);
  //     },
  //     width: "400px",
  //   });
  // };

  const deleteRow = (index) => {
    setAdRe({
      bntAdd: BTN_CANCEL,
      bntRemove: BTN_CANCEL,
      rowRemove: BTN_STABLE
    })
    confirm({
      content: (
        <div>
          <p>{'是否确认删除该行角色设置'}</p>
        </div>
      ),
      onOk() {
        const newRows = [...rows];
        const deletedRow = newRows.splice(index, 1)[0];
        setRows(newRows);
        setRowRemove([...rowRemove, deletedRow]);
        setDeleteRowCallbacks([deletedRow]);
      },
      width: "400px",
    });
  };

  const updateRow = (index, column, value) => {
    const newRows = [...rows];
    newRows[index][column] = value;
    if (column === 'select') {
      const findItem = findItemInList(perList, 'id', value);
      console.log(findItem);
      if (findItem) {
        newRows[index].input2 = findItem.description;
      }

    }
    setRows(newRows);
  };


  const reset = () => {
    setDeleteRowCallbacks([]);
    setIsClicks(true);
    // setRows(rows.filter(row => !addedRows.includes(row)));
    // 测1
    // 删去新增但未保存的
    let filterRows = rows.filter(row => !addedRows.includes(row));
    //还原删除（但未保存的）
    if (isClicks) {
      // setRows(filterRows.concat(deleteRow_callbacks));
      let rowsByClicks = filterRows.concat(deleteRow_callbacks);
      let filter = rowsByClicks.filter(row => !addedRows.includes(row));
      setRows(filter);
    } else {
      setRows(filterRows);
    }
    setAddedRows([]);
    setRowRemove([]);
    setAdRe({
      bntAdd: BTN_CANCEL,
      bntRemove: BTN_CANCEL,
    })
  };

  useImperativeHandle(ref, () => ({
    reset: () => reset(),
  }));


  function updatePersonList(add, remove) {
    const ADD = 'ADD';
    const REMOVE = 'REMOVE';

    setRoleList(prevList => {
      let newList = [...prevList];

      if (add && Array.isArray(add)) {
        for (let item of add) {
          newList.push({
            ...item,
            oprInfo: {
              operate: ADD
            }
          });
        }
      }

      if (remove && Array.isArray(remove)) {
        for (let item of remove) {
          newList.push({
            ...item,
            oprInfo: {
              operate: REMOVE
            }
          });
        }
      }

      return newList;
    });
  }


  const save = async () => {
    console.log(rows);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < columns.length; j++) {
        const column = columns[j];
        if (column.required && (row[column.field] === undefined || row[column.field] === null || row[column.field] === '')) {
          if (typeof row[column.field] === 'boolean') {
            // 如果row[column.field]的值为布尔类型（即true或false），则不触发错误消息
          } else {
            message.error(`第${i + 1}行：请填写${column.title}！`);
            return;
          }
        }
      }
    }
    // if (rows.some(row => row.select === '' || row.input2 === '')) {
    //   message.error("请将角色表格补充完整！")
    //   return;
    // }
    let operate;
    let list;
    Object.keys(operates).forEach(u => {
      let value = operates[u];
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (adRe[v] === BTN_STABLE) {
            operate = u;
          }
        });
      } else {
        if (adRe[value] === BTN_STABLE) {
          operate = u;
        }
      }
    });
    console.log(operate);
    console.log(addedRows);
    console.log(rowRemove);
    // 原
    const operateList = {
      [JSON.stringify(filterEmptyValues(addedRows))]: 'bntAdd',
      // [JSON.stringify(filterEmptyValues(deletedRows))]: 'bntRemove',
      [JSON.stringify(rowRemove)]: 'rowRemove',
    }
    Object.keys(operateList).forEach(u => {
      if (adRe[operateList[u]] === BTN_STABLE) {
        list = JSON.parse(u);
      }
    })
    console.log(list);
    if (list === undefined) {
      list = rows;
    }

    // let result = {
    //   "refs": list?.map(function (item) {
    //     return {
    //       "userPostId": roleId,  // 这里的roleId应该是一个变量，但在你的问题中没有给出具体的值
    //       "roleId": Number(item.select),
    //       "description": item.input2,
    //       "oprInfo": {
    //         "operate": operate  // 这里的operate应该是一个变量，但在你的问题中没有给出具体的值
    //       }
    //     };
    //   })
    // };

    let result = {
      "refs": list?.map(function (item) {
        if (Number(item.select) !== 0) {  // 过滤掉roleId为0的数据
          return {
            "userPostId": roleId,  // 这里的roleId应该是一个变量，但在你的问题中没有给出具体的值
            "roleId": Number(item.select),
            "description": item.input2,
            "oprInfo": {
              "operate": operate  // 这里的operate应该是一个变量，但在你的问题中没有给出具体的值
            }
          };
        }
      }).filter(Boolean)  // 过滤掉undefined的元素
    };
    console.log(result);

    // 定义操作类型 add remove
    const ADD = 'ADD';
    const REMOVE = 'REMOVE';

    // 处理添加的元素
    let addList = addedRows && Array.isArray(addedRows) ? addedRows.map(item => ({
      ...item,
      // userPostId: roleId,
      oprInfo: {
        operate: ADD
      }
    })) : [];

    // 处理删除的元素
    let removeList = rowRemove && Array.isArray(rowRemove) ? rowRemove.map(item => ({
      ...item,
      // userPostId: roleId,
      oprInfo: {
        operate: REMOVE
      }
    })) : [];

    // 合并数组
    // let roleList = [...addList, ...removeList];
    // console.log(roleList);
    // let roleList = [...addList, ...removeList].map(item => ({
    //   ...item,
    //   userPostId: roleId,
    //   roleId: Number(item.select)
    // }));

    let roleList = [...addList, ...removeList].map(item => {
      let { select, ...rest } = item;
      return {
        ...rest,
        userPostId: roleId,
        roleId: Number(select)
      };
    });
    let res = { refs: roleList }

    console.log(res);
    //  add remove
    const { data } = await axios({
      url: "/system/user/role/setting/positions/set",
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(res),
    });
    if (data.success) {
      message.success('操作成功');
      setAddedRows([]);
      setRowRemove([]);
      setIsClicks(false);
      setAdRe({
        bntAdd: BTN_CANCEL,
        bntRemove: BTN_CANCEL,
      })
    } else if (data.message == "任职不存在") {
      setRows(rows.filter(row => !addedRows.includes(row)));
      setAddedRows([]);
      setRowRemove([]);
    } else {
      message.error(data.message)
      setRows(rows.filter(row => !addedRows.includes(row)));
      setAddedRows([]);
      setRowRemove([]);
    }
  };

  const sortRows = (column) => {
    const newSortDirection = !sortDirection[column];
    const newRows = [...rows].sort((a, b) => {
      if (a[column] < b[column]) return newSortDirection ? -1 : 1;
      if (a[column] > b[column]) return newSortDirection ? 1 : -1;
      return 0;
    });
    setRows(newRows);
    setSortDirection({ ...sortDirection, [column]: newSortDirection });
  };

  useEffect(() => {
    if (!firstRender) {
      console.log('roleId', roleId);
      console.log('modalVisible', modalVisible);
      if (roleId && modalVisible) {
        let userPostId = { userPostId: roleId };
        console.log(userPostId);
        fetchList(0, 200, "/system/user/role/setting/positions", userPostId)
          .then((response) => {
            // 测2
            const newRows = response?.data?.data?.filter(item => 'roleId' in item).map(item => ({
              select: item.roleId,
              // input1: item.roleNo,
              input2: item.description
            }));
            setRows(newRows);
            setDisabledBtn(true);
            const handleRoleList = async () => {
              fetchList(0, 200, "/system/role/")
                .then((response) => {
                  setPerList(response?.data?.data?.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description
                  })));
                })
                .catch((error) => {
                  console.error(error);
                });
            };
            handleRoleList();

          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    setFirstRender(false);
  }, [roleId, modalVisible, firstRender]);



  return (
    <div>
      {!showButtons && (
        <div className='btns'>
          <Button
            type={adRe.bntAdd}
            className={BTN_STABLE}
            onClick={addRow}>
            新增
          </Button>
          <Button
            style={{ marginLeft: "550px" }}
            className={Object.values(adRe).includes(BTN_STABLE) ? BTN_CANCEL : BTN_CANCEL}
            disabled={!Object.values(adRe).includes(BTN_STABLE)}
            onClick={save}>
            保存
          </Button>
        </div>
      )}
      <table className="myTable">
        <thead>
          <tr>
            {/* <th style={{ cursor: 'pointer' }} onClick={() => sortRows('select')}>角色新增 {sortDirection.select ? <UpOutlined /> : <DownOutlined />}</th>
            <th style={{ cursor: 'pointer' }} onClick={() => sortRows('input2')}>角色描述 {sortDirection.input2 ? <UpOutlined /> : <DownOutlined />}</th>
            {!showButtons && (
              <th style={{ cursor: 'pointer' }} >操作</th>
            )} */}
            {/* <th style={{ cursor: 'pointer' }} ></th> */}
            {columns.map((column) => (
              <th key={column.field}>
                <span className={column.required ? 'required' : ''} onClick={() => sortRows(column.field)} style={{ whiteSpace: 'nowrap' }}>
                  {column.title} {sortDirection[column.field] ? '▲' : '▼'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.map((row, index) => (
            <tr key={index}>
              <td>
                <Select
                  value={row.select}
                  allowClear
                  placeholder="请选择"
                  onChange={(e) => updateRow(index, 'select', e)}
                  style={{ width: '100%' }}
                  disabled={showButtons}
                >
                  <option value="" disabled hidden>请选择</option>
                  {Array.isArray(perList) && (
                    perList.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))
                  )}
                </Select>
              </td>
              <td><Input placeholder="请输入" value={row.input2} disabled={showButtons} onChange={(e) => updateRow(index, 'input2', e.target.value)} /></td>
              {!showButtons && (
                <td style={{ padding: 0 }}>
                  <Button
                    type={adRe.rowRemove}
                    size="middle"
                    style={{
                      border: '1px solid #47b493',
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    }}
                    onClick={() => deleteRow(index)}
                  >
                    删除
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default Table;

