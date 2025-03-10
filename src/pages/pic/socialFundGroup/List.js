import { DownOutlined } from '@ant-design/icons';
import OSS from 'ali-oss';
import { Button, Form, Input, message, Select, Space, Table } from 'antd';
import moment from 'moment';
import { dateFormat } from 'src/utils/dateFormatDayjs';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchDownload, fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import getOssToken from 'src/utils/getOssToken';
import { useTabNavigate } from 'src/utils/navigateUtil';
import { groupTypeList, reportFerqTypeList, suspendFerqTypeList } from './data';
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
import { filterQueryObject } from "src/utils/util";
//const crumbs = ['社保公积金组维护', '列表'];

const List = () => {
  const navigate = useTabNavigate(); 
  const [form] = Form.useForm();
  const [clientOSS, setClientOSS] = useState({});
  const [firstRender, setFirstRender] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [reset, setReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [datas, setDatas] = useState([]);
  const [cityList, setCityList] = useState([]);

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
        // ...pages,
      },
      start = (pages.page - 1) * pages.limit,
      length = pages.limit;
    const { data } = await fetchList(start, length, `${apis.group}`, postData);
    const { count } = data;
    setTotal(count);
    setDatas(data.data);
    setLoading(false);
  };

  // const getPostData = () => {
  //   let obj = { ...form.getFieldsValue(true) };
  //   // 考虑要不要写一个通用工具类
  //   const newObj = {};
  //   for (const [key, value] of Object.entries(obj)) {
  //     if (value !== undefined && value !== null && value !== '') {
  //       newObj[`${SearchName.LIKE}_${key}`] = value;
  //     }
  //   }
  //   return newObj;
  // };

  const getPostData = () => {
    let obj = { ...form.getFieldsValue(true) };

    // 构建查询条件
    const query = [
      { f: "cityId", q: QueryOperator.EQ },
      { f: "groupType", q: QueryOperator.EQ },
      { f: "reportFerqType", q: QueryOperator.EQ },
      { f: "suspendFerqType", q: QueryOperator.EQ },
    ];

    const filteredObj = filterQueryObject(obj);
    const newObj = QueryUtil.get(filteredObj, query);
    console.log(newObj);
    return newObj;
  };

  const getFile = async (fileName) => {
    const url = await clientOSS.signatureUrl(fileName, {
      'content-disposition': `attachment; filename=${encodeURIComponent(
        fileName
      )}`,
    });
    window.open(url);
  };

  const handleExport = async () => {
    let postData = getPostData();
    const { data } = await fetchDownload(postData, `${apis.group}`);
    if (data.success) {
      getFile(data.data);
    } else {
      message.error(data.message);
    }
  };

  const toAdd = () => {
    navigate('./add', {
      subTitle: "新增"
    });
  };

  const toEdit = (id, name) => {
    navigate('./add', {
      add: true,
      subPath: id,
      subTitle: "修改:" + name,
      state: {
        id,
      },
    });
  };

  const toView = (id, name) => {
    navigate('./view', {
      add: true,
      subPath: id,
      subTitle: ":" + name,
      state: {
        id,
      },
    });
  };

  useEffect(() => {
    if (!firstRender) {
      const getToken = async () => {
        const res = await getOssToken();
        const obj = new OSS(res);
        setClientOSS(obj);
      };
      getToken();

      const getList = async () => {
        const { data } = await fetchList(0, 200, `${apis.city}`);
        setCityList(data.data);
      };
      getList();
    }
    setFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  useEffect(() => {
    if (!firstRender) {
      query();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.page, pages.limit, firstRender]);

  useEffect(() => {
    if (reset) {
      query();
      setReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const columns = [
    {
      dataIndex: 'number',
      fixed: 'left',
      title: '组编号',
    },
    {
      dataIndex: 'name',
      fixed: 'left',
      title: '组名称',
    },
    {
      dataIndex: 'cityName',
      title: '城市',
    },
    {
      dataIndex: 'groupTypeName',
      title: '组类别',
    },
    {
      dataIndex: 'reportFerqTypeName',
      title: '申报频率',
    },
    {
      dataIndex: 'suspendFerqTypeName',
      title: '停办频率',
    },
    {
      dataIndex: 'makeUpCtbFerqTypeName',
      title: '补缴频率',
    },
    {
      dataIndex: 'yearlyAdjMonth',
      title: '年度调整月',
    },
    {
      dataIndex: 'repDeadLineDate',
      title: '办理截止日',
    },
    {
      dataIndex: 'susDeadLineDate',
      title: '停办截止日',
    },
    {
      dataIndex: 'isOverDuePay',
      render: (text) => (text ? '是' : '否'),
      title: '是否有滞纳金',
    },
    {
      dataIndex: 'creatorName',
      title: '创建人',
    },
    {
      dataIndex: 'createTime',
      // render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      render: (text) => (dateFormat(text, "YYYY-MM-DD HH:mm:ss")),
      title: '创建时间',
    },
    {
      dataIndex: 'lastUpdateUserName',
      title: '更新人',
    },
    {
      dataIndex: 'lastUpdateTime',
      // render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      render: (text) => (dateFormat(text, "YYYY-MM-DD HH:mm:ss")),
      title: '更新时间',
    },
    {
      fixed: 'right',
      key: 'action',
      render: (_, record) => {
        return (
          <Space>
            <Button type="link" size="small" onClick={() => toView(record.id, record.name)}>
              查看
            </Button>
            <Button type="link" size="small" onClick={() => toEdit(record.id, record.name)}>
              修改
            </Button>
          </Space>
        );
      },
      title: '操作',
    },
  ];

  return (
    <div className="list-page">
      {/* <FixHeader crumbs={crumbs} /> */}

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
          initialValues={{ insType: undefined }}
        >
          <div className="inner">
            <Form.Item label="城市" name="cityId">
              <Select
                fieldNames={{
                  label: 'name',
                  value: 'id',
                }}
                filterOption={(input, option) =>
                  (option?.name ?? '').includes(input)
                }
                optionFilterProp="children"
                options={cityList}
                showSearch
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item label="组名称" name="name">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="组类别" name="groupType">
              <Select options={groupTypeList} placeholder="请选择" allowClear />
            </Form.Item>
            <Form.Item label="申报频率" name="reportFerqType">
              <Select
                options={reportFerqTypeList}
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item label="停办频率" name="suspendFerqType">
              <Select
                options={suspendFerqTypeList}
                placeholder="请选择"
                allowClear
              />
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
              </Space>
            </div>
          )}
        </Form>
      </div>

      <div className="common-table">
        <div className="common-summary">
          <div className="total">
            筛选结果总数：<b>{total}</b>份
          </div>
          <div className="buttons">
            <Space>
              <Button type="primary" onClick={toAdd}>
                新增
              </Button>
              <Button type="primary" ghost onClick={handleExport}>
                导出数据
              </Button>
            </Space>
          </div>
        </div>

        <Table
          bordered
          columns={columns}
          dataSource={datas}
          loading={loading}
          pagination={{
            size: 'default',
            position: ['bottomCenter'],
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            current: pages.page,
            pageSize: pages.limit,
            showTotal: (total) => `共 ${total} 项`,
            total,
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
          rowKey="id"
          scroll={{ x: 'max-content' }}
          size="small"
        // sticky
        />
      </div>
    </div>
  );
};

export default List;
