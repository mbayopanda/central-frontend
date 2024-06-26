import { comparator } from 'ramda';

import { dataStore } from './data-store';
import { extendedProjects } from './projects';

const normalizeProperty = (property) => ({
  odataName: property.name,
  forms: [],
  ...property
});

// eslint-disable-next-line import/prefer-default-export
export const extendedDatasets = dataStore({
  factory: ({
    id,

    project = extendedProjects.size !== 0
      ? extendedProjects.first()
      : extendedProjects.createPast(1, { datasets: 1 }).last(),
    name = 'trees',
    entities = 0,
    lastEntity = null,
    properties = [],
    linkedForms = [],
    approvalRequired = false,
    sourceForms = [],
    conflicts = 0
  }) => ({
    id,
    projectId: project.id,
    name,
    entities,
    lastEntity,
    properties: properties.map(normalizeProperty),
    linkedForms,
    approvalRequired,
    sourceForms,
    conflicts
  }),
  sort: comparator((dataset1, dataset2) => dataset1.name < dataset2.name)
});

extendedDatasets.addProperty = (index, property) => {
  const properties = [...extendedDatasets.get(index).properties, normalizeProperty({ name: property })];
  extendedDatasets.update(index, { properties });
  return extendedDatasets.get(index);
};
