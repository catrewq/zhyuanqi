import { Button, Form, Input, Modal, Table } from 'antd';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
import { filterQueryObject } from "src/utils/util";

const Contract = (props) => {
  const { showModal, visible } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [datas, setDatas] = useState([]);

  // 选择
  const handleSelect = (record) => {
    showModal(record);
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
    const filteredObj = filterQueryObject(obj);
    const newObj = QueryUtil.get(filteredObj, query);
    console.log(newObj);
    return newObj;
  };

  const getData = async () => {
    setLoading(true);
    let obj = getPostData(),
      postData = {
        ...obj,
      },
      start = (pages.page - 1) * pages.limit,
      length = pages.limit;
    const { data } = await fetchList(
      start,
      length,
      `${apis.contract}`,
      postData
    );
    const { count } = data;
    setTotal(count);
    setDatas(data.data);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pages.page, pages.limit]);

  let columns = [
    {
      dataIndex: 'number',
      title: '编码',
    },
    {
      dataIndex: 'customerName',
      title: '客户名称',
    },
    {
      dataIndex: 'contractName',
      title: '商务合同',
    },
    {
      fixed: 'right',
      key: 'action',
      render: (_, record) => {
        return (
          <Button type="link" size="small" onClick={() => handleSelect(record)}>
            选择
          </Button>
        );
      },
      title: '操作',
    },
  ];

  return (
    <Modal
      className="list-modal"
      wrapClassName="SocialFundPackage-modal"
      open={visible}
      title="商务合同查询"
      footer={null}
      width={1140}
      onCancel={() => {
        showModal();
      }}
    >
      <div className="form">
        <Form colon={false} form={form} name="search_form">
          <Form.Item name="customerName">
            <Input placeholder="请输入客户名称" allowClear />
          </Form.Item>
          <Form.Item name="contractName">
            <Input placeholder="请输入商务合同" allowClear />
          </Form.Item>
          <Button
            onClick={() => {
              if (pages.page === 1) {
                getData();
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
        </Form>
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
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </div>
    </Modal>
  );
};

export default Contract;
