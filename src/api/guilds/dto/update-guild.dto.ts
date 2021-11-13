import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateGuildDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  botName!: string;
  
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  prefix!: string;

  @IsOptional()
  @IsBoolean()
  enableSnipeForEveryone!: boolean;
}
