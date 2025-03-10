import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, message, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
//import { useLocation, useNavigate } from 'react-router-dom';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList } from 'src/utils/apiData';
import axios from 'src/utils/axios';
import { useTabLocation, useTabNavigate } from 'src/utils/navigateUtil';
import Contract from './components/Contract';
import { accountTypes } from './data';

const { Search } = Input;

const Set = () => {
  const location = useTabLocation();
  const navigate = useTabNavigate();
  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [personList, setPersonList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [entryIndex, setEntryIndex] = useState(null);
  const [residenceTypeList, setResidenceTypeList] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const handleChange = (value) => {
    if (value.includes(0)) {
      setSelectedValues([0]);
      form.setFieldsValue({ residenceTypeId: [0] });
    } else {
      setSelectedValues(value);
      form.setFieldsValue({ residenceTypeId: value });
    }
  };
  const isAllSelected = selectedValues.length === residenceTypeList.length || selectedValues.includes(0);
  // const crumbs = ['社保套餐维护', '设置下挂客户合同'];

  const crumbs = ['社保套餐维护', '设置下挂客户合同'];

  // 选择
  const onSearch = (_, __, index) => {
    console.log(index);
    setEntryIndex(index);
    showModal();
  };

  const showModal = (obj) => {
    setVisible(!visible);
    if (obj && Object.keys(obj).length) {
      console.log(obj);

      let arr = [...form.getFieldValue('contractEntry')],
        ids = [];
      for (const item of arr) {
        if (item.oprInfo.operate !== 'REMOVE') {
          ids.push(item.contractId);
        }
      }
      if (!ids.includes(obj.id)) {
        arr[entryIndex] = {
          ...arr[entryIndex],
          ...obj,
          contractId: obj.id,
        };
      }
      form.setFieldValue('contractEntry', arr);
    }
  };

  // 城市人员类别
  const getPersonList = async (id) => {
    const { data } = await fetchList(0, 200, `${apis.cityPersonType}`, {
      id,
    });
    setPersonList(data.data);
  };

  // 参保账户/供应商
  // const getCustomerList = async (obj) => {
  //   let cityId = form.getFieldValue('cityId'),
  //     isHugeCustomer = form.getFieldValue('isHugeCustomer');
  //   if (!cityId || !isHugeCustomer) {
  //     // message.warning('请选择城市和是否大户');
  //     return;
  //   }
  //   let postData = { cityId, isHugeCustomer } || obj,
  //     start = 0,
  //     length = 10;
  //   const { data } = await fetchList(
  //     start,
  //     length,
  //     `${apis.package}/customer`,
  //     postData
  //   );
  //   setCustomerList(data.data);
  // };

  const getCustomerList = async (obj) => {
    let cityId = form.getFieldValue('cityId'),
      sfUnionCustSrcType = form.getFieldValue('sfUnionCustSrcType');
    if (!cityId || sfUnionCustSrcType === undefined) {
      // message.warning('请选择城市和是否大户');
      return;
    }
    let postData = { search_EQ_cityId: cityId, search_EQ_srcType: sfUnionCustSrcType } || obj,
      start = 0,
      length = 10;
    const { data } = await fetchList(
      start,
      length,
      `${apis.package}/customer`,
      postData
    );
    if (data.data.length > 0) {
      setCustomerList(data.data);
    } else {
      message.warning('该城市下无数据');
      form.setFieldValue('sfUnionCustId', undefined);
      setCustomerList([]);
    }

  };

  const handleRemove = (currentIndex) => {
    let arr = [...form.getFieldValue('contractEntry')];
    arr[currentIndex].oprInfo.operate = 'REMOVE';
    form.setFieldValue('contractEntry', arr);
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
    if (isAllSelected) {
      postData.checkAllResidenceType = true;
            // 原有的没删除，直接选择全部，需要清值
            delete postData.resEntry;
            delete postData.resEntrySeq;
            delete postData.residenceTypeName;
    } else {
      postData.checkAllResidenceType = false;
      // postData.resEntry = [{ residenceTypeId: selectedValues }];
      postData.resEntry = selectedValues.map((a) => {
        return { residenceTypeId: a };
      })
    }
    console.log('handleSubmit', postData);
    const { data } = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: 'put',
      url: `${apis.package}/update`,
    });
    if (data.success) {
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

      const getList = async () => {
        const { data } = await fetchList(0, 200, `${apis.city}`);
        setCityList(data.data);
      };
      getList();

      const getResidenceList = async () => {
        const { data } = await fetchList(0, 200, `${apis.residence}`);
        setResidenceTypeList(data.data);
      }
      getResidenceList();
    }
    setFirstRender(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  useEffect(() => {
    if (id) {
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.package}`);
        if (data.success) {
          let obj = { ...data.data };
          if (obj.contractEntry?.length) {
            for (const item of obj.contractEntry) {
              item.oprInfo = {
                operate: 'UPDATE',
              };
            }
          } else {
            obj.contractEntry = [
              {
                entName: '',
                contractNo: '',
                oprInfo: { operate: 'ADD' },
              },
            ];
          }
          form.setFieldsValue(obj);

          // getPersonList(obj.cityId);

          getCustomerList({
            cityId: obj.cityId,
            // isHugeCustomer: obj.isHugeCustomer,
            sfUnionCustSrcType: obj.sfUnionCustSrcType,
          });
          let residenceTypeIds = [];
          if (obj.checkAllResidenceType) {
            residenceTypeIds = residenceTypeList.map(item => item.id);
            console.log(residenceTypeIds);
          } else {
            residenceTypeIds = obj.resEntry?.map(entry => entry.residenceTypeId) || [];
          }

          form.setFieldsValue({ residenceTypeId: residenceTypeIds });
        }

      };

      getDetail(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, residenceTypeList]);

  const rules = [
    {
      required: true,
      message: '',
    },
  ];

  return (
    <div className="detail-page add-modal">
      {/* <FixHeader crumbs={crumbs} /> */}

      <section>
        <div className="title">
          <span>设置下挂客户合同</span>
        </div>

        <div className="form">
          <Form
            colon={false}
            form={form}
            initialValues={{
              contractEntry: [],
            }}
            labelAlign="right"
            layout="vertical"
            name="add_form"
          >
            <div className="items inner">
              <div className="item">
                <Form.Item label="社保套餐名称" name="name" rules={rules}>
                  <Input placeholder="请输入" disabled />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="参保城市" name="cityId" rules={rules}>
                  <Select
                    disabled
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                    }}
                    filterOption={(input, option) =>
                      (option?.name ?? '').includes(input)
                    }
                    optionFilterProp="children"
                    options={cityList}
                    showSearch
                    placeholder="请选择"
                  />
                </Form.Item>
              </div>
              {/* <div className="item">
                <Form.Item
                  label="城市人员类别"
                  name="cityPersonId"
                  rules={rules}
                >
                  <Select
                    disabled
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                    }}
                    filterOption={(input, option) =>
                      (option?.name ?? '').includes(input)
                    }
                    optionFilterProp="children"
                    options={personList}
                    showSearch
                    placeholder="请选择"
                  />
                </Form.Item>
              </div> */}
              {/* <div className="item">
                <Form.Item label="是否大户" name="isHugeCustomer" rules={rules}>
                  <Select
                    disabled
                    options={[
                      { label: '否', value: false },
                      { label: '是', value: true },
                    ]}
                    placeholder="请选择"
                  />
                </Form.Item>
              </div> */}
              <div className="item">
                <Form.Item
                  label="户籍类型"
                  name="residenceTypeId"
                  rules={rules}
                >
                    <Select
                        mode="multiple"
                        showSearch
                        placeholder="请选择"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={handleChange}
                        value={selectedValues}
                      >
                        {residenceTypeList.map(option => (
                          <Select.Option key={option.id} value={option.id} disabled={selectedValues.includes(0) && option.id !== 0}>
                            {option.name}
                          </Select.Option>
                        ))}
                      </Select>
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="账户类型"
                  name="sfUnionCustSrcType"
                  rules={rules}
                >
                  <Select
                    disabled={id ? true : false}
                    fieldNames={{
                      label: 'label',
                      value: 'value',
                    }}
                    filterOption={(input, option) =>
                      (option?.name ?? '').includes(input)
                    }
                    optionFilterProp="children"
                    options={accountTypes}
                    showSearch
                    placeholder="请选择"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="参保账户/供应商"
                  name="sfUnionCustId"
                  rules={rules}
                >
                  <Select
                    disabled
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                    }}
                    filterOption={(input, option) =>
                      (option?.name ?? '').includes(input)
                    }
                    optionFilterProp="children"
                    options={customerList}
                    showSearch
                    placeholder="请选择"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="社保增员截止日"
                  name="socialAddUserEndDate"
                  rules={rules}
                >
                  <InputNumber
                    disabled
                    controls={false}
                    min="1"
                    max="31"
                    step="1"
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="社保减员截止日"
                  name="socialRemoveUserEndDate"
                  rules={rules}
                >
                  <InputNumber
                    disabled
                    controls={false}
                    min="1"
                    max="31"
                    step="1"
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="公积金增员截止日"
                  name="fundAddUserEndDate"
                  rules={rules}
                >
                  <InputNumber
                    disabled
                    controls={false}
                    min="1"
                    max="31"
                    step="1"
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="公积金减员截止日"
                  name="fundRemoveUserEndDate"
                  rules={rules}
                >
                  <InputNumber
                    disabled
                    controls={false}
                    min="1"
                    max="31"
                    step="1"
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="是否标准套餐"
                  name="isStandradPackage"
                  rules={rules}
                >
                  <Select
                    disabled
                    options={[
                      { label: '否', value: false },
                      { label: '是', value: true },
                    ]}
                    placeholder="请选择"
                  />
                </Form.Item>
              </div>
            </div>

            <div className="sub-items inner">
              <Space size="small" align="baseline">
                <div className="fake-label">客户名称</div>
                <div className="fake-label">商务合同</div>
              </Space>
              <Form.List name="contractEntry">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={index}>
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) =>
                            getFieldValue('contractEntry')[index].oprInfo
                              .operate !== 'REMOVE' && (
                              <Space size="small" align="baseline">
                                <Form.Item
                                  label=""
                                  name={[field.name, 'entName']}
                                >
                                  <Input readOnly />
                                </Form.Item>
                                <Form.Item
                                  label=""
                                  name={[field.name, 'contractNo']}
                                  rules={rules}
                                >
                                  <Search
                                    enterButton="选择"
                                    onSearch={(value, event) =>
                                      onSearch(value, event, index)
                                    }
                                    placeholder="请选择"
                                    readOnly
                                  />
                                </Form.Item>
                                {index ? (
                                  <MinusCircleOutlined
                                    className="btns"
                                    onClick={() => {
                                      let arr = [
                                        ...form.getFieldValue('contractEntry'),
                                      ];
                                      if (!arr[index].id) {
                                        remove(field.name);
                                      } else {
                                        handleRemove(index, 'contractEntry');
                                      }
                                    }}
                                  />
                                ) : null}
                                <PlusCircleOutlined
                                  className="btns"
                                  onClick={() =>
                                    add({
                                      entName: '',
                                      contractNo: '',
                                      oprInfo: { operate: 'ADD' },
                                    })
                                  }
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

          <div className="actions foot">
            <Space size="middle">
              <Button
                type="primary"
                onClick={handleValidate}
                loading={saveLoading}
              >
                提交
              </Button>
              <Button
                onClick={() => {
                  navigate(-1);
                }}
              >
                取消
              </Button>
            </Space>
          </div>
        </div>
      </section>

      <Contract visible={visible} showModal={(obj) => showModal(obj)} />
    </div>
  );
};

export default Set;