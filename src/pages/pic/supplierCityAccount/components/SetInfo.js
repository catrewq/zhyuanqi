import { useEffect, useState, useRef } from 'react';
import { MinusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Select,
  Space,
  Row,
  Col,
} from 'antd';
import axios from 'src/utils/axios';
import SearchName from 'src/utils/apiEnum';
import { fetchList, fetchDetail } from 'src/utils/apiData';
import apis from 'src/utils/apiBravo';
import Customer from './Customer';
const { Panel } = Collapse;
const { confirm } = Modal;
const { Option } = Select;
const Template = (props) => {
  const { id, showModal, visible } = props;
  const cusTomTableRef = useRef();
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();
  const [formFeeAdd] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [formAddEdit] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);
  const [singleAccCustomer, setSingleAccCustomer] = useState([]);
  const [formRemove, setFormRemove] = useState([]);
  const [formFeeRemove, setFormFeeRemove] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formDetail, setFormDetail] = useState({});//如果供应商客服没值，就是新增，有值就是编辑
  const [visibleCustom, setVisibleCustom] = useState({
    visible_Customer: false,
  });
  const getDetail = async () => {
    const { data } = await fetchDetail(id, `${apis.supplier}`);
    if (data.success) {
      let obj = Object.assign({}, data?.data);
      setSingleAccCustomer((prev) => {
        if (obj.supServerId !== undefined && obj.supServerName !== undefined) {
          const newItem = {
            personId: obj.supServerId,
            name: obj.supServerName
          };
          if (!prev.some(item => item.personId === newItem.personId)) {
            return [...prev, newItem]; // 使用展开运算符添加新项
          }
        }
        return []; // 如果 obj.supServerId 或 obj.supServerName 为 undefined，则返回空数组
      });

      form.setFieldsValue(obj);
      obj.supServerName && setSelectedCustomer(obj.supServerId);
      setFormDetail(obj);
    }
  };

  const getData = async () => {
    let start = 0,
      length = 100;
    const { data } = await fetchList(
      start,
      length,
      `${apis.supplier}/bill/template`,
      { search_EQ_supplierId: id }
    );

    let arr = [...data.data];
    if (arr.length) {
      for (const item of arr) {
        item.oprInfo = {
          operate: 'UPDATE',

        };
      }
    }
    formAdd.setFieldValue('subList', arr);
  };

  const getFeeData = async (type) => {
    let start = 0,
      length = 100,
      postData = {
        search_EQ_supplierId: id,
      };
    if (type) {
      postData = { ...postData, ...getPostData() };
    }
    const { data } = await fetchList(
      start,
      length,
      `${apis.supplier}/fee`,
      postData
    );

    let arr = [...data.data];
    if (arr.length) {
      for (const item of arr) {
        item.oprInfo = {
          operate: 'UPDATE',
        };
      }
    }
    formFeeAdd.setFieldValue('feeList', arr);
  };

  const getPostData = () => {
    let obj = { ...formSearch.getFieldsValue(true) };
    // 考虑要不要写一个通用工具类
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && value !== '') {
        newObj[`${SearchName.LIKE}_${key}`] = value;
      }
    }
    return newObj;
  };

  const handleAdd = () => {
    let arr = [...formAdd.getFieldValue('subList')];
    arr.push({
      supplierId: id,
      name: '',
      billingDate: '',
      billLockDate: '',
      // isContainsSocial: undefined,
      // isContainsFund: undefined,
      // isContainsDisable: undefined,
      // 新增默认值为是
      isContainsSocial: true,
      isContainsFund: true,
      isContainsDisable: true,
      baseStatus: 0,//默认启用
      oprInfo: {
        operate: 'ADD',
      },
    });
    formAdd.setFieldValue('subList', arr);
  };

  const handleFeeAdd = () => {
    let arr = [...formFeeAdd.getFieldValue('feeList')];
    arr.push({
      supplierId: id,
      name: '',
      valueAddTaxRate: undefined,
      additionalTaxRate: '',
      valueAddTax: '',
      price: '',
      taxPrice: '',
      totalPrice: '',
      baseStatus: 0,//默认启用
      oprInfo: {
        operate: 'ADD',
      },
    });
    formFeeAdd.setFieldValue('feeList', arr);
  };


  const handleValidate = () => {
    //  多表单验证
    Promise.all([form.validateFields(), formAdd.validateFields(), formFeeAdd.validateFields()])
      .then(async ([valueCustomer, valuesAdd, valuesFeeAdd]) => {
        handleSubmit();
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  // 不支持原有数据删除
  const handleSubmit = async () => {
    // setSaveLoading(true);
    let postData = {
      id: id,
      supServerId: selectedCustomer,
      // supServerName: singleAccCustomer[0].name,
      tempList: formAdd.getFieldValue('subList'),
      feeList: formFeeAdd.getFieldValue('feeList'),
    };
    const data = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      url: `${apis.supplier}/info/setting`,
    });
    if (data.data.success === false) {
      message.error(data.data.message);
    } else {
      const { totalCount, successCount, failedCount } = data.data;
      if (totalCount && successCount && failedCount) {
        message.success(
          `操作成功，总计${totalCount}条，成功${successCount}条，失败${failedCount}条。`
        );
      } else {
        message.success(data.data.message);
      }
      sessionStorage.setItem('sessionId', data.headers.ssessionid);
      showModal();
    }
    setSaveLoading(false);
  };


  // 支持原有数据删除
  // const resetState = () => {
  //   setFormRemove([]);
  //   setFormFeeRemove([]);
  // }

  // const handleSubmit = async () => {
  //   setSaveLoading(true);
  //   let removeData = formRemove.filter(item => item.id || item.oprInfo.operate !== 'ADD')
  //     .map(item => ({ ...item, oprInfo: { operate: 'REMOVE' } }));

  //   let updatedSubList = [...formAdd.getFieldValue('subList'), ...removeData];

  //   let removeFeeData = formFeeRemove.filter(item => item.id || item.oprInfo.operate !== 'ADD')
  //     .map(item => ({ ...item, oprInfo: { operate: 'REMOVE' } }));

  //   let updatedFeeList = [...formFeeAdd.getFieldValue('feeList'), ...removeFeeData];

  //   console.log(updatedSubList, updatedFeeList);
  //   console.log(formAdd.getFieldValue('subList'));
  //   console.log(formFeeAdd.getFieldValue('feeList'));
  //   console.log(formRemove);
  //   console.log(formFeeRemove);
  //   let postData = {
  //     id: id,
  //     supServerId: selectedCustomer,
  //     tempList: updatedSubList,
  //     feeList: updatedFeeList,
  //   };
  //   const data = await axios({
  //     data: JSON.stringify(postData),
  //     headers: { 'Content-Type': 'application/json' },
  //     method: 'post',
  //     url: `${apis.supplier}/info/setting`,
  //   });
  //   if (data.data.success === false) {
  //     message.error(data.data.message);
  //     resetState();
  //   } else {
  //     const { totalCount, successCount, failedCount } = data.data;
  //     if (totalCount && successCount && failedCount) {
  //       message.success(
  //         `操作成功，总计${totalCount}条，成功${successCount}条，失败${failedCount}条。`
  //       );
  //       resetState();
  //     } else {
  //       message.success(data.data.message);
  //       resetState();
  //     }
  //     sessionStorage.setItem('sessionId', data.headers.ssessionid);
  //     showModal();
  //   }
  //   setSaveLoading(false);
  // };

  // 账单启用/禁用
  const confirmUpdate = (obj) => {
    // console.log(obj.id);
    let status = obj.baseStatus ? 0 : 1,
      id = obj.id;
    confirm({
      content: <p>请确认是否{status ? '启用' : '禁用'}？</p>,
      onOk() {
        return new Promise((resolve, reject) => {
          const res = handleUpdate(resolve, reject, status, id);
          return res;
        }).catch((err) => {

        });
      },
      width: '400px',
      wrapClassName: 'Supplier-modal',
    });
  };

  const handleUpdate = async (resolve, reject, status, id) => {
    const { data } = await axios({
      data: id,
      headers: { 'Content-Type': 'application/json' },
      method: 'put',
      url: `${apis.supplier}/bill/template/${status ? 'enable' : 'disable'}`,
    });
    if (data.success) {
      message.success('操作成功。');

      let arr = [...formAdd.getFieldValue('subList')];
      for (const item of arr) {
        if (item.id === id) {
          item.baseStatus = status ? 1 : 0;
        }
      }
      formAdd.setFieldValue('subList', arr);

      resolve();
    } else {
      message.error(data.data.message);
      reject();
    }
  };


  // 委托费启用禁用
  // 启用/禁用
  const confirmUpdate_fee = (obj) => {
    // console.log(obj.id);
    let status = obj.baseStatus ? 0 : 1,
      id = obj.id;
    confirm({
      content: <p>请确认是否{status ? '启用' : '禁用'}？</p>,
      onOk() {
        return new Promise((resolve, reject) => {
          const res = handleUpdate_fee(resolve, reject, status, id);
          return res;
        }).catch((err) => {

        });
      },
      width: '400px',
      wrapClassName: 'Supplier-modal',
    });
  };

  const handleUpdate_fee = async (resolve, reject, status, id) => {
    const { data } = await axios({
      data: id,
      headers: { 'Content-Type': 'application/json' },
      method: 'put',
      url: `${apis.supplier}/bill/template/${status ? 'enable' : 'disable'}`,
    });
    if (data.success) {
      message.success('操作成功。');

      let arr = [...formFeeAdd.getFieldValue('feeList')];
      for (const item of arr) {
        if (item.id === id) {
          item.baseStatus = status ? 1 : 0;
        }
      }
      formFeeAdd.setFieldValue('feeList', arr);

      resolve();
    } else {
      message.error(data.data.message);
      reject();
    }
  };

  // 委托费
  // 正算/倒算
  // const handleCalc = async (index, type) => {
  //   let arr = [...formFeeAdd.getFieldValue('feeList')],
  //     { price, totalPrice, valueAddTaxRate, additionalTaxRate } = {
  //       ...arr[index],
  //     };
  //   if (
  //     (type ? totalPrice === '' : price === '') ||
  //     !valueAddTaxRate ||
  //     additionalTaxRate === ''
  //   ) {
  //     message.warning('请完善信息。');
  //     return;
  //   }
  //   let postData = { valueAddTaxRate, additionalTaxRate };
  //   type ? (postData.totalPrice = totalPrice) : (postData.price = price);
  //   const { data } = await axios({
  //     data: postData,
  //     headers: { 'Content-Type': 'application/json' },
  //     method: 'post',
  //     url: `${apis.supplier}/fee${type ? '/rev' : ''}/computer`,
  //   });
  //   if (data.success) {
  //     arr[index] = {
  //       ...arr[index],
  //       ...data.data,
  //     };
  //     formFeeAdd.setFieldValue('feeList', arr);
  //   } else {
  //     message.error(data.message);
  //   }
  // };

  // // 客服
  const handleData = (dataFromChild) => {
    console.log(dataFromChild);
    setSingleAccCustomer(dataFromChild);
    setSelectedCustomer(dataFromChild[0]?.personId);
    form.setFieldsValue({ supServerId: dataFromChild[0]?.personId });

  };

  const toCustomer = (value) => {
    setVisibleCustom(prevState => ({
      ...prevState,
      visible_Customer: !prevState.visible_Customer,
    }));
    // 父组件调用子组件方法，关闭时清空子组件数据
    if (cusTomTableRef.current) {
      cusTomTableRef.current.close();
    }
  }

  // const handleRemove = (currentIndex) => {
  //   let arr = [...formAdd.getFieldValue('subList')];
  //   arr.splice(currentIndex, 1); // 通过索引删除元素
  //   formAdd.setFieldValue('subList', arr);
  //   let removedItem = arr.splice(currentIndex, 1); // 通过索引删除元素并保存删除的数据
  //   setFormRemove([...formRemove, ...removedItem]);
  // }


  // const handleFeeRemove = (currentIndex) => {
  //   let arr = [...formFeeAdd.getFieldValue('feeList')];
  //   arr.splice(currentIndex, 1); // 通过索引删除元素
  //   formFeeAdd.setFieldValue('feeList', arr);
  //   let removedItem = arr.splice(currentIndex, 1); // 通过索引删除元素并保存删除的数据 
  //   setFormFeeRemove([...formFeeRemove, ...removedItem]);
  // }


  const handleRemove = (currentIndex) => {
    let arr = [...formAdd.getFieldValue('subList')];
    let removedItem = arr.splice(currentIndex, 1); // 通过索引删除元素并保存删除的数据
    setFormRemove([...formRemove, ...removedItem]);
    formAdd.setFieldValue('subList', arr);
  }

  const handleFeeRemove = (currentIndex) => {
    let arr = [...formFeeAdd.getFieldValue('feeList')];
    let removedItem = arr.splice(currentIndex, 1); // 通过索引删除元素并保存删除的数据
    setFormFeeRemove([...formFeeRemove, ...removedItem]);
    formFeeAdd.setFieldValue('feeList', arr);
  }


  useEffect(() => {
    if (visible) {
      // 先清空已选供应商再赋值详情里的供应商
      setSingleAccCustomer([]);
      setSelectedCustomer();
      getDetail();
      getData();
      getFeeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);


  const rules = [
    {
      required: true,
      message: '',
    },
  ];

  return (
    <>
      <Modal
        className="list-modal add-modal"
        wrapClassName="Supplier-modal"
        open={visible}
        title="设置信息"
        footer={null}
        width={1200}
        onCancel={() => showModal()}
      >
        <Collapse defaultActiveKey={['1', '2', '3']}>
          <Panel header="供应商信息" key="1">
            <div className="detail-form">
              <Form
                colon={false}
                form={form}
                labelCol={{
                  span: 8,
                }}
                name="form"
                wrapperCol={{
                  span: 16,
                }}
              >
                <div className="items inner">
                  <div className="item">
                    <Form.Item label="供应商编号" name="number">
                      <Input disabled />
                    </Form.Item>
                  </div>
                  <div className="item">
                    <Form.Item label="供应商名称" name="name">
                      <Input disabled />
                    </Form.Item>
                  </div>
                  <div className="item">
                    {/* <Form.Item label="供应商客服" name="postServerName">
                    <Input />
                  </Form.Item> */}
                    <Form.Item
                      label="供应商客服"
                      name="supServerId"
                      rules={rules}
                    >
                      <Row >
                        <Col span={21}>
                          <Select
                            placeholder="请选择"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={(value) => {
                              form.setFieldsValue({ supServerId: value });
                              if (!value) {
                                setSingleAccCustomer([]);
                              }
                            }}
                            // eslint-disable-next-line eqeqeq
                            value={singleAccCustomer[0]?.personId ? singleAccCustomer[0]?.personId : selectedCustomer}
                          >
                            {Array.isArray(singleAccCustomer) && (
                              singleAccCustomer?.map((item, index) => (
                                <Option key={index} value={item.personId}>
                                  {item.name}
                                </Option>
                              ))
                            )}
                          </Select>
                        </Col>
                        <Col span={3}>
                          <Button type="primary" onClick={toCustomer}>选择</Button>
                        </Col>
                      </Row>
                    </Form.Item>
                  </div>

                </div>
              </Form>
            </div>
          </Panel>

          <Panel header="账单信息" key="2">
            <div className="form">
              <Form
                colon={false}
                form={formAdd}
                initialValues={{
                  subList: [],
                }}
                labelAlign="right"
                layout="vertical"
                name="add_form"
                className="add-modal"
              // scrollToFirstError={true}
              >
                <div className="sub-items inner">
                  <Button type="primary" onClick={handleAdd}>
                    新增
                  </Button>
                  <div className="inner">
                    <Space size="small" align="baseline">
                      <div className="fake-label">
                        <span className="required-mark">*</span>账单模板名称</div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>账单生成日</div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>账单锁定日</div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>社保是否纳入总额</div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>公积金是否纳入总额</div>
                      <div className="fake-label">
                        <span className="required-mark">*</span>残障金是否纳入总额</div>
                      <div className="fake-label">是否有效</div>
                    </Space>
                    <Form.List name="subList">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <div key={index}>
                              <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => (
                                  <Space size="small" align="baseline">
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'name']}
                                      rules={rules}
                                    >
                                      <Input placeholder="请输入" />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'billingDate']}
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
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'billLockDate']}
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
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'isContainsSocial']}
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
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'isContainsFund']}
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
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'isContainsDisable']}
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
                                    <Form.Item label="">
                                      {getFieldValue('subList')[index].oprInfo
                                        .operate === 'UPDATE' ? (
                                        <Button
                                          type="primary"
                                          onClick={() =>
                                            confirmUpdate(
                                              getFieldValue('subList')[index]
                                            )
                                          }
                                        >
                                          {getFieldValue('subList')[index]
                                            .baseStatus
                                            ? '启用'
                                            : '禁用'}
                                        </Button>
                                      ) : (
                                        '启用'
                                      )}
                                    </Form.Item>
                                    {/* 默认启用 */}

                                    {getFieldValue('subList')[index].oprInfo
                                      .operate === 'ADD' && (
                                        <Button
                                          type="danger"
                                          onClick={() => handleRemove(index)}
                                          className="buttonsStyle"
                                        >
                                          <MinusCircleOutlined />
                                        </Button>
                                      )}

                                    {/* 
                                    <Button
                                      type="danger"
                                      onClick={() => handleRemove(index)}
                                      className="buttonsStyle"
                                    >
                                      <MinusCircleOutlined />
                                    </Button> */}

                                  </Space>
                                )}
                              </Form.Item>
                            </div>
                          ))}
                        </>
                      )}
                    </Form.List>
                  </div>
                </div>
              </Form>
            </div>
          </Panel>

          <Panel header="委托费信息" key="3">
            <div className="form">
              <Form
                colon={false}
                form={formFeeAdd}
                initialValues={{
                  feeList: [],
                }}
                labelAlign="right"
                layout="vertical"
                name="add_form"
                className="add-modal"
              // scrollToFirstError={true}
              >
                <div className="sub-items sub-items-small inner">
                  <Button type="primary" onClick={handleFeeAdd}>
                    新增
                  </Button>
                  <div className="inner">
                    <Space size="small" align="baseline">
                      <div className="fake-label">委托费名称</div>
                      <div className="fake-label">委托费编号</div>
                      {/* <div className="fake-label">增值税率（%）</div>
                      <div className="fake-label">附加税率（%）</div> */}
                      {/* <div className="fake-label">增值税</div>
                      <div className="fake-label">价格（不含税）</div> */}
                      <div className="fake-label">价格（含税）</div>
                      <div className="fake-label">备注</div>
                      {/* <div className="fake-label">总价</div> */}
                      {/* <div className="fake-label">操作</div> */}
                    </Space>
                    <Form.List name="feeList">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <div key={index}>
                              <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => (
                                  <Space size="small" align="baseline">
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'name']}
                                    // rules={rules}
                                    >
                                      <Input placeholder="请输入" />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'number']}
                                    // rules={rules}
                                    >
                                      <Input placeholder="请输入" />
                                    </Form.Item>
                                    {/* <Form.Item
                                      label=""
                                      name={[field.name, 'valueAddTaxRate']}
                                      rules={rules}
                                    >
                                      <Select
                                        options={[
                                          { label: '5', value: 5 },
                                          { label: '6', value: 6 },
                                        ]}
                                        placeholder="请选择"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'additionalTaxRate']}
                                      rules={rules}
                                    >
                                      <InputNumber
                                        controls={false}
                                        min="0"
                                        step="0.01"
                                        placeholder="请输入"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'valueAddTax']}
                                      rules={rules}
                                    >
                                      <InputNumber
                                        controls={false}
                                        min="0"
                                        step="0.01"
                                        readOnly
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'price']}
                                      rules={rules}
                                    >
                                      <InputNumber
                                        controls={false}
                                        min="0"
                                        step="0.01"
                                        placeholder="请输入"
                                      />
                                    </Form.Item> */}
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'taxPrice']}
                                      rules={rules}
                                    >
                                      <InputNumber
                                        controls={false}
                                        min="0"
                                        step="0.01"
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'remark']}
                                    // rules={rules}
                                    >
                                      <Input placeholder="请输入" />
                                    </Form.Item>
                                    {/* <Form.Item
                                      label=""
                                      name={[field.name, 'totalPrice']}
                                      rules={rules}
                                    >
                                      <InputNumber
                                        controls={false}
                                        min="0"
                                        step="0.01"
                                        placeholder="请输入"
                                      />
                                    </Form.Item> */}
                                    {/* <Form.Item label="">
                                      <Space>
                                        <Button
                                          type="link"
                                          onClick={() => handleCalc(index)}
                                        >
                                          正算
                                        </Button>
                                        <Button
                                          type="link"
                                          onClick={() =>
                                            handleCalc(index, 'reverse')
                                          }
                                        >
                                          倒算
                                        </Button>
                                      </Space>
                                    </Form.Item> */}
                                    <Form.Item label="">
                                      {getFieldValue('feeList')[index].oprInfo
                                        .operate === 'UPDATE' ? (
                                        <Button
                                          type="primary"
                                          onClick={() =>
                                            confirmUpdate_fee(
                                              getFieldValue('feeList')[index]
                                            )
                                          }
                                        >
                                          {getFieldValue('feeList')[index]
                                            .baseStatus
                                            ? '启用'
                                            : '禁用'}
                                        </Button>
                                      ) : (
                                        '启用'
                                      )}
                                    </Form.Item>
                                    {/* 默认启用 */}

                                    {getFieldValue('feeList')[index].oprInfo
                                      .operate === 'ADD' && (
                                        <Button
                                          type="danger"
                                          onClick={() => handleFeeRemove(index)}
                                          className="btns"
                                          className="buttonsStyle"
                                        >
                                          <MinusCircleOutlined />
                                        </Button>
                                      )}
                                  </Space>
                                )}
                              </Form.Item>
                            </div>
                          ))}
                        </>
                      )}
                    </Form.List>
                  </div>
                </div>
              </Form>

              <div className="foot">
                <Space>
                  <Button
                    type="primary"
                    onClick={handleValidate}
                    loading={saveLoading}
                  >
                    提交
                  </Button>
                  <Button onClick={() => showModal()}>取消</Button>
                </Space>
              </div>
            </div>
          </Panel>
        </Collapse>
      </Modal>
      <Modal
        className="add-modal"
        wrapClassName="Data-modal"
        open={visibleCustom.visible_Customer}
        title="客户查询"
        footer={null}
        width={800}
        onCancel={toCustomer}
        maskClosable={false}
      >
        {/*后期需优化为通用组件 */}
        <Customer
          ref={cusTomTableRef}
          onData={handleData}
          parentMethod={toCustomer}
        // roleId={id}
        />
      </Modal>
    </>
  );
};

export default Template;
