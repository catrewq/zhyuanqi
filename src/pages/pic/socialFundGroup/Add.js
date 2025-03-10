import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
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
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList, fetchAllData } from 'src/utils/apiData';
import axios from 'src/utils/axios';
import { useTabLocation, useTabNavigate } from 'src/utils/navigateUtil';
import Pick from './components/Pick';
import { groupTypeList, reportFerqTypeList, suspendFerqTypeList } from './data';
import { getPostData_obj } from "src/utils/util";
const { Search } = Input;

const Add = () => {
  const location = useTabLocation();
  const navigate = useTabNavigate();
  const [form] = Form.useForm();
  const [firstRender, setFirstRender] = useState(true);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [cityId, setCityId] = useState(null);
  const [rateEntryIndex, setRateEntryIndex] = useState(null);
  const crumbs = ['社保公积金组维护', `${id ? '修改' : '新增'}社保公积金组`];
  // const [currentPage] = useState(1);
  // const [pageSize] = useState(50);
  // 组类别
  const handleGroupTypeChange = (v) => {
    console.log(v);
    let arr = [...form.getFieldValue('suspendEntry')];
    if (!arr.length) {
      // 1社保 2公积金
      arr = [
        {
          typeName: v === 1 ? '停缴' : '封存',
          oprInfo: { operate: 'ADD' },
        },
        {
          typeName: '转出',
          oprInfo: { operate: 'ADD' },
        },
      ];
    }
    form.setFieldValue('suspendEntry', arr);
  };

  // 是否可补缴
  const handleAllowMakeUpCtbChange = (v, currentIndex) => {
    if (!v) {
      let arr = [...form.getFieldValue('entry')];
      arr[currentIndex].allowMuiltYearMakeUp = false;
      arr[currentIndex].makeUpCtbMonth = 0;
      form.setFieldValue('entry', arr);
    }
  };

  // // 险种比例删除
  // const handleRemoveRateEntry = (currentIndex) => {
  //   let arr = [...form.getFieldValue('rateEntry')];
  //   arr[currentIndex].oprInfo.operate = 'REMOVE';
  //   form.setFieldValue('rateEntry', arr);
  // };

  // 险种比例删除/办理方式删除/停办方式删除
  const handleRemove = (currentIndex, type) => {
    let arr = [...form.getFieldValue(type)];
    arr[currentIndex].oprInfo.operate = 'REMOVE';
    console.log(type, arr);
    form.setFieldValue(type, arr);

    if (type === 'rateEntry') {
      getProducts(arr);
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
    let postData = { ...form.getFieldsValue(true) };
    console.log('handleSubmit', postData);
    postData.rateEntry = postData.rateEntry.filter(item => item.oprInfo.operate !== 'REMOVE');

    const { data } = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: id ? 'put' : 'post',
      url: id ? `${apis.group}/update` : `${apis.group}/create`,
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

  // 选择
  const onSearch = (_, __, index) => {
    console.log(index);
    let cityId = form.getFieldValue('cityId');
    if (!cityId) {
      message.warning('请先选择城市');
      return;
    }
    setCityId(cityId);
    setRateEntryIndex(index);
    showModal();
  };

  const showModal = (obj) => {
    setVisible(!visible);
    if (obj && Object.keys(obj).length) {
      console.log(obj);
      const {
        // insType,
        insTypeName,
        id: socialFundRateId,
        name: socialFundRateName,
      } = obj;

      // 险种比例
      let arr = [...form.getFieldValue('rateEntry')],
        ids = [];
      // 新增修改时，如页面选择后未提交前，删除下方已选择险种，再次点击+，点击选择产品比例时，页面删除险种无法再次选择
      for (const item of arr) {
        if (item.oprInfo.operate !== 'REMOVE') {
          ids.push(item.socialFundRateId);
        }
      }
      if (!ids.includes(socialFundRateId)) {
        arr[rateEntryIndex] = {
          ...arr[rateEntryIndex],
          insTypeName,
          socialFundRateId,
          socialFundRateName,
        };
        // 重新获取下属产品
        getProducts(arr);
      }
      form.setFieldValue('rateEntry', arr);
    }
  };

  // 获取下属产品
  // const getProducts = async (rateEntry) => {
  //   let entry = [...form.getFieldValue('entry')],
  //     postData = {
  //       entry,
  //       rateEntry,
  //     };
  //   if (id) {
  //     postData.id = id;
  //     postData.oprInfo = {
  //       operate: 'UPDATE',
  //     };
  //   }
  //   console.log(postData);
  //   // rateEntry
  //   const { data } = await axios({
  //     data: JSON.stringify(postData),
  //     headers: { 'Content-Type': 'application/json' },
  //     method: 'post',
  //     url: `${apis.group}/prepare/save`,
  //   });
  //   if (data.success) {
  //     let arr = [...data.data];
  //     if (!id) {
  //       for (const item of arr) {
  //         item.oprInfo = {
  //           operate: 'UPDATE',
  //         };
  //       }
  //     }
  //     form.setFieldValue('entry', arr);
  //   } else {
  //     message.error(data.message);
  //   }
  // };

  const getProducts = async (rateEntry) => {
    let entry = [...form.getFieldValue('entry')],
      postData = {
        entry,
        rateEntry,
      };
    if (id) {
      postData.id = id;
      postData.oprInfo = {
        operate: 'UPDATE',
      };
    }
    console.log(postData);
    // 过滤掉 rateEntry 里 oprInfo.operate == 'REMOVE' 的条目 
    postData.rateEntry = postData.rateEntry.filter(item => item.oprInfo.operate !== 'REMOVE');
    // rateEntry
    const { data } = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      url: `${apis.group}/prepare/save`,
    });
    if (data.success) {
      let arr = [...data.data];
      if (!id) {
        for (const item of arr) {
          item.oprInfo = {
            operate: 'UPDATE',
          };
        }
      }
      form.setFieldValue('entry', arr);
    } else {
      message.error(data.message);
    }
  };

  // 修改险种比例排序
  const handleSeqBlur = (index, e, fieldName) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      message.error('请输入有效的数字');
    } else {
      let arr = [...form.getFieldValue('rateEntry')];
      arr[index].seq = value;
      form.setFieldValue('rateEntry', arr);
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
          setLoading(false);
        }
      };

      getDetail(id);
      getCityList();//修改，点击详情立刻获取所有城市数据
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
    <div className="detail-page add-modal">
      {/* <FixHeader crumbs={crumbs} />   */}
      <div className='inner'>
        <section>
          <div className="title">
            <span>{`${id ? '修改' : '新增'}社保公积金组`}</span>
          </div>

          <Skeleton active loading={loading}>
            <div className="form">
              <Form
                colon={false}
                form={form}
                initialValues={{
                  entry: [],
                  rateEntry: [
                    {
                      socialFundRateId: null,
                      socialFundRateName: '',
                      seq: null,
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
                      <Select
                        disabled={id ? true : false}
                        onChange={handleGroupTypeChange}
                        options={groupTypeList}
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
                  <div className="item">
                    <Form.Item
                      label="申报频率"
                      name="reportFerqType"
                      rules={rules}
                    >
                      <Select options={reportFerqTypeList} placeholder="请选择" />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item
                      label="停办频率"
                      name="suspendFerqType"
                      rules={rules}
                    >
                      <Select
                        options={suspendFerqTypeList}
                        placeholder="请选择"
                      />
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
                      <div className="fake-label">
                        <span className="required-mark">*</span>企业基数次级
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>个人基数次级
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>是否必须
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>是否每月支付
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>是否强制补缴
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>是否可补缴
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>是否可跨年补缴
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>补缴月数
                      </div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>是否按平均工资补缴
                      </div>
                    </Space>
                    <Form.List name="entry">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <div key={index}>
                              <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) =>
                                  getFieldValue('entry')[index].oprInfo
                                    .operate !== 'REMOVE' && (
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
                                        name={[field.name, 'insTypeName']}
                                      // name={[field.name, 'insType']}
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
                                          onChange={(v) =>
                                            handleAllowMakeUpCtbChange(v, index)
                                          }
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
                                        name={[
                                          field.name,
                                          'allowMuiltYearMakeUp',
                                        ]}
                                        rules={rules}
                                      >
                                        <Select
                                          disabled={
                                            getFieldValue('entry')[index]
                                              .allowMakeUpCtb === false
                                              ? true
                                              : false
                                          }
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
                                          disabled={
                                            getFieldValue('entry')[index]
                                              .allowMakeUpCtb === false
                                              ? true
                                              : false
                                          }
                                          min="0"
                                          max="12"
                                          placeholder="请输入"
                                          step="1"
                                        />
                                      </Form.Item>
                                      <Form.Item
                                        label=""
                                        // 是否按平均工资补缴
                                        name={[
                                          field.name,
                                          'isMakeUpWithAvgSalary',
                                        ]}
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
                                      <Search
                                        enterButton="选择"
                                        onSearch={(value, event) =>
                                          onSearch(value, event, index)
                                        }
                                        placeholder="请选择"
                                        readOnly
                                      />
                                    </Form.Item>
                                    {/* <Form.Item
                                      label=""
                                      name={[field.name, 'seq']}
                                    >
                                      <Input placeholder="请输入" />
                                    </Form.Item> */}
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'seq']}
                                    >
                                      <Input
                                        placeholder="请输入"
                                        onBlur={(e) => handleSeqBlur(index, e, field.name)}
                                      />
                                    </Form.Item>
                                    {index ? (
                                      <MinusCircleOutlined
                                        className="btns"
                                        onClick={() =>
                                          handleRemove(index, 'rateEntry')
                                        }
                                      />
                                    ) : null}
                                    <PlusCircleOutlined
                                      className="btns"
                                      onClick={() =>
                                        add({
                                          socialFundRateId: null,
                                          socialFundRateName: '',
                                          seq: null,
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

                <div className="sub-items">
                  <Divider orientation="left" orientationMargin="0">
                    办理方式
                  </Divider>
                  <Space size="small" align="baseline">
                    <div className="fake-label">办理方式</div>
                    <div className="fake-label">办理方式编号</div>
                  </Space>
                  <Form.List name="reportEntry">
                    {(fields, { add, remove }) => (
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
                                      <Input disabled value={index + 1} />
                                    </Form.Item>
                                    {index ? (
                                      <MinusCircleOutlined
                                        className="btns"
                                        onClick={() => {
                                          let arr = [
                                            ...form.getFieldValue('reportEntry'),
                                          ];
                                          if (!arr[index].id) {
                                            remove(field.name);
                                          } else {
                                            handleRemove(index, 'reportEntry');
                                          }
                                        }}
                                      />
                                    ) : null}
                                    {/* {fields.length === index + 1 && ( */}
                                    <PlusCircleOutlined
                                      className="btns"
                                      onClick={() =>
                                        add({
                                          typeName: '',
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

                <div className="sub-items">
                  <Divider orientation="left" orientationMargin="0">
                    停办方式
                  </Divider>
                  <Space size="small" align="baseline">
                    <div className="fake-label">停办方式</div>
                    <div className="fake-label">停办方式编号</div>
                  </Space>
                  <Form.List name="suspendEntry">
                    {(fields, { add, remove }) => (
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
                                      <Input disabled value={index + 1} />
                                    </Form.Item>
                                    {index ? (
                                      <MinusCircleOutlined
                                        className="btns"
                                        onClick={() => {
                                          let arr = [
                                            ...form.getFieldValue('suspendEntry'),
                                          ];
                                          if (!arr[index].id) {
                                            remove(field.name);
                                          } else {
                                            handleRemove(index, 'suspendEntry');
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <PlusCircleOutlined
                                      className="btns"
                                      onClick={() =>
                                        add({
                                          typeName: '',
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

        <Pick
          rateEntry={form.getFieldValue('rateEntry')}
          visible={visible}
          cityId={cityId}
          showModal={(obj) => showModal(obj)}
        />
      </div>
    </div>
  );
};

export default Add;
