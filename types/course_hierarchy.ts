export type treeNode = {
  id: string;
  parent_id: string;
  name: string;
  is_leaf_node: boolean;
  course_id: string;
};

export const toTreeNode = (doc: any): treeNode => ({
  id: doc.id ?? doc._id?.toString(),
  parent_id: doc.parent_id,
  name: doc.name,
  is_leaf_node: doc.is_leaf_node,
  course_id: doc.course_id,
});
