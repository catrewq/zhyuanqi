import { Divider, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList, fetchAllData } from 'src/utils/apiData';
import { useTabLocation } from 'src/utils/navigateUtil';
import { groupTypeList, reportFerqTypeList, suspendFerqTypeList } from './data';
import { getPostData_obj } from "src/utils/util";
const View = () => {
  const location = useTabLocation();
  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
  const [cityList, setCityList] = useState([]);
  //const crumbs = ['社保公积金组维护', '查看'];
  const [pinLoading, setPinLoading] = useState(false);

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

  useEffect(() => {
    if (!firstRender) {
      let state = location.state;
      setId(state?.id);

      // const getList = async () => {
      //   const { data } = await fetchList(0, 200, `${apis.city}`);
      //   setCityList(data.data);
      // };
      // getList();
    }
    setFirstRender(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  useEffect(() => {
    if (id) {
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.group}`);
        if (data.success) {
          let obj = { ...data.data };
          //
          for (const item of obj.entry) {
            item.oprInfo = {
              operate: 'UPDATE',
            };
          }
          // 险种比例分录
          for (const item of obj.rateEntry) {
            item.oprInfo = {
              operate: 'UPDATE',
            };
          }
          // 办理方式分录
          for (const item of obj.reportEntry) {
            item.oprInfo = {
              operate: 'UPDATE',
            };
          }
          // 停办方式分录
          for (const item of obj.suspendEntry) {
            item.oprInfo = {
              operate: 'UPDATE',
            };
          }
          form.setFieldsValue(obj);
        }
      };

      getDetail(id);
      getCityList() && console.log(12);//修改，点击详情立刻获取所有城市数据
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


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
          <span>查看社保公积金组</span>
        </div>

        <div className="form">
          <Form
            colon={false}
            disabled
            form={form}
            initialValues={{
              entry: [],
              rateEntry: [
                {
                  socialFundRateId: '',
                  socialFundRateName: '',
                  seq: '',
                  oprInfo: { operate: 'ADD' },
                },
              ],
              reportEntry: [
                {
                  typeName: '新开户',
                  oprInfo: { operate: 'ADD' },
                },
                {
                  typeName: '转入',
                  oprInfo: { operate: 'ADD' },
                },
              ],
              suspendEntry: [],
            }}
            labelAlign="right"
            layout="vertical"
            name="add_form"
          >
            <div className="items">
              <div className="item">
                <Form.Item label="组名称" name="name" rules={rules}>
                  <Input placeholder="请输入" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="组类别" name="groupType" rules={rules}>
                  <Select options={groupTypeList} placeholder="请选择" />
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
                    optionFilterProp="children"
                    options={cityList}
                    showSearch
                    placeholder="请选择"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="申报频率" name="reportFerqType" rules={rules}>
                  <Select options={reportFerqTypeList} placeholder="请选择" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="停办频率"
                  name="suspendFerqType"
                  rules={rules}
                >
                  <Select options={suspendFerqTypeList} placeholder="请选择" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="补缴频率"
                  name="makeUpCtbFerqType"
                  rules={rules}
                >
                  <Select
                    options={[
                      {
                        label: '当月',
                        value: 1,
                      },
                      {
                        label: '次月',
                        value: 2,
                      },
                    ]}
                    placeholder="请选择"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="年度调整月"
                  name="yearlyAdjMonth"
                  rules={rules}
                >
                  <InputNumber
                    controls={false}
                    min="1"
                    max="12"
                    step="1"
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="办理截止日"
                  name="repDeadLineDate"
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
                  label="停办截止日"
                  name="susDeadLineDate"
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
                  label="是否有滞纳金"
                  name="isOverDuePay"
                  rules={rules}
                >
                  <Select
                    options={[
                      {
                        label: '是',
                        value: true,
                      },
                      {
                        label: '否',
                        value: false,
                      },
                    ]}
                    placeholder="请选择"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="社平工资"
                  name="socialAvgSalary"
                  rules={rules}
                >
                  <InputNumber
                    controls={false}
                    step="0.01"
                    precision="2"
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="最低工资" name="lowestSalary" rules={rules}>
                  <InputNumber
                    controls={false}
                    step="0.01"
                    precision="2"
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
            </div>
            <div className="sub-items sub-items-small">
              <Divider orientation="left" orientationMargin="0">
                下属产品
              </Divider>
              <div className="inner">
                <Space size="small" align="baseline">
                  <div className="fake-label">险种类别</div>
                  <div className="fake-label">企业基数次级</div>
                  <div className="fake-label">个人基数次级</div>
                  <div className="fake-label">是否必须</div>
                  <div className="fake-label">是否每月支付</div>
                  <div className="fake-label">是否强制补缴</div>
                  <div className="fake-label">是否可补缴</div>
                  <div className="fake-label">是否可跨年补缴</div>
                  <div className="fake-label">补缴月数</div>
                  <div className="fake-label">是否按平均工资补缴</div>
                </Space>
                <Form.List name="entry">
                  {(fields) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={index}>
                          <Form.Item noStyle shouldUpdate>
                            {({ getFieldValue }) =>
                              getFieldValue('entry')[index].oprInfo.operate !==
                              'REMOVE' && (
                                <Space size="small" align="baseline">
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'insTypeName']}
                                  >
                                    <Input readOnly />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'entSubBase']}
                                    rules={rules}
                                  >
                                    <Input placeholder="请输入" />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'pslSubBase']}
                                    rules={rules}
                                  >
                                    <Input placeholder="请输入" />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'isRequired']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={[
                                        {
                                          label: '是',
                                          value: true,
                                        },
                                        {
                                          label: '否',
                                          value: false,
                                        },
                                      ]}
                                      placeholder="请选择"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'isMonthlyPay']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={[
                                        {
                                          label: '是',
                                          value: true,
                                        },
                                        {
                                          label: '否',
                                          value: false,
                                        },
                                      ]}
                                      placeholder="请选择"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    // 是否可补缴
                                    name={[field.name, 'isForceMakeUpCtb']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={[
                                        {
                                          label: '是',
                                          value: true,
                                        },
                                        {
                                          label: '否',
                                          value: false,
                                        },
                                      ]}
                                      placeholder="请选择"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'allowMakeUpCtb']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={[
                                        {
                                          label: '是',
                                          value: true,
                                        },
                                        {
                                          label: '否',
                                          value: false,
                                        },
                                      ]}
                                      placeholder="请选择"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    // 是否可跨年补缴
                                    name={[field.name, 'allowMuiltYearMakeUp']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={[
                                        {
                                          label: '是',
                                          value: true,
                                        },
                                        {
                                          label: '否',
                                          value: false,
                                        },
                                      ]}
                                      placeholder="请选择"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    //  补缴月数
                                    name={[field.name, 'makeUpCtbMonth']}
                                    rules={rules}
                                  >
                                    <InputNumber
                                      controls={false}
                                      min="0"
                                      max="12"
                                      placeholder="请输入"
                                      step="1"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    // 是否按平均工资补缴
                                    name={[field.name, 'isMakeUpWithAvgSalary']}
                                    rules={rules}
                                  >
                                    <Select
                                      options={[
                                        {
                                          label: '是',
                                          value: true,
                                        },
                                        {
                                          label: '否',
                                          value: false,
                                        },
                                      ]}
                                      placeholder="请选择"
                                    />
                                  </Form.Item>
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
            </div>

            <div className="sub-items">
              <Divider orientation="left" orientationMargin="0">
                险种比例
              </Divider>
              <Space size="small" align="baseline">
                <div className="fake-label">险种类别</div>
                <div className="fake-label">险种比例名称</div>
                <div className="fake-label">优先级排序</div>
              </Space>
              <Form.List name="rateEntry">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={index}>
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) =>
                            getFieldValue('rateEntry')[index].oprInfo
                              .operate !== 'REMOVE' && (
                              <Space size="small" align="baseline">
                                <Form.Item
                                  label=""
                                  name={[field.name, 'insTypeName']}
                                >
                                  <Input readOnly />
                                </Form.Item>
                                <Form.Item
                                  label=""
                                  name={[field.name, 'socialFundRateName']}
                                  rules={rules}
                                >
                                  <Input placeholder="请选择" readOnly />
                                </Form.Item>
                                <Form.Item label="" name={[field.name, 'seq']}>
                                  <Input placeholder="请输入" />
                                </Form.Item>
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

            <div className="sub-items">
              <Divider orientation="left" orientationMargin="0">
                办理方式
              </Divider>
              <Space size="small" align="baseline">
                <div className="fake-label">办理方式</div>
                <div className="fake-label">办理方式编号</div>
              </Space>
              <Form.List name="reportEntry">
                {(fields) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={index}>
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) =>
                            getFieldValue('reportEntry')[index].oprInfo
                              .operate !== 'REMOVE' && (
                              <Space size="small" align="baseline">
                                <Form.Item
                                  label=""
                                  name={[field.name, 'typeName']}
                                  rules={rules}
                                >
                                  <Input placeholder="请输入" />
                                </Form.Item>
                                <Form.Item label="">
                                  <Input value={index + 1} />
                                </Form.Item>
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

            <div className="sub-items">
              <Divider orientation="left" orientationMargin="0">
                停办方式
              </Divider>
              <Space size="small" align="baseline">
                <div className="fake-label">停办方式</div>
                <div className="fake-label">停办方式编号</div>
              </Space>
              <Form.List name="suspendEntry">
                {(fields) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={index}>
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) =>
                            getFieldValue('suspendEntry')[index].oprInfo
                              .operate !== 'REMOVE' && (
                              <Space size="small" align="baseline">
                                <Form.Item
                                  label=""
                                  name={[field.name, 'typeName']}
                                >
                                  <Input placeholder="请输入" />
                                </Form.Item>
                                <Form.Item label="">
                                  <Input value={index + 1} />
                                </Form.Item>
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

          <div className="actions"></div>
        </div>
      </section>
    </div>
  );
};

export default View;
