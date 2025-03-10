import { Button, Form, Input, Space, Table, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useAntdResizableHeader } from 'use-antd-resizable-header'
import React, { useState, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react'

import { fetchList } from "src//utils/apiData";
import SearchName from "src//utils/apiEnum";
import { createSorter } from "src//utils/util";
// import '../components/customerList.less';
const CustomerList = forwardRef(({ onData, parentMethod }, ref) => {
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
      };

    const fetchData = (postData) => {
      setLoading(true);
      const start = (pages.page - 1) * pages.limit;
      const length = pages.limit;
      fetchList(start, length, "/tax/ent/customer", postData)
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

  const getPostData = () => {
    let obj = { ...form.getFieldsValue(true) };
    // 考虑要不要写一个通用工具类
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && value !== "") {
        newObj[`${SearchName.LIKE}_${key}`] = value;
      }
    }
    return newObj;
  };

  const handleClick = (record) => {
    console.log(record);
    setSelectedRowKeys((prev) => {
      const newItem = { accountId: record.accountId, name: record.name };
      if (!prev.some(item => item.accountId === newItem.accountId) && prev.length < 2) {
        return [newItem];
      } else if (prev.length >= 2) {
        message.error('最多选择一个合同');
      }
      return prev;
    });
  };

  const handleSelectRows = () => {
    // let result = [];
    // console.log(selectedRowKeys);
    parentMethod();
    // setSelectedRowKeys([]);
  }

  const handleClose = () => {
    onData(selectedRowKeys);
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
          title: '客户名称',
          ellipsis: true,
          // sorter: createSorter('name'),
        },
        // {
        //   title: '操作',
        //   key: 'action',
        //   render: (text, record) => (
        //     <Button onClick={() => handleClick(record)}>
        //       选择
        //     </Button>
        //   ),
        // },

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
            <Form.Item label="姓名" name="name" >
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
                <Button
                  size="middle"
                  className="reset-btn"
                  onClick={handleSelectRows}
                  disabled={!selectedRowKeys.length}
                >
                  选择
                </Button>
              </Space>
            </div>
          )}
        </Form>
      </div>

      <div className="common-table">
        <Table
          bordered
          size="small"
          rowKey={(record) => record.accountId}
          onRow={(record) => ({
            onClick: () => handleClick(record),

          })}
          rowClassName={(record) => (selectedRowKeys.some(item => item.accountId === record.accountId) ? 'selected-row' : '')}
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