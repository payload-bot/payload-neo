import type { UpdateQuery } from "mongoose";
import { Server, ServerModel } from "#lib/models//Server";

export default class GuildService {
  async getGuildById(id: string): Promise<ServerModel> {
    return await Server.findOne({ id }, {}, { upsert: true }) as ServerModel;
  }

  async findByGuildIdAndUpdate(id: string, details: UpdateQuery<ServerModel>) {
    return await Server.findOneAndUpdate({ id }, details, { new: true });
  }
}
