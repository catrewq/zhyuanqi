import { EyeFilled, EyeInvisibleFilled, PoweroffOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Tooltip } from 'antd';
import { useContext, useState } from 'react';
import axios from "../utils/axios";
import ContainerContext from '../utils/context';
import Cookies from 'js-cookie'; // 导入 js-cookie 库

function User() {
  const [form] = Form.useForm();
  const { account, setMenu, setAccount, setLogged } = useContext(ContainerContext);
  const [confirmError, setConfirmError] = useState(null);
  const [newWordError, setNewWordError] = useState(null);
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [visible, setVisible] = useState(false);
  // const navigate = useNavigate();

  const rules = [
    {
      required: true,
      message: "必填项不能为空",
    },
  ];

  // const handleLogout = () => {
  //   sessionStorage.clear();
  //   Cookies.remove('token'); // 清除 token cookie
  //   Cookies.remove('sessionId'); // 清除 sessionId cookie
  //   localStorage.clear(); // 清空 localStorage
  //   setMenu([]); // 清空菜单数据
  //   setAccount({}); // 清空账号数据
  //   setLogged(false); // 更新登录状态
  //   window.location.href = '/';
  // }

  const handleLogout = () => {
    sessionStorage.clear();
    Cookies.remove('token'); // 清除 token cookie
    Cookies.remove('sessionId'); // 清除 sessionId cookie
    localStorage.clear(); // 清空 localStorage
    setMenu([]); // 清空菜单数据
    setAccount({}); // 清空账号数据
    setLogged(false); // 更新登录状态
    setTimeout(() => {
        window.location.href = '/';
    }, 100); // 延迟100毫秒
}

  const handleResetWord = () => {
    showModal();
    // navigate('/accountCreate/ResetPassword');
  }

  const handleRules = () => {
    if (form.getFieldValue("newPassword") !== form.getFieldValue("newPasswordOK")) {
      setConfirmError('新密码必须一致！');
    } else {
      setConfirmError(null);
    }

  }

  const handleNewWords = () => {
    // eslint-disable-next-line eqeqeq  
    if (form.getFieldValue("password") == form.getFieldValue("newPassword")) {
      setNewWordError('原密码与新密码不能一致');
    } else {
      setNewWordError(null);
    }

  }

  const handleValidate = () => {
    form
      .validateFields()
      .then(async () => {
        handleSubmit();
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  const handleSubmit = async () => {
    setDisabledBtn(true);
    let postData = { ...form.getFieldsValue(true) };
    delete postData.newPasswordOK;
    await axios({
      url: "/system/account/user/pwd/update",
      method: "put",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(postData),
    }).then((res) => {
      if (res.data.success) {
        message.success("修改密码成功");
        setDisabledBtn(false);
        form.resetFields();
        showModal();
      } else {
        message.error(res.data.message);
        setDisabledBtn(false);
        // form.resetFields();
      }
    })
      .catch((err) => {
        message.error(err.message);
        setDisabledBtn(false);
      });
  };

  const showModal = () => {
    form.resetFields();
    setVisible(!visible);
  };

  // 禁止复制粘贴
  const handleCopyPaste = (e) => {
    e.preventDefault();
  }

  return (
    <div className="userinfo">
      {/* mockmenu时需注释，其余环境需暴露 */}
      <Tooltip title="退出登录">
        <PoweroffOutlined onClick={handleLogout} />
      </Tooltip>
      {/* <Tooltip title="修改密码">
        <UserOutlined onClick={handleResetWord} />
      </Tooltip> */}
      <Modal
        className="add-modal"
        wrapClassName="recruiment-modal"
        open={visible}
        title="修改密码"
        footer={null}
        width={526}
        onCancel={showModal}
        maskClosable={false}
      >
        <div className="inner">
          <Form
            colon={false}
            form={form}
            labelAlign="right"
            name="upload_form"
            autoComplete="off"
            requiredMark={true}
            labelCol={{ span: 4 }} // 设置标签布局，例如宽度为6
            wrapperCol={{ span: 20 }}
          >
            <Form.Item
              label="原密码"
              name="password"
              rules={rules}
            >
              <Input.Password
                placeholder='请输入原密码'
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
                  message: "",
                  // pattern:new RegExp("^(?!\\d+$)(?![a-zA-Z]+$)(?![^\\da-zA-Z]+$).{8,}$"),
                  // message: '密码必须包含至少两种类型的字符（字母和数字，字母和特殊字符，或者数字和特殊字符）且长度至少为8位！',
                }
              ]}
              onBlur={handleNewWords}
            >
              <Input.Password
                placeholder='请输入新密码'
                iconRender={(visible) =>
                  visible ? <EyeFilled /> : <EyeInvisibleFilled />
                }
                onCopy={handleCopyPaste}
                onCut={handleCopyPaste}
                onPaste={handleCopyPaste}
              />
            </Form.Item>
            {newWordError && <div style={{ color: 'red', textAlign: "center" }}>{newWordError}</div>}
            <Form.Item
              label="确认密码"
              name="newPasswordOK"
              rules={rules}
              onBlur={handleRules}
            >
              <Input.Password
                placeholder='请再次输入新密码'
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
            <Button onClick={showModal}>取消</Button>
          </Space>
        </div>
      </Modal>
    </div>

  );
}

export default User;
