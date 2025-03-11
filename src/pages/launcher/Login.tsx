import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "src/utils/axios";
import apis from "./api";
import Cookies from 'js-cookie';
interface LoginRequest {
  username: string;
  password: string;
  validateCode: string | undefined;
}

class LoginResponse {
  headers: any;
  data: innerData | undefined;
}

class innerData {
  success: boolean = false;
  message!: string;
  permissions!: string;
  info: any;
  userInfo: any;
}


const Login = () => {
  const navigate = useNavigate();
  // const [firstRender, setFirstRender] = useState(true);
  const [url, setUrl] = useState("");
  // const [code, setCode] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const getCaptcha = async () => {
    await axios.get(apis.validateCode)
      .then((response: any) => {
        sessionStorage.setItem("sessionId", response.headers["ssessionid"]);
        if (response.data && response.data.success) {
          let { data: base64 } = response.data;
          setUrl(base64)
        }
      });

  };

  const onFinish = (values: LoginRequest) => {
    handleLogin(values);
  };

  const handleLogin = async (obj: LoginRequest) => {
    setDisabled(true);
    await axios.post(
      'http://tooltest.zanhua.com.cn/test/api/fxiaoke/account/user/login',
      JSON.stringify({
        username: obj.username,
        password: obj.password,
        validateCode: obj.validateCode,
        // ...(sessionStorage.getItem("validateCode") ? { validateCode: obj.captcha } : {})
      }),
      {
        headers: {
          sessionid: sessionStorage.getItem("sessionId"),
          "Content-Type": "application/json"
        },
      }
    )
      .then((response: LoginResponse) => {
        // 先判断是否需要判断验证码
        if (response.data && !response.data.success && !response.data.userInfo) {
          message.error(response.data.message);
          console.log(response.headers["validatecode"]);
          setConfirmError(response.data.message);
          Cookies.set('sessionId', response.headers['ssessionid'], { expires: 7 });
          if (response.headers["validatecode"]) {
            sessionStorage.setItem("validateCode", response.headers["validatecode"]);
          }
          if (response.data.message === "验证码错误" || response.headers["validatecode"]) {
            getCaptcha();
          }
          setDisabled(false);
        } else if (response && response.data) {
          //登录成功
          Cookies.set('token', '0', { expires: 7 });
          Cookies.set('sessionId', response.headers['ssessionid'], { expires: 7 });

          // 需要设置密码
          if (response.data.info.initPwd === true) {
            navigate("resetPassword", {
              state: {
                sessionid: response.headers.ssessionid,
                accountId: Number(response.data.userInfo.operatorId),
              },
            });
            return;
          }
          // 成功登录
          else if (response.data && response.data.userInfo) {
            // 登录成功，存储 token 和 sessionId
            Cookies.set('token', '0', { expires: 7 });
            Cookies.set('sessionId', response.headers['ssessionid'], { expires: 7 });
            setDisabled(false);
            sessionStorage.removeItem("validateCode");
            window.location.reload();
          }
        }

        setDisabled(false);
      })
      .catch((error: any) => {
        // 后面得改成message.error，先这样写
        // message.error(error.data.rtnMessage);
        setDisabled(false);
      });
  };


  


  // 这段代码会在页面刷新或关闭时清除sessionStorage中的"validateCode"项
  window.addEventListener('beforeunload', (event) => {
    sessionStorage.removeItem("validateCode");
  });

  return (
    <div className="Login clearfix">
      <p className="logo"></p>
      <div className="container">
        <div className="pic"></div>
        <div className="form">
          <div className="inner">
            <p className="formIcon">账号登录</p>
            <Form
              name="basic"
              layout="vertical"
              requiredMark={false}
              onFinish={onFinish}
            >
              <Form.Item
                className="userName"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "",
                  },
                ]}
              >
                <Input placeholder="账号/手机号" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "",
                  },
                ]}
              >
                <Input.Password
                  placeholder="请输入登录密码"
                  iconRender={(visible: any) =>
                    visible ? <EyeFilled /> : <EyeInvisibleFilled />
                  }
                />
              </Form.Item>
              {(sessionStorage.getItem("validateCode") || confirmError === "验证码错误") && (
                <Form.Item className="captcha">
                  <Form.Item
                    name="validateCode"
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                  >
                    <Input placeholder="请输入验证码" maxLength={4} autoComplete="off" />
                  </Form.Item>
                  <Form.Item noStyle>
                    <img src={url} alt="" onClick={getCaptcha} />
                  </Form.Item>
                </Form.Item>
              )}

              <div className="pass_icp">
                <p >忘记密码？</p>
              </div>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="submit"
                  disabled={disabled}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
            <div className="icp">
              <p >没有账号？<span>立即注册</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default Login;
