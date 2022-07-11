import axios from 'axios'


export async function getGraphData({
  subGraphId, entity, fields, filters,
}) {
  let filtersQuery = '';
  if (filters) {
    filtersQuery = Object.keys(filters).map((k) => `${k}: ${filters[k]}`).join(', ');
    filtersQuery = `(${filtersQuery})`;
  }

  const query = `
    {
      ${entity} ${filtersQuery} {
        ${fields.join('\n')}
      }
    }
  `;

  // console.log({ query });

  const { data: response } = await axios({
    url: `https://api.thegraph.com/subgraphs/name/${subGraphId}`,
    method: 'POST',
    data: {
      query,
    },
  });

  return response.data?.[entity];
}