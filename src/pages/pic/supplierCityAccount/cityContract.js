
//使用自定义表格
import React, { useRef, useState, useEffect } from 'react';
import CustomTable from 'src/components/publicUI/table'; // 你的 uiCustomTable组件的路径
import { Button, Form, Input, Space, Modal, Select, message, Tooltip, Upload } from 'antd';
import { createSorter, showInfo } from "src/utils/util";
import { DownOutlined } from '@ant-design/icons';
import { handleBatchActions, fetchDownload } from 'src/utils/apiData'; // 你的 apiData.js 的路径
import { apis } from 'src/utils/apis'; // 你的 apis.js 的路径
import axios from 'src/utils/axios';
import getOssToken from "src/utils/getOssToken";
import OSS from "ali-oss";
import SearchName from "src/utils/apiEnum";
import { dateFormat } from 'src/utils/dateFormatDayjs';
import { filterQueryObject } from "src/utils/util";
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
const { confirm, info } = Modal;
const App = () => {
  const customTableRef = useRef();//ref绑定CustomTable组件
  const [firstRender, setFirstRender] = useState(true);
  const [formAddEdit] = Form.useForm();
  const [keys, setKeys] = useState([]);
  const [rows, setRows] = useState([]);
  const [clientOSS, setClientOSS] = useState({});
  const [visible, setVisible] = useState({
    visibleAdd_Edit: false,
  });
  const [disabled, setDisabled] = useState({
    disabledAdd_Edit: false,
    disabledBtn: false,
  });
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);

  const initialValues = {
    baseStatus: 0,
  }
  // 在按钮的点击事件处理函数中通过 ref 调用 query 方法
  const refQuery = () => {
    if (customTableRef.current) {
      customTableRef.current.reset();
    }
  };

  // 启用、失效
  const handleStatus = async (value, isStatus) => {
    if (value) {
      confirm({
        content: (
          <div>
            {isStatus ? null : <p style={{ textAlign: 'left', fontWeight: 'bold' }}>失效</p>}
            <p>{isStatus ? '请确认是否启用该户籍' : '此操作将该户籍状态失效，请确认是否停用该户籍'}</p>
          </div>
        ),
        onOk() {
          return new Promise((resolve, reject) => {
            handleBatchActions(resolve, reject, value, isStatus, apis.supplierContract.List)
              .then((response) => {
                const { failedCount, successCount, totalCount } = response.data;
                if (successCount > 0) {
                  message.success(`操作成功！成功数: ${successCount}, 总数: ${totalCount}`);
                  refQuery();
                  setKeys([]);
                  resolve();
                } else {
                  message.error(`操作失败！失败数: ${failedCount}`);
                  setKeys([]);
                  reject(new Error(`操作失败！失败数: ${failedCount}`));
                }
              })
              .catch((error) => {
                console.error("Error in handleStatus:", error);
                reject(error);
              });
          });
        },
        width: "400px",
      });
    }
  };


  const getFile = async (fileName) => {
    const url = await clientOSS.signatureUrl(fileName, {
      "content-disposition": `attachment; filename=${encodeURIComponent(
        fileName
      )}`,
    });
    window.open(url);
  };

  // 导出模板
  const downloadTemplate = async () => {
    await axios({
      method: "get",
      headers: { "Content-Type": "application/json" },
      url: `${apis.supplierContract.List}/download/template`,
      responseType: "blob",
    }).then((res) => {
      const content = res.data;
      console.log(res.data);
      const fileName = "供应商合同模板.xlsx";
      funDownload(content, fileName);
    });
  };

  const funDownload = (content, filename) => {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement("a");
    eleLink.download = filename;
    eleLink.style.display = "none";
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  };
  

  // 导入
  const configOth = {
    accept: ".xls, .xlsx",
    multiple: false,
    showUploadList: true,
    fileList: [],
    beforeUpload: (file) => {
      if (file.size > 10 * 1024 * 1024) {
        message.error("文件大小上限为10M");
        return false;
      }
      handleUpload(file, `${apis.supplierContract.List}/upload/asyn`);
      return false;
    },
    name: "file",
  };

  const handleUpload = async (file, url) => {
    setLoadingImport(true);
    const { data } = await axios({
      url,
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      data: { file },
    });
    if (data.failedFileUrl) {
      info({
        closable: true,
        content: (
          <p>
            导入{data.totalCount}条，成功{data.successCount}
            条，失败
            {data.failedCount}条
          </p>
        ),
        okText: "下载失败文件",
        onOk() {
          getFile(data?.failedFileUrl);
        },
        width: "400px",
      });
    } else {
      if (data.successCount > 0 && data.message) {
        message.success(data.message);
      }
      if (data.success === false && data.message) {
        message.error(data.message);
      }
      refQuery();
    }
    setLoadingImport(false);
  };

  // 自定义查询函数，查询可能存在差异性，现做分离处理
  // const getPostData = (form) => {
  //   let obj = { ...form?.getFieldsValue(true) };
  //   const newObj = {};
  //   for (const [key, value] of Object.entries(obj)) {
  //     if (value !== undefined && value !== null && value !== "") {
  //       if (key === "baseStatus") {
  //         newObj[`${SearchName.EQ}_${key}`] = value;
  //       } else {
  //         newObj[`${SearchName.LIKE}_${key}`] = value;
  //       }
  //     }
  //   }
  //   return newObj;
  // };

  const getPostData = () => {
    let obj = { ...form.getFieldsValue(true) };
    const query = [
      { f: "baseStatus", q: QueryOperator.EQ },
    ];
    const filteredObj = filterQueryObject(obj);
    const newObj = QueryUtil.get(filteredObj, query);
    console.log(newObj);
    return newObj;
  };


  // 选择框
  const rowSelection = {
    fixed: "left",
    // type: 'radio', // 一次只能选择一行
    selectedRowKeys: keys,
    onChange: (selectedRowKeys, selectedRows) => {
      setKeys(selectedRowKeys);
      setRows(selectedRows);
    },
    // selections: [], // 去掉全选按钮
    width: "50",
  };

  //自定义列表-可伸缩排序
  const columns = [
    {
      dataIndex: 'number',
      width: 200,
      title: '编号',
      ellipsis: true,
      sorter: createSorter('number'),
    },
    {
      dataIndex: 'name',
      width: 200,
      title: '名称',
      ellipsis: true,
      sorter: createSorter('name'),
    },
    {
      dataIndex: 'supplierNo',
      width: 200,
      title: '供应商编号',
      ellipsis: true,
      sorter: createSorter('supplierNo'),
    },
    {
      dataIndex: 'supplierName',
      width: 200,
      title: '供应商名称',
      ellipsis: true,
      sorter: createSorter('supplierName'),
    },
    {
      dataIndex: 'creatorName',
      title: '创建人',
      sorter: createSorter('creatorName'),
      ellipsis: true,
      width: 200,
    },
    {
      dataIndex: 'createTime',
      title: '创建时间',
      render: (text) => (dateFormat(text, "YYYY-MM-DD")),
      sorter: createSorter('createTime'),
      ellipsis: true,
      width: 200,
    },
    {
      // 不知道字段名
      dataIndex: 'lastUpdateUserName',
      title: '修改人',
      sorter: createSorter('lastUpdateUserName'),
      ellipsis: true,
      width: 200,
    },
    {
      dataIndex: 'lastUpdateTime',
      title: '更新时间',
      render: (text) => (dateFormat(text, "YYYY-MM-DD")),
      sorter: createSorter('lastUpdateTime'),
      ellipsis: true,
      width: 200,
    },
    {
      dataIndex: 'baseStatus',
      title: '是否有效',
      render: (text, record) => {
        switch (record.baseStatus) {
          case 0:
            return (
              <div className="common-status">
                <i className="common-dot common-dot-success"></i>
                <span>是</span>
              </div>
            );
          case 1:
            return (
              <div className="common-status">
                <i className="common-dot common-dot-error"></i>
                <span>否</span>
              </div>
            );
          default:
            break;
        }
      },
      sorter: (a, b) => {
        if (!a.baseStatus || !b.baseStatus) return 0;
        return a.baseStatus - b.baseStatus;
      },
      width: 200,
      ellipsis: true,
    },
    // 更多列...
  ];

  // 自定义查询表单
  const searchForm = (
    // <div className="inner">
    <>
      <Form.Item
        label="名称" name="name">
        <Input placeholder="请输入" allowClear />
      </Form.Item>
      <Form.Item
        label="编号" name="number">
        <Input placeholder="请输入" allowClear />
      </Form.Item>
      <Form.Item
        label="供应商名称" name="supplierName">
        <Input placeholder="请输入" allowClear />
      </Form.Item>
      <Form.Item
        label="供应商编号" name="supplierNo">
        <Input placeholder="请输入" allowClear />
      </Form.Item>
      <Form.Item label="是否有效" name="baseStatus">
        <Select
          placeholder="请选择"
          allowClear
          options={[
            { label: '是', value: 0 },
            { label: '否', value: 1 },
            { label: '全部', value: '' }
          ]}
        />
      </Form.Item>
    </>
    // </div>
  );

  // 自定义查询表单
  const renderActions = (
    <div className="buttons">
      <Space>
        <Upload {...configOth}>
          <Button
            type="primary"
            loading={loadingImport}>
            数据导入
          </Button>
        </Upload>
        <Button
          type="primary"
          size="middle"
          onClick={downloadTemplate}
        >
        模板下载
        </Button>
        {/* <Button
          type="primary"
          ghost
          onClick={() => handleStatus(keys, false)}
          disabled={(!keys.length || rows.some(item => item.baseStatus === 1))}
        >
          失效
        </Button>
        <Button
          type="primary"
          ghost
          onClick={() => handleStatus(keys, true)}
          disabled={(!keys.length || rows.some(item => item.baseStatus === 0))}
        >
          生效
        </Button> */}

      </Space>
    </div>
  );

  useEffect(() => {
    if (!firstRender) {
      const getToken = async () => {
        const res = await getOssToken();
        const obj = new OSS(res);
        setClientOSS(obj);
      };
      getToken();
    }
    setFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender]);

  return (
    <div className="App">
      {/* url 自定义接口   colums自定义表单    crumbs自定义列表表头   searchForm 自定义查询表单   renderActions 自定义操作项不在columns里的  initialValues自定义搜索表单的初始值 
            getPostData查询函数（查询可能存在差异性，现做分离处理）
            */}
      <CustomTable
        ref={customTableRef}
        url={apis.supplierContract.List}
        columns={columns}
        roleId="yourRoleId"
        // crumbs={['基础资料', '自定义列表设置']}
        searchForm={searchForm}
        renderActions={renderActions}
        rowSelection={rowSelection}
        initialValues={initialValues}
        getPostData={getPostData}
      />
      {/* <Modal
        className="add-modal"
        wrapClassName="Data-modal"
        open={visible.visibleAdd_Edit}
        title="新增户籍类型"
        footer={null}
        width={526}
        onCancel={showModalAdd_Edit}
        maskClosable={false}
      >
        <div className="inner">
          <Form
            colon={false}
            form={formAddEdit}
            labelAlign="right"
            name="upload_form"
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            initialValues={initialValues}
          >
            <Form.Item
              label={<span><span style={{ color: 'red' }}>*</span>户籍类型名称</span>}
              name="name"
              rules={[
                {
                  required: true,
                  message: '请填写户籍类型名称',
                },
                {
                  pattern: /^\S+$/,
                  message: '户籍类型名称不能含空格'
                }
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item label="是否有效" name="baseStatus">
              <Select
                disabled
                allowClear
                options={[
                  { label: '是', value: 0 },
                  { label: '否', value: 1 }
                ]}
              />
            </Form.Item>
          </Form>
        </div>
        <div className="foot">
          <Space>
            <Button
              type="primary"
              onClick={handleValidateAdd_Edit}
              disabled={disabled.disabledAdd_Edit}
            >
              确定
            </Button>
            <Button onClick={showModalAdd_Edit}>取消</Button>
          </Space>
        </div>
      </Modal> */}
    </div>
  );
}

export default App;