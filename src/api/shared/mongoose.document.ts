import { Types } from "mongoose";
import { Exclude } from "class-transformer";

export abstract class MongooseDocument {
  @Exclude({ toPlainOnly: true })
  __v!: number;

  @Exclude({ toPlainOnly: true })
  _id!: Types.ObjectId;
}
