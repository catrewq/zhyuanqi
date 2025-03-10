import { Button, Modal, Table } from 'antd';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchList } from 'src/utils/apiData';

export default function Pick(props) {
  const { rateEntry, cityId, showModal, visible } = props;
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [datas, setDatas] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState({});//已选择比例数据

  // 选择
  const handleSelect = (record) => {
    showModal(record);
    setSelectedKeys(record);
    console.log(record);
  };

  const getData = async () => {
    setLoading(true);
    let start = (pages.page - 1) * pages.limit,
      length = pages.limit;
    const { data } = await fetchList(start, length, `${apis.rate}`, {
      search_EQ_cityId: cityId,
    });
    const { count } = data;
    setTotal(count);
    // setDatas(data.data);
    console.log(rateEntry);
    console.log(selectedKeys);

    let newData = data.data;

    // if (selectedKeys && selectedKeys !== {}) {
    //   newData = newData.filter((item) => {
    //     return item.id !== selectedKeys.id;
    //   });
    // }

    // if (rateEntry && rateEntry.length > 0) {
    //   newData = newData.filter((item) => {
    //     return !rateEntry.some((i) => i.socialFundRateId === item.id);
    //   });
    // }

    if (rateEntry && rateEntry.length > 0) {
      newData = newData.filter((item) => {
        // 如果 rateEntry 中的某项包含 oprInfo: {operate: 'REMOVE'}，则不过滤该项数据
        return !rateEntry.some((i) => i.socialFundRateId === item.id && i.oprInfo.operate !== 'REMOVE');
      });
    }


    setDatas(newData);



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
      dataIndex: 'insTypeName',
      title: '险种类别',
    },
    {
      dataIndex: 'number',
      title: '编号',
    },
    {
      dataIndex: 'name',
      title: '比例',
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
      wrapClassName="SocialFundGroup-modal"
      open={visible}
      title="产品比例查询"
      footer={null}
      width={1140}
      onCancel={() => {
        showModal();
      }}
    >
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
}
