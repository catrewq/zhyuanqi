import { HomeFilled } from "@ant-design/icons";
import { Breadcrumb, Layout } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import User from "./User";
const { Header } = Layout;

const FixHeader = (props: any) => {
  const { crumbs } = props;
  const [visible, setVibile] = useState(false);

  useEffect(() => {
    if (crumbs?.length) {
      setVibile(true);
    }
  }, [crumbs]);

  return (
    <Header className="common-header">
      <div className="logo">
        <b>F</b>
        <span>分销客</span>
      </div>
      {/* <p className="logo"></p> */}
      {visible && (
        <Breadcrumb className="breadcrumbs">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeFilled />
            </Link>
          </Breadcrumb.Item>
          {crumbs?.map((item: any, index: number) => (
            <Breadcrumb.Item key={index}>
              {crumbs.length > 2 && index === 1 ? (
                <Link to=".." relative="path">
                  {item}
                </Link>
              ) : (
                <>{item}</>
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      <User />
    </Header>
  );
}

export default FixHeader;