import { Result } from 'antd';
import './index.less';

const Page404 = () => (
  <div className="Error">
    {/* <FixHeader /> */}

    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
    />
  </div>
);
export default Page404;
