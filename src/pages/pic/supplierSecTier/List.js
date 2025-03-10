import { DownOutlined } from '@ant-design/icons';
import OSS from 'ali-oss';
import { Button, Form, Input, message, Space, Table, Upload } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchDownload, fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import axios from 'src/utils/axios';
import getOssToken from 'src/utils/getOssToken';
import { useTabNavigate } from 'src/utils/navigateUtil';
import Fee from './components/Fee';
import Template from './components/Template';
import View from './components/View';

const crumbs = ['一级供应商', '列表'];

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
  const [visible, setVisible] = useState(false);
  const [templateVisible, setTemplateVisible] = useState(false);
  const [feeVisible, setFeeVisible] = useState(false);
  const [currentId, setCurrentId] = useState(null);

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
    const { data } = await fetchList(
      start,
      length,
      `${apis.supplier}`,
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

  const showModal = (id) => {
    !visible && setCurrentId(id);
    setVisible(!visible);
  };

  const showTemplateModal = (id) => {
    !templateVisible && setCurrentId(id);
    setTemplateVisible(!templateVisible);
  };

  const showFeeModal = (id) => {
    !feeVisible && setCurrentId(id);
    setFeeVisible(!feeVisible);
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

  const toSecPage = (record) => {
    navigate('./sec', {
      add: true,
      subPath: record.id,
      subTitle: ":" + record.name,
      state: {
        supplierId: record.id,
      },
    });
  };

  useEffect(() => {
    if (Object.keys(clientOSS).length) {
      handleExport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientOSS]);

  useEffect(() => {
    if (!firstRender) {
      // sessionStorage.removeItem('supplierSec');
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
      title: '一级供应商编号',
    },
    {
      dataIndex: 'name',
      fixed: 'left',
      title: '一级供应商名称',
    },
    {
      dataIndex: 'dutyParagraph',
      title: '统一识别码',
    },
    {
      dataIndex: 'contractPerson',
      title: '联系人',
    },
    {
      dataIndex: 'contractPhone',
      title: '联系方式',
    },
    {
      dataIndex: 'depositName',
      title: '开户名称',
    },
    {
      dataIndex: 'bankCode',
      title: '银行账号',
    },
    {
      dataIndex: 'depositBank',
      title: '开户行',
    },
    {
      dataIndex: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      title: '创建时间',
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
            <Button
              type="link"
              size="small"
              onClick={() => showModal(record.id)}
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => showTemplateModal(record.id)}
            >
              创建修改账单
            </Button>
            <Button type="link" size="small" onClick={() => toSecPage(record)}>
              设置二级供应商
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => showFeeModal(record.id)}
            >
              创建修改委托费
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
            <Form.Item label="一级供应商ID" name="number">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="一级供应商名称" name="name">
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
        // sticky
        />
      </div>

      <View
        id={currentId}
        showModal={(obj) => showModal(obj)}
        visible={visible}
      />

      <Template
        id={currentId}
        showModal={(obj) => showTemplateModal(obj)}
        visible={templateVisible}
      />

      <Fee
        id={currentId}
        showModal={(obj) => showFeeModal(obj)}
        visible={feeVisible}
      />
    </div>
  );
};

export default List;