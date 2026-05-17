export type Unit = {
  id: string;
  unit_name: string;
};

export const toUnit = (doc: any): Unit => ({
  id: doc.id ?? doc._id?.toString(),
  unit_name: doc.unit_name,
});
