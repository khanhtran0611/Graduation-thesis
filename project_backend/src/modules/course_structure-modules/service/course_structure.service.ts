import TreeNode from "../../../models/course_hierarchy";
import { treeNode, toTreeNode } from "../../../types/course_hierarchy";

export class ServiceError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class CourseStructureService {
  public async getCourseHierarchy(courseId: string) {
    const temp = await TreeNode.find({ course_id: courseId }).lean();
    const nodes: treeNode[] = temp.map(toTreeNode);
    return nodes;
  }

  public async addTreeNode(body: { parent_id?: string; name: string; course_id: string }) {
    const { parent_id, name, course_id } = body;

    const newNode = new TreeNode({
      parent_id,
      name,
      course_id,
      is_leaf_node: true,
    });

    const savedNode = await newNode.save();

    if (parent_id) {
      await TreeNode.findByIdAndUpdate(parent_id, { is_leaf_node: false });
    }

    return toTreeNode(savedNode.toObject());
  }

  public async updateTreeNode(body: { id: string; name: string }) {
    const { id, name } = body;

    if (!id) {
      throw new ServiceError(400, "Tree node ID is required");
    }

    if (!name) {
      throw new ServiceError(400, "Tree node name is required");
    }

    const updatedNode = await TreeNode.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedNode) {
      throw new ServiceError(404, "Tree node not found");
    }

    return toTreeNode(updatedNode.toObject());
  }

  public async deleteTreeNode(id: string) {
    if (!id) {
      throw new ServiceError(400, "Tree node ID is required");
    }

    const deletedNode = await TreeNode.findByIdAndDelete(id);

    if (!deletedNode) {
      throw new ServiceError(404, "Tree node not found");
    }

    if (deletedNode.parent_id) {
      const remainingSiblings = await TreeNode.countDocuments({
        parent_id: deletedNode.parent_id,
      });

      if (remainingSiblings === 0) {
        await TreeNode.findByIdAndUpdate(deletedNode.parent_id, {
          is_leaf_node: true,
        });
      }
    }

    return toTreeNode(deletedNode.toObject());
  }

  public async getTreeNodeById(id: string) {
    if (!id) {
      throw new ServiceError(400, "Tree node ID is required");
    }

    const node = await TreeNode.findById(id).lean();

    if (!node) {
      throw new ServiceError(404, "Tree node not found");
    }

    const children = await TreeNode.find({ parent_id: id }).lean();
    const childrenNodes: treeNode[] = children.map(toTreeNode);

    return {
      node: toTreeNode(node),
      children: childrenNodes,
    };
  }
}

const courseStructureService = new CourseStructureService();
export default courseStructureService;
