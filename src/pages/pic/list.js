import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Form, Modal, Select, Space, Tooltip, message } from 'antd';
import { EyeOutlined, PictureOutlined } from '@ant-design/icons';
import CustomTable from 'src/components/publicUI/table';
import { apis } from 'src/utils/apis';
import axios from 'src/utils/axios';
import { dateFormat } from 'src/utils/dateFormatDayjs';
import OssProxy from 'src/utils/OssProxyUtil';

const App = () => {
  const navigate = useNavigate();
  const customTableRef = useRef();
  const [formAddEdit] = Form.useForm();
  const [visible, setVisible] = useState({ visibleAdd_Edit: false, mode: null });
  const [disabledModal, setDisabledModal] = useState({ disabled_release: false });

  const refQuery = () => {
    if (customTableRef.current) {
      customTableRef.current.reset();
    }
  };

  const showModalAdd_Edit = (operate) => {
    setVisible((prevState) => ({
      ...prevState,
      visibleAdd_Edit: !prevState.visibleAdd_Edit,
      mode: operate,
    }));
    setDisabledModal({ disabled_release: false });
    formAddEdit.resetFields();
  };

  const handleValidateAdd_Edit = () => {
    formAddEdit.validateFields().then(handleSubmit);
  };

  const handleSubmit = async () => {
    setDisabledModal({ disabled_release: true });

    const postData = { ...formAddEdit.getFieldsValue(true) };
    if (postData.yearMonth) {
      postData.yearMonth = Number(dateFormat(postData.yearMonth, 'YYYYMM'));
    }

    const url = visible.mode === 'download'
      ? '/bill/inspection/print/download/asyn'
      : '/bill/inspection/gen/cache';

    try {
      const { data } = await axios({
        url,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(postData),
      });

      if (data.success) {
        if (typeof data.data === 'string' && data.data.includes('.xlsx')) {
          OssProxy.getUrl(data.data).then((downloadUrl) => window.open(downloadUrl));
        }
        message.success(data.message);
        showModalAdd_Edit();
        refQuery();
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error(error?.data?.message || '请求失败，请稍后重试');
    } finally {
      setDisabledModal({ disabled_release: false });
    }
  };

  const getPostData = (form) => {
    const values = { ...form?.getFieldsValue(true) };
    const postData = {};

    if (values.yearMonth) {
      postData.yearMonth = Number(dateFormat(values.yearMonth, 'YYYYMM'));
    }
    if (values.cityCode) {
      postData.cityCode = values.cityCode;
    }
    if (values.status) {
      postData.status = values.status;
    }

    return postData;
  };

  const openPhotoPage = (record, page) => {
    const type = record.type || 'inspection';
    navigate(`/pic/${page}?id=${record.id}&type=${encodeURIComponent(type)}`);
  };

  const columns = [
    {
      dataIndex: 'id',
      width: 100,
      title: 'ID',
    },
    {
      dataIndex: 'yearMonth',
      width: 140,
      title: '月份',
    },
    {
      dataIndex: 'cityCode',
      width: 120,
      title: '城市编码',
    },
    {
      dataIndex: 'cityName',
      width: 160,
      title: '城市',
    },
    {
      dataIndex: 'status',
      width: 120,
      title: '状态',
      render: (value) => (value === 1 ? '巡检中' : '巡检结束'),
    },
    {
      dataIndex: 'type',
      width: 140,
      title: '照片类型',
    },
    {
      dataIndex: 'fileName',
      width: 260,
      title: '文件名',
      ellipsis: true,
    },
    {
      dataIndex: 'remark',
      width: 260,
      title: '备注',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="商品照片展示">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openPhotoPage(record, 'pics')}
            />
          </Tooltip>
          <Tooltip title="插件照片展示">
            <Button
              type="link"
              size="small"
              icon={<PictureOutlined />}
              onClick={() => openPhotoPage(record, 'pluginpic')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const searchForm = (
    <>
      <Form.Item label="月份" name="yearMonth">
        <DatePicker format="YYYYMM" picker="month" placeholder="请选择" allowClear />
      </Form.Item>
      <Form.Item label="城市编码" name="cityCode">
        <Select
          placeholder="请选择"
          allowClear
          options={[
            { label: '001', value: '001' },
            { label: '002', value: '002' },
            { label: '003', value: '003' },
            { label: '004', value: '004' },
            { label: '005', value: '005' },
          ]}
        />
      </Form.Item>
      <Form.Item label="状态" name="status">
        <Select
          placeholder="请选择"
          allowClear
          options={[
            { label: '巡检中', value: 1 },
            { label: '巡检结束', value: 2 },
          ]}
        />
      </Form.Item>
    </>
  );

  const renderActions = (
    <div className="buttons">
      <Space>
        <Button type="primary" size="middle" onClick={() => showModalAdd_Edit('download')}>
          按月份下载 Excel
        </Button>
        <Button type="primary" size="middle" onClick={() => showModalAdd_Edit('generate')}>
          按月份重新生成 Excel
        </Button>
      </Space>
    </div>
  );

  return (
    <div className="App">
      <CustomTable
        ref={customTableRef}
        url={apis.inspection.list}
        columns={columns}
        searchForm={searchForm}
        renderActions={renderActions}
        getPostData={getPostData}
      />
      <Modal
        className="add-modal"
        wrapClassName="Data-modal"
        open={visible.visibleAdd_Edit}
        title={visible.mode === 'download' ? '按月份下载 Excel' : '按月份重新生成 Excel'}
        footer={null}
        width={526}
        onCancel={showModalAdd_Edit}
        maskClosable={false}
      >
        <Form
          colon={false}
          form={formAddEdit}
          labelAlign="right"
          name="upload_form"
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item label="月份" name="yearMonth" rules={[{ required: true, message: '' }]}>
            <DatePicker format="YYYYMM" picker="month" placeholder="请选择" allowClear />
          </Form.Item>
        </Form>
        <div className="foot">
          <Space>
            <Button type="primary" loading={disabledModal.disabled_release} onClick={handleValidateAdd_Edit}>
              提交
            </Button>
            <Button onClick={showModalAdd_Edit}>取消</Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default App;
