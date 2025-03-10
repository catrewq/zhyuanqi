import { useEffect, useState } from 'react';
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
} from 'antd';
import axios from 'src/utils/axios';
import { fetchList, fetchDetail } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import apis from 'src/utils/apiBravo';

const { Panel } = Collapse;

const Fee = (props) => {
  const { id, showModal, visible } = props;
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);

  const getDetail = async () => {
    const { data } = await fetchDetail(id, `${apis.supplier}`);
    if (data.success) {
      form.setFieldsValue(data.data);
    }
  };

  const getData = async (type) => {
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
    formAdd.setFieldValue('subList', arr);
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
      valueAddTaxRate: undefined,
      additionalTaxRate: '',
      valueAddTax: '',
      price: '',
      taxPrice: '',
      totalPrice: '',
      oprInfo: {
        operate: 'ADD',
      },
    });
    formAdd.setFieldValue('subList', arr);
  };

  const handleValidate = () => {
    formAdd
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
    let postData = [...formAdd.getFieldValue('subList')];
    console.log('handleSubmit', postData);
    const data = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      url: `${apis.supplier}/fee/operate/batch`,
    });
    if (data.data.success === false) {
      message.error(data.data.message);
      setSaveLoading(false);
    } else {
      const { totalCount, successCount, failedCount } = data.data;
      message.success(
        `操作成功，总计${totalCount}条，成功${successCount}条，失败${failedCount}条。`
      );
      sessionStorage.setItem('sessionId', data.headers.ssessionid);
      showModal();
    }
  };

  // 正算/倒算
  const handleCalc = async (index, type) => {
    let arr = [...formAdd.getFieldValue('subList')],
      { price, totalPrice, valueAddTaxRate, additionalTaxRate } = {
        ...arr[index],
      };
    if (
      (type ? totalPrice === '' : price === '') ||
      !valueAddTaxRate ||
      additionalTaxRate === ''
    ) {
      message.warning('请完善信息。');
      return;
    }
    let postData = { valueAddTaxRate, additionalTaxRate };
    type ? (postData.totalPrice = totalPrice) : (postData.price = price);
    const { data } = await axios({
      data: postData,
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      url: `${apis.supplier}/fee${type ? '/rev' : ''}/computer`,
    });
    if (data.success) {
      arr[index] = {
        ...arr[index],
        ...data.data,
      };
      formAdd.setFieldValue('subList', arr);
    } else {
      message.error(data.message);
    }
  };

  useEffect(() => {
    if (visible) {
      getDetail();
      getData();
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
    <Modal
      className="list-modal"
      wrapClassName="Supplier-modal"
      open={visible}
      title="创建修改委托费"
      footer={null}
      width={1140}
      onCancel={() => showModal()}
    >
      <Collapse defaultActiveKey={['1', '2']}>
        <Panel header="一级供应商" key="1">
          <div className="detail-form">
            <Form
              colon={false}
              disabled
              form={form}
              labelCol={{
                span: 8,
              }}
              name="form"
              wrapperCol={{
                span: 16,
              }}
            >
              <div className="items">
                <div className="item">
                  <Form.Item label="一级供应商ID" name="id">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="一级供应商名称" name="name">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="供应商类别" name="">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="统一识别码" name="dutyParagraph">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="联系人" name="contractPerson">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="联系方式" name="contractPhone">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="联系人级别" name="">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="开户名称" name="depositName">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="银行账号" name="bankCode">
                    <Input />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="开户行" name="depositBank">
                    <Input />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </Panel>

        <Panel header="账单信息" key="2">
          <div className="common-modal-form">
            <Form colon={false} form={formSearch} name="search_form">
              <Form.Item name="name">
                <Input placeholder="请输入委托费名称" allowClear />
              </Form.Item>
              <Form.Item name="totalPrice">
                <Input placeholder="请输入总价" allowClear />
              </Form.Item>
              <Button onClick={() => getData('active')}>查询</Button>
            </Form>
          </div>
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
              // scrollToFirstError={true}
            >
              <div className="sub-items sub-items-small">
                <Button type="primary" ghost onClick={handleAdd}>
                  新增
                </Button>
                <div className="inner">
                  <Space size="small" align="baseline">
                    <div className="fake-label">委托费名称</div>
                    <div className="fake-label">增值税率（%）</div>
                    <div className="fake-label">附加税率（%）</div>
                    <div className="fake-label">增值税</div>
                    <div className="fake-label">价格（不含税）</div>
                    <div className="fake-label">价格（含税）</div>
                    <div className="fake-label">总价</div>
                    <div className="fake-label">操作</div>
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
                                  </Form.Item>
                                  <Form.Item
                                    label=""
                                    name={[field.name, 'taxPrice']}
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
                                    name={[field.name, 'totalPrice']}
                                    rules={rules}
                                  >
                                    <InputNumber
                                      controls={false}
                                      min="0"
                                      step="0.01"
                                      placeholder="请输入"
                                    />
                                  </Form.Item>
                                  <Form.Item label="">
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
                                  </Form.Item>
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
  );
};

export default Fee;
