import { useEffect, useState } from 'react';
//import { useTabLocation } from 'src/utils/navigateUtil';
import { Button, Form, Input, Select, Skeleton, Space, Modal } from 'antd';
import apis from 'src/utils/apiBravo';
import { showInfo } from 'src/utils/util';
import { fetchDetail, fetchList } from 'src/utils/apiData';
import { useTabLocation } from 'src/utils/navigateUtil';
import { ctbFreqList, freqList, textContent } from './data';
import { getPostData_obj } from "src/utils/util";
const CityAccView = () => {
  const location = useTabLocation();
  const [form] = Form.useForm();
  //const [firstRender, setFirstRender] = useState(true);

  const initId = location.state ? location.state.id : 0;
  const [id, setId] = useState(initId);
  const [loading, setLoading] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [feeList, setFeeList] = useState([]);

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


  function handleChange(value) {
    if (value) {
      Modal.info({
        title: '频率预览',
        content: textContent[value],
      });
    } else {
      showInfo('此数据没有付费频率')
    }

  }

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
    if (id) {
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

  }, [id]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.supplierSec}`)
          .finally(() => {
            setLoading(false);
          }
          );
        if (data.success) {
          form.setFieldsValue({ ...data.data });
          data.data.supplierId && getTemplateList(data.data.supplierId) && getFeeList(data.data.supplierId);


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

  const numberRules = [
    {
      required: true,
      message: '必填项不能为空',
    },
    {
      pattern: /^(0?[1-9]|1[0-2])$/,
      message: '请输入1-12之间的数字',
    },
  ]

  const fieldNames = {
    label: 'name',
    value: 'id',
  };

  return (
    <div className="detail-page">
      {/* <FixHeader crumbs={crumbs} /> */}

      <section>
        <div className="title">
          <span>查看二级供应商</span>
        </div>

        <Skeleton active loading={loading}>
          <div className="form">
            <Form
              colon={false}
              // disabled
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
                  <Form.Item
                    label="所属一级供应商名称"
                    name="supplierId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      onChange={handleSupplierIdChange}
                      options={supplierList}
                      placeholder="请选择"
                      disabled
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="城市" name="cityId" rules={rules}>
                    <Select
                      fieldNames={fieldNames}
                      filterOption={(input, option) =>
                        (option?.name ?? '').includes(input)
                      }
                      onChange={handleCityIdChange}
                      optionFilterProp="children"
                      options={cityList}
                      showSearch
                      placeholder="请选择"
                      disabled
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="二级供应商名称" name="name">
                    <Input disabled />
                  </Form.Item>
                </div>
                {/* <div className="item">
                  <Form.Item
                    label="所属一级供应商名称"
                    name="supplierId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      onChange={handleSupplierIdChange}
                      options={supplierList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div> */}
                {/* <div className="item">
                  <Form.Item label="二级供应商名称" name="name">
                    <Input readOnly />
                  </Form.Item>
                </div> */}
                <div className="item">
                  <Form.Item
                    label="供应商账单模板名称"
                    name="billTempId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      options={templateList}
                      placeholder="请选择"
                      disabled
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item
                    label="委托费名称"
                    name="commitFeeId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      options={feeList}
                      placeholder="请选择"
                      disabled
                    />
                  </Form.Item>
                </div>

                {/* <div className="item">
                  <Form.Item
                    label="委托费频率"
                    name="commitFeeFreq"
                    rules={rules}
                  >
                    <Select options={freqList} placeholder="请选择" />
                  </Form.Item>
                </div> */}
                <div className="item">
                  <Form.Item
                    label="总付费频率"
                    name="billCollectFreq"
                    rules={rules}
                  >
                    <Select
                      options={freqList}
                      placeholder="请选择"
                      disabled
                    />
                  </Form.Item>
                </div>

              </div>
              <div className="sub-items">
                <div style={{ overflowX: 'auto' }}>
                  <div className="inner">
                    <Space size="small" align="baseline">
                      <div className="fake-label">社保公积金组</div>
                      <div className="fake-label">险种类别</div>
                      <div className="fake-label">是否必须缴纳</div>
                      <div className="fake-label">是否强制补缴</div>
                      <div className="fake-label">是否可补缴</div>
                      <div className="fake-label">是否可跨年补</div>
                      <div className="fake-label">可补缴月数</div>
                      <div className="fake-label">申报频率</div>
                      <div className="fake-label">付费频率</div>
                      {/* <div className="fake-label">费用预览</div> */}
                      <div className="fake-label">操作</div>
                    </Space>
                  </div>
                  <Form.List name="entry">
                    {(fields) => (
                      <>
                        {fields.map((field, index) => (
                          <div key={index}>
                            <Form.Item noStyle shouldUpdate>
                              {({ getFieldValue }) =>
                                <Space size="small" align="baseline">
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'sfGroupName']}
                                    rules={rules}
                                  >
                                    <Input disabled />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'insTypeName']}
                                    rules={rules}
                                  >
                                    <Input disabled />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'isRequired']}
                                    rules={rules}
                                  >
                                    <Select
                                      placeholder="请选择"
                                      allowClear
                                      options={[
                                        { label: '是', value: true },
                                        { label: '否', value: false }
                                      ]}
                                      disabled
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'isForceMakeUpCtb']}
                                    rules={rules}
                                  >
                                    <Select
                                      placeholder="请选择"
                                      allowClear
                                      options={[
                                        { label: '是', value: true },
                                        { label: '否', value: false }
                                      ]}
                                      disabled
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'allowMakeUpCtb']}
                                    rules={rules}
                                  >
                                    <Select
                                      placeholder="请选择"
                                      allowClear
                                      options={[
                                        { label: '是', value: true },
                                        { label: '否', value: false }
                                      ]}
                                      disabled
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'allowMuiltYearMakeUp']}
                                    rules={rules}
                                  >
                                    <Select
                                      placeholder="请选择"
                                      allowClear
                                      options={[
                                        { label: '是', value: true },
                                        { label: '否', value: false }
                                      ]}
                                      disabled
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'makeUpCtbMonth']}
                                    rules={numberRules}
                                  >
                                    <Input placeholder="请输入" disabled />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'reportFerqType']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={ctbFreqList}
                                      placeholder="请选择"
                                      disabled
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'billCollectFreq']}
                                    rules={rules}
                                  >
                                    <Select options={freqList} placeholder="请选择" disabled />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, '']}
                                    rules={rules}
                                  >
                                    <Button
                                      type="link"
                                      onClick={() => {
                                        handleChange(getFieldValue('entry')[index].billCollectFreq, index)
                                      }}
                                    >费用预览</Button>
                                  </Form.Item>
                                </Space>
                              }
                            </Form.Item>
                          </div>
                        ))}
                      </>
                    )}
                  </Form.List>
                </div>
              </div>
            </Form>

            <div className="actions"></div>
          </div>
        </Skeleton>
      </section>
    </div>
  );
};

export default CityAccView;
