
//使用自定义表格
import React, { useRef, useState, useEffect } from 'react';
import CustomTable from 'src/components/publicUI/table'; // 你的 uiCustomTable组件的路径
import { Button, Form, Input, Space, Modal, Select, message, Tooltip, DatePicker } from 'antd';
import { createSorter, showInfo, filterQueryObject, getGenericStatus } from "src/utils/util";
import { DownOutlined } from '@ant-design/icons';
import { apis } from 'src/utils/apis';
import axios from 'src/utils/axios';
import SearchName from "src/utils/apiEnum";
import { dateFormat } from 'src/utils/dateFormatDayjs';
import { statusMap, finishMap } from './enum';
import QueryUtil, { QueryOperator } from "src/utils/ObjectParamUtil";
import OssProxy from 'src/utils/OssProxyUtil';
import moment from 'moment';
const { confirm } = Modal;
const App = () => {
    const customTableRef = useRef();//ref绑定CustomTable组件
    const [firstRender, setFirstRender] = useState(true);
    const [formAddEdit] = Form.useForm();
    const [visible, setVisible] = useState({
        visibleAdd_Edit: false,
        mode: null,
    });

    const [disabledModal, setDisabledModal] = useState({
        disabled_release: false,
    });


    // 在按钮的点击事件处理函数中通过 ref 调用 query 方法
    const refQuery = () => {
        if (customTableRef.current) {
            customTableRef.current.reset();
        }
    };



    const showModalAdd_Edit = (operate) => {
        setVisible(prevState => ({
            ...prevState,
            visibleAdd_Edit: !prevState.visibleAdd_Edit,
            mode: operate
        }));
        setDisabledModal(prevState => ({
            ...prevState,
            disabled_release: false,
        }));

        formAddEdit.resetFields();
    };

    const handleValidateAdd_Edit = () => {
        formAddEdit
            .validateFields()
            .then(async () => {
                handleSubmit();
            })
            .catch((errors) => {

            });
    };




    const handleSubmit = async () => {
        setDisabledModal(prevState => ({
            ...prevState,
            disabled_release: true,
        }));

        let postData = { ...formAddEdit.getFieldsValue(true) };

        if (postData.yearMonth) {
            postData.yearMonth = Number(dateFormat(postData.yearMonth, "YYYYMM"));
        }

        const url = visible.mode === 'download'
            ? '/bill/inspection/print/download/asyn'
            : '/bill/inspection/gen/cache';

        try {
            const { data } = await axios({
                url,
                method: "post",
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(postData),
            });

            if (data.success) {
                if (typeof data.data === 'string' && data.data.includes('.xlsx')) {
                    OssProxy.getUrl(data.data).then((url) => {
                        window.open(url);
                    });
                } 
                message.success(data.message);
                showModalAdd_Edit();
                setDisabledModal({
                    ...disabledModal,
                    disabled_release: false,
                });
                refQuery();
            } else {
                message.error(data.message);
                setDisabledModal({
                    ...disabledModal,
                    disabled_release: false,
                });
            }
        } catch (error) {
            if (error?.data?.message) {
                message.error(error?.data?.message);
            } else {
                message.error("请求失败，请稍后重试");
            }
            setDisabledModal({
                ...disabledModal,
                disabled_release: false,
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
        return newObj;
    };


    // // 选择框
    // const rowSelection = {
    //     fixed: "left",
    //     selectedRowKeys: keys,
    //     onChange: (selectedRowKeys, selectedRows) => {
    //         setKeys(selectedRowKeys);
    //         setRows(selectedRows);
    //     },
    //     width: "50",
    // };

    //自定义列表-可伸缩排序
    const columns = [
        {
            dataIndex: 'number',
            width: 200,
            title: '编码',
        },
        {
            dataIndex: 'insStatus',
            width: 200,
            title: '巡检状态',
            ellipsis: true,
            sorter: createSorter('insStatus', true),
            // 自己瞎写的枚举
            render: (text, record) => {
                switch (record.insStatus) {
                    case "1":
                        return (
                            <div className="common-status">
                                <i className="common-dot common-dot-success"></i>
                                <span>巡检中</span>
                            </div>
                        );
                    case "2":
                        return (
                            <div className="common-status">
                                <i className="common-dot common-dot-error"></i>
                                <span>巡检结束</span>
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
            sorter: createSorter('isFinish', true),
            render: (text, record) => {
                switch (record.isFinish) {
                    case 1:
                        return (
                            <div className="common-status">
                                <i className="common-dot common-dot-success"></i>
                                <span>是</span>
                            </div>
                        );
                    case 2:
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
                        { label: '巡检中', value: "1" },
                        { label: '巡检结束', value: "2" },
                        { label: '全部', value: '' }
                    ]}
                />
            </Form.Item>
            <Form.Item label="是否完成巡检" name="isFinish">
                <Select
                    placeholder="请选择"
                    allowClear
                    options={[
                        { label: '是', value: 1 },
                        { label: '否', value: 2 },
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
                    onClick={() => showModalAdd_Edit("download")}
                >
                    按月份下载excel
                </Button>
                <Button
                    type="primary"
                    size="middle"
                    onClick={() => showModalAdd_Edit("generate")}
                >
                    按月份重新生成excel
                </Button>
            </Space>
        </div>
    );

    // 定义一个函数来禁用当前日期之后的日期
    const disabledDate = (current) => {
        // 禁用今天之后的所有日期
        return current && current > moment().endOf('month');
    };



    return (
        <div className="App">
            {/* url 自定义接口   colums自定义表单    crumbs自定义列表表头   searchForm 自定义查询表单   renderActions 自定义操作项不在columns里的  initialValues自定义搜索表单的初始值 
            getPostData查询函数（查询可能存在差异性，现做分离处理）
            */}
            <CustomTable
                ref={customTableRef}
                url={apis.inspection.list}
                columns={columns}
                // roleId="yourRoleId"
                searchForm={searchForm}
                renderActions={renderActions}
                // rowSelection={rowSelection}
                // initialValues={initialValues}
                getPostData={getPostData}
            />
            <Modal
                className="add-modal"
                wrapClassName="Data-modal"
                open={visible.visibleAdd_Edit}
                title={visible.mode === "download" ? "按月份下载excel" : "按月份重新生成excel"}
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
                    >
                        <Form.Item
                            label="起始月份"
                            name="yearMonth"
                            rules={[{ required: true, message: '' }]}
                        >
                            <DatePicker
                                format="YYYYMM"
                                picker="month"
                                placeholder="请选择"
                                allowClear
                            // disabledDate={disabledDate}
                            />
                        </Form.Item>
                    </Form>
                </div>
                <div className="foot">
                    <Space>
                        <Button
                            type="primary"
                            loading={disabledModal.disabled_release}
                            onClick={handleValidateAdd_Edit}
                        >
                            提交
                        </Button>
                        <Button onClick={showModalAdd_Edit}>取消</Button>
                    </Space>
                </div>
            </Modal>
        </div>
    );
}

export default App;