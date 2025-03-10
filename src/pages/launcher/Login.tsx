import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "src/utils/axios";
import apis from "./api";

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
  const location = useLocation(); // 添加此行获取 location 对象
  const [url, setUrl] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // 添加 useEffect 记录查询参数
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const type = queryParams.get('type');
    console.log(location);
    console.log(id, type);
  }, [location]);

  const getCaptcha = async () => {
    await axios.get(apis.validateCode)
      .then((response: any) => {
        sessionStorage.setItem("sessionId", response.headers["ssessionid"]);
        if (response.data && response.data.success) {
          let { data: base64 } = response.data;
          setUrl(base64);
        }
      });
  };

  const onFinish = (values: LoginRequest) => {
    handleLogin(values);
  };

  const handleLogin = async (obj: LoginRequest) => {
    setDisabled(true);
    await axios.post(
      apis.login,
      JSON.stringify({
        username: obj.username,
        password: obj.password,
        validateCode: obj.validateCode,
      }),
      {
        headers: {
          sessionid: sessionStorage.getItem("sessionId"),
          "Content-Type": "application/json"
        },
      }
    )
      .then((response: LoginResponse) => {
        if (response.data && !response.data.success && !response.data.userInfo) {
          message.error(response.data.message);
          console.log(response.headers["validatecode"]);
          setConfirmError(response.data.message);
          sessionStorage.setItem("sessionId", response.headers["ssessionid"]);
          if (response.headers["validatecode"]) {
            sessionStorage.setItem("validateCode", response.headers["validatecode"]);
          }
          if (response.data.message === "验证码错误" || response.headers["validatecode"]) {
            getCaptcha();
          }
          setDisabled(false);
        } else if (response && response.data) {
          sessionStorage.setItem("token", "0");
          sessionStorage.setItem("sessionId", response.headers["ssessionid"]);
          console.log(response.headers);
          sessionStorage.setItem("yewuyuan", response.data.userInfo.operatorName);
          sessionStorage.setItem("permissions", response.data.permissions);

          if (response.data.info.initPwd === true) {
            navigate("resetPassword", {
              state: {
                sessionid: response.headers.ssessionid,
                accountId: Number(response.data.userInfo.operatorId),
              },
            });
            return;
          } else if (response.data && response.data.userInfo) {
            setDisabled(false);
            sessionStorage.removeItem("validateCode");

            // 从 sessionStorage 获取查询参数
            const redirectId = sessionStorage.getItem('redirectId');
            const redirectType = sessionStorage.getItem('redirectType');
            sessionStorage.removeItem('redirectId');
            sessionStorage.removeItem('redirectType');
            if (redirectId && redirectType) {
              navigate(`/pic/citylist?id=${redirectId}&type=${redirectType}`);
            } else {
              navigate("/tab/dashboard");
              window.location.reload();
            }
          }
        }

        setDisabled(false);
      })
      .catch((error: any) => {
        setDisabled(false);
      });
  };

  useEffect(() => {
    window.addEventListener('beforeunload', (event) => {
      sessionStorage.removeItem("validateCode");
    });
  }, []);

  return (
    <div className="Login clearfix">
      <p className="logo"></p>
      <div className="container">
        <div className="pic"></div>
        <div className="form">
          <div className="inner">
            <p className="formIcon">账号登录</p>
            <Form name="basic" layout="vertical" requiredMark={false} onFinish={onFinish}>
              <Form.Item className="userName" name="username" rules={[{ required: true, message: "" }]}>
                <Input placeholder="账号/手机号" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: "" }]}>
                <Input.Password
                  placeholder="请输入登录密码"
                  iconRender={(visible: any) =>
                    visible ? <EyeFilled /> : <EyeInvisibleFilled />
                  }
                />
              </Form.Item>
              {(sessionStorage.getItem("validateCode") || confirmError === "验证码错误") && (
                <Form.Item className="captcha">
                  <Form.Item name="validateCode" rules={[{ required: true, message: "" }]}>
                    <Input placeholder="请输入验证码" maxLength={4} autoComplete="off" />
                  </Form.Item>
                  <Form.Item noStyle>
                    <img src={url} alt="" onClick={getCaptcha} />
                  </Form.Item>
                </Form.Item>
              )}
              <div className="pass_icp">
                <p>忘记密码？</p>
              </div>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="submit" disabled={disabled}>
                  登录
                </Button>
              </Form.Item>
            </Form>
            <div className="icp">
              <p>没有账号？<span>立即注册</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;