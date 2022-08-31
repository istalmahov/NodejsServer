export const getNestedArrayUpdate = <DocType>(
  arrayNames: string[],
  fieldsToUpdate: (keyof DocType)[],
  newValues: Partial<DocType> | DocType
) => {
  const path = arrayNames.join(".$.");

  if (!fieldsToUpdate.length) {
    return { [`${path}.$`]: newValues };
  }

  return fieldsToUpdate.reduce((update: Record<string, any>, prop) => {
    if (newValues[prop]) {
      update[`${path}.$.${prop}`] = newValues[prop];
    }

    return update;
  }, {});
};
