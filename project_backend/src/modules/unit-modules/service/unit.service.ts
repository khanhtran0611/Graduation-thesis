import { UnitDB } from "../../../models/unit.model";
import { toUnit } from "../../../types/unit";
import logService from "../../log-services/service/log.service";

export class ServiceError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class UnitService {
  public async createUnit(
    body: { unit_name?: string },
    actor?: { id?: string; name?: string; role?: string; unit_id?: string }
  ) {
    const { unit_name } = body;

    if (!unit_name) {
      throw new ServiceError(400, "unit_name is required");
    }

    const created = await UnitDB.create({ unit_name });
    const unit = toUnit(created.toObject());

    if (actor) {
      await logService.addLog(
        actor.id ?? "",
        actor.name ?? "",
        actor.role ?? "",
        `created an unit with id : ${unit.id}`,
        actor.unit_id
      );
    }

    return unit;
  }

  public async getAllUnits() {
    const docs = await UnitDB.find().lean();
    return docs.map(toUnit);
  }

  public async updateUnit(
    id: string,
    body: { unit_name?: string },
    actor?: { id?: string; name?: string; role?: string; unit_id?: string }
  ) {
    if (!id) {
      throw new ServiceError(400, "unit id is required");
    }

    const { unit_name } = body;
    if (!unit_name) {
      throw new ServiceError(400, "unit_name is required");
    }

    const unit = await UnitDB.findById(id);
    if (!unit) {
      throw new ServiceError(404, "Unit not found");
    }

    unit.unit_name = unit_name;
    const savedUnit = await unit.save();

    if (actor) {
      await logService.addLog(
        actor.id ?? "",
        actor.name ?? "",
        actor.role ?? "",
        `edited unit_name of ${id} into : ${unit_name}`,
        actor.unit_id
      );
    }

    return toUnit(savedUnit.toObject());
  }

  public async deleteUnit(id: string) {
    if (!id) {
      throw new ServiceError(400, "unit id is required");
    }

    const deleted = await UnitDB.findByIdAndDelete(id);
    if (!deleted) {
      throw new ServiceError(404, "Unit not found");
    }

    return { message: "Unit deleted successfully" };
  }

  public async getUnitName(id: string) {
    if (!id) {
      throw new ServiceError(400, "unit id is required");
    }

    const unit = await UnitDB.findById(id).lean();
    if (!unit) {
      throw new ServiceError(404, "Unit not found");
    }

    return { unit_name: unit.unit_name };
  }
}

const unitService = new UnitService();
export default unitService;
