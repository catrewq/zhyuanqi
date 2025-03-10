import { Button, Form, Input, Space, Table, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useAntdResizableHeader } from 'use-antd-resizable-header'
import React, { useState, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react'
import { fetchList } from "src/utils/apiData";
import axios from 'src/utils/axios';
import SearchName from "src/utils/apiEnum";
import { createSorter } from "src/utils/util";
import { apis } from "src/utils/apis"
import { filterQueryObject } from "src/utils/util";
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
const CustomerList = forwardRef(({ onData, roleId, parentMethod }, ref) => {
  const [firstRender, setFirstRender] = useState(true);
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [reset, setReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datas, setData] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 如查询条件过多，需使用post请求
  const [pages, setPages] = useState({
    page: 1,
    limit: 10,
  });

  const handleReset = () => {
    form.resetFields();
    if (pages.page === 1) {
      setReset(true);
    } else {
      setPages({
        ...pages,
        page: 1,
      });
    }
  };

  const query = () => {
    getData();
  };

  const getData = async () => {
    setLoading(true);

    let obj = getPostData(),
      postData = {
        ...obj,
        ...pages,
        roleId: 13,
      };
    console.log(postData);
    const fetchData = (postData) => {
      setLoading(true);
      const start = (pages.page - 1) * pages.limit;
      const length = pages.limit;
      fetchList(start, length, "/system/user/role/setting/person", postData)
        .then((response) => {
          const { count } = response.data;
          if (Array.isArray(response?.data?.data)) {
            setData(response?.data);
          }
          setLoading(false);
          setPages({
            ...pages,
            total: count,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchData(postData);
  };

  // const getPostData = () => {
  //   let obj = { ...form.getFieldsValue(true) };
  //   // 考虑要不要写一个通用工具类
  //   const newObj = {};
  //   for (const [key, value] of Object.entries(obj)) {
  //     if (value !== undefined && value !== null && value !== "") {
  //       newObj[`${SearchName.LIKE}_${key}`] = value;
  //     }
  //   }
  //   return newObj;
  // };

  const getPostData = () => {
    let obj = { ...form.getFieldsValue(true) };
    const filteredObj = filterQueryObject(obj);
    const newObj = QueryUtil.get(filteredObj, query);
    console.log(newObj);
    return newObj;
  };


  const handleClick = (record) => {
    setSelectedRowKeys((prev) => {
      const newItem = { id: record.id, name: record.name, roleName: record.roleName, roleNo: record.roleNo, personId: record.personId };
      prev = Array.isArray(prev) ? prev : [];
      let newSelectedRowKeys;
      if (!prev.some(item => item.personId === newItem.personId)) {
        newSelectedRowKeys = [newItem];
      }
      onData(newSelectedRowKeys);
      return newSelectedRowKeys;
    });
    parentMethod();
  };

  const handleSelectRows = () => {
    parentMethod();
  }

  const handleClose = () => {
    setSelectedRowKeys([]);
  };

  useImperativeHandle(ref, () => ({
    close: () => handleClose(),
  }));

  useEffect(() => {
    if (!firstRender) {
      query();
    }
    setFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.page, pages.limit, firstRender]);

  useEffect(() => {
    if (reset) {
      query();
      setReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);


  const { components, resizableColumns, tableWidth } = useAntdResizableHeader({
    columns: useMemo(() => {
      const columns = [
        {
          dataIndex: 'name',
          width: 100,
          title: '客户姓名',
          ellipsis: true,
          sorter: createSorter('name'),
        },
        {
          dataIndex: 'bizCenterName',
          width: 100,
          title: '业务中心',
          ellipsis: true,
          sorter: createSorter('bizCenterName'),
        },
        {
          dataIndex: 'regionName',
          width: 100,
          title: '大区/事业部',
          ellipsis: true,
          sorter: createSorter('regionName'),
        },
        {
          dataIndex: 'roleName',
          width: 100,
          title: '角色名称',
          ellipsis: true,
          sorter: createSorter('roleName'),
        },
        {
          key: 'action',
          width: 100,
          render: (_, record) => {
            return (
              <Button type="link" size="small" onClick={() => handleClick(record)}>
                选择
              </Button>
            );
          },
          title: '操作',
        },
      ];
      return columns;
    }, []),
    minConstraints: 50,
  })

  return (
    <div className="City">
      <div
        className={`common-search${collapsed ? ' common-search-collapsed' : ''
          }`}
      >
        <Form
          colon={false}
          className="form clearfix"
          form={form}
          labelAlign="right"
          name="search_form"
          layout="vertical"
          size="large"
        >
          <div className="inner">
            <Form.Item label="客户姓名" name="name" className='search-style'>
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="业务中心" name="bizCenterName" className='search-style'>
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="大区/事业部" name="regionName" className='search-style'>
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            {collapsed && (
              <div className="trigger" onClick={() => setCollapsed(false)}>
                <DownOutlined />
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="buttons">
              <Space>
                <Button
                  type="link"
                  size="middle"
                  onClick={() => setCollapsed(true)}
                >
                  收起
                </Button>
                <Button
                  size="middle"
                  className="reset-btn"
                  onClick={handleReset}
                >
                  重置
                </Button>
                <Button
                  type="primary"
                  size="middle"
                  onClick={() => {
                    if (pages.page === 1) {
                      query();
                    } else {
                      setPages({
                        ...pages,
                        page: 1,
                      });
                    }
                  }}
                >
                  查询
                </Button>
                {/* <Button
                  size="middle"
                  className="reset-btn"
                  onClick={handleSelectRows}
                  disabled={!selectedRowKeys.length}
                >
                  选择
                </Button> */}
              </Space>
            </div>
          )}
        </Form>
      </div>

      <div className="common-table">
        <Table
          bordered
          size="small"
          rowKey={(record) => record.personId}
          // onRow={(record) => ({
          //   onClick: () => handleClick(record),
          // })}
          // rowClassName={(record) => (selectedRowKeys.some(item => item.personId === record.personId) ? 'selected-row' : '')}
          columns={resizableColumns}
          components={components}
          dataSource={datas.data}
          pagination={{
            size: 'default',
            position: ['bottomCenter'],
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            current: pages.page,
            pageSize: pages.limit,
            showTotal: (total) => `共 ${total} 项`,
            total: pages.total,
            onChange: (page, pageSize) => {
              if (pageSize !== pages.limit) {
                setPages({
                  page: 1,
                  limit: pageSize,
                });
              } else {
                setPages({
                  ...pages,
                  page,
                });
              }
            },
          }}
          scroll={{ x: tableWidth }}
          loading={loading}
        />
      </div>
    </div>
  );
});

export default CustomerList;