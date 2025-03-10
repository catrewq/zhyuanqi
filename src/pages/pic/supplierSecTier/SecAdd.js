import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Select, Skeleton, Space } from 'antd';
import { useEffect, useState } from 'react';
import FixHeader from 'src/layouts/FixHeader';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList } from 'src/utils/apiData';
import axios from 'src/utils/axios';
import { useTabLocation, useTabNavigate } from 'src/utils/navigateUtil';
import Pick from './components/Pick';
import { freqList } from './data';

export default function SecAdd() {
  const location = useTabLocation();
  const navigate = useTabNavigate();

  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [feeList, setFeeList] = useState([]);
  const [cityId, setCityId] = useState(null);
  const [visible, setVisible] = useState(false);
  // const crumbs = ['二级供应商管理', `${id ? '修改' : '新增'}`];

  const handleCityIdChange = (_, { name }) => {
    form.setFieldValue('cityName', name);
    let supplierName = form.getFieldValue('supplierName');
    if (supplierName && name) {
      let v = `${supplierName}-${name}`;
      form.setFieldValue('name', v);
    }
  };

  const handleSupplierIdChange = (v, { name }) => {
    form.setFieldValue('supplierName', name);
    let cityName = form.getFieldValue('cityName');
    if (cityName && name) {
      let v = `${name}-${cityName}`;
      form.setFieldValue('name', v);
    }
    getTemplateList(v);
    getFeeList(v);
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

  const handleRemove = (currentIndex) => {
    let arr = [...form.getFieldValue('entry')];
    arr[currentIndex].oprInfo.operate = 'REMOVE';
    form.setFieldValue('entry', arr);
  };

  const showModal = (keys, rows) => {
    let cityId = form.getFieldValue('cityId'),
      defContributeFreq = form.getFieldValue('defContributeFreq');
    if (!cityId) {
      message.warning('请先选择城市');
      return;
    }
    setCityId(cityId);
    setVisible(!visible);
    if (keys && keys.length) {
      console.log(rows);
      let arr = [...form.getFieldValue('entry')],
        ids = arr.map((item) => item.sfGroupId);
      for (const item of rows) {
        if (!ids.includes(item.id)) {
          let obj = {
            ...item,
            groupPrdEntryId: item.id,
            sfGroupName: item.groupName,
            contributeFreq: defContributeFreq,
            oprInfo: {
              operate: 'ADD',
            },
          };
          arr.push(obj);
        }
      }
      form.setFieldValue('entry', arr);
    }
  };

  const handleValidate = () => {
    form
      .validateFields()
      .then(async (values) => {
        handleSubmit();
      })
      .catch((errors) => {
        console.log(errors);
      });
  };
  const handleSubmit = async () => {
    setSaveLoading(true);
    let postData = { ...form.getFieldsValue(true) };
    console.log('handleSubmit', postData);
    const res = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: id ? 'put' : 'post',
      url: id ? `${apis.supplierSecTier}/update` : `${apis.supplierSecTier}/create`,
    });
    const { data } = res;
    if (data.success) {
      sessionStorage.setItem('sessionId', res.headers.ssessionid);
      message.success({
        content: data.message,
        onClose: () => {
          navigate(-1);
        },
      });
    } else {
      message.error(data.message);
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (!firstRender) {
      let state = location.state;
      setId(state?.id);

      const getSupplierList = async () => {
        const { data } = await fetchList(0, 200, `${apis.supplier}`);
        setSupplierList(data.data);
      };
      getSupplierList();

      const getCityList = async () => {
        const { data } = await fetchList(0, 200, `${apis.city}`, {
          search_EQ_baseStatus: 0,
        });
        setCityList(data.data);
      };
      getCityList();
    }
    setFirstRender(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.supplierSecTier}`);
        if (data.success) {
          let obj = { ...data.data },
            arr = [];
          if (obj.entry?.length) {
            for (const item of obj.entry) {
              item.oprInfo = {
                operate: '',
              };
              arr.push(item);
            }
          }
          obj.entry = [...arr];
          form.setFieldsValue(obj);
          setLoading(false);
        }
      };

      getDetail(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const rules = [
    {
      required: true,
      message: '',
    },
  ];

  const fieldNames = {
    label: 'name',
    value: 'id',
  };

  return (
    <div className="detail-page">
      {/* <FixHeader crumbs={crumbs} /> */}

      <section>
        <div className="title">
          <span>{`${id ? '修改' : '新增'}二级供应商`}</span>
        </div>

        <Skeleton active loading={loading}>
          <div className="form">
            <Form
              colon={false}
              form={form}
              initialValues={{
                entry: [],
              }}
              labelAlign="right"
              layout="vertical"
              name="add_form"
            >
              <div className="items">
                <div className="item">
                  <Form.Item label="城市" name="cityId" rules={rules}>
                    <Select
                      disabled={id ? true : false}
                      fieldNames={fieldNames}
                      filterOption={(input, option) =>
                        (option?.name ?? '').includes(input)
                      }
                      onChange={handleCityIdChange}
                      optionFilterProp="children"
                      options={cityList}
                      showSearch
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item
                    label="所属一级供应商名称"
                    name="supplierId"
                    rules={rules}
                  >
                    <Select
                      disabled={id ? true : false}
                      fieldNames={fieldNames}
                      onChange={handleSupplierIdChange}
                      options={supplierList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="二级供应商名称" name="name">
                    <Input disabled={id ? true : false} readOnly />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item
                    label="所属账单模板"
                    name="billTempId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      options={templateList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item
                    label="所属委托费"
                    name="commitFeeId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      options={feeList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>

                <div className="item">
                  <Form.Item
                    label="委托费频率"
                    name="commitFeeFreq"
                    rules={rules}
                  >
                    <Select options={freqList} placeholder="请选择" />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item
                    label="总付费频率"
                    // name="defContributeFreq"
                    name="billCollectFreq"
                    rules={rules}
                  >
                    <Select options={freqList} placeholder="请选择" />
                  </Form.Item>
                </div>
              </div>
              <div className="sub-items">
                <Button type="primary" ghost onClick={() => showModal()}>
                  设置险种频率
                </Button>
                <div className="inner">
                  <Space size="small" align="baseline">
                    <div className="fake-label">社保公积金组</div>
                    <div className="fake-label">险种类别</div>
                    <div className="fake-label">付费频率</div>
                    <div className="fake-label">操作</div>
                  </Space>
                </div>
                <Form.List name="entry">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={index}>
                          <Form.Item noStyle shouldUpdate>
                            {({ getFieldValue }) =>
                              getFieldValue('entry')[index].oprInfo.operate !==
                                'REMOVE' && (
                                <Space size="small" align="baseline">
                                  {/* <Form.Item label="">
                                  <div>
                                    {
                                      getFieldValue('entry')[index].oprInfo
                                        .operate
                                    }
                                  </div>
                                </Form.Item> */}

                                  <Form.Item
                                    label=""
                                    name={[field.name, 'sfGroupName']}
                                    rules={rules}
                                  >
                                    <Input readOnly />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'insTypeName']}
                                    rules={rules}
                                  >
                                    <Input readOnly />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'contributeFreq']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={freqList}
                                      placeholder="请选择"
                                    />
                                  </Form.Item>
                                  <MinusCircleOutlined
                                    className="btns"
                                    onClick={() => {
                                      let arr = [
                                        ...form.getFieldValue('entry'),
                                      ];
                                      if (!arr[index].id) {
                                        remove(field.name);
                                      } else {
                                        handleRemove(index);
                                      }
                                    }}
                                  />
                                </Space>
                              )
                            }
                          </Form.Item>
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              </div>
            </Form>

            <div className="actions">
              <Space size="middle">
                <Button
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={handleValidate}
                  loading={saveLoading}
                >
                  提交
                </Button>
              </Space>
            </div>
          </div>
        </Skeleton>
      </section>

      <Pick
        cityId={cityId}
        visible={visible}
        showModal={(keys, rows) => showModal(keys, rows)}
      />
    </div>
  );
}
