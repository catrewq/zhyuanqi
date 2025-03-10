import { MinusCircleOutlined } from '@ant-design/icons';
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
import moment from 'moment';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
//import { useLocation, useNavigate } from 'react-router-dom';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList, fetchAllData } from 'src/utils/apiData';
import axios from 'src/utils/axios';
import { useTabLocation, useTabNavigate } from 'src/utils/navigateUtil';
import Pick from './components/Pick';
import { accountTypes } from './data';
import { dateFormat, getMoment, filterEmptyValues } from 'src/utils/dateFormatDayjs';
import { getPostData_obj } from "src/utils/util";
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
  const [personList, setPersonList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [residenceTypeList, setResidenceTypeList] = useState([]);
  const [cityId, setCityId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(50);
  // const handleChange = (values) => {
  //   setSelectedValues(values);
  // };
  // const isAllSelected = selectedValues.length === residenceTypeList.length;

  const crumbs = ['社保套餐维护', `${id ? '修改' : '新增'}`];

  // const crumbs = ['社保套餐维护', `${id ? '修改' : '新增'}`];

  // 城市
  const handleCityIdChange = (v) => {
    form.setFieldValue('cityPersonId', undefined);
    form.setFieldValue('sfUnionCustId', undefined);
    getCustomerList();
  };

  // 是否大户
  // const handleIsHugeCustomerChange = (v) => {
  //   // console.log(v);
  //   form.setFieldValue('sfUnionCustId', undefined);
  //   getCustomerList();
  // };

  // 账户类型
  const handleIdsfUnionCustSrcType = (v) => {
    // console.log(v);
    form.setFieldValue('sfUnionCustId', undefined);
    getCustomerList();
  };

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
  //     // message.warning('请选择城市和是否大户');
  //     return;
  //   }
  //   // console.log('getCustomerList');
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

  const showModal = (keys, rows) => {
    let cityId = form.getFieldValue('cityId');
    if (!cityId) {
      message.warning('请先选择城市');
      return;
    }
    setCityId(cityId);
    setVisible(!visible);
    if (keys && keys.length) {
      console.log(rows);
      let list = [...form.getFieldValue('entry')];
      let insTypeNameTracker = {};

      for (const item of rows) {
        let isDefault = false;
        if (!insTypeNameTracker[item.insTypeName]) {
          isDefault = true;
          insTypeNameTracker[item.insTypeName] = true;
        }

        // 检查 list 中是否已经存在相同的 rateId
        // if (!list.some(existingItem => existingItem.sfRateId === item.rateId)) {
        let obj = {
          startMonth: undefined,
          endMonth: undefined,
          isDefault: isDefault,
          sfRateId: item.rateId,
          id: item.rateId,
          sfRateGroupId: item.groupId,
          sfRateGroupName: item.groupName,
          sfRateGroupRateId: item.groupRateEntryId,
          everyRateId: item.id,//区分是否在entry里出现过，已在套餐中选中的比例去除不显示
          insTypeName: item.insTypeName,
          entRate: item.entRate,
          pslRate: item.pslRate,
          entAddAmt: item.entAddAmt,
          pslAddAmt: item.pslAddAmt,
          // 企业/个人计算方式和精度
          entPrecision: item.entPrecision,
          entPrecisionName: item.entPrecisionName,
          entRoundType: item.entRoundType,
          entRoundTypeName: item.entRoundTypeName,
          pslPrecision: item.pslPrecision,
          pslPrecisionName: item.pslPrecisionName,
          pslRoundType: item.pslRoundType,
          pslRoundTypeName: item.pslRoundTypeName,
          // entAmt: item.entAmt,
          // pslAmt: item.entAmt,
          yearlyCtbFreq: item.yearlyCtbFreq,
          yearlyCtbFreqName: item.yearlyCtbFreqName,
          yearlyCtbMonth: item.yearlyCtbMonth,
          name: item.name,
          oprInfo: {
            operate: 'ADD',
          },
        };
        list.push(obj);
        // }
      }
      console.log(list);
      form.setFieldValue('entry', list);
    }

  };

  const handleRemove = (currentIndex) => {
    let arr = [...form.getFieldValue('entry')];
    arr[currentIndex].oprInfo.operate = 'REMOVE';
    form.setFieldValue('entry', arr);
  };

  // 点击全部、其他选项禁用
  // const isAllSelected = selectedValues.length === residenceTypeList.length ;
  const isAllSelected = selectedValues.length === residenceTypeList.length || selectedValues.includes(0);
  const handleChange = (value) => {
    if (value.includes(0)) {
      setSelectedValues([0]);
      form.setFieldsValue({ residenceTypeId: [0] });
    } else {
      setSelectedValues(value);
      form.setFieldsValue({ residenceTypeId: value });
    }
  };

  // 创建一个字典来更快地查找 residenceTypeId 对应的 name 
  const residenceTypeIdToName = residenceTypeList.reduce((acc, item) => {
    acc[item.id] = item.name;
    return acc;
  }, {});

  const handleValidate = () => {
    form
      .validateFields()
      .then(async (values) => {
        handleSubmit();
      })
      .catch((errors) => {
        console.log(errors);
        const arr = document.querySelectorAll('.ant-form-item-has-error');
        arr[0].scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      });
  };
  const handleSubmit = async () => {
    // setSaveLoading(true);
    let postData = { ...form.getFieldsValue(true) },
      arr = [];
    // 全选 ？ 部分选
    // const isAllSelected = selectedValues.length - 1; // 减去 "全部" 选项
    if (isAllSelected) {
      postData.checkAllResidenceType = true;
      // 原有的没删除，直接选择全部，需要清值
      delete postData.resEntry;
      delete postData.resEntrySeq;
      delete postData.residenceTypeName;
    } else if (selectedValues.length > 0) {
      postData.checkAllResidenceType = false;
      postData.resEntry = selectedValues.map((a) => {
        return { residenceTypeId: a };
      })
    }

    for (const item of postData.entry) {
      let obj = { ...item };
      obj.startMonth && (obj.startMonth = Number(dateFormat(obj.startMonth, "YYYYMM")));
      obj.endMonth && (obj.endMonth = Number(dateFormat(obj.endMonth, "YYYYMM")));
      arr.push(obj);
    }
    postData.entry = [...arr];
    // delete postData.entry;
    delete postData.residenceTypeId;
    if (id) {
      // delete postData.residenceTypeName;
      // 从 resEntry 中提取所有的 residenceTypeId 对应的 name，并用逗号分隔 
      const residenceTypeNames = postData.resEntry?.map(entry => residenceTypeIdToName[entry.residenceTypeId]).join(',');
      postData.resEntrySeq = postData.resEntry?.length;
      postData.residenceTypeName = residenceTypeNames;

      // 遍历 entry 数组并移除 id 属性
      postData.entry = postData.entry.map(data => {
        if (data.oprInfo.operate === 'ADD') {
          const { id, ...rest } = data;
          // 使用解构赋值移除 id 属性 
          return rest;
        }
        return data;
      });

      // ADD不要加id,remove只保留id
      postData.entry = postData.entry.map(data => {
        if (data.oprInfo.operate === 'REMOVE') {
          const { id, ...rest } = data;
          // 使用解构赋值移除 除id 属性 
          return { id };
        }
        return data;
      });

    }
    console.log('handleSubmit', postData);
    const { data } = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: id ? 'put' : 'post',
      url: id ? `${apis.package}/update` : `${apis.package}/create`,
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

      const getResidenceList = async () => {
        const { data } = await fetchList(0, 200, `${apis.residence}`);
        // setResidenceTypeList(data.data);
        if (data.data && data.data.length > 0) {
          // 添加 "全部" 选项到数据列表的开头 
          data.data.unshift({ name: '全部', id: 0 });
        }
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
              // item.startMonth = moment(String(item.startMonth));
              // item.endMonth = item.endMonth
              //   ? moment(String(item.endMonth))
              //   : null;
              item.startMonth = getMoment(item.startMonth);
              item.endMonth = getMoment(item.endMonth);
              item.oprInfo = {
                operate: 'UPDATE',
              };
            }
          }

          form.setFieldsValue(obj);

          // getPersonList(obj.cityId);

          let postData = { search_EQ_cityId: obj.cityId, search_EQ_srcType: obj.sfUnionCustSrcType };
          getCustomerList(postData);

          let residenceTypeIds = [];
          if (obj.checkAllResidenceType) {
            // 在新增或修改时，选择“全部”只会显示“全部”这个选项，而不是展开具体的所有类型
            // residenceTypeIds = residenceTypeList.map(item => item.id);
            residenceTypeIds = residenceTypeList.filter(item => item.id === 0).map(item => item.id);
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
    <div className="detail-page add-modal">
      {/* <FixHeader crumbs={crumbs} /> */}
      <div className='inner'>
        <section>
          <div className="title">
            <span>{`${id ? '修改' : '新增'}社保套餐`}</span>
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
              // scrollToFirstError={true}
              >
                <div className="items">
                  <div className="item">
                    <Form.Item label="社保套餐名称" name="name" rules={rules}>
                      <Input placeholder="请输入" />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item label="参保城市" name="cityId" rules={rules}>
                      <Select
                        disabled={id ? true : false}
                        fieldNames={{
                          label: 'name',
                          value: 'id',
                        }}
                        filterOption={(input, option) =>
                          (option?.name ?? '').includes(input)
                        }
                        onChange={(value) => {
                          handleCityIdChange(value);
                          // getCityList();
                        }}
                        // onSearch={(e) => { getCityList(e) }}
                        optionFilterProp="children"
                        options={cityList}
                        showSearch
                        allowClear
                        placeholder="请选择"
                        notFoundContent={loading ? <Spin size="small" /> : "未找到匹配的选项"}
                        onDropdownVisibleChange={(open) => {
                          if (open) {
                            getCityList();
                          }
                        }}
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
                  {/*  */}
                  {/* <div className="item">
                  <Form.Item
                    label="是否大户"
                    name="isHugeCustomer"
                    rules={rules}
                  >
                    <Select
                      disabled={id ? true : false}
                      onChange={handleIsHugeCustomerChange}
                      options={[
                        { label: '否', value: false },
                        { label: '是', value: true },
                      ]}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div> */}
                  {/* 户籍类型复选，全选的话，checkAllResidenceTtype为true，不用传resEntry分录
                  部分的话，checkAllResidenceTtype为false, 传resEntry分录  */}
                  <div className="item">
                    <Form.Item
                      label="户籍类型"
                      name="residenceTypeId"
                      rules={rules}
                    >
                      {/* <Select
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
                        onChange={handleChange}
                      /> */}
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
                  {/* 账户类型和参保账户联动 */}
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
                        onChange={handleIdsfUnionCustSrcType}
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
                        disabled={id ? true : false}
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
                  <Button type="primary" ghost onClick={() => showModal()}>
                    新增
                  </Button>
                  <div className="inner">
                    <Space size="small" align="baseline">
                      <div className="fake-label">
                        <span className="required-mark">*</span>起始月
                      </div>
                      <div className="fake-label">截止月</div>
                      <div className="fake-label">险种类别</div>
                      <div className="fake-label">社保/公积金组</div>
                      {/* <div className="fake-label">险种比例名称</div> */}
                      <div className="fake-label">是否默认比例</div>
                      {/* <div className="fake-label">产品比例ID</div> */}
                      <div className="fake-label">企业比例</div>
                      <div className="fake-label">个人比例</div>
                      {/* <div className="fake-label">企业附加</div>
                      <div className="fake-label">个人附加</div> */}
                      <div className="fake-label">企业固定金额</div>
                      <div className="fake-label">个人固定金额</div>
                      <div className="fake-label">企业计算方式</div>
                      <div className="fake-label">个人计算方式</div>
                      <div className="fake-label">企业金额精度</div>
                      <div className="fake-label">个人金额精度</div>
                      <div className="fake-label">付费频率</div>
                      <div className="fake-label">年缴月</div>
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
                                      {/* <Form.Item
                                        label=""
                                        // 险种比例名称
                                        name={[field.name, 'name']}
                                      >
                                        <Input readOnly />
                                      </Form.Item> */}
                                      {/* <Form.Item
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
                                      </Form.Item> */}
                                      {/* <Form.Item
                                        label=""
                                        // 产品比例ID
                                        name={[field.name, 'id']}
                                      >
                                        <Input readOnly />
                                      </Form.Item> */}
                                      <Form.Item
                                        label=""
                                        // 是否默认比例
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
                                        // 企业计算方式
                                        name={[field.name, 'entRoundTypeName']}
                                      >
                                        <Input readOnly />
                                      </Form.Item>
                                      <Form.Item
                                        label=""
                                        // 个人计算方式
                                        name={[field.name, 'pslRoundTypeName']}
                                      >
                                        <Input readOnly />
                                      </Form.Item>
                                      <Form.Item
                                        label=""
                                        // 企业计算精度
                                        name={[field.name, 'entPrecisionName']}
                                      >
                                        <Input readOnly />
                                      </Form.Item>
                                      <Form.Item
                                        label=""
                                        // 个人计算精度
                                        name={[field.name, 'pslPrecisionName']}
                                      >
                                        <Input readOnly />
                                      </Form.Item>

                                      <Form.Item
                                        label=""
                                        // 付费频率
                                        name={[field.name, 'yearlyCtbFreqName']}
                                      >
                                        <Input readOnly />
                                      </Form.Item>
                                      <Form.Item
                                        label=""
                                        // 年缴月
                                        name={[field.name, 'yearlyCtbMonth']}
                                      >
                                        <Input readOnly />
                                      </Form.Item>
                                      {/* {index ? ( */}
                                      <MinusCircleOutlined
                                        className="btns"
                                        onClick={() => {
                                          let arr = [
                                            ...form.getFieldValue('entry'),
                                          ];
                                          if (
                                            arr[index].oprInfo.operate === 'ADD'
                                          ) {
                                            remove(field.name);
                                          } else {
                                            handleRemove(index);
                                          }
                                        }}
                                      />
                                      {/* ) : null} */}
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
          entry={form.getFieldValue('entry')} //已在套餐中选中的比例去除不显示
          cityId={cityId}
          visible={visible}
          showModal={(keys, rows) => showModal(keys, rows)}
        />
      </div>
    </div>
  );
};

export default Add;
