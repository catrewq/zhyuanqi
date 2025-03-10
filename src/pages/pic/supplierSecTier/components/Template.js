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
import apis from 'src/utils/apiBravo';

const { Panel } = Collapse;
const { confirm } = Modal;

const Template = (props) => {
  const { id, showModal, visible } = props;
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);

  const getDetail = async () => {
    const { data } = await fetchDetail(id, `${apis.supplier}`);
    if (data.success) {
      form.setFieldsValue(data.data);
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

  const handleAdd = () => {
    let arr = [...formAdd.getFieldValue('subList')];
    arr.push({
      supplierId: id,
      name: '',
      billingDate: '',
      billLockDate: '',
      isContainsSocial: undefined,
      isContainsFund: undefined,
      isContainsDisable: undefined,
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
      url: `${apis.supplier}/bill/template/operate/batch`,
    });
    if (data.data.success === false) {
      message.error(data.data.message);
    } else {
      const { totalCount, successCount, failedCount } = data.data;
      message.success(
        `操作成功，总计${totalCount}条，成功${successCount}条，失败${failedCount}条。`
      );
      sessionStorage.setItem('sessionId', data.headers.ssessionid);
      showModal();
    }
    setSaveLoading(false);
  };

  // 启用/禁用
  const confirmUpdate = (obj) => {
    let status = obj.baseStatus ? 0 : 1,
      id = obj.id;
    confirm({
      content: <p>请确认是否{status ? '启用' : '禁用'}？</p>,
      onOk() {
        return new Promise((resolve, reject) => {
          const res = handleUpdate(resolve, reject, status, id);
          return res;
        }).catch((err) => {
          // console.log(err);
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
      title="创建修改账单"
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
              <div className="sub-items">
                <Button type="primary" ghost onClick={handleAdd}>
                  新增
                </Button>
                <div className="inner">
                  <Space size="small" align="baseline">
                    <div className="fake-label">账单模板名称</div>
                    <div className="fake-label">账单生成日</div>
                    <div className="fake-label">账单锁定日</div>
                    <div className="fake-label">社保是否纳入总额</div>
                    <div className="fake-label">公积金是否纳入总额</div>
                    <div className="fake-label">残障金是否纳入总额</div>
                    <div className="fake-label">状态</div>
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
                                        type="link"
                                        onClick={() =>
                                          confirmUpdate(
                                            getFieldValue('subList')[index]
                                          )
                                        }
                                      >
                                        {getFieldValue('subList')[index]
                                          .baseStatus
                                          ? '禁用'
                                          : '启用'}
                                      </Button>
                                    ) : (
                                      '启用'
                                    )}
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
              <Space size="middle">
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

export default Template;
