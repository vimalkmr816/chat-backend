"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterObj = void 0;
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    obj &&
        Object.keys(obj).forEach(el => {
            if (allowedFields.includes(el)) {
                newObj[el] = obj[el];
            }
        });
    return newObj;
};
exports.filterObj = filterObj;
