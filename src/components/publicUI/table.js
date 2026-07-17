import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Button, Form, Input, Space, Table } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useAntdResizableHeader } from 'use-antd-resizable-header'
import 'use-antd-resizable-header/index.css'
import { fetchList } from "src/utils/apiData";
import SearchName from "src/utils/apiEnum";
import FixHeader from 'src/layouts/FixHeader';
// 封装一个列表（查询）新增，修改，导出，失效与否的基础模板
// 1.3记，后面再修改完善
const CustomTable = React.forwardRef(({ url, columns, crumbs, searchForm, renderActions, rowSelection, initialValues, getPostData }, ref) => {
  const [firstRender, setFirstRender] = useState(true);
  const [form] = Form.useForm();
  const [reset, setReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [datas, setData] = useState({});
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


  // 直接传 url，是因为后端统一了接口定义，一般不建议这样搞
  const query = () => {
    getData();
  };

  const getData = async () => {
    // setLoading(true);

    let obj = getPostData(form),
      postData = {
        ...obj,
        ...pages,
        // roleId: roleId,
      };
    console.log(postData);
    // setData({
    //   data: mockData,
    //   total: mockData.length,
    // })
    const fetchData = (postData) => {
      setLoading(true);
      const start = (pages.page - 1) * pages.limit;
      const length = pages.limit;
      fetchList(start, length, url, postData)
        .then((response) => {
          const { count } = response.data;
          // 避免查询空格时，返回的数据不是数组
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

  useEffect(() => {
    if (!firstRender) {
      query();
    }
    console.log(url);
    setFirstRender(false);
  }, [pages.page, pages.limit, firstRender]);

  useEffect(() => {
    if (reset) {
      query();
      setReset(false);
    }
  }, [reset]);

  useImperativeHandle(ref, () => ({
    reset: () => query(),
  }));

  const { components, resizableColumns, tableWidth } = useAntdResizableHeader({
    columns: useMemo(() => columns, []),
    minConstraints: 50,
  })

  return (
    <div>
      {/* 自定义列表crumbs ，传值crumbs */}
      <FixHeader  />
      {/* 搜索栏 */}
      {searchForm && (
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
            // 自定义搜索表单的初始值
            initialValues={initialValues}
          >
            {/* 自定义查询表达单 ，传值searchForm */}
            {/* {searchForm} */}
            <div className="inner">
              {searchForm}
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
                </Space>
              </div>
            )}
          </Form>
        </div>
      )}
      {/* 列表 */}
      <div className="common-table">
        <div className="common-summary">
          <div className="total">
            筛选结果总数：<b>{datas.count}</b>份
          </div>
          {/* 自定义操作，比如新增，失效，有效 */}
          {renderActions}
        </div>
        <Table
          bordered
          size="small"
          rowKey="id"
          rowSelection={rowSelection}
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

export default CustomTable;

// 使用
// import React from 'react';
// import CustomTable from './CustomTable'; // 你的CustomTable组件的路径

// function App() {
//   const columns = [
//     {
//       dataIndex: 'userName',
//       width: 200,
//       title: '姓名',
//       ellipsis: true,
//       sorter: (a, b) => a.userName.localeCompare(b.userName),
//     },
//     // 更多列...
//   ];

//   // 定义searchForm
//   const searchForm = (
//     <div className={`common-search${collapsed ? ' common-search-collapsed' : ''}`}>
//       <Form
//         colon={false}
//         className="form clearfix"
//         form={form}
//         labelAlign="right"
//         name="search_form"
//         layout="vertical"
//         size="large"
//       >
//         {/* 表单项... */}
//       </Form>
//     </div>
//   );

//   return (
//     <div className="App">
//       <CustomTable url="/system/user/role/setting/user" columns={columns} roleId="yourRoleId" searchForm={searchForm} />
//     </div>
//   );
// }

// export default App;





