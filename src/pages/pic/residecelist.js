
//使用自定义表格
import React, { useRef, useState, useEffect } from 'react';
import CustomTable from 'src/components/publicUI/table'; // 你的 uiCustomTable组件的路径
import { Button, Form, Input, Space, Modal, Select, message, Tooltip } from 'antd';
import { createSorter, showInfo, filterQueryObject, getGenericStatus } from "src/utils/util";
import { DownOutlined } from '@ant-design/icons';
import { apis } from 'src/utils/apis';
import axios from 'src/utils/axios';
import SearchName from "src/utils/apiEnum";
import { dateFormat } from 'src/utils/dateFormatDayjs';
import { handleBatchActions, fetchDownload } from 'src/utils/apiData';
import { statusMap, finishMap } from './enum';
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
const { confirm } = Modal;
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

    const initialValues = {
        baseStatus: 0,
    }
    // 在按钮的点击事件处理函数中通过 ref 调用 query 方法
    const refQuery = () => {
        if (customTableRef.current) {
            customTableRef.current.reset();
        }
    };


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
                        handleBatchActions(resolve, reject, value, isStatus, apis.residence.List)
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

    // 导出
    const handleExport = async () => {
        setLoadingExport(true);
        let objs = getPostData(),
            postData = {
                ...objs,
            };
        fetchDownload(postData, apis.residence.List)
            .then((response) => {
                if (response.data.success) {
                    if (response.data.data) {
                        getFile(response.data.data);
                    } else {
                        message.error("未查出相关导出数据")
                    }
                    setLoadingExport(false);
                }
            })
            .catch((error) => {
                console.error(error);
                setLoadingExport(false);
            });
    };

    const showModalAdd_Edit = () => {
        setVisible(prevState => ({
            ...prevState,
            visibleAdd_Edit: !prevState.visibleAdd_Edit,
        }));
        formAddEdit.resetFields();
    };

    const handleValidateAdd_Edit = () => {
        formAddEdit
            .validateFields()
            .then(async () => {
                handleSubmitAdd_Edit();
            })
            .catch((errors) => {
                console.log(errors);
            });
    };

    const handleSubmitAdd_Edit = async () => {
        setDisabled({
            ...disabled,
            disabledAdd_Edit: true,
        });
        let postData = { ...formAddEdit.getFieldsValue(true) };
        console.log(postData);
        const { data } = await axios({
            // 编辑，新增
            url: `${apis.residence.List}/create`,
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(postData),
        });
        if (data.success) {
            message.success(data.message);
            refQuery();
            setDisabled({
                ...disabled,
                disabledAdd_Edit: false,
            });
            showModalAdd_Edit();
        } else {
            message.error(data.message);
            setDisabled({
                ...disabled,
                disabledAdd_Edit: false,
            });
        }
    };

    // 自定义查询函数，查询可能存在差异性，现做分离处理
    const getPostData = (form) => {
        let obj = { ...form?.getFieldsValue(true) };

        // 构建查询条件
        const query = [
            { f: "insStatus", q: QueryOperator.EQ },
            { f: "isFinish", q: QueryOperator.EQ },
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
            dataIndex: 'insStatus',
            width: 200,
            title: '巡检状态',
            ellipsis: true,
            sorter: createSorter('insStatus', true),
            // 自己瞎写的枚举
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
        },
        {
            dataIndex: 'isFinish',
            width: 200,
            title: '是否完成巡检',
            ellipsis: true,
            sorter: createSorter('isFinish'),
            render: (isFinish) => getGenericStatus(isFinish, finishMap),
        },
        {
            dataIndex: 'startDate',
            width: 200,
            title: '开始时间',
            ellipsis: true,
            sorter: createSorter('startDate'),
            render: (text) => (dateFormat(text, "YYYY-MM-DD HH:mm:ss")),
        },
        {
            dataIndex: 'endDate',
            width: 200,
            title: '结束时间',
            ellipsis: true,
            sorter: createSorter('endDate'),
            render: (text) => (dateFormat(text, "YYYY-MM-DD HH:mm:ss")),
        },
        {
            dataIndex: 'shopCount',
            width: 200,
            title: '门店数量',
            ellipsis: true,
            sorter: createSorter('shopCount', true),
        },
        {
            dataIndex: 'finishConut',
            width: 200,
            title: '完成数量',
            ellipsis: true,
            sorter: createSorter('finishConut', true),
        },
        {
            dataIndex: 'notFinishCount',
            width: 200,
            title: '未完成数量',
            ellipsis: true,
            sorter: createSorter('notFinishCount', true),
        },
        {
            dataIndex: 'notFinReason',
            width: 200,
            title: '未完成原因',
            ellipsis: true,
            sorter: createSorter('notFinReason'),
        },
        // 更多列...
    ];

    // 自定义查询表单
    const searchForm = (
        <>
            <Form.Item label="巡检状态" name="insStatus">
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
            <Form.Item label="是否完成巡检" name="isFinish">
                <Select
                    placeholder="请选择"
                    allowClear
                    options={[
                        { label: '是', value: true },
                        { label: '否', value: false },
                        { label: '全部', value: '' }
                    ]}
                />
            </Form.Item>
        </>
    );

    // 自定义查询表单
    const renderActions = (
        <div className="buttons">
            <Space>
                <Button
                    type="primary"
                    size="middle"
                    onClick={showModalAdd_Edit}
                >
                    新增户籍类型
                </Button>
                <Button
                    type="primary"
                    size="middle"
                    onClick={handleExport}
                    loading={loadingExport}
                >
                    导出
                </Button>
                <Button
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
                </Button>
            </Space>
        </div>
    );

    useEffect(() => {
        if (!firstRender) {
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
                url={apis.residence.List}
                columns={columns}
                roleId="yourRoleId"
                // crumbs={['基础资料', '自定义列表设置']}
                searchForm={searchForm}
                renderActions={renderActions}
                rowSelection={rowSelection}
                // initialValues={initialValues}
                getPostData={getPostData}
            />
            <Modal
                className="add-modal"
                wrapClassName="Data-modal"
                open={visible.visibleAdd_Edit}
                title="新增户籍类型"
                footer={null}
                width={526}
                onCancel={showModalAdd_Edit}
                maskClosable={false}
            >
                <div>
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
            </Modal>
        </div>
    );
}

export default App;