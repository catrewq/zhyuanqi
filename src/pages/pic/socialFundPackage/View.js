import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  message,
  Spin
} from 'antd';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList, fetchAllData } from 'src/utils/apiData';
import { getMoment } from 'src/utils/dateFormatDayjs';
import { useTabLocation } from 'src/utils/navigateUtil';
import { accountTypes } from './data';
import { getPostData_obj } from "src/utils/util";
const View = () => {
  const location = useTabLocation();
  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [personList, setPersonList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [residenceTypeList, setResidenceTypeList] = useState([]);
  const [pinLoading, setPinLoading] = useState(false);
  //const crumbs = ['社保套餐维护', '查看'];

    // 即时查询城市
    const getCityList = async (value) => {
      setPinLoading(true); // 开始加载，显示加载动画
      let labels = { name: value };
      try {
        // const start = (currentPage - 1) * pageSize;
        // const end = start + pageSize;
        // const obj = { ...getPostData_obj(value) };
  
        // const response = await fetchList(start, end, apis.city, obj);
        // setCityList(response?.data?.data);
        const obj = { ...getPostData_obj(labels) };
        fetchAllData(apis.city, obj)
          .then(allData => {
            console.log(allData.data); // 打印所有的数据
            setCityList(allData.data);
            setPinLoading(false);
          })
          .catch(error => {
            console.error(error); // 打印错误信息
          });
      } catch (error) {
        console.error(error);
      }
    };
  

  // 城市
  const handleCityIdChange = (v) => {
    form.setFieldValue('cityPersonId', undefined);
    form.setFieldValue('sfUnionCustId', undefined);
    getCustomerList();
  };

  // 是否大户
  // const handleIsHugeCustomerChange = (v) => {
  //   // console.log(v);
  //   form.setFieldValue('customerId', undefined);
  //   getCustomerList();
  // };

  // 城市人员类别
  // const getPersonList = async (id) => {
  //   const { data } = await fetchList(0, 200, `${apis.cityPersonType}`, {
  //     id,
  //   });
  //   setPersonList(data.data);
  // };

  // 参保账户/供应商
  // const getCustomerList = async (obj) => {
  //   let cityId = form.getFieldValue('cityId'),
  //     isHugeCustomer = form.getFieldValue('isHugeCustomer');
  //   if (!cityId || isHugeCustomer === undefined) {

  //     return;
  //   }
  //   let postData = { search_EQ_cityId: cityId } || obj,
  //     start = 0,
  //     length = 10;
  //   isHugeCustomer
  //     ? (postData.search_EQ_srcType = 3)
  //     : (postData.search_IN_srcType = '1,2');
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
      message.success('查询成功，请选择参保账户！');
      setCustomerList(data.data);
    } else {
      message.warning('该城市下无对应参保账户');
      form.setFieldValue('sfUnionCustId', undefined);
      setCustomerList([]);
    }

  };

  useEffect(() => {
    if (!firstRender) {
      let state = location.state;
      setId(state?.id);

      // const getList = async () => {
      //   const { data } = await fetchList(0, 200, `${apis.city}`);
      //   setCityList(data.data);
      // };
      // getList();

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
      setLoading(true);
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.package}`);
        if (data.success) {
          let obj = { ...data.data };
          if (obj.entry?.length) {
            for (const item of obj.entry) {
              // item.startMonth = dayjs(String(item.startMonth));
              // item.endMonth = item.endMonth
              //   ? dayjs(String(item.endMonth))
              //   : null;
              item.startMonth = getMoment(item.startMonth);
              item.endMonth = getMoment(item.endMonth);
            }
          }
          console.log(obj.resEntry);
          // 设置其他表单值
          form.setFieldsValue(obj);


          // getPersonList(obj.cityId);
          let postData = { search_EQ_cityId: obj.cityId, search_EQ_srcType: obj.sfUnionCustSrcType };
          getCustomerList(postData);

          let residenceTypeIds = [];
          if (obj.checkAllResidenceType) {
            residenceTypeIds = residenceTypeList.map(item => item.id);
            console.log(residenceTypeIds);
          } else {
            residenceTypeIds = obj.resEntry?.map(entry => entry.residenceTypeId) || [];
          }

          form.setFieldsValue({ residenceTypeId: residenceTypeIds });


          setLoading(false);
        }
      };

      getDetail(id);
      getCityList();
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
    <div className="detail-page">
      {/* <FixHeader crumbs={crumbs} /> */}

      <section>
        <div className="title">
          <span>查看社保套餐</span>
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
            // scrollToFirstError={true}
            >
              <div className="items">
                <div className="item">
                  <Form.Item label="社保套餐名称" name="name" rules={rules}>
                    <Input placeholder="请输入" />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="城市" name="cityId" rules={rules}>
                    <Select
                      fieldNames={{
                        label: 'name',
                        value: 'id',
                      }}
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
                {/* <div className="item">
                  <Form.Item
                    label="城市人员类别"
                    name="cityPersonId"
                    rules={rules}
                  >
                    <Select
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
                  <Form.Item
                    label="是否大户"
                    name="isHugeCustomer"
                    rules={rules}
                  >
                    <Select
                      onChange={handleIsHugeCustomerChange}
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
                      disabled={id ? true : false}
                      fieldNames={{
                        label: 'name',
                        value: 'id',
                      }}
                      filterOption={(input, option) =>
                        (option?.name ?? '').includes(input)
                      }
                      optionFilterProp="children"
                      options={residenceTypeList}
                      showSearch
                      placeholder="请选择"
                    />
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
                      options={[
                        { label: '否', value: false },
                        { label: '是', value: true },
                      ]}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="sub-items sub-items-small">
                <div className="inner">
                  <Space size="small" align="baseline">
                    <div className="fake-label">起始月</div>
                    <div className="fake-label">截止月</div>
                    <div className="fake-label">险种类别</div>
                    <div className="fake-label">社保/公积金组</div>
                    <div className="fake-label">是否默认</div>
                    {/* <div className="fake-label">险种比例名称</div>
                    <div className="fake-label">产品比例ID</div> */}
                    <div className="fake-label">企业比例</div>
                    <div className="fake-label">个人比例</div>
                    {/* <div className="fake-label">企业附加</div>
                    <div className="fake-label">个人附加</div> */}
                    <div className="fake-label">企业固定金额</div>
                    <div className="fake-label">个人固定金额</div>
                    <div className="fake-label">付费频率</div>
                    <div className="fake-label">年缴月</div>
                  </Space>
                  <Form.List name="entry">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field, index) => (
                          <div key={index}>
                            <Space size="small" align="baseline">
                              <Form.Item
                                label=""
                                // 起始月
                                name={[field.name, 'startMonth']}
                                rules={rules}
                              >
                                <DatePicker
                                  format="YYYYMM"
                                  picker="month"
                                  placeholder="请选择"
                                  allowClear={false}
                                />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 截止月
                                name={[field.name, 'endMonth']}
                              >
                                <DatePicker
                                  format="YYYYMM"
                                  picker="month"
                                  placeholder="请选择"
                                  allowClear={false}
                                />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 险种类别
                                name={[field.name, 'insTypeName']}
                              >
                                <Input readOnly />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 社保/公积金组
                                name={[field.name, 'sfRateGroupName']}
                              >
                                <Input readOnly />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 是否默认
                                name={[field.name, 'isDefault']}
                                rules={rules}
                              >
                                <Select
                                  options={[
                                    { label: '否', value: false },
                                    { label: '是', value: true },
                                  ]}
                                />
                              </Form.Item>
                              {/* <Form.Item
                                label=""
                                // 险种比例名称
                                name={[field.name, 'name']}
                              >
                                <Input readOnly />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 产品比例ID
                                name={[field.name, 'id']}
                              >
                                <Input readOnly />
                              </Form.Item> */}
                              <Form.Item
                                label=""
                                // 企业比例
                                name={[field.name, 'entRate']}
                              >
                                <Input readOnly suffix="%" />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 个人比例
                                name={[field.name, 'pslRate']}
                              >
                                <Input readOnly suffix="%" />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 企业固定金额
                                name={[field.name, 'entAddAmt']}
                              >
                                <Input readOnly />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 个人固定金额
                                name={[field.name, 'pslAddAmt']}
                              >
                                <Input readOnly />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 付费频率
                                name={[field.name, 'ctbFreq']}
                              >
                                <Input readOnly />
                              </Form.Item>
                              {/* <Form.Item
                                label=""
                                // 企业固定金额
                                name={[field.name, 'entAmt']}
                              >
                                <Input readOnly />
                              </Form.Item>
                              <Form.Item
                                label=""
                                // 个人固定金额
                                name={[field.name, 'pslAmt']}
                              >
                                <Input readOnly />
                              </Form.Item> */}
                              <Form.Item
                                label=""
                                // 年缴月
                                name={[field.name, 'yearlyCtbFreqName']}
                              >
                                <Input readOnly />
                              </Form.Item>
                            </Space>
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

export default View;
