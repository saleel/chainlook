export function getCleanEntitiesFromGraphQlSchema(schema: any) {
  const entities =
    schema?.types?.filter(
      (t: { kind: string; name: string }) =>
        t.kind === "OBJECT" &&
        t.name !== "Query" &&
        t.name !== "Mutation" &&
        t.name !== "Subscription" &&
        !t.name.startsWith("_")
    ) ?? [];

  return entities;
}

export function getQueriesFromGraphQlSchema(schema: any) {
  const queryFields =
    schema?.types?.find((t) => t.name === "Query").fields ?? [];

  const pluralQueries = queryFields.filter(
    (q) =>
      q.type.kind === "NON_NULL" &&
      q.type.ofType.kind === "LIST" &&
      !q.name.startsWith("_")
  );

  return pluralQueries;
}

export function getReturnEntityForQuery(schema: any, queryName: any) {
  const query = schema?.types?.find((t) => t.name === "Query").fields?.find(q => q.name === queryName);

  let returnEntity = query?.type;
  while (returnEntity?.ofType) {
    returnEntity = returnEntity?.ofType;
  }
  returnEntity = returnEntity?.name;

  const field = schema?.types?.find((t) => t.name === returnEntity);
  return field;
}
