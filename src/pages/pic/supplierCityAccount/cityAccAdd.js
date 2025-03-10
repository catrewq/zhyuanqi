import { useEffect, useState } from 'react';
//import { useLocation, useNavigate } from 'react-router-dom';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Skeleton, Space } from 'antd';
import apis from 'src/utils/apiBravo';
import { fetchDetail, fetchList } from 'src/utils/apiData';
import SearchName from 'src/utils/apiEnum';
import axios from 'src/utils/axios';
import { useTabLocation, useTabNavigate } from 'src/utils/navigateUtil';
import { showInfo } from 'src/utils/util';
import Pick from './components/Pick';
import { ctbFreqList, freqList, textContent } from './data';


export default function CityAccAdd() {
  const location = useTabLocation();
  const navigate = useTabNavigate();
  const [form] = Form.useForm();
  //const [firstRender, setFirstRender] = useState(true);

  const initSupplierId = location.state ? location.state.supplierId : 0;
  const [supplierId] = useState(initSupplierId);

  const initId = location.state ? location.state.id : 0;
  const [id] = useState(initId);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [feeList, setFeeList] = useState([]);
  const [cityId, setCityId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [feeView, setFeeView] = useState(null);
  const [isAllowMakeUpCtb, setIsAllowMakeUpCtb] = useState(false);
  // const crumbs = ['二级供应商管理', `${id ? '修改' : '新增'}`];

  const handleCityIdChange = (_, { name }) => {
    form.setFieldValue('cityName', name);
    let supplierName = form.getFieldValue('supplierName');
    if (supplierName && name) {
      let v = `${supplierName}-${name}`;
      form.setFieldValue('name', v);
    }
  };

  const handleSupplierIdChange = (id, { name }) => {
    console.log(id);
    console.log(name);
    form.setFieldValue('supplierName', name);
    let cityName = form.getFieldValue('cityName');
    if (cityName && name) {
      let v = `${name}-${cityName}`;
      form.setFieldValue('name', v);
    }
    getTemplateList(id);
    getFeeList(id);
  };

  const getTemplateList = async (supplierId) => {
    const { data } = await fetchList(0, 200, `${apis.supplierTmp}`, {
      search_EQ_supplierId: supplierId,
    });
    setTemplateList(data.data);
  };

  const getFeeList = async (supplierId) => {
    const { data } = await fetchList(0, 200, `${apis.supplier}/fee`, {
      search_EQ_supplierId: supplierId,
    });
    setFeeList(data.data);
  };

  const handleRemove = (currentIndex) => {
    let arr = [...form.getFieldValue('entry')];
    arr[currentIndex].oprInfo.operate = 'REMOVE';
    form.setFieldValue('entry', arr);
  };

  const showModal = (keys, rows) => {
    let cityId = form.getFieldValue('cityId'),
      billCollectFreq = form.getFieldValue('billCollectFreq');
    if (!cityId) {
      message.warning('请先选择城市');
      return;
    }
    setCityId(cityId);
    setVisible(!visible);
    if (keys && keys.length) {
      console.log(rows);
      let arr = [...form.getFieldValue('entry')],
        ids = arr.map((item) => item.sfGroupId);
      for (const item of rows) {
        if (!ids.includes(item.id)) {
          let obj = {
            ...item,
            groupPrdEntryId: item.id,
            sfGroupName: item.groupName,
            billCollectFreq: billCollectFreq,
            oprInfo: {
              operate: 'ADD',
            },
          };
          arr.push(obj);
        }
      }
      form.setFieldValue('entry', arr);
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
    setSaveLoading(true);
    let postData = { ...form.getFieldsValue(true) };
    console.log('handleSubmit', postData);
    if (id) {
      if (postData.entry && postData.entry.length > 0) {
        postData.entry = postData.entry.map(item => ({
          ...item,
          oprInfo: {
            operate: 'UPDATE',
          },
        }));
      }
    }
    // delete postData.entry;
    const res = await axios({
      data: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' },
      method: id ? 'put' : 'post',
      url: id ? `${apis.supplierSec}/update` : `${apis.supplierSec}/create`,
    });
    const { data } = res;
    if (data.success) {
      sessionStorage.setItem('sessionId', res.headers.ssessionid);
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

  function handleChange(value) {
    if (value) {
      Modal.info({
        title: '频率预览',
        content: textContent[value],
      });
    } else {
      showInfo('请选择付费频率')
    }

  }


  useEffect(() => {

    const getSupplierList = async () => {
      let postData = {};
      if (supplierId > 0) {
        postData[`${SearchName.EQ}_id`] = supplierId;
      }
      const { data } = await fetchList(0, 200, `${apis.supplier}`, postData);
      setSupplierList(data.data);
    };
    getSupplierList();

    const getCityList = async () => {
      const { data } = await fetchList(0, 200, `${apis.city}`, {
        search_EQ_baseStatus: 0,
      });
      setCityList(data.data);
    };
    getCityList();

  }, [supplierId]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const getDetail = async () => {
        const { data } = await fetchDetail(id, `${apis.supplierSec}`);
        if (data.success) {
          let obj = { ...data.data },
            arr = [];
          if (obj.entry?.length) {
            for (const item of obj.entry) {
              item.oprInfo = {
                operate: '',
              };
              arr.push(item);
            }
          }
          obj.entry = [...arr];
          form.setFieldsValue(obj);
          obj.supplierId && getTemplateList(obj.supplierId) && getFeeList(obj.supplierId);;
          setLoading(false);
        }
      };

      getDetail(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const rules = [
    {
      required: true,
      message: '',
    },
  ];

  const numberRules = [
    {
      required: true,
      message: '必填项不能为空',
    },
    {
      pattern: /^(0?[1-9]|1[0-2])$/,
      message: '请输入1-12之间的数字',
    },
  ]


  const fieldNames = {
    label: 'name',
    value: 'id',
  };

  return (
    <div className="detail-page">
      {/* <FixHeader crumbs={crumbs} /> */}

      <section>
        <div className="title">
          <span>{`${id ? '修改' : '新增'}供应商账户`}</span>
        </div>

        <Skeleton active loading={loading}>
          <div className="form add-modal">
            <Form
              colon={false}
              form={form}
              initialValues={{
                entry: [],
              }}
              labelAlign="right"
              layout="vertical"
              name="add_form"
            // className="add-modal"
            >
              <div className="items inner">
                <div className="item">
                  <Form.Item
                    label="所属供应商"
                    name="supplierId"
                    rules={rules}
                  >
                    <Select
                      disabled={id ? true : false}
                      fieldNames={fieldNames}
                      onChange={handleSupplierIdChange}
                      options={supplierList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item label="城市" name="cityId" rules={rules}>
                    <Select
                      disabled={id ? true : false}
                      fieldNames={fieldNames}
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
                <div className="item">
                  <Form.Item label="供应商账户名称" name="name">
                    <Input disabled={id ? true : false} readOnly />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item
                    label="供应商账单模板名称"
                    name="billTempId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      options={templateList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>
                <div className="item">
                  <Form.Item
                    label="委托费名称"
                    name="commitFeeId"
                    rules={rules}
                  >
                    <Select
                      fieldNames={fieldNames}
                      options={feeList}
                      placeholder="请选择"
                    />
                  </Form.Item>
                </div>

                {/* <div className="item">
                  <Form.Item
                    label="委托费频率"
                    name="commitFeeFreq"
                    rules={rules}
                  >
                    <Select options={freqList} placeholder="请选择" />
                  </Form.Item>
                </div> */}
                <div className="item">
                  <Form.Item
                    label="总付费频率"
                    name="billCollectFreq"
                    rules={rules}
                  >
                    <Select options={freqList} placeholder="请选择" />
                  </Form.Item>
                </div>
              </div>
              <div className="sub-items inner">
                <Button type="primary" ghost onClick={() => showModal()}>
                  设置险种频率
                </Button>
                <div style={{ overflowX: 'auto' }}>
                  <div className="inner">
                    <Space size="small" align="baseline">
                      <div className="fake-label">社保公积金组</div>
                      <div className="fake-label">险种类别</div>
                      <div className="fake-label">是否必须缴纳</div>
                      <div className="fake-label">是否强制补缴</div>
                      <div className="fake-label">是否可补缴</div>
                      <div className="fake-label">是否可跨年补</div>
                      <div className="fake-label">可补缴月数</div>
                      <div className="fake-label">申报频率</div>
                      <div className="fake-label">付费频率</div>
                      {/* <div className="fake-label">费用预览</div> */}
                      <div className="fake-label">操作</div>
                    </Space>
                  </div>
                  <Form.List name="entry">
                    {(fields, { add, remove }) => (
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
                                      name={[field.name, 'sfGroupName']}
                                      rules={rules}
                                    >
                                      <Input readOnly />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'insTypeName']}
                                      rules={rules}
                                    >
                                      <Input readOnly />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'isRequired']}
                                      rules={rules}
                                    >
                                      <Select
                                        placeholder="请选择"
                                        allowClear
                                        options={[
                                          { label: '是', value: true },
                                          { label: '否', value: false }
                                        ]}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'isForceMakeUpCtb']}
                                      rules={rules}
                                    >
                                      <Select
                                        placeholder="请选择"
                                        allowClear
                                        options={[
                                          { label: '是', value: true },
                                          { label: '否', value: false }
                                        ]}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'allowMakeUpCtb']}
                                      rules={rules}
                                    >
                                      <Select
                                        placeholder="请选择"
                                        allowClear
                                        onChange={setIsAllowMakeUpCtb}
                                        options={[
                                          { label: '是', value: true },
                                          { label: '否', value: false }
                                        ]}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'allowMuiltYearMakeUp']}
                                      rules={rules}
                                    >
                                      <Select
                                        placeholder="请选择"
                                        allowClear
                                        options={[
                                          { label: '是', value: true },
                                          { label: '否', value: false }
                                        ]}
                                      />
                                    </Form.Item>
                                    {/* 否补缴，可补缴月数默认为0 */}
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'makeUpCtbMonth']}
                                      rules={isAllowMakeUpCtb ? numberRules : rules}
                                    >
                                      {
                                        isAllowMakeUpCtb ? <Input placeholder='请输入' /> : <Input defaultValue={0} />
                                      }
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'reportFerqType']}
                                      rules={rules}
                                    >
                                      <Select
                                        options={ctbFreqList}
                                        placeholder="请选择"
                                      />
                                    </Form.Item>
                                    {/* 付费频率 */}
                                    {/* <Form.Item
                                      label=""
                                      name={[field.name, 'contributeFreq']}
                                      rules={rules}
                                    >
                                      <Select
                                        options={freqList}
                                        placeholder="请选择"
                                        onChange={setFeeView}
                                      />
                                    </Form.Item> */}
                                    <Form.Item
                                      label=""
                                      name={[field.name, 'billCollectFreq']}
                                      rules={rules}
                                    >
                                      <Select
                                        options={freqList}
                                        placeholder="请选择"
                                        onChange={setFeeView}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label=""
                                      // name={[field.name, '']}
                                      rules={rules}
                                    >
                                      <Button
                                        type="link"
                                        onClick={() => {
                                          handleChange(feeView ? feeView : getFieldValue('entry')[index].billCollectFreq, index)
                                        }}
                                      >费用预览</Button>
                                    </Form.Item>
                                    {/* <MinusCircleOutlined
                                      className="btns"
                                      // className="buttonsStyle"
                                      onClick={() => {
                                        let arr = [
                                          ...form.getFieldValue('entry'),
                                        ];
                                        if (!arr[index].id) {
                                          remove(field.name);
                                        } else {
                                          handleRemove(index);
                                        }
                                      }}
                                    />
                                    <PlusCircleOutlined
                                      className="btns"
                                      onClick={() =>
                                        add({
                                          sfGroupName: '',
                                          insTypeName: '',
                                          isRequired: '',
                                          isForceMakeUpCtb: '',
                                          allowMakeUpCtb: '',
                                          allowMuiltYearMakeUp: '',
                                          makeUpCtbMonth: '',
                                          reportFerqType: '',
                                          billCollectFreq: '',
                                          oprInfo: { operate: 'ADD' },
                                        })
                                      }
                                    /> */}
                                    <MinusCircleOutlined
                                      className="btns"
                                      onClick={() => {
                                        let arr = [...form.getFieldValue('entry')];
                                        if (!arr[index].id) {
                                          remove(field.name);
                                        } else {
                                          const item = arr[index];
                                          if (item.oprInfo && item.oprInfo.operate === 'ADD') {
                                            // 直接删除
                                            remove(field.name);
                                          } else {
                                            // 提示确认删除
                                            handleRemove(index);
                                            Modal.info({
                                              content: `${item.sfGroupName}, ${item.insTypeName} 已删除，请知悉`,
                                            });
                                          }
                                        }
                                      }}
                                    />

                                    <PlusCircleOutlined
                                      className="btns"
                                      onClick={() =>
                                        add({
                                          sfGroupName: '',
                                          insTypeName: '',
                                          isRequired: '',
                                          isForceMakeUpCtb: '',
                                          allowMakeUpCtb: '',
                                          allowMuiltYearMakeUp: '',
                                          makeUpCtbMonth: '',
                                          reportFerqType: '',
                                          billCollectFreq: '',
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
              </div>
            </Form>

            <div className="actions foot">
              <Space size="middle">
                <Button
                  type="primary"
                  ghost
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={handleValidate}
                  loading={saveLoading}
                >
                  提交
                </Button>
              </Space>
            </div>
          </div>
        </Skeleton >
      </section >

      <Pick
        cityId={cityId}
        visible={visible}
        showModal={(keys, rows) => showModal(keys, rows)}
      />
    </div >
  );
}
