import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { Timeline } from "antd";
import moment from "moment";
import { WomanOutlined, ManOutlined } from "@ant-design/icons";
import "./index.less";
import pass from "../assets/images/pass_spin.png";
import failed from "../assets/images/failed_spin.png";
import potato from "../assets/images/potato_spin.png";
import noPass from "../assets/images/noPass_spin.png";
// DetailPage组件
function DetailPage({ record, statusChild, modalVisible }) {
  const [detail, setDetail] = useState({});
  const [ResumeDetail, setResumeDetail] = useState({});
  useEffect(() => {
    const getDetail = async (record) => {
      const { recordKey } = record || {};
      if (!recordKey && !modalVisible) {
        // recordKey 为空时抛出错误或设置默认值
        return;
      }
      const { data } = await axios({
        method: "get",
        url: `/rpo/personal/deliver/record/current/proc/${recordKey}`,
      });
      if (data.success) {
        setDetail(data?.data);
        setResumeDetail(data?.data?.resume);
      }
    };
    getDetail(record);
  }, [record, modalVisible]);


  return (
    <div className="recruiment-page">
      <div className="detail-page">
        <section>
          <div className="title-header-line">
            <div className="items">
              <div className="title-and-buttons">
                <div className="title-and-header">
                  <img
                    style={{ alignSelf: 'center', paddingRight: '10px' }}
                    alt="取消图标"
                    src={potato}
                  />
                  {detail?.personName}
                  {ResumeDetail?.gender === 0 ? (
                    <ManOutlined
                      style={{
                        transform: 'rotate(0deg)',
                        color: '#2F80ED',
                        marginLeft: '10px'
                      }}
                    />
                  ) : (
                    <WomanOutlined
                      style={{
                        transform: 'rotate(60deg)',
                        color: '#EB5757',
                        marginLeft: '10px'
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="title-and-buttons">
                <div className="title-and-content">电话：{ResumeDetail?.contactInfo}</div>
                <div className="title-and-content right-content">
                  提报日期：{moment(detail?.createTime).format("YYYY-MM-DD")}
                </div>
              </div>
              <div className="title-and-buttons">
                <div className="title-and-content ">备注：{record?.remark}</div>
                <div className="title-and-content right-content">
                  业务员：{sessionStorage.getItem("yewuyuan")}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="title">
              状态信息
            </div>
            <Timeline className="my-timeline">
              {detail?.entry?.map(item => (
                <Timeline.Item
                  key={item.id}
                  dot={
                    <div className="dot-wrapper">
                      <p>{item.seq}</p>
                      <p>{moment(item.bizDate).format("YYYY-MM-DD")}</p>
                    </div>
                  }
                >
                  <div
                    className="item-content">
                    <p>
                      {item.srcStatusName}
                    </p>
                    <p>备注: {item.remark}</p>
                    {
                      !item?.isCanceled && (
                        item?.srcStatus === 7 ? (
                          <img alt="不通过图标" src={failed} className="cancel-img bottom-right" />
                        ) : (
                          <img alt="通过图标" src={pass} className="cancel-img bottom-right" />
                        )
                      )
                    }
                    {
                      item?.isCanceled && (
                        item?.srcStatus === 7 ? (
                          <img alt="不通过图标" src={failed} className="cancel-img bottom-right" />
                        ) : (
                          <img alt="撤销图标" src={noPass} className="cancel-img bottom-right" />
                        )
                      )
                    }

                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>

          <div className="title"> 基本信息</div>
          <div className="items">
            <div className="item">
              <div className="label">预计到岗时间</div>
              <div className="value">{record?.planedEntryDate ? moment(record?.planedEntryDate).format("YYYY-MM-DD") : ""}</div>
            </div>
            <div className="item">
              <div className="label">实际到岗时间</div>
              <div className="value">{record?.entryDate ? moment(record?.entryDate).format("YYYY-MM-DD") : ""}</div>
            </div>
            <div className="item">
              <div className="label">工作年限</div>
              <div className="value">{ResumeDetail?.workYears}</div>
            </div>
            <div className="item">
              <div className="label">接受工作地点</div>
              <div className="value">{ResumeDetail?.accpetWorkPlace}</div>
            </div>
            <div className="item">
              <div className="label">证件类型</div>
              <div className="value">{ResumeDetail?.certType}</div>
            </div>
            <div className="item">
              <div className="label">投递岗位ID</div>
              <div className="value">{detail?.positionNo}</div>
            </div>
            <div className="item">
              <div className="label">身份证号</div>
              <div className="value">{ResumeDetail?.idNo}</div>
            </div>
            <div className="item">
              <div className="label">最高学历</div>
              <div className="value">{ResumeDetail?.highestDegree}</div>
            </div>
            <div className="item">
              <div className="label">毕业院校</div>
              <div className="value">{ResumeDetail?.graduateCollege}</div>
            </div>
            <div className="title">职业信息</div>
            <ul className="edu-list">
              <li className="edu_style">
                <span className="edu_label">{ResumeDetail?.workExperience}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
export default DetailPage;
