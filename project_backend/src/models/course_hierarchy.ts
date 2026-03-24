import mongoose, { Schema, Document } from "mongoose";

export interface treeNodeDocument extends Document {
  id: string;
  name: string;
  parent_id: string;
  is_leaf_node: boolean;
  course_id: string;
}

const treeNodeSchema = new Schema<treeNodeDocument>({
  name: { type: String, required: true },
  parent_id: { type: String, required: true },
  is_leaf_node: { type: Boolean, required: true },
  course_id: { type: String, required: true },
});

const TreeNode = mongoose.model<treeNodeDocument>(
  "CourseHierarchy",
  treeNodeSchema,
  "course hierarchy"
);

export default TreeNode;
