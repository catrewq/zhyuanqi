import React from 'react';
import { XTabNavProps } from 'src/utils/navigateUtil';
import { Tab } from './TabsMenu';

export interface changeArgs {
    path: string;
    items: Tab[];
    props: XTabNavProps;
    crumbs?: string[];
    reset: boolean;
}

export interface TabMenuAddFunc {
    (path: string, callback: (openTabs: Tab[] | undefined) => void): void;
}
export const items: Tab[] = [];

const props = {} as XTabNavProps;
const func = (key: changeArgs, callback: (refresh: boolean) => void) => { };
const func2 = () => items
const func3 = (checkPath: string) => { return false };
const func4: TabMenuAddFunc = (path: string, callback: (openTabs: Tab[] | undefined) => void) => { };
const func5 = (openTabs: Tab[]) => { };
const func6 = () => props;

const TabsMenuContext = React.createContext(
    {
        isFirstRender: true,
        last: "", current: "", next: "",
        getTabs: func2,
        setTabs: func5,
        changeFunc: func,
        addFunc: func4,
        checkIsOpen: func3,
        props: func6
    });

export default TabsMenuContext;