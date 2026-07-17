export enum QueryOperator {
    "LIKE" = "l",
    "EQ" = "=",
    "LTE" = "<=",
    "LT" = "<",
    "GTE" = ">=",
    "GT" = ">",
    "BETWEEN" = "V",
    "IN" = "in",
    "NOTIN" = "ni",
}

export interface IQuery {
    f: string,
    q?: QueryOperator,
    v?: any,
    t?: (arg: any) => any
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
        return getSearchParams(obj, undefined, eqFields, [], rangeFields);
    }
}

function getByQuery(obj: any, query: IQuery[]) {
    if (query && query.length > 0) {
        // 根据操作符进行分组
        let transfer: Map<string, (arg: any) => any> = new Map();
        let eqFields: string[] = [];
        let inFields: string[] = [];
        let rangeFields: string[] = [];
        let greaterFields: string[] = [];
        let lessFields: string[] = [];

        for (let index = 0; index < query.length; index++) {
            const _q = query[index];
            if (!_q || _q.q === undefined || _q.q === QueryOperator.LIKE) {
                continue;
            }

            if (_q.t !== null && _q.t !== undefined) {
                transfer.set(_q.f, _q.t);
            }

            if (_q.q === QueryOperator.EQ) {
                eqFields = [_q.f, ...eqFields];
            } else if (_q.q === QueryOperator.IN) {
                inFields = [_q.f, ...inFields];
            } else if (_q.q === QueryOperator.BETWEEN) {
                rangeFields = [_q.f, ...rangeFields];
            } else if (_q.q === QueryOperator.GTE || _q.q === QueryOperator.GT) {
                greaterFields = [_q.f, ...greaterFields];
            } else if (_q.q === QueryOperator.LTE || _q.q === QueryOperator.LT) {
                lessFields = [_q.f, ...lessFields];
            }
        }

        return getSearchParams(obj, transfer, eqFields, inFields, rangeFields, greaterFields, lessFields);
    } else {
        return getSearchParams(obj);
    }
}

function getSearchParams(obj: any, transfer?: Map<string, (arg: any) => any>, eqFields?: string[], inFields?: string[], rangeFields?: string[], greaterFields?: string[], lessFields?: string[]) {
    if (obj === null || obj === undefined) {
        return {};
    }

    const keyValues = Object.entries(obj);
    const ret: any = {};
    let ranges: Map<string, RangeElement> = new Map<string, RangeElement>();

    keyValues.forEach(element => {
        const param: string = element[0];
        let value: any = element[1];
        let trueValue;

        if (transfer && transfer !== undefined) {
            const func = getTransferFunc(transfer, param);
            if (func) {
                if (value instanceof Array) {
                    let _array = value;
                    trueValue = [];
                    for (let index = 0; index < _array.length; index++) {
                        const element = _array[index];
                        trueValue[index] = func(element);
                    }
                } else {
                    trueValue = func(value);
                }
            }
            // 强制转换 dayjs
            else if (value && value.$isDayjsObject) {
                //value = value.format();
                trueValue = value.$y + "-" + (value.$M + 1) + "-" + value.$D;
            } else {
                trueValue = value;
            }
        } else {
            trueValue = value;
        }

        // 处理等于字段
        if (eqFields && eqFields.length > 0 && eqFields.includes(param)) {
            ret["search_EQ_" + param] = trueValue;
            return;
        }

        // 处理包含字段
        if (inFields && inFields.length > 0 && inFields.includes(param)) {
            ret["search_IN_" + param] = trueValue;
            return;
        }

        // 处理大于字段
        if (greaterFields && greaterFields.length > 0 && greaterFields.includes(param)) {
            if (param.endsWith("Start")) {
                const trueParam = param.substring(0, param.length - 5);
                ret["search_GTE_" + trueParam] = trueValue;
            } else {
                ret["search_GT_" + param] = trueValue;
            }
            return;
        }

        // 处理小于字段
        if (lessFields && lessFields.length > 0 && lessFields.includes(param)) {
            if (param.endsWith("End")) {
                const trueParam = param.substring(0, param.length - 3);
                ret["search_LTE_" + trueParam] = trueValue;
            } else {
                ret["search_LT_" + param] = trueValue;
            }
            return;
        }

        // 处理范围字段
        if (rangeFields && rangeFields.length > 0) {
            for (let index = 0; index < rangeFields.length; index++) {
                const range = rangeFields[index];

                if (range === param && trueValue instanceof Array) {
                    let element: RangeElement = {
                        key: param,
                        start: trueValue[0],
                        end: trueValue[1]
                    };

                    ranges.set(range, element);
                    return;
                } else if (range + "Start" === param) {
                    let element: RangeElement | undefined = ranges.get(range);
                    if (element === undefined || element === null) {
                        element = { key: range, start: trueValue };
                    } else {
                        element.start = trueValue;
                    }
                    ranges.set(range, element);
                    return;
                } else if (range + "End" === param) {
                    let element: RangeElement | undefined = ranges.get(range);
                    if (element === undefined || element === null) {
                        element = { key: range, end: trueValue };
                    } else {
                        element.end = trueValue;
                    }
                    ranges.set(range, element);
                    return;
                }
            }
        }

        if (trueValue && ("" !== trueValue || (Array.isArray(trueValue) && trueValue.length > 0))) {
            ret["search_LIKE_" + param] = trueValue;
        }
    });

    // 遍历 rangeMap 获取三组数据
    if (ranges.size > 0) {
        let list: RangeElement[] = Array.from(ranges.values());

        const startList: [string, object][] = list.filter(e => e.start !== undefined && e.end === undefined).map(e => [e.key, e.start]);
        if (startList && startList.length > 0) {
            startList.forEach(element => {
                ret["search_GTE_" + element[0]] = element[1];
            });
        }

        const endList: [string, object][] = list.filter(e => e.start === undefined && e.end !== undefined).map(e => [e.key, e.end]);
        if (endList && endList.length > 0) {
            endList.forEach(element => {
                ret["search_LTE_" + element[0]] = element[1];
            });
        }

        const bothList: RangeElement[] = list.filter(e => e.start !== undefined && e.end !== undefined).map(e => e);
        if (bothList && bothList.length > 0) {
            bothList.forEach(element => {
                ret["search_BETWEEN_" + element.key] = element.start + "," + element.end;
            });
        }
    }

    return ret;

    function getTransferFunc(transfer: Map<string, (arg: any) => any>, param: string): ((arg: any) => any) | undefined {
        const func = transfer.get(param);
        if (func) {
            return func;
        }

        if (param.endsWith("Start")) {
            const trueParam = param.substring(0, param.length - 5);
            const func1 = transfer.get(trueParam);
            if (func1) {
                return func1;
            }
        }

        if (param.endsWith("End")) {
            const trueParam = param.substring(0, param.length - 3);
            const func1 = transfer.get(trueParam);
            if (func1) {
                return func1;
            }
        }

        return undefined;
    }

}

const util: QueryUtil = new QueryUtil();

export default util;
