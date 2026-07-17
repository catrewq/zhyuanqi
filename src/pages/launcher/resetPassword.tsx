import { EyeFilled, EyeInvisibleFilled, IdcardOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, message } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "src/utils/axios";

function Detail() {
    const location = useLocation();
    const [form] = Form.useForm();
    const [firstRender, setFirstRender] = useState(true);
    const [confirmError, setConfirmError] = useState("");
    const [newWordError, setNewWordError] = useState("");
    const [disabledBtn, setDisabledBtn] = useState(false);
    const [sessionid] = useState(location.state.sessionid);
    const [accountId] = useState(location.state.accountId)

    const rules = [
        {
            required: true,
            message: "必填项不能为空",
        },
    ];


    // const calculateStrength = (password) => {
    //     // 这里只是一个简单的例子，你可以根据自己的需求来计算密码强度
    //     const pattern = new RegExp("^(?!\\d+$)(?![a-zA-Z]+$)(?![^\\da-zA-Z]+$).{8,}$");
    //     if (password.length >= 8 && pattern.test(password)) {
    //         return 100;
    //     } else if (password.length >= 5) {
    //         return 60;
    //     } else if (password.length > 0) {
    //         return 30;
    //     } else {
    //         return 0;
    //     }
    // };

    // const handleChange = (e) => {
    //     const password = e.target.value;

    //     setStrength(calculateStrength(password));

    // };

    const handleRules = () => {
        if (form.getFieldValue("newPassword") !== form.getFieldValue("newPasswordOK")) {
            setConfirmError('新密码必须一致！');
        } else {
            setConfirmError("");
        }

    }

    // const handleWords = () => {
    //     if (form.getFieldValue("password") !== sessionStorage.getItem("oldPassword")) {
    //         setWordError('原密码与登录密码不一致');
    //     } else {
    //         setWordError(null);
    //     }

    // }

    const handleNewWords = () => {
        if (form.getFieldValue("password") === sessionStorage.getItem("newPassword")) {
            setNewWordError('原密码与新密码不能一致');
        } else {
            setNewWordError("");
        }

    }

    const handleValidate = () => {
        form
            .validateFields()
            .then(async () => {
                handleSubmit();
            })
            .catch((errors) => {

            });
    };

    const handleSubmit = async () => {
        setDisabledBtn(true);
        let postData = { ...form.getFieldsValue(true), accountId: accountId };
        delete postData.newPasswordOK;
        console.log(postData);
        await axios({
            url: "/account/user/pwd/update",
            method: "put",
            headers: {
                "Content-Type": "application/json",
                // sessionid: sessionid,
                ssessionid: sessionid,
            },
            data: JSON.stringify(postData),
        }).then((res) => {
            if (res.data.success) {
                message.success("修改密码成功");
                setDisabledBtn(false);
                form.resetFields();
                window.location.reload();
            } else {
                message.error(res.data.message);
                setDisabledBtn(false);
                form.resetFields();
            }
        })
            .catch((err) => {

            });
    };

    // 禁止复制粘贴
    const handleCopyPaste = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
    }

    useEffect(() => {
        if (!firstRender) {
            let { sessionid, accountId } = location.state;

            console.log("sessionid", sessionid);
            console.log("accountId", accountId);
            return;
        }
        setFirstRender(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstRender]);

    return (
        <div>
            <div className="reset-page">
                <div className="detail-page" >
                    <section>
                        <div className="title">
                            <IdcardOutlined className="outlined-style" />
                            基本信息
                        </div>
                        <div className="container">
                            <div className="img-style">
                                <div className="icp" style={{ marginTop: "40%" }}>
                                    <p>密码要求：</p>
                                    <p>含有两种类型且大于等于8位（12345abcde或abcde!@#$%）</p>
                                </div>
                            </div>
                            <div className="form-style">
                                <div className="limit-style">
                                    <Form
                                        colon={false}
                                        form={form}
                                        labelAlign="right"
                                        name="upload_form"
                                        autoComplete="off"
                                        // layout="vertical"
                                        requiredMark={true}
                                        labelCol={{ span: 4 }} // 设置标签布局，例如宽度为6
                                        wrapperCol={{ span: 20 }} // 设置控件布局，例如宽度为18
                                    >
                                        <Form.Item
                                            label="原密码"
                                            name="password"
                                            rules={rules}
                                        // onBlur={handleWords}
                                        >
                                            <Input.Password
                                                placeholder="请输入原密码"
                                                iconRender={(visible) =>
                                                    visible ? <EyeFilled /> : <EyeInvisibleFilled />
                                                }
                                                onCopy={handleCopyPaste}
                                                onCut={handleCopyPaste}
                                                onPaste={handleCopyPaste}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="新密码"
                                            name="newPassword"
                                            rules={[
                                                {
                                                    required: true,
                                                    pattern: new RegExp("^(?!\\d+$)(?![a-zA-Z]+$)(?![^\\da-zA-Z]+$).{8,}$"),
                                                    message: '密码必须包含至少两种类型的字符（字母和数字，字母和特殊字符，或者数字和特殊字符）且长度至少为8位！',
                                                }
                                            ]}
                                        // onBlur={handleNewWords}
                                        >
                                            <Input.Password
                                                placeholder="请输入新密码"
                                                iconRender={(visible) =>
                                                    visible ? <EyeFilled /> : <EyeInvisibleFilled />
                                                }
                                                onCopy={handleCopyPaste}
                                                onCut={handleCopyPaste}
                                                onPaste={handleCopyPaste}
                                            />
                                            {/* <Progress percent={strength} /> */}
                                        </Form.Item>

                                        {newWordError && <div style={{ color: 'red', textAlign: "center" }}>{newWordError}</div>}
                                        <Form.Item
                                            label="确认密码"
                                            name="newPasswordOK"
                                            rules={rules}
                                        // onBlur={handleRules}
                                        >
                                            <Input.Password
                                                placeholder="请输入确认密码"
                                                iconRender={(visible) =>
                                                    visible ? <EyeFilled /> : <EyeInvisibleFilled />
                                                }
                                                onCopy={handleCopyPaste}
                                                onCut={handleCopyPaste}
                                                onPaste={handleCopyPaste}
                                            />
                                        </Form.Item>
                                        {confirmError && <div style={{ color: 'red', textAlign: "center" }}>{confirmError}</div>}
                                    </Form>
                                </div>
                                <div className="foot">
                                    <Space>
                                        <Button
                                            type="primary"
                                            onClick={handleValidate}
                                            disabled={disabledBtn}
                                        >
                                            修改
                                        </Button>
                                        <Button >取消</Button>
                                    </Space>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>
            </div>
        </div>

    );
}

export default Detail;