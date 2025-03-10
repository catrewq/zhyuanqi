import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Skeleton,
  Space,
  Spin
} from 'antd';
import { useEffect, useState } from 'react';
//import { useLocation, useNavigate } from 'react-router-dom';
import apis from 'src/utils/apiBravo';
import { fetchAllData, fetchDetail } from 'src/utils/apiData';
import axios from 'src/utils/axios';
import { dateFormat, getMoment } from 'src/utils/dateFormatDayjs';
import { useTabLocation, useTabNavigate } from 'src/utils/navigateUtil';
import { getPostData_obj } from "src/utils/util";
import { ctbFreqList, insTypeList, precisionList, roundTypeList } from './data';
export default function SocialFundRateAdd() {
  const location = useTabLocation();
  const navigate = useTabNavigate();
  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [details, setDetails] = useState({});
  const [currentPage] = useState(1);
  const [pageSize] = useState(50);
  // const [isEntZeros, setIsEntZeros] = useState(null);
  // const [isPslZeros, setIsPslZeros] = useState(null);
  // const [isEntRateZeros, setIsEntRateZeros] = useState(null);
  // const [isPslRateZeros, setIsPslRateZeros] = useState(null);
  // const crumbs = ['社保公积金比例维护', `${id ? '修改' : '新增'}险种比例`];

  // 企业基数范围
  const handleEntBaseRangeChange = ({ target: { value } }, currentIndex) => {
    let isDoubleBase = form.getFieldValue('isDoubleBase');
    // console.log(currentIndex);
    // 是否双基数为否 个人基数范围=企业基数范围
    if (!isDoubleBase) {
      let arr = [...form.getFieldValue('subList')];
      for (const [index, item] of arr.entries()) {
        if (index === currentIndex) {
          item.pslBaseRange = value;
        }
      }
      form.setFieldValue('subList', arr);
    }
  };

  // 缴费频率
  const onCtbFreqChange = (v) => {
    form.setFieldsValue({
      yearlyCtbMonth: null,
      monthlyEntAmt: null,
      monthlyPslAmt: null,
    });
  };


  // const handleEntAddAmtChange = (value) => {
  //   const e = parseInt(value, 10);
  //   if (isNaN(e)) {;
  //     console.log(e);
  //     form.setFieldsValue({
  //       entAddAmt: null
  //     });
  //   }
  // };

  // // 个人比例
  // const handlePslAddAmtChange = (value) => {
  //   const e = parseInt(value, 10);
  //   if (!isNaN(value)) {
  //     form.setFieldsValue({
  //       pslAddAmt: null,
  //     });
  //   }
  // }

  const handleRemove = (currentIndex) => {
    let arr = [...form.getFieldValue('subList')];
    arr[currentIndex].oprInfo.operate = 'REMOVE';
    form.setFieldValue('subList', arr);
  };

  // 处理 entBaseRange 的 onBlur 事件 
  const handleEntBaseRangeBlur = (e, index, name) => {
    const value = e.target.value;
    const [min, max] = value.split('-').map(num => (num === '' ? NaN : Number(num)));
    if (!isNaN(max) && min > max) {
      message.error(`${name} 的第一个数不能大于第二个数`);
      const newSubList = [...form.getFieldValue('subList')];
      newSubList[index].entBaseRange = '';
      form.setFieldsValue({ subList: newSubList });
    }
  };
  // 处理 pslBaseRange 的 onBlur 事件
  const handlePslBaseRangeBlur = (e, index, name) => {
    const value = e.target.value;
    const [min, max] = value.split('-').map(num => (num === '' ? NaN : Number(num)));
    if (!isNaN(max) && min > max) {
      message.error(`${name} 的第一个数不能大于第二个数`);
      const newSubList = [...form.getFieldValue('subList')];
      newSubList[index].pslBaseRange = '';
      form.setFieldsValue({ subList: newSubList });
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
    // setSaveLoading(true);
    let postData = { ...form.getFieldsValue(true) },
      arr = [];
    for (const item of postData.subList) {
      let obj = { ...item };
      obj.startMonth && (obj.startMonth = Number(dateFormat(obj.startMonth, "YYYYMM")));
      obj.endMonth && (obj.endMonth = Number(dateFormat(obj.endMonth, "YYYYMM")));
      arr.push(obj);
    }
    // if (isEntRateZeros !== 0 && isPslRateZeros !== 0) {
    arr.forEach(item => {
      // 转换 entBaseRange 和 pslBaseRange 为数字范围数组
      let entBaseRange = item.entBaseRange.split('-').map(num => (num === '' ? NaN : Number(num)));
      let pslBaseRange = item.pslBaseRange.split('-').map(num => (num === '' ? NaN : Number(num)));
      // 验证范围
      if (!isNaN(entBaseRange[1]) && entBaseRange[0] > entBaseRange[1]) {
        throw new Error('entBaseRange 的第一个数不能大于第二个数');
      }
      if (!isNaN(pslBaseRange[1]) && pslBaseRange[0] > pslBaseRange[1]) {
        throw new Error('pslBaseRange 的第一个数不能大于第二个数');
      }
      // 重新设置 item 的范围值为数字数组
      // item.entBaseRange = entBaseRange;
      // item.pslBaseRange = pslBaseRange;
      item.entBaseRange = item.entBaseRange;
      // 保留原始的字符串 "1-6" 
      item.pslBaseRange = item.pslBaseRange;
      // 保留原始的字符串 "1-6"
    });
    postData.entry = [...arr];
    // delete postData.entry;
    // }

    delete postData.subList;
    console.log('handleSubmit', postData);
    const fields = ['entRate', 'pslRate', 'entAddAmt', 'pslAddAmt', 'monthlyEntAmt', 'monthlyPslAmt'];
    fields.forEach(field => {
      postData[field] = Number(postData[field]);
    });
    if (postData.yearlyCtbFreq !== 21) {
      delete postData.monthlyEntAmt;
      delete postData.monthlyPslAmt;
    }

    console.log((postData));
    const { data } = await axios({
      // data: JSON.stringify(postData),
      data: postData,
      headers: { 'Content-Type': 'application/json' },
      method: id ? 'put' : 'post',
      url: id ? `${apis.rate}/update` : `${apis.rate}/create`,
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
      //   const { data } = await fetchList(0, 200, `${apis.city}`, {
      //     search_EQ_baseStatus: 0,
      //   });
      //   setCityList(data.data);
      // };
      // getList();
    }
    setFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.rate}`);
        if (data.success) {
          let obj = { ...data.data },
            arr = [];
          for (const item of obj.entry) {
            item.startMonth = getMoment(item.startMonth);
            item.endMonth && (item.endMonth = getMoment(item.endMonth));
            item.oprInfo = {
              operate: 'UPDATE',
            };
            arr.push(item);
          }
          obj.subList = [...arr];
          // obj.entRate && setIsEntRateZeros(parseInt(obj.entRate, 10));
          // obj.pslRate && setIsPslRateZeros(parseInt(obj.entRate, 10));

          form.setFieldsValue(obj);
          setDetails(obj)
          setLoading(false);
          getCityList();//修改，点击详情立刻获取所有城市数据
        }
      };

      getDetail(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  // useEffect(() => {
  //   if (id) {
  //     details.entRate && setIsEntRateZeros(details.entRate);
  //     details.pslRate && setIsPslRateZeros(details.pslRate);
  //   }
  // }, [id, details])

  const rules = [
    {
      required: true,
      message: '',
    },
  ];

  return (
    <div className="detail-page add-modal">
      <div className='inner'>
        <section>
          <div className="title">
            <span>{`${id ? '修改' : '新增'}险种比例`}</span>
          </div>

          <Skeleton active loading={loading}>
            <div className="form">
              <Form
                colon={false}
                form={form}
                initialValues={{
                  isDoubleBase: false,
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
                <div className="items inner">
                  <div className="item">
                    <Form.Item label="险种比例名称" name="name" rules={rules}>
                      <Input placeholder="请输入" maxLength={20} />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item label="险种类别" name="insType" rules={rules}>
                      <Select
                        disabled={id ? true : false}
                        options={insTypeList}
                        placeholder="请选择"
                      />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item
                      label="是否双基数"
                      name="isDoubleBase"
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
                  <div className="item">
                    <Form.Item label="城市" name="cityId" rules={rules}>
                      <Select
                        disabled={id ? true : false}
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
                        allowClear
                        // onSearch={(e) => { getCityList(e) }}
                        // onChange={getCityList}
                        notFoundContent={pinLoading ? <Spin size="small" /> : "未找到匹配的选项"}
                        onDropdownVisibleChange={(open) => {
                          if (open) {
                            getCityList();
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                  {/* <div className="item">
                    <Form.Item label="企业比例（%）"
                      name="entRate"
                      rules={rules}
                   
                    >
                      <InputNumber
                        controls={false}
                        disabled={id ? true : false}
                        min="0"
                        max="100"
                        step="0.00001"
                        precision="5"
                        stringMode
                        placeholder="请输入"
                        onChange={(value) => {
                          setIsEntRateZeros(parseInt(value, 10));
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item
                      label="个人比例（%）"
                      name="pslRate"
                      rules={[
                        {
                          required: isPslZeros !== 0,
                          message: isPslZeros !== 0 ? '必填项不能为空' : undefined,
                        },
                      ]}
                    >
                      <InputNumber
                        controls={false}
                        disabled={id ? true : false}
                        min="0"
                        max="100"
                        step="0.00001"
                        precision="5"
                        stringMode
                        placeholder="请输入"
                        onChange={(value) => {
                          setIsPslRateZeros(parseInt(value, 10));
                        }}
                      />
                    </Form.Item>
                  </div> */}
                  <div className="item">
                    <Form.Item label="企业比例（%）"
                      name="entRate"
                      rules={rules}
                    >
                      <InputNumber
                        controls={false}
                        disabled={id ? true : false}
                        min="0"
                        max="100"
                        step="0.00001"
                        precision="5"
                        stringMode
                        placeholder="请输入"
                      // onChange={(value) => {
                      //   setIsEntRateZeros(parseInt(value, 10));
                      //   handleEntAddAmtChange(value)
                      // }}
                      />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item
                      label="个人比例（%）"
                      name="pslRate"
                      rules={rules}
                    >
                      <InputNumber
                        controls={false}
                        disabled={id ? true : false}
                        min="0"
                        max="100"
                        step="0.00001"
                        precision="5"
                        stringMode
                        placeholder="请输入"
                      // onChange={(value) => {
                      //   setIsPslRateZeros(parseInt(value, 10));
                      //   handlePslAddAmtChange(value);
                      // }}
                      />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item label="企业固定金额" name="entAddAmt">
                      <Input disabled={id ? true : false} placeholder="请输入" />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item label="个人固定金额" name="pslAddAmt">
                      <Input disabled={id ? true : false} placeholder="请输入" />
                    </Form.Item>
                  </div>
                  {/* <div className="item">
                    <Form.Item
                      label="企业固定金额"
                      name="entAddAmt"
                      rules={[
                        {
                          required: isEntRateZeros == 0,
                          message: isEntRateZeros == 0 ? '必填项不能为空' : undefined,
                        },
                      ]}
                    >
                      <Input
                        disabled={id ? true : (isEntRateZeros === 0 ? false : true)}
                        placeholder="请输入"
                      // onChange={handleEntAddAmtChange}
                      />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item
                      label="个人固定金额"
                      name="pslAddAmt"
                      rules={[
                        {
                          required: isPslRateZeros == 0,
                          message: isPslRateZeros == 0 ? '必填项不能为空' : undefined,
                        },
                      ]}
                    >
                      <Input
                        disabled={id ? true : (isPslRateZeros === 0 ? false : true)}
                        placeholder="请输入"
                      // onChange={handlePslAddAmtChange}
                      />
                    </Form.Item>
                  </div> */}
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
                      <Select
                        disabled={id ? true : false}
                        onChange={onCtbFreqChange}
                        options={ctbFreqList}
                        placeholder="请选择"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) =>
                      [20, 21].includes(getFieldValue('yearlyCtbFreq')) && (
                        <div className="item">
                          <Form.Item label="年缴月" name="yearlyCtbMonth">
                            <InputNumber
                              controls={false}
                              disabled={id ? true : false}
                              min="1"
                              max="12"
                              step="1"
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
                        <>
                          <div className="item">
                            <Form.Item label="每月企业金额" name="monthlyEntAmt">
                              <InputNumber
                                controls={false}
                                disabled={
                                  id && [10, 20].includes(getFieldValue('yearlyCtbFreq'))
                                    ? true
                                    : false
                                }
                                placeholder="请输入"
                              />
                            </Form.Item>
                          </div>
                          <div className="item">
                            <Form.Item label="每月个人金额" name="monthlyPslAmt">
                              <InputNumber
                                controls={false}
                                disabled={
                                  id && [10, 20].includes(getFieldValue('yearlyCtbFreq'))
                                    ? true
                                    : false
                                }
                                placeholder="请输入"
                              />
                            </Form.Item>
                          </div>
                        </>
                      )
                    }
                  </Form.Item>
                </div>
                {/* {isEntRateZeros !== null && isPslRateZeros !== null && (isEntRateZeros !== 0 && isPslRateZeros !== 0) && ( */}
                <div className="sub-items">
                  <Space size="small" align="baseline">
                    <div className="fake-label">起始月份</div>
                    <div className="fake-label">截止月份</div>
                    <div className="fake-label">企业基数范围</div>
                    <div className="fake-label">个人基数范围</div>
                  </Space>
                  <Form.List name="subList">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field, index) => (
                          <div key={index}>
                            <Form.Item noStyle shouldUpdate>
                              {({ getFieldValue }) =>
                                getFieldValue('subList')[index].oprInfo
                                  .operate !== 'REMOVE' && (
                                  <Space size="small" align="baseline">
                                    {/* <Form.Item label="">
                                  <div>
                                    {
                                      getFieldValue('subList')[index].oprInfo
                                        .operate
                                    }
                                  </div>
                                </Form.Item> */}

                                    <Form.Item
                                      label=""
                                      name={[field.name, 'startMonth']}
                                      rules={rules}
                                    >
                                      <DatePicker
                                        format="YYYYMM"
                                        picker="month"
                                        placeholder="起始月份"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'endMonth']}
                                    >
                                      <DatePicker
                                        format="YYYYMM"
                                        picker="month"
                                        placeholder="截止月份"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'entBaseRange']}
                                      rules={rules}
                                    >
                                      <Input
                                        placeholder="请输入"
                                        onChange={(e) =>
                                          handleEntBaseRangeChange(e, index)
                                        }
                                        onBlur={(e) => handleEntBaseRangeBlur(e, index, "企业基数范围")}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'pslBaseRange']}
                                      rules={rules}
                                    >
                                      <Input
                                        placeholder="请输入"
                                        disabled={
                                          !getFieldValue('isDoubleBase')
                                            ? true
                                            : false
                                        }
                                        onBlur={(e) => handlePslBaseRangeBlur(e, index, "个人基数范围")}
                                      />
                                    </Form.Item>
                                    {/* {index ? (
                                    <MinusCircleOutlined
                                      className="btns"
                                      // onClick={() => {
                                      //   id
                                      //     ? handleRemove(index)
                                      //     : remove(field.name);
                                      // }}
                                      onClick={() => {
                                        let arr = [
                                          ...form.getFieldValue('subList'),
                                        ];
                                        if (!arr[index].id) {
                                          remove(field.name);
                                        } else {
                                          handleRemove(index);
                                        }
                                      }}
                                    />
                                  ) : null} */}
                                    <MinusCircleOutlined
                                      className="btns"
                                      // onClick={() => {
                                      //   id
                                      //     ? handleRemove(index)
                                      //     : remove(field.name);
                                      // }}
                                      onClick={() => {
                                        let arr = [
                                          ...form.getFieldValue('subList'),
                                        ];
                                        if (!arr[index].id) {
                                          remove(field.name);
                                        } else {
                                          handleRemove(index);
                                        }
                                      }}
                                    />

                                    {/* {fields.length === index + 1 && ( */}
                                    <PlusCircleOutlined
                                      className="btns"
                                      onClick={() =>
                                        add({
                                          entBaseRange: '',
                                          pslBaseRange: '',
                                          startMonth: undefined,
                                          endMonth: undefined,
                                          oprInfo: { operate: 'ADD' },
                                        })
                                      }
                                    />
                                    {/* )} */}
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
                {/* )} */}
              </Form>

              <div className="actions">
                <Space size="middle">
                  <Button
                    type="primary"
                    onClick={handleValidate}
                    // onClick={handleSubmit}
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
          </Skeleton>
        </section>
      </div>
    </div>
  );
}