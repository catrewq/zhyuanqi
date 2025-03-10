import { Form, Input, Select, Skeleton, Space } from 'antd';
import { useEffect, useState } from 'react';
import FixHeader from 'src/layouts/FixHeader';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList } from 'src/utils/apiData';
import { useTabLocation } from 'src/utils/navigateUtil';
import { freqList } from './data';

const View = () => {
  const location = useTabLocation();
  
  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
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
    if (!firstRender) {
      let state = location.state;
      setId(state?.id);

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
    setFirstRender(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.supplierSecTier}`);
        if (data.success) {
          form.setFieldsValue({ ...data.data });
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
          <span>查看二级供应商</span>
        </div>

        <Skeleton active loading={loading}>
          <div className="form">
            <Form
              colon={false}
              disabled
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
                      fieldNames={fieldNames}
                      onChange={handleSupplierIdChange}
                      options={supplierList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="二级供应商名称" name="name">
                    <Input readOnly />
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
                <div className="inner">
                  <Space size="small" align="baseline">
                    <div className="fake-label">社保公积金组</div>
                    <div className="fake-label">险种类别</div>
                    <div className="fake-label">付费频率</div>
                  </Space>
                </div>
                <Form.List name="entry">
                  {(fields) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={index}>
                          <Space size="small" align="baseline">
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
                              <Select options={freqList} placeholder="请选择" />
                            </Form.Item>
                          </Space>
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              </div>
            </Form>

            <div className="actions"></div>
          </div>
        </Skeleton>
      </section>
    </div>
  );
};

export default View;
