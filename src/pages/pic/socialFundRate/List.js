import { DownOutlined } from '@ant-design/icons';
import OSS from 'ali-oss';
import {
  Button,
  DatePicker,
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
import apis from 'src/utils/apiBravo';
import { fetchDownload, fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import axios from 'src/utils/axios';
import getOssToken from 'src/utils/getOssToken';
import { useTabNavigate } from 'src/utils/navigateUtil';
import { insTypeList } from './data';
import { dateFormat } from 'src/utils/dateFormatDayjs';
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
import { filterQueryObject } from "src/utils/util";
// const crumbs = ['社保公积金比例维护', '列表'];

const List = () => {
  const navigate = useTabNavigate();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
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
  const [groupList, setGroupList] = useState([]);
  const [permissions, setPermissions] = useState('');

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
    const { data } = await fetchList(start, length, `${apis.rate}`, postData);
    const { count } = data;
    setTotal(count);
    setDatas(data.data);
    setLoading(false);
  };

  const getPostData = () => {
    let obj = { ...form.getFieldsValue(true) };
    obj.startMonth && (obj.startMonth = obj.startMonth.format('YYYY-MM'));
    obj.endMonth && (obj.endMonth = obj.endMonth.format('YYYY-MM'));

    // 考虑要不要写一个通用工具类
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && value !== '') {
        newObj[`${SearchName.EQ}_${key}`] = value;
      }
    }
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
    const { data } = await fetchDownload(postData, `${apis.rate}`);
    if (data.success) {
      getFile(data.data);
    } else {
      message.error(data.message);
    }
  };

  const toAdd = () => {
    navigate('./add', {
      add: true,
      subTitle: "新增",
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

  // 批量
  const handleBatch = () => {
    let flag = rows.some((item) => item.isDoubleBase !== rows[0].isDoubleBase);
    if (flag) {
      message.warning('勾选多个险种的是否双基数应都为是或者都为否');
      return;
    }
    let flag2 = rows.some((item) => item.cityName !== rows[0].cityName);
    if (flag2) {
      message.warning('勾选多个险种的城市应为同一个城市');
      return;
    }
    showModal();
  };

  const [visible, setVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const showModal = () => {
    visible && form2.resetFields();
    setVisible(!visible);
  };

  // 企业基数范围
  const handleEntBaseRangerChange = ({ target: { value } }) => {
    // value
    if (!rows[0].isDoubleBase) {
      form2.setFieldValue('pslBaseRange', value);
    }
  };

  const handleValidate = () => {
    form2
      .validateFields()
      .then(async (values) => {
        // console.log(values);
        handleSubmit(values);
      })
      .catch((error) => { });
  };

  const handleSubmit = async (values) => {
    setSaveLoading(true);
    let postData = {
      ...values,
      startMonth: values.startMonth.format('YYYYMM'),
    };
    postData.endMonth
      ? (postData.endMonth = postData.endMonth.format('YYYYMM'))
      : delete postData.endMonth;
    const fields = ['startMonth', 'endMonth'];
    fields.forEach(field => {
      postData[field] = Number(postData[field]);
    });
    console.log(postData);
    const { data } = await axios({
      data: JSON.stringify({
        ids: keys,
        entry: postData,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      url: `${apis.rate}/entry/change/batch`,
    });
    if (data.success) {
      showModal();
      setRows([]);
      setKeys([]);
      getData();
      message.success(data.message);
      setSaveLoading(false);
    } else {
      message.error(data.message);
      setSaveLoading(false);
    }
  };

  const getToken = async () => {
    const res = await getOssToken();
    const obj = new OSS(res);
    setClientOSS(obj);
  };

  // 城市
  const handleCityIdChange = (v) => {
    v ? getGroupList(v) : setGroupList([]);
  };

  const getGroupList = async (cityId) => {
    const { data } = await fetchList(0, 200, `${apis.group}`, {
      search_EQ_cityId: cityId,
    });
    setGroupList(data.data);
  };

  const getPermissions = () => {
    let str = sessionStorage.getItem('permissions') || '';
    setPermissions(str);
  };

  // const validateRange = (value) => {
  //   console.log(value);
  //   const rangePattern = /^(\d+)-(\d+)?$/; // 匹配 "1000-2000" 或 "1000-"
  //   if (!rangePattern.test(value)) {
  //     message.error('请输入正确的范围格式，如 "1000-2000" 或 "1000-"');
  //   }
  // };

  const validateRange = (value, form, field, filedName) => {
    console.log(value);
    const rangePattern = /^(\d+)-(\d+)?$/;
    // 匹配 "1000-2000" 或 "1000-" 
    if (!rangePattern.test(value)) {
      message.error('请输入正确的范围格式，如 "1000-2000" 或 "1000-"');
      form.setFieldsValue({ [field]: '' });
      // 清空无效输入 
      return;
    }
    const [min, max] = value.split('-').map(num => (num === '' ? NaN : Number(num)));
    // 如果 max 未定义，则不提示错误 
    if (!isNaN(max) && min > max) {
      message.error(`${filedName}第一个数不能大于第二个数`);
      form.setFieldsValue({ [field]: '' });
      // 清空无效输入
    }
  };


  useEffect(() => {
    if (Object.keys(clientOSS).length) {
      handleExport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientOSS]);

  useEffect(() => {
    if (!firstRender) {
      const getList = async () => {
        const { data } = await fetchList(0, 200, `${apis.city}`);
        setCityList(data.data);
      };
      getList();

      getPermissions();
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
      title: '比例编号',
    },
    {
      dataIndex: 'name',
      fixed: 'left',
      title: '险种比例名称',
    },
    {
      dataIndex: 'insTypeName',
      title: '险种类别',
    },
    {
      dataIndex: 'cityName',
      title: '城市',
    },
    {
      dataIndex: 'isDoubleBase',
      render: (text) => (text ? '是' : '否'),
      title: '是否双基数',
    },
    {
      dataIndex: 'startMonth',
      title: '起始月份',
      render: (text) => (dateFormat(text, "YYYY-MM")),
    },
    {
      dataIndex: 'endMonth',
      title: '截止月份',
      render: (text) => (dateFormat(text, "YYYY-MM")),
    },
    {
      dataIndex: 'entBaseRange',
      title: '企业基数范围',
    },
    {
      dataIndex: 'pslBaseRange',
      title: '个人基数范围',
    },
    {
      dataIndex: 'entRate',
      render: (text) => `${text}%`,
      title: '企业比例',
    },
    {
      dataIndex: 'pslRate',
      render: (text) => `${text}%`,
      title: '个人比例',
    },
    {
      dataIndex: 'entAddAmt',
      title: '企业固定金额',
    },
    {
      dataIndex: 'pslAddAmt',
      title: '个人固定金额',
    },
    {
      dataIndex: 'entRoundTypeName',
      title: '企业计算方式',
    },
    {
      dataIndex: 'pslRoundTypeName',
      title: '个人计算方式',
    },
    {
      dataIndex: 'entPrecisionName',
      title: '企业金额精度',
    },
    {
      dataIndex: 'pslPrecisionName',
      title: '个人金额精度',
    },
    {
      dataIndex: 'yearlyCtbFreqName',
      title: '缴费频率',
    },
    {
      dataIndex: 'yearlyCtbMonth',
      title: '年缴月',
    },
    {
      dataIndex: 'monthlyEntAmt',
      title: '每月企业金额',
    },
    {
      dataIndex: 'monthlyPslAmt',
      title: '每月个人金额',
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
                onChange={handleCityIdChange}
                optionFilterProp="children"
                options={cityList}
                showSearch
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item label="险种类别" name="insType">
              <Select options={insTypeList} placeholder="请选择" allowClear />
            </Form.Item>
            <Form.Item label="比例名称" name="name">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="是否双基数" name="isDoubleBase">
              <Select
                options={[
                  { label: '否', value: false },
                  { label: '是', value: true },
                ]}
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item label="起始年月" name="startMonth">
              <DatePicker picker="month" placeholder="请选择" allowClear />
            </Form.Item>
            <Form.Item label="截止年月" name="endMonth">
              <DatePicker picker="month" placeholder="请选择" allowClear />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => (
                <Tooltip title={getFieldValue('cityId') ? "" : "请先选择城市"}>
                  <Form.Item label="所属社保/公积金组" name="groupId">
                    <Select
                      fieldNames={{
                        label: 'name',
                        value: 'id',
                      }}
                      filterOption={(input, option) =>
                        (option?.name ?? '').includes(input)
                      }
                      optionFilterProp="children"
                      showSearch
                      options={groupList}
                      placeholder="请选择"
                      allowClear
                      disabled={getFieldValue('cityId') ? false : true}
                    />
                  </Form.Item>
                </Tooltip>
              )}
            </Form.Item>
            {/* 注意这里的动态渲染需要包含在 Form.Item 里面 */}

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
                {permissions.includes('0-401201') && (
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
                )}
              </Space>
            </div>
          )}
        </Form>
      </div>

      <div className="common-table">
        <div className="common-summary">
          <div className="total">
            筛选结果总数：<b>{total || 0}</b>份
          </div>
          <div className="buttons">
            <Space>
              <Button type="primary" onClick={toAdd}>
                新增
              </Button>
              <Button
                type="primary"
                disabled={!rows.length}
                onClick={handleBatch}
              >
                批量设定基数上下限
              </Button>
              <Button type="primary" ghost onClick={getToken}>
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
          rowSelection={rowSelection}
          scroll={{ x: 'max-content' }}
          size="small"
        // sticky
        />
      </div>

      <Modal
        className="init-modal"
        wrapClassName="SocialFundRate-modal"
        open={visible}
        title="批量设定基数上下限"
        footer={null}
        width={440}
        onCancel={showModal}
      >
        <div className="inner">
          <Form form={form2} layout="vertical" name="form2" autoComplete="off">
            <Form.Item
              label="起始月份"
              name="startMonth"
              rules={[{ required: true, message: '' }]}
            >
              <DatePicker
                format="YYYYMM"
                picker="month"
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item label="截止月份" name="endMonth">
              <DatePicker
                format="YYYYMM"
                picker="month"
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            {/* <Form.Item
              label="企业基数范围"
              name="entBaseRange"
              rules={[{ required: true, whitespace: true, message: '' }]}
            >
              <Input
                autoComplete="off"
                placeholder="请输入"
                onChange={handleEntBaseRangerChange}
              />
            </Form.Item>
            <Form.Item
              label="个人基数范围"
              name="pslBaseRange"
              rules={[{ required: true, whitespace: true, message: '' }]}
            >
              <Input
                autoComplete="off"
                placeholder="请输入"
                disabled={rows.length && !rows[0].isDoubleBase ? true : false}
              />
            </Form.Item> */}
            <Form.Item
              label="企业基数范围"
              name="entBaseRange"
              rules={[{ required: true, whitespace: true, message: '请输入企业基数范围' }]}
            >
              <Input
                autoComplete="off"
                placeholder="请输入"
                onChange={handleEntBaseRangerChange}
                onBlur={(e) => validateRange(e.target.value, form2, 'entBaseRange', "企业基数范围")}
              />
            </Form.Item>

            <Form.Item
              label="个人基数范围"
              name="pslBaseRange"
              rules={[{ required: true, whitespace: true, message: '请输入个人基数范围' }]}
            >
              <Input
                autoComplete="off"
                placeholder="请输入"
                disabled={rows.length && !rows[0].isDoubleBase ? true : false}
                onBlur={(e) => validateRange(e.target.value, form2, 'pslBaseRange', "个人基数范围")}
              />
            </Form.Item>

          </Form>
        </div>
        <div className="foot">
          <Space>
            <Button
              type="primary"
              loading={saveLoading}
              onClick={handleValidate}
            >
              确定
            </Button>
            <Button type="primary" ghost onClick={showModal}>
              取消
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default List;
