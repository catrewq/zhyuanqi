import { DownOutlined } from '@ant-design/icons';
import OSS from 'ali-oss';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tooltip
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import apis from 'src/utils/apiBravo';
import { fetchDownload, fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import axios from 'src/utils/axios';
import getOssToken from 'src/utils/getOssToken';
import { useTabNavigate } from 'src/utils/navigateUtil';
import { getGenericStatus } from 'src/utils/util';
import Customer from './components/Customer';
import { accountTypes, accountTypesMap } from './data';
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
import { filterQueryObject } from "src/utils/util";

//const crumbs = ['社保套餐维护', '列表'];
const { confirm } = Modal;

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
  const [sfUnionCustList, setSfUnionCustList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [residenceTypeList, setResidenceTypeList] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const initialValues = {
    baseStatus: 0,
  }

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

  const setQueryData = (clear) => {
    let obj = {};
    if (clear) {
      obj.form = {};
      obj.pages = {
        page: 1,
        limit: 10,
      };
      sessionStorage.removeItem('socialFundPackage');
    } else {
      obj.form = form.getFieldsValue(true);
      obj.pages = { ...pages };
      sessionStorage.setItem('socialFundPackage', JSON.stringify(obj));
    }
  };

  const query = () => {
    setQueryData();
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
    const { data } = await fetchList(
      start,
      length,
      `${apis.package}`,
      postData
    );
    const { count } = data;
    setTotal(count);
    setDatas(data.data);
    setLoading(false);
  };

  // const getPostData = () => {
  //   let obj = { ...form.getFieldsValue(true) };
  //   delete obj.residenceTypeId;
  //   // 考虑要不要写一个通用工具类
  //   const newObj = {};
  //   for (const [key, value] of Object.entries(obj)) {
  //     if (value !== undefined && value !== null && value !== '') {
  //       if (key === 'residenceTypeName') {
  //         newObj[`${SearchName.IN}_${key}`] = value;
  //       } else {
  //         newObj[`${SearchName.EQ}_${key}`] = value;
  //       }
  //     }
  //   }

  //   if (Array.isArray(newObj[`${SearchName.IN}_residenceTypeName`]) && newObj[`${SearchName.IN}_residenceTypeName`].length === 0) {
  //     delete newObj[`${SearchName.IN}_residenceTypeName`];
  //   }
  //   return newObj;
  // };


  const getPostData = () => {
    let obj = { ...form.getFieldsValue(true) };

    // 构建查询条件
    const query = [
      { f: "cityId", q: QueryOperator.EQ },
      { f: "residenceTypeId", q: QueryOperator.IN },
      { f: "isStandradPackage", q: QueryOperator.EQ },
      { f: "sfUnionCustSrcType", q: QueryOperator.EQ },
      { f: "sfUnionCustId", q: QueryOperator.EQ },
      { f: "baseStatus", q: QueryOperator.EQ },
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
    const { data } = await fetchDownload(postData, `${apis.package}`);
    if (data.success) {
      getFile(data.data);
    } else {
      message.error(data.message);
    }
  };

  const toAdd = () => {
    navigate('./add', {
      subTitle: "新增"
    }
    );
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

  const toSet = (id, name) => {
    navigate('./set', {
      add: true,
      subPath: id,
      subTitle: "设置:" + name,
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

  const [rows, setRows] = useState([]);
  const [keys, setKeys] = useState([]);
  const rowSelection = {
    fixed: 'left',
    selectedRowKeys: keys,
    onChange: (selectedRowKeys, selectedRows) => {
      setRows(selectedRows);
      setKeys(selectedRowKeys);
    },
    width: '50',
  };

  // 启用/禁用
  const confirmUpdate = (status) => {
    confirm({
      content: <p>请确认是否{status ? '启用' : '禁用'}？</p>,
      onOk() {
        return new Promise((resolve, reject) => {
          const res = handleUpdate(resolve, reject, status);
          return res;
        }).catch((err) => {
          // console.log(err);
        });
      },
      width: '400px',
      wrapClassName: 'SocialFundPackage-modal',
    });
  };

  const handleUpdate = async (resolve, reject, status) => {
    const data = await axios({
      data: JSON.stringify(keys),
      headers: { 'Content-Type': 'application/json' },
      method: 'put',
      url: `${apis.package}/${status ? 'enable' : 'disable'}/batch`,
    });
    if (data.data.success === false) {
      message.error(data.data.message);
      reject();
    } else {
      const { totalCount, successCount, failedCount } = data.data;
      message.success(
        `操作成功，总计${totalCount}条，成功${successCount}条，失败${failedCount}条。`
      );
      resolve();
      setRows([]);
      setKeys([]);
      query();
    }
    sessionStorage.setItem('sessionId', data.headers.ssessionid);
  };

  const [visible, setVisible] = useState(false);
  const showModal = () => {
    if (visible) {
      setRows([]);
      setKeys([]);
      getData();
    }
    setVisible(!visible);
  };

  const getToken = async () => {
    const res = await getOssToken();
    const obj = new OSS(res);
    setClientOSS(obj);
  };

  // 参保城市
  const handleCityIdChange = (v) => {
    // console.log(v);
    form.setFieldValue('cityPersonId', undefined);
    form.setFieldValue('sfUnionCustId', undefined);
    // getPersonList(v);
    getCustomerList();
  };

  // 账户类型
  const handleIdsfUnionCustSrcType = (v) => {
    // console.log(v);
    form.setFieldValue('sfUnionCustId', undefined);
    getCustomerList();
  };

  //账户类型
  const getCustomerList = async (obj) => {
    let cityId = form.getFieldValue('cityId'),
      sfUnionCustSrcType = form.getFieldValue('sfUnionCustSrcType');
    if (!cityId || sfUnionCustSrcType === undefined) {
      message.warning('请选择城市和账户类型');
      return;
    }
    let postData = { search_EQ_cityId: cityId, search_EQ_srcType: sfUnionCustSrcType } || obj,
      start = 0,
      length = 10;
    const { data } = await fetchList(
      start,
      length,
      `${apis.package}/customer`,
      postData
    );
    if (data.data.length > 0) {
      message.success('查询成功，请选择参保账户！');
      setCustomerList(data.data);
    } else {
      message.warning('该城市下无对应参保账户');
      form.setFieldValue('sfUnionCustId', undefined);
      setCustomerList([]);
    }

  };

  // 点击全部、其他选项禁用
  // const isAllSelected = selectedValues.length === residenceTypeList.length ;
  const isAllSelected = selectedValues.length === residenceTypeList.length || selectedValues.includes(0);
  const handleChange = (value) => {
    if (value.includes(0)) {
      setSelectedValues([0]);
      form.setFieldsValue({ residenceTypeId: [0] });
    } else {
      setSelectedValues(value);
      form.setFieldsValue({ residenceTypeId: value });
    }
  };

  useEffect(() => {
    if (Object.keys(clientOSS).length) {
      handleExport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientOSS]);

  useEffect(() => {
    let obj = JSON.parse(sessionStorage.getItem('socialFundPackage'));
    if (obj && Object.keys(obj).length) {
      form.setFieldsValue(obj.form);
      setPages(obj.pages);
      setQueryData('clear');
    }
    setFirstRender(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!firstRender) {
      // 参保城市
      const getList = async () => {
        const { data } = await fetchList(0, 200, `${apis.city}`);
        setCityList(data.data);
      };
      getList();

      // // 参保账户/二级供应商
      // const getsfUnionCustList = async () => {
      //   fetchList(0, 200, `${apis.packageCustomer}`)
      //     .then((response) => {
      //       setSfUnionCustList(response?.data?.data);
      //     })
      //     .catch((error) => {
      //       console.error(error);
      //     });
      // };
      // getsfUnionCustList();

      //  户籍类型
      const getResidenceList = async () => {
        const { data } = await fetchList(0, 200, `${apis.residence}`);
        // setResidenceTypeList(data.data);
        if (data.data && data.data.length > 0) {
          // 添加 "全部" 选项到数据列表的开头 
          data.data.unshift({ name: '全部', id: 0 });
        }
        setResidenceTypeList(data.data);
      }
      getResidenceList();
    }
    // setFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  useEffect(() => {
    if (!firstRender) {
      query();
      setCustomerList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.page, pages.limit, firstRender]);

  useEffect(() => {
    if (reset) {
      query();
      setCustomerList([]);
      setReset(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const columns = [
    {
      dataIndex: 'number',
      fixed: 'left',
      title: '社保套餐编号',
    },
    {
      dataIndex: 'name',
      fixed: 'left',
      title: '社保套餐名称',
    },
    {
      dataIndex: 'cityName',
      fixed: 'left',
      title: '参保城市',
    },
    {
      dataIndex: 'residenceTypeName',
      fixed: 'left',
      title: '户籍类型',
    },
    // {
    //   dataIndex: 'isSingleAccount',
    //   render: (text) => (text ? '是' : '否'),
    //   title: '是否单立户',
    // },
    // {
    //   dataIndex: 'cityPersonName',
    //   title: '城市人员类别',
    // },

    {
      dataIndex: 'isStandradPackage',
      render: (text) => (text ? '是' : '否'),
      title: '是否标准套餐',
    },
    {
      dataIndex: 'sfUnionCustSrcType',
      fixed: 'left',
      title: '账户类型',
      render: (sfUnionCustSrcType) => getGenericStatus(sfUnionCustSrcType, accountTypesMap),
    },
    {
      dataIndex: 'sfUnionCustName',
      title: '参保账户/供应商',
    },
    {
      dataIndex: 'socialAddUserEndDate',
      title: '社保增员截止日',
    },
    {
      dataIndex: 'socialRemoveUserEndDate',
      title: '社保减员截止日',
    },
    {
      dataIndex: 'fundAddUserEndDate',
      title: '公积金增员截止日',
    },
    {
      dataIndex: 'fundRemoveUserEndDate',
      title: '公积金减员截止日',
    },
    {
      dataIndex: 'baseStatus',
      title: '是否有效',
      render: (text, record) => {
        switch (record.baseStatus) {
          case 0:
            return (
              <div className="common-status">
                <i className="common-dot common-dot-success"></i>
                <span>是</span>
              </div>
            );
          case 1:
            return (
              <div className="common-status">
                <i className="common-dot common-dot-error"></i>
                <span>否</span>
              </div>
            );
          default:
            break;
        }
      },
      sorter: (a, b) => {
        if (!a.baseStatus || !b.baseStatus) return 0;
        return a.baseStatus - b.baseStatus;
      },
      width: 200,
      ellipsis: true,
    },
    {
      dataIndex: 'creatorName',
      title: '创建人',
    },
    {
      dataIndex: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      title: '创建时间',
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
            <Button type="link" size="small" onClick={() => toSet(record.id, record.name)}>
              设置下挂客户
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
          initialValues={{ insType: undefined, baseStatus: 0 }}
        >
          <div className="inner">
            <Form.Item label="社保套餐名称" name="name">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="参保城市" name="cityId">
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
                onChange={handleCityIdChange}
              />
            </Form.Item>
            <Form.Item
              label="户籍类型"
              name="residenceTypeId"
            >
              <Select
                mode="multiple"
                filterOption={(input, option) =>
                  (option?.name ?? '').includes(input)
                }
                optionFilterProp="children"
                showSearch
                placeholder="请选择"
                onChange={handleChange}
                value={selectedValues}
              >
                {residenceTypeList.map(option => (
                  <Select.Option key={option.id} value={option.id} disabled={selectedValues.includes(0) && option.id !== 0}>
                    {option.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="是否标准套餐" name="isStandradPackage">
              <Select
                options={[
                  { label: '否', value: false },
                  { label: '是', value: true },
                ]}
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item
              label="账户类型"
              name="sfUnionCustSrcType"
            >
              <Select
                fieldNames={{
                  label: 'label',
                  value: 'value',
                }}
                filterOption={(input, option) =>
                  (option?.name ?? '').includes(input)
                }
                optionFilterProp="children"
                options={accountTypes}
                showSearch
                placeholder="请选择"
                allowClear
                onChange={handleIdsfUnionCustSrcType}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => (
                <Tooltip title={(getFieldValue('cityId') && getFieldValue('sfUnionCustSrcType')) ? "" : "请先选择参保城市和账户类型"}>
                  <Form.Item
                    label="参保账户/二级供应商"
                    name="sfUnionCustId"
                  >
                    <Select
                      // disabled
                      fieldNames={{
                        label: 'name',
                        value: 'id',
                      }}
                      filterOption={(input, option) =>
                        (option?.name ?? '').includes(input)
                      }
                      optionFilterProp="children"
                      options={customerList}
                      showSearch
                      placeholder="请选择"
                      disabled={(getFieldValue('cityId') && getFieldValue('sfUnionCustSrcType')) ? false : true}
                    />
                  </Form.Item>
                </Tooltip>
              )}
            </Form.Item>
            <Form.Item
              label="社保增员截止日"
              name="socialAddUserEndDate"
            >
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item
              label="社保减员截止日"
              name="socialRemoveUserEndDate"
            >
              <Input placeholder="请输入" allowClear />
            </Form.Item>

            <Form.Item label="公积金增员截止日" name="fundAddUserEndDate">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item
              label="公积金减员截止日"
              name="fundRemoveUserEndDate"
            >
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="是否有效" name="baseStatus">
              <Select
                placeholder="请选择"
                allowClear
                options={[
                  { label: '是', value: 0 },
                  { label: '否', value: 1 },
                  { label: '全部', value: '' }
                ]}
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
      </div >

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
              <Button type="primary" ghost onClick={getToken}>
                导出数据
              </Button>
              <Button type="primary" disabled={!keys.length} onClick={() => confirmUpdate(0)}>
                失效
              </Button>
              <Button type="primary" disabled={!keys.length} onClick={() => confirmUpdate(1)}>
                启用
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
          rowSelection={rowSelection}
          scroll={{ x: 'max-content' }}
          size="small"
        // sticky
        />
      </div>

      <Customer
        keys={keys}
        rows={rows}
        showModal={showModal}
        visible={visible}
      />
    </div >
  );
};

export default List;
