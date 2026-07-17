import { createContext } from 'react';


export interface MenuType {

    id: number
    parentId: number
    name: string
    type: number
    path: string
    icon: string | React.JSX.Element
    menuKey: string
    sort: number
    remark: string
    children: MenuType[]

}

const loginInfo: { account: any, menu: MenuType[] } = { account: undefined, menu: [] };

const ContainerContext = createContext(loginInfo);
export default ContainerContext;