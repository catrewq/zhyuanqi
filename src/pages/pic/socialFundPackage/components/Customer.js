import { Button, DatePicker, Form, Input, message, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';
import apis from 'src/utils/apiBravo';
import axios from 'src/utils/axios';

const Customer = (props) => {
  const { keys, rows, showModal, visible } = props;
  const [form2] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);

  // 企业基数范围
  const handleEntBaseRangerChange = ({ target: { value } }) => {
    // value
    if (!rows[0].isDoubleBase) {
      form2.setFieldValue('pslBaseRanger', value);
    }
  };

  const handleValidate = () => {
    form2
      .validateFields()
      .then(async (values) => {
        // console.log(values);
        handleSubmit(values);
      })
      .catch((error) => {});
  };

  const handleSubmit = async (values) => {
    setSaveLoading(true);
    let postData = {
      ...values,
      startMonth: values.startMonth.format('YYYYMM'),
    };
    postData.endMonth
      ? (postData.endMonth = postData.endMonth.format('YYYYMM'))
      : delete postData.endMonth;
    console.log(postData);
    const { data } = await axios({
      data: JSON.stringify({
        ids: keys,
        entry: postData,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      url: `${apis.package}/entry/change/batch`,
    });
    if (data.success) {
      showModal();
    } else {
      message.error(data.message);
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      form2.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      className="init-modal"
      wrapClassName="SocialFundRate-modal"
      open={visible}
      title="批量设定基数上下限"
      footer={null}
      width={440}
      onCancel={showModal}
    >
      <div className="inner">
        <Form form={form2} layout="vertical" name="form2" autoComplete="off">
          <Form.Item
            label="起始月份"
            name="startMonth"
            rules={[{ required: true, message: '' }]}
          >
            <DatePicker
              format="YYYYMM"
              picker="month"
              placeholder="请选择"
              allowClear
            />
          </Form.Item>
          <Form.Item label="截止月份" name="endMonth">
            <DatePicker
              format="YYYYMM"
              picker="month"
              placeholder="请选择"
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="企业基数范围"
            name="entBaseRanger"
            rules={[{ required: true, whitespace: true, message: '' }]}
          >
            <Input
              autoComplete="off"
              placeholder="请输入"
              onChange={handleEntBaseRangerChange}
            />
          </Form.Item>
          <Form.Item
            label="个人基数范围"
            name="pslBaseRanger"
            rules={[{ required: true, whitespace: true, message: '' }]}
          >
            <Input
              autoComplete="off"
              placeholder="请输入"
              disabled={rows.length && !rows[0].isDoubleBase ? true : false}
            />
          </Form.Item>
        </Form>
      </div>
      <div className="foot">
        <Space>
          <Button type="primary" loading={saveLoading} onClick={handleValidate}>
            确定
          </Button>
          <Button type="primary" ghost onClick={showModal}>
            取消
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default Customer;
