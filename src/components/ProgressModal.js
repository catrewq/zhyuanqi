import { useEffect, useState } from "react";
import { Tag, Timeline, Tooltip } from "antd";
import { post } from "../utils/axios";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
// import "./ProgressCSS/progressCss.scss";
const ProgressDetail = (props) => {
  const { thirdNo, toggle, module, handleToggle } = props;
  const [data, setData] = useState({});
  const [lists, setLists] = useState([]); //明细列表
  const [rejectlists, setrejectLists] = useState([]); //明细列表
  const [notify, setNotify] = useState([]);
  useEffect(() => {
    console.log(toggle);
  }, [toggle]);
  // useEffect(() => {
  //   if (thirdNo) {
  //     post("opt/workflow/billProcess", {
  //       billId: thirdNo,
  //       flowModel: 0,
  //       module: module,
  //     }).then((res) => {
  //       if (res.success && res.resultData.details) {
  //         setData(res.resultData);
  //         setLists(res.resultData.details); //明细列表
  //         setrejectLists(res.resultData.rejectDetails); //驳回明细列表
  //         setNotify(res.resultData?.data?.notifyNodes?.notifyNode);
  //         const PubSub = require("pubsub-js");
  //         PubSub.publish("flowStatus", res.resultData.flowStatus);
  //       }
  //     });
  //   }
  // }, [thirdNo]);
  const Status = (props) => {
    const status = props.status;
    if (status === 1) {
      return <Tag color="green">审批中</Tag>;
    } else if (status === 2) {
      return <Tag color="#ed7d31">已驳回</Tag>;
    } else if (status === 3) {
      return <Tag color="red">已通过</Tag>;
    } else if (status === 0) {
      return <Tag color="volcano">待审核</Tag>;
    }
    return <></>;
  };
  const ItemStatus = (props) => {
    // console.log(props);
    const status = props.status;
    if (status === 1) {
      return <Tag color="green">审批中</Tag>;
    } else if (status === 3) {
      return <Tag color="#ed7d31">已同意</Tag>;
    } else if (status === 2) {
      return <Tag color="red">已驳回</Tag>;
    } else if (status === 0) {
      return <Tag color="geekblue">待审核</Tag>;
    } else if (status === 4) {
      return <Tag color="geekblue">已转审</Tag>;
    }
    return <></>;
  };
  return (
    <div className="common-check-panel">
      {toggle ? (
        <div className="inner">
          <div className="title">
            <Tooltip title="审批流程" placement="left">
              <DoubleLeftOutlined onClick={handleToggle} />
            </Tooltip>
          </div>
        </div>
      ) : (
        <>
          <div className="inner">
            <div className="title section">
              <DoubleRightOutlined onClick={handleToggle} />
              <p>审批单号：{data.billNo}</p>
              <p>审批模版：{data.flowName}流程 </p>
              <p>
                审批状态：<Status status={data.flowStatus}></Status>
              </p>
              <p>创建时间：{data.createTime}</p>
            </div>
            <div className="timeline section">
              <div className="titleHeader" style={{ marginBottom: 20 }}>
                <span>流程状态</span>
              </div>
              <Timeline>
                {lists.map((r, i) => {
                  return (
                    <Timeline.Item dot={<PoweroffOutlined />} key={i}>
                      <div>
                        <p>{r.approverDate}</p>
                        <p> 审批人：{r.approverName} </p>
                        <ItemStatus status={r.detailStatus}></ItemStatus>
                        {r.remark ? (
                          <p style={{ marginTop: 20 }}>备注:{r.remark} </p>
                        ) : (
                          <></>
                        )}
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </div>
            <div className="timeline section">
              <div className="titleHeader" style={{ marginBottom: 20 }}>
                <span>驳回记录</span>
              </div>
              <Timeline>
                {rejectlists.map((r, i) => {
                  return (
                    <Timeline.Item dot={<PoweroffOutlined />} key={i}>
                      <div>
                        <p>
                          <span>{r.approverName} </span>
                          <span style={{ marginLeft: 10 }}>
                            <ItemStatus status={r.detailStatus}></ItemStatus>
                          </span>
                        </p>
                        <p>{r.approverDate}</p>
                        {r.remark ? (
                          <p style={{ marginTop: 20 }}>驳回理由：{r.remark} </p>
                        ) : (
                          <></>
                        )}
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressDetail;
