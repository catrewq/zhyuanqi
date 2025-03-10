import { useEffect, useState } from 'react';
import { Button, Form, Modal, Select, Table } from 'antd';
import { fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import apis from 'src/utils/apiBravo';

export default function Pick(props) {
  const { cityId, showModal, visible } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [datas, setDatas] = useState([]);
  const [groupList, setGroupList] = useState([]);

  // 选择
  const handleSelect = () => {
    showModal(keys, rows);
  };

  const getData = async () => {
    setLoading(true);
    let start = (pages.page - 1) * pages.limit,
      length = pages.limit,
      postData = { ...getPostData(), search_EQ_cityId: cityId };
    const { data } = await fetchList(
      start,
      length,
      `${apis.groupProductEntry}`,
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
        newObj[`${SearchName.EQ}_${key}`] = value;
      }
    }
    return newObj;
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

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setRows([]);
      setKeys([]);
      getData();

      const getGroupList = async () => {
        const { data } = await fetchList(0, 200, `${apis.group}`, {
          search_EQ_cityId: cityId,
        });
        setGroupList(data.data);
      };
      getGroupList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pages.page, pages.limit]);

  let columns = [
    {
      dataIndex: 'insTypeName',
      title: '险种类别',
    },
    {
      dataIndex: 'groupName',
      title: '社保公积金组',
    },
  ];

  return (
    <Modal
      className="list-modal"
      wrapClassName="Supplier-modal"
      open={visible}
      title="设置险种付费频率"
      footer={null}
      width={1140}
      onCancel={() => {
        showModal();
      }}
    >
      <div className="common-modal-form">
        <Form colon={false} form={form} name="search_form">
          <Form.Item name="parentId">
            <Select
              fieldNames={{
                label: 'name',
                value: 'id',
              }}
              options={groupList}
              placeholder="请选择社保公积金组"
              allowClear
            />
          </Form.Item>
          <Button onClick={() => getData('active')}>查询</Button>
        </Form>
      </div>

      <div className="buttons">
        <Button type="primary" disabled={!rows.length} onClick={handleSelect}>
          选择
        </Button>
      </div>

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
          rowSelection={rowSelection}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </div>
    </Modal>
  );
}
