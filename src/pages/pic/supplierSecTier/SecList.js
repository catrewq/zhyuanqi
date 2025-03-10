import { DownOutlined } from '@ant-design/icons';
import OSS from 'ali-oss';
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Space,
  Table,
  Upload,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchDownload, fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import axios from 'src/utils/axios';
import getOssToken from 'src/utils/getOssToken';
import { useTabLocation, useTabNavigate } from 'src/utils/navigateUtil';



const SecList = () => {
  const location = useTabLocation();
  const navigate = useTabNavigate();
  const initSupId = location.state ? location.state.supplierId : 0;
  const [supplierId] = useState(initSupId);

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
  const [supplierList, setSupplierList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [feeList, setFeeList] = useState([]);

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
      sessionStorage.removeItem('supplierSecTier');
    } else {
      obj.form = form.getFieldsValue(true);
      obj.pages = { ...pages };
      sessionStorage.setItem('supplierSecTier', JSON.stringify(obj));
    }
  };

  const query = () => {
    setQueryData();
    getData();
  };

  const getData = async () => {
    // console.log('get sec supp list');
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
      `${apis.supplierSecTier}`,
      postData
    );
    const { count } = data;
    setTotal(count);
    setDatas(data.data);
    setLoading(false);
  };

  const getPostData = () => {
    let obj = { ...form.getFieldsValue(true) };
    // 考虑要不要写一个通用工具类
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && value !== '') {
        newObj[`${SearchName.LIKE}_${key}`] = value;
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
    const { data } = await fetchDownload(postData, `${apis.supplier}`);
    if (data.success) {
      getFile(data.data);
    } else {
      message.error(data.message);
    }
  };

  const toAdd = () => {
    navigate('./add', {
      subTitle: "新增",
      state: {
        supplierId: supplierId
      }
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

  const getToken = async () => {
    const res = await getOssToken();
    const obj = new OSS(res);
    setClientOSS(obj);
  };

  // 模板下载
  const getTemplate = async () => {
    const { data } = await axios({
      method: 'get',
      responseType: 'blob',
      url: `${apis.supplier}/download/template`,
    });
    downloadTemplate(data, 'tmp.xlsx');
  };
  const downloadTemplate = (content, fileName) => {
    const blob = new Blob([content]);
    const url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 导入
  const config = {
    accept: '.xlsx',
    multiple: false,
    showUploadList: false,
    fileList: [],
    beforeUpload: (file) => {
      handleUpload(file);
      return false;
    },
    name: 'file',
  };
  const handleUpload = async (file) => {
    const { data } = await axios({
      data: { file },
      headers: { 'Content-Type': 'multipart/form-data' },
      method: 'post',
      url: `${apis.supplier}/upload/asyn`,
    });
    if (data.success) {
      const { failedFileUrl } = data.data;
      failedFileUrl && getFile(failedFileUrl);
      query();
    } else {
      message.error(data.message);
    }
  };

  const handleSupplierIdChange = (v) => {
    if (v) {
      getTemplateList(v);
      getFeeList(v);
    }
  };

  const getTemplateList = async (id) => {
    const { data } = await fetchList(0, 200, `${apis.supplierTmp}`, {
      search_EQ_supplierId: id,
    });
    setTemplateList(data.data);
  };

  const getFeeList = async (id) => {
    const { data } = await fetchList(0, 200, `${apis.supplier}/fee`, {
      search_EQ_supplierId: id,
    });
    setFeeList(data.data);
  };

  useEffect(() => {
    if (Object.keys(clientOSS).length) {
      handleExport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientOSS]);

  useEffect(() => {
    let obj = JSON.parse(sessionStorage.getItem('supplierSecTier'));
    if (obj && Object.keys(obj).length) {
      form.setFieldsValue(obj.form);
      setPages(obj.pages);
      setQueryData('clear');
      handleSupplierIdChange(obj.form.supplierId);
    }
    setFirstRender(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!firstRender) {
      const getSupplierList = async () => {
        const { data } = await fetchList(0, 200, `${apis.supplier}`);
        setSupplierList(data.data);
      };
      getSupplierList();

      const getCityList = async () => {
        const { data } = await fetchList(0, 200, `${apis.city}`);
        setCityList(data.data);
      };
      getCityList();
    }
    // setFirstRender(false);
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

  const fieldNames = {
    label: 'name',
    value: 'id',
  };

  const columns = [
    {
      dataIndex: 'number',
      fixed: 'left',
      title: '二级供应商编号',
    },
    {
      dataIndex: 'name',
      fixed: 'left',
      title: '二级供应商名称',
    },
    {
      dataIndex: 'cityName',
      title: '城市',
    },
    {
      dataIndex: 'supplierName',
      title: '所属一级供应商',
    },
    {
      dataIndex: 'billTempName',
      title: '所属账单模板',
    },
    {
      dataIndex: 'commitFeeName',
      title: '所属委托费',
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
      dataIndex: 'creatorName',
      title: '更新人',
    },
    {
      dataIndex: 'lastUpdateTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      title: '更新时间',
    },
    {
      fixed: 'right',
      key: 'action',
      render: (_, record) => {
        return (
          <Space>
            <Button type="link" size="small" onClick={() => toView(record.id)}>
              查看
            </Button>
            <Button type="link" size="small" onClick={() => toEdit(record.id)}>
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
        >
          <div className="inner">
            <Form.Item label="所属一级供应商" name="supplierId">
              <Select
                fieldNames={fieldNames}
                onChange={handleSupplierIdChange}
                options={supplierList}
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item label="二级供应商名称" name="name">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="城市" name="cityId">
              <Select
                fieldNames={fieldNames}
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
            <Form.Item label="所属账单模板" name="billTempId">
              <Select
                fieldNames={fieldNames}
                options={templateList}
                placeholder="请选择"
                allowClear
              />
            </Form.Item>
            <Form.Item label="所属委托费" name="commitFeeId">
              <Select
                fieldNames={fieldNames}
                options={feeList}
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
              <Upload {...config} className="uploadDetailBtn">
                <Button type="primary">导入数据</Button>
              </Upload>
              <Button type="primary" ghost onClick={getTemplate}>
                模板下载
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
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </div>
    </div>
  );
};

export default SecList;
