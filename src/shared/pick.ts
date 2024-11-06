const pick = <T extends Record<string, unknown>, k extends keyof T>(
  queryObj: T,
  acceptAbleFields: k[]
): Partial<T> => {
  const finalObj: Partial<T> = {};

  for (const field of acceptAbleFields) {
    if (queryObj && Object.hasOwnProperty.call(queryObj, field)) {
      finalObj[field] = queryObj[field];
    }
  }

  //   console.log(finalObj);
  return finalObj;
};

export default pick;
