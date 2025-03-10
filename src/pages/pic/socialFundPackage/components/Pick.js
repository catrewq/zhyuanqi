import { Button, Modal, Table } from 'antd';
import { message } from 'antd/lib';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchList } from 'src/utils/apiData';

export default function Pick(props) {
  const { entry, cityId, showModal, visible } = props;
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [datas, setDatas] = useState([]);

  const isUniqueSelection = (arr, newItem) => {
    // 检查数组中是否已经存在相同的 insTypeName
    return !arr.some(item => item.insTypeName === newItem.insTypeName);
  }

  // 选择
  const handleSelect = () => {
    showModal(keys, rows);
    // if (rows && rows.length > 0) {
    //   rows.forEach(row => {
    //     if (row.insTypeName !== '住房公积金' && row.insTypeName !== '补充住房公积金') {
    //       if (isUniqueSelection(entry, row)) {
    //         showModal(keys, rows);
    //       } else {
    //         message.warning('除住房公积金和补充公积金外，同一时间段其他险种不能重复添加');
    //         setKeys([]);
    //       }
    //     }
    //   });
    // }
  };

  const getData = async () => {
    setLoading(true);
    let start = (pages.page - 1) * pages.limit,
      length = pages.limit;

    const { data } = await fetchList(start, length, `${apis.package}/rate`, {
      search_EQ_cityId: cityId,
    });
    const { count } = data;
    setTotal(count);
    // setDatas(data.data);
    // 已在套餐中 选中的比例去除不展示
    // 1.ADD中已有的数据，
    //2.比例中勾选的数据
    let newData = data.data;
    console.log(keys);
    console.log(entry);
    // if (keys && keys.length > 0) {
    //   newData = newData.filter((item) => {
    //     return !keys.some((i) => i === item.id);
    //   });
    // }
    console.log(entry);
    if (entry && entry.length > 0) {
      newData = newData.filter((item) => {
        // return !entry.some((i) => i.everyRateId === item.id);
        // return !entry.some((i) => i.cityId === item.cityId && i.insType === item.insType);
        return !entry.some((i) =>
          (i.cityId === item.cityId && i.insType === item.insType) || i.everyRateId === item.id
        );

      });
    }
    setDatas(newData);
    setLoading(false);
  };

  const [rows, setRows] = useState([]);
  const [keys, setKeys] = useState([]);
  const rowSelection = {
    fixed: 'left',
    selectedRowKeys: keys,
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(
      //   `selectedRowKeys: ${selectedRowKeys}`,
      //   'selectedRows: ',
      //   selectedRows
      // )
      setRows(selectedRows);
      setKeys(selectedRowKeys);
    },
    width: '50',
  };

  useEffect(() => {
    if (visible) {
      getData();
      setKeys([]);
      setRows([]);
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
      title: '社保/公积金组',
    },
    {
      dataIndex: 'name',
      title: '险种比例',
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
      title: '企业附加',
    },
    {
      dataIndex: 'pslAddAmt',
      title: '个人附加',
    },
    {
      dataIndex: 'yearlyCtbFreqName',
      title: '付费频率',

    },
    {
      dataIndex: 'yearlyCtbMonth',
      title: '年缴月',
    },
  ];

  return (
    <Modal
      className="list-modal"
      wrapClassName="SocialFundPackage-modal"
      open={visible}
      title="新增产品比例"
      footer={null}
      width={1140}
      onCancel={() => {
        showModal();
      }}
    >
      <div className="buttons">
        <Button type="primary"
          disabled={!rows.length}
          onClick={handleSelect}>
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
