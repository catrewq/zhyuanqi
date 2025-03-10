import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Tabs, Table } from 'antd';
import moment from 'moment';
import { fetchList, fetchDetail } from 'src/utils/apiData';
import apis from 'src/utils/apiBravo';

const View = (props) => {
  const { id, showModal, visible } = props;
  const [form] = Form.useForm();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({
    page: 1,
    limit: 10,
  });
  const [pagesTemplate, setPagesTemplate] = useState({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalTemplate, setTotalTemplate] = useState(0);
  const [datas, setDatas] = useState([]);
  const [datasTemplate, setDatasTemplate] = useState([]);

  const onTabClick = (key) => {
    setStatus(key);
  };

  const getDetail = async () => {
    const { data } = await fetchDetail(id, `${apis.supplier}`);
    if (data.success) {
      form.setFieldsValue(data.data);
    }
  };

  const getData = async () => {
    setLoading(true);
    let start = (pages.page - 1) * pages.limit,
      length = pages.limit;
    let query = {};
    query["search_EQ_supplierId"] = id;
    const { data } = await fetchList(start, length, `${apis.supplierCityAccount}`, query);
    const { count } = data;
    setTotal(count);
    setDatas(data.data);
    setLoading(false);
  };

  const getDataTemplate = async () => {
    setLoading(true);
    let start = (pagesTemplate.page - 1) * pagesTemplate.limit,
      length = pagesTemplate.limit;
    const { data } = await fetchList(start, length, `${apis.supplierTmp}`, {
      search_EQ_supplierId: id,
    });
    const { count } = data;
    setTotalTemplate(count);
    setDatasTemplate(data.data);
    setLoading(false);
  };

  const handleClose = () => {
    setStatus('');
    setPages({
      page: 1,
      limit: 10,
    });
    setPagesTemplate({
      page: 1,
      limit: 10,
    });
    showModal();
  };

  useEffect(() => {
    if (visible) {
      setStatus('1');
      getDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (status === '2') {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pages.page, pages.limit]);

  useEffect(() => {
    if (status === '3') {
      getDataTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pagesTemplate.page, pagesTemplate.limit]);

  const columns = [
    {
      dataIndex: 'name',
      title: '下属二级供应商',
    },
    {
      dataIndex: 'cityId',
      title: '所属城市',
    },
  ];

  const columnsTemplate = [
    {
      dataIndex: 'name',
      fixed: 'left',
      title: '账单模板名称',
    },
    {
      dataIndex: 'billingDate',
      title: '账单生成日',
    },
    {
      dataIndex: 'billLockDate',
      title: '账单锁定日',
    },
    {
      dataIndex: 'isContainsSocial',
      render: (text) => (text ? '是' : '否'),
      title: '社保是否纳入合计',
    },
    {
      dataIndex: 'isContainsFund',
      render: (text) => (text ? '是' : '否'),
      title: '公积金是否纳入合计',
    },
    {
      dataIndex: 'isContainsDisable',
      render: (text) => (text ? '是' : '否'),
      title: '残障金是否纳入合计',
    },
    {
      dataIndex: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      title: '创建时间',
    },
    {
      dataIndex: 'creatorName',
      title: '创建人',
    },
  ];

  return (
    <Modal
      className="list-modal"
      wrapClassName="Supplier-modal"
      open={visible}
      title="查看一级供应商"
      footer={null}
      width={1140}
      onCancel={() => handleClose()}
    >
      <Tabs
        items={[
          {
            label: '基本信息',
            key: '1',
          },
          {
            label: '下属二级供应商',
            key: '2',
          },
          {
            label: '账单模板信息',
            key: '3',
          },
        ]}
        activeKey={status}
        onTabClick={onTabClick}
      ></Tabs>

      {status === '1' && (
        <div className="detail-form">
          <Form
            colon={false}
            disabled
            form={form}
            labelCol={{
              span: 8,
            }}
            name="form"
            wrapperCol={{
              span: 16,
            }}
          >
            <div className="items">
              <div className="item">
                <Form.Item label="一级供应商ID" name="id">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="一级供应商名称" name="name">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="供应商类别" name="">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="统一识别码" name="dutyParagraph">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="联系人" name="contractPerson">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="联系方式" name="contractPhone">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="联系人级别" name="">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="开户名称" name="depositName">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="银行账号" name="bankCode">
                  <Input />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="开户行" name="depositBank">
                  <Input />
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      )}

      {status === '2' && (
        <div className="table">
          <Table
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
      )}

      {status === '3' && (
        <div className="table">
          <Table
            columns={columnsTemplate}
            dataSource={datasTemplate}
            loading={loading}
            pagination={{
              size: 'default',
              position: ['bottomCenter'],
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              current: pagesTemplate.page,
              pageSize: pagesTemplate.limit,
              showTotal: (total) => `共 ${total} 项`,
              total: totalTemplate,
              onChange: (page, pageSize) => {
                if (pageSize !== pages.limit) {
                  setPagesTemplate({
                    page: 1,
                    limit: pageSize,
                  });
                } else {
                  setPagesTemplate({
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
      )}

      <div className="foot">
        <Button ghost type="primary" onClick={() => handleClose()}>
          关闭
        </Button>
      </div>
    </Modal>
  );
};

export default View;
