import { Request, Response } from "express";
import { treeNode, toTreeNode } from "../types/course_hierarchy";
import TreeNode from "../models/course_hierarchy";

class CourseHierarchyController {
  async getCourseHierarchy(req: Request, res: Response) {
    try {
      const courseId = req.params.courseId;
      const temp = await TreeNode.find({ course_id: courseId }).lean();
      const nodes: treeNode[] = temp.map(toTreeNode);
      return res.status(200).json({ data: nodes });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async addTreeNode(req: Request, res: Response) {
    try {
      const { parent_id, name, course_id } = req.body;

      // Create new tree node
      const newNode = new TreeNode({
        parent_id,
        name,
        course_id,
        is_leaf_node: true,
      });

      const savedNode = await newNode.save();

      // Update parent node to set is_leaf_node = false
      if (parent_id) {
        await TreeNode.findByIdAndUpdate(parent_id, { is_leaf_node: false });
      }

      return res.status(201).json({
        message: "Tree node created successfully",
        data: toTreeNode(savedNode.toObject()),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async updateTreeNode(req: Request, res: Response) {
    try {
      const { id, name } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Tree node ID is required" });
      }

      if (!name) {
        return res.status(400).json({ message: "Tree node name is required" });
      }

      const updatedNode = await TreeNode.findByIdAndUpdate(id, { name }, { new: true });

      if (!updatedNode) {
        return res.status(404).json({ message: "Tree node not found" });
      }

      return res.status(200).json({
        message: "Tree node updated successfully",
        data: toTreeNode(updatedNode.toObject()),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async deleteTreeNode(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Tree node ID is required" });
      }

      const deletedNode = await TreeNode.findByIdAndDelete(id);

      if (!deletedNode) {
        return res.status(404).json({ message: "Tree node not found" });
      }

      // Check if parent has any remaining children
      if (deletedNode.parent_id) {
        const remainingSiblings = await TreeNode.countDocuments({
          parent_id: deletedNode.parent_id,
        });

        // If no children remain, update parent to be a leaf node
        if (remainingSiblings === 0) {
          await TreeNode.findByIdAndUpdate(deletedNode.parent_id, {
            is_leaf_node: true,
          });
        }
      }

      return res.status(200).json({
        message: "Tree node deleted successfully",
        data: toTreeNode(deletedNode.toObject()),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // new method to fetch a single node by id
  async getTreeNodeById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Tree node ID is required" });
      }

      const node = await TreeNode.findById(id).lean();

      if (!node) {
        return res.status(404).json({ message: "Tree node not found" });
      }

      // Fetch children nodes where parent_id equals this node's id
      const children = await TreeNode.find({ parent_id: id }).lean();
      const childrenNodes: treeNode[] = children.map(toTreeNode);

      return res.status(200).json({
        message: "Tree node retrieved successfully",
        data: {
          node: toTreeNode(node),
          children: childrenNodes,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export const courseHierarchyController = new CourseHierarchyController();
