export enum QueryQprator {
    "LIKE",
    "EQ",
    "LTE",
    "LT",
    "GTE",
    "GT",
    "BETWEEN",
    "IN",
    "NOTIN",
}

export interface IQuery {
    f: string,
    q?: QueryQprator
}

export interface RangeElement {
    key: string,
    start?: any,
    end?: any;
}

class QueryUtil {

    get(obj: any, query: IQuery[]) {
        return getByQuery(obj, query);
    }

    getByFields(obj: any, eqFields: string[], rangeFields: string[]) {
        return getSearchParams(obj, eqFields, [], rangeFields);
    }

}

function getByQuery(obj: any, query: IQuery[]) {
    if (query && query.length > 0) {
        // 根据操作符进行分组
        let eqFields: string[] = [];
        let inFields: string[] = [];
        let rangeFields: string[] = [];

        for (let index = 0; index < query.length; index++) {
            const _q = query[index];
            if (!_q || _q.q === undefined || _q.q === QueryQprator.LIKE) {
                continue;
            }

            if (_q.q === QueryQprator.EQ) {
                eqFields = [_q.f, ...eqFields];
            }
            else if (_q.q === QueryQprator.IN) {
                inFields = [_q.f, ...inFields];
            }
            else if (_q.q === QueryQprator.BETWEEN) {
                rangeFields = [_q.f, ...rangeFields];
            }

        }

        return getSearchParams(obj, eqFields, inFields, rangeFields);
    } else {
        return getSearchParams(obj);
    }
}

function getSearchParams(obj: any, eqFields?: string[], inFields?: string[], rangeFields?: string[]) {
    if (obj === null || obj === undefined) {
        return {};
    }

    const keyValues = Object.entries(obj);
    const ret: any = {};
    let ranges: Map<string, RangeElement> = new Map<string, RangeElement>();

    keyValues.forEach(element => {
        const param: string = element[0];
        let value: any = element[1];
        // 强制转换dayjs

        // 检查value是否为Day.js对象 
        if (value && value.$isDayjsObject) {
            value = value.$y + "-" + (value.$M + 1) + "-" + value.$D;
        }

        if (eqFields && eqFields.length > 0 && eqFields.includes(param)) {
            ret["search_EQ_" + param] = value;
            return;
        }

        if (inFields && inFields.length > 0 && inFields.includes(param)) {
            ret["search_IN_" + param] = value;
            return;
        }

        if (rangeFields && rangeFields.length > 0) {
            for (let index = 0; index < rangeFields.length; index++) {
                const range = rangeFields[index];

                if (range + "Start" === param) {
                    let element: RangeElement | undefined = ranges.get(range);
                    if (element === undefined || element === null) {
                        element = { key: range, start: value };
                    } else {
                        element.start = value;
                    }

                    ranges.set(range, element);
                    return;
                }
                else if (range + "End" === param) {
                    let element: RangeElement | undefined = ranges.get(range);
                    if (element === undefined || element === null) {
                        element = { key: range, end: value };
                    } else {
                        element.end = value;
                    }

                    ranges.set(range, element);
                    return;
                }
            }
        }

        if (value && ("" !== value || (Array.isArray(value) && value.length > 0))) {
            ret["search_LIKE_" + param] = value;
        }
    });

    // 遍历 rangeMap 获取三组数据
    if (ranges.size > 0) {
        let list: RangeElement[] = Array.from(ranges.values());

        const startList: [string, object][] = list.filter(e => {
            return e.start !== undefined && e.end === undefined;
        }).map(e => {
            return [e.key, e.start];
        });
        if (startList && startList.length > 0) {
            startList.forEach(element => {
                ret["search_GTE_" + element[0]] = element[1];
            });
        }

        const endList: [string, object][] = list.filter(e => {
            return e.start === undefined && e.end !== undefined;
        }).map(e => {
            return [e.key, e.end];
        });
        if (endList && endList.length > 0) {
            endList.forEach(element => {
                ret["search_LTE_" + element[0]] = element[1];
            });
        }

        const bothList: RangeElement[] = list.filter(e => {
            return e.start !== undefined && e.end !== undefined;
        }).map(e => {
            return e;
        });
        if (bothList && bothList.length > 0) {
            bothList.forEach(element => {
                ret["search_BETWEEN_" + element.key] = element.start + "," + element.end;
            });
        }

    }

    return ret;
}

const util: QueryUtil = new QueryUtil();

export default util;
