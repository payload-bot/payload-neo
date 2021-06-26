import { Server, ServerModel } from "../../lib/model/Server";

export default class GuildService {
    constructor() {}

    async getGuildById(id: string): Promise<ServerModel> {
        return await Server.findOne({ id });
    }

    async findByGuildIdAndUpdate(id: string, details: Partial<ServerModel>) {
        return await Server.findOneAndUpdate({ id }, details, { new: true });
    }
}
