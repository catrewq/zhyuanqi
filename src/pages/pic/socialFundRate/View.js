import { DatePicker, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import FixHeader from 'src/layouts/FixHeader';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList, fetchAllData, } from 'src/utils/apiData';
import { useTabLocation } from 'src/utils/navigateUtil';
import { ctbFreqList, insTypeList, precisionList, roundTypeList } from './data';
import { getPostData_obj } from "src/utils/util";
export default function Add() {
  const location = useTabLocation();
  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
  const [cityList, setCityList] = useState([]);
  const [pinLoading, setPinLoading] = useState(false);
  const crumbs = ['社保公积金比例维护', '查看'];
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
        const { data } = await fetchDetail(id, `${apis.rate}`);
        if (data.success) {
          let obj = { ...data.data },
            arr = [];
          for (const item of obj.entry) {
            item.startMonth = moment(String(item.startMonth));
            item.endMonth && (item.endMonth = moment(String(item.endMonth)));
            arr.push(item);
          }
          obj.subList = [...arr];
          form.setFieldsValue(obj);
        }
      };

      getDetail(id);
      getCityList();
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
      <FixHeader crumbs={crumbs} />

      <section>
        <div className="title">
          <span>查看险种比例</span>
        </div>
        <div className="form">
          <Form
            colon={false}
            disabled
            form={form}
            initialValues={{
              subList: [
                {
                  startMonth: undefined,
                  endMonth: undefined,
                  entBaseRange: '',
                  pslBaseRange: '',
                  oprInfo: { operate: 'ADD' },
                },
              ],
            }}
            labelAlign="right"
            layout="vertical"
            name="add_form"
          >
            <div className="items">
              <div className="item">
                <Form.Item label="险种比例名称" name="name" rules={rules}>
                  <Input placeholder="请输入" maxLength={20} />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="险种类别" name="insType" rules={rules}>
                  <Select options={insTypeList} placeholder="请选择" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="是否双基数" name="isDoubleBase" rules={rules}>
                  <Select
                    options={[
                      { label: '否', value: false },
                      { label: '是', value: true },
                    ]}
                    placeholder="请选择"
                  />
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
                <Form.Item label="企业比例（%）" name="entRate" rules={rules}>
                  <InputNumber
                    controls={false}
                    min="0"
                    max="100"
                    step="0.00001"
                    precision="5"
                    stringMode
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="个人比例（%）" name="pslRate" rules={rules}>
                  <InputNumber
                    controls={false}
                    min="0"
                    max="100"
                    step="0.00001"
                    precision="5"
                    stringMode
                    placeholder="请输入"
                  />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="企业固定金额" name="entAddAmt">
                  <Input placeholder="请输入" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="个人固定金额" name="pslAddAmt">
                  <Input placeholder="请输入" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="企业计算方式"
                  name="entRoundType"
                  rules={rules}
                >
                  <Select options={roundTypeList} placeholder="请选择" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item
                  label="个人计算方式"
                  name="pslRoundType"
                  rules={rules}
                >
                  <Select options={roundTypeList} placeholder="请选择" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="企业精度" name="entPrecision" rules={rules}>
                  <Select options={precisionList} placeholder="请选择" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="个人精度" name="pslPrecision" rules={rules}>
                  <Select options={precisionList} placeholder="请选择" />
                </Form.Item>
              </div>
              <div className="item">
                <Form.Item label="缴费频率" name="yearlyCtbFreq" rules={rules}>
                  <Select options={ctbFreqList} placeholder="请选择" />
                </Form.Item>
              </div>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) =>
                  [20, 21].includes(getFieldValue('yearlyCtbFreq')) && (
                    <div className="item">
                      <Form.Item label="年缴月" name="yearlyCtbMonth">
                        <InputNumber
                          controls={false}
                          min="1"
                          max="12"
                          step="1"
                          stringMode
                          placeholder="请输入"
                        />
                      </Form.Item>
                    </div>
                  )
                }
              </Form.Item>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) =>
                  getFieldValue('yearlyCtbFreq') === 21 && (
                    <div className="item">
                      <Form.Item label="每月企业金额" name="monthlyEntAmt">
                        <InputNumber
                          controls={false}
                          stringMode
                          placeholder="请输入"
                        />
                      </Form.Item>
                    </div>
                  )
                }
              </Form.Item>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) =>
                  getFieldValue('yearlyCtbFreq') === 21 && (
                    <div className="item">
                      <Form.Item label="每月个人金额" name="monthlyPslAmt">
                        <InputNumber
                          controls={false}
                          stringMode
                          placeholder="请输入"
                        />
                      </Form.Item>
                    </div>
                  )
                }
              </Form.Item>
            </div>
            <div className="sub-items">
              <Space size="small" align="baseline">
                <div className="fake-label">起始月份</div>
                <div className="fake-label">截止月份</div>
                <div className="fake-label">企业基数范围</div>
                <div className="fake-label">个人基数范围</div>
              </Space>
              <Form.List name="subList">
                {(fields) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={index}>
                        <Space size="small" align="baseline">
                          <Form.Item
                            label=""
                            name={[field.name, 'startMonth']}
                            rules={rules}
                          >
                            <DatePicker
                              format="YYYYMM"
                              picker="month"
                              placeholder="起始月份"
                              allowClear={false}
                            />
                          </Form.Item>
                          <Form.Item
                            label=""
                            name={[field.name, 'endMonth']}
                            rules={rules}
                          >
                            <DatePicker
                              format="YYYYMM"
                              picker="month"
                              placeholder="截止月份"
                              allowClear={false}
                            />
                          </Form.Item>
                          <Form.Item
                            label=""
                            name={[field.name, 'entBaseRange']}
                            rules={rules}
                          >
                            <Input placeholder="请输入企业基数范围" />
                          </Form.Item>
                          <Form.Item
                            label=""
                            name={[field.name, 'pslBaseRange']}
                            rules={rules}
                          >
                            <Input placeholder="请输入个人基数范围" />
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
      </section>
    </div>
  );
}
