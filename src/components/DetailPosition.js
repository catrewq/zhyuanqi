import { useState, useEffect } from "react";
import {
  Tag,
} from "antd";
import { fetchDetail } from "../utils/apiData"; //测试接口
import "./index.less";
import "./index.less";
function DetailPosition({ record, modalVisible }) {
  const [detail, setDetails] = useState({});
  useEffect(() => {
    if (record) {
      const fetchData = async (item) => {
        const { id } = item;
        fetchDetail(id, "/rpo/ent/position")
          .then((response) => {
            setDetails(response?.data?.data);
          })
          .catch((error) => {
            console.error(error);
          });
      };
      fetchData(record);
    }
  }, [record, modalVisible]);

  return (
    <div className="recruiment-page">
      <div className="detail-page">
        <section>
          <div className="title-header-line">
            <div className="items">
              <div className="title-and-buttons">
                <div className="title-and-header">
                  {detail?.name}
                  <Tag
                    color={detail?.isRecruiting === 0 ? "#118850" : "#DFE2EA"}
                    style={{
                      borderRadius: "6px",
                      minWidth: "30px",
                      marginLeft: "10px",
                    }}
                  >
                    {detail?.isRecruiting === 0 ? "在招" : "停招"}
                  </Tag>
                </div>
                <div className="buttons">
                </div>
              </div>
              <div className="title-and-buttons">
                <div className="title-and-content texts_style">{detail?.salaryStructure}</div>
                <div className="title-and-content right-content">
                  {detail?.recruitDateStart + "-" + detail?.recruitDateEnd}
                </div>
              </div>
            </div>
          </div>

          <div className="title">用工信息</div>
          <div className="items">
            <div className="item">
              <div className="label">所属商务合同</div>
              <div className="value">{detail?.contractNo}</div>
            </div>
            <div className="item">
              <div className="label">用工企业</div>
              <div className="value">{detail?.entName}</div>
            </div>
            <div className="item">
              <div className="label">岗位名称</div>
              <div className="value">{detail?.name}</div>
            </div>
            <div className="item">
              <div className="label">需求人数</div>
              <div className="value">{detail?.positonNum}</div>
            </div>
            <div className="item">
              <div className="label">岗位id</div>
              <div className="value">{detail?.number}</div>
            </div>
            <div className="item">
              <div className="label">岗位备注</div>
              <div className="value">{detail?.remark}</div>
            </div>
            <div className="title">招聘信息</div>
            <div className="item">
              <div className="label">工作时间</div>
              <div className="value">
                {detail?.workingTimeStart + "~" + detail?.workingTimeEnd}
              </div>
            </div>
            <div className="item">
              <div className="label">年龄范围</div>
              <div className="value">
                {detail?.ageRange}
              </div>
            </div>
            <div className="item">
              <div className="label">详细地点</div>
              <div className="value">{detail?.workingAddress}</div>
            </div>
            <div className="item">
              <div className="label">薪资结构</div>
              <div className="value">{detail?.salaryStructure}</div>
            </div>
            <div className="item">
              <div className="label">发薪模式</div>
              <div className="value">{detail?.payrollMode}</div>
            </div>
            <div className="item">
              <div className="label">最低学历</div>
              <div className="value">{detail?.lowestDegree}</div>
            </div>
            <div className="item">
              <div className="label">是否出差</div>
              <div className="value">{detail?.isBizTrip === false ? " 否" : "是"}</div>
            </div>
            <div className="item">
              <div className="label">食宿供否</div>
              <div className="value">{detail?.isAccommdation === false ? " 否" : "是"}</div>
            </div>
            <div className="item">
              <div className="label">是否五险</div>
              <div className="value">{detail?.isInsurance === false ? " 否" : "是"}</div>
            </div>
            <div className="item">
              <div className="label">是否夜班</div>
              <div className="value">{detail?.isWorkNight === false ? " 否" : "是"}</div>
            </div>
          </div>
          <div className="title">工作地点</div>
          <ul className="edu-lists">
            <li className="edu_styles">
              <span className="edu_labels">{detail?.workingPlace}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
export default DetailPosition;
