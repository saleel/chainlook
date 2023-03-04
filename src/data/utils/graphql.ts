type FieldType = {
  kind: string;
  name: string;
  ofType: FieldType;
};

type GraphQlSchema = {
  types: {
    name: string;
    fields: {
      name: string;
      type: FieldType;
    }[];
  }[];
};

type FieldDetails = {
  name: string;
  nameForFilter: string;
  type: string;
};

export function getQueriesAndFieldsFromGraphQlSchema(schema: GraphQlSchema) {
  // Get all queries
  const queries = schema.types.find((t) => t.name === 'Query')?.fields ?? [];

  // Only select queries that return an array, and don't start with _
  const cleanQueries = queries.filter(
    (q) => q.type.kind === 'NON_NULL' && q.type.ofType.kind === 'LIST' && !q.name.startsWith('_'),
  );

  // Create an object with the query name as the key, and fields as the value
  const queryEntities: Record<string, FieldDetails[]> = {};

  for (const query of cleanQueries) {
    let returnEntity = query.type;
    while (returnEntity.ofType) {
      returnEntity = returnEntity.ofType;
    }

    const returnEntityFields = schema.types.find((t) => t.name === returnEntity.name)?.fields ?? [];

    const fieldNameMap: FieldDetails[] = [];
    const fieldsToProcess = [...returnEntityFields] as {
      name: string;
      type: FieldType;
      _path?: string;
    }[];

    while (fieldsToProcess.length > 0) {
      const field = fieldsToProcess.shift();
      if (!field) continue;

      const keyName = [field._path, field.name].filter(Boolean).join('.');
      const nameForFilter = keyName.replace(/\./g, '__');

      let fieldType = field.type;
      if (fieldType.kind === 'NON_NULL') {
        fieldType = fieldType.ofType;
      }

      if (fieldType.kind === 'SCALAR') {
        fieldNameMap.push({
          name: keyName,
          nameForFilter,
          type: fieldType.name,
        });
      }

      // Only do three levels of nesting
      if (fieldType.kind === 'OBJECT' && keyName.split('.').length < 3) {
        const nestedFields = schema.types.find((t) => t.name === fieldType.name)?.fields || [];

        for (const nestedField of nestedFields) {
          fieldsToProcess.push({ ...nestedField, _path: keyName });
        }
      }
    }

    queryEntities[query.name] = fieldNameMap;
  }

  return queryEntities;
}
